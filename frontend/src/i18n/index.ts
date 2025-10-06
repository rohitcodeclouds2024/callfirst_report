import i18next from "i18next";
import en from "./en.json";

if (typeof window !== "undefined" && !globalThis.message) {
  // Synchronously initialize i18n
  i18next.init({
    lng: "en",
    fallbackLng: "en",
    resources: { en: { translation: en } },
  });

  // Attach globally
  globalThis.message = (key: string) => i18next.t(key);
}

declare global {
  var message: (key: string) => string;
}
