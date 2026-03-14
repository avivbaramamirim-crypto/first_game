/**
 * דמקה - חוקי תנועה, אכילה והפיכה למלכה
 */
let chkB = [], chkT = 'r', chkSel = null;

function initCheckers() {
    chkB = Array(8).fill(null).map(() => Array(8).fill(null));
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if ((r + c) % 2 !== 0) {
                if (r < 3) chkB[r][c] = { color: 'b', king: false };
                else if (r > 4) chkB[r][c] = { color: 'r', king: false };
            }
        }
    }
    chkT = 'r'; chkSel = null;
    drawCheckers();
}

function drawCheckers() {
    const board = document.getElementById('checkersBoard');
    board.innerHTML = '';
    const flipped = (window.currentGameMode === 'online' && window.getMyRole() === 'b');

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            let dr = flipped ? 7 - r : r;
            let dc = flipped ? 7 - c : c;
            
            const sq = document.createElement('div');
            sq.className = (dr + dc) % 2 === 0 ? 'chk-sq white' : 'chk-sq black';
            sq.style.backgroundColor = (dr + dc) % 2 === 0 ? '#f0d9b5' : '#b58863';
            sq.style.position = 'relative';
            
            if (chkSel && chkSel.r === dr && chkSel.c === dc) sq.style.outline = '3px solid yellow';

            const piece = chkB[dr][dc];
            if (piece) {
                const p = document.createElement('div');
                p.className = 'chk-piece ' + (piece.color === 'r' ? 'red' : 'black');
                p.style.width = '80%'; p.style.height = '80%';
                p.style.borderRadius = '50%';
                p.style.margin = '10%';
                p.style.backgroundColor = piece.color === 'r' ? '#e74c3c' : '#2c3e50';
                p.style.boxShadow = 'inset 0 0 10px rgba(0,0,0,0.5)';
                if (piece.king) {
                    p.innerHTML = '👑'; p.style.display = 'flex'; p.style.alignItems = 'center'; p.style.justifyContent = 'center'; p.style.color = 'gold';
                }
                sq.appendChild(p);
            }
            sq.onclick = () => handleChkClick(dr, dc);
            board.appendChild(sq);
        }
    }
    document.getElementById('chk-status').innerText = "תור ה" + (chkT === 'r' ? 'אדום' : 'שחור');
}

function handleChkClick(r, c) {
    if (window.currentGameMode === 'online') {
        const myColor = window.getMyRole() === 'w' ? 'r' : 'b';
        if (chkT !== myColor) return;
    }

    const p = chkB[r][c];
    if (p && p.color === chkT) {
        chkSel = { r, c };
        drawCheckers();
    } else if (chkSel) {
        moveCheckers(chkSel.r, chkSel.c, r, c);
    }
}

function moveCheckers(fr, fc, tr, tc) {
    const p = chkB[fr][fc];
    const distR = tr - fr;
    const distC = Math.abs(tc - fc);
    const dir = p.color === 'r' ? -1 : 1;

    // חוקי תנועה בסיסיים (פשוט)
    if (distC === 1 && (p.king || distR === dir) && chkB[tr][tc] === null) {
        chkB[tr][tc] = p; chkB[fr][fc] = null;
        completeMove(tr, tc, p);
    } 
    // אכילה
    else if (distC === 2 && Math.abs(distR) === 2) {
        const mr = fr + (tr - fr) / 2;
        const mc = fc + (tc - fc) / 2;
        if (chkB[mr][mc] && chkB[mr][mc].color !== p.color && chkB[tr][tc] === null) {
            chkB[tr][tc] = p; chkB[fr][fc] = null; chkB[mr][mc] = null;
            window.playWoodSound(true);
            completeMove(tr, tc, p);
        }
    }
}

function completeMove(r, c, p) {
    if ((p.color === 'r' && r === 0) || (p.color === 'b' && r === 7)) p.king = true;
    chkSel = null;
    chkT = chkT === 'r' ? 'b' : 'r';
    drawCheckers();
    if (window.currentGameMode === 'online') window.broadcastMove(JSON.stringify(chkB));
    else if (window.currentGameMode === 'ai' && chkT === 'b') setTimeout(aiCheckers, 500);
}

function aiCheckers() {
    // לוגיקת מחשב בסיסית - מחפש מהלך חוקי ראשון
    for(let r=0; r<8; r++) {
        for(let c=0; c<8; c++) {
            if(chkB[r][c] && chkB[r][c].color === 'b') {
                // ניסיון לזוז
                const moves = [[1,1], [1,-1], [2,2], [2,-2]];
                for(let m of moves) {
                    let tr = r + m[0], tc = c + m[1];
                    if(tr>=0 && tr<8 && tc>=0 && tc<8) {
                        moveCheckers(r, c, tr, tc);
                        if(chkT === 'r') return; // המהלך הצליח
                    }
                }
            }
        }
    }
}