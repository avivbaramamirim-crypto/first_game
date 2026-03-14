let sP = [1, 1], sT = 0;
const BoardSL = { 3:22, 5:8, 11:26, 20:29, 27:1, 21:9, 17:4, 19:7, 50:70, 98:78 };

window.initSnakes = function() {
    sP = [1, 1]; sT = 0;
    updateSnkUI(); drawSnakes();
};

function drawSnakes() {
    const b = document.getElementById('snakesBoard');
    b.innerHTML = ''; b.style.display = 'grid'; b.style.gridTemplateColumns = 'repeat(10, 1fr)';
    for (let i = 100; i >= 1; i--) {
        const sq = document.createElement('div');
        sq.style.border = '1px solid rgba(0,0,0,0.1)'; sq.style.position = 'relative';
        sq.style.display = 'flex'; sq.style.alignItems = 'center'; sq.style.justifyContent = 'center';
        sq.innerText = i;
        if (sP[0] === i) sq.innerHTML += '<div style="background:red;width:15px;height:15px;border-radius:50%;position:absolute;top:2px;"></div>';
        if (sP[1] === i) sq.innerHTML += '<div style="background:blue;width:15px;height:15px;border-radius:50%;position:absolute;bottom:2px;"></div>';
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
    movePlayer(0, r);
};

function movePlayer(idx, r) {
    sP[idx] += r;
    if (sP[idx] >= 100) { sP[idx] = 100; drawSnakes(); window.triggerEndgameAnim('win', idx===0?"ניצחת!":"המחשב ניצח"); return; }
    if (BoardSL[sP[idx]]) sP[idx] = BoardSL[sP[idx]];
    drawSnakes();
    sT = 1 - idx;
    updateSnkUI();
    if (sT === 1 && window.currentGameMode === 'ai') setTimeout(aiRoll, 1000);
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