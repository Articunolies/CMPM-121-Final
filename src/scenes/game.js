class Game extends Phaser.Scene {

	/*
	for when we eventually get typescript to work
	
	interface Tile {
		plant: Plant;
		sunLevel: number;
		moisture: number;
		sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
	}

	interface Plant {
		level: number;
		sprite: Phaser.GameObjects.Sprite;
	}
	*/

	PLAYER_VELOCITY = 50;
	GRID_WIDTH = 2;
	GRID_HEIGHT = 1;
	TILE_SIZE = 18;		// in pixels

	constructor() {
		super("gameScene");
	}

	create() {
		this.initInput();
		this.createGrid();
		this.createPlayer();
		this.displayControls();
	}

    update() {
		this.handlePlayerMovement();
		this.makePlayerTileHitboxFollowPlayer();
    }

	initInput() {
		// Player
		this.moveUpKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
		this.moveDownKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
		this.moveLeftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
		this.moveRightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

		// Time
		this.advanceTimeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		this.advanceTimeKey.on("down", () => this.advanceTime());

		// Planting
		this.plantGrassKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
		this.plantGrassKey.on("down", () => this.plant("grass1"));
		this.plantMushroomKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
		this.plantMushroomKey.on("down", () => this.plant("mushroom1"));
	}

	advanceTime() {
		console.log("advancing time");
	}

	plant(textureKey) {
		// Ensure the player has stood on a tile before
		if (this.tilePlayerWasLastStandingOnIndex == undefined) {
			return;
		}

		// Get the tile the player was last standing on
		const tile = this.grid[this.tilePlayerWasLastStandingOnIndex.y][this.tilePlayerWasLastStandingOnIndex.x];

		// Ensure the player is still standing on that tile
		if (!overlaps(this.playerTileHitbox, tile.sprite)) {
			return;
		}

		// Ensure the tile doesn't already have a plant
		if (tile.plant != null) {
			return;
		}

		// Create the plant and give it to the tile
		tile.plant = {
			level: 1,
			sprite: this.add.sprite(tile.sprite.x, tile.sprite.y - tile.sprite.height/2, textureKey)
		};

		function overlaps(spriteA, spriteB) {
			return Phaser.Geom.Intersects.RectangleToRectangle(spriteA.getBounds(), spriteB.getBounds());
		}
	}

	createGrid() {
		// Create a 2D array of tiles
		this.grid = [];
		for (let y = 0; y < this.GRID_HEIGHT; y++) {
			this.grid[y] = [];
			for (let x = 0; x < this.GRID_WIDTH; x++) {
				this.grid[y][x] = {
					plant: null,
					sunLevel: 0,
					moisture: 0,
					sprite: this.physics.add.sprite(100 + x * this.TILE_SIZE, 75 + y * this.TILE_SIZE, "dirt")
				}
			}
		}
	}

	createPlayer() {
		// Sprite
		this.player = this.physics.add.sprite(100, 50, "player");
		this.player.setCollideWorldBounds(true);

		// Tile Hitbox
		// ensures the player can only reap/sow plants on the tile they're standing on
		this.playerTileHitbox = this.add.zone(0, 0, 1, 1);
		this.physics.add.existing(this.playerTileHitbox);
		this.grid.forEach((row, y) => {
			row.forEach((tile, x) => {
				this.physics.add.overlap(
					tile.sprite,
					this.playerTileHitbox,
					() => this.tilePlayerWasLastStandingOnIndex = { y: y, x: x }
				);
			});
		});
	}

	displayControls() {
		const controls = `
		<h2>Controls</h2>
		Move: WASD<br>
		Advance Time: RIGHT<br>
		Plant Grass: 1<br>
		Plant Mushroom: 2
		`;
		document.getElementById("description").innerHTML = controls;
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

	makePlayerTileHitboxFollowPlayer() {
		// use player.body.x instead of player.x etc. so the hitbox doesn't lag behind the player's movement as much
		this.playerTileHitbox.setPosition(this.player.body.x + this.player.body.width/2, this.player.body.y + this.player.body.height);
	}
}