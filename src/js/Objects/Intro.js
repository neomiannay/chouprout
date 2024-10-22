export default class Intro {
    constructor() {
        this.introHome = document.querySelector('.intro-home');
        this.introVideo = document.querySelector('.intro-video');
        this.videoElement = document.querySelector('.intro-video__video');
        this.introTuto = document.querySelector('.intro-tuto');
    }

    init() {
        this.setEvents();
    }

    setEvents() {
        this.introHome.classList.add('fade-out');
        this.introHome.addEventListener('animationend', () => {
            this.introVideo.classList.remove('hidden');
            this.introVideo.classList.add('fade-in');
        });

        this.videoElement.addEventListener('ended', () => {
            this.introVideo.classList.add('fade-out');
            this.introVideo.addEventListener('animationend', () => {
                this.introVideo.classList.add('hidden');
                this.introTuto.classList.remove('hidden');
                this.introTuto.classList.add('fade-in');
            });
        });
    }
}
