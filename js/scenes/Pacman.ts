import 'phaser';

export default class Pacman extends Phaser.Scene {
    constructor() {
        super('pacman');
    }

    preload() {
        this.load.spritesheet("player", "assets/characters.png", {
            frameWidth: 52,
            frameHeight: 72,
        });
    }

    create() {
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
    }

    update() {
    }
}