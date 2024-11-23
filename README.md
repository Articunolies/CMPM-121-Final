# DevLog Entry 1- [11/22/2024]

## How we satisfied the software requirements
### [F0.a] 
In the game, the player's movement is controlled using the WASD keys. The movement functionality is implemented within the handlePlayerMovement() function. The player character moves at a constant velocity defined by the PLAYER_VELOCITY variable (set to 50). The game utilizes a grid system where each tile is TILE_SIZE pixels wide. The grid dimensions are dynamically calculated based on the canvas dimensions using CANVAS_WIDTH, CANVAS_HEIGHT, and TILE_SIZE. The player's position is synced with a hitbox that follows their movement, implemented in the makePlayerTileHitboxFollowPlayer() function.

### [F0.b] 
Time progresses manually in the game through a press of the right arrow key. The functionality is handled by an event listener tied to Phaser.Input.Keyboard.KeyCodes.RIGHT. Each turn progression triggers three processes: advancing the day counter, checking plant growth conditions, and verifying the win condition. These processes are encapsulated in dedicated functions such as setSunAndMoisture(), attemptToGrowPlant(), and checkWin().

### [F0.c] 
The player can reap or sow plants only when standing on a grid tile, determined by the getTilePlayerIsStandingOn() function. Sowing is triggered using the numeric keys (1 for grass and 2 for mushrooms), which invokes the plant() function. Reaping is implemented by pressing Backspace, which removes the plant on the current tile using the reap() function. These mechanics ensure interactivity is limited to the grid tile the player is standing on.

### [F0.d] 
Each tile in the grid has both sunLevel and moisture properties. These levels are updated each time time is advanced through random number generation and are normalized to a range between 0 and 5. The sunLevel resets to zero each day, reflecting the immediate use or loss of sunlight. In contrast, moisture accumulates over time, ensuring persistence as time progresses.

### [F0.e] 
The game includes two plant types: grass and mushroom. Each plant can be level 1 or 2. The level is tied to distinct sprites for visual feedback, updated in attemptToGrowPlant() based on growth conditions.

### [F0.f] 
Plants start at level 1 upon being planted and require specific sun and moisture thresholds to grow: grass needs sun and moisture levels of at least 3 and 5 to grow, and mushrooms need at least 1 and 15. Plants also cannot grow if they have certain neighbors: grass can't grow if there's a mushroom to its left, and mushrooms cant grow if there's grass above them.

### [F0.g] 
The player "beats" the game when they have 10 or more plants that are level 2 or higher. This win condition is monitored in the checkWin() function, which evaluates the winningPlants set to determine if it contains the required entries.

## Reflection
We made a major change during the process of developing our game. Our original language that we wanted to use was Typescript. The implementation and integration of Typescript with Phaser ended up being a lot more complicated and the documentation that we originally found had be outdated for years. Porting the game to Typescript is a complicated task that we need more time with so we believe Typscript shouldn't be the language with start with. We have made some progress on porting the game, so it isn't hopeless and can be done. We will continue to look into how to port our game into Typescript, but will keep developing in Javascript for now.

# Devlog Entry 0- [11/15/2024]

## Introducing the team
Tools Lead: Derek Simpson
Will research alternative tools, identify good ones, and help every other team member set them up on their own machine in the best 
configuration for this project. Might also establish the team’s coding style guidelines and help peers setup auto-formatting systems. 
Will provide support for systems like source control and automated deployment (if appropriate to the team’s approach).

Engine Lead: William Klunder
Will research alternative engines, get buy-in from teammates on the choice, and teach peers how to use it if it is new to them. 
This might involve making small code examples outside of the main game project to teach others. Will also establish standards for which kinds of code 
should be organized into which folders of the project and try to propose software designs that insulate the rest of the team from many details of the 
underlying engine.

Design Lead: Justin Lam
Responsible for setting the creative direction of the project, and establishing the look and feel of the game. Will make small art or 
code samples for others to help them contribute and maintain game content. Where the project might involve a domain-specific language, 
this person (who is still an engineer in this class) will lead the discussion as to what primitive elements the language needs to provide.
## Tools and materials

We will be using Phaser as our engine and the browser to deploy our game on the WEB. Phaser uses WebGL to deploy a game on the web. We intend to use phaser
because it is an easy and efficient engine that can help us develop our game. Phaser is also a known engine that doesn't require a lot of learning to use which makes
the researching technologies process much easier. Phaser also works well with github pages, so we are able to deploy and iterate our game well using github,

We will be using Javascript and JSON (for saving data and Tiled). Phaser can use Javascript to compile a web based game. Phaser also can take in a JSON file that
contains Tilemap information that references attached images. Javascript is also a well documented language with a lot of libraries that we can use to help us use
abstract ideas for our game. 

We will be using GitHub for version control. Visual Studio Code will be our choice of IDE because we can use its LiveServer extension to test and practice CI/CD. 
Tiled will be used to create tilemaps and levels that the player can interact with. We will also use GitHub pages to publish our game online. We chose
these tools because the entire team is skilled in using these tools to develop an interactive game. 

Typescript will be our alternate platform choice. Phaser can use Typescript to implement and compile video games using yarn and Nodejs. It also shouldn't be too hard of a switch 
since they are sister languages. We will still be using HTML to deploy it on the web, so our deployment system won't be comprimised by the language change. 


## Outlook

The three of us would like to develop a small but well-made game. Since we all have many other commitments, we will strive to write good, 
maintainable code during development so we can get more done with less time. We anticipate meeting design specifications to be hardest part of the project, 
and hope that our goal of writing maintainable code will help us overcome this. By approaching this project with the tools and materials selected above, 
we hope to learn how to do the things we've been learning throughout this class but now within a team setting.