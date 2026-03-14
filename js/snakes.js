/**
 * snakes.js
 */
let snkP = [1, 1], snkT = 0;

window.initSnakes = function() {
    snkP = [1, 1]; snkT = 0;
    drawSnakes();
};

function drawSnakes() {
    const b = document.getElementById('snakesBoard');
    b.innerHTML = '';
    for (let i = 100; i >= 1; i--) {
        const sq = document.createElement('div');
        sq.style.border = '1px solid #ccc';
        sq.innerText = i;
        if (snkP[0] === i) sq.style.backgroundColor = 'rgba(231, 76, 60, 0.5)';
        if (snkP[1] === i) sq.style.boxShadow = 'inset 0 0 10px blue';
        b.appendChild(sq);
    }
}

window.rollSnakesDice = function() {
    if (snkT !== 0 && window.currentGameMode === 'ai') return;
    const r = Math.floor(Math.random() * 6) + 1;
    snkP[snkT] += r;
    if (snkP[snkT] >= 100) { snkP[snkT] = 100; alert('ניצחון!'); }
    snkT = 1 - snkT;
    drawSnakes();
    if (snkT === 1 && window.currentGameMode === 'ai') setTimeout(window.rollSnakesDice, 1000);
};

window.syncLocalGame = function(type, state) {
    if (type === 'snakes') { snkP = state.p; snkT = state.t; drawSnakes(); }
};