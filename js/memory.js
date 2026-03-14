// ==========================================
// 6. משחק זיכרון (גרסה מעודכנת)
// ==========================================
const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
let mC = [], mF1 = null, mF2 = null, mLk = false, mPr = 0;
let mS1 = 0, mS2 = 0, mTr = 'p1', mSn = new Set(), mTg = null;

function updateMemoryScore() {
    const s1 = document.getElementById('mem-score-player');
    const s2 = document.getElementById('mem-score-ai');
    if (s1) s1.innerText = mS1;
    if (s2) s2.innerText = mS2;
}

function initMemory() {
    const board = document.getElementById('memoryBoard');
    if (!board) return;
    
    board.innerHTML = '';
    mPr = 0; mS1 = 0; mS2 = 0; mTr = 'p1'; mF1 = null; mF2 = null; mLk = false; mSn.clear(); mTg = null;
    
    const p1Label = document.getElementById('mem-p1-label');
    const p2Label = document.getElementById('mem-p2-label');
    if (p1Label) p1Label.innerText = currentGameMode === 'pvp' ? 'שחקן 1:' : 'אתה:';
    if (p2Label) p2Label.innerText = currentGameMode === 'pvp' ? 'שחקן 2:' : 'מחשב:';
    
    document.getElementById('mem-status').innerText = 'מצא את כל הזוגות!';
    updateMemoryScore();

    let deck = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
    mC = deck.map((animal, index) => ({ animal, flipped: false, matched: false, id: index }));

    mC.forEach((card, i) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'mem-card';
        cardEl.id = 'mem-' + i;
        cardEl.innerHTML = `<div class="mem-inner"><div class="mem-front"></div><div class="mem-back">${card.animal}</div></div>`;
        cardEl.onclick = () => handleMem(i);
        board.appendChild(cardEl);
    });
}

function flipM(i) {
    mC[i].flipped = true;
    document.getElementById('mem-' + i).classList.add('flipped');
    if (typeof playWoodSound === 'function') playWoodSound(false);
}

function handleMem(i) {
    if (mLk || mC[i].flipped || mC[i].matched) return;
    if (currentGameMode === 'ai' && mTr === 'p2') return;

    flipM(i);
    mSn.add(i);

    if (mF1 === null) {
        mF1 = i;
    } else {
        mF2 = i;
        mLk = true;
        setTimeout(() => evalMem(mTr), 1000);
    }
}

function evalMem(who) {
    if (mC[mF1].animal === mC[mF2].animal) {
        if (typeof playWoodSound === 'function') playWoodSound(true);
        mC[mF1].matched = true;
        mC[mF2].matched = true;
        document.getElementById('mem-' + mF1).classList.add('matched');
        document.getElementById('mem-' + mF2).classList.add('matched');
        
        mPr++;
        who === 'p1' ? mS1++ : mS2++;
        updateMemoryScore();
        mF1 = null; mF2 = null;
        
        if (mPr === 8) {
            setTimeout(() => {
                if (mS1 > mS2) triggerEndgameAnim('win', currentGameMode === 'pvp' ? 'שחקן 1 ניצח!' : null);
                else if (mS2 > mS1) triggerEndgameAnim(currentGameMode === 'pvp' ? 'win' : 'lose', currentGameMode === 'pvp' ? 'שחקן 2 ניצח!' : null);
                else triggerEndgameAnim('draw');
            }, 500);
        } else {
            if (who === 'p2' && currentGameMode === 'ai') setTimeout(aiMem1, 1000);
            else mLk = false;
        }
    } else {
        mC[mF1].flipped = false;
        mC[mF2].flipped = false;
        document.getElementById('mem-' + mF1).classList.remove('flipped');
        document.getElementById('mem-' + mF2).classList.remove('flipped');
        mF1 = null; mF2 = null;
        
        mTr = (mTr === 'p1') ? 'p2' : 'p1';
        if (mTr === 'p2') {
            if (currentGameMode === 'ai') {
                document.getElementById('mem-status').innerText = 'המחשב חושב...';
                setTimeout(aiMem1, 1000);
            } else {
                document.getElementById('mem-status').innerHTML = '<span style="color:#c0392b">תור שחקן 2</span>';
                mLk = false;
            }
        } else {
            document.getElementById('mem-status').innerHTML = '<span style="color:#27ae60">תור שחקן 1</span>';
            mLk = false;
        }
    }
}

// לוגיקת מחשב למשחק זיכרון
function aiMem1() {
    if (mPr >= 8) return;
    let k = Array.from(mSn).filter(i => !mC[i].matched);
    let pf = null;
    for (let i = 0; i < k.length; i++) {
        for (let j = i + 1; j < k.length; j++) {
            if (mC[k[i]].animal === mC[k[j]].animal) { pf = [k[i], k[j]]; break; }
        }
        if (pf) break;
    }
    let f;
    if (pf) { f = pf[0]; mTg = pf[1]; } 
    else {
        let u = mC.filter(c => !c.matched && !mSn.has(c.id));
        if (u.length > 0) f = u[Math.floor(Math.random() * u.length)].id;
        else f = mC.find(c => !c.matched).id;
        mTg = null;
    }
    flipM(f); mF1 = f; mSn.add(f);
    setTimeout(aiMem2, 1000);
}

function aiMem2() {
    let s;
    if (mTg !== null) s = mTg;
    else {
        let match = Array.from(mSn).find(i => !mC[i].matched && i !== mF1 && mC[i].animal === mC[mF1].animal);
        if (match !== undefined) s = match;
        else {
            let u = mC.filter(c => !c.matched && !mSn.has(c.id));
            if (u.length > 0) s = u[Math.floor(Math.random() * u.length)].id;
            else s = mC.find(c => !c.matched && c.id !== mF1).id;
        }
    }
    flipM(s); mF2 = s; mSn.add(s);
    setTimeout(() => evalMem('p2'), 1000);
}