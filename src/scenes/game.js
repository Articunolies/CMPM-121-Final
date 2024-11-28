class Game extends Phaser.Scene {

	/*
	for when we eventually get typescript to work
	
	interface Tile {	// 4 bytes
		plant: Plant;		// 2 bytes / 16 bits
		sunLevel: number;	// uint8 (8 bit)
		moisture: number;	// uint8 (8 bit)
		sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
	}

	interface Plant {	// 2 bytes
		type: string;	// uint8 (8 bit)
		level: number;	// uint 8 (8 bit)
		sprite: Phaser.GameObjects.Sprite;
	}


	*/

	// Parameters (can be changed)
	PLAYER_VELOCITY = 50;
	GRID_WIDTH = 6;
	GRID_HEIGHT = 6;
	GRID_OFFSET_X = 75;
	GRID_OFFSET_Y = 25;
	TILE_OFFSET_X = 1;
	TILE_OFFSET_Y = 1;

	// Constants (don't change)
	TILE_SIZE = 18;	// in pixels
	TILE_NUM_BYTES = 4;

	constructor() {
		super("gameScene");
	}

	create() {
		this.winningPlants = new Set(); // Using set to ensure no duplicate entries

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
		this.reapPlantKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);
		this.reapPlantKey.on("down", () => this.reap());
		this.plantGrassKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
		this.plantGrassKey.on("down", () => this.plant("grass1"));
		this.plantMushroomKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
		this.plantMushroomKey.on("down", () => this.plant("mushroom1"));
	}

	advanceTime() {
		// Loop over the grid
		this.grid.forEach((row, y) => {
			row.forEach((tile, x) => {
				this.setSunAndMoisture(tile);
				this.attemptToGrowPlant(x, y);
				this.checkWin(tile);
			});
		});

		// Give feedback
		console.log("Advancing time...");
	}
	setSunAndMoisture(tile) {
		tile.sunLevel = Math.floor(Math.random() * 5);	// between 0 and 5
		tile.moisture += Math.floor(Math.random() * 5);	// between 0 and 5
	}
	attemptToGrowPlant(x, y) {
		// Get tile and plant
		const tile = this.grid[y][x];
		const plant = tile.plant;

		// Ensure the tile has a plant
		if (plant == null) {
			return;
		}

		// Ensure plant isn't max level
		if (plant.level > 1) {
			return;
		}

		if (plant.type == "grass") {
			// Check if tile has a left neighbor
			if (x > 0) {
				// Ensure the left neighbor doesn't have a mushroom
				if (this.grid[y][x-1].plant != null && this.grid[y][x-1].plant.type == "mushroom") {
					return;
				}
			}
			// Ensure there's enough sun and moisture
			if (tile.sunLevel < 3 || tile.moisture < 5) {
				return;
			}

			// Decrease moisture
			tile.moisture -= 5;

			// Grow plant
			plant.level++;
			plant.sprite.setTexture(`${plant.type}${plant.level}`);
		}
		else if (plant.type == "mushroom") {
			// Check if tile has a top neighbor
			if (y > 0) {
				// Ensure the top neighbor doesn't have grass
				if (this.grid[y-1][x].plant != null && this.grid[y-1][x].plant.type == "grass") {
					return;
				}
			}
			// Ensure there's enough sun and moisture
			if (tile.sunLevel < 1 || tile.moisture < 15) {
				return;
			}

			// Decrease moisture
			tile.moisture -= 15;

			// Grow plant
			plant.level++;
			plant.sprite.setTexture(`${plant.type}${plant.level}`);
		}
	}
	checkWin(tile) {
		// Ensure the tile has a plant
		if (!tile.plant) {
			return;
		}
	
		// Ensure the plant is not already in the winning set
		if (this.winningPlants.has(tile.plant)) {
			return;
		}
	
		// Check plant level and add to the set if eligible
		if (tile.plant.level >= 2) {
			this.winningPlants.add(tile.plant);
	
			// Check for win condition
			if (this.winningPlants.size >= 10) {
				console.log("Player reached 10 or more plants with level 2 or higher");
			}
		}
	}
	
	reap() {
		// Attempt to get the tile the player is standing on
		const tile = this.getTilePlayerIsStandingOn();

		// Ensure the player is standing on a tile and it has a plant
		if (tile == null || tile.plant == null) {
			return;
		}

		// Remove plant tile from winning set
		if (this.winningPlants.has(tile.plant)){
			this.winningPlants.delete(tile.plant);
		}

		// Destroy and remove the tile's plant
		tile.plant.sprite.destroy();
		tile.plant = null;
	}
	plant(textureKey) {
		// Attempt to get the tile the player is standing on
		const tile = this.getTilePlayerIsStandingOn();

		// Ensure the player is standing on a tile and it doesn't have a plant
		if (tile == null || tile.plant != null) {
			return;
		}

		// Create the plant and give it to the tile
		tile.plant = {
			type: textureKey.replace(/\d+$/, ""), // Use regex to determine plant type
			level: 1,
			sprite: this.add.sprite(tile.sprite.x, tile.sprite.y - tile.sprite.height/2, textureKey)
		};
	}
	getTilePlayerIsStandingOn() {
		// Ensure the player has stood on a tile before
		if (this.tilePlayerWasLastStandingOnIndex == undefined) {
			return null;
		}

		// Get the tile the player was last standing on
		const tile = this.grid[this.tilePlayerWasLastStandingOnIndex.y][this.tilePlayerWasLastStandingOnIndex.x];

		// Ensure the player is still standing on that tile
		if (!this.overlaps(this.playerTileHitbox, tile.sprite)) {
			return null;
		}

		// Return the tile
		return tile;
	}
	overlaps(spriteA, spriteB) {
		return Phaser.Geom.Intersects.RectangleToRectangle(spriteA.getBounds(), spriteB.getBounds());
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
					sprite: this.physics.add.sprite(
						this.GRID_OFFSET_X + x*(this.TILE_OFFSET_X + this.TILE_SIZE),
						this.GRID_OFFSET_Y + y*(this.TILE_OFFSET_Y + this.TILE_SIZE),
						"dirt"
					)
				}
			}
		}

		const buffer = new ArrayBuffer(this.GRID_WIDTH * this.GRID_HEIGHT * this.TILE_NUM_BYTES);	// a byte array
		this.view = new DataView(buffer);
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
		<h1>Crops Life</h1>

		<h2>Instructions</h2>
		Grow ten level two plants to win! <br>
		Grass can't grow if there's a mushroom to its left <br>
		A mushroom can't grow if there's grass above it
		
		<h2>Controls</h2>
		Move: WASD<br>
		Advance Time: RIGHT<br>
		Reap: BACKSPACE<br>
		Plant Grass: 1<br>
		Plant Mushroom: 2<br>
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