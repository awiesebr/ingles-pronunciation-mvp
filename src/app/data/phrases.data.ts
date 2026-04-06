export type PhraseCategory = 'Airport' | 'Restaurant' | 'Hotel' | 'Shopping' | 'Theme parks';

export interface PhraseItem {
  category: PhraseCategory;
  phrase: string;
}

export const PHRASES_BY_CATEGORY: Record<PhraseCategory, string[]> = {
  Airport: [
    'Where is the check-in desk?',
    'I have one carry-on bag.',
    'Can I have a window seat?',
    'What time does boarding start?',
    'Where is gate B twelve?'
  ],
  Restaurant: [
    'A table for two, please.',
    'Could I see the menu?',
    'I would like grilled chicken.',
    'Can I have the bill, please?',
    'Do you have vegetarian options?'
  ],
  Hotel: [
    'I have a reservation under my name.',
    'What time is check-out?',
    'Can I get the Wi-Fi password?',
    'I need an extra towel, please.',
    'Is breakfast included?'
  ],
  Shopping: [
    'How much does this cost?',
    'Do you have this in a larger size?',
    'Can I try this on?',
    'Do you accept credit cards?',
    'I am just looking, thank you.'
  ],
  'Theme parks': [
    'Where is the entrance to this ride?',
    'How long is the wait time?',
    'Is this ride suitable for children?',
    'Where can I buy fast passes?',
    'What time is the parade today?'
  ]
};

export const ALL_CATEGORIES = Object.keys(PHRASES_BY_CATEGORY) as PhraseCategory[];

export function getPhraseItemsByCategory(category: PhraseCategory): PhraseItem[] {
  return PHRASES_BY_CATEGORY[category].map((phrase) => ({ category, phrase }));
}
