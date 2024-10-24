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
import Hit from './Hit.js';
import Hold from './Hold.js';
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
        this.targets = {};
        // TODO: keep two arrays, one per player and keep track for each target of success.
        // Example : if player1 has hit the two first targets correctly and misses the third score should be score {1: [1, 1, 0] }
        // At the end of a sequence compute points by looping through both arrays and check both player have a score of 1 at index i to grant a point.
        // defeat condition should be if 90% of targets have been hit correctly by both players
        this.score = {};
        this.app = app;
        this.userIsHolding = false;
        this.speed = startSpeed;
        this.audioManager = new AudioManager();
        this.setMelodyPlayer = this.setMelodyPlayer.bind(this);
        this.setIntroScene = this.setIntroScene.bind(this);
        this.melodyPlayer = null;
        Game.instance = this;
    }

    init() {
        // this.setMelodyPlayer();
        // Need click to allow audioContext, remove when startingpage completed
        // player1.buttons[0].addEventListener('keydown', this.setMelodyPlayer);
        this.setStaticObjects();
        player1.buttons[0].addEventListener('keydown', this.setIntroScene);
        this.app.stage.addChild(this.targetsContainer);
    }

    setIntroScene() {
        console.log('ntm');
        const intro = new Intro();
        intro.init();
        player1.buttons[0].removeEventListener('keydown', this.setIntroScene);
    }

    startGame() {
        this.setMelodyPlayer();
        this.createTargets();
        this.setStaticObjects();
    }

    setMelodyPlayer() {
        if (!this.melodyPlayer) {
            this.melodyPlayer = new MelodyPlayer(90);
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
        hitZone.zIndex = 1;
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

        gsap.to([hitZone, timeline], { duration: 1, alpha: 1, ease: 'power2.out', zIndex: 1 });

        // set the size of the lottie animation
        const lottieContainer = document.getElementById('lottie');
        const crossProductW = (window.innerWidth * 228) / 1920;
        const crossProductH = (window.innerHeight * 228) / 1080;
        lottieContainer.style.width = `${crossProductW}px`;
        lottieContainer.style.height = `${crossProductH}px`;
    }

    createTargets() {
        let length = 0;
        let type = 1;
        let targetsPlayer1 = [];
        let targetsPlayer2 = [];
        let xPos1 = 0;
        let xPos2 = window.innerWidth;

        // player one
        for (let i = 0; i < numOfTargets; i++) {
            type = Math.random() < 0.5 ? 1 : 0;
            length = Math.random() * 100 + 100;

            if (type === 0) {
                // for hit target
                xPos1 -= radius * 2;
                xPos2 += radius * 2;
                targetsPlayer1[i] = new Hit(
                    this.targetsContainer,
                    'left',
                    i,
                    xPos1,
                    1,
                    arrowTypes[Math.floor(Math.random() * 4)]
                );
                targetsPlayer2[i] = new Hit(
                    this.targetsContainer,
                    'left',
                    i,
                    xPos2,
                    2,
                    arrowTypes[Math.floor(Math.random() * 4)]
                );
            } else if (type === 1) {
                // for hold target
                xPos1 -= radius * 2 + length;
                xPos2 += radius * 2 + length;
                targetsPlayer1[i] = new Hold(
                    100,
                    this.targetsContainer,
                    'left',
                    i,
                    xPos1,
                    1,
                    arrowTypes[Math.floor(Math.random() * 4)]
                );
                targetsPlayer2[i] = new Hold(
                    100,
                    this.targetsContainer,
                    'left',
                    i,
                    xPos2,
                    2,
                    arrowTypes[Math.floor(Math.random() * 4)]
                );
            }
        }
        this.targets[1] = targetsPlayer1;
        this.targets[2] = targetsPlayer2;
    }

    update(playerID) {
        if (this.targets[playerID].length === 0) return;
        if (!this.targets[playerID]) return;
        for (let i = 0; i < this.targets[playerID].length; i++) {
            const target = this.targets[playerID][i];
            if (!target) return;
            if (target.type === 'hold') {
                target.moveBar();
                if (!this.userIsHolding || i !== 0) {
                    target.move();
                }
            } else if (target.type === 'hit') {
                target.move();
            }
        }
        const currTarget = this.targets[playerID][0];
        if (currTarget.isMissed()) {
            currTarget.remove();
            this.targets[playerID].splice(0, 1);
        }

        if (this.userIsHolding && currTarget.type === 'hold') {
            currTarget.updateTimer();
            currTarget.updateBar();
            // reduce bar width
            currTarget.bar;
            if (currTarget.timeIsUp()) {
                currTarget.remove();
                this.targets[playerID].splice(0, 1);
                this.userIsHolding = false;
            }
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
