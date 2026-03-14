/**
 * tictactoe.js
 */
let tttB = Array(9).fill(null), tttT = 'X';

window.initTicTacToe = function() {
    tttB = Array(9).fill(null); tttT = 'X';
    drawTTT();
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
    if (window.currentGameMode === 'online') {
        const myS = window.getMyRole() === 'w' ? 'X' : 'O';
        if (tttT !== myS) return;
    }
    tttB[i] = tttT;
    tttT = tttT === 'X' ? 'O' : 'X';
    drawTTT();
    if (window.currentGameMode === 'online') window.broadcastMove(tttB);
}

window.syncLocalGame = function(type, state) {
    if (type === 'tictactoe') { tttB = state; tttT = (tttT === 'X') ? 'O' : 'X'; drawTTT(); }
};