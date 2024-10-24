import { player1 } from '../BorneManager/borneManager.js';
import { radius, hitRange, timelineY, startSpeed, ASPECT_RATIO } from '../settings.js';
import Game from './Game.js';

import * as PIXI from 'pixi.js';

const TARGET_SIZE = 3;
// All targets type extend this base class. Put all logic common to all targets here

export default class Target {
    constructor(index, initXPos, playerId, indexTargetBeat, intervalBetweenBeats, objectBeat) {
        this.game = new Game();
        this.app = this.game.app;
        this.index = index;
        this.circlePos = initXPos;
        this.playerID = playerId;
        this.radius = radius;
        this.direction = this.playerID === 1 ? -1 : 1;
        this.color = this.playerID === 1 ? '0xE63C49' : '0xFFA541';
        this.container = new PIXI.Container();

        //init joystick
        this.joystickPosition = {
            x: 0,
            y: 0,
        };
        this.joystickOrientation = 'center';
        //this.initJoystick();

        this.loadBackground(`/assets/icons/chou-${this.playerID}.svg`);

        this._indexTargetBeat = parseInt(indexTargetBeat);
        this._intervalBetweenBeats = intervalBetweenBeats;
        this._objectBeat = objectBeat;
        this._iBeat = 0;
    }

    // TODO : move it outside and run it one time per player. Make values of controller accessible in each target
    initJoystick() {
        player1.joysticks[0].addEventListener('joystick:move', (e) => {
            this.joystickPosition = e.position;
            if (Math.abs(e.position.x) > Math.abs(e.position.y)) {
                if (Math.abs(e.position.x) < 0.6) {
                    this.joystickOrientation = 'center';
                } else {
                    this.joystickOrientation = e.position.x < 0 ? 'left' : 'right';
                }
            } else {
                if (Math.abs(e.position.y) < 0.6) {
                    this.joystickOrientation = 'center';
                } else {
                    this.joystickOrientation = e.position.y < 0 ? 'bottom' : 'top';
                }
            }
        });
    }

    loadBackground(svgPath) {
        const texture = PIXI.Texture.from(svgPath);
        this.background = new PIXI.Sprite(texture);
        this.background.anchor.set(0.5, 0.5);
        this.background.scale.set(TARGET_SIZE * ASPECT_RATIO);
        this.background.x = this.circlePos;
        this.background.y = timelineY;
        this.background.zIndex = 10;
        this.container.addChild(this.background);
        this.app.stage.addChild(this.container);
    }

    getColor() {
        return this.playerID === 1 ? 0x0000ff : 0x00ffff;
    }

    remove() {
        this.container.removeChild(this.background);
    }

    isHitCorrect() {
        return this.isInHitRange();
    }

    isInHitRange() {
        return this.circlePos > hitRange[0] && this.circlePos < hitRange[1] ? true : false;
    }

    checkHitAccuracy() {
        // const width = this.background.texture.frame.width * this.background.scale.x;
        // const distance = Math.abs(this.circlePos - hitZonePosition);
        // const distanceMax = (width / 2) * hitRangeMaxInPercentage * 0.01;

        // show hit zone in this container avec la HIT_RANGEMaxInPercentage
        // if (!this.hitZoneGraphics) {
        //   this.hitZoneGraphics = new PIXI.Graphics()
        //     .beginFill(0xff0000, 0.2) // Set the fill color and transparency
        //     .drawRect(
        //       hitZonePosition - distanceMax,
        //       timelineY - 50,
        //       distanceMax * 2,
        //       100
        //     )
        //     .endFill();
        //   this.container.addChild(this.hitZoneGraphics);
        // }

        // if (distance < distanceMax) {
        //     const successInPercentage = 100 - (distance / distanceMax) * 100;

        //     // if (successInPercentage > ACCURACY.bad) {
        //     //     if (successInPercentage > ACCURACY.good) {
        //     //         if (successInPercentage > ACCURACY.perfect) {
        //     //             return 'perfect';
        //     //         }

        //     //         return 'good';
        //     //     }
        //     //     return 'bad';
        //     // }
        //     return 'missed';
        // } else {
        //     return 'missed';
        // }

        return this.circlePos > hitRange[0] && this.circlePos < hitRange[1] ? true : false;
    }

    isMissed() {
        if (this.playerID === 1) return this.circlePos > hitRange[1];
        if (this.playerID === 2) return this.circlePos < hitRange[0];
    }

    // hasExpired() {
    //     if (this.playerID === 1) return this.circlePos > HIT_RANGE[1];
    //     if (this.playerID === 2) return this.circlePos < HIT_RANGE[0];
    // }

    // wait(delay) {
    //     return new Promise((resolve) => setTimeout(resolve, delay));
    // }

    // async showFeedback(playerID) {
    //     const feedback = new Feedback(this.checkHitAccuracy(), playerID);
    //     feedback.init();

    //     if (this.isHitCorrect()) {
    //         this.game['player' + playerID].triggerAnimation('success');

    //         // TODO - Replace the prout by a visual and audio feedback
    //         const texture = PIXI.Texture.from('./assets/icons/prout.svg');
    //         const prout = new PIXI.Sprite(texture);
    //         prout.anchor.set(0.5);
    //         prout.x = window.innerWidth / 2;
    //         prout.y = timelineY;
    //         this.app.stage.addChild(prout);

    //         this.game['player' + playerID].increaseCombo(1);

    //         await wait(200);

    //         this.app.stage.removeChild(prout);
    //     } else {
    //         this.game['player' + playerID].resetCombo();
    //         this.game['player' + playerID].triggerAnimation('missed');
    //     }
    // }

    draw() {
        this.background.x = this.circlePos;
    }

    remove() {
        this.app.stage.removeChild(this.background);
    }

    _lerp(start, end, t) {
        return start + (end - start) * t;
    }

    move() {
        if (!this._startTime) {
            this._startTime = Date.now();
            this._lastBeatTime = Date.now();
        }

        this._currentTime = Date.now();
        let targetPos = window.innerWidth * 0.5;

        if (this._currentTime - this._lastBeatTime >= this._intervalBetweenBeats) {
            this._lastBeatTime = this._currentTime;
            this._moveSpeed = 0;
            if (this.game.melodyPlayer.player.isPlaying()) {
                this._iBeat += 1;
            }
            if (this._iBeat > this._indexTargetBeat) {
                this.remove();
            }
        }
        this._timeSinceLastBeat = this._currentTime - this._lastBeatTime;

        if (
            this._iBeat === this._indexTargetBeat - 1 &&
            this._objectBeat[this._iBeat] &&
            this._objectBeat[this._iBeat].length > 0
        ) {
            this._moveSpeed = Math.min(1, this._timeSinceLastBeat / this._intervalBetweenBeats);
            this.circlePos = this._lerp(this.circlePos, targetPos, this._moveSpeed);
            this.draw();
        }
    }
}
