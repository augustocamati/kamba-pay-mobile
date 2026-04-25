import { Audio } from 'expo-av';

const SOUNDS = {
  click: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
  correct: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
  wrong: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
  success: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
  bg_music: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
};

class SoundManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private bgMusic: Audio.Sound | null = null;
  private isMuted: boolean = false;

  async loadAll() {
    try {
      // Just pre-loading common ones
      // In a real app, use local assets: require('@/assets/sounds/correct.mp3')
    } catch (e) {
      console.error('Error loading sounds:', e);
    }
  }

  async play(soundName: keyof typeof SOUNDS) {
    if (this.isMuted) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: SOUNDS[soundName] },
        { shouldPlay: true }
      );
      // Automatically unload after playing to save memory
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (e) {
      console.warn(`Could not play sound ${soundName}:`, e);
    }
  }

  async startBgMusic() {
    if (this.isMuted || this.bgMusic) return;
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: SOUNDS.bg_music }, // Use the stable URL from constants
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
