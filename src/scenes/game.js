class Game extends Phaser.Scene {
	// Parameters (can be changed)
	PLAYER_VELOCITY = 50;
	GRID_WIDTH = 2;
	GRID_HEIGHT = 2;
	get NUM_TILES() { return this.GRID_WIDTH * this.GRID_HEIGHT; }
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
		this.createInput();
		this.createPlayer();
		this.createGrid();
		this.displayControls();

		this.winningPlants = new Set();
		// tracks the plants that are contributing to the win condition
		// is a set to ensure there are no duplicate entries
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
		this.advanceTimeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
		this.advanceTimeKey.on("down", () => this.advanceTime());

		// Planting
		this.reapPlantKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
		this.reapPlantKey.on("down", () => this.reap());
		this.plantGrassKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE);
		this.plantGrassKey.on("down", () => this.plant(Plant.SPECIES.GRASS));
		this.plantMushroomKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO);
		this.plantMushroomKey.on("down", () => this.plant(Plant.SPECIES.MUSHROOM));

		// Saving & Loading
		this.saveToSlot1Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.OPEN_BRACKET);		// [
		this.saveToSlot1Key.on("down", () => this.saveToSlot(1));
		this.saveToSlot2Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CLOSED_BRACKET);	// ]
		//this.saveToSlot2Key.on("down", () => console.log("hi"));
		this.loadSlot1Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SEMICOLON);			// ;
		this.loadSlot1Key.on("down", () => this.loadSlot(1));
		this.loadSlot2Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.QUOTES);				// '
		//this.loadSlot2Key.on("down", () => console.log("hi"));

		// Debug
		this.debugKey1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
		this.debugKey1.on("down", () => {
			console.log(this.gridData);
			//console.log(this.grid[0][0].dataView.getUint8(2));
		});
		this.debugKey2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
		this.debugKey2.on("down", () => {
			localStorage.clear();
			console.log("CLEARED LOCAL STORAGE");
		});
	}

	advanceTime() {
		// Loop over the grid
		this.grid.forEach((row, y) => {
			row.forEach((tile, x) => {
				tile.sunLevel = Math.floor(Math.random() * 5);	// between 0 and 5
				tile.moisture += Math.floor(Math.random() * 5);	// between 0 and 5
				tile.plant.tryToGrow();
				this.updateWinProgress(tile.plant);
			});
		});

		// Give feedback
		console.log("Advanced time");
	}
	updateWinProgress(plant) {
		// Ensure the plant is not already in the winning set
		if (this.winningPlants.has(plant)) {
			return;
		}

		// Add the plant to winningPlants if it's at max level
		if (plant.level >= Plant.MAX_LEVEL) {
			this.winningPlants.add(plant);
	
			// Check if the player won
			if (this.winningPlants.size >= this.NUM_TILES) {
				console.log("You won!");
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
		if (this.winningPlants.has(tile.plant)){
			this.winningPlants.delete(tile.plant);
		}

		// Reap plant
		tile.plant.remove();
	}
	plant(species) {
		// Get the tile the player is standing on
		const tile = this.getTilePlayerIsStandingOn();
		if (!tile) {
			return;
		}

		// Plant plant
		tile.plant.become(species);
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

	saveToSlot(slot) {
		// Save to slot
		localStorage.setItem(`slot${slot}`, this.byteArrayToIntArrayAsString(this.gridData));

		// Give feedback
		console.log(`Saved to slot ${slot}`);
	}
	byteArrayToIntArrayAsString(buffer) {
		const result = [];
		const dataView = new DataView(buffer);
		for (let i = 0; i < dataView.byteLength; i++) {
			result[i] = dataView.getUint8(i);
		}
		return JSON.stringify(result);
	}
	loadSlot(slot) {
		// Ensure the slot has a save
		if (!localStorage.getItem(`slot${slot}`)) {
			console.log(`Slot ${slot} is empty`);
			return;
		}

		// Load slot
		const intArray = JSON.parse(localStorage.getItem(`slot${slot}`));
		const dataView = new DataView(this.gridData);
		for (let i = 0; i < dataView.byteLength; i++) {
			dataView.setUint8(i, intArray[i]);
		}

		// Reload plants
		this.reloadPlants();

		// Give feedback
		console.log(`Loaded slot ${slot}`);
	}
	reloadPlants() {
		// Loop over the grid
		this.grid.forEach((row, y) => {
			row.forEach((tile, x) => {
				tile.removePlant();
				if (tile.dataView.getUint8(2)) {
					tile.plant = tile.dataView.getUint8(2);
				}
			});
		});
	}

	createGrid() {
		// Create gridData
		// holds the data for the Tiles (and Plants) in this.grid in array of structs (AoS) format
		this.gridData = new ArrayBuffer(this.NUM_TILES * Tile.SIZE);	// a byte array

		// Create grid
		// a 2D array of Tiles
		this.grid = [];
		for (let y = 0; y < this.GRID_HEIGHT; y++) {
			this.grid[y] = [];
			for (let x = 0; x < this.GRID_WIDTH; x++) {
				// Convert 2D array index to 1D
				const i = y * this.GRID_WIDTH + x;

				// Create tile
				const tile = new Tile(
					this,
					this.GRID_OFFSET_X + x*(this.TILE_OFFSET_X + this.TILE_SIZE),
					this.GRID_OFFSET_Y + y*(this.TILE_OFFSET_Y + this.TILE_SIZE),
					this.grid,
					{ x: x, y: y },
					new DataView(this.gridData, i * Tile.SIZE, Tile.SIZE)
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
		this.player.setDepth(2);

		// Tile Hitbox
		// ensures the player can only reap/sow plants on the tile they're standing on
		this.playerTileHitbox = this.add.zone(0, 0, 1, 1);
		this.physics.add.existing(this.playerTileHitbox);
	}

	displayControls() {
		const controls = `
		<h1>Crops Life</h1>

		<h2>Instructions</h2>
		Grow a max level plant on each tile to win! <br>
		Plants have a max level of 2 <br>
		Grass cannot grow if there's a mushroom to its left <br>
		A mushroom cannot grow if there's grass above it
		
		<h2>Controls</h2>
		Move: ( WASD )<br>
		Plant Grass: ( 1 )<br>
		Plant Mushroom: ( 2 )<br>
		Reap: ( R )<br>
		Advance Time: ( T )<br>
		Save to Slot 1: ( [ )<br>
		Save to Slot 2: ( ] )<br>
		Load Slot 1: ( ; )<br>
		Load Slot 2: ( ' )
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