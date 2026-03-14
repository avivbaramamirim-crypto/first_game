/**
 * connect4.js
 */
let c4B = [], c4T = 'red';

window.initConnect4 = function() {
    c4B = Array(6).fill(null).map(() => Array(7).fill(null));
    c4T = 'red';
    drawC4();
};

function drawC4() {
    const b = document.getElementById('c4Board');
    b.innerHTML = '';
    const flipped = (window.currentGameMode === 'online' && window.getMyRole() === 'b');
    for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 7; c++) {
            const dr = flipped ? 5 - r : r;
            const sq = document.createElement('div');
            sq.style.backgroundColor = c4B[dr][c] === 'red' ? '#e74c3c' : (c4B[dr][c] === 'yellow' ? '#f1c40f' : '#ecf0f1');
            sq.style.borderRadius = '50%';
            sq.style.width = '40px'; sq.style.height = '40px'; sq.style.margin = '3px';
            sq.onclick = () => handleC4(c);
            b.appendChild(sq);
        }
    }
}

function handleC4(c) {
    if (window.currentGameMode === 'online') {
        const myC = window.getMyRole() === 'w' ? 'red' : 'yellow';
        if (c4T !== myC) return;
    }
    for (let r = 5; r >= 0; r--) {
        if (!c4B[r][c]) {
            c4B[r][c] = c4T;
            c4T = c4T === 'red' ? 'yellow' : 'red';
            drawC4();
            if (window.currentGameMode === 'online') window.broadcastMove(c4B);
            return;
        }
    }
}

window.syncLocalGame = function(type, state) {
    if (type === 'connect4') { c4B = state; c4T = (c4T === 'red') ? 'yellow' : 'red'; drawC4(); }
};