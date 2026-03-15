const icons = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🦁', '🐯', '🐸', '🦜', '🦚', '🦩', '🦢'];
let mCards = [], mFlipped = [], mLock = false;
let mScore = { p1: 0, p2: 0 }, mTurn = 'p1';

// Local helper – allows AI mode to work without external wiring
function getMemoryMode() {
    if (typeof window !== 'undefined' && window.currentGameMode) {
        return window.currentGameMode;
    }
    // Default to AI vs Human when no global mode is defined
    return 'ai';
}

window.initMemory = function() {
    console.log('Initializing Memory game...');
    
    // Reset all game state first
    mScore = { p1: 0, p2: 0 }; 
    mTurn = 'p1'; 
    mFlipped = []; 
    mLock = false;
    
    const boardEl = document.getElementById('memoryBoard');
    if (!boardEl) {
        console.error('Memory board element not found');
        return;
    }
    
    console.log('Memory board element found, clearing and drawing...');
    
    // Force clean DOM
    boardEl.innerHTML = '';
    
    // Initialize game data
    const deck = [...icons, ...icons].sort(() => Math.random() - 0.5);
    mCards = deck.map((a, i) => ({ a, open: false, match: false }));
    
    console.log('Memory game state initialized, drawing board...');
    
    updateMemUI();
    drawMem();
    
    console.log('Memory initialization completed');
};

function drawMem() {
    const b = document.getElementById('memoryBoard');
    b.innerHTML = '';
    b.style.setProperty('display', 'grid', 'important'); // Force grid display
    b.style.gridTemplateColumns = 'repeat(8, 1fr)'; 
    b.style.gap = '15px'; 
    b.style.padding = '20px';
    b.style.background = '#2c3e50';
    b.style.borderRadius = '15px';
    b.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
    b.style.width = '600px';
    b.style.margin = '0 auto';

    mCards.forEach((c, i) => {
        const card = document.createElement('div');
        card.style.aspectRatio = '1/1';
        card.style.borderRadius = '12px';
        card.style.display = 'flex'; 
        card.style.alignItems = 'center'; 
        card.style.justifyContent = 'center';
        card.style.fontSize = '2.5rem'; 
        card.style.cursor = 'pointer';
        card.style.transition = 'all 0.3s ease';
        card.style.border = '3px solid #34495e';
        
        if (c.match) {
            card.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
            card.style.color = 'white';
            card.style.boxShadow = '0 2px 8px rgba(46, 204, 113, 0.4)';
            card.style.transform = 'scale(0.95)';
        } else if (c.open) {
            card.style.background = 'linear-gradient(135deg, #ecf0f1, #bdc3c7)';
            card.style.color = '#2c3e50';
            card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
            card.style.transform = 'scale(1.02)';
        } else {
            card.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
            card.style.color = 'transparent';
            card.style.boxShadow = '0 2px 8px rgba(52, 152, 219, 0.3)';
        }
        
        card.onmouseover = () => {
            if (!c.match && !c.open && !mLock) {
                card.style.transform = 'scale(1.05)';
                card.style.boxShadow = '0 4px 12px rgba(52, 152, 219, 0.5)';
            }
        };
        card.onmouseout = () => {
            if (!c.match && !c.open) {
                card.style.transform = c.match ? 'scale(0.95)' : 'scale(1)';
                card.style.boxShadow = c.match ? '0 2px 8px rgba(46, 204, 113, 0.4)' : '0 2px 8px rgba(52, 152, 219, 0.3)';
            }
        };
        
        card.innerText = (c.open || c.match) ? c.a : '';
        card.onclick = () => handleMemClick(i);
        b.appendChild(card);
    });
}

