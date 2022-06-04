import 'phaser'
import { GridEngine } from 'grid-engine'
import Game from './scenes/Game'
import Pacman from './scenes/Pacman'

export default new Phaser.Game({
    type: Phaser.AUTO,
    width: 720,
    height: 528,
    backgroundColor: 0x8be3ff,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    plugins: {
        scene: [
            {
                key: "gridEngine",
                plugin: GridEngine,
                mapping: "gridEngine",
            },
        ],
    },

    scene: [Game, Pacman],
})