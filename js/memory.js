/**
 * משחק זיכרון - כולל ניקוד ותורות ברורים
 */
const animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
let mCards = [], mFlipped = [], mLock = false;
let mScore = { p1: 0, p2: 0 };
let mCurrentTurn = 'p1';

window.initMemory = function() {
    mScore = { p1: 0, p2: 0 };
    mCurrentTurn = 'p1';
    mFlipped = [];
    mLock = false;
    
    const deck = [...animals, ...animals].sort(() => Math.random() - 0.5);
    mCards = deck.map((a, i) => ({ a, open: false, match: false, id: i }));
    
    updateMemUI();
    drawMem();
};

function drawMem() {
    const b = document.getElementById('memoryBoard');
    if (!b) return;
    b.innerHTML = '';
    // עיצוב רשת דינמי
    b.style.display = 'grid';
    b.style.gridTemplateColumns = 'repeat(4, 1fr)';
    b.style.gap = '10px';
    b.style.padding = '10px';

    mCards.forEach((c, i) => {
        const card = document.createElement('div');
        card.style.aspectRatio = '1/1';
        card.style.background = c.match ? '#2ecc71' : (c.open ? 'white' : 'var(--wood-mid)');
        card.style.border = '3px solid var(--wood-dark)';
        card.style.borderRadius = '8px';
        card.style.display = 'flex';
        card.style.alignItems = 'center';
        card.style.justifyContent = 'center';
        card.style.fontSize = '2.5rem';
        card.style.cursor = 'pointer';
        card.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        card.innerText = (c.open || c.match) ? c.a : '';
        card.onclick = () => handleMemClick(i);
        b.appendChild(card);
    });
}

function handleMemClick(i) {
    if (mLock || mCards[i].open || mCards[i].match) return;
    if (window.currentGameMode === 'ai' && mCurrentTurn === 'p2') return;

    mCards[i].open = true;
    mFlipped.push(i);
    drawMem();

    if (mFlipped.length === 2) {
        mLock = true;
        setTimeout(evaluateMem, 1000);
    }
}

function evaluateMem() {
    const [i1, i2] = mFlipped;
    if (mCards[i1].a === mCards[i2].a) {
        mCards[i1].match = true;
        mCards[i2].match = true;
        mScore[mCurrentTurn]++;
        // השחקן שצדק מקבל עוד תור
    } else {
        mCards[i1].open = false;
        mCards[i2].open = false;
        mCurrentTurn = mCurrentTurn === 'p1' ? 'p2' : 'p1';
    }

    mFlipped = [];
    mLock = false;
    updateMemUI();
    drawMem();

    if (mCards.every(c => c.match)) {
        const winner = mScore.p1 > mScore.p2 ? "שחקן 1" : (mScore.p2 > mScore.p1 ? "המחשב/שחקן 2" : "תיקו");
        window.triggerEndgameAnim('win', `המשחק נגמר! המנצח: ${winner}`);
    } else if (mCurrentTurn === 'p2' && window.currentGameMode === 'ai') {
        setTimeout(aiMemoryMove, 800);
    }
}

function updateMemUI() {
    const turnText = mCurrentTurn === 'p1' ? "תור שלך" : "תור היריב/מחשב";
    window.updateTurnUI('mem-status', turnText, true);
    
    // עדכון ניקוד ב-HTML אם הוספנו אלמנטים
    const scoreEl = document.getElementById('mem-score-box');
    if (scoreEl) {
        scoreEl.innerHTML = `שחקן 1: ${mScore.p1} | יריב: ${mScore.p2}`;
    }
}

function aiMemoryMove() {
    if (mCurrentTurn !== 'p2' || mCards.every(c => c.match)) return;
    
    // בחירה רנדומלית פשוטה למחשב
    const available = mCards.map((c, i) => !c.match && !c.open ? i : null).filter(v => v !== null);
    if (available.length < 2) return;
    
    const choice1 = available.splice(Math.floor(Math.random() * available.length), 1)[0];
    const choice2 = available[Math.floor(Math.random() * available.length)];
    
    handleMemClick(choice1);
    setTimeout(() => handleMemClick(choice2), 500);
}