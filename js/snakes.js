let sP = [1, 1], sT = 0;
const BoardSL = { 
    // Ladders (going up)
    3:22, 5:8, 11:26, 20:29, 27:1, 21:9, 17:4, 19:7, 50:70, 98:78,
    6:14, 15:35, 28:44, 36:55, 51:67, 63:81, 71:88, 80:92,
    // Snakes (going down)
    99:54, 95:75, 93:73, 87:24, 64:60, 56:37, 48:23, 39:2, 31:10, 24:16, 12:5, 8:3, 74:53, 82:61, 90:78, 96:87
};

window.initSnakes = function() {
    console.log('Initializing Snakes and Ladders...');
    
    const boardEl = document.getElementById('snakesBoard');
    if (!boardEl) {
        console.error('Snakes board element not found');
        return;
    }
    
    console.log('Snakes board element found, clearing and drawing...');
    
    // Force clean DOM
    boardEl.innerHTML = '';
    
    sP = [1, 1]; sT = 0;
    
    console.log('Snakes board state initialized, drawing board...');
    
    updateSnkUI(); drawSnakes();
    
    console.log('Snakes initialization completed');
};

function drawSnakes() {
    const b = document.getElementById('snakesBoard');
    b.innerHTML = ''; 
    b.style.setProperty('display', 'grid', 'important'); // Force grid display
    b.style.gridTemplateColumns = 'repeat(10, 1fr)';
    b.style.gap = '2px';
    b.style.padding = '10px';
    b.style.background = '#f0f0f0';
    b.style.borderRadius = '10px';
    b.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
    
    for (let i = 100; i >= 1; i--) {
        const sq = document.createElement('div');
        sq.style.border = '1px solid rgba(0,0,0,0.1)'; 
        sq.style.position = 'relative';
        sq.style.display = 'flex'; 
        sq.style.alignItems = 'center'; 
        sq.style.justifyContent = 'center';
        sq.style.fontSize = '0.8rem';
        sq.style.fontWeight = 'bold';
        sq.style.padding = '5px';
        sq.style.minHeight = '40px';
        sq.style.background = '#ffffff';
        sq.style.borderRadius = '4px';
        
        // Add colors for special squares
        if (BoardSL[i]) {
            if (BoardSL[i] > i) {
                // Ladder - green
                sq.style.background = 'linear-gradient(135deg, #4caf50, #8bc34a)';
                sq.style.color = 'white';
                sq.style.fontWeight = 'bold';
            } else {
                // Snake - red
                sq.style.background = 'linear-gradient(135deg, #f44336, #e91e63)';
                sq.style.color = 'white';
                sq.style.fontWeight = 'bold';
            }
        }
        
        // Add snake/ladder indicators
        if (BoardSL[i]) {
            const indicator = document.createElement('div');
            indicator.style.position = 'absolute';
            indicator.style.fontSize = '1.2rem';
            indicator.style.top = '2px';
            indicator.style.right = '2px';
            indicator.innerHTML = BoardSL[i] > i ? '🪜' : '🐍';
            sq.appendChild(indicator);
        }
        
        // Add number
        const number = document.createElement('div');
        number.innerText = i;
        sq.appendChild(number);
        
        // Add click handler for dice rolling
        sq.onclick = () => {
            console.log('Square clicked:', i, 'Current turn:', sT);
            if (sT === 0 && window.currentGameMode === 'pvp') {
                window.rollSnakesDice();
            } else if (window.currentGameMode === 'ai' && sT === 0) {
                window.rollSnakesDice();
            } else {
                console.log('Not your turn to roll dice!');
            }
        };
        
        // Add players with clear labels
        if (sP[0] === i) {
            const player1 = document.createElement('div');
            player1.style.position = 'absolute';
            player1.style.background = 'red';
            player1.style.width = '15px';
            player1.style.height = '15px';
            player1.style.borderRadius = '50%';
            player1.style.top = '2px';
            player1.style.left = '2px';
            player1.style.border = '2px solid white';
            player1.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
            player1.title = 'שחקן (אדום)';
            sq.appendChild(player1);
        }
        if (sP[1] === i) {
            const player2 = document.createElement('div');
            player2.style.position = 'absolute';
            player2.style.background = 'blue';
            player2.style.width = '15px';
            player2.style.height = '15px';
            player2.style.borderRadius = '50%';
            player2.style.bottom = '2px';
            player2.style.left = '2px';
            player2.style.border = '2px solid white';
            player2.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
            player2.title = 'מחשב (כחול)';
            sq.appendChild(player2);
        }
        
        b.appendChild(sq);
    }
}

