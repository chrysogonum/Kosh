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
        } else if (choice === 'Save Game') {
            // Save to localStorage
            const saveData = {
                energy: gameState.player.energy,
                completedQuests: Array.from(gameState.player.completedQuests),
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
