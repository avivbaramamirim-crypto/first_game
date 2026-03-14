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
    if (sT !== 0) return;
    const r = Math.floor(Math.random() * 6) + 1;
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
    const r = Math.floor(Math.random() * 6) + 1;
    movePlayer(1, r);
}

function updateSnkUI() {
    window.updateStatus('snk-status', sT===0?"תורך":"תור המחשב", true);
    document.getElementById('snk-dice-btn').disabled = (sT !== 0);
}