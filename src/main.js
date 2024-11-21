// debug with extreme prejudice
"use strict"

let config = {
	parent: "phaser-game",
	type: Phaser.CANVAS,
	fps: { forceSetTimeOut: true, target: 60 },
	render: {
		pixelArt: true  // prevent pixel art from getting blurred when scaled
	},
	width: 1920/4,
	height: 1080/4,
	zoom: 2,
	autoCenter: true,
	physics: {
		default: "arcade",
		arcade: {
			gravity: {
				x: 0,
				y: 0
			},
			debug: true
		}
	},
	scene: [Load, Game]
}

const game = new Phaser.Game(config);