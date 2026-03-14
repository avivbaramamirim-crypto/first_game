/**
 * סולמות ונחשים - AI עובד וזרימת משחק חלקה
 */
let snkP = [1, 1], snkT = 0; // 0 = Player, 1 = AI
const SL = { 
    3: 22, 5: 8, 11: 26, 20: 29, 36: 44, 50: 67, 
    27: 1, 21: 9, 17: 4, 19: 7, 54: 34, 87: 24, 98: 79 
};

window.initSnakes = function() {
    snkP = [1, 1]; 
    snkT = 0;
    updateSnkUI();
    drawSnakes();
};

function drawSnakes() {
    const board = document.getElementById('snakesBoard');
    if (!board) return;
    board.innerHTML = '';
    board.style.display = 'grid';
    board.style.gridTemplateColumns = 'repeat(10, 1fr)';
    board.style.background = 'var(--wood-light)';

    for (let i = 100; i >= 1; i--) {
        const sq = document.createElement('div');
        sq.style.border = '1px solid rgba(0,0,0,0.1)';
        sq.style.position = 'relative';
        sq.style.display = 'flex';
        sq.style.alignItems = 'center';
        sq.style.justifyContent = 'center';
        sq.style.fontSize = '0.8rem';
        sq.style.fontWeight = 'bold';
        sq.innerText = i;
        
        if (SL[i]) {
            sq.style.background = SL[i] > i ? 'rgba(39, 174, 96, 0.2)' : 'rgba(231, 76, 60, 0.2)';
            sq.innerHTML += `<div style="font-size:0.5rem; position:absolute; bottom:0;">${SL[i] > i ? '🪜' : '🐍'}</div>`;
        }

        // חיילים
        if (snkP[0] === i) {
            const p1 = document.createElement('div');
            p1.style.width = '15px'; p1.style.height = '15px'; p1.style.background = 'red';
            p1.style.borderRadius = '50%'; p1.style.position = 'absolute'; p1.style.top = '2px';
            sq.appendChild(p1);
        }
        if (snkP[1] === i) {
            const p2 = document.createElement('div');
            p2.style.width = '15px'; p2.style.height = '15px'; p2.style.background = 'blue';
            p2.style.borderRadius = '50%'; p2.style.position = 'absolute'; p2.style.bottom = '2px';
            sq.appendChild(p2);
        }
        board.appendChild(sq);
    }
}

window.rollSnakesDice = function() {
    if (snkT !== 0) return; // לא תור השחקן
    const roll = Math.floor(Math.random() * 6) + 1;
    document.getElementById('snk-status').innerText = `יצא לך ${roll}!`;
    setTimeout(() => moveSnk(0, roll), 500);
};

function moveSnk(pIdx, roll) {
    snkP[pIdx] += roll;
    if (snkP[pIdx] > 100) snkP[pIdx] = 100;
    
    // בדיקת סולם או נחש
    if (SL[snkP[pIdx]]) {
        const target = SL[snkP[pIdx]];
        setTimeout(() => {
            snkP[pIdx] = target;
            drawSnakes();
            finishTurn(pIdx);
        }, 500);
    } else {
        finishTurn(pIdx);
    }
    drawSnakes();
}

function finishTurn(pIdx) {
    if (snkP[pIdx] === 100) {
        window.triggerEndgameAnim('win', (pIdx === 0 ? "אתה" : "המחשב") + " ניצחת!");
        return;
    }
    
    snkT = 1 - pIdx; // החלפת תור
    updateSnkUI();
    
    if (snkT === 1 && window.currentGameMode === 'ai') {
        setTimeout(aiSnakesMove, 1000);
    }
}

function aiSnakesMove() {
    const roll = Math.floor(Math.random() * 6) + 1;
    document.getElementById('snk-status').innerText = `למחשב יצא ${roll}`;
    setTimeout(() => moveSnk(1, roll), 500);
}

function updateSnkUI() {
    const text = snkT === 0 ? "תורך לזרוק קובייה" : "המחשב זורק...";
    window.updateTurnUI('snk-status', text, true);
    document.getElementById('snk-dice-btn').disabled = (snkT !== 0);
}