/**
 * איקס עיגול - חוקים פשוטים וסנכרון
 */
let tttB = Array(9).fill(null), tttT = 'X', tttAct = true;

function initTicTacToe() {
    tttB = Array(9).fill(null); tttT = 'X'; tttAct = true;
    drawTicTacToe();
}

function drawTicTacToe() {
    const board = document.getElementById('tttBoard');
    board.innerHTML = '';
    tttB.forEach((val, i) => {
        const sq = document.createElement('div');
        sq.className = 'ttt-sq';
        sq.style.backgroundColor = '#ecf0f1';
        sq.style.display = 'flex'; sq.style.alignItems = 'center'; sq.style.justifyContent = 'center';
        sq.style.fontSize = '2.5rem'; sq.style.fontWeight = 'bold'; sq.style.cursor = 'pointer';
        sq.innerText = val || '';
        sq.style.color = val === 'X' ? '#e74c3c' : '#2c3e50';
        sq.onclick = () => handleTTTClick(i);
        board.appendChild(sq);
    });
    document.getElementById('ttt-status').innerText = "תור ה-" + tttT;
}

function handleTTTClick(i) {
    if (!tttAct || tttB[i]) return;
    if (window.currentGameMode === 'online') {
        const mySign = window.getMyRole() === 'w' ? 'X' : 'O';
        if (tttT !== mySign) return;
    }

    tttB[i] = tttT;
    window.playWoodSound(false);
    
    if (checkTTTWin()) {
        drawTicTacToe();
        tttAct = false;
        triggerEndgameAnim('win', "השחקן " + tttT + " ניצח!");
    } else if (tttB.every(v => v)) {
        drawTicTacToe();
        triggerEndgameAnim('draw');
    } else {
        tttT = tttT === 'X' ? 'O' : 'X';
        drawTicTacToe();
        if (window.currentGameMode === 'online') window.broadcastMove(JSON.stringify(tttB));
        else if (window.currentGameMode === 'ai' && tttT === 'O') setTimeout(aiTicTacToe, 400);
    }
}

function checkTTTWin() {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return wins.some(w => tttB[w[0]] && tttB[w[0]] === tttB[w[1]] && tttB[w[0]] === tttB[w[2]]);
}

function aiTicTacToe() {
    const empty = tttB.map((v, i) => v === null ? i : null).filter(v => v !== null);
    if (empty.length > 0) handleTTTClick(empty[Math.floor(Math.random() * empty.length)]);
}