class Plant extends Phaser.GameObjects.Sprite
{
	static size = 2;	// add readonly when move to TS
	/*
		Bytes	Type	Attribute
		-------------------------
		0		Uint8	type
		1		Uint8	level
	*/
	static types =
	{
		grass: 0,
		mushroom: 1
	};

	constructor(scene, x, y, dataView, type)
	{
		// Set sprite
		super(scene, x, y, "dirt");
		scene.add.existing(this);
		scene.physics.add.existing(this);
		this.setDepth(Z_PLANT);

		// Set data
		this.dataView = dataView;
		this.type = type;
		this.level = 0;
	}

	get type() {
		return this.dataView.getUint8(0);
	}
	set type(type) {
		this.dataView.setUint8(0, type);
	}

	get level() {
		return this.dataView.getUint8(1);
	}
	set level(level) {
		this.dataView.setUint8(1, level);
	}
	levelUp() {
		this.level++;
	}
}