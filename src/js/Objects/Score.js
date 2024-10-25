export default class Score {
    constructor(playerId) {
        this.playerID = playerId;
        this.score = 0;
        this.init();
    }

    init() {
        this.score = 0;
    }

    updateScore() {
        this.score += 1;
    }
}
