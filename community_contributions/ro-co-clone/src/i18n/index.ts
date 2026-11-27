import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { isAppLocale, LOCALE_STORAGE_KEY, type AppLocale } from "./carePaths";

import enCommon from "./locales/en/common.json";
import enNav from "./locales/en/nav.json";
import enFooter from "./locales/en/footer.json";
import enAccount from "./locales/en/account.json";
import enClinical from "./locales/en/clinical.json";

import frCommon from "./locales/fr/common.json";
import frNav from "./locales/fr/nav.json";
import frFooter from "./locales/fr/footer.json";
import frAccount from "./locales/fr/account.json";
import frClinical from "./locales/fr/clinical.json";

export const I18N_NAMESPACES = ["common", "nav", "footer", "account", "clinical"] as const;

function readStoredLocale(): AppLocale {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && isAppLocale(stored)) return stored;
  } catch {
    /* ignore */
  }
  return "en";
}

export function persistLocale(locale: AppLocale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
  document.documentElement.lang = locale;
}

export function syncDocumentLang(locale: string = i18n.language) {
  const lang = locale?.split("-")[0] || "en";
  document.documentElement.lang = isAppLocale(lang) ? lang : "en";
}

const initialLocale = readStoredLocale();

void i18n.use(initReactI18next).init({
  resources: {
    en: {
      common: enCommon,
      nav: enNav,
      footer: enFooter,
      account: enAccount,
      clinical: enClinical,
    },
    fr: {
      common: frCommon,
      nav: frNav,
      footer: frFooter,
      account: frAccount,
      clinical: frClinical,
    },
  },
  lng: initialLocale,
  fallbackLng: "en",
  defaultNS: "common",
  ns: [...I18N_NAMESPACES],
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
});

if (typeof document !== "undefined") {
  syncDocumentLang(initialLocale);
  i18n.on("languageChanged", (lng) => {
    syncDocumentLang(lng);
  });
}

export default i18n;
export { LOCALE_STORAGE_KEY, isAppLocale };
export type { AppLocale };
