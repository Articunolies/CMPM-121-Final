// debug with extreme prejudice
"use strict"

let config = {
	parent: "phaser-game",
	type: Phaser.CANVAS,
	fps: { forceSetTimeOut: true, target: 60 },
	render: {
		pixelArt: true  // prevent pixel art from getting blurred when scaled
	},
	width: 1920/8,
	height: 1080/8,
	zoom: 4,
	autoCenter: true,
	physics: {
		default: "arcade",
		arcade: {
			//debug: false
		}
	},
	scene: [Load, Game]
}

const game = new Phaser.Game(config);