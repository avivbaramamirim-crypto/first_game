// ==========================================
// 4. ארבע בשורה
// ==========================================
let c4B=[], c4T='red', c4Act=false;
function initConnect4() { c4B=Array(6).fill(0).map(()=>Array(7).fill(null)); c4T='red'; c4Act=true; $('#c4Board').empty(); for(let r=0;r<6;r++)for(let c=0;c<7;c++){ let d=$(`<div class="c4-cell" data-c="${c}"></div>`); d.click(()=>clkC4(c)); $('#c4Board').append(d); } $('#c4-status').text(currentGameMode==='pvp'?'תור שחקן 1 (אדום)':'תור שלך (אדום)'); }
function clkC4(c) {
    if(!c4Act)return; let r=5; while(r>=0&&c4B[r][c]!==null)r--; if(r<0)return;
    c4B[r][c]=c4T; let p=$(`<div class="c4-piece ${c4T}"></div>`); $(`#c4Board .c4-cell[data-c='${c}']`).eq(r).append(p); setTimeout(()=>p.addClass('dropped'),50); playWoodSound(false);
    if(chkC4Win(r,c,c4T)){ c4Act=false; setTimeout(()=>triggerEndgameAnim(c4T==='red'?'win':(currentGameMode==='pvp'?'win':'lose'), c4T==='red'?'אדום ניצח!':'צהוב ניצח!'), 600); return; }
    if(c4B[0].every(x=>x!==null)){ c4Act=false; setTimeout(()=>triggerEndgameAnim('draw'),600); return; }
    c4T=c4T==='red'?'yellow':'red';
    if(currentGameMode==='ai'&&c4T==='yellow'){ $('#c4-status').text('מחשב חושב...'); c4Act=false; setTimeout(aiC4, 600); } else { $('#c4-status').text(c4T==='red'?'תור שחקן 1 (אדום)':'תור שחקן 2 (צהוב)'); }
}
function chkC4Win(r,c,p) { let d=[[0,1],[1,0],[1,1],[1,-1]]; return d.some(dir=>{ let cnt=1; for(let i=1;i<4;i++){ let nr=r+dir[0]*i, nc=c+dir[1]*i; if(nr>=0&&nr<6&&nc>=0&&nc<7&&c4B[nr][nc]===p)cnt++; else break; } for(let i=1;i<4;i++){ let nr=r-dir[0]*i, nc=c-dir[1]*i; if(nr>=0&&nr<6&&nc>=0&&nc<7&&c4B[nr][nc]===p)cnt++; else break; } return cnt>=4; }); }
function aiC4() {
    let valid = []; for(let c=0;c<7;c++){ let r=5; while(r>=0&&c4B[r][c]!==null)r--; if(r>=0) valid.push({c:c, r:r}); }
    if(valid.length===0) return;
    for(let i=0; i<valid.length; i++) { c4B[valid[i].r][valid[i].c] = 'yellow'; if(chkC4Win(valid[i].r, valid[i].c, 'yellow')) { c4B[valid[i].r][valid[i].c] = null; c4Act=true; clkC4(valid[i].c); return; } c4B[valid[i].r][valid[i].c] = null; }
    for(let i=0; i<valid.length; i++) { c4B[valid[i].r][valid[i].c] = 'red'; if(chkC4Win(valid[i].r, valid[i].c, 'red')) { c4B[valid[i].r][valid[i].c] = null; c4Act=true; clkC4(valid[i].c); return; } c4B[valid[i].r][valid[i].c] = null; }
    c4Act=true; clkC4(valid[Math.floor(Math.random()*valid.length)].c);
}