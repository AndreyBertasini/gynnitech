export type TranslationTally = {
  translatedChars: number;
  untranslatedChars: number;
  titleTranslated: boolean;
  descriptionTranslated: boolean;
};

export const MIN_TRANSLATED_SHARE = 0.9;

export const emptyTally = (): TranslationTally => ({
  translatedChars: 0,
  untranslatedChars: 0,
  titleTranslated: false,
  descriptionTranslated: false,
});

/**
 * Una pagina /en/ è pubblicabile come inglese solo se titolo e description sono tradotti
 * e almeno il 90% del testo lo è. Altrimenti sarebbe un duplicato italiano con lang="en".
 */
export function isPageTranslated(tally: TranslationTally): boolean {
  const total = tally.translatedChars + tally.untranslatedChars;
  if (total === 0) return false;
  return tally.titleTranslated && tally.descriptionTranslated && tally.translatedChars / total >= MIN_TRANSLATED_SHARE;
}
