import Database from "better-sqlite3";
import { join } from "path";

export interface TodoRow {
  id: number;
  label: string;
  date: string;
  checked: number; // SQLite stores booleans as 0/1
}

export interface Todo {
  id: number;
  label: string;
  date: string;
  checked: boolean;
}

const dbPath = join(process.cwd(), "db.sqlite3");
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// Create the table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id    INTEGER PRIMARY KEY,
    label TEXT    NOT NULL,
    date  TEXT    NOT NULL,
    checked INTEGER NOT NULL DEFAULT 0
  )
`);

// --- Prepared statements ---

const selectAll = db.prepare("SELECT * FROM todos ORDER BY id");
const selectById = db.prepare("SELECT * FROM todos WHERE id = ?");
const insertOne = db.prepare(
  "INSERT INTO todos (id, label, date, checked) VALUES (@id, @label, @date, @checked)",
);
const updateChecked = db.prepare(
  "UPDATE todos SET checked = @checked WHERE id = @id",
);
const deleteById = db.prepare("DELETE FROM todos WHERE id = ?");
const deleteChecked = db.prepare("DELETE FROM todos WHERE checked = 1");
const updateAllChecked = db.prepare("UPDATE todos SET checked = @checked");

// --- Helpers to convert between SQLite rows and API objects ---

function rowToTodo(row: TodoRow): Todo {
  return { ...row, checked: row.checked === 1 };
}

// --- Public API ---

export function getAllTodos(): Todo[] {
  return (selectAll.all() as TodoRow[]).map(rowToTodo);
}

export function getTodoById(id: number): Todo | undefined {
  const row = selectById.get(id) as TodoRow | undefined;
  return row ? rowToTodo(row) : undefined;
}

export function createTodo(todo: Todo): Todo {
  insertOne.run({
    id: todo.id,
    label: todo.label,
    date: todo.date,
    checked: todo.checked ? 1 : 0,
  });
  return todo;
}

export function toggleTodo(id: number, checked: boolean): Todo | undefined {
  updateChecked.run({ id, checked: checked ? 1 : 0 });
  return getTodoById(id);
}

export function deleteTodo(id: number): boolean {
  const result = deleteById.run(id);
  return result.changes > 0;
}

export function clearCheckedTodos(): number {
  const result = deleteChecked.run();
  return result.changes;
}

export function setAllChecked(checked: boolean): Todo[] {
  updateAllChecked.run({ checked: checked ? 1 : 0 });
  return getAllTodos();
}
