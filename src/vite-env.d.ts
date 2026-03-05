/// <reference types="vite/client" />

declare module 'virtual:uno.css' {
  const css: string;
  export default css;
}

declare module 'virtual:i18n-locales' {
  export function loadSharedLocale(locale: string): Promise<Record<string, unknown>>;
}

declare module 'virtual:svg-icons-register';
