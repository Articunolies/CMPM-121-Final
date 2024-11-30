class Player extends Phaser.Physics.Arcade.Sprite {
	static DEPTH = 2;
	static VELOCITY = 50;

	constructor(scene, x, y) {
		// Set sprite
		super(scene, x, y, "player");
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.setCollideWorldBounds(true);
		this.setDepth(Player.DEPTH);

		// Set tile hitbox
		// ensures the player can only reap/sow plants on the tile they're standing on
		this.tileHitbox = scene.add.zone(0, 0, 1, 1);
		scene.physics.add.existing(this.tileHitbox);

		// Set input
		this.setInput();
	}
	update() {
		this.handleMovement();
		this.updateTileHitboxPosition();
	}

	setInput() {
		// Movement
		this.moveUpKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
		this.moveDownKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
		this.moveLeftKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
		this.moveRightKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

		// Planting & Reaping
		this.plantGrassKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
		this.plantGrassKey.on("down", () => this.plant(Plant.SPECIES.GRASS));
		this.plantMushroomKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
		this.plantMushroomKey.on("down", () => this.plant(Plant.SPECIES.MUSHROOM));
		this.reapPlantKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
		this.reapPlantKey.on("down", () => this.reap());
	}
	plant(species) {
		// Ensure player is standing on a tile
		const tile = this.tileStandingOn;
		if (tile) {
			tile.plant.become(species, 1);
		}
	}
	reap() {
		// Ensure player is standing on a tile
		const tile = this.tileStandingOn;
		if (tile) {
			this.scene.winningPlants.delete(tile.plant);
			tile.plant.remove();
		}
	}
	set tileStandingOn(tile) {
		this.tileWasLastStandingOn = tile;
	}
	get tileStandingOn() {
		// Ensure player has stood on a tile before
		if (!this.tileWasLastStandingOn) {
			return undefined;
		}
		// Ensure player is still standing on that tile
		if (!this.stillStandingOnTileWasLastStandingOn()) {
			return null;
		}
		return this.tileWasLastStandingOn;
	}
	stillStandingOnTileWasLastStandingOn() {
		return Phaser.Geom.Intersects.RectangleToRectangle(this.getBounds(), this.tileWasLastStandingOn.getBounds());
	}

	handleMovement() {
		// For making sure we don't move faster diagonally
		let numMoveDirections = 0;

		// Vertical Movement
		if (this.moveUpKey.isDown) {
			this.body.setVelocityY(-Player.VELOCITY);
			numMoveDirections++;
		}
		else if (this.moveDownKey.isDown) {
			this.body.setVelocityY(Player.VELOCITY);
			numMoveDirections++;
		}
		else {
			this.body.setVelocityY(0);
		}

		// Horizontal Movement
		if (this.moveLeftKey.isDown) {
			this.body.setVelocityX(-Player.VELOCITY);
			numMoveDirections++;
		}
		else if (this.moveRightKey.isDown) {
			this.body.setVelocityX(Player.VELOCITY);
			numMoveDirections++;
		}
		else {
			this.body.setVelocityX(0);
		}

		// Make sure to not move faster diagonally
		if (numMoveDirections > 1) {
			this.body.velocity.x /= Math.SQRT2;
			this.body.velocity.y /= Math.SQRT2;
		}
	}
	updateTileHitboxPosition() {
		// using this.body.x instead of this.x makes the hitbox lag behind the player less for some reason so use it
		this.tileHitbox.setPosition(this.body.x + this.body.width/2, this.body.y + this.body.height);
	}
}