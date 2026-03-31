import { DIALOG_TYPEWRITER_SPEED, COLORS } from '../constants.js';

const CHAR_BLIP_CHARS = 'abcdefghijklmnopqrstuvwxyz';

export default class DialogSystem {
  constructor(scene) {
    this.scene = scene;
    this.queue = [];
    this.current = null;
    this.typedText = '';
    this.fullText = '';
    this.typeIndex = 0;
    this.finished = false;
    this.onComplete = null;
    this.active = false;
    this.blipTimers = {};
  }

  enqueue(dialogs) {
    for (const d of dialogs) this.queue.push(d);
  }

  start(dialogs, onComplete) {
    this.queue = [...dialogs];
    this.onComplete = onComplete;
    this.active = true;
    this.showNext();
  }

  showNext() {
    if (this.queue.length === 0) {
      this.active = false;
      if (this.onComplete) this.onComplete();
      return;
    }
    this.current = this.queue.shift();
    this.fullText = this.current.text || '';
    this.typedText = '';
    this.typeIndex = 0;
    this.finished = false;
    this.startTypewriter();
  }

  startTypewriter() {
    if (this._typeTimer) this._typeTimer.remove();
    this._typeTimer = this.scene.time.addEvent({
      delay: DIALOG_TYPEWRITER_SPEED,
      repeat: this.fullText.length - 1,
      callback: () => {
        const ch = this.fullText[this.typeIndex];
        this.typedText += ch;
        this.typeIndex++;
        if (CHAR_BLIP_CHARS.includes(ch.toLowerCase())) {
          this.playBlip(this.current.speaker);
        }
        if (this.scene.updateDialogText) this.scene.updateDialogText(this.typedText, this.current);
        if (this.typeIndex >= this.fullText.length) {
          this.finished = true;
        }
      },
    });
  }

  playBlip(speaker) {
    const keyMap = { caio: 'blip_caio', rael: 'blip_rael', sura: 'blip_sura', dren: 'blip_dren' };
    const key = keyMap[speaker?.toLowerCase()] || 'blip_caio';
    if (this.scene.sound && this.scene.sound.get(key)) {
      try { this.scene.sound.play(key, { volume: 0.3 }); } catch(e) {}
    }
  }

  skip() {
    if (!this.finished) {
      if (this._typeTimer) this._typeTimer.remove();
      this.typedText = this.fullText;
      this.typeIndex = this.fullText.length;
      this.finished = true;
      if (this.scene.updateDialogText) this.scene.updateDialogText(this.typedText, this.current);
    } else {
      this.showNext();
    }
  }

  isActive() {
    return this.active;
  }
}
