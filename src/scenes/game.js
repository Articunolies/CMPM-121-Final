class Game extends Phaser.Scene {

	PLAYER_VELOCITY = 100;

	constructor() {
		super("gameScene");
	}

	create() {

		this.setInput();
		
		// Create player
		this.player = this.physics.add.sprite(100, 100, "player");
		this.player.setCollideWorldBounds(true);
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