window.rollSnakesDice = function() {
    console.log('Dice rolled! Current turn:', sT, 'Mode:', window.currentGameMode);
    if (sT !== 0) {
        console.log('Not your turn!');
        return;
    }
    const r = Math.floor(Math.random() * 6) + 1;
    console.log('Rolled:', r);
    
    // Show dice result
    showDiceResult(r);
    
    // Move after a short delay to show the dice
    setTimeout(() => {
        movePlayer(0, r);
    }, 500);
};

function movePlayer(idx, r) {
    const oldPos = sP[idx];
    sP[idx] += r;
    
    console.log(`Player ${idx} moved from ${oldPos} to ${sP[idx]} (rolled ${r})`);
    
    if (sP[idx] >= 100) { 
        sP[idx] = 100; 
        drawSnakes(); 
        window.triggerEndgameAnim('win', idx===0?"ניצחת!":"המחשב ניצח"); 
        return; 
    }
    
    // Check for snake or ladder
    if (BoardSL[sP[idx]]) {
        const newPos = BoardSL[sP[idx]];
        if (newPos > sP[idx]) {
            console.log(`Player ${idx} found a ladder! Moving from ${sP[idx]} to ${newPos}`);
        } else {
            console.log(`Player ${idx} found a snake! Sliding from ${sP[idx]} to ${newPos}`);
        }
        sP[idx] = newPos;
    }
    
    drawSnakes();
    sT = 1 - idx;
    updateSnkUI();
    if (sT === 1 && window.currentGameMode === 'ai') setTimeout(aiRoll, 1000);
}

