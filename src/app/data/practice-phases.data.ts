import { PHRASES_BY_CATEGORY } from './phrases.data';
import { RESPONSES_BY_CATEGORY } from './responses.data';
import { TRAVEL_PHRASES_BY_CATEGORY } from './travel-phrases.data';
import { getWordMeaningPt, WORDS_BY_CATEGORY } from './words.data';

export type PhaseId = 'phase1' | 'phase2' | 'phase3' | 'phase4';

export interface PhaseDefinition {
  id: PhaseId;
  title: string;
  subtitle: string;
  itemLabel: string;
  nextButtonLabel: string;
  categories: Record<string, string[]>;
  getMeaningPt?: (item: string, category: string) => string;
}

export const PRACTICE_PHASES: PhaseDefinition[] = [
  {
    id: 'phase1',
    title: 'Phase 1 - Single Words',
    subtitle: 'Start simple: one word at a time.',
    itemLabel: 'Expected word',
    nextButtonLabel: 'Next word',
    categories: WORDS_BY_CATEGORY,
    getMeaningPt: (item, category) => getWordMeaningPt(item, category)
  },
  {
    id: 'phase2',
    title: 'Phase 2 - Simple Phrases',
    subtitle: 'Very short phrases for beginners.',
    itemLabel: 'Expected phrase',
    nextButtonLabel: 'Next phrase',
    categories: PHRASES_BY_CATEGORY
  },
  {
    id: 'phase3',
    title: 'Phase 3 - Ready Answers',
    subtitle: 'Practice practical responses you can use in real situations.',
    itemLabel: 'Expected response',
    nextButtonLabel: 'Next response',
    categories: RESPONSES_BY_CATEGORY
  },
  {
    id: 'phase4',
    title: 'Phase 4 - Travel Phrases',
    subtitle: 'Longer and more complete travel phrases.',
    itemLabel: 'Expected phrase',
    nextButtonLabel: 'Next phrase',
    categories: TRAVEL_PHRASES_BY_CATEGORY
  }
];

export const PHASES_BY_ID: Record<PhaseId, PhaseDefinition> = {
  phase1: PRACTICE_PHASES[0],
  phase2: PRACTICE_PHASES[1],
  phase3: PRACTICE_PHASES[2],
  phase4: PRACTICE_PHASES[3]
};
