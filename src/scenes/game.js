class Game extends Phaser.Scene {
	constructor() {
		super("gameScene");
	}
	create() {
		this.setInput();
		this.displayControls();
		this.createEventBus();
		this.player = new Player(this, 150, 50);
		this.grid = new Grid(this, 100, 50, 2, 2, 1, 1);
		this.gridDatas = [this.grid.data.slice(0)];
		this.redoGridDatas = [];
		this.winningPlants = new Set();

		// about winningPlants:
		// tracks the plants that are contributing to the win condition
		// is a set to ensure there are no duplicate entries
	}
	update() {
		this.player.update();
	}

	setInput() {
		// Time
		this.advanceTimeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);
		this.advanceTimeKey.on("down", () => this.advanceTime());

		// Undo & Redo
		this.undoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
		this.undoKey.on("down", () => this.undo());
		this.redoKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		this.redoKey.on("down", () => this.redo());

		// Saving & Loading
		this.saveToSlot1Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SEMICOLON);			// ;
		this.saveToSlot1Key.on("down", () => this.saveToSlot(1));
		this.saveToSlot2Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.QUOTES);			// '
		this.saveToSlot2Key.on("down", () => this.saveToSlot(2));
		this.loadSlot1Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.OPEN_BRACKET);		// [
		this.loadSlot1Key.on("down", () => this.loadSlot(1));
		this.loadSlot2Key = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CLOSED_BRACKET);		// ]
		this.loadSlot2Key.on("down", () => this.loadSlot(2));
		this.loadAutoSaveKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACK_SLASH);		// \
		this.loadAutoSaveKey.on("down", () => this.loadSlot('A'));

		// Debug
		this.debugKey1 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
		this.debugKey1.on("down", () => {
			console.log(this.grid.data);
			console.log(this.grid.tiles[0][0].plant.dataView.buffer);
			//console.log(this.gridDatas.length);
			//console.log(this.redoGridDatas.length);
		});
		this.debugKey2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
		this.debugKey2.on("down", () => {
			localStorage.clear();
			console.log("CLEARED LOCAL STORAGE");
		});
	}

	advanceTime() {
		// Iterate over the grid's tiles
		this.grid.tiles.forEach((row, y) => {
			row.forEach((tile, x) => {
				tile.sunLevel = Math.floor(Math.random() * 5);	// between 0 and 5
				tile.moisture += Math.floor(Math.random() * 5);	// between 0 and 5
				tile.plant.tryToGrow();
				this.updateWinProgress(tile.plant);
			});
		});
		this.eventBus.emit("grid changed");

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
			if (this.winningPlants.size >= this.grid.numTiles) {
				console.log("You won!");
			}
		}
	}

	undo() {
		// Ensure we're not popping off the initial state of the game
		// because updateGameState() requires at least one state to be in gridDatas
		if (this.gridDatas.length > 1) {
			this.redoGridDatas.push(this.gridDatas.pop());
			this.updateGameState();

			// Give feedback
			console.log("Undoed");
		}
		else {
			console.log("Nothing to undo");
		}
	}
	redo() {

	}
	updateGameState() {
		// Load data
		const dataView1 = new DataView(this.grid.data);
		const dataview2 = new DataView(this.gridDatas[this.gridDatas.length-1]);
		for (let i = 0; i < dataView1.byteLength; i++) {
			dataView1.setUint8(i, dataview2.getUint8(i));
		}

		// Reload plants
		this.grid.tiles.forEach(row => {
			row.forEach(tile => {
				if (tile.plant.exists) {
					tile.plant.updateTexture();
				}
				tile.plant.setVisible(tile.plant.exists);
			});
		});
	}

	saveToSlot(slot) {
		const intArray = [];
		const dataView = new DataView(this.grid.data);
		for (let i = 0; i < dataView.byteLength; i++) {
			intArray[i] = dataView.getUint8(i);
		}
		const string = JSON.stringify(intArray);
		localStorage.setItem(`slot${slot}`, string);

		// Give feedback
		if (slot == 'A') {
			console.log("Auto saved");
		}
		else {
			console.log(`Saved to slot ${slot}`);
		}
	}
	loadSlot(slot) {
		// Ensure the slot has a save
		if (!localStorage.getItem(`slot${slot}`)) {
			if (slot == 'A') {
				console.log(`No auto save found`);
			}
			else {
				console.log(`Slot ${slot} is empty`);
			}
			return;
		}

		// Load slot
		const string = localStorage.getItem(`slot${slot}`);
		const intArray = JSON.parse(string);
		const dataView = new DataView(this.grid.data);
		for (let i = 0; i < dataView.byteLength; i++) {
			dataView.setUint8(i, intArray[i]);
		}

		// Reload plants
		this.grid.tiles.forEach(row => {
			row.forEach(tile => {
				if (tile.plant.exists) {
					tile.plant.updateTexture();
				}
				tile.plant.setVisible(tile.plant.exists);
			});
		});

		// Give feedback
		if (slot == 'A') {
			console.log("Loaded auto save");
		}
		else {
			console.log(`Loaded slot ${slot}`);
		}
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

	createEventBus() {
		this.eventBus = new Phaser.Events.EventEmitter();
		this.eventBus.on("grid changed", () => {
			const data = this.grid.data.slice(0);	// make a copy
			this.gridDatas.push(data)
			this.saveToSlot('A')
		});
	}
}