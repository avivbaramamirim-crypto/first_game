const icons = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
let mCards = [], mFlipped = [], mLock = false;
let mScore = { p1: 0, p2: 0 }, mTurn = 'p1';

window.initMemory = function() {
    mScore = { p1: 0, p2: 0 }; mTurn = 'p1'; mFlipped = []; mLock = false;
    const deck = [...icons, ...icons].sort(() => Math.random() - 0.5);
    mCards = deck.map((a, i) => ({ a, open: false, match: false }));
    updateMemUI();
    drawMem();
};

function drawMem() {
    const b = document.getElementById('memoryBoard');
    b.innerHTML = '';
    b.style.display = 'grid'; b.style.gridTemplateColumns = 'repeat(4, 1fr)'; b.style.gap = '10px'; b.style.padding = '10px';

    mCards.forEach((c, i) => {
        const card = document.createElement('div');
        card.style.aspectRatio = '1/1';
        card.style.background = c.match ? '#a5d6a7' : (c.open ? 'white' : 'var(--primary-wood)');
        card.style.border = '4px solid var(--dark-wood)';
        card.style.borderRadius = '10px';
        card.style.display = 'flex'; card.style.alignItems = 'center'; card.style.justifyContent = 'center';
        card.style.fontSize = '2.5rem'; card.style.cursor = 'pointer';
        card.innerText = (c.open || c.match) ? c.a : '';
        card.onclick = () => handleMemClick(i);
        b.appendChild(card);
    });
}

function handleMemClick(i) {
    if (mLock || mCards[i].open || mCards[i].match) return;
    if (window.currentGameMode === 'ai' && mTurn === 'p2') return;

    mCards[i].open = true; mFlipped.push(i);
    drawMem();

    if (mFlipped.length === 2) {
        mLock = true;
        setTimeout(checkMatch, 1000);
    }
}

function checkMatch() {
    const [i1, i2] = mFlipped;
    if (mCards[i1].a === mCards[i2].a) {
        mCards[i1].match = true; mCards[i2].match = true;
        mScore[mTurn]++;
    } else {
        mCards[i1].open = false; mCards[i2].open = false;
        mTurn = mTurn === 'p1' ? 'p2' : 'p1';
    }
    mFlipped = []; mLock = false;
    updateMemUI(); drawMem();

    if (mCards.every(c => c.match)) {
        const winText = mScore.p1 > mScore.p2 ? "ניצחת!" : "המחשב ניצח";
        window.triggerEndgameAnim('win', winText);
    } else if (mTurn === 'p2' && window.currentGameMode === 'ai') {
        setTimeout(aiMemMove, 800);
    }
}

function updateMemUI() {
    const turnName = mTurn === 'p1' ? "תורך" : (window.currentGameMode === 'ai' ? "מחשב חושב..." : "תור יריב");
    window.updateStatus('mem-status', turnName, true);
    const scoreBox = document.getElementById('mem-score-box');
    if (scoreBox) scoreBox.innerText = `אתה: ${mScore.p1} | יריב: ${mScore.p2}`;
}

function aiMemMove() {
    const avail = mCards.map((c,i) => !c.match && !c.open ? i : null).filter(v => v !== null);
    if (avail.length < 2) return;
    const c1 = avail.splice(Math.floor(Math.random() * avail.length), 1)[0];
    handleMemClick(c1);
    const avail2 = mCards.map((c,i) => !c.match && !c.open ? i : null).filter(v => v !== null);
    const c2 = avail2[Math.floor(Math.random() * avail2.length)];
    setTimeout(() => handleMemClick(c2), 600);
}