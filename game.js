// The Adventures of Kosh - Web Version
// A Pokemon-style quest game featuring a little black cat

kaboom({
    width: 800,
    height: 600,
    scale: 1,
    background: [20, 20, 30],
});

// Load all sprites
loadSprite('kosh_idle', 'assets/sprites/kosh_idle.png');
loadSprite('kosh_meow', 'assets/sprites/kosh_meow.png');
loadSprite('kosh_paw_tap', 'assets/sprites/kosh_paw_tap.png');
loadSprite('kosh_zoomies', 'assets/sprites/kosh_zoomies.png');
loadSprite('kosh_sleeping', 'assets/sprites/kosh_sleeping.png');
loadSprite('dad_sleeping', 'assets/sprites/dad_sleeping.png');
loadSprite('dad_awake', 'assets/sprites/dad_awake.png');
loadSprite('window_closed', 'assets/sprites/window_closed.png');
loadSprite('window_open', 'assets/sprites/window_open.png');
loadSprite('bedroom_bg', 'assets/sprites/bedroom_bg.png');
loadSprite('food_bowl_empty', 'assets/sprites/food_bowl_empty.png');
loadSprite('food_bowl_full', 'assets/sprites/food_bowl_full.png');
loadSprite('easter_egg', 'assets/sprites/easter_egg.png');
loadSprite('raccoon_toy', 'assets/sprites/raccoon_toy.png');
loadSprite('wardrobe', 'assets/sprites/wardrobe.png');

// Game configuration
const CONFIG = {
    player: {
        name: 'Kosh',
        startingEnergy: 100,
        maxEnergy: 100,
    },
    windowWitch: {
        tactics: {
            meow: {
                name: 'Meow Loudly',
                successRate: 0.6,
                energyCost: 5,
                description: 'Classic approach',
            },
            pawTap: {
                name: 'Gentle Paw Taps',
                successRate: 0.7,
                energyCost: 3,
                description: 'Soft and persistent',
            },
            zoomies: {
                name: '3 AM Zoomies',
                successRate: 0.8,
                energyCost: 15,
                description: 'Maximum chaos',
            },
        },
        windowConvinceRate: 0.9,
    },
};

// Global game state
const gameState = {
    player: {
        energy: CONFIG.player.startingEnergy,
        maxEnergy: CONFIG.player.maxEnergy,
        completedQuests: new Set(),
        easterEggFound: false,
    },
    currentQuest: null,
};

// Helper function to draw text with shadow
function drawTextShadow(txt, x, y, options = {}) {
    const shadowOffset = 2;
    // Draw shadow
    drawText({
        text: txt,
        pos: vec2(x + shadowOffset, y + shadowOffset),
        ...options,
        color: rgb(0, 0, 0),
    });
    // Draw main text
    drawText({
        text: txt,
        pos: vec2(x, y),
        ...options,
    });
}

// Helper to draw menu
function drawMenu(title, options, selectedIndex, y = 250) {
    if (title) {
        drawTextShadow(title, width() / 2, y - 60, {
            size: 32,
            align: 'center',
            color: rgb(255, 255, 255),
        });
    }

    options.forEach((option, i) => {
        const prefix = i === selectedIndex ? '> ' : '  ';
        const color = i === selectedIndex ? rgb(255, 200, 50) : rgb(255, 255, 255);

        drawTextShadow(prefix + option, width() / 2 - 150, y + i * 40, {
            size: 24,
            color: color,
        });
    });
}

// Helper to draw energy bar
function drawEnergyBar(current, maximum, x = 50, y = 20) {
    const barWidth = 200;
    const barHeight = 25;

    // Background
    drawRect({
        pos: vec2(x, y),
        width: barWidth,
        height: barHeight,
        color: rgb(100, 100, 120),
    });

    // Energy fill
    const fillWidth = (current / maximum) * (barWidth - 4);
    const fillColor = current > maximum * 0.5 ? rgb(50, 255, 100) : rgb(255, 50, 50);

    drawRect({
        pos: vec2(x + 2, y + 2),
        width: fillWidth,
        height: barHeight - 4,
        color: fillColor,
    });

    // Text
    drawTextShadow(`Energy: ${current}/${maximum}`, x + barWidth + 10, y + 5, {
        size: 18,
    });
}

// ===========================
// MAIN MENU SCENE
// ===========================
scene('mainMenu', () => {
    let selectedIndex = 0;
    const menuOptions = ['New Game', 'Continue', 'Quit'];

    onDraw(() => {
        // Title (split into two lines to prevent cutoff)
        drawTextShadow('THE ADVENTURES', width() / 2, 80, {
            size: 32,
            align: 'center',
            color: rgb(255, 200, 50),
        });

        drawTextShadow('OF KOSH', width() / 2, 120, {
            size: 32,
            align: 'center',
            color: rgb(255, 200, 50),
        });

        drawTextShadow('A tale of a little black cat', width() / 2, 160, {
            size: 18,
            align: 'center',
            color: rgb(255, 220, 80),
        });

        // Menu
        drawMenu('', menuOptions, selectedIndex, 300);
    });

    onKeyPress('up', () => {
        selectedIndex = (selectedIndex - 1 + menuOptions.length) % menuOptions.length;
    });

    onKeyPress('down', () => {
        selectedIndex = (selectedIndex + 1) % menuOptions.length;
    });

    onKeyPress('enter', () => {
        const choice = menuOptions[selectedIndex];
        if (choice === 'New Game') {
            // Reset player state
            gameState.player.energy = CONFIG.player.startingEnergy;
            gameState.player.completedQuests.clear();
            go('overworld');
        } else if (choice === 'Continue') {
            // Load from localStorage if available
            const saved = localStorage.getItem('koshSave');
            if (saved) {
                const data = JSON.parse(saved);
                gameState.player.energy = data.energy;
                gameState.player.completedQuests = new Set(data.completedQuests);
                gameState.player.easterEggFound = data.easterEggFound || false;
                go('overworld');
            }
        } else if (choice === 'Quit') {
            // Can't really quit in browser, just show message
            debug.log('Thanks for playing!');
        }
    });
});

