// Showcases: $fetch against real server API routes (CRUD)
/**
 * Showcases: E2E testing of Nitro server API routes with @nuxt/test-utils.
 *
 * These tests boot a real Nuxt server via setup() and exercise every API
 * endpoint using $fetch and fetch — no mocks, no stubs, real SQLite database.
 *
 * $fetch(url, options) — parses the JSON response body and throws on non-2xx.
 *   Use this when you only care about the response payload.
 *
 * fetch(url, options) — the underlying fetch function pre-configured with the
 *   test server's base URL. Returns a standard Response object so you can
 *   assert on status codes (e.g. 201, 204) alongside the body.
 *
 * Error responses from $fetch reject with a FetchError that carries a .status
 * property, so .catch(e => e) lets you assert on 404 / 400 responses inline.
 *
 * Routes under test (see server/api/):
 *   GET    /api/todos          — list all todos
 *   POST   /api/todos          — create a todo (responds with 201)
 *   GET    /api/todos/:id      — get one todo (404 if missing)
 *   PATCH  /api/todos/:id      — toggle checked on one todo
 *   DELETE /api/todos/:id      — delete one todo (responds with 204)
 *   PATCH  /api/todos          — set all todos to checked/unchecked
 *   DELETE /api/todos          — clear all checked todos
 */
import { $fetch, fetch, setup } from '@nuxt/test-utils/e2e'
import type { FetchError } from 'ofetch'
import { describe, expect, test } from 'vitest'

interface Todo {
  id: number
  label: string
  date: string
  checked: boolean
}

describe('server API routes', async () => {
  await setup()

  test('GET /api/todos returns an array', async () => {
    const todos = await $fetch<Todo[]>('/api/todos')
    expect(Array.isArray(todos)).toBe(true)
  })

  test('POST /api/todos creates a todo and returns status 201', async () => {
    // fetch() returns a standard Response so we can assert on the status code
    // alongside the parsed body — something $fetch alone doesn't expose.
    const response = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'T11 test todo' }),
    })
    const todo: Todo = await response.json()
    expect(response.status).toBe(201)
    expect(todo.label).toBe('T11 test todo')
    expect(todo.checked).toBe(false)
    const todos = await $fetch<Todo[]>('/api/todos')
    expect(todos.length).toBe(1);
  })
  
  test('GET /api/todos/:id returns the todo by id', async () => {
    const created = await $fetch<Todo>('/api/todos', {
      method: 'POST',
      body: { label: 'Fetch by id' },
    })
    const todo = await $fetch<Todo>(`/api/todos/${created.id}`)
    expect(todo.id).toBe(created.id)
    expect(todo.label).toBe('Fetch by id')
  })
  
  test('GET /api/todos/:id returns 404 for an unknown id', async () => {
    // $fetch throws on non-2xx — .catch(e => e) captures the FetchError so
    // we can assert on its .status without wrapping the test in try/catch.
    const error = await $fetch<never>('/api/todos/0').catch((e: FetchError) => e)
    expect(error.status).toBe(404)
  })
  
  test('PATCH /api/todos/:id updates the checked state', async () => {
    const created = await $fetch<Todo>('/api/todos', {
      method: 'POST',
      body: { label: 'Toggle me' },
    })
    const updated = await $fetch<Todo>(`/api/todos/${created.id}`, {
      method: 'PATCH',
      body: { checked: true },
    })
    expect(updated.checked).toBe(true)
    const todos = await $fetch<Todo[]>('/api/todos')
    expect(todos.length).toBe(3);
  })
  
  test('DELETE /api/todos/:id removes a todo and returns status 204', async () => {
    const created = await $fetch<Todo>('/api/todos', {
      method: 'POST',
      body: { label: 'Delete me' },
    })
    let todos = await $fetch<Todo[]>('/api/todos')
    expect(todos.length).toBe(4);

    const response = await fetch(`/api/todos/${created.id}`, { method: 'DELETE' })
    expect(response.status).toBe(204)
    todos = await $fetch<Todo[]>('/api/todos')
    expect(todos.length).toBe(3);

    // A subsequent GET should confirm the todo is gone.
    const error = await $fetch<never>(`/api/todos/${created.id}`).catch((e: FetchError) => e)
    expect(error.status).toBe(404)
  })

  test('PATCH /api/todos sets all todos to the given checked state', async () => {
    // Ensure there is at least one todo in the database before toggling.
    await $fetch('/api/todos', {
      method: 'POST',
      body: { label: 'Bulk toggle target' },
    })

    const todos = await $fetch<Todo[]>('/api/todos', {
      method: 'PATCH',
      body: { checked: true },
    })
    expect(Array.isArray(todos)).toBe(true)
    expect(todos.every((t) => t.checked === true)).toBe(true)
  })

  test('DELETE /api/todos clears all checked todos and returns the deleted count', async () => {
    const result = await $fetch<{ deleted: number }>('/api/todos', { method: 'DELETE' })
    expect(result).toHaveProperty('deleted')
    expect(typeof result.deleted).toBe('number')
  })
})
