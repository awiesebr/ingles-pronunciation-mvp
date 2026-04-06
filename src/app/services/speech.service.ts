import { Injectable } from '@angular/core';

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionResult {
  0: SpeechRecognitionAlternative;
}

interface SpeechRecognitionEvent {
  results: Array<SpeechRecognitionResult>;
}

interface BrowserSpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

interface BrowserWindow extends Window {
  SpeechRecognition?: new () => BrowserSpeechRecognition;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
}

export interface ListenAndRecordResult {
  transcript: string;
  audioBlob: Blob;
}

@Injectable({
  providedIn: 'root'
})
export class SpeechService {
  private recognition: BrowserSpeechRecognition | null = null;

  get supportsSpeechRecognition(): boolean {
    return !!this.getSpeechRecognitionConstructor();
  }

  get supportsSpeechSynthesis(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  speak(text: string, lang = 'en-US', rate = 0.95): void {
    if (!this.supportsSpeechSynthesis) {
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = 1;

    window.speechSynthesis.speak(utterance);
  }

  listen(lang = 'en-US'): Promise<string> {
    return new Promise((resolve, reject) => {
      const RecognitionCtor = this.getSpeechRecognitionConstructor();

      if (!RecognitionCtor) {
        reject(new Error('Speech recognition is not supported in this browser.'));
        return;
      }

      const recognition = new RecognitionCtor();
      recognition.lang = lang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      this.recognition = recognition;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = () => {
        reject(new Error('Could not recognize speech. Please try again.'));
      };

      recognition.onend = () => {
        this.recognition = null;
      };

      recognition.start();
    });
  }

  listenAndRecord(lang = 'en-US'): Promise<ListenAndRecordResult> {
    return new Promise(async (resolve, reject) => {
      const RecognitionCtor = this.getSpeechRecognitionConstructor();

      if (!RecognitionCtor) {
        reject(new Error('Speech recognition is not supported in this browser.'));
        return;
      }

      if (typeof MediaRecorder === 'undefined') {
        reject(new Error('Voice recording is not supported in this browser.'));
        return;
      }

      let stream: MediaStream;

      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        reject(new Error('Microphone access denied. Please allow microphone permission.'));
        return;
      }

      const recognition = new RecognitionCtor();
      recognition.lang = lang;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(stream);
      let transcript = '';
      let finished = false;

      this.recognition = recognition;

      const cleanup = () => {
        this.recognition = null;
        stream.getTracks().forEach((track) => track.stop());
      };

      const fail = (error: Error) => {
        if (finished) {
          return;
        }

        finished = true;
        cleanup();
        reject(error);
      };

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onerror = () => {
        fail(new Error('Could not record audio. Please try again.'));
      };

      recorder.onstop = () => {
        if (finished) {
          return;
        }

        finished = true;
        const audioBlob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        cleanup();
        resolve({ transcript, audioBlob });
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        transcript = event.results[0][0].transcript;
        recognition.stop();
      };

      recognition.onerror = () => {
        fail(new Error('Could not recognize speech. Please try again.'));
      };

      recognition.onend = () => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      };

      recorder.start();
      recognition.start();
    });
  }

  stopListening(): void {
    this.recognition?.stop();
  }

  private getSpeechRecognitionConstructor():
    | (new () => BrowserSpeechRecognition)
    | undefined {
    const browserWindow = window as BrowserWindow;
    return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
  }
}
