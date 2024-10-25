import Target from './Target';
import * as PIXI from 'pixi.js';
import {
    radius,
    hitRange,
    timelineY,
    startSpeed,
    hitZonePosition,
    ASPECT_RATIO,
} from '../settings.js';

const TARGET_SIZE = 3;

export default class FartTarget extends Target {
    constructor(index, initXPos, playerId) {
        super(index, initXPos, playerId);
    }

    loadBackground() {
        const texture = PIXI.Texture.from(`/assets/icons/prout.svg`);
        this.background = new PIXI.Sprite(texture);
        this.background.anchor.set(0.5, 0.5);
        this.background.scale.set(TARGET_SIZE * ASPECT_RATIO);
        this.background.x = window.innerWidth / 2;
        this.background.y = timelineY;
        this.app.stage.addChild(this.background);
    }

    draw() {
        this.background.x = this.circlePos;
    }

    move() {
        this.background.x += -this.direction * this.game.speed;
    }

    remove() {
        this.app.stage.removeChild(this.background);
    }

    hasExpired() {
        if (this.playerID === 1) return this.background.x > hitRange[1];
        if (this.playerID === 2) return this.background.x < hitRange[0];
    }

    isHitCorrect() {
        return this.checkHitAccuracy();
    }

    checkHitAccuracy() {
        const width = this.background.texture.frame.width * this.background.scale.x;
        const distance = Math.abs(this.background.x - hitZonePosition);
        const distanceMax = (width / 2) * 0.05;

        if (distance < distanceMax) {
            return true;
        } else {
            return false;
        }
    }

    async showFeedback(playerID) {
        this.color = this.isHitCorrect() ? 0x00ff00 : 0xff0000;
    }
}
