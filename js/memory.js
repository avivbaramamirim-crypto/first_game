/**
 * memory.js
 */
const animals = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
let mCards = [], mFlipped = [];

window.initMemory = function() {
    const deck = [...animals, ...animals].sort(() => Math.random() - 0.5);
    mCards = deck.map((a, i) => ({ a, open: false, match: false }));
    mFlipped = [];
    drawMem();
};

function drawMem() {
    const b = document.getElementById('memoryBoard');
    b.innerHTML = '';
    mCards.forEach((c, i) => {
        const sq = document.createElement('div');
        sq.style.backgroundColor = (c.open || c.match) ? 'white' : '#b58863';
        sq.style.height = '70px'; sq.style.display = 'flex'; sq.style.alignItems = 'center'; sq.style.justifyContent = 'center';
        sq.style.fontSize = '2em'; sq.style.borderRadius = '8px';
        sq.innerText = (c.open || c.match) ? c.a : '';
        sq.onclick = () => handleMem(i);
        b.appendChild(sq);
    });
}

function handleMem(i) {
    if (mCards[i].open || mCards[i].match || mFlipped.length === 2) return;
    mCards[i].open = true;
    mFlipped.push(i);
    drawMem();
    if (mFlipped.length === 2) {
        setTimeout(() => {
            if (mCards[mFlipped[0]].a === mCards[mFlipped[1]].a) {
                mCards[mFlipped[0]].match = true; mCards[mFlipped[1]].match = true;
            } else {
                mCards[mFlipped[0]].open = false; mCards[mFlipped[1]].open = false;
            }
            mFlipped = []; drawMem();
        }, 1000);
    }
}