// ==========================================
// 5. סולמות ונחשים
// ==========================================
let snkB=[], snkP={p1:0,p2:0}, snkT='p1'; const lads={7:28,22:43,34:57,45:66,60:81,72:91}, snks={29:9,47:26,55:36,74:51,88:67,98:79};
function initSnakesBoard() { let d=document.getElementById('snakesBoard'); d.innerHTML=''; snkB=[]; for(let r=9;r>=0;r--)for(let c=0;c<10;c++){ let n=(r%2!==0)?(r*10)+c+1:(r*10)+(9-c)+1, cell=document.createElement('div'); cell.className='snk-square'; cell.innerHTML=n; let cnt=document.createElement('div'); cnt.className='snk-content'; if(lads[n])cnt.innerHTML=`<div>🪜<br><span style="font-size:0.45em;color:#27ae60">ל-${lads[n]}</span></div>`; else if(snks[n])cnt.innerHTML=`<div>🐍<br><span style="font-size:0.45em;color:#c0392b">ל-${snks[n]}</span></div>`; cell.appendChild(cnt); let tok=document.createElement('div'); tok.className='snk-tokens'; tok.id='snk-tokens-'+n; cell.appendChild(tok); d.appendChild(cell); snkB[n]=cell; } }
function updSnkTok() { $('.snk-token').remove(); if(snkP.p1>0) $('#snk-tokens-'+snkP.p1).append('<div class="snk-token red"></div>'); if(snkP.p2>0) $('#snk-tokens-'+snkP.p2).append('<div class="snk-token black"></div>'); }
function animSnkDice(who) {
    $('#dice-btn').prop('disabled',true); let fn=Math.floor(Math.random()*6)+1; playWoodSound(false); setTimeout(()=>playWoodSound(false),300); setTimeout(()=>playWoodSound(false),600);
    let s=document.getElementById('snk-scene'), d=document.getElementById('snk-dice'); s.classList.remove('rolling-arc'); void s.offsetWidth; s.classList.add('rolling-arc');
    let rx=(Math.floor(Math.random()*3)+3)*360, ry=(Math.floor(Math.random()*3)+3)*360; switch(fn){case 2:ry-=90;break;case 3:ry+=90;break;case 4:rx-=90;break;case 5:rx+=90;break;case 6:ry+=180;break;}
    d.style.transform=`translateZ(-20px) rotateX(${rx}deg) rotateY(${ry}deg)`; setTimeout(()=>moveSnk(who,fn), 1000);
}
function rollSnakesDice() { if(snkT==='p2'&&currentGameMode==='ai')return; animSnkDice(snkT); }
function moveSnk(w, a) {
    let np=snkP[w]+a; if(np>100)np=100-(np-100); snkP[w]=np; playWoodSound(true); updSnkTok();
    if(np===100){ $('#dice-btn').prop('disabled',true); if(w==='p1'){ triggerEndgameAnim('win',currentGameMode==='pvp'?'שחקן 1 ניצח!':'ניצחת!'); $('#snk-status').html('<span style="color:green">ניצחון!</span>'); }else{ currentGameMode==='pvp'?triggerEndgameAnim('win','שחקן 2 ניצח!'):triggerEndgameAnim('lose'); $('#snk-status').html('<span style="color:red">הפסד!</span>');} return; }
    setTimeout(()=>{
        let c=false, wn=w==='p1'?'שחקן 1':(currentGameMode==='ai'?'מחשב':'שחקן 2');
        if(lads[np]){ snkP[w]=lads[np]; playWoodSound(true); updSnkTok(); c=true; $('#snk-status').html(`<span style="color:#27ae60">${wn} עלה בסולם!</span>`); } else if(snks[np]){ snkP[w]=snks[np]; playWoodSound(true); updSnkTok(); c=true; $('#snk-status').html(`<span style="color:#c0392b">${wn} נפל בנחש!</span>`); }
        setTimeout(()=>{ if(w==='p1'){ snkT='p2'; if(currentGameMode==='ai'){$('#snk-status').text('תור מחשב...'); setTimeout(()=>animSnkDice('p2'),1000);} else{$('#snk-status').text('תור שחקן 2 (שחור)'); $('#dice-btn').prop('disabled',false);} } else { snkT='p1'; $('#snk-status').text('תור שחקן 1 (אדום)'); $('#dice-btn').prop('disabled',false); } }, c?1500:200);
    },600);
}
function initSnakes() { initSnakesBoard(); snkP={p1:0,p2:0}; snkT='p1'; $('#snk-status').text(currentGameMode==='pvp'?'תור שחקן 1 (אדום)':'תור אדום (שלך)'); $('#dice-btn').prop('disabled',false); document.getElementById('snk-dice').style.transform=`translateZ(-20px) rotateX(-20deg) rotateY(-25deg)`; updSnkTok(); }