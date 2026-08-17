/**
 * Audio Service for Hospital Chime & Queue Voice Announcement
 */
export class AudioService {
  private static audioCtx: AudioContext | null = null;

  // Play realistic hospital ding-dong / chime sound using Web Audio API
  static async playChime(): Promise<void> {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      
      // Tone 1: C5 (523.25 Hz)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.3, now + 0.05);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.6);

      // Tone 2: E5 (659.25 Hz)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.2);
      gain2.gain.setValueAtTime(0, now + 0.2);
      gain2.gain.linearRampToValueAtTime(0.35, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.2);
      osc2.stop(now + 0.9);

      // Tone 3: G5 (783.99 Hz)
      const osc3 = this.audioCtx.createOscillator();
      const gain3 = this.audioCtx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(783.99, now + 0.45);
      gain3.gain.setValueAtTime(0, now + 0.45);
      gain3.gain.linearRampToValueAtTime(0.4, now + 0.5);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);
      osc3.connect(gain3);
      gain3.connect(this.audioCtx.destination);
      osc3.start(now + 0.45);
      osc3.stop(now + 1.4);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // Announce Queue Call in Uzbek
  static announceQueueCall(ticketNumber: string, roomNumber: string, doctorName: string): void {
    // First play melodic chime
    this.playChime();

    if (!('speechSynthesis' in window)) return;

    setTimeout(() => {
      try {
        window.speechSynthesis.cancel(); // Stop any pending speech

        // Formulate clear announcement
        const message = `Diqqat! ${ticketNumber} raqamli bemor, ${roomNumber}-xonaga, ${doctorName} qabuliga marhamat!`;
        const utterance = new SpeechSynthesisUtterance(message);
        
        // Find best voice: uz, tr or ru or default
        const voices = window.speechSynthesis.getVoices();
        const uzVoice = voices.find(v => v.lang.startsWith('uz') || v.lang.startsWith('tr') || v.lang.startsWith('ru'));
        if (uzVoice) {
          utterance.voice = uzVoice;
        }

        utterance.rate = 0.92;
        utterance.pitch = 1.05;
        utterance.volume = 1;

        window.speechSynthesis.speak(utterance);
      } catch {
        // Speech synthesis gracefully handled
      }
    }, 600);
  }
}
