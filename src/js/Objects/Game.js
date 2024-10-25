import * as PIXI from 'pixi.js';
import { hitZonePosition, timelineY, startSpeed, ASPECT_RATIO } from '../settings.js';
import MelodyPlayer from './MelodyPlayer.js';
import { AudioManager } from '../AudioManager.js';
import Intro from './Intro.js';
import gsap from 'gsap';
import SpriteAnimation from './SpriteAnimation.js';
import Player from './Player.js';

const HIT_ZONE_SIZE = 2;
const TIMELINE_SIZE = 2;

export default class Game {
    static instance;
    constructor(app) {
        if (Game.instance) {
            return Game.instance; // Return existing instance if already created
        }
        this.introStarted = true;
        this.hasStarted = false;
        this.isDone = false;
        this.playersHaveLost = false;
        this.targetsContainer = new PIXI.Container();
        this.targets = { 1: [], 2: [] };
        // TODO: keep two arrays, one per player and keep track for each target of success.
        // Example : if player1 has hit the two first targets correctly and misses the third score should be score {1: [1, 1, 0] }
        // At the end of a sequence compute points by looping through both arrays and check both player have a score of 1 at index i to grant a point.
        // defeat condition should be if 90% of targets have been hit correctly by both players
        this.score = { p1: 10, p2: 10 };
        this.app = app;
        this.speed = startSpeed;
        this.audioManager = new AudioManager();
        this.setMelodyPlayer = this.setMelodyPlayer.bind(this);
        this.setIntroScene = this.setIntroScene.bind(this);
        this.setupAnimation = this.setupAnimation.bind(this);
        this.melodyPlayer = null;
        this.scoreCursor = null;
        this.notes = [];
        this.numOfTargets = 0;
        this.selectorScore = document.querySelector('.score p');

        const distToTraverse = window.innerWidth * 0.5 + 40;
        const offset = window.innerWidth * 0.5;
        this.distP1 = offset - distToTraverse;
        this.distP2 = offset + distToTraverse;
        Game.instance = this;
    }

    init() {
        this.player1 = new Player(1);
        this.player2 = new Player(2);

        this.player1.instance.buttons[0].addEventListener('keydown', this.setIntroScene);
        this.app.stage.addChild(this.targetsContainer);

        this.player1.instance.buttons[1].addEventListener('keydown', this.setupAnimation);
        this.setMelodyPlayer();
    }

    increaseScore(playerID) {
        if (playerID === 1) {
            this.score.p1++;
        } else if (playerID === 2) {
            this.score.p2++;
        }
        this.moveScoreCursor();
    }

    decreaseScore(playerID) {
        if (playerID === 1 && this.score.p1 > 0) {
            this.score.p1--;
        } else if (playerID === 2 && this.score.p2 > 0) {
            this.score.p2--;
        }
        this.moveScoreCursor();
    }

    // You can also add a method to get the current score if necessary
    getScore() {
        return this.score;
    }

    setupAnimation() {
        const indexPlayer = Math.floor(Math.random() * 2) + 1; // 1 or 2
        // const spriteSetRandom = Math.floor(Math.random() * 3) + 1; // 1, 2 or 3
        // const animationThunder = new SpriteAnimation(
        //     this.app,
        //     indexPlayer,
        //     `thunder-${spriteSetRandom}`
        // );
        const animationBras = new SpriteAnimation(this.app, 1, 'bras', 0.5, false, 'center');
        const animationSerpentLeft = new SpriteAnimation(
            this.app,
            2,
            'serpent-left',
            0.5,
            false,
            'left'
        );
        const animationSerpentRight = new SpriteAnimation(
            this.app,
            2,
            'serpent-right',
            0.5,
            false,
            'right'
        );
        animationBras.init().then(() => {
            animationBras.playAnimation();
        });
        // animationSerpentLeft.init().then(() => {
        //     animationSerpentLeft.playAnimation();
        // });
        // animationSerpentRight.init().then(() => {
        //     animationSerpentRight.playAnimation();
        // });
    }

    setIntroScene() {
        const intro = new Intro();
        intro.init();
        this.player1.instance.buttons[0].removeEventListener('keydown', this.setIntroScene);
    }

    startGame() {
        this.hasStarted = true;
        this.setStaticObjects();
        //this.melodyPlayer.startNewWave(107);
        this.melodyPlayer.startNewWave(110);
        document.querySelector('.score').classList.toggle('active');
    }

    setMelodyPlayer() {
        if (!this.melodyPlayer) {
            //this.melodyPlayer = new MelodyPlayer(107);
            this.melodyPlayer = new MelodyPlayer(110);
            this.player1.instance.buttons[0].removeEventListener('keydown', this.setMelodyPlayer);
        }
    }

    setStaticObjects() {
        // Score zone
        const scoreZoneTexture = PIXI.Texture.from('./assets/score-zone.svg');
        const scoreZone = new PIXI.Sprite(scoreZoneTexture);
        scoreZone.anchor.set(0.5, 0.5);
        scoreZone.x = hitZonePosition;
        scoreZone.y = timelineY - 5;
        scoreZone.scale.set(TIMELINE_SIZE * ASPECT_RATIO);
        scoreZone.alpha = 0;
        this.app.stage.addChild(scoreZone);

        // Timeline
        const timelineTexture = PIXI.Texture.from('./assets/timeline-background.svg');
        const timeline = new PIXI.Sprite(timelineTexture);
        timeline.anchor.set(0.5, 0.5);
        timeline.x = hitZonePosition;
        timeline.y = timelineY;
        timeline.scale.set(TIMELINE_SIZE * ASPECT_RATIO);
        timeline.alpha = 0;
        this.app.stage.addChild(timeline);

        // Hit zone
        const hitZoneTexture = PIXI.Texture.from('./assets/hit-zone.svg');
        const hitZone = new PIXI.Sprite(hitZoneTexture);
        hitZone.anchor.set(0.5, 0.5);
        hitZone.x = hitZonePosition;
        hitZone.y = timelineY;
        hitZone.scale.set(HIT_ZONE_SIZE * ASPECT_RATIO);
        hitZone.alpha = 0;
        this.app.stage.addChild(hitZone);

        gsap.to([scoreZone, this.scoreCursor, hitZone, timeline], {
            duration: 1,
            alpha: 1,
            ease: 'power2.out',
        });

        // set the size of the lottie animation
        const lottieContainer = document.getElementById('lottie');
        const crossProductW = (window.innerWidth * 228) / 1920;
        const crossProductH = (window.innerHeight * 228) / 1080;
        lottieContainer.style.width = `${crossProductW}px`;
        lottieContainer.style.height = `${crossProductH}px`;
    }

    update(playerID) {
        // Check if targets exist for the player
        if (!this.targets || !this.targets[playerID]) return;
        if (this.targets[playerID].length === 0) return;

        // Loop through all targets for the player and call move()
        for (let i = 0; i < this.targets[playerID].length; i++) {
            const target = this.targets[playerID][i];
            if (!target) continue; // Use continue instead of return to handle multiple targets
            target.move();
        }
    }

    updateAll() {
        if (!this.hasStarted) return;
        this.update(1);
        this.update(2);
    }

    // TODO: logic for checkResults & end condition
    checkResults() {}

    end() {}

    increaseSpeed(num) {
        this.speed += num;
    }
}
