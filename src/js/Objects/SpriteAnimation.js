import * as PIXI from 'pixi.js';
import { ASPECT_RATIO, thunders } from '../settings';
import Game from './Game';

export default class SpriteAnimation {
    constructor(app, playerID, spriteSet, baseSpriteSize, isRandom = false, position = 'center') {
        this.game = new Game();
        this.app = app; // The PIXI.Application instance
        this.playerID = playerID; // The player ID (1 or 2)
        this.spriteSet = spriteSet; // The name of the sprite set to load
        this.sprite = null;
        this.assetsLoaded = false;
        this.baseSpriteSize = baseSpriteSize;
        this.isRandom = isRandom;
        this.position = position;

        // Bind the methods to maintain "this" reference
        this.playAnimation = this.playAnimation.bind(this);
        this.destroy = this.destroy.bind(this);
        this.setAnimationSpeed = this.setAnimationSpeed.bind(this);
    }

    async init() {
        await this.loadAssets();
        this.setupSprite();
    }

    loadAssets() {
        return new Promise((resolve, reject) => {
            const basePath = 'assets/sprites/';
            const atlasPath = `${basePath}${this.spriteSet}.json`;

            // Vérifier si la ressource est déjà chargée
            if (PIXI.Loader.shared.resources[atlasPath]) {
                this.assetsLoaded = true;
                resolve();
            } else {
                // Ajouter l'atlas au loader seulement s'il n'est pas déjà chargé
                PIXI.Loader.shared.add(atlasPath).load((loader, resources) => {
                    this.assetsLoaded = true;
                    resolve();
                });

                PIXI.Loader.shared.onError.add(() => {
                    reject(`Error loading assets from ${atlasPath}`);
                });
            }
        });
    }

    setupSprite() {
        if (!this.assetsLoaded) return;

        const basePath = 'assets/sprites/';
        const atlasPath = `${basePath}${this.spriteSet}.json`;
        const sheet = PIXI.Loader.shared.resources[atlasPath].spritesheet;

        // Check if the spritesheet has animations
        if (
            !sheet ||
            !sheet.animations[this.spriteSet] ||
            sheet.animations[this.spriteSet].length === 0
        ) {
            console.error(`No animations found for ${this.spriteSet}`);
            return;
        }

        // Create the animated sprite from the loaded spritesheet
        this.sprite = new PIXI.AnimatedSprite(sheet.animations[this.spriteSet]);

        // Set animation properties
        this.sprite.animationSpeed = 0.1;
        this.sprite.loop = true;

        this.sprite.anchor.set(0.5);

        if (this.isRandom) {
            const randomXP1 = Math.random() * 0.2 + 0.1;
            const randomXP2 = Math.random() * 0.2 + 0.7;
            this.sprite.x = window.innerWidth * (this.playerID === 1 ? randomXP1 : randomXP2);
            const randomY = Math.random() * 0.5;
            this.sprite.y = window.innerHeight * randomY + ASPECT_RATIO * 100;
        } else if (this.position === 'center') {
            this.sprite.x = window.innerWidth * 0.5;
            this.sprite.y = window.innerHeight * 0.4;
        } else if (this.position === 'left') {
            this.sprite.x = window.innerWidth * 0;
            this.sprite.y = window.innerHeight * 0.6;
        } else if (this.position === 'right') {
            this.sprite.x = window.innerWidth * 1;
            this.sprite.y = window.innerHeight * 0.6;
        }

        this.sprite.scale.set(this.baseSpriteSize * ASPECT_RATIO);
        // if the player is on the right side, flip the sprite
        if (this.playerID === 1) {
            this.sprite.scale.x *= -1;
        }

        // Add sprite to the PIXI stage
        this.app.stage.addChild(this.sprite);
    }

    playAnimation() {
        if (this.sprite) {
            this.sprite.play();

            if (this.isRandom) {
                const randomThunder = thunders[Math.floor(Math.random() * thunders.length)];
                this.game.audioManager.play(randomThunder.name, 0.2);
            }

            const destroyTime = this.isRandom ? Math.random() * 1000 + 500 : 1000;
            setTimeout(() => {
                this.destroy();
            }, destroyTime);
        }
    }

    playSound() {}

    destroy() {
        if (this.sprite) {
            this.app.stage.removeChild(this.sprite);
            this.sprite.destroy();
            this.sprite = null;
        }
    }

    setAnimationSpeed(speed) {
        if (this.sprite) {
            this.sprite.animationSpeed = speed;
        }
    }
}
