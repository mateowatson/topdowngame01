import 'phaser';
//import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick.js';

const numCoins = 10;
const numFruits = 5;
const numGhosts = 5;
let speed = 60, vX = 0, vY = 0, prevX = 0, prevY = 0, prevTime = 0;
let belowLayer, worldLayer, aboveLayer, tileset, emptyTiles;
let map, player, cursors, bell, bell2, dead, hurt, timeout;
let joyStick = null;
let score = 0, lives = 5, scoreText = null, gameOver = false;

export default class Pacman extends Phaser.Scene {
    constructor() {
        super('pacman');
    }

    preload() {
        this.load.image("restart", "assets/pacman/restart.png");
        this.load.image("tiles2", "assets/pacman/tileset.png");
        this.load.tilemapTiledJSON("map", "assets/pacman/map.json");
        this.load.spritesheet("sprites", "assets/pacman/tileset.png", { frameWidth: 20, frameHeight: 20, margin: 1, spacing: 1 });
        this.load.audio("bell", "assets/pacman/ding.mp3");
        this.load.audio("bell2", "assets/pacman/ding2.mp3");
        this.load.audio("dead", "assets/pacman/dead.mp3");
        this.load.audio("hurt", "assets/pacman/hurt.mp3");
        this.load.audio("music", "assets/pacman/music.mp3");
        //this.load.plugin('rexVirtualJoystick', 'https://cdn.jsdelivr.net/npm/phaser3-rex-plugins@1.1.39/dist/rexVirtualJoystick.min.js', true);
    }

    create() {
        this.initSounds();
        this.cameras.main.setBackgroundColor(0x000000);
        this.createWorld();
        this.createAnimations(); 
        this.createPlayer();
        this.showScore();
    }

    update(time, delta) {
        if (gameOver) return;
        // Choose the right animation depending on the player's direction
        if (player.x > prevX) player.anims.play('right', true);
        else if (player.x < prevX) player.anims.play('left', true);
        else if (player.y > prevY) player.anims.play('down', true);
        else if (player.y < prevY) player.anims.play('up', true);
        // If the player goes outside the map
        if (player.x < 0) player.x = map.widthInPixels - 20;
        else if (player.x > map.widthInPixels) player.x = 0;
        let key = player.anims.currentAnim.key;
        let blocked = player.body.blocked;
        // Reset the velocity when the player touches a wall
        if (key == 'right' && blocked.right || key == 'left' && blocked.left) vX = 0;
        if (key == 'up' && blocked.up || key == 'down' && blocked.down) vY = 0;
        // Horizontal movement
        if (cursors.left.isDown || joyStick.left) vX = -speed;
        else if (cursors.right.isDown || joyStick.right) vX = speed;
        // Vertical movement
        if (cursors.up.isDown || joyStick.up) vY = -speed;
        else if (cursors.down.isDown || joyStick.down) vY = speed;
        player.setVelocity(vX, vY);
        if ((time - prevTime) > 100) {
            prevX = player.x;
            prevY = player.y;
            prevTime = time;
        }
    }

    initSounds() {
        bell = this.sound.add('bell', { volume: 0.2 });
        bell2 = this.sound.add('bell2', { volume: 0.8 });
        dead = this.sound.add('dead', { volume: 0.7 });
        hurt = this.sound.add('hurt', { volume: 0.9 });
        this.sound.add('music', { volume: 0.4 }).play({ loop: false });
    }

    createWorld() {
        map = this.make.tilemap({ key: "map" });
        // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
        // Phaser's cache (i.e. the name you used in preload)
        tileset = map.addTilesetImage("tileset", "tiles2");
        // Parameters: layer name (or index) from Tiled, tileset, x, y
        belowLayer = map.createLayer("Below Player", tileset, 0, 0).setDepth(1);
        worldLayer = map.createLayer("World", tileset, 0, 0).setDepth(2);
        aboveLayer = map.createLayer("Above Player", tileset, 0, 0).setDepth(3);
        worldLayer.setCollisionByProperty({ collides: true });
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        // Find empty tiles where new zombies, coins or health can be created
        emptyTiles = worldLayer.filterTiles(tile => (tile.index === -1));
        this.scale.resize(map.widthInPixels, map.heightInPixels).refresh();
    }

    newAnimation(name, rate, sprites, context) {
        context.anims.create({
            key: name, frameRate: rate, repeat: -1,
            frames: context.anims.generateFrameNumbers('sprites', sprites),
        });
    }
    createAnimations() {
        // Player
        this.newAnimation("left", 10, { start: 51, end: 58 }, this);
        this.newAnimation("right", 10, { start: 68, end: 75 }, this);
        this.newAnimation("down", 10, { start: 85, end: 92 }, this);
        this.newAnimation("up", 10, { start: 102, end: 109 }, this);
        // Point
        this.newAnimation("point", 1, { start: 8, end: 8 }, this);
        // Coin
        this.newAnimation("spinning", 10, { start: 0, end: 7 }, this);
        // Fruits
        this.newAnimation("fruits", 2, { frames: [46, 47, 114, 143] }, this);
        // Ghosts
        this.newAnimation("blue", 5, { start: 17, end: 20 }, this);
        this.newAnimation("pink", 5, { start: 21, end: 24 }, this);
        this.newAnimation("yellow", 5, { start: 25, end: 28 }, this);
        this.newAnimation("green", 5, { start: 34, end: 37 }, this);
        this.newAnimation("orange", 5, { start: 38, end: 41 }, this);
        this.newAnimation("red", 5, { start: 42, end: 45 }, this);
    }
    createPlayer() {
        // Object layers in Tiled let you embed extra info into a map - like a spawn point or custom
        // collision shapes. In the tmx file, there's an object layer with a point named "Spawn Point"
        const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
        // Create a sprite with physics enabled via the physics system
        player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "sprites").setDepth(2);
        // Watch the player and worldLayer for collisions, for the duration of the scene
        this.physics.add.collider(player, worldLayer);
        // Show points on empty tiles
        emptyTiles.forEach(tile => {
            let point = this.physics.add.sprite(tile.pixelX, tile.pixelY, 'sprites').setOrigin(0).anims.play('point', true);
            this.physics.add.overlap(player, point, this.collectPoint, null, this);
        });
        cursors = this.input.keyboard.createCursorKeys();
        // Show the joysticks only in mobile devices
        //if (!this.sys.game.device.os.desktop) {

            joyStick = this.plugins.get('rexVirtualJoystick');

            joyStick.add(this, {
                x: 210, y: 230, radius: 20,
                base: this.add.circle(0, 0, 20, 0x888888).setAlpha(0.5).setDepth(4),
                thumb: this.add.circle(0, 0, 20, 0xcccccc).setAlpha(0.5).setDepth(4)
            }).on('update', this.update, this);
        //}
    }
    showScore() {
        if (!scoreText) scoreText = this.add.text(map.widthInPixels / 2, 4, '', { fontSize: (18) + 'px', color: '#ffffff' }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(4);
        scoreText.setText('Score:' + score + ' / Lives:' + lives);
    }
    collectPoint(player, point) {
        bell.play();
        point.destroy();
        score += 5;
        this.showScore();
    }
}