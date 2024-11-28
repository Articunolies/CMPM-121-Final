class Tile extends Phaser.Physics.Arcade.Sprite
{
	static size = 4;	// add readonly when move to TS
	/*
		Bytes	Type	Attribute
		-------------------------
		0		Uint8	sunLevel
		1		Uint8	moisture
		2-3		Plant	plant
	*/

	constructor(scene, x, y, dataView) {
		// Set sprite
		super(scene, x, y, "dirt");
		scene.add.existing(this);
		scene.physics.add.existing(this);

		// Set data
		this.dataView = dataView;
		this.sunLevel = 0;
		this.moisture = 0;

		// Set plant
		this.plant = null;
	}

	get sunLevel() {
		return this.dataView.getUint8(0);
	}
	set sunLevel(level) {
		this.dataView.setUint8(0, level);
	}

	get moisture() {
		return this.dataView.getUint8(1);
	}
	set moisture(amount) {
		this.dataView.setUint8(1, amount);
	}
	increaseMoisture(amount) {
		this.moisture += amount;
	}

	get plant() {
		return this.plant;
	}
	set plant(type) {
		// Ensure type isn't null since programmers are allowed to write "tile.plant = null;"
		if (type) {
			const plantDataView = new DataView(this.dataView.buffer, this.dataView.byteOffset + Plant.size, Plant.size);
			this.plant = new Plant(plantDataView, type, this.scene, this.x, this.y - this.height/2);
		}
	}
}