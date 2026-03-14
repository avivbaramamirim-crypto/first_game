// ==========================================
//  2. דמקה
// ==========================================
let chkB=[], chkT='r', chkSel=null, chkVal=[], chkMJ=null;
function initCheckersBoard() { chkB=Array(8).fill(0).map(()=>Array(8).fill(0)); for(let r=0;r<3;r++)for(let c=0;c<8;c++)if((r+c)%2!==0)chkB[r][c]={color:'b',isKing:false}; for(let r=5;r<8;r++)for(let c=0;c<8;c++)if((r+c)%2!==0)chkB[r][c]={color:'r',isKing:false}; }
function drawCheckers() {
    let d=document.getElementById('checkersBoard'); d.innerHTML='';
    for(let r=0;r<8;r++)for(let c=0;c<8;c++){
        let isD=(r+c)%2!==0, sq=document.createElement('div'); sq.className=`chk-square ${isD?'chk-dark':'chk-light'}`;
        if(chkVal.some(m=>m.toR===r&&m.toC===c)) sq.classList.add('highlight');
        if(chkB[r][c]!==0) { let p=document.createElement('div'); p.className=`chk-piece ${chkB[r][c].color==='r'?'red':'black'} ${chkB[r][c].isKing?'king':''}`; if(chkSel&&chkSel.r===r&&chkSel.c===c) p.classList.add('selected'); sq.appendChild(p); }
        if(isD) sq.addEventListener('click',()=>handleChk(r,c)); d.appendChild(sq);
    }
}
function getCheckersMoves(playerColor, specificBoard = chkB) { let moves = []; for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(specificBoard[r][c]!==0&&specificBoard[r][c].color===playerColor) moves=moves.concat(getPM(r,c,specificBoard)); return moves; }
function getPM(r,c,b) {
    let p=b[r][c]; if(!p)return[]; let m=[]; const allDirs=[[-1,-1],[-1,1],[1,-1],[1,1]], fDirs=p.color==='r'?[[-1,-1],[-1,1]]:[[1,-1],[1,1]];
    if(p.isKing){ allDirs.forEach(d=>{ let s=1, hj=false, jr=-1, jc=-1; while(true) { let tr=r+d[0]*s, tc=c+d[1]*s; if(tr<0||tr>7||tc<0||tc>7)break; if(b[tr][tc]===0){ if(!hj)m.push({fromR:r,fromC:c,toR:tr,toC:tc,isJump:false}); else m.push({fromR:r,fromC:c,toR:tr,toC:tc,isJump:true,jumpR:jr,jumpC:jc}); } else{ if(!hj&&b[tr][tc].color!==p.color){hj=true;jr=tr;jc=tc;} else break; } s++; } }); } 
    else { fDirs.forEach(d=>{ let tr=r+d[0],tc=c+d[1]; if(tr>=0&&tr<=7&&tc>=0&&tc<=7&&b[tr][tc]===0) m.push({fromR:r,fromC:c,toR:tr,toC:tc,isJump:false}); }); allDirs.forEach(d=>{ let tr=r+d[0],tc=c+d[1],jr=r+d[0]*2,jc=c+d[1]*2; if(jr>=0&&jr<=7&&jc>=0&&jc<=7&&b[jr][jc]===0&&b[tr][tc]!==0&&b[tr][tc].color!==p.color) m.push({fromR:r,fromC:c,toR:jr,toC:jc,isJump:true,jumpR:tr,jumpC:tc}); }); } return m;
}
function handleChk(r,c) {
    if(currentGameMode==='ai'&&chkT==='b') return; let p=chkB[r][c], clk=chkVal.find(m=>m.toR===r&&m.toC===c); if(clk) { execChk(clk); return; } if(chkMJ) return;
    const allM = getCheckersMoves(chkT);
    if(p!==0 && p.color===chkT) { const mForP = allM.filter(m=>m.fromR===r&&m.fromC===c); if(mForP.length>0) { playWoodSound(false); chkSel={r,c}; chkVal=mForP; } else { chkSel=null; chkVal=[]; } } else { chkSel=null; chkVal=[]; }
    drawCheckers();
}
function execChk(m) {
    let p=chkB[m.fromR][m.fromC]; chkB[m.toR][m.toC]=p; chkB[m.fromR][m.fromC]=0; if(m.isJump)chkB[m.jumpR][m.jumpC]=0; playWoodSound(m.isJump);
    let k=false; if((p.color==='r'&&m.toR===0)||(p.color==='b'&&m.toR===7)){ if(!p.isKing)k=true; p.isKing=true; } chkSel=null; chkVal=[];
    if(m.isJump && !k) { const fj = getPM(m.toR, m.toC, chkB).filter(x=>x.isJump); if(fj.length>0) { chkMJ={r:m.toR, c:m.toC}; if(currentGameMode==='ai'&&chkT==='b') { drawCheckers(); $('#chk-status').text('המחשב ממשיך לאכול...'); setTimeout(()=>execChk(fj[Math.floor(Math.random()*fj.length)]),600); return; } else { chkSel=chkMJ; chkVal=fj; drawCheckers(); $('#chk-status').html('<span class="status-highlight">אכילה כפולה! בחר יעד.</span>'); return; } } }
    chkMJ=null; drawCheckers(); chkT=chkT==='r'?'b':'r';
    if(getCheckersMoves(chkT).length===0) { if (currentGameMode==='pvp') { document.getElementById('chk-status').innerText='המשחק נגמר!'; triggerEndgameAnim('win','שחקן '+(chkT==='b'?'1 (אדום)':'2 (שחור)')+' ניצח!'); } else { document.getElementById('chk-status').innerText=chkT==='b'?'ניצחת!':'המחשב ניצח!'; setTimeout(()=>chkT==='b'?triggerEndgameAnim('win'):triggerEndgameAnim('lose'),500); } return; }
    if(chkT==='b') { if(currentGameMode==='ai'){ $('#chk-status').text('מחשב חושב...'); setTimeout(aiChk,600); } else { $('#chk-status').text('תור שחור (שחקן 2) לזוז'); } } else { $('#chk-status').text(currentGameMode==='pvp'?'תור אדום (שחקן 1) לזוז':'תור אדום (שלך) לזוז'); }
}
function aiChk() {
    const mvs = getCheckersMoves('b'); if(!mvs.length) return; let bm=mvs[0], bs=-99999;
    for(let i=0;i<mvs.length;i++) {
        let m=mvs[i], tb=chkB.map(r=>r.map(c=>c?{...c}:0)); let p=tb[m.fromR][m.fromC]; tb[m.toR][m.toC]=p; tb[m.fromR][m.fromC]=0; if(m.isJump)tb[m.jumpR][m.jumpC]=0; if(m.toR===7)p.isKing=true;
        let s=0; for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(tb[r][c]!==0){ let v=tb[r][c].isKing?5:1; if(!tb[r][c].isKing&&tb[r][c].color==='b')v+=r*0.1; if(tb[r][c].color==='b')s+=v;else s-=v; }
        if(m.isJump)s+=3; if(getCheckersMoves('r',tb).some(pr=>pr.isJump))s-=4; if(s>bs){bs=s;bm=m;}
    } execChk(bm);
}
function initCheckers() { initCheckersBoard(); chkT='r'; chkSel=null; chkVal=[]; chkMJ=null; $('#chk-status').text(currentGameMode==='pvp'?'תור אדום (שחקן 1)':'תור אדום (שלך) לזוז'); drawCheckers(); }