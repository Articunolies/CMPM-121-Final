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
		this.setDepth(Z_TILE);

		// Set data
		this.dataView = dataView;
		this.sunLevel = 0;
		this.moisture = 0;

		// Set plant
		this._plant = undefined;	// won't need to use the _ naming when we move to TS, just make this field private and the getter/setter public
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

	get plant() {
		return this._plant;
	}
	set plant(species) {
		// Only make a new plant if this tile doesn't already have one and species is defined
		if (!this.plant && species) {
			const plantDataView = new DataView(this.dataView.buffer, this.dataView.byteOffset + Plant.size, Plant.size);
			this._plant = new Plant(this.scene, this.x, this.y - this.height/2, plantDataView, species);
		}
		// Else set plant to whatever value species is (if using this class properly it should always just be undefined)
	}
	reap() {
		if (this.plant) {
			this.plant.destroy();
			this.plant = undefined;
		}
	}
	attemptToGrowPlant() {
		if (this.plant) {
			this.plant.attemptToGrow();
		}
	}
}