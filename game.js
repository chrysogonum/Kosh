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

        // Title
        drawTextShadow('WINDOW WITCH', width() / 2, 20, {
            size: 32,
            align: 'center',
        });

        // Energy bar
        drawEnergyBar(gameState.player.energy, gameState.player.maxEnergy);

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
