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
		this.gridStates = [this.grid.state.slice(0)];	// set the first state to the state the game starts out in
		this.redoGridStates = [];
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
			console.log(this.grid.state);
		});
		this.debugKey2 = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.G);
		this.debugKey2.on("down", () => {
			localStorage.clear();
			console.log("CLEARED LOCAL STORAGE");
		});
	}
	displayControls() {
		document.getElementById("description").innerHTML = `
		<h1>Crops Life</h1>

		<h2>Instructions</h2>
		Grow a max level plant on each tile to win! <br>
		Plants have a max level of 2 <br>
		Grass cannot grow if there's a mushroom to its left <br>
		A mushroom cannot grow if there's grass above it <br>
		This game autosaves every time after planting, reaping, or advancing time
		
		<h2>Controls</h2>
		Move: ( WASD ) <br>
		Plant Grass: ( 1 ) <br>
		Plant Mushroom: ( 2 ) <br>
		Reap: ( R ) <br>
		Advance Time: ( T ) <br>
		Undo: ( LEFT ) <br>
		Redo: ( RIGHT ) <br>
		Save to Slot 1: ( ; ) <br>
		Save to Slot 2: ( ' ) <br>
		Load Slot 1: ( [ ) <br>
		Load Slot 2: ( ] ) <br>
		Load Auto Save: ( \\ )
		`;
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
		if (this.gridStates.length > 1) {
			this.redoGridStates.push(this.gridStates.pop());
			this.loadCurrentGridState();

			// Give feedback
			console.log("Undoed");
		}
		else {
			console.log("Nothing to undo");
		}
	}
	redo() {
		const data = this.redoGridStates.pop();
		if (data) {
			this.gridStates.push(data);
			this.loadCurrentGridState();

			// Give feedback
			console.log("Redoed");
		}
		else {
			console.log("Nothing to redo");
		}
	}
	loadCurrentGridState() {
		// Make old become new via copy
		const oldState = new DataView(this.grid.state);
		const newState = new DataView(this.gridStates[this.gridStates.length-1]);
		for (let i = 0; i < oldState.byteLength; i++) {
			oldState.setUint8(i, newState.getUint8(i));
		}

		// Reload plants
		this.grid.tiles.forEach(row => row.forEach(tile => tile.plant.reload()));
	}

	saveToSlot(slot) {
		// Initialize save
		const save = {
			gridStates: [],
			redoGridStates: []
		};

		// Populate save
		this.gridStates.forEach((state, i) => save.gridStates[i] = this.byteArrayToIntArray(state));
		this.redoGridStates.forEach((state, i) => save.redoGridStates[i] = this.byteArrayToIntArray(state));

		// Save to slot
		localStorage.setItem(`slot${slot}`, JSON.stringify(save));

		// Give feedback
		if (slot != 'A') {
			console.log(`Saved to slot ${slot}`);
		}
	}
	byteArrayToIntArray(buffer) {
		const result = [];
		const dataView = new DataView(buffer);
		for (let i = 0; i < dataView.byteLength; i++) {
			result[i] = dataView.getUint8(i);
		}
		return result;
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

		// Get save
		const save = JSON.parse(localStorage.getItem(`slot${slot}`));

		// Reset gridStates and redoGridStates
		// if either has more elements than their counterpart in save
		// then there will be some elements from the past after the load
		// so get rid of all of the elements from the past and then load
		this.gridStates = [];
		this.redoGridStates = [];

		// Populate gridStates and redoGridStates
		save.gridStates.forEach((intArray, i) => this.gridStates[i] = this.intArrayToByteArray(intArray));
		save.redoGridStates.forEach((intArray, i) => this.redoGridStates[i] = this.intArrayToByteArray(intArray));

		// Load current grid state
		this.loadCurrentGridState();

		// Give feedback
		if (slot == 'A') {
			console.log("Loaded auto save");
		}
		else {
			console.log(`Loaded slot ${slot}`);
		}
	}
	intArrayToByteArray(intArray) {
		const result = new ArrayBuffer(intArray.length);
		const dataView = new DataView(result);
		for (let i = 0; i < intArray.length; i++) {
			dataView.setUint8(i, intArray[i]);
		}
		return result;
	}

	createEventBus() {
		this.eventBus = new Phaser.Events.EventEmitter();
		this.eventBus.on("grid changed", () => {
			this.gridStates.push(this.grid.state.slice(0));	// get a copy
			this.redoGridStates = [];	// clear
			this.saveToSlot('A');
		});
	}
}