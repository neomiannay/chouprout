import { setUpButtons } from './BorneManager/borneManager.js';
import Game from './Objects/Game.js';
import * as PIXI from 'pixi.js';
import { debounce } from './utils/debounce.js';
import { longFarts, smallFarts, hitRange } from './settings.js';
import animationOuiJSON from '../assets/lottie/oui-opti.json';
import animationNonJSON from '../assets/lottie/non-opti.json';
import { DotLottie } from '@lottiefiles/dotlottie-web';
import SpriteAnimation from './Objects/SpriteAnimation.js';

const createApp = async () => {
    // Create a new PixiJS application to handle canvas rendering
    const app = new PIXI.Application({
        width: window.innerWidth,
        height: window.innerHeight,
        resolution: 1, // Set resolution to match device pixel ratio
        antialias: true, // Enable antialiasing for smoother graphics
        transparent: true,
    });
    document.body.appendChild(app.view); // Append canvas to the document
    await setUpButtons(); // map game to arcade controls
    const game = new Game(app); // singleton that handles global logic
    game.init();

    // each character is controlled by one player
    // this function make the background sprite change on user button press
    const animateChar = (playerID) => {
        document.querySelector(`div.char${playerID}`).classList.toggle('active');
        document.querySelector(`div.char${playerID}Fart`).classList.toggle('active');
    };

    // debounce is used to prevent lagging when user spams the button
    const debouncedAnimateChar1 = debounce(() => animateChar(1), 500);
    const debouncedAnimateChar2 = debounce(() => animateChar(2), 500);

    // Initialize score tracking for each player
    const updateScore = (playerID, increment = true) => {
        if (increment) {
            game.score[`p${playerID}`] += 1; // Increase score for the player
        } else {
            game.score[`p${playerID}`] = Math.max(0, game.score[`p${playerID}`] - 1); // Decrease, ensuring score doesn't go below 0
        }
        console.log(`Player ${playerID} score: ${game.score[`p${playerID}`]}`);
    };

    let playerResults = { 1: false, 2: false }; // false par défaut, indique si chaque joueur a réussi

    const handleButtonADown = (playerID) => {
        let target = game.targets[playerID][0];
        if (!target) return;

            console.log(target);

            const currentPosition = target.currentPosition();
            console.log('currentPosition', currentPosition);
            const isInRange = currentPosition >= hitRange[0] && currentPosition <= hitRange[1];
            console.log(isInRange);
            playerResults[playerID] = isInRange;

            const fartSounds = target.type === 'hit' ? smallFarts : longFarts;
            const randomFart = fartSounds[Math.floor(Math.random() * fartSounds.length)];
            game.audioManager.debouncedPlay(randomFart.name);

            target.move();
            target.showFeedback();
            
        if (playerResults[playerID]) {
            updateScore(playerID, true); // Increase score if player succeeds
        } else {
            updateScore(playerID, false); // Optionally decrease score if player fails
        }

        if (playerResults[1] && playerResults[2]) {
            const bothHitCorrect = target.type === 'hit';
            showHitInfo(bothHitCorrect);
        }

        if (playerID === 1) {
            debouncedAnimateChar1();
        } else if (playerID === 2) {
            debouncedAnimateChar2();
        }
    };

    const handleButtonAUp = (playerID) => {
        const target = game.targets?.[playerID]?.[0];
        if (!target) return;

        target.showFeedback();

        // Check if both players are done
        if (playerResults[1] && playerResults[2]) {
            showHitInfo(true);
        } else {
            showHitInfo(false);
            game.audioManager.clearDebouncedPlay();
            game.audioManager.stop();
        }
    };

    game.player1.instance.buttons[0].addEventListener(
        'keydown',
        () => game.hasStarted && handleButtonADown(1)
    );
    game.player1.instance.buttons[0].addEventListener(
        'keyup',
        () => game.hasStarted && handleButtonAUp(1)
    );
    game.player2.instance.buttons[0].addEventListener(
        'keydown',
        () => game.hasStarted && handleButtonADown(2)
    );
    game.player2.instance.buttons[0].addEventListener(
        'keyup',
        () => game.hasStarted && handleButtonAUp(2)
    );

    const update = () => {
        // Update targets and score for both players
        game.updateAll();
    };

    app.ticker.maxFPS = 60;
    app.ticker.add(update);

    window.addEventListener('resize', () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
    });

    let currentLottieAnim = null;

    // was before the showProut function
    const showHitInfo = (succed) => {
        // If there is an existing animation, destroy it before creating a new one
        if (currentLottieAnim) {
            currentLottieAnim.destroy(); // Clean up the previous animation
        }

        currentLottieAnim = new DotLottie({
            canvas: document.getElementById('lottie'),
            data: succed ? animationOuiJSON : animationNonJSON,
            loop: false,
            autoplay: true,
        });

        if (succed) {
            const indexPlayer = Math.floor(Math.random() * 2) + 1; // 1 or 2
            const spriteSetRandom = Math.floor(Math.random() * 3) + 1; // 1, 2 or 3
            const animation = new SpriteAnimation(
                app,
                indexPlayer,
                `thunder-${spriteSetRandom}`,
                Math.random() * 0.5 + 0.5,
                true
            );
            animation.init().then(() => {
                animation.playAnimation();
            });
        }
    };
};
createApp();
