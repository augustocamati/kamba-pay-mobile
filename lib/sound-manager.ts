import { Audio } from 'expo-av';

const SOUNDS = {
  click: 'https://cdn.pixabay.com/audio/2025/06/01/audio_d2ccbb367a.mp3',
  correct: 'https://cdn.pixabay.com/audio/2025/10/21/audio_65cfef2766.mp3',
  wrong: 'https://cdn.pixabay.com/audio/2022/11/21/audio_136661e554.mp3',
  success: 'https://cdn.pixabay.com/audio/2025/11/24/audio_a78d073adb.mp3',
  bg_music: 'https://cdn.pixabay.com/audio/2026/04/01/audio_7efa637601.mp3',
};

class SoundManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private bgMusic: Audio.Sound | null = null;
  private isMuted: boolean = false;

  async loadAll() {
    try {
      // Pre-load all SFX to avoid latency when playing
      const items = Object.entries(SOUNDS).filter(([k]) => k !== 'bg_music');
      for (const [name, url] of items) {
        if (this.sounds.has(name)) continue;
        const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: false });
        this.sounds.set(name, sound);
      }
      console.log('All sounds preloaded successfully');
    } catch (e) {
      console.warn('Error preloading sounds:', e);
    }
  }

  async play(soundName: keyof typeof SOUNDS) {
    if (this.isMuted) return;
    try {
      const preloaded = this.sounds.get(soundName);
      if (preloaded) {
        await preloaded.replayAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          { uri: SOUNDS[soundName] },
          { shouldPlay: true }
        );
        // If it wasn't preloaded, we temporary load/unload
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            sound.unloadAsync();
          }
        });
      }
    } catch (e) {
      console.warn(`Could not play sound ${soundName}:`, e);
    }
  }

  async startBgMusic() {
    if (this.isMuted || this.bgMusic) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: SOUNDS.bg_music },
        { shouldPlay: true, isLooping: true, volume: 0.1 }
      );
      this.bgMusic = sound;
    } catch (e) {
      console.warn('Could not start bg music:', e);
    }
  }

  async stopBgMusic() {
    if (this.bgMusic) {
      await this.bgMusic.stopAsync();
      await this.bgMusic.unloadAsync();
      this.bgMusic = null;
    }
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted) this.stopBgMusic();
  }
}

export const soundManager = new SoundManager();
