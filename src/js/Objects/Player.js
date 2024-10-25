import Axis from 'axis-api';
import Game from './Game';

const BASE_SPRITE_SIZE = 0.6;

export default class Player {
    combo = 0;
    sprite = null;

    constructor(playerID, scoreNode) {
        this.game = new Game();
        this.app = this.game.app;
        this.playerID = playerID;
        this._score = scoreNode;
        this._tlScore = null;

        this.init();
    }

    async init() {
        this.instance = Axis.createPlayer({
            id: this.playerID,
            joysticks: Axis['joystick' + this.playerID],
            buttons: Axis.buttonManager.getButtonsById(this.playerID),
        });
    }

    incrementScore() {
        this.game.score += 1;
        this._score.innerHTML = this.game.score;
    }
}
