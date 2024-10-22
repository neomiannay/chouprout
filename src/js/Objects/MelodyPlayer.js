import MidiPlayer from 'midi-player-js';
import { Soundfont } from 'smplr';
import Game from './Game';

//Onjectif de cette class : Analyser le fichier midi pour timer l'apparition des choux

export default class MelodyPlayer {
    constructor(tempo) {
        /**
         * Tempo = La vitesse d'éxécution de la musique, pour gérer la difficulté; la musique de base est à 110,
         * mais il faudrait la baisser pour la difficulté facile
         *
         * CurrentTick = le tick actuel de la musique, la valeur qui va se faire comparer à la valeur d'apparition du chou
         * Sachant que la musique loopera, elle repassera souvent à 0
         */

        this.tempo = tempo;
        this.currentTick = 0;
        this.game = new Game(); // singleton

        /**
         * Le Player du fichier MIDI. Il ne fait pas de son, il trigger juste un event lorsque qu'un note est jouée
         * La fonction à l'intérieur est joué à chaque note jouée, et je ne sais pas pourquoi met le tempo est reset à chaque note
         * jouée donc il faut le remettre à la bonne value à chaque fois.
         *
         */

        this.player = new MidiPlayer.Player(() => {
            this.player.setTempo(this.tempo);
        });

        this.context = new AudioContext();

        /**
         * L'instrument choisi. J'ai mis le kalimba, mais vous pouvez voir la liste disponible ici :
         * https://danigb.github.io/smplr/
         */

        this.instrument = new Soundfont(this.context, {
            instrument: 'kalimba',
        });

        this.fetchMelody();
        this.setPlayerEvents();
    }

    /**
     * Récupération du fichier MID
     */

    fetchMelody() {
        fetch('../../assets/soupeWithTimings.MID')
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => {
                this.player.loadArrayBuffer(arrayBuffer);
                this.startNewWave(this.tempo);
            })
            .catch((error) => {
                console.error('Error loading the MIDI file:', error);
            });
    }

    setPlayerEvents() {
        //Update du currentTick

        this.player.on('playing', () => {
            this.currentTick = this.player.tick;
        });

        //A REMOVE, C'EST PAS PROPRE, C'EST UN LOOP DE LA MELLODY POUR LA DEMO
        this.player.on('endOfFile', () => {
            this.game.increaseSpeed(5);
            new MelodyPlayer(this.tempo + 30);
        });

        /**
         * Autre fonction qui se lance à event du midi player;
         * à chaque event, on va vérifier si cette event est l'event "Note on", qui correspond au moment
         * où une note est jouée, et si cette note est de la track 2, la track de la melody,
         * et si ces 2 conditions sont réunies, on demande à l'intrument de jouer la note.
         */

        this.player.on('midiEvent', (note) => {
            if (note.noteName) {
                if (note.name === 'Note on' && note.track === 2) {
                    this.instrument.start({
                        note: note.noteNumber,
                        velocity: 80,
                        duration: 0.1,
                    });
                }
            }
        });
    }

    /**
     * Cette fonction sera à call a chaque fois qu'on veut accélérer la musique. Elle va changer le tempo, et
     * regénérer des choux
     *
     */

    startNewWave(tempo) {
        this.tempo = tempo;
        this.createRandomChoux();
        this.player.playLoop();
        this.player.play();
    }

    /**
     *
     * Logique de création des choux
     */

    createRandomChoux() {
        const choux = [];

        /**
         * On récupère la track 3 du fichier MID, qui est la track sur laquelle on à créer des notes qui donne le tempo
         * de la melody, et qui réprésente des timings sur lesquels on peut accrocher des choux
         */

        const rythmTrack = this.player.tracks[2];
        const rythmNotes = [];

        /**
         * On push tout les event "Note on" de la track du tempo
         */

        for (const note of rythmTrack.events) {
            if (note.name === 'Note on') {
                rythmNotes.push(note);
            }
        }

        /**
         * Les deux valeurs ci-dessous permette de ne pas avoir des choux qui se superposent
         */

        let lastChouStartTime = 0;
        let lastChouDuration = 0;

        for (const note of rythmNotes) {
            if (note.tick > lastChouStartTime + lastChouDuration + 1000) {
                //Add random to choux's creation, avoiding getting the same pattern
                if (Math.random() > 1 / 3) {
                    const chouTypeIndice = Math.floor(Math.random() * 1.99);
                    if (chouTypeIndice === 0) {
                        //Chou type === Hit
                        choux.push({
                            type: 'hit',
                            tick: note.tick,
                            duration: 0,
                        });
                        lastChouStartTime = note.tick;
                        lastChouDuration = 0;
                    } else if (chouTypeIndice === 1) {
                        //Chou type === Hold

                        /**
                         * TODO : Create choux duration logic
                         *
                         */

                        const chouDuration = Math.random() * 2000 + 1000;

                        choux.push({
                            type: 'hold',
                            tick: note.tick,
                            duration: chouDuration,
                        });
                        lastChouStartTime = note.tick;
                        lastChouDuration = chouDuration;
                    }
                }
            }
        }

        //Array d'object avec un type de chou, sa duration, et le timing auxquels il est censé être interagit
        // console.log(choux);
    }
}
