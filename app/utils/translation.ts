export default {
  getPreferedLang: (): string => {
    if (typeof navigator !== "undefined" && navigator.language) {
      return navigator.language.startsWith("en") ? "en" : "de";
    }
    return "en";
  },
  todoInput: {
    placeholder: {
      en: "What needs to be done?",
      de: "Was muss getan werden?",
    },
  },
};
