import { radius, hitRange, timelineY, ASPECT_RATIO, hitZonePosition } from '../settings.js';
import Game from './Game.js';

import * as PIXI from 'pixi.js';

const TARGET_SIZE = 3;
// All targets type extend this base class. Put all logic common to all targets here

export default class Target {
    constructor(index, initXPos, playerId, indexTargetBeat, intervalBetweenBeats, objectBeat) {
        this.game = new Game();
        this.app = this.game.app;
        this.index = index;
        this._circlePos = initXPos;
        this.playerID = playerId;
        this.radius = radius;
        this.direction = this.playerID === 1 ? -1 : 1;
        this.color = this.playerID === 1 ? '0xE63C49' : '0xFFA541';

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
        this._targetPos = window.innerWidth * 0.5;
        this._hasReachedCenter = false;
        this._checked = false;
    }

    // TODO : move it outside and run it one time per player. Make values of controller accessible in each target
    initJoystick() {
        this.game.player1.joysticks[0].addEventListener('joystick:move', (e) => {
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
        this.background.x = this._circlePos;
        this.background.y = timelineY;
        this.background.zIndex = 10;
        this.app.stage.addChild(this.background);
    }

    getColor() {
        return this.playerID === 1 ? 0x0000ff : 0x00ffff;
    }

    remove() {
        this.app.stage.removeChild(this.background);
    }

    isMissed() {
        if (this.playerID === 1) return this._circlePos > hitRange[1];
        if (this.playerID === 2) return this._circlePos < hitRange[0];
    }

    remove() {
        this.app.stage.removeChild(this.background);
    }

    _lerp(start, end, t) {
        t = Math.max(0, Math.min(1, t));
        return start + (end - start) * t;
    }

    move() {
        if (!this._startTime) {
            this._startTime = Date.now();
            this._lastBeatTime = Date.now();
        }

        this._currentTime = Date.now();

        if (this._currentTime - this._lastBeatTime >= this._intervalBetweenBeats) {
            this._lastBeatTime = this._currentTime;
            this._moveSpeed = 0;
            if (this.game.melodyPlayer.player.isPlaying()) {
                this._iBeat += 1;
            }
            if (this._iBeat > this._indexTargetBeat) {
                this.remove();
                return;
            }
        }
        this._timeSinceLastBeat = this._currentTime - this._lastBeatTime;

        const shouldMove =
            this._iBeat === this._indexTargetBeat - 3 &&
            this._objectBeat[this._iBeat] &&
            this._objectBeat[this._iBeat].length > 0;

        if (shouldMove) {
            this._moveSpeed = Math.min(1, this._timeSinceLastBeat / this._intervalBetweenBeats);

            this._circlePos = this._lerp(this._circlePos, this._targetPos, this._moveSpeed);

            if (Math.abs(this._circlePos - this._targetPos) < 1) {
                this._hasReachedCenter = true;
            }

            this.draw();
        }
    }

    currentPosition() {
        const distToTraverse = window.innerWidth * 0.5 + 40;
        const offset = window.innerWidth * 0.5;

        const timeSinceLastBeat = Date.now() - this._lastBeatTime;
        const progress = Math.min(1, timeSinceLastBeat / this._intervalBetweenBeats);
        const startPos = this.playerID === 1 ? offset - distToTraverse : offset + distToTraverse;
        return this._lerp(startPos, this._targetPos, progress);
    }

    checkHitAccuracy() {
        const width = this.background.texture.frame.width * this.background.scale.x;
        const distance = Math.abs(this._circlePos - hitZonePosition);
        const distanceMax = (width / 2) * 0.05;

        if (distance < distanceMax) {
            return true;
        } else {
            return false;
        }
    }

    isInHitRange() {
        return this._circlePos >= hitRange[0] && this._circlePos <= hitRange[1];
    }

    draw() {
        this.background.x = this._circlePos;
    }

    showFeedback() {
        this.color = this.isInHitRange() ? 0x00ff00 : 0xff0000;
    }
}