function handleMemClick(i) {
    console.log('Memory click - Position:', i, 'Current turn:', mTurn, 'Mode:', window.currentGameMode, 'Card state:', mCards[i]);
    
    if (mLock || mCards[i].open || mCards[i].match) return;
    // במצב הנוכחי – אין מהלכי מחשב, שני שחקנים אנושיים בלבד

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
        const winText = mScore.p1 > mScore.p2 ? "שחקן 1 ניצח!" : (mScore.p1 < mScore.p2 ? "שחקן 2 ניצח!" : "תיקו!");
        window.triggerEndgameAnim('win', winText);
    }
}

function updateMemUI() {
    const turnName = mTurn === 'p1'
        ? "תורך"
        : (getMemoryMode() === 'ai' ? "מחשב חושב..." : "תור יריב");
    window.updateStatus('mem-status', turnName, true);
    const scoreBox = document.getElementById('mem-score-box');
    if (scoreBox) scoreBox.innerText = `אתה: ${mScore.p1} | יריב: ${mScore.p2}`;
}

function aiMemMove() {
    console.log('Memory AI move - Current turn:', mTurn, 'Mode:', window.currentGameMode, 'Lock:', mLock);
    
    if (mLock) {
        console.log('Memory is locked - AI waiting');
        return;
    }
    
    const availableCards = mCards.map((c,i) => !c.match && !c.open ? i : null).filter(v => v !== null);
    console.log('Available cards for AI:', availableCards.length);
    
    if (availableCards.length < 2) {
        console.log('Not enough cards available for AI');
        return;
    }
    
    // Lock the game while AI thinks
    mLock = true;
    console.log('Memory locked for AI move');
    
    // AI difficulty-based strategy
    let firstCard = null;
    let secondCard = null;
    
    if (window.aiDifficulty === 'easy') {
        // Easy: Simple random with basic memory
        // First, check if we know any matching pairs from previous flips
        for (let i = 0; i < availableCards.length; i++) {
            for (let j = i + 1; j < availableCards.length; j++) {
                if (mCards[availableCards[i]].a === mCards[availableCards[j]].a) {
                    // Found a known match!
                    firstCard = availableCards[i];
                    secondCard = availableCards[j];
                    console.log('Easy AI found a known matching pair!');
                    break;
                }
            }
            if (firstCard) break;
        }
        
        // If no known match, use simple strategy
        if (!firstCard) {
            // Flip cards we haven't seen before
            const unseenCards = availableCards.filter(i => !mCards[i].wasSeen);
            if (unseenCards.length >= 2) {
                firstCard = unseenCards[Math.floor(Math.random() * unseenCards.length)];
                const remainingCards = unseenCards.filter(i => i !== firstCard);
                secondCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];
            } else if (unseenCards.length === 1) {
                firstCard = unseenCards[0];
                const seenCards = availableCards.filter(i => mCards[i].wasSeen);
                secondCard = seenCards[Math.floor(Math.random() * seenCards.length)];
            } else {
                // All cards seen, pick randomly
                firstCard = availableCards[Math.floor(Math.random() * availableCards.length)];
                const remainingCards = availableCards.filter(i => i !== firstCard);
                secondCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];
            }
        }
    } else if (window.aiDifficulty === 'medium') {
        // Medium: Better memory and strategy
        // First, check if we know any matching pairs from previous flips
        for (let i = 0; i < availableCards.length; i++) {
            for (let j = i + 1; j < availableCards.length; j++) {
                if (mCards[availableCards[i]].a === mCards[availableCards[j]].a) {
                    // Found a known match!
                    firstCard = availableCards[i];
                    secondCard = availableCards[j];
                    console.log('Medium AI found a known matching pair!');
                    break;
                }
            }
            if (firstCard) break;
        }
        
        // If no known match, use smarter strategy
        if (!firstCard) {
            // Prioritize cards seen recently
            const seenCards = availableCards.filter(i => mCards[i].wasSeen);
            const unseenCards = availableCards.filter(i => !mCards[i].wasSeen);
            
            if (seenCards.length >= 2) {
                // Pick two recently seen cards
                const sortedByTime = seenCards.sort((a, b) => (mCards[b].lastSeen || 0) - (mCards[a].lastSeen || 0));
                firstCard = sortedByTime[0];
                secondCard = sortedByTime[1];
            } else if (seenCards.length === 1 && unseenCards.length >= 1) {
                firstCard = seenCards[0];
                secondCard = unseenCards[Math.floor(Math.random() * unseenCards.length)];
            } else {
                // Pick unseen cards first
                if (unseenCards.length >= 2) {
                    firstCard = unseenCards[Math.floor(Math.random() * unseenCards.length)];
                    const remainingCards = unseenCards.filter(i => i !== firstCard);
                    secondCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];
                } else {
                    firstCard = availableCards[Math.floor(Math.random() * availableCards.length)];
                    const remainingCards = availableCards.filter(i => i !== firstCard);
                    secondCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];
                }
            }
        }
    } else {
        // Hard: Perfect memory and optimal strategy
        // First, check if we know any matching pairs from previous flips
        for (let i = 0; i < availableCards.length; i++) {
            for (let j = i + 1; j < availableCards.length; j++) {
                if (mCards[availableCards[i]].a === mCards[availableCards[j]].a) {
                    // Found a known match!
                    firstCard = availableCards[i];
                    secondCard = availableCards[j];
                    console.log('Hard AI found a known matching pair!');
                    break;
                }
            }
            if (firstCard) break;
        }
        
        // If no known match, use optimal strategy
        if (!firstCard) {
            // Create a memory map of all card positions
            const cardMap = {};
            availableCards.forEach(i => {
                const icon = mCards[i].a;
                if (!cardMap[icon]) cardMap[icon] = [];
                cardMap[icon].push(i);
            });
            
            // Find pairs we can complete
            for (const icon in cardMap) {
                if (cardMap[icon].length >= 2) {
                    firstCard = cardMap[icon][0];
                    secondCard = cardMap[icon][1];
                    break;
                }
            }
            
            // If no pairs available, use strategic discovery
            if (!firstCard) {
                // Pick cards that will give us most information
                const unseenCards = availableCards.filter(i => !mCards[i].wasSeen);
                if (unseenCards.length > 0) {
                    firstCard = unseenCards[Math.floor(Math.random() * unseenCards.length)];
                    
                    // For second card, prefer one that might form a future pair
                    const firstIcon = mCards[firstCard].a;
                    const potentialMatches = availableCards.filter(i => 
                        i !== firstCard && mCards[i].a === firstIcon
                    );
                    
                    if (potentialMatches.length > 0) {
                        secondCard = potentialMatches[0];
                    } else {
                        const remainingCards = availableCards.filter(i => i !== firstCard);
                        secondCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];
                    }
                } else {
                    // All cards seen, pick strategically
                    // Pick cards that we haven't matched yet
                    const unmatchedIcons = new Set();
                    availableCards.forEach(i => {
                        if (!mCards[i].match) unmatchedIcons.add(mCards[i].a);
                    });
                    
                    const strategicCards = availableCards.filter(i => 
                        unmatchedIcons.has(mCards[i].a)
                    );
                    
                    if (strategicCards.length >= 2) {
                        firstCard = strategicCards[0];
                        secondCard = strategicCards[1];
                    } else {
                        firstCard = availableCards[Math.floor(Math.random() * availableCards.length)];
                        const remainingCards = availableCards.filter(i => i !== firstCard);
                        secondCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];
                    }
                }
            }
        }
    }
    
    // Mark cards as seen when we flip them
    const markCardAsSeen = (index) => {
        if (!mCards[index].wasSeen) {
            mCards[index].wasSeen = true;
            mCards[index].lastSeen = Date.now();
        }
    };
    
    // Execute the moves
    handleMemClick(firstCard);
    markCardAsSeen(firstCard);
    
    setTimeout(() => {
        handleMemClick(secondCard);
        markCardAsSeen(secondCard);
        console.log(`AI (${window.aiDifficulty}) flipped cards:`, mCards[firstCard].a, 'and', mCards[secondCard].a);
    }, 600);
}