function showDiceResult(roll) {
    const diceContainer = document.getElementById('snakes-dice-container');
    if (!diceContainer) return;
    
    // Create dice display
    diceContainer.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 1000;
            text-align: center;
        ">
            <div style="
                font-size: 3rem;
                margin: 10px 0;
                animation: bounce 0.5s ease-in-out;
            ">🎲</div>
            <div style="
                font-size: 2rem;
                font-weight: bold;
                color: #333;
                margin: 10px 0;
            ">${roll}</div>
            <div style="
                font-size: 1rem;
                color: #666;
                margin: 10px 0;
            ">הקוביה נזרקה!</div>
        </div>
    `;
    
    // Hide dice after 1.5 seconds
    setTimeout(() => {
        diceContainer.innerHTML = '';
    }, 1500);
}

function updateSnkUI() {
    window.updateStatus('snk-status', sT===0?"תורך":"תור המחשב", true);
    document.getElementById('snk-dice-btn').disabled = (sT !== 0);
    
    // Update score display
    const scoreDisplay = document.getElementById('snk-score-display');
    if (scoreDisplay) {
        scoreDisplay.innerHTML = `
            <div style="display: flex; justify-content: space-around; margin: 10px 0;">
                <div style="text-align: center;">
                    <div style="color: red; font-weight: bold;">שחקן</div>
                    <div style="font-size: 1.2rem;">מיקום: ${sP[0]}</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: blue; font-weight: bold;">מחשב</div>
                    <div style="font-size: 1.2rem;">מיקום: ${sP[1]}</div>
                </div>
            </div>
        `;
    }
}

function aiRoll() {
    // AI difficulty-based strategy
    const myPos = sP[1];
    const playerPos = sP[0];
    
    let bestTarget = -1;
    let strategy = '';
    
    // Check if we can win with this roll
    for (let roll = 1; roll <= 6; roll++) {
        const targetPos = Math.min(myPos + roll, 100);
        if (targetPos === 100) {
            bestTarget = roll;
            strategy = 'Winning move!';
            break;
        }
    }
    
    // If no immediate win, look for strategic advantages
    if (bestTarget === -1) {
        if (window.aiDifficulty === 'easy') {
            // Easy: Basic strategy with randomness
            // Prefer ladders but avoid obvious snakes
            for (let roll = 1; roll <= 6; roll++) {
                const targetPos = Math.min(myPos + roll, 100);
                if (BoardSL[targetPos]) {
                    if (BoardSL[targetPos] > myPos) {
                        // It's a ladder!
                        bestTarget = roll;
                        strategy = `Ladder to ${BoardSL[targetPos]}!`;
                        break;
                    }
                }
            }
            
            // If no ladder found, add randomness
            if (bestTarget === -1) {
                const safeRolls = [];
                for (let roll = 1; roll <= 6; roll++) {
                    const targetPos = Math.min(myPos + roll, 100);
                    if (!BoardSL[targetPos] || BoardSL[targetPos] > myPos) {
                        safeRolls.push(roll);
                    }
                }
                if (safeRolls.length > 0) {
                    bestTarget = safeRolls[Math.floor(Math.random() * safeRolls.length)];
                    strategy = 'Safe random roll';
                } else {
                    // All rolls lead to snakes, pick the least damaging
                    let leastDamage = Infinity;
                    let bestDamagingRoll = 1;
                    for (let roll = 1; roll <= 6; roll++) {
                        const targetPos = Math.min(myPos + roll, 100);
                        if (BoardSL[targetPos] && BoardSL[targetPos] < myPos) {
                            const damage = myPos - BoardSL[targetPos];
                            if (damage < leastDamage) {
                                leastDamage = damage;
                                bestDamagingRoll = roll;
                            }
                        }
                    }
                    bestTarget = bestDamagingRoll;
                    strategy = `Least damaging snake (-${leastDamage})`;
                }
            }
        } else if (window.aiDifficulty === 'medium') {
            // Medium: Balanced strategy
            // Look for ladders and avoid snakes
            let ladderScore = -1;
            let bestLadderRoll = -1;
            
            for (let roll = 1; roll <= 6; roll++) {
                const targetPos = Math.min(myPos + roll, 100);
                if (BoardSL[targetPos] && BoardSL[targetPos] > myPos) {
                    const score = BoardSL[targetPos] - myPos;
                    if (score > ladderScore) {
                        ladderScore = score;
                        bestLadderRoll = roll;
                    }
                }
            }
            
            if (bestLadderRoll !== -1) {
                bestTarget = bestLadderRoll;
                strategy = `Best ladder (+${ladderScore})`;
            } else {
                // No ladders available, choose safest roll
                const safeRolls = [];
                for (let roll = 1; roll <= 6; roll++) {
                    const targetPos = Math.min(myPos + roll, 100);
                    if (!BoardSL[targetPos] || BoardSL[targetPos] > myPos) {
                        safeRolls.push(roll);
                    }
                }
                if (safeRolls.length > 0) {
                    // Prefer higher rolls for more progress
                    bestTarget = Math.max(...safeRolls);
                    strategy = 'Safe high roll';
                } else {
                    // All rolls lead to snakes, pick the least damaging
                    let leastDamage = Infinity;
                    let bestDamagingRoll = 1;
                    for (let roll = 1; roll <= 6; roll++) {
                        const targetPos = Math.min(myPos + roll, 100);
                        if (BoardSL[targetPos] && BoardSL[targetPos] < myPos) {
                            const damage = myPos - BoardSL[targetPos];
                            if (damage < leastDamage) {
                                leastDamage = damage;
                                bestDamagingRoll = roll;
                            }
                        }
                    }
                    bestTarget = bestDamagingRoll;
                    strategy = `Least damaging snake (-${leastDamage})`;
                }
            }
        } else {
            // Hard: Advanced strategy
            // Calculate optimal roll with lookahead
            let bestScore = -Infinity;
            let bestRoll = 1;
            
            for (let roll = 1; roll <= 6; roll++) {
                const targetPos = Math.min(myPos + roll, 100);
                let score = 0;
                
                // Winning is top priority
                if (targetPos === 100) {
                    score += 10000;
                }
                
                // Check for ladders
                if (BoardSL[targetPos] && BoardSL[targetPos] > myPos) {
                    score += (BoardSL[targetPos] - myPos) * 10; // Ladder bonus
                }
                
                // Check for snakes (penalty)
                if (BoardSL[targetPos] && BoardSL[targetPos] < myPos) {
                    score -= (myPos - BoardSL[targetPos]) * 15; // Snake penalty
                }
                
                // Prefer getting closer to 100
                score += targetPos * 2;
                
                // Consider opponent position
                const distanceToWin = 100 - playerPos;
                const myDistanceToWin = 100 - targetPos;
                if (myDistanceToWin < distanceToWin) {
                    score += 50; // We're ahead
                }
                
                // Add small randomness for unpredictability
                score += Math.random() * 5 - 2.5;
                
                if (score > bestScore) {
                    bestScore = score;
                    bestRoll = roll;
                }
            }
            
            bestTarget = bestRoll;
            strategy = `Advanced strategy (score: ${bestScore.toFixed(1)})`;
        }
    }
    
    const r = bestTarget;
    console.log(`AI (${window.aiDifficulty}) strategic roll: ${r} (${strategy})`);
    movePlayer(1, r);
}

function updateSnkUI() {
    window.updateStatus('snk-status', sT===0?"תורך":"תור המחשב", true);
    document.getElementById('snk-dice-btn').disabled = (sT !== 0);
}