class Load extends Phaser.Scene {
	
	constructor() {
		super("loadScene");
	}

	preload() {

		this.load.path = './assets/';
		this.load.image("dirt", "dirt.png");
		this.load.image("grass1", "grass1.png");
		this.load.image("grass2", "grass2.png");
		this.load.image("mushroom1", "mushroom1.png");
		this.load.image("mushroom2", "mushroom2.png");
		this.load.image("player", "player1.png");

	}

	create() {

		this.scene.start("gameScene");
	}
}