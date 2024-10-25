export const radius = 100;
export const holdBarHeight = 25;
export const hitZonePosition = window.innerWidth / 2;
export const precision = window.innerWidth * 0.2;
export const startSpeed = 5;
export const hitRange = [hitZonePosition - precision, hitZonePosition + precision];
export const ASPECT_RATIO = window.innerWidth / 2880;
export const numOfTargets = 10;
export const MAX_SCORE = 20;
export const MAX_ANGLE = 180;
export const arrowTypes = ['left', 'right', 'up', 'down'];
export const timelineY = window.innerHeight - ASPECT_RATIO * 200;
export const iconScale = 2;
export const smallFarts = [
    { name: 'PetitPet_1', src: './assets/audios/PetitPet_1.mp3' },
    { name: 'PetitPet_2', src: './assets/audios/PetitPet_2.mp3' },
    { name: 'PetitPet_3', src: './assets/audios/PetitPet_3.mp3' },
];
export const longFarts = [
    { name: 'LongPet_1', src: './assets/audios/LongPet_1.mp3' },
    { name: 'LongPet_2', src: './assets/audios/LongPet_2.mp3' },
];
export const thunders = [
    { name: 'Tonnerre_1', src: './assets/audios/Eclair_1.mp3' },
    { name: 'Tonnerre_2', src: './assets/audios/Eclair_2.mp3' },
    { name: 'Tonnerre_3', src: './assets/audios/Eclair_3.mp3' },
];
export const hitInfo = [
    { name: 'oui', src: './assets/audios/oui.mp3' },
    { name: 'non', src: './assets/audios/non.mp3' },
];
