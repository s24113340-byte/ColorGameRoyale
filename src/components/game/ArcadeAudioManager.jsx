import { useEffect, useRef } from 'react';

class ArcadeSoundEngine {
  constructor() {
    this.audioContext = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.masterGain = null;
    this.musicOn = true;
    this.soundOn = true;
    this.currentMusic = null;
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create gain nodes
    this.masterGain = this.audioContext.createGain();
    this.musicGain = this.audioContext.createGain();
    this.sfxGain = this.audioContext.createGain();
    
    this.musicGain.connect(this.masterGain);
    this.sfxGain.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);
    
    this.musicGain.gain.value = 0.3;
    this.sfxGain.gain.value = 0.5;
  }

  // Retro arcade background music
  playBackgroundMusic() {
    if (!this.musicOn || !this.audioContext) return;
    this.stopBackgroundMusic();
    
    const playLoop = () => {
      if (!this.musicOn) return;
      
      const now = this.audioContext.currentTime;
      const tempo = 0.3;
      
      // Chord progression: C-Am-F-G
      const progression = [
        [261.63, 329.63, 392.00], // C major
        [220.00, 261.63, 329.63], // A minor
        [174.61, 220.00, 261.63], // F major
        [196.00, 246.94, 293.66], // G major
      ];
      
      let time = now;
      for (let i = 0; i < 4; i++) {
        const chord = progression[i];
        chord.forEach((freq, idx) => {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          
          osc.type = 'square';
          osc.frequency.value = freq;
          
          gain.gain.setValueAtTime(0.03, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + tempo * 2);
          
          osc.connect(gain);
          gain.connect(this.musicGain);
          
          osc.start(time);
          osc.stop(time + tempo * 2);
        });
        
        // Bassline
        const bass = this.audioContext.createOscillator();
        const bassGain = this.audioContext.createGain();
        bass.type = 'sawtooth';
        bass.frequency.value = chord[0] / 2;
        bassGain.gain.setValueAtTime(0.08, time);
        bassGain.gain.exponentialRampToValueAtTime(0.01, time + tempo);
        bass.connect(bassGain);
        bassGain.connect(this.musicGain);
        bass.start(time);
        bass.stop(time + tempo);
        
        time += tempo * 2;
      }
      
      this.currentMusic = setTimeout(playLoop, tempo * 8 * 1000);
    };
    
    playLoop();
  }

  stopBackgroundMusic() {
    if (this.currentMusic) {
      clearTimeout(this.currentMusic);
      this.currentMusic = null;
    }
  }

  // Arcade SFX
  playSound(type) {
    if (!this.soundOn || !this.audioContext) return;
    
    const now = this.audioContext.currentTime;
    
    switch(type) {
      case 'bet':
        this.playBeep(440, 0.05, 'triangle');
        break;
      
      case 'drop':
        // Falling whoosh
        const drop = this.audioContext.createOscillator();
        const dropGain = this.audioContext.createGain();
        drop.type = 'sawtooth';
        drop.frequency.setValueAtTime(800, now);
        drop.frequency.exponentialRampToValueAtTime(200, now + 0.4);
        dropGain.gain.setValueAtTime(0.3, now);
        dropGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        drop.connect(dropGain);
        dropGain.connect(this.sfxGain);
        drop.start(now);
        drop.stop(now + 0.4);
        break;
      
      case 'win':
        // Victory chime
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.2, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.3);
        });
        break;
      
      case 'jackpot':
        // Epic power-up
        for (let i = 0; i < 8; i++) {
          const freq = 523.25 * Math.pow(2, i / 12);
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          osc.type = 'square';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.15, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.2);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.2);
        }
        break;
      
      case 'umbra':
        // Dark spell
        const umbra = this.audioContext.createOscillator();
        const umbraGain = this.audioContext.createGain();
        const umbraLFO = this.audioContext.createOscillator();
        const umbraLFOGain = this.audioContext.createGain();
        
        umbra.type = 'sawtooth';
        umbra.frequency.value = 110;
        umbraLFO.type = 'sine';
        umbraLFO.frequency.value = 6;
        umbraLFOGain.gain.value = 50;
        
        umbraLFO.connect(umbraLFOGain);
        umbraLFOGain.connect(umbra.frequency);
        umbraGain.gain.setValueAtTime(0.3, now);
        umbraGain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
        
        umbra.connect(umbraGain);
        umbraGain.connect(this.sfxGain);
        umbra.start(now);
        umbraLFO.start(now);
        umbra.stop(now + 0.6);
        umbraLFO.stop(now + 0.6);
        break;
      
      case 'freeze':
        // Ice spell
        const ice = this.audioContext.createOscillator();
        const iceGain = this.audioContext.createGain();
        ice.type = 'sine';
        ice.frequency.setValueAtTime(1200, now);
        ice.frequency.exponentialRampToValueAtTime(300, now + 0.3);
        iceGain.gain.setValueAtTime(0.2, now);
        iceGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        ice.connect(iceGain);
        iceGain.connect(this.sfxGain);
        ice.start(now);
        ice.stop(now + 0.3);
        break;
      
      case 'poison':
        // Bubbling poison
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            const bubble = this.audioContext.createOscillator();
            const bubbleGain = this.audioContext.createGain();
            bubble.type = 'sine';
            bubble.frequency.value = 200 + Math.random() * 100;
            bubbleGain.gain.setValueAtTime(0.15, this.audioContext.currentTime);
            bubbleGain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            bubble.connect(bubbleGain);
            bubbleGain.connect(this.sfxGain);
            bubble.start();
            bubble.stop(this.audioContext.currentTime + 0.1);
          }, i * 50);
        }
        break;
      
      case 'damage':
        // Hit sound
        const hit = this.audioContext.createOscillator();
        const hitGain = this.audioContext.createGain();
        hit.type = 'sawtooth';
        hit.frequency.setValueAtTime(200, now);
        hit.frequency.exponentialRampToValueAtTime(50, now + 0.2);
        hitGain.gain.setValueAtTime(0.3, now);
        hitGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        hit.connect(hitGain);
        hitGain.connect(this.sfxGain);
        hit.start(now);
        hit.stop(now + 0.2);
        break;
      
      case 'defeat':
        // Game over sound
        [392, 349, 329, 293].forEach((freq, i) => {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          osc.type = 'square';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.2, now + i * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.4);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now + i * 0.15);
          osc.stop(now + i * 0.15 + 0.4);
        });
        break;
      
      case 'victory':
        // Fanfare
        const fanfare = [523, 659, 784, 1047];
        fanfare.forEach((freq, i) => {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          osc.type = 'square';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.25, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.12 + 0.5);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.5);
        });
        break;
      
      case 'coin':
        // Coin pickup
        this.playBeep(880, 0.08, 'sine');
        setTimeout(() => this.playBeep(1046, 0.08, 'sine'), 50);
        break;
    }
  }

  playBeep(freq, duration, type = 'sine') {
    if (!this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.audioContext.currentTime + duration);
  }

  setMusicVolume(enabled) {
    this.musicOn = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
  }

  setSoundVolume(enabled) {
    this.soundOn = enabled;
  }
}

// Singleton instance
let soundEngine = null;

export function getArcadeSoundEngine() {
  if (!soundEngine) {
    soundEngine = new ArcadeSoundEngine();
  }
  return soundEngine;
}

export default function ArcadeAudioManager({ musicOn, soundOn }) {
  const engineRef = useRef(null);

  useEffect(() => {
    engineRef.current = getArcadeSoundEngine();
    return () => {
      if (engineRef.current) {
        engineRef.current.stopBackgroundMusic();
      }
    };
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setMusicVolume(musicOn);
    }
  }, [musicOn]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setSoundVolume(soundOn);
    }
  }, [soundOn]);

  return null;
}