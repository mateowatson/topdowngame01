import 'phaser';
import { GridEngine, Direction } from 'grid-engine'

export default class Game extends Phaser.Scene {
    gridEngine: GridEngine;

    constructor() {
        super('game');
    }

    preload() {
        this.load.image("tiles", "assets/cloud_tileset.png");
        this.load.tilemapTiledJSON("cloud-city-map", "assets/cloud_city.json");
        this.load.spritesheet("player", "assets/characters.png", {
            frameWidth: 52,
            frameHeight: 72,
        });
    }

    create() {
        const cloudCityTilemap = this.make.tilemap({ key: "cloud-city-map" });
        cloudCityTilemap.addTilesetImage("Cloud City", "tiles");
        for (let i = 0; i < cloudCityTilemap.layers.length; i++) {
            const layer = cloudCityTilemap.createLayer(i, "Cloud City", 0, 0);
            layer.scale = 3;
        }
        const playerSprite = this.add.sprite(0, 0, "player");
        playerSprite.scale = 1.5;

        const text = this.add.text(0, -10, "n00b", {
            fixedWidth: playerSprite.width*1.5,
            align: 'center'
        });
        text.setColor("#000000");

        const container = this.add.container(0, 0, [playerSprite, text]);

        this.cameras.main.startFollow(container, true);
        this.cameras.main.setFollowOffset(-playerSprite.width, -playerSprite.height);

        const gridEngineConfig = {
            numberOfDirections: 8,
            characters: [
                {
                    id: "player",
                    sprite: playerSprite,
                    container,
                    walkingAnimationMapping: 6,
                    walkingAnimationEnabled: true,
                    startPosition: { x: 8, y: 8 },
                },
            ]
        };


        this.gridEngine.create(cloudCityTilemap, gridEngineConfig);
    }

    update() {
        const cursors = this.input.keyboard.createCursorKeys();
        if (cursors.left.isDown) {
            this.gridEngine.move("player", Direction.LEFT);
        } else if (cursors.right.isDown) {
            this.gridEngine.move("player", Direction.RIGHT);
        } else if (cursors.up.isDown) {
            this.gridEngine.move("player", Direction.UP);
        } else if (cursors.down.isDown) {
            this.gridEngine.move("player", Direction.DOWN);
        } else if (cursors.left.isDown && cursors.up.isDown) {
            this.gridEngine.move("player", Direction.UP_LEFT);
        } else if (cursors.left.isDown && cursors.down.isDown) {
            this.gridEngine.move("player", Direction.DOWN_LEFT);
        } else if (cursors.right.isDown && cursors.up.isDown) {
            this.gridEngine.move("player", Direction.UP_RIGHT);
        } else if (cursors.right.isDown && cursors.down.isDown) {
            this.gridEngine.move("player", Direction.DOWN_RIGHT);
        }

        const mouse = this.input.activePointer;
        if(mouse.leftButtonDown()) {
            this.scene.start('pacman');
        }
    }
}