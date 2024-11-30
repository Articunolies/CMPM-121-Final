class Grid {
	constructor(scene, x, y, width, height, tileOffsetX, tileOffsetY) {
		// Set dimensions
		this.width = width;
		this.height = height;

		// Create data
		// holds the data for this grid's Tiles (and Plants) in array of structs (AoS) format
		this.data = new ArrayBuffer(this.numTiles * Tile.SIZE);	// a byte array

		// Create tiles
		// a 2D array of Tiles
		this.tiles = [];
		for (let tileY = 0; tileY < height; tileY++) {
			this.tiles[tileY] = [];
			for (let tileX = 0; tileX < width; tileX++) {
				// Convert 2D array index to 1D
				const i = tileY * width + tileX;

				// Create tile
				const tile = new Tile(
					scene,
					x + tileX * (tileOffsetX + Tile.WIDTH),
					y + tileY * (tileOffsetY + Tile.WIDTH),
					this.tiles,
					{ x: tileX, y: tileY },
					new DataView(this.data, i * Tile.SIZE, Tile.SIZE)
				);

				// Create overlap between tile and player
				scene.physics.add.overlap(
					tile,
					scene.player.tileHitbox,
					() => scene.player.tileStandingOn = tile
				);

				// Add tile to grid
				this.tiles[tileY][tileX] = tile;
			}
		}
	}

	get numTiles() {
		return this.width * this.height;
	}
}