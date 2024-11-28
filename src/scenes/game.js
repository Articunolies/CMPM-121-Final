class Game extends Phaser.Scene {
	// Parameters (can be changed)
	PLAYER_VELOCITY = 50;
	GRID_WIDTH = 2;
	GRID_HEIGHT = 2;
	GRID_OFFSET_X = 100;
	GRID_OFFSET_Y = 50;
	TILE_OFFSET_X = 1;
	TILE_OFFSET_Y = 1;

	// Constants (don't change)
	TILE_SIZE = 18;	// in pixels

	constructor() {
		super("gameScene");
	}

	create() {
		this.winningPlants = new Set(); // Using set to ensure no duplicate entries

		this.createInput();
		this.createPlayer();
		this.createGrid();
		this.displayControls();
	}

    update() {
		this.handlePlayerMovement();
		this.makePlayerTileHitboxFollowPlayer();
    }

	createInput() {
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
		this.plantGrassKey.on("down", () => this.plant(Plant.Species.grass));
		this.plantMushroomKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
		this.plantMushroomKey.on("down", () => this.plant(Plant.Species.mushroom));

		// Debug
		this.debugKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
		this.debugKey.on("down", () => {
			console.log(this.grid[0][0].plant);
			//console.log(this.gridData);
		});
	}

	advanceTime() {
		// Loop over the grid
		this.grid.forEach((row, y) => {
			row.forEach((tile, x) => {
				tile.sunLevel = Math.floor(Math.random() * 5);	// between 0 and 5
				tile.moisture += Math.floor(Math.random() * 5);	// between 0 and 5
				this.attemptToGrowPlant(x, y, tile, tile.plant);
				//this.checkWin(tile);
			});
		});

		// Give feedback
		console.log("Advancing time...");
	}
	attemptToGrowPlant(x, y, tile, plant) {
		// Ensure the tile has a plant
		if (!plant) {
			return;
		}

		// Ensure plant isn't max level
		if (plant.level >= 2) {
			return;
		}

		// Attempt to grow plant
		if (plant.species == Plant.Species.grass) {
			this.attemptToGrowGrass(x, y, tile, plant);
		}
		else if (plant.species == Plant.Species.mushroom) {
			this.attemptToGrowMushroom(x, y, tile, plant);
		}
	}
	attemptToGrowGrass(x, y, tile, plant) {
		// Check if tile has a left neighbor
		if (x > 0) {
			// Ensure the left neighbor doesn't have a mushroom
			if (this.grid[y][x-1].plant && this.grid[y][x-1].plant.species == Plant.Species.mushroom) {
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
		plant.setTexture(plant.getTexture());
	}
	attemptToGrowMushroom(x, y, tile, plant) {
		// Check if tile has a top neighbor
		if (y > 0) {
			// Ensure the top neighbor doesn't have grass
			if (this.grid[y-1][x].plant && this.grid[y-1][x].plant.species == Plant.Species.grass) {
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
		plant.setTexture(plant.getTexture());
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
		// Get the tile the player is standing on
		const tile = this.getTilePlayerIsStandingOn();
		if (!tile) {
			return;
		}

		// Remove plant tile from winning set
		/*
		if (this.winningPlants.has(tile.plant)){
			this.winningPlants.delete(tile.plant);
		}
		*/

		// Reap plant
		tile.reap();
	}
	plant(species) {
		// Get the tile the player is standing on
		const tile = this.getTilePlayerIsStandingOn();
		if (!tile) {
			return;
		}

		// Plant plant
		tile.plant = species;
	}
	getTilePlayerIsStandingOn() {
		// Ensure the player has stood on a tile before
		if (!this.tilePlayerWasLastStandingOnIndex) {
			return undefined;
		}

		// Get the tile the player was last standing on
		const tile = this.grid[this.tilePlayerWasLastStandingOnIndex.y][this.tilePlayerWasLastStandingOnIndex.x];

		// Ensure the player is still standing on that tile
		if (!this.overlaps(this.playerTileHitbox, tile)) {
			return undefined;
		}

		// Return the tile
		return tile;
	}
	overlaps(spriteA, spriteB) {
		return Phaser.Geom.Intersects.RectangleToRectangle(spriteA.getBounds(), spriteB.getBounds());
	}

	createGrid() {
		// Create gridData
		// holds the data for the Tiles in this.grid in array of structs (AoS) format
		this.gridData = new ArrayBuffer(this.GRID_WIDTH * this.GRID_HEIGHT * Tile.size);	// a byte array

		// Create grid
		// a 2D array of Tile instances
		this.grid = [];
		for (let y = 0; y < this.GRID_HEIGHT; y++) {
			this.grid[y] = [];
			for (let x = 0; x < this.GRID_WIDTH; x++) {
				// Convert 2D array index to 1D
				const i = y * this.GRID_WIDTH + x;

				// Create tile DataView
				const dataView = new DataView(this.gridData, i * Tile.size, Tile.size);

				// Create tile
				const tile = new Tile(
					this,
					this.GRID_OFFSET_X + x*(this.TILE_OFFSET_X + this.TILE_SIZE),
					this.GRID_OFFSET_Y + y*(this.TILE_OFFSET_Y + this.TILE_SIZE),
					dataView
				);

				// Create overlap between tile and player
				this.physics.add.overlap(
					tile,
					this.playerTileHitbox,
					() => this.tilePlayerWasLastStandingOnIndex = { x: x, y: y }
				);

				// Add tile to grid
				this.grid[y][x] = tile;
			}
		}
	}

	createPlayer() {
		// Sprite
		this.player = this.physics.add.sprite(150, 50, "player");
		this.player.setCollideWorldBounds(true);
		this.player.setDepth(Z_PLAYER);

		// Tile Hitbox
		// ensures the player can only reap/sow plants on the tile they're standing on
		this.playerTileHitbox = this.add.zone(0, 0, 1, 1);
		this.physics.add.existing(this.playerTileHitbox);
	}

	displayControls() {
		const controls = `
		<h1>Crops Life</h1>

		<h2>Instructions</h2>
		Grow ten level two plants to win! <br>
		Grass cannot grow if there's a mushroom to its left <br>
		A mushroom cannot grow if there's grass above it
		
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