/**
 * checkers.js
 */
let chkB = [], chkT = 'r', chkS = null;

window.initCheckers = function() {
    chkB = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 !== 0) chkB[r][c] = { color: 'b', king: false };
    for (let r = 5; r < 8; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 !== 0) chkB[r][c] = { color: 'r', king: false };
    chkT = 'r'; chkS = null;
    drawCheckers();
    updateChkStatus();
};

function drawCheckers() {
    const board = document.getElementById('checkersBoard');
    board.innerHTML = '';
    const flipped = (window.currentGameMode === 'online' && window.getMyRole() === 'b');

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let dr = flipped ? 7 - r : r;
            let dc = flipped ? 7 - c : c;
            const sq = document.createElement('div');
            sq.style.backgroundColor = (dr + dc) % 2 === 0 ? '#f0d9b5' : '#b58863';
            sq.style.display = 'flex'; sq.style.justifyContent = 'center'; sq.style.alignItems = 'center';
            if (chkS && chkS.r === dr && chkS.c === dc) sq.style.boxShadow = 'inset 0 0 10px yellow';

            const p = chkB[dr][dc];
            if (p) {
                const div = document.createElement('div');
                div.style.width = '80%'; div.style.height = '80%'; div.style.borderRadius = '50%';
                div.style.backgroundColor = p.color === 'r' ? '#e74c3c' : '#2c3e50';
                if (p.king) div.innerHTML = '👑';
                sq.appendChild(div);
            }
            sq.onclick = () => handleChk(dr, dc);
            board.appendChild(sq);
        }
    }
}

function handleChk(r, c) {
    if (window.currentGameMode === 'online') {
        const myC = window.getMyRole() === 'w' ? 'r' : 'b';
        if (chkT !== myC) return;
    }
    const p = chkB[r][c];
    if (p && p.color === chkT) { chkS = { r, c }; drawCheckers(); }
    else if (chkS) { 
        if (Math.abs(r - chkS.r) === 1 && !chkB[r][c]) {
            chkB[r][c] = chkB[chkS.r][chkS.c]; chkB[chkS.r][chkS.c] = null;
            chkT = chkT === 'r' ? 'b' : 'r'; chkS = null; drawCheckers();
            updateChkStatus();
            if (window.currentGameMode === 'online') window.broadcastMove(chkB);
        }
    }
}

function updateChkStatus() {
    const turn = chkT === 'r' ? 'אדום' : 'שחור';
    window.updateStatus('chk-status', `תור ${turn}`, true);
}

window.syncLocalGame = function(type, state) {
    if (type === 'checkers') { chkB = state; chkT = (chkT === 'r') ? 'b' : 'r'; drawCheckers(); updateChkStatus(); }
};