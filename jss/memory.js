// ==========================================
// 6. זיכרון
// ==========================================
const emojis=['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼']; let mC=[], mF1=null, mF2=null, mLk=false, mPr=0, mS1=0, mS2=0, mTr='p1', mSn=new Set(), mTg=null;
function updMemS() { $('#mem-score-player').text(mS1); $('#mem-score-ai').text(mS2); }
function initMemory() {
    $('#memoryBoard').empty(); mPr=0; mS1=0; mS2=0; mTr='p1'; mF1=null; mF2=null; mLk=false; mSn.clear(); mTg=null;
    $('#mem-p1-label').text(currentGameMode==='pvp'?'שחקן 1:':'אתה:'); $('#mem-p2-label').text(currentGameMode==='pvp'?'שחקן 2:':'מחשב:'); $('#mem-status').text(currentGameMode==='pvp'?'תור שחקן 1 (ירוק)':'תור אדום (שלך)'); updMemS();
    let d=[...emojis,...emojis].sort(()=>Math.random()-0.5); mC=d.map((a,i)=>({a,f:false,m:false,id:i}));
    mC.forEach((c,i)=>{ let e=$(`<div class="mem-card" id="mem-${i}"><div class="mem-inner"><div class="mem-front"></div><div class="mem-back">${c.a}</div></div></div>`); e.click(()=>handleMem(i)); $('#memoryBoard').append(e); });
}
function flipM(i){ mC[i].f=true; $(`#mem-${i}`).addClass('flipped'); playWoodSound(false); }
function handleMem(i) { if(mLk||mC[i].f||mC[i].m||(currentGameMode==='ai'&&mTr==='p2'))return; flipM(i); mSn.add(i); if(mF1===null)mF1=i; else{mF2=i;mLk=true;setTimeout(()=>evalMem(mTr),1000);} }
function evalMem(w) {
    if(mC[mF1].a===mC[mF2].a) {
        playWoodSound(true); mC[mF1].m=true; mC[mF2].m=true; $(`#mem-${mF1}, #mem-${mF2}`).addClass('matched'); mPr++; w==='p1'?mS1++:mS2++; updMemS(); mF1=null; mF2=null;
        if(mPr===8) { setTimeout(()=>{if(mS1>mS2)triggerEndgameAnim('win',currentGameMode==='pvp'?'שחקן 1 ניצח!':null); else if(mS2>mS1)triggerEndgameAnim(currentGameMode==='pvp'?'win':'lose',currentGameMode==='pvp'?'שחקן 2 ניצח!':null); else triggerEndgameAnim('draw');},500); } else { if(w==='p2'&&currentGameMode==='ai')setTimeout(aiMem1,1000); else mLk=false; }
    } else {
        mC[mF1].f=false; mC[mF2].f=false; $(`#mem-${mF1}, #mem-${mF2}`).removeClass('flipped'); playWoodSound(false); mF1=null; mF2=null; mTr=mTr==='p1'?'p2':'p1';
        if(mTr==='p2'){ if(currentGameMode==='ai'){$('#mem-status').text('מחשב (זוכר)...'); setTimeout(aiMem1,1000);}else{$('#mem-status').html('<span style="color:#c0392b">תור שחקן 2</span>'); mLk=false;} } else { $('#mem-status').html('<span style="color:#27ae60">תור שחקן 1</span>'); mLk=false; }
    }
}
function aiMem1() {
    if(mPr>=8)return; let k=Array.from(mSn).filter(i=>!mC[i].m), pf=null; for (let i = 0; i < k.length; i++) for (let j = i + 1; j < k.length; j++) if (mC[k[i]].a === mC[k[j]].a) { pf = [k[i], k[j]]; break; }
    let f; if (pf) { f = pf[0]; mTg = pf[1]; } else { let u = mC.filter(c => !c.m && !mSn.has(c.id)); if (u.length > 0) f = u[Math.floor(Math.random() * u.length)].id; else f = mC.find(c => !c.m).id; mTg = null; }
    flipM(f); mF1 = f; mSn.add(f); setTimeout(aiMem2, 1000);
}
function aiMem2() {
    let s; if (mTg !== null) s = mTg; else { let m = Array.from(mSn).find(i => !mC[i].m && i !== mF1 && mC[i].a === mC[mF1].a); if (m !== undefined) s = m; else { let u = mC.filter(c => !c.m && !mSn.has(c.id)); if (u.length > 0) s = u[Math.floor(Math.random() * u.length)].id; else s = mC.find(c => !c.m && c.id !== mF1).id; } }
    flipM(s); mF2 = s; mSn.add(s); setTimeout(() => evalMem('p2'), 1000);
}