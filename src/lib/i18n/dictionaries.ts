import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import nl from './locales/nl.json';
import pt from './locales/pt.json';

const dictionaries = {
  en,
  es,
  fr,
  de,
  nl,
  pt
};

export type Locale = keyof typeof dictionaries;
// Use English as the base type for TypeScript autocompletion
export type Dictionary = typeof en;

export function getDictionary(locale: string = 'en'): Dictionary {
  // Default to english if locale is invalid
  const validLocale = (Object.keys(dictionaries).includes(locale) ? locale : 'en') as Locale;
  return dictionaries[validLocale];
}
