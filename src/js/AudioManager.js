import { smallFarts, longFarts, thunders, hitInfo, OuiNon, ui } from './settings';
import { debounce } from './utils/debounce.js';

export class AudioManager {
    constructor() {
        this.sounds = {};
        this.loaded = {};
        this.preloadSounds(smallFarts);
        this.preloadSounds(longFarts);
        this.preloadSounds(thunders);
        this.preloadSounds(hitInfo);
        this.preloadSounds(OuiNon);
        this.preloadSounds(ui);
        this.debouncedPlay = debounce(this.play.bind(this), 1000);
        this.activeSounds = [];
    }

    loadSound(name, src) {
        const audio = new Audio(src);
        audio.loop = false;
        this.sounds[name] = audio;
        this.loaded[name] = false;
    }

    preloadSounds(soundList) {
        soundList.forEach((sound) => {
            this.loadSound(sound.name, sound.src);
            this.sounds[sound.name].load();
            this.loaded[sound.name] = true;
        });
    }

    play(name, volume = 1, loop = false) {
        if (this.sounds[name]) {
            this.sounds[name].volume = volume;
            this.sounds[name].loop = loop;
            this.sounds[name].currentTime = 0;
            this.sounds[name].play();
            this.activeSounds.push(this.sounds[name]);
        }
    }

    stop() {
        this.activeSounds.forEach((audio) => {
            audio.pause();
            audio.currentTime = 0;
        });
        this.activeSounds = [];
    }

    setVolume(volume) {
        Object.values(this.sounds).forEach((audio) => {
            audio.volume = volume;
        });
    }

    clearDebouncedPlay() {
        if (this.debouncedPlay.cancel) {
            this.debouncedPlay.cancel();
        }
    }
}
