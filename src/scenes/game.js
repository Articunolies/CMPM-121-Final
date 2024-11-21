class Game extends Phaser.Scene {

	PLAYER_VELOCITY = 100;
	GRID_WIDTH = 2;
	GRID_HEIGHT = 1;
	TILE_SIZE = 18;		// in pixels

	constructor() {
		super("gameScene");
	}

	create() {

		this.setInput();
		this.createGrid();
		this.createPlayer();
		this.cameras.main.setZoom(2);
	}

    update() {

		this.handlePlayerMovement();
    }

	setInput() {
		this.moveUpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
		this.moveDownKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
		this.moveLeftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
		this.moveRightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
	}

	createGrid() {

		// Create 2D array
		this.grid = [];
		for (let y = 0; y < this.GRID_HEIGHT; y++) {
			this.grid[y] = [];
			for (let x = 0; x < this.GRID_WIDTH; x++) {
				this.grid[y][x] = this.physics.add.sprite(500 + x * this.TILE_SIZE, 300 + y * this.TILE_SIZE, "dirt");
			}
		}
	}

	createPlayer() {
		this.player = this.physics.add.sprite(500, 250, "player");
		this.player.setCollideWorldBounds(true);
	}

	handlePlayerMovement() {

		// For making sure the player doesn't move faster diagonally
		let numMoveDirections = 0;

		// Vertical Movement
		if (this.moveUpKey.isDown) {
			this.player.body.setVelocityY(-this.PLAYER_VELOCITY);
			numMoveDirections++;
		}
		else if (this.moveDownKey.isDown) {
			this.player.body.setVelocityY(this.PLAYER_VELOCITY);
			numMoveDirections++;
		}
		else {
			this.player.body.setVelocityY(0);
		}

		// Horizontal Movement
		if (this.moveLeftKey.isDown) {
			this.player.body.setVelocityX(-this.PLAYER_VELOCITY);
			numMoveDirections++;
		}
		else if (this.moveRightKey.isDown) {
			this.player.body.setVelocityX(this.PLAYER_VELOCITY);
			numMoveDirections++;
		}
		else {
			this.player.body.setVelocityX(0);
		}

		// Make sure the player doesn't move faster diagonally
		if (numMoveDirections > 1) {
			this.player.body.velocity.x /= Math.SQRT2;
			this.player.body.velocity.y /= Math.SQRT2;
		}
	}
}