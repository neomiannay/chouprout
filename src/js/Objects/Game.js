import * as PIXI from 'pixi.js';
import {
    radius,
    hitZonePosition,
    numOfTargets,
    timelineY,
    arrowTypes,
    startSpeed,
    ASPECT_RATIO,
} from '../settings.js';
import MelodyPlayer from './MelodyPlayer.js';
import { AudioManager } from '../AudioManager.js';
import { player1 } from '../BorneManager/borneManager.js';
import Intro from './Intro.js';
import gsap from 'gsap';

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
        this.score = {};
        this.app = app;
        this.speed = startSpeed;
        this.audioManager = new AudioManager();
        this.setMelodyPlayer = this.setMelodyPlayer.bind(this);
        this.setIntroScene = this.setIntroScene.bind(this);
        this.melodyPlayer = null;
        this.notes = [];
        this.numOfTargets = 0;

        const distToTraverse = window.innerWidth * 0.5;
        const offset = window.innerWidth * 0.5;
        this.distP1 = offset - distToTraverse;
        this.distP2 = offset + distToTraverse;
        Game.instance = this;
    }

    init() {
        // this.setMelodyPlayer();
        // Need click to allow audioContext, remove when startingpage completed
        // player1.buttons[0].addEventListener('keydown', this.setMelodyPlayer);

        this.setMelodyPlayer();

        player1.buttons[0].addEventListener('keydown', this.setIntroScene);
    }

    setIntroScene() {
        const intro = new Intro();
        intro.init();
        player1.buttons[0].removeEventListener('keydown', this.setIntroScene);
    }

    startGame() {
        this.hasStarted = true;
        this.setStaticObjects();
        //this.melodyPlayer.startNewWave(107);
        this.melodyPlayer.startNewWave(110);
    }

    setMelodyPlayer() {
        if (!this.melodyPlayer) {
            //this.melodyPlayer = new MelodyPlayer(107);
            this.melodyPlayer = new MelodyPlayer(110);
            player1.buttons[0].removeEventListener('keydown', this.setMelodyPlayer);
        }
    }

    setStaticObjects() {
        // Hit zone
        const hitZoneTexture = PIXI.Texture.from('./assets/hit-zone.svg');
        const hitZone = new PIXI.Sprite(hitZoneTexture);
        hitZone.anchor.set(0.5, 0.5);
        hitZone.x = hitZonePosition;
        hitZone.y = timelineY;
        hitZone.scale.set(HIT_ZONE_SIZE * ASPECT_RATIO);
        hitZone.alpha = 0;
        this.app.stage.addChild(hitZone);

        // Timeline
        const timelineTexture = PIXI.Texture.from('./assets/timeline-background.svg');
        const timeline = new PIXI.Sprite(timelineTexture);
        timeline.anchor.set(0.5, 0.5);
        timeline.x = hitZonePosition;
        timeline.y = timelineY;
        timeline.scale.set(TIMELINE_SIZE * ASPECT_RATIO);
        timeline.alpha = 0;
        this.app.stage.addChild(timeline);

        gsap.to([hitZone, timeline], { duration: 1, alpha: 1, ease: 'power2.out' });

        // set the size of the lottie animation
        const lottieContainer = document.getElementById('lottie');
        const crossProductW = (window.innerWidth * 228) / 1920;
        const crossProductH = (window.innerHeight * 228) / 1080;
        lottieContainer.style.width = `${crossProductW}px`;
        lottieContainer.style.height = `${crossProductH}px`;
    }

    update(playerID) {
        if (this.targets.length >= 0) return;
        if (!this.targets[playerID]) return;
        if (this.targets[playerID].length === 0) return;

        for (let i = 0; i < this.targets[playerID].length; i++) {
            const target = this.targets[playerID][i];
            if (!target) return;
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
