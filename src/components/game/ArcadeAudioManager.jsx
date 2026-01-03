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

  // FF IV-inspired BGM themes
  playBackgroundMusic(theme = 'battle') {
    if (!this.musicOn || !this.audioContext) return;
    this.stopBackgroundMusic();
    
    const themes = {
      title: this.playTitleTheme.bind(this),
      battle: this.playBattleTheme.bind(this),
      town: this.playTownTheme.bind(this),
      boss: this.playBossTheme.bind(this),
    };
    
    if (themes[theme]) {
      themes[theme]();
    }
  }

  playTitleTheme() {
    const playLoop = () => {
      if (!this.musicOn) return;
      
      const now = this.audioContext.currentTime;
      const tempo = 0.25;
      
      // Heroic melody: G-A-B-D-E-D-B-A
      const melody = [392, 440, 494, 587, 659, 587, 494, 440];
      const harmony = [196, 220, 247, 294, 330, 294, 247, 220];
      
      melody.forEach((freq, i) => {
        const time = now + i * tempo;
        
        // Lead melody (square wave)
        const lead = this.audioContext.createOscillator();
        const leadGain = this.audioContext.createGain();
        lead.type = 'square';
        lead.frequency.value = freq;
        leadGain.gain.setValueAtTime(0.05, time);
        leadGain.gain.exponentialRampToValueAtTime(0.01, time + tempo);
        lead.connect(leadGain);
        leadGain.connect(this.musicGain);
        lead.start(time);
        lead.stop(time + tempo);
        
        // Harmony (triangle wave)
        const harm = this.audioContext.createOscillator();
        const harmGain = this.audioContext.createGain();
        harm.type = 'triangle';
        harm.frequency.value = harmony[i];
        harmGain.gain.setValueAtTime(0.03, time);
        harmGain.gain.exponentialRampToValueAtTime(0.01, time + tempo);
        harm.connect(harmGain);
        harmGain.connect(this.musicGain);
        harm.start(time);
        harm.stop(time + tempo);
      });
      
      this.currentMusic = setTimeout(playLoop, melody.length * tempo * 1000);
    };
    
    playLoop();
  }

  playBattleTheme() {
    const playLoop = () => {
      if (!this.musicOn) return;
      
      const now = this.audioContext.currentTime;
      const tempo = 0.2;
      
      // Battle theme pattern
      const pattern = [
        [523, 587, 659], [494, 554, 622], 
        [440, 523, 587], [392, 466, 523],
      ];
      
      let time = now;
      pattern.forEach((chord, i) => {
        chord.forEach(freq => {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          osc.type = 'square';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.04, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + tempo * 2);
          osc.connect(gain);
          gain.connect(this.musicGain);
          osc.start(time);
          osc.stop(time + tempo * 2);
        });
        
        // Driving bass
        const bass = this.audioContext.createOscillator();
        const bassGain = this.audioContext.createGain();
        bass.type = 'sawtooth';
        bass.frequency.value = chord[0] / 2;
        bassGain.gain.setValueAtTime(0.1, time);
        bassGain.gain.exponentialRampToValueAtTime(0.01, time + tempo);
        bass.connect(bassGain);
        bassGain.connect(this.musicGain);
        bass.start(time);
        bass.stop(time + tempo);
        
        time += tempo * 2;
      });
      
      this.currentMusic = setTimeout(playLoop, tempo * 8 * 1000);
    };
    
    playLoop();
  }

  playTownTheme() {
    const playLoop = () => {
      if (!this.musicOn) return;
      
      const now = this.audioContext.currentTime;
      const tempo = 0.3;
      
      // Peaceful town melody
      const melody = [523, 587, 659, 698, 784, 698, 659, 587];
      
      melody.forEach((freq, i) => {
        const time = now + i * tempo;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.04, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + tempo * 1.5);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start(time);
        osc.stop(time + tempo * 1.5);
        
        // Soft bass
        if (i % 2 === 0) {
          const bass = this.audioContext.createOscillator();
          const bassGain = this.audioContext.createGain();
          bass.type = 'sine';
          bass.frequency.value = freq / 2;
          bassGain.gain.setValueAtTime(0.03, time);
          bassGain.gain.exponentialRampToValueAtTime(0.01, time + tempo);
          bass.connect(bassGain);
          bassGain.connect(this.musicGain);
          bass.start(time);
          bass.stop(time + tempo);
        }
      });
      
      this.currentMusic = setTimeout(playLoop, melody.length * tempo * 1000);
    };
    
    playLoop();
  }

  playBossTheme() {
    const playLoop = () => {
      if (!this.musicOn) return;
      
      const now = this.audioContext.currentTime;
      const tempo = 0.15;
      
      // Intense boss theme
      const pattern = [
        [392, 466, 523], [370, 440, 494],
        [349, 415, 466], [330, 392, 440],
      ];
      
      let time = now;
      pattern.forEach(chord => {
        chord.forEach(freq => {
          const osc = this.audioContext.createOscillator();
          const gain = this.audioContext.createGain();
          osc.type = 'sawtooth';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.05, time);
          gain.gain.exponentialRampToValueAtTime(0.01, time + tempo);
          osc.connect(gain);
          gain.connect(this.musicGain);
          osc.start(time);
          osc.stop(time + tempo);
        });
        
        // Heavy bass
        const bass = this.audioContext.createOscillator();
        const bassGain = this.audioContext.createGain();
        bass.type = 'square';
        bass.frequency.value = chord[0] / 2;
        bassGain.gain.setValueAtTime(0.12, time);
        bassGain.gain.exponentialRampToValueAtTime(0.01, time + tempo);
        bass.connect(bassGain);
        bassGain.connect(this.musicGain);
        bass.start(time);
        bass.stop(time + tempo);
        
        time += tempo;
      });
      
      this.currentMusic = setTimeout(playLoop, tempo * pattern.length * 1000);
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

  setMusicVolume(enabled, theme) {
    this.musicOn = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
    } else if (theme) {
      this.playBackgroundMusic(theme);
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

export default function ArcadeAudioManager({ musicOn, soundOn, theme = 'battle' }) {
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
      engineRef.current.setMusicVolume(musicOn, theme);
    }
  }, [musicOn, theme]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setSoundVolume(soundOn);
    }
  }, [soundOn]);

  return null;
}