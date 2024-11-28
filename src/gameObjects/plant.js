class Plant extends Phaser.GameObjects.Sprite
{
	static size = 2;	// add readonly when move to TS
	/*
		Bytes	Type	Attribute
		-------------------------
		0		Uint8	species
		1		Uint8	level
	*/
	static Species = {
		// we don't use 0 for a silly reason - if(0) returns false whereas if(1...n) returns true
		grass: 1,
		mushroom: 2
	};

	constructor(scene, x, y, dataView, species) {		
		// Set sprite
		super(scene, x, y);
		scene.add.existing(this);
		this.setTexture(this.getTexture(species));
		this.setDepth(Z_PLANT);
		
		// Set data
		this.dataView = dataView;
		this.species = species;
		this.level = 0;
	}
	getTexture(species) {
		if (species == Plant.Species.grass) {
			return "grass1";
		}
		else if (species == Plant.Species.mushroom) {
			return "mushroom1";
		}
	}

	get species() {
		return this.dataView.getUint8(0);
	}
	set species(species) {
		
		this.dataView.setUint8(0, species);
	}

	get level() {
		return this.dataView.getUint8(1);
	}
	set level(level) {
		this.dataView.setUint8(1, level);
	}
}