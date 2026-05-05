import { Audio } from 'expo-av';

const SOUNDS = {
  click: 'https://cdn.pixabay.com/audio/2025/06/01/audio_d2ccbb367a.mp3',
  correct: 'https://cdn.pixabay.com/audio/2025/10/21/audio_65cfef2766.mp3',
  wrong: 'https://cdn.pixabay.com/audio/2022/11/21/audio_136661e554.mp3',
  success: 'https://cdn.pixabay.com/audio/2025/11/24/audio_a78d073adb.mp3',
  bg_music: 'https://cdn.pixabay.com/audio/2026/04/01/audio_7efa637601.mp3',
  
  // Onboarding local sounds
  onboarding_1: require('../assets/sounds/olá futuro camp.wav'),
  onboarding_2: require('../assets/sounds/tarefas.wav'),
  onboarding_3: require('../assets/sounds/os teus 3 potes.wav'),
  onboarding_4: require('../assets/sounds/cria missões.wav'),
  onboarding_5: require('../assets/sounds/temos videoaulas.wav'),
  onboarding_6: require('../assets/sounds/pronto para cmc.wav'),

  // Tour local sounds
  tour_perfil: require('../assets/sounds/o teu nivel e o teu perfil.wav'),
  tour_aprender: require('../assets/sounds/acessar ao aprender.wav'),
  tour_tarefas: require('../assets/sounds/botao tarefas.wav'),
  tour_missoes: require('../assets/sounds/botao missoes.wav'),
  tour_ajudar: require('../assets/sounds/botao camonahas.wav'),
  tour_loja: require('../assets/sounds/loja.wav'),
  tour_saldo_geral: require('../assets/sounds/saldo total.wav'),
  tour_poupar: require('../assets/sounds/pote dinheiro.wav'),
  tour_gastar: require('../assets/sounds/potegastra.wav'),
  tour_ajudar_pote: require('../assets/sounds/pote ajudar.wav'),
};

class SoundManager {
  private sounds: Map<string, Audio.Sound> = new Map();
  private bgMusic: Audio.Sound | null = null;
  private isMuted: boolean = false;

  async loadAll() {
    try {
      const items = Object.entries(SOUNDS).filter(([k]) => k !== 'bg_music');
      for (const [name, source] of items) {
        if (this.sounds.has(name)) continue;
        
        const audioSource = typeof source === 'string' ? { uri: source } : source;
        const { sound } = await Audio.Sound.createAsync(audioSource, { shouldPlay: false });
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
        const source = SOUNDS[soundName];
        const audioSource = typeof source === 'string' ? { uri: source } : source;
        const { sound } = await Audio.Sound.createAsync(
          audioSource,
          { shouldPlay: true }
        );
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

  async stopAll() {
    try {
      const allSounds = Array.from(this.sounds.values());
      await Promise.all(allSounds.map(async (sound) => {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.stopAsync();
        }
      }));
    } catch (e) {
      console.warn('Error stopping all sounds:', e);
    }
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    if (muted) this.stopBgMusic();
  }
}

export const soundManager = new SoundManager();
