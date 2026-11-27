import { useTranslation } from "react-i18next";
import { persistLocale, type AppLocale } from "./index";
import "./LanguageSwitcher.css";

type Props = {
  className?: string;
  compact?: boolean;
};

export function LanguageSwitcher({ className = "", compact = false }: Props) {
  const { i18n, t } = useTranslation("common");
  const active = (i18n.resolvedLanguage || i18n.language || "en").split("-")[0] as AppLocale;

  const setLocale = (locale: AppLocale) => {
    void i18n.changeLanguage(locale);
    persistLocale(locale);
  };

  return (
    <div
      className={`lang-switch ${compact ? "is-compact" : ""} ${className}`.trim()}
      role="group"
      aria-label={t("a11y.languageSwitcher")}
      data-testid="language-switcher"
    >
      <button
        type="button"
        className={`lang-switch-btn ${active === "en" ? "is-active" : ""}`}
        aria-pressed={active === "en"}
        data-testid="lang-en"
        onClick={() => setLocale("en")}
      >
        EN
      </button>
      <span className="lang-switch-sep" aria-hidden="true">
        /
      </span>
      <button
        type="button"
        className={`lang-switch-btn ${active === "fr" ? "is-active" : ""}`}
        aria-pressed={active === "fr"}
        data-testid="lang-fr"
        onClick={() => setLocale("fr")}
      >
        FR
      </button>
    </div>
  );
}
