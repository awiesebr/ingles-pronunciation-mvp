import { CommonModule } from '@angular/common';
import { Component, computed, OnDestroy, signal } from '@angular/core';
import {
  PHASES_BY_ID,
  PRACTICE_PHASES,
  PhaseId
} from '../data/practice-phases.data';
import { SpeechService } from '../services/speech.service';
import { getSimilarityScore } from '../utils/similarity.util';

type FeedbackType = 'Great!' | 'Almost!' | 'Try again';

@Component({
  selector: 'app-practice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './practice.component.html',
  styleUrl: './practice.component.css'
})
export class PracticeComponent implements OnDestroy {
  readonly phases = PRACTICE_PHASES;

  readonly selectedPhase = signal<PhaseId>('phase1');
  readonly selectedCategory = signal('Airport');
  readonly currentIndex = signal(0);
  readonly recognizedText = signal('');
  readonly feedback = signal<FeedbackType | ''>('');
  readonly score = signal<number | null>(null);
  readonly isListening = signal(false);
  readonly isWorking = signal(false);
  readonly errorMessage = signal('');
  readonly myVoiceUrl = signal('');
  readonly ttsRate = signal(0.95);
  readonly autoPlayNextWord = signal(true);

  readonly activePhase = computed(() => PHASES_BY_ID[this.selectedPhase()]);

  readonly categories = computed(() => Object.keys(this.activePhase().categories));

  readonly currentItem = computed(() => {
    const category = this.selectedCategory();
    const items = this.activePhase().categories[category] ?? [];

    if (items.length === 0) {
      return '';
    }

    return items[this.currentIndex() % items.length];
  });

  readonly currentMeaningPt = computed(() =>
    this.activePhase().getMeaningPt?.(this.currentItem(), this.selectedCategory()) ?? ''
  );

  constructor(private readonly speechService: SpeechService) {}

  ngOnDestroy(): void {
    this.releaseAudioUrl();
  }

  changePhase(phaseId: PhaseId): void {
    this.selectedPhase.set(phaseId);

    const firstCategory = Object.keys(this.activePhase().categories)[0] ?? '';
    this.selectedCategory.set(firstCategory);
    this.currentIndex.set(0);
    this.resetResult();
  }

  changeCategory(category: string): void {
    this.selectedCategory.set(category);
    this.currentIndex.set(0);
    this.resetResult();
  }

  nextWord(): void {
    const items = this.activePhase().categories[this.selectedCategory()] ?? [];

    if (items.length === 0) {
      return;
    }

    const next = (this.currentIndex() + 1) % items.length;
    this.currentIndex.set(next);
    this.resetResult();

    if (this.autoPlayNextWord()) {
      this.playAudio();
    }
  }

  playAudio(): void {
    this.speechService.speak(this.currentItem(), 'en-US', this.ttsRate());
  }

  setTtsRate(value: string): void {
    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
      return;
    }

    this.ttsRate.set(parsed);
  }

  setAutoPlayNextWord(value: boolean): void {
    this.autoPlayNextWord.set(value);
  }

  async speakNow(): Promise<void> {
    this.errorMessage.set('');

    if (!this.speechService.supportsSpeechRecognition) {
      this.errorMessage.set('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    this.isListening.set(true);
    this.isWorking.set(true);

    try {
      const result = await this.speechService.listenAndRecord('en-US');
      const spoken = result.transcript;

      this.recognizedText.set(spoken);
      this.setMyVoiceUrl(result.audioBlob);

      const resultScore = getSimilarityScore(this.currentItem(), spoken);
      this.score.set(resultScore);
      this.feedback.set(this.getFeedback(resultScore));
    } catch (error) {
      this.errorMessage.set((error as Error).message);
    } finally {
      this.isListening.set(false);
      this.isWorking.set(false);
    }
  }

  private getFeedback(score: number): FeedbackType {
    if (score > 85) {
      return 'Great!';
    }

    if (score >= 60) {
      return 'Almost!';
    }

    return 'Try again';
  }

  private resetResult(): void {
    this.recognizedText.set('');
    this.feedback.set('');
    this.score.set(null);
    this.errorMessage.set('');
    this.releaseAudioUrl();
  }

  playMyVoice(): void {
    const url = this.myVoiceUrl();

    if (!url) {
      return;
    }

    const audio = new Audio(url);
    audio.play().catch(() => {
      this.errorMessage.set('Could not play your recording. Please record again.');
    });
  }

  private setMyVoiceUrl(blob: Blob): void {
    this.releaseAudioUrl();

    if (blob.size > 0) {
      this.myVoiceUrl.set(URL.createObjectURL(blob));
    }
  }

  private releaseAudioUrl(): void {
    const url = this.myVoiceUrl();

    if (url) {
      URL.revokeObjectURL(url);
      this.myVoiceUrl.set('');
    }
  }
}
