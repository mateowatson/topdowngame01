import 'phaser'
import { GridEngine } from 'grid-engine'
import Game from './scenes/Game'

export default new Phaser.Game({
    type: Phaser.AUTO,
    width: 720,
    height: 528,
    backgroundColor: 0x8be3ff,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: true
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

    scene: [Game],
})