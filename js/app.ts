import 'phaser'
import { GridEngine } from 'grid-engine'
import VirtualJoystickPlugin from 'phaser3-rex-plugins/plugins/virtualjoystick-plugin.js'
import Game from './scenes/Game'
import Pacman from './scenes/Pacman'

export default new Phaser.Game({
    type: Phaser.AUTO,
    pixelArt: true,
    backgroundColor: 0x8be3ff,
    scale: {
        mode: Phaser.Scale.ENVELOP,
        width: window.innerWidth,
        height: window.innerHeight
    },
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
        global: [
            {
                key: 'rexVirtualJoystick',
                plugin: VirtualJoystickPlugin,
                start: true
            }
        ],
    },

    scene: [Game, Pacman],
})