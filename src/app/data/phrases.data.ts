export type PhraseCategory = 'Airport' | 'Restaurant' | 'Hotel' | 'Shopping' | 'Theme parks';

export interface PhraseItem {
  category: PhraseCategory;
  phrase: string;
}

export const PHRASES_BY_CATEGORY: Record<PhraseCategory, string[]> = {
  Airport: [
    'My passport, please.',
    'Where is gate?',
    'Boarding now.',
    'My ticket here.',
    'Flight delayed.'
  ],
  Restaurant: [
    'Table for two.',
    'Menu, please.',
    'Water, please.',
    'I want food.',
    'Bill, please.'
  ],
  Hotel: [
    'I have booking.',
    'Room key, please.',
    'Need clean towel.',
    'Wi-Fi password?',
    'Check-out time?'
  ],
  Shopping: [
    'How much?',
    'Bigger size?',
    'Can I try?',
    'Card accepted?',
    'Just looking.'
  ],
  'Theme parks': [
    'Where entrance?',
    'Long line?',
    'Fast pass here?',
    'Ride for kids?',
    'Parade time?'
  ]
};

export const ALL_CATEGORIES = Object.keys(PHRASES_BY_CATEGORY) as PhraseCategory[];

export function getPhraseItemsByCategory(category: PhraseCategory): PhraseItem[] {
  return PHRASES_BY_CATEGORY[category].map((phrase) => ({ category, phrase }));
}
