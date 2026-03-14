/**
 * tictactoe.js
 */
let tttB = Array(9).fill(null), tttT = 'X';

window.initTicTacToe = function() {
    tttB = Array(9).fill(null); tttT = 'X';
    drawTTT();
    updateTTTStatus();
};

function drawTTT() {
    const b = document.getElementById('tttBoard');
    b.innerHTML = '';
    tttB.forEach((v, i) => {
        const sq = document.createElement('div');
        sq.style.backgroundColor = '#ecf0f1';
        sq.style.display = 'flex'; sq.style.alignItems = 'center'; sq.style.justifyContent = 'center';
        sq.style.fontSize = '2rem';
        sq.innerText = v || '';
        sq.onclick = () => handleTTT(i);
        b.appendChild(sq);
    });
}

function handleTTT(i) {
    if (tttB[i]) return;
    // Only restrict moves in online mode
    if (window.currentGameMode === 'online') {
        const myS = window.getMyRole() === 'w' ? 'X' : 'O';
        if (tttT !== myS) return;
    }
    tttB[i] = tttT;
    tttT = tttT === 'X' ? 'O' : 'X';
    drawTTT();
    updateTTTStatus();
    // Only broadcast in online mode
    if (window.currentGameMode === 'online') {
        window.broadcastMove(tttB);
    }
}

function updateTTTStatus() {
    const turn = tttT === 'X' ? 'X' : 'O';
    window.updateStatus('ttt-status', `תור ${turn}`, true);
}

window.syncLocalGame = function(type, state) {
    if (type === 'tictactoe') { tttB = state; tttT = (tttT === 'X') ? 'O' : 'X'; drawTTT(); updateTTTStatus(); }
};