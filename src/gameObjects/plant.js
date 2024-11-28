class Plant extends Phaser.Physics.Arcade.Sprite
{
	static size = 2;	// add readonly when move to TS
	/*
		Bytes	Type	Attribute
		-------------------------
		0		UInt8	type
		1		UInt8	level
	*/
	static types =
	{
		grass: 0,
		mushroom: 1
	};

	constructor(dataView, type, scene, x, y)
	{
		// Set data
		this.dataView = dataView;
		this.type = type;
		this.level = 0;

		// Set sprite
		super(scene, x, y, "dirt");
		scene.add.existing(this);
		scene.physics.add.existing(this);
	}

	get type() {
		return this.dataView.getUInt8(0);
	}
	set type(type) {
		this.dataView.setUInt8(0, type);
	}

	get level() {
		return this.dataView.getUInt8(1);
	}
	set level(level) {
		this.dataView.setUInt8(1, level);
	}
	levelUp() {
		this.level++;
	}
}