/**
 * סולמות ונחשים - לוגיקת תנועה על לוח 100 משבצות
 */
let snkP = [1, 1], snkT = 0; // P0=You, P1=AI/P2
const SL = { 3: 22, 5: 8, 11: 26, 20: 29, 27: 1, 21: 9, 17: 4, 19: 7 }; // נחשים וסולמות לדוגמה

function initSnakes() {
    snkP = [1, 1]; snkT = 0;
    drawSnakes();
}

function drawSnakes() {
    const board = document.getElementById('snakesBoard');
    board.innerHTML = '';
    for (let i = 100; i >= 1; i--) {
        const sq = document.createElement('div');
        sq.className = 'snk-sq';
        sq.style.border = '1px solid #ddd';
        sq.style.position = 'relative';
        sq.innerText = i;
        if (snkP[0] === i) sq.innerHTML += '<div style="background:red; width:10px; height:10px; border-radius:50%; position:absolute; top:2px; left:2px;"></div>';
        if (snkP[1] === i) sq.innerHTML += '<div style="background:blue; width:10px; height:10px; border-radius:50%; position:absolute; bottom:2px; right:2px;"></div>';
        board.appendChild(sq);
    }
}

window.rollSnakesDice = function() {
    if (snkT !== 0) return;
    const roll = Math.floor(Math.random() * 6) + 1;
    moveSnk(0, roll);
};

function moveSnk(pIdx, roll) {
    snkP[pIdx] += roll;
    if (snkP[pIdx] > 100) snkP[pIdx] = 100;
    if (SL[snkP[pIdx]]) snkP[pIdx] = SL[snkP[pIdx]];
    
    drawSnakes();
    if (snkP[pIdx] === 100) {
        triggerEndgameAnim('win', (pIdx === 0 ? "אתה" : "המחשב") + " ניצחת!");
        return;
    }
    
    snkT = 1 - pIdx;
    if (snkT === 1) setTimeout(() => moveSnk(1, Math.floor(Math.random() * 6) + 1), 600);
    else snkT = 0;
}