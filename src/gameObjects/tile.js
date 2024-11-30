class Tile extends Phaser.Physics.Arcade.Sprite
{
	static DEPTH = 0;
	static DIRECTIONS = {
		UP: { x: 0, y: -1 },
		DOWN: { x: 0, y: 1 },
		LEFT: { x: -1, y: 0 },
		RIGHT: { x: 1, y: 0 }
	};

	static SIZE = 4;
	/*
		Bytes	Type	Attribute
		-------------------------
		0		Uint8	sunLevel
		1		Uint8	moisture
		2-3		Plant	plant
	*/
	static OFFSET_SUN_LEVEL = 0;
	static OFFSET_MOISTURE = 1;

	constructor(scene, x, y, grid, position, dataView) {
		// Set sprite
		super(scene, x, y, "dirt");
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.setDepth(Tile.DEPTH);

		// Set grid
		this.grid = grid;
		this.position = position;

		// Set data
		this.dataView = dataView;
		this.sunLevel = 0;
		this.moisture = 0;

		// Set plant
		const plantDataView = new DataView(dataView.buffer, dataView.byteOffset + Plant.SIZE, Plant.SIZE);
		this.plant = new Plant(scene, x, y - this.height/2, this, plantDataView);
	}

	get sunLevel() {
		return this.dataView.getUint8(Tile.OFFSET_SUN_LEVEL);
	}
	set sunLevel(level) {
		this.dataView.setUint8(Tile.OFFSET_SUN_LEVEL, level);
	}

	get moisture() {
		return this.dataView.getUint8(Tile.OFFSET_MOISTURE);
	}
	set moisture(amount) {
		this.dataView.setUint8(Tile.OFFSET_MOISTURE, amount);
	}

	getNeighbor(direction) {
		return this.grid[this.position.x + direction.x][this.position.y + direction.y];
	}
}