// ===========================
// OVERWORLD SCENE
// ===========================
scene('overworld', () => {
    let selectedIndex = 0;
    let menuOptions = [];

    // Build menu
    function updateMenu() {
        menuOptions = [];

        // Check available quests
        if (!gameState.player.completedQuests.has('window_witch')) {
            menuOptions.push('Start: Window Witch');
        } else {
            menuOptions.push('[DONE] Window Witch');
        }

        if (!gameState.player.completedQuests.has('da_wire')) {
            menuOptions.push('Start: Da Wire');
        } else {
            menuOptions.push('[DONE] Da Wire');
        }

        if (!gameState.player.completedQuests.has('in_and_out')) {
            menuOptions.push('Start: In and Out');
        } else {
            menuOptions.push('[DONE] In and Out');
        }

        // Secret quest (only appears if easter egg found)
        if (gameState.player.easterEggFound) {
            if (!gameState.player.completedQuests.has('witch_in_wardrobe')) {
                menuOptions.push('🥚 Start: Witch in the Wardrobe');
            } else {
                menuOptions.push('🥚 [DONE] Witch in the Wardrobe');
            }
        }

        menuOptions.push('Save Game');
        menuOptions.push('Main Menu');
    }

    updateMenu();

    // Kosh sprite animation
    let koshFrame = 0;
    let frameTime = 0;

    onUpdate(() => {
        frameTime += dt();
        if (frameTime > 0.5) {
            frameTime = 0;
            koshFrame = (koshFrame + 1) % 2;
        }
    });

    onDraw(() => {
        // Title
        drawTextShadow('KOSH\'S HOUSE', width() / 2, 50, {
            size: 32,
            align: 'center',
        });

        // Player stats
        drawEnergyBar(gameState.player.energy, gameState.player.maxEnergy);

        const completion = (gameState.player.completedQuests.size / 3) * 100;
        drawTextShadow(`Completion: ${completion.toFixed(0)}%`, width() - 250, 25, {
            size: 18,
        });

        // Draw Kosh with glow effect
        const koshX = 150;
        const koshY = 400;

        // Glow
        for (let ox = -1; ox <= 1; ox++) {
            for (let oy = -1; oy <= 1; oy++) {
                if (ox === 0 && oy === 0) continue;
                drawSprite({
                    sprite: 'kosh_idle',
                    pos: vec2(koshX + ox, koshY + oy),
                    scale: 2,
                    anchor: 'center',
                    opacity: 0.3,
                    color: rgb(180, 180, 100),
                });
            }
        }

        // Main sprite
        drawSprite({
            sprite: 'kosh_idle',
            pos: vec2(koshX, koshY),
            scale: 2,
            anchor: 'center',
        });

        // Menu
        drawMenu('Available Quests', menuOptions, selectedIndex, 200);
    });

    onKeyPress('up', () => {
        selectedIndex = (selectedIndex - 1 + menuOptions.length) % menuOptions.length;
    });

    onKeyPress('down', () => {
        selectedIndex = (selectedIndex + 1) % menuOptions.length;
    });

    onKeyPress('enter', () => {
        const choice = menuOptions[selectedIndex];

        if (choice === 'Start: Window Witch') {
            go('windowWitch');
        } else if (choice === 'Start: Da Wire') {
            go('daWire');
        } else if (choice === 'Start: In and Out') {
            go('inAndOut');
        } else if (choice === '🥚 Start: Witch in the Wardrobe') {
            go('witchInWardrobe');
        } else if (choice === 'Save Game') {
            // Save to localStorage
            const saveData = {
                energy: gameState.player.energy,
                completedQuests: Array.from(gameState.player.completedQuests),
                easterEggFound: gameState.player.easterEggFound,
            };
            localStorage.setItem('koshSave', JSON.stringify(saveData));
            debug.log('Game saved!');
        } else if (choice === 'Main Menu') {
            go('mainMenu');
        }
    });
});

// ===========================
// WINDOW WITCH QUEST SCENE
// ===========================
scene('windowWitch', () => {
    let dad1Awake = false;
    let dad2Awake = false;
    let windowOpen = false;
    let selectedOption = 0;
    let showResult = false;
    let resultMessage = '';
    let targetDad = 1;
    let koshAction = null;

    // Easter egg mechanics
    const easterEggSpawnChance = 0.75; // 75% chance to spawn (increased for discoverability!)
    let easterEggVisible = false;
    let easterEggX = 0;
    let easterEggY = 0;
    let easterEggBob = 0; // For floating animation

    // Only spawn if not already found
    if (!gameState.player.easterEggFound && rand() < easterEggSpawnChance) {
        easterEggVisible = true;
        // Position near the window but not blocking view
        easterEggX = 600 + rand(-30, 30);
        easterEggY = 150 + rand(-20, 20);
    }

    const tactics = Object.entries(CONFIG.windowWitch.tactics).map(([key, data]) => ({
        key,
        ...data,
    }));

    // Particles for effects
    const particles = [];

    function addSparkles(x, y, count, color = [255, 220, 80]) {
        for (let i = 0; i < count; i++) {
            particles.push({
                pos: vec2(x + rand(-10, 10), y + rand(-10, 10)),
                vel: vec2(rand(-50, 50), rand(-100, -50)),
                life: rand(0.5, 1.0),
                maxLife: rand(0.5, 1.0),
                color: rgb(...color),
            });
        }
    }

    function addZzz(x, y) {
        if (rand() < 0.05) {
            particles.push({
                pos: vec2(x, y),
                vel: vec2(rand(-10, 10), -30),
                life: 2.0,
                maxLife: 2.0,
                text: 'Z',
            });
        }
    }

    function tryTactic(tactic) {
        koshAction = tactic.key;

        // Visual effects
        if (tactic.key === 'zoomies') {
            shake(8);
        } else if (tactic.key === 'meow') {
            addSparkles(380, 340, 3, [255, 220, 80]);
        }

        // Check energy
        if (gameState.player.energy < tactic.energyCost) {
            resultMessage = 'Too tired! Not enough energy.';
            koshAction = null;
            showResult = true;
            return;
        }

        gameState.player.energy -= tactic.energyCost;

        // Roll for success
        const success = rand() < tactic.successRate;

        if (success) {
            addSparkles(380, 320, 8, [50, 255, 100]);

            if (targetDad === 1) {
                dad1Awake = true;
                resultMessage = `${tactic.name} worked! Dad 1 is awake and grumbling.`;
                targetDad = 2;
            } else {
                dad2Awake = true;
                resultMessage = `${tactic.name} worked! Dad 2 is awake too!`;
            }
        } else {
            resultMessage = `${tactic.name} failed. They just rolled over...`;
        }

        showResult = true;
    }

    function tryConvinceWindow() {
        const success = rand() < CONFIG.windowWitch.windowConvinceRate;

        if (success) {
            windowOpen = true;
            resultMessage = 'Success! The dads opened the window. Bird watching time!';
            // Victory effects
            for (let i = 0; i < 5; i++) {
                addSparkles(400, 300, 3, [255, 150, 150]);
            }
            addSparkles(400, 300, 15, [255, 220, 80]);
        } else {
            resultMessage = 'They said "later, Kosh..." Maybe try again?';
        }

        showResult = true;
    }

    onUpdate(() => {
        // Update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.life -= dt();
            p.pos.x += p.vel.x * dt();
            p.pos.y += p.vel.y * dt();

            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }

        // Add Zzz for sleeping dads
        if (!dad1Awake) addZzz(145, 190);
        if (!dad2Awake) addZzz(595, 190);

        // Easter egg bobbing animation
        if (easterEggVisible) {
            easterEggBob += dt() * 2;
        }
    });

    onDraw(() => {
        // Background
        drawSprite({
            sprite: 'bedroom_bg',
            pos: vec2(0, 0),
        });

        // Energy bar (top left)
        drawEnergyBar(gameState.player.energy, gameState.player.maxEnergy);

        // Title (moved down to avoid overlap)
        drawTextShadow('WINDOW WITCH', width() / 2, 55, {
            size: 28,
            align: 'center',
        });

        // Dad 1
        drawSprite({
            sprite: dad1Awake ? 'dad_awake' : 'dad_sleeping',
            pos: vec2(100, 200),
            scale: 2,
        });

        // Dad 2
        drawSprite({
            sprite: dad2Awake ? 'dad_awake' : 'dad_sleeping',
            pos: vec2(550, 200),
            scale: 2,
        });

        // Window
        drawSprite({
            sprite: windowOpen ? 'window_open' : 'window_closed',
            pos: vec2(320, 80),
            scale: 2,
        });

        // Easter egg (if visible)
        if (easterEggVisible) {
            const bobOffset = Math.sin(easterEggBob) * 8;
            const eggPosY = easterEggY + bobOffset;

            // Sparkle glow around egg
            for (let ox = -2; ox <= 2; ox++) {
                for (let oy = -2; oy <= 2; oy++) {
                    if (ox === 0 && oy === 0) continue;
                    drawSprite({
                        sprite: 'easter_egg',
                        pos: vec2(easterEggX + ox, eggPosY + oy),
                        scale: 1.5,
                        anchor: 'center',
                        opacity: 0.2,
                        color: rgb(255, 220, 255),
                    });
                }
            }

            drawSprite({
                sprite: 'easter_egg',
                pos: vec2(easterEggX, eggPosY),
                scale: 1.5,
                anchor: 'center',
            });

            // Subtle hint text above egg
            drawTextShadow('???', easterEggX, eggPosY - 40, {
                size: 16,
                align: 'center',
                color: rgb(255, 200, 255),
            });
        }

        // Kosh with glow
        const koshX = 380;
        const koshY = 340;
        let koshSprite = 'kosh_idle';

        if (koshAction) {
            const spriteMap = {
                meow: 'kosh_meow',
                pawTap: 'kosh_paw_tap',
                zoomies: 'kosh_zoomies',
            };
            koshSprite = spriteMap[koshAction] || 'kosh_idle';
        }

        // Glow effect
        for (let ox = -1; ox <= 1; ox++) {
            for (let oy = -1; oy <= 1; oy++) {
                if (ox === 0 && oy === 0) continue;
                drawSprite({
                    sprite: koshSprite,
                    pos: vec2(koshX + ox, koshY + oy),
                    scale: 2,
                    anchor: 'center',
                    opacity: 0.3,
                    color: rgb(180, 180, 100),
                });
            }
        }

        drawSprite({
            sprite: koshSprite,
            pos: vec2(koshX, koshY),
            scale: 2,
            anchor: 'center',
        });

        // Status labels
        drawTextShadow('Dad 1', 128, 290, {
            size: 16,
            align: 'center',
            color: dad1Awake ? rgb(50, 255, 100) : rgb(255, 50, 50),
        });

        drawTextShadow('Dad 2', 578, 290, {
            size: 16,
            align: 'center',
            color: dad2Awake ? rgb(50, 255, 100) : rgb(255, 50, 50),
        });

        // Particles
        particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            if (p.text) {
                drawText({
                    text: p.text,
                    pos: p.pos,
                    size: 24,
                    color: rgb(255, 255, 255),
                    opacity: alpha,
                });
            } else {
                drawCircle({
                    pos: p.pos,
                    radius: 3,
                    color: p.color,
                    opacity: alpha,
                });
            }
        });

        // Result message or menu
        if (showResult) {
            // Dialog box
            const boxX = 50;
            const boxY = 400;
            const boxWidth = 700;
            const boxHeight = 150;

            drawRect({
                pos: vec2(boxX, boxY),
                width: boxWidth,
                height: boxHeight,
                color: rgb(50, 50, 70),
            });

            drawRect({
                pos: vec2(boxX + 3, boxY + 3),
                width: boxWidth - 6,
                height: boxHeight - 6,
                color: rgb(30, 30, 50),
            });

            drawText({
                text: resultMessage + '\n\nPress ENTER to continue',
                pos: vec2(boxX + 20, boxY + 20),
                size: 20,
                width: boxWidth - 40,
            });
        } else {
            // Objective
            let objective = '';
            if (!dad1Awake) {
                objective = 'Target: Dad 1 - Choose your tactic!';
            } else if (!dad2Awake) {
                objective = 'Target: Dad 2 - Choose your tactic!';
            } else {
                objective = 'Both dads are awake! Press ENTER to ask for window!';
            }

            drawTextShadow(objective, width() / 2, 380, {
                size: 20,
                align: 'center',
                color: rgb(255, 200, 50),
            });

            // Tactics menu
            if (!dad1Awake || !dad2Awake) {
                tactics.forEach((tactic, i) => {
                    const y = 420 + i * 35;
                    const color = i === selectedOption ? rgb(255, 200, 50) : rgb(255, 255, 255);
                    const prefix = i === selectedOption ? '> ' : '  ';

                    drawTextShadow(
                        `${prefix}${tactic.name} (${tactic.energyCost} energy, ${(tactic.successRate * 100).toFixed(0)}%)`,
                        80,
                        y,
                        { size: 20, color }
                    );
                });
            }
        }

        // Instructions
        drawTextShadow('UP/DOWN: select  ENTER: confirm  ESC: exit', width() / 2, height() - 20, {
            size: 16,
            align: 'center',
        });
    });

    onKeyPress('up', () => {
        if (!showResult && (!dad1Awake || !dad2Awake)) {
            selectedOption = (selectedOption - 1 + tactics.length) % tactics.length;
        }
    });

    onKeyPress('down', () => {
        if (!showResult && (!dad1Awake || !dad2Awake)) {
            selectedOption = (selectedOption + 1) % tactics.length;
        }
    });

    onKeyPress('enter', () => {
        if (showResult) {
            showResult = false;
            koshAction = null;

            if (windowOpen) {
                // Quest complete!
                gameState.player.completedQuests.add('window_witch');
                go('questComplete', { questName: 'Window Witch' });
            }
        } else {
            if (dad1Awake && dad2Awake) {
                tryConvinceWindow();
            } else {
                tryTactic(tactics[selectedOption]);
            }
        }
    });

    onKeyPress('escape', () => {
        go('overworld');
    });

    // Mouse click handler for easter egg
    onClick(() => {
        if (easterEggVisible) {
            const mouse = mousePos();
            const bobOffset = Math.sin(easterEggBob) * 8;
            const eggPosY = easterEggY + bobOffset;

            // Check if click is near egg (generous hitbox)
            const dist = Math.sqrt(
                Math.pow(mouse.x - easterEggX, 2) +
                Math.pow(mouse.y - eggPosY, 2)
            );

            if (dist < 50) {
                // Egg caught!
                easterEggVisible = false;
                gameState.player.easterEggFound = true;

                // Big sparkle effect
                for (let i = 0; i < 30; i++) {
                    addSparkles(easterEggX, eggPosY, 3, [255, 200, 255]);
                }

                resultMessage = '🥚 You found a secret easter egg! A mysterious wardrobe has appeared in the overworld...';
                showResult = true;
            }
        }
    });
});

// ===========================
// DA WIRE QUEST SCENE
// ===========================
scene('daWire', () => {
    let round = 1;
    const maxRounds = 5;
    let roundsWon = 0;

    // Wire swing state
    let wirePosition = 0; // -1 to 1
    let wireSpeed = 1.3; // Slower swing (was 2)
    let wireDirection = 1;

    // Game state
    let phase = 'watch'; // 'watch', 'lick', 'grip', 'result'
    let lickSuccess = false;
    let gripProgress = 0;
    let gripTarget = 0.4; // Shorter hold time (was 0.6)
    let resultMessage = '';
    let showResult = false;

    // Timing
    let phaseTimer = 0;
    const watchDuration = 2000; // Watch the string for 2 seconds
    const lickWindow = 0.3; // 300ms timing window
    const gripDuration = 1500; // 1.5 seconds to hold

    // Difficulty increases each round (gentler progression)
    function getDifficulty() {
        return 1 + (round - 1) * 0.08; // Gets 8% harder each round (was 15%)
    }

    onUpdate(() => {
        const dt_sec = dt();
        phaseTimer += dt_sec * 1000;

        // Update wire swing
        wirePosition += wireSpeed * wireDirection * dt_sec * getDifficulty();
        if (wirePosition > 1) {
            wirePosition = 1;
            wireDirection = -1;
        } else if (wirePosition < -1) {
            wirePosition = -1;
            wireDirection = 1;
        }

        // Phase management
        if (phase === 'watch') {
            if (phaseTimer > watchDuration) {
                phase = 'lick';
                phaseTimer = 0;
            }
        } else if (phase === 'grip' && !showResult) {
            // Automatically holding - increase grip progress
            gripProgress += dt_sec;

            if (gripProgress >= gripTarget) {
                // Success!
                roundsWon++;
                resultMessage = `Perfect! You held on! (Round ${round}/${maxRounds})`;
                showResult = true;
                phaseTimer = 0;
            }
        }
    });

    onDraw(() => {
        // Background
        drawRect({
            pos: vec2(0, 0),
            width: width(),
            height: height(),
            color: rgb(60, 50, 80),
        });

        // Title
        drawTextShadow('DA WIRE', width() / 2, 30, {
            size: 28,
            align: 'center',
        });

        // Round indicator
        drawTextShadow(`Round ${round}/${maxRounds} | Success: ${roundsWon}`, width() / 2, 60, {
            size: 20,
            align: 'center',
            color: rgb(255, 220, 80),
        });

        // Draw the wire attachment point (ceiling)
        const wireX = width() / 2;
        const wireY = 100;
        drawCircle({
            pos: vec2(wireX, wireY),
            radius: 5,
            color: rgb(100, 100, 100),
        });

        // Draw the string (swinging)
        const stringLength = 150;
        const stringEndX = wireX + wirePosition * 100;
        const stringEndY = wireY + stringLength;

        drawLine({
            p1: vec2(wireX, wireY),
            p2: vec2(stringEndX, stringEndY),
            width: 3,
            color: rgb(200, 200, 200),
        });

        // Draw the toy at the end
        const toySize = 15;
        drawCircle({
            pos: vec2(stringEndX, stringEndY),
            radius: toySize,
            color: rgb(255, 100, 150),
        });

        // Draw Kosh below (with glow)
        const koshX = width() / 2;
        const koshY = 350;

        // Determine Kosh sprite based on phase
        let koshSprite = 'kosh_idle';
        if (phase === 'lick') {
            koshSprite = wirePosition > -0.2 && wirePosition < 0.2 ? 'kosh_meow' : 'kosh_idle';
        } else if (phase === 'grip') {
            koshSprite = 'kosh_paw_tap';
        }

        // Glow
        for (let ox = -1; ox <= 1; ox++) {
            for (let oy = -1; oy <= 1; oy++) {
                if (ox === 0 && oy === 0) continue;
                drawSprite({
                    sprite: koshSprite,
                    pos: vec2(koshX + ox, koshY + oy),
                    scale: 2,
                    anchor: 'center',
                    opacity: 0.3,
                    color: rgb(180, 180, 100),
                });
            }
        }

        drawSprite({
            sprite: koshSprite,
            pos: vec2(koshX, koshY),
            scale: 2,
            anchor: 'center',
        });

        // Instructions based on phase
        let instructions = '';
        let instructionColor = rgb(255, 255, 255);

        if (showResult) {
            // Show result
            const boxX = 100;
            const boxY = 420;
            const boxWidth = 600;
            const boxHeight = 120;

            drawRect({
                pos: vec2(boxX, boxY),
                width: boxWidth,
                height: boxHeight,
                color: rgb(50, 50, 70),
            });

            drawText({
                text: resultMessage + '\n\nPress ENTER to continue',
                pos: vec2(boxX + 20, boxY + 20),
                size: 20,
                width: boxWidth - 40,
            });
        } else if (phase === 'watch') {
            instructions = 'Watch the string swing... Get ready!';
        } else if (phase === 'lick') {
            instructions = 'Press SPACE when the string is in the CENTER!';
            instructionColor = rgb(255, 200, 50);

            // Show target zone (bigger = easier)
            const targetX = width() / 2;
            const zoneWidth = 90; // Wider zone (was 60)
            drawRect({
                pos: vec2(targetX - zoneWidth/2, 240),
                width: zoneWidth,
                height: 120,
                color: rgb(50, 255, 100),
                opacity: 0.3,
            });
        } else if (phase === 'grip') {
            instructions = 'HOLD SPACE to grip the string!';
            instructionColor = rgb(50, 255, 100);

            // Show grip progress bar
            const barX = width() / 2 - 150;
            const barY = 450;
            const barWidth = 300;
            const barHeight = 30;

            drawRect({
                pos: vec2(barX, barY),
                width: barWidth,
                height: barHeight,
                color: rgb(100, 100, 120),
            });

            const fillWidth = (gripProgress / gripTarget) * (barWidth - 4);
            drawRect({
                pos: vec2(barX + 2, barY + 2),
                width: fillWidth,
                height: barHeight - 4,
                color: rgb(50, 255, 100),
            });

            drawTextShadow('HOLD!', width() / 2, barY - 20, {
                size: 24,
                align: 'center',
                color: rgb(255, 200, 50),
            });
        }

        if (!showResult) {
            drawTextShadow(instructions, width() / 2, 500, {
                size: 20,
                align: 'center',
                color: instructionColor,
            });
        }

        // Controls
        drawTextShadow('SPACE: Lick/Grip | ESC: Exit', width() / 2, height() - 20, {
            size: 16,
            align: 'center',
        });
    });

    onKeyPress('space', () => {
        if (showResult) return;

        if (phase === 'lick') {
            // Check if string is in center (timing check) - more forgiving window
            if (Math.abs(wirePosition) < 0.35) {
                // Success!
                lickSuccess = true;
                phase = 'grip';
                gripProgress = 0;
                phaseTimer = 0;
            } else {
                // Failed - missed the timing
                resultMessage = `Missed! Try again. (Round ${round}/${maxRounds})`;
                showResult = true;
                phaseTimer = 0;
            }
        }
    });

    onKeyRelease('space', () => {
        if (phase === 'grip' && !showResult) {
            // Released too early!
            if (gripProgress < gripTarget) {
                resultMessage = `Let go too soon! (Round ${round}/${maxRounds})`;
                showResult = true;
                phaseTimer = 0;
            }
        }
    });

    onKeyPress('enter', () => {
        if (showResult) {
            showResult = false;
            round++;

            // Check if quest is complete
            if (round > maxRounds) {
                if (roundsWon >= 2) {
                    // Success! Won at least 2 out of 5 rounds (easier win condition)
                    gameState.player.completedQuests.add('da_wire');
                    go('questComplete', { questName: 'Da Wire' });
                } else {
                    // Failed - not enough rounds won
                    go('questComplete', {
                        questName: 'Da Wire',
                        failed: true,
                        message: `Only got ${roundsWon}/5 rounds. Need at least 2!`
                    });
                }
            } else {
                // Next round
                phase = 'watch';
                phaseTimer = 0;
                wirePosition = 0;
                wireDirection = 1;
            }
        }
    });

    onKeyPress('escape', () => {
        go('overworld');
    });
});

// ===========================
// IN AND OUT QUEST SCENE
// ===========================
scene('inAndOut', () => {
    let trips = 0;
    const maxTrips = 10;
    const energyPerTrip = 10;
    let foodFound = false;
    let tripsSinceStart = 0;
    let showResult = false;
    let resultMessage = '';

    // Animation state
    let koshPosition = 'inside'; // 'inside', 'going_out', 'outside', 'coming_back'
    let animTimer = 0;
    const animDuration = 1000; // 1 second per animation

    // Food mechanics
    let foodAppeared = false;
    const minTripsForFood = 3; // Minimum trips before food can appear
    const foodChance = 0.20; // 20% chance each trip after minimum
    const falsePositiveChance = 0.15; // 15% chance of thinking you see food

    onUpdate(() => {
        if (koshPosition === 'going_out' || koshPosition === 'coming_back') {
            animTimer += dt() * 1000;

            if (animTimer >= animDuration) {
                animTimer = 0;

                if (koshPosition === 'going_out') {
                    koshPosition = 'outside';
                    // Check if food appeared this trip
                    if (!foodAppeared && tripsSinceStart >= minTripsForFood) {
                        if (rand() < foodChance) {
                            foodAppeared = true;
                        }
                    }
                } else {
                    koshPosition = 'inside';
                }
            }
        }
    });

    onDraw(() => {
        // Background - kitchen view
        drawRect({
            pos: vec2(0, 0),
            width: width(),
            height: height(),
            color: rgb(90, 80, 110),
        });

        // Title
        drawTextShadow('IN AND OUT', width() / 2, 30, {
            size: 28,
            align: 'center',
        });

        // Energy and trip counter
        drawTextShadow(`Energy: ${gameState.player.energy}/${gameState.player.maxEnergy}`, 50, 60, {
            size: 20,
            color: gameState.player.energy < 30 ? rgb(255, 50, 50) : rgb(255, 255, 255),
        });

        drawTextShadow(`Trips: ${trips}/${maxTrips}`, width() - 200, 60, {
            size: 20,
            color: rgb(255, 220, 80),
        });

        // Draw room divider (door)
        const dividerX = width() / 2;
        drawLine({
            p1: vec2(dividerX, 100),
            p2: vec2(dividerX, height()),
            width: 4,
            color: rgb(60, 50, 80),
        });

        // Labels
        drawTextShadow('INSIDE', width() / 4, 120, {
            size: 24,
            align: 'center',
            color: rgb(180, 180, 200),
        });

        drawTextShadow('OUTSIDE', width() * 3/4, 120, {
            size: 24,
            align: 'center',
            color: rgb(180, 180, 200),
        });

        // Draw food bowl (outside)
        const bowlX = width() * 3/4;
        const bowlY = 300;

        // Bowl
        drawCircle({
            pos: vec2(bowlX, bowlY + 20),
            radius: 40,
            color: rgb(200, 150, 150),
        });
        drawCircle({
            pos: vec2(bowlX, bowlY + 15),
            radius: 35,
            color: rgb(150, 100, 100),
        });

        // Food in bowl (if appeared)
        if (foodAppeared && koshPosition === 'outside') {
            // Yummy food!
            for (let i = 0; i < 5; i++) {
                const angle = (i / 5) * Math.PI * 2;
                const fx = bowlX + Math.cos(angle) * 15;
                const fy = bowlY + Math.sin(angle) * 8 + 10;
                drawCircle({
                    pos: vec2(fx, fy),
                    radius: 8,
                    color: rgb(160, 100, 60),
                });
            }

            // Shine/sparkle on food
            drawCircle({
                pos: vec2(bowlX, bowlY + 5),
                radius: 3,
                color: rgb(255, 255, 200),
            });
        }

        // Draw Kosh based on position
        let koshX, koshY;
        let koshSprite = 'kosh_idle';

        if (koshPosition === 'inside') {
            koshX = width() / 4;
            koshY = 350;
            koshSprite = 'kosh_idle';
        } else if (koshPosition === 'going_out') {
            // Animate moving right
            const progress = animTimer / animDuration;
            koshX = width() / 4 + (width() / 2) * progress;
            koshY = 350;
            koshSprite = 'kosh_zoomies';
        } else if (koshPosition === 'outside') {
            koshX = width() * 3/4;
            koshY = 350;
            koshSprite = foodAppeared ? 'kosh_meow' : 'kosh_idle';
        } else { // coming_back
            // Animate moving left
            const progress = animTimer / animDuration;
            koshX = width() * 3/4 - (width() / 2) * progress;
            koshY = 350;
            koshSprite = 'kosh_zoomies';
        }

        // Glow
        for (let ox = -1; ox <= 1; ox++) {
            for (let oy = -1; oy <= 1; oy++) {
                if (ox === 0 && oy === 0) continue;
                drawSprite({
                    sprite: koshSprite,
                    pos: vec2(koshX + ox, koshY + oy),
                    scale: 2,
                    anchor: 'center',
                    opacity: 0.3,
                    color: rgb(180, 180, 100),
                });
            }
        }

        drawSprite({
            sprite: koshSprite,
            pos: vec2(koshX, koshY),
            scale: 2,
            anchor: 'center',
        });

        // Show result or instructions
        if (showResult) {
            const boxX = 100;
            const boxY = 420;
            const boxWidth = 600;
            const boxHeight = 120;

            drawRect({
                pos: vec2(boxX, boxY),
                width: boxWidth,
                height: boxHeight,
                color: rgb(50, 50, 70),
            });

            drawText({
                text: resultMessage + '\n\nPress ENTER to continue',
                pos: vec2(boxX + 20, boxY + 20),
                size: 20,
                width: boxWidth - 40,
            });
        } else if (koshPosition === 'inside') {
            let instructions = '';

            if (trips === 0) {
                instructions = 'Press SPACE to check the food bowl!';
            } else if (gameState.player.energy < energyPerTrip) {
                instructions = 'Not enough energy! You must give up...';
            } else {
                instructions = 'Press SPACE to check again... or ENTER to give up';
            }

            drawTextShadow(instructions, width() / 2, 500, {
                size: 20,
                align: 'center',
                color: rgb(255, 220, 80),
            });
        } else if (koshPosition === 'outside') {
            if (foodAppeared) {
                drawTextShadow('FOOD! There\'s food! Press ENTER!', width() / 2, 500, {
                    size: 24,
                    align: 'center',
                    color: rgb(50, 255, 100),
                });
            } else {
                // False positive check
                const hasFalsePositive = trips > 0 && rand() < falsePositiveChance;

                if (hasFalsePositive) {
                    drawTextShadow('Wait... is that food? No, just the same empty bowl...', width() / 2, 500, {
                        size: 18,
                        align: 'center',
                        color: rgb(255, 150, 50),
                    });
                } else {
                    drawTextShadow('Empty... Press ENTER to go back inside', width() / 2, 500, {
                        size: 20,
                        align: 'center',
                        color: rgb(200, 200, 200),
                    });
                }
            }
        }

        // Controls
        drawTextShadow('SPACE: Check bowl | ENTER: Continue/Give up | ESC: Exit quest', width() / 2, height() - 20, {
            size: 16,
            align: 'center',
        });
    });

    onKeyPress('space', () => {
        if (showResult) return;

        if (koshPosition === 'inside') {
            // Check if can afford the trip
            if (gameState.player.energy < energyPerTrip) {
                resultMessage = `Ran out of energy after ${trips} trips! No food found. The hunger continues...`;
                showResult = true;
                return;
            }

            if (trips >= maxTrips) {
                resultMessage = `Checked ${maxTrips} times! That's enough for today. Still no food...`;
                showResult = true;
                return;
            }

            // Use energy and go check
            gameState.player.energy -= energyPerTrip;
            trips++;
            tripsSinceStart++;
            koshPosition = 'going_out';
            animTimer = 0;
        }
    });

    onKeyPress('enter', () => {
        if (showResult) {
            if (foodFound) {
                // Success!
                gameState.player.completedQuests.add('in_and_out');
                go('questComplete', { questName: 'In and Out' });
            } else {
                // Failed
                go('overworld');
            }
        } else if (koshPosition === 'outside') {
            if (foodAppeared) {
                // Found food!
                foodFound = true;
                resultMessage = `SUCCESS! Food appeared after ${trips} trips! Time to eat!`;
                showResult = true;
            } else {
                // Go back inside
                koshPosition = 'coming_back';
                animTimer = 0;
            }
        } else if (koshPosition === 'inside' && trips > 0) {
            // Give up
            resultMessage = `Gave up after ${trips} trips. Maybe there will be food next time?`;
            showResult = true;
        }
    });

    onKeyPress('escape', () => {
        go('overworld');
    });
});

// ===========================
// WITCH IN THE WARDROBE SCENE (Secret Quest!)
// ===========================
scene('witchInWardrobe', () => {
    let round = 1;
    const maxRounds = 10;
    let catchCount = 0;
    const targetCatches = 7; // Need to catch 7/10

    // Intro animation state
    let phase = 'approach'; // 'approach', 'opening', 'jumping', 'inside_waiting', 'inside_peeking'
    let introTimer = 0;
    let koshX = 100;
    let koshY = 400;
    const wardrobeX = 450;
    const wardrobeY = 150;
    let wardrobeOpen = false;
    let wardrobeDoorAngle = 0; // For opening animation

    // Peek-a-boo state
    let raccoonVisible = false;
    let raccoonX = 0;
    let raccoonY = 0;
    let peekTimer = 0;
    let peekDuration = 0;
    let waitTimer = 0;
    let waitDuration = 0;
    let resultMessage = '';
    let showResult = false;

    function startWait() {
        phase = 'inside_waiting';
        waitTimer = 0;
        waitDuration = rand(0.8, 1.5);
    }

    function startPeek() {
        phase = 'inside_peeking';
        raccoonVisible = true;
        peekTimer = 0;
        peekDuration = rand(0.6, 1.2);

        // Random positions inside the wardrobe (on the walls/shelves)
        const peekPositions = [
            { x: 500, y: 220 },
            { x: 560, y: 220 },
            { x: 620, y: 220 },
            { x: 500, y: 300 },
            { x: 620, y: 300 },
        ];
        const pos = choose(peekPositions);
        raccoonX = pos.x;
        raccoonY = pos.y;
    }

    function endPeek(caught) {
        raccoonVisible = false;

        if (caught) {
            catchCount++;
            resultMessage = `Got it! (${catchCount}/${maxRounds})`;
        } else {
            resultMessage = `Too slow! (${catchCount}/${maxRounds})`;
        }

        showResult = true;

        wait(0.8, () => {
            showResult = false;
            round++;

            if (round > maxRounds) {
                // Game over
                if (catchCount >= targetCatches) {
                    gameState.player.completedQuests.add('witch_in_wardrobe');
                    go('questComplete', { questName: 'Witch in the Wardrobe' });
                } else {
                    go('overworld');
                }
            } else {
                startWait();
            }
        });
    }

    onUpdate(() => {
        introTimer += dt();

        // Intro sequence
        if (phase === 'approach') {
            // Kosh walks toward wardrobe
            koshX = lerp(100, wardrobeX - 100, Math.min(introTimer / 1.5, 1));
            if (introTimer >= 1.5) {
                phase = 'opening';
                introTimer = 0;
            }
        } else if (phase === 'opening') {
            // Wardrobe doors open
            wardrobeDoorAngle = lerp(0, 1, Math.min(introTimer / 0.8, 1));
            if (introTimer >= 0.8) {
                wardrobeOpen = true;
                phase = 'jumping';
                introTimer = 0;
            }
        } else if (phase === 'jumping') {
            // Kosh jumps into wardrobe
            const jumpProgress = Math.min(introTimer / 0.6, 1);
            koshX = lerp(wardrobeX - 100, wardrobeX + 60, jumpProgress);
            // Jump arc
            const jumpHeight = Math.sin(jumpProgress * Math.PI) * 80;
            koshY = 400 - jumpHeight;

            if (introTimer >= 0.6) {
                phase = 'inside_waiting';
                introTimer = 0;
                koshX = wardrobeX + 60;
                koshY = 320;
                // Start first round
                startWait();
            }
        } else if (phase === 'inside_waiting') {
            waitTimer += dt();
            if (waitTimer >= waitDuration) {
                startPeek();
            }
        } else if (phase === 'inside_peeking') {
            peekTimer += dt();
            if (peekTimer >= peekDuration) {
                // Raccoon disappears without being caught
                endPeek(false);
            }
        }
    });

    onDraw(() => {
        // Background
        drawRect({
            pos: vec2(0, 0),
            width: width(),
            height: height(),
            color: rgb(70, 60, 90),
        });

        // Title
        drawTextShadow('WITCH IN THE WARDROBE', width() / 2, 30, {
            size: 28,
            align: 'center',
            color: rgb(255, 200, 255),
        });

        // INTRO SEQUENCE (approach, opening, jumping)
        if (phase === 'approach' || phase === 'opening' || phase === 'jumping') {
            // Show wardrobe from outside
            drawSprite({
                sprite: 'wardrobe',
                pos: vec2(wardrobeX, wardrobeY),
                scale: 2.5,
            });

            // Show wardrobe doors opening
            if (phase === 'opening' || phase === 'jumping') {
                // Dark interior visible when doors open
                const doorOpenness = wardrobeDoorAngle * 60;
                drawRect({
                    pos: vec2(wardrobeX + 50 - doorOpenness, wardrobeY + 80),
                    width: doorOpenness * 2,
                    height: 180,
                    color: rgb(20, 15, 25),
                });
            }

            // Kosh approaching/jumping
            const koshSprite = phase === 'jumping' ? 'kosh_zoomies' : 'kosh_idle';
            drawSprite({
                sprite: koshSprite,
                pos: vec2(koshX, koshY),
                scale: 2.5,
                anchor: 'center',
            });

            // Instructions for intro
            let instructions = '';
            if (phase === 'approach') instructions = 'Kosh approaches the mysterious wardrobe...';
            if (phase === 'opening') instructions = 'The wardrobe doors creak open...';
            if (phase === 'jumping') instructions = 'Kosh leaps inside!';

            drawTextShadow(instructions, width() / 2, 480, {
                size: 22,
                align: 'center',
                color: rgb(255, 220, 150),
            });
        }
        // INSIDE THE WARDROBE (gameplay)
        else {
            // Round counter
            drawTextShadow(`Round: ${round}/${maxRounds}`, 50, 60, {
                size: 20,
                color: rgb(255, 220, 80),
            });

            drawTextShadow(`Caught: ${catchCount}/${targetCatches}`, width() - 200, 60, {
                size: 20,
                color: catchCount >= targetCatches ? rgb(50, 255, 100) : rgb(255, 255, 255),
            });

            // Inside wardrobe view - darker, cozy space
            drawRect({
                pos: vec2(200, 150),
                width: 450,
                height: 350,
                color: rgb(40, 35, 50),
            });

            // Wardrobe interior details (shelves, walls)
            drawRect({
                pos: vec2(210, 160),
                width: 430,
                height: 8,
                color: rgb(60, 50, 40),
            });
            drawRect({
                pos: vec2(210, 280),
                width: 430,
                height: 8,
                color: rgb(60, 50, 40),
            });

            // Kosh inside (bottom of wardrobe, crouched)
            drawSprite({
                sprite: 'kosh_idle',
                pos: vec2(koshX, koshY),
                scale: 2.2,
                anchor: 'center',
            });

            // Raccoon peeking
            if (raccoonVisible) {
                drawSprite({
                    sprite: 'raccoon_toy',
                    pos: vec2(raccoonX, raccoonY),
                    scale: 1.8,
                    anchor: 'center',
                });

                // Exclamation mark above raccoon
                drawTextShadow('!', raccoonX, raccoonY - 30, {
                    size: 28,
                    align: 'center',
                    color: rgb(255, 100, 100),
                });
            }

            // Instructions
            if (phase === 'inside_waiting') {
                drawTextShadow('Waiting for raccoon...', width() / 2, 520, {
                    size: 20,
                    align: 'center',
                    color: rgb(200, 200, 150),
                });
            } else if (phase === 'inside_peeking') {
                drawTextShadow('Click it quick!', width() / 2, 520, {
                    size: 24,
                    align: 'center',
                    color: rgb(255, 100, 100),
                });
            }

            // Result message
            if (showResult) {
                drawTextShadow(resultMessage, width() / 2, 450, {
                    size: 26,
                    align: 'center',
                    color: resultMessage.includes('Got it') ? rgb(50, 255, 100) : rgb(255, 150, 150),
                });
            }
        }

        // Bottom instructions
        drawTextShadow('ESC: exit', width() / 2, height() - 20, {
            size: 16,
            align: 'center',
        });
    });

    onClick(() => {
        if (raccoonVisible && phase === 'inside_peeking') {
            const mouse = mousePos();

            // Check if click is near raccoon (generous hitbox)
            const dist = Math.sqrt(
                Math.pow(mouse.x - raccoonX, 2) +
                Math.pow(mouse.y - raccoonY, 2)
            );

            if (dist < 40) {
                // Caught!
                endPeek(true);
            }
        }
    });

    onKeyPress('escape', () => {
        go('overworld');
    });
});

// ===========================
// QUEST COMPLETE SCENE
// ===========================
scene('questComplete', ({ questName }) => {
    onDraw(() => {
        const boxWidth = 500;
        const boxHeight = 200;
        const x = (width() - boxWidth) / 2;
        const y = (height() - boxHeight) / 2;

        // Box
        drawRect({
            pos: vec2(x, y),
            width: boxWidth,
            height: boxHeight,
            color: rgb(50, 50, 70),
        });

        drawRect({
            pos: vec2(x + 5, y + 5),
            width: boxWidth - 10,
            height: boxHeight - 10,
            color: rgb(30, 30, 50),
        });

        // Text
        drawTextShadow('QUEST COMPLETE!', width() / 2, y + 60, {
            size: 32,
            align: 'center',
            color: rgb(50, 255, 100),
        });

        drawTextShadow(questName, width() / 2, y + 110, {
            size: 24,
            align: 'center',
        });

        drawTextShadow('Press ENTER to continue', width() / 2, y + 150, {
            size: 18,
            align: 'center',
        });
    });

    onKeyPress('enter', () => {
        go('overworld');
    });
});

// Start the game!
go('mainMenu');
