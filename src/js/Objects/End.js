import Game from './Game';

export default class End {
    constructor() {
        this.game = new Game();

        this.endElement = document.querySelector('.end');

        this.endVideoVictory = document.querySelector('.victory');
        this.endVideoDefeat = document.querySelector('.defeat');

        this.videoVictoryElement = document.querySelector('.end-video-victory__video');
        this.videoDefeatElement = document.querySelector('.end-video-defeat__video');

        this.setEvents = this.setEvents.bind(this);
    }
    init() {
        this.setEvents();
    }

    setEvents() {
        this.endElement.style.visibility = 'visible';

        console.log('set events end');

        const gameScore = this.game.score.p1 + this.game.score.p2;

        console.log(gameScore);
        if (gameScore >= 30) {
            console.log('victory');
            this.endVideoVictory.style.visibility = 'visible';
            this.playVictory();
        } else {
            console.log('defeat');
            this.endVideoDefeat.style.visibility = 'visible';
            this.playDefeat();
        }
    }

    playVictory() {
        this.videoVictoryElement.muted = false;
        this.videoVictoryElement.loop = false;
        this.videoVictoryElement.play();
    }

    playDefeat() {
        this.videoVictoryElement.muted = false;
        this.videoVictoryElement.loop = false;
        this.videoDefeatElement.play();
    }

    destroy() {
        this.app.stage.removeChild(this.end);
    }
}
