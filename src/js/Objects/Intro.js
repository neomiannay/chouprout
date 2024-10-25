import { gsap } from 'gsap';
import Game from './Game';

export default class Intro {
    constructor() {
        this.game = new Game(); // singleton

        this.introHome = document.querySelector('.intro-home');
        this.introVideo = document.querySelector('.intro-video');
        this.videoElement = document.querySelector('.intro-video__video');
        this.introTuto = document.querySelector('.intro-tuto');
        this.sky = document.querySelector('.background-wrapper__sky');
        this.forest1 = document.querySelector('.background-scene__forest-1');
        this.forest2 = document.querySelector('.background-scene__forest-2');
        this.forest3 = document.querySelector('.background-scene__forest-3');
        this.floor = document.querySelector('.background-scene__floor');
        this.cursor = document.querySelector('.cursor');

        // characters
        this.player1 = document.querySelector('.char1');
        this.player2 = document.querySelector('.char2');

        this.setEvents = this.setEvents.bind(this);
        this.animateParallax = this.animateParallax.bind(this);
    }

    init() {
        this.setEvents();
    }

    setEvents() {
        // Animation fade-out de l'intro-home
        gsap.to(this.introHome, {
            opacity: 0,
            y: -20,
            duration: 0.5,
            onComplete: () => {
                this.introHome.style.visibility = 'hidden';

                // Animation fade-in de l'intro-video
                this.introVideo.style.visibility = 'visible';
                gsap.fromTo(
                    this.introVideo,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 }
                );
                this.videoElement.play();
            },
        });

        // // Transition après la fin de la vidéo
        this.videoElement.addEventListener('ended', () => {
            gsap.to(this.introVideo, {
                opacity: 0,
                y: -20,
                duration: 0.5,
                onComplete: () => {
                    this.introVideo.style.visibility = 'hidden';

                    // Animation fade-in de l'intro-tuto
                    this.introTuto.style.visibility = 'visible';
                    gsap.fromTo(
                        this.introTuto,
                        { opacity: 0, y: 20 },
                        { opacity: 1, y: 0, duration: 0.5 }
                    );

                    this.game.player1.instance.buttons[0].addEventListener(
                        'keydown',
                        this.animateParallax
                    );
                },
            });
        });

        // this.introTuto.style.visibility = 'visible';
        // gsap.fromTo(this.introTuto, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 });

        // this.game.player1.instance.buttons[0].addEventListener('keydown', this.animateParallax);
    }

    // Fonction pour animer le parallax
    animateParallax() {
        const viewportHeight = window.innerHeight;
        const skyHeight = this.sky.getBoundingClientRect().height;

        // Calcule la distance de translation pour le ciel
        const translateY = skyHeight - viewportHeight;

        // Réinitialise la visibilité des éléments parallax
        this.sky.style.visibility = 'visible';
        this.forest1.style.visibility = 'visible';
        this.forest2.style.visibility = 'visible';
        this.forest3.style.visibility = 'visible';
        this.floor.style.visibility = 'visible';
        this.player1.style.visibility = 'visible';
        this.player2.style.visibility = 'visible';
        this.cursor.style.visibility = 'visible';

        gsap.to(this.introTuto, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => {
                this.introTuto.style.visibility = 'hidden';
            },
        });

        // Animation de translation pour le ciel
        gsap.to(this.sky, {
            y: -translateY,
            duration: 1.5,
            ease: 'power1.out',
        });

        // Animation décalée pour les autres éléments
        gsap.fromTo(
            this.forest1,
            { y: '80%' },
            { y: 0, duration: 0.8, delay: 0.5, ease: 'power1.out' }
        );
        gsap.fromTo(
            this.forest2,
            { y: '130%' },
            { y: 0, duration: 0.8, delay: 0.75, ease: 'power1.out' }
        );
        gsap.fromTo(
            this.forest3,
            { y: '180%' },
            { y: 0, duration: 0.8, delay: 1, ease: 'power1.out' }
        );
        gsap.fromTo(
            this.floor,
            { y: '230%' },
            { y: 0, duration: 1, delay: 1.25, ease: 'power1.out' }
        );
        gsap.fromTo(
            this.player1,
            { y: '230%' },
            { y: 0, duration: 1, delay: 1.25, ease: 'power1.out' }
        );
        gsap.fromTo(
            this.cursor,
            { opacity: 0 },
            {
                duration: 1,
                delay: 1.25,
                ease: 'power1.out',
                onComplete: (opacity) => {
                    gsap.to(this.cursor, {
                        opacity: 1,
                        duration: 0.5,
                        ease: 'power1.out',
                    });
                },
            }
        );
        gsap.fromTo(
            this.player2,
            { y: '230%' },
            {
                y: 0,
                duration: 1,
                delay: 1.25,
                ease: 'power1.out',
                onComplete: () => {
                    this.game.hasStarted = true;
                    this.game.startGame();
                },
            }
        );

        // Supprime l'écouteur d'événement pour éviter les doublons
        this.game.player1.instance.buttons[0].removeEventListener('keydown', this.animateParallax);
    }
}
