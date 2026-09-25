/* Local, visit-only Bets UI. Probabilistic records come only from the static
 * fixture bank; client arithmetic is limited to payout and display geometry. */
(function () {
  'use strict';
  const F=window.BetsBuilderFixtures;
  let host=null,timer=null,media=null;
  const state={legDraft:null,legIndex:null,pricingMode:'standard',mode:'parlay',player:0,side:'Over',line:F.catalog[0].book_line,odds:String(F.catalog[0].book_odds),stake:String(F.config.stake),legs:[],message:'',sort:'edge',record:null,frame:0,scenario:'live',expanded:null,explanations:{},ladders:{},ladderScroll:{},picks:[],single:null,pick:0,externalSingles:{},activeDecision:null,recExpanded:null,recDecisions:{}};
  const copy=x=>JSON.parse(JSON.stringify(x));
  const esc=x=>host.esc(x==null?'':x);
  const pct=x=>Number.isFinite(x)?(x*100).toFixed(1)+'%':'—';
  const money=x=>Number.isFinite(x)?'$'+x.toFixed(2):'—';
  function button(action,label,value,disabled,extra){return '<button data-act="bb-'+action+'"'+(value==null?'':' data-value="'+esc(value)+'"')+(disabled?' disabled':'')+(extra||'')+'>'+label+'</button>';}
  function number(value){if(String(value).trim()==='')return null;const n=Number(value);return Number.isFinite(n)?n:null;}
  function validOdds(value){const n=number(value);return n!==null&&Math.abs(n)>=100;}
  function selected(){return F.catalog[state.player];}
  function legAt(){const row=F.rungs[selected().player][state.line.toFixed(1)];return row?copy(row[state.side]):null;}
  function editorLeg(){const leg=legAt();if(!leg||!validOdds(state.odds))return null;leg.odds=number(state.odds);leg.forecast_source={kind:"catalog"};return leg;}
  function sourceRung(leg){
    if(leg.forecast_source&&leg.forecast_source.kind==='edge'){
      const card=(window.EdgeFinderFixtures.cards||[]).find(c=>c.id===leg.forecast_source.card_id&&c.player_id===leg.player_id&&c.market===leg.market);
      return card&&card.ladder.find(r=>r.side===leg.side&&r.line===leg.line&&r.valid_side&&Number.isFinite(r.p_at_line))||null;
    }
    const pair=F.rungs[leg.player]&&F.rungs[leg.player][Number(leg.line).toFixed(1)],r=pair&&pair[leg.side];
    return r&&r.market===leg.market?r:null;
  }
  function editCandidate(){const l=state.legDraft;if(!l||!validOdds(l.odds))return null;const r=sourceRung(l);if(!r)return null;return Object.assign(copy(l),{odds:number(l.odds),p_at_line:r.p_at_line});}
  function beginLeg(index){state.legIndex=index;state.legDraft=index===null?Object.assign(copy(F.rungs[F.catalog[0].player][F.catalog[0].book_line.toFixed(1)].Over),{forecast_source:{kind:'catalog'}}):copy(state.legs[index]);state.message='';host.open('betsleg');}
  function applyLeg(){const l=editCandidate();if(!l){state.message='Choose supported terms and valid odds.';return false;}if(state.legs.some((x,i)=>i!==state.legIndex&&x.player===l.player&&x.market===l.market)){state.message='This player and market are already in your parlay.';return false;}if(state.legIndex===null){if(state.legs.length>=4)return false;state.legs.push(l);}else state.legs[state.legIndex]=l;state.legDraft=null;state.record=null;state.activeDecision=null;host.back();return true;}
  function payout(legs){
    const stake=number(state.stake);if(stake===null||stake<=0||!legs.length)return null;
    let total=stake;
    for(const leg of legs){if(!validOdds(leg.odds))return null;total*=leg.odds>0?1+leg.odds/100:1+100/Math.abs(leg.odds);}
    if(!Number.isFinite(total)||total<=stake)return null;
    const be=stake/total;if(!Number.isFinite(be)||be<=0)return null;
    return {stake,total,break_even:be};
  }
  function price(){
    if(state.legs.length<2||state.legs.length>4)return null;
    const totals=payout(state.legs);if(!totals)return null;
    const probabilities=state.legs.map(l=>l.p_at_line).sort((a,b)=>a-b);
    const standard=probabilities.every(p=>[.2,.3,.4,.5,.6,.7,.8].includes(p));
    const key=standard?probabilities.map(p=>p*10).join(','):null;
    const stored=standard&&state.pricingMode!=='exact'?F.bank[key]:(window.EdgeFinder&&window.EdgeFinder.exactPrice(state.legs));if(!stored)return null;
    return Object.assign(copy(stored),{legs:state.legs.map(l=>Object.assign({},l,{odds:number(l.odds)})),break_even:totals.break_even,totals:copy(totals)});
  }
  function cancel(){if(timer!==null){clearTimeout(timer);timer=null;}}
  function finish(){cancel();if(state.record)state.frame=state.record.trace.length-1;}
  function captureLadderScroll(){
    if(!document.querySelectorAll)return;
    Array.from(document.querySelectorAll('.bb-single-rows.is-expanded')).forEach(node=>{
      if(node.id && node.id.indexOf('bb-ladder-')===0 && state.ladders[node.id.slice(10)])state.ladderScroll[node.id.slice(10)]=node.scrollTop;
    });
  }
  function restoreLadderScroll(){
    Object.keys(state.ladderScroll).forEach(key=>{const node=document.getElementById('bb-ladder-'+key);if(node && state.ladders[key])node.scrollTop=state.ladderScroll[key];});
  }
  function sync(route){
    restoreLadderScroll();
    if(route!=='betssim'){cancel();return;}
    if(!state.record)return;
    if(host.reduced()){finish();return;}
    if(timer!==null||state.frame>=state.record.trace.length-1)return;
    timer=setTimeout(function(){timer=null;if(host.route()!=='betssim')return;state.frame++;refresh();sync(host.route());},F.config.tick_ms);
  }
  function configure(api){host=api;if(!media&&window.matchMedia){media=window.matchMedia('(prefers-reduced-motion: reduce)');const changed=()=>{if(media.matches&&host.route()==='betssim'){finish();refresh();}};if(media.addEventListener)media.addEventListener('change',changed);}}
  function refresh(focusId,control){
    captureLadderScroll();
    const active=document.activeElement;
    if(!control&&active&&active.getAttribute){const act=active.getAttribute("data-act");if(act)control={fullact:act,value:active.getAttribute("data-value"),tab:active.getAttribute("data-tab"),sub:active.getAttribute("data-sub"),route:active.getAttribute("data-route"),mode:active.getAttribute("data-mode")};}
    let start=null,end=null;const previous=focusId&&document.getElementById(focusId);
    if(previous){start=previous.selectionStart;end=previous.selectionEnd;}
    host.render();
    restoreLadderScroll();
    const node=focusId&&document.getElementById(focusId);if(node){node.focus({preventScroll:true});if(start!==null&&node.setSelectionRange)node.setSelectionRange(start,end);}
    if(control&&document.querySelectorAll){const buttons=Array.from(document.querySelectorAll("[data-act]"));const target=buttons.find(b=>b.getAttribute("data-act")===(control.fullact||"bb-"+control.act)&&b.getAttribute("data-value")===(control.value==null?null:String(control.value))&&(!control.tab||b.getAttribute("data-tab")===control.tab)&&(!control.sub||b.getAttribute("data-sub")===control.sub)&&(!control.route||b.getAttribute("data-route")===control.route)&&(!control.mode||b.getAttribute("data-mode")===control.mode))||buttons.find(b=>b.getAttribute("data-act")==="bb-add")||buttons.find(b=>b.getAttribute("data-act")==="bb-edit");if(target)target.focus({preventScroll:true});}
  }
  function input(field,value,focusId){
    if(field==='edit-player'&&state.legDraft&&/^\d+$/.test(value)&&F.catalog[Number(value)]){const c=F.catalog[Number(value)];state.legDraft=Object.assign(copy(F.rungs[c.player][c.book_line.toFixed(1)].Over),{forecast_source:{kind:'catalog'}});}
    else if(field==='edit-odds'&&state.legDraft)state.legDraft.odds=String(value);
    else if(field==='player'&&/^\d+$/.test(value)&&F.catalog[Number(value)]){state.player=Number(value);state.line=selected().book_line;state.odds=String(selected().book_odds);state.side='Over';}
    else if(field==='odds'||field==='stake')state[field]=String(value);
    else if(/^leg-odds-\d+$/.test(field)){const idx=Number(field.split('-').pop());if(state.legs[idx])state.legs[idx].odds=String(value);}
    else return;
    state.message='';refresh(focusId);
  }
  function sorted(){const key=state.sort==='chance'?'chance':state.sort==='payout'?'payout':'edge';return F.recommended.map((r,index)=>Object.assign({index},r)).sort((a,b)=>Number(a.blind_spot)-Number(b.blind_spot)||b[key]-a[key]||a.index-b.index);}
  function action(act,value){
    state.message='';
    if(act==='view-parlay'){host.open('betsparlay');return;}
    else if(act==='edit-leg'&&/^\d+$/.test(value||'')&&state.legs[Number(value)]){beginLeg(Number(value));return;}
    else if(act==='add-leg'&&state.legs.length<4){beginLeg(null);return;}
    else if(act==='cancel-leg'){state.legDraft=null;host.back();return;}
    else if(act==='apply-leg'){if(applyLeg())return;}
    else if(act==='edit-step'&&state.legDraft&&['-1','1'].includes(String(value)))state.legDraft.line+=Number(value)*.5;
    else if(act==='edit-side'&&state.legDraft&&['Over','Under'].includes(value))state.legDraft.side=value;
    else if(act==='mode'&&['single','parlay'].includes(value))state.mode=value;
    else if(act==='side'&&['Over','Under'].includes(value))state.side=value;
    else if(act==='step'&&['-1','1'].includes(String(value)))state.line+=Number(value)*.5;
    else if(act==='add'){
      const leg=editorLeg();
      if(!leg)state.message='Choose a supported line and valid American odds before adding.';
      else if(state.legs.some(l=>l.player===leg.player&&l.market===leg.market))state.message='This player and market are already in your parlay.';
      else if(state.legs.length>=4)state.message='This sample supports up to four legs.';
      else state.legs.push(leg);
    } else if(act==='remove'&&/^\d+$/.test(value||''))state.legs.splice(Number(value),1);
    else if(act==='create'){
      const record=price();if(!record){state.message='Add two to four supported legs and valid odds/stake. A finite payout is required.';refresh(null,{act,value});return;}
      cancel();state.record=record;state.frame=0;state.activeDecision=null;if(host.reduced())finish();host.open('betssim');return;
    } else if(act==='skip'){finish();}
    else if(act==='edit'){cancel();host.root('betsparlay');return;}
    else if(act==='reset'){cancel();state.pricingMode='standard';state.legs=[];state.record=null;state.frame=0;state.player=0;state.side='Over';state.line=F.catalog[0].book_line;state.odds=String(F.catalog[0].book_odds);state.stake=String(F.config.stake);state.expanded=null;state.ladders={};state.ladderScroll={};host.root('betbuilder');return;}
    else if(act==='rec-toggle'&&/^\d+$/.test(value||'')&&F.recommended[Number(value)])state.recExpanded=state.recExpanded===Number(value)?null:Number(value);
    else if(act==='rec-save'&&/^\d+$/.test(value||'')&&F.recommended[Number(value)]){const r=F.recommended[Number(value)],key=r.legs.map(l=>l.p_at_line).sort((a,b)=>a-b).map(p=>p*10).join(','),record=F.bank[key],d=host.take&&host.take('recommended:'+value,{source:'Recommended parlay',kind:'parlay',legs:r.legs,p_joint:record.p_joint,p_product:record.p_product,trace:record.trace});if(d)state.recDecisions[value]=d.id;}
    else if(act==='recommended'){host.open('betsrecommended');return;}
    else if(act==='sort'&&['edge','chance','payout'].includes(value))state.sort=value;
    else if(act==='recommend'&&/^\d+$/.test(value||'')&&F.recommended[Number(value)]){state.pricingMode='standard';state.legs=copy(F.recommended[Number(value)].legs);state.stake=String(F.config.stake);state.mode='parlay';state.legs=state.legs.map(l=>Object.assign(l,{forecast_source:{kind:'catalog'}}));state.record=null;host.root('betsparlay');return;}
    else if(act==='scenario'&&['live','lost'].includes(value))state.scenario=value;
    else if(act==='how'&&/^[a-z0-9-]+$/.test(value||''))state.explanations[value]=!state.explanations[value];
    else if(act==='ladder-toggle' && (value==='preview' || /^pick-\d+$/.test(value||'') || /^external-decision-\d+$/.test(value||''))){
      const item=value==='preview'?state.single:value.indexOf('external-')===0?state.externalSingles[value]:state.picks[Number(value.slice(5))];
      if(!item)return;
      const rows=document.getElementById('bb-ladder-'+value);
      if(rows && state.ladders[value])state.ladderScroll[value]=rows.scrollTop;
      state.ladders[value]=!state.ladders[value];
      refresh(null,{act,value});
      const updated=document.getElementById('bb-ladder-'+value);
      if(updated && state.ladders[value])updated.scrollTop=state.ladderScroll[value]||0;
      return;
    }
    else if(act==='detail')state.expanded=state.expanded===value?null:value;
    else if(act==='create-menu'){host.create();return;}
    else if(act==='players'){host.players();return;}
    else if(act==='history'){host.history();return;}
    else if(act==='take-parlay'&&state.record&&state.frame===state.record.trace.length-1){const pay=state.record.totals;const d=host.take&&host.take('builder-parlay:'+JSON.stringify([state.record.legs,pay]),{source:'Parlay builder',kind:'parlay',legs:state.record.legs,stake:pay.stake,totals:pay,p_joint:state.record.p_joint,p_product:state.record.p_product,trace:state.record.trace});if(d)state.record.decision=d.id;}
    else if(act==='root'&&['screen','live','picks','betbuilder'].includes(value)){if(value==='picks'&&host.mybets)host.mybets();else host.root(value);return;}
    else if(act==='preview-single'){
      const leg=editorLeg(),totals=leg&&payout([leg]);if(!totals){state.message='Choose a supported line, valid odds and a positive finite stake.';refresh(null,{act,value});return;}
      state.single={leg,totals};state.activeDecision=null;delete state.ladders.preview;delete state.ladderScroll.preview;host.open('betssingle');return;
    } else if(act==='save-single'&&state.single){const d=host.take&&host.take('builder-single:'+JSON.stringify({leg:state.single.leg,totals:state.single.totals}),{source:'Single builder',kind:'single',legs:[state.single.leg],stake:state.single.totals.stake,totals:state.single.totals});if(d){state.single.decision=d.id;refresh(null,{act,value});return;}state.picks.push(copy(state.single));state.message='Added to sample picks for this visit.';host.root('picks');return;}
    else if(act==='pick'&&/^\d+$/.test(value||'')&&state.picks[Number(value)]){state.pick=Number(value);host.open('betspick');return;}
    else return;
    refresh(null,{act,value});
  }
  function explanation(key,body,label){
    const open=!!state.explanations[key];
    return '<section class="bb-explanation">'+button('how',label||'How this works',key,false,' aria-expanded="'+open+'" aria-controls="bb-how-'+key+'" class="bb-text-button"')+
      (open?'<div class="bb-explanation-body" id="bb-how-'+key+'">'+body+'</div>':'')+'</section>';
  }
  function editorExtras(){return '<div class="bb-editor-extras">'+details(legAt()||selected(),'editor')+explanation('editor','<p>'+esc(F.config.settlement)+'</p><p>Chance comes from the stored sample ladder. Moving beyond its window leaves the chance unavailable.</p><p>American odds must be +100 or higher, or -100 or lower. Odds change the payout, not the chance.</p>'+(state.mode==='single'?payoutMeaning(editorLeg()?[editorLeg()]:[]):''))+'</div>';}
  function stakeReminder(){return '<span class="stake-reminder">Real bets placed elsewhere</span>';}
  function stakeReturn(legs){
    const valid=payout(legs);
    return '<div class="bb-stake-return"><div>'+stake()+'</div>'+totals(legs)+'</div>'+stakeReminder()+
      (!valid?'<p class="bb-inline-error">Enter valid odds and a positive stake with a finite return.</p>':'');
  }
  function payoutMeaning(legs){
    const t=payout(legs);
    return '<p>Break-even chance: <strong>'+pct(t&&t.break_even)+'</strong>. This is the chance your payout needs to cover the stake over repeated identical bets.</p><p>Total return includes your stake. Payout arithmetic does not change the stored chance.</p>';
  }
  function payoutExplanation(legs,key){return explanation(key,payoutMeaning(legs));}
  function sample(){return '<p class="bb-sample">Demo · fictional numbers</p>';}
  function independence(){return '<p class="bb-independence">Assumes each bet is independent; bets in the same game may affect each other.</p>';}
  function header(title,back){return '<div class="bb-heading">'+(back?'<button data-act="back" aria-label="Back">←</button>':'')+'<h1>'+esc(title)+'</h1></div>'+sample();}
  function navigation(active){return '<nav class="bb-navigation" aria-label="Bets views">'+button('root','Builder','betbuilder',false,' aria-pressed="'+(active==='screen')+'"')+button('root','Live','live',false,' aria-pressed="'+(active==='live')+'"')+button('root','My picks','picks',false,' aria-pressed="'+(active==='picks')+'"')+'</nav>';}
  function sampleStatline(entries){
    const numeric=[],text=[];
    entries.forEach(entry=>{const value=number(entry.value);if(value!==null)numeric.push(Object.assign({},entry,{value}));else text.push(entry);});
    return host.statline(numeric)+(text.length?'<div class="bb-statline-text">'+text.map(entry=>'<div class="statrow"><span class="statlabel">'+esc(entry.label)+'</span><span class="statvalue">'+esc(entry.value)+'</span></div>').join('')+'</div>':'');
  }
  function details(leg,key){
    const open=state.expanded===key;
    return '<div class="bb-player-details">'+button('detail',open?'Hide player details':'Player details',key,false,' aria-expanded="'+open+'" class="bb-text-button"')+
      (open?sampleStatline(F.statlines[leg.player]||[])+'<p class="bb-meta">Fictional sample projections.</p>':'')+'</div>';
  }
  function legName(leg){return esc(leg.player)+' · '+esc(leg.side)+' '+esc(leg.line)+' '+esc(leg.market);}
  function catalogFor(leg){return F.catalog.find(c=>c.player===leg.player&&c.market===leg.market);}
  function teamColor(leg){const c=catalogFor(leg);return c&&!(leg.forecast_source&&leg.forecast_source.kind==='edge')?teamColors[c.team]||'var(--muted)':'var(--muted)';}
  function color(leg,index){return F.config.colors[(index||0)%F.config.colors.length];}
  function chips(legs){const counts={};legs.forEach(l=>{const c=catalogFor(l);if(c)counts[c.game]=(counts[c.game]||0)+1;});return Object.keys(counts).filter(g=>counts[g]>1).map(g=>'<p class="bb-game-chip">'+esc(g)+' · '+'Same game · connection between bets not included'+'</p>').join('');}
  function editor(){
    const c=selected(),leg=legAt(),valid=validOdds(state.odds);
    return '<section class="bb-editor"><label for="bb-player">Player</label><select id="bb-player" data-bb-field="player">'+F.catalog.map((p,i)=>'<option value="'+i+'"'+(i===state.player?' selected':'')+'>'+esc(p.player+' · '+p.market+' '+p.book_line+' · '+pct(p.p_over_at_line)+' over')+'</option>').join('')+'</select>'+
      '<div class="bb-selected-player"><strong>'+esc(c.player)+'</strong><span>'+esc(c.pos+' · '+c.game)+'</span></div>'+
      '<div class="bb-side" role="group" aria-label="Bet side">'+['Over','Under'].map(side=>button('side',side,side,false,' aria-pressed="'+(state.side===side)+'"')).join('')+'</div>'+
      '<div class="bb-line-step">'+button('step','−','-1',false,' aria-label="Lower line by half a point"')+'<strong class="bb-target">'+esc(state.side)+' '+state.line+' <span>'+esc(c.market)+'</span></strong>'+button('step','+','1',false,' aria-label="Raise line by half a point"')+'</div>'+
      (Number.isInteger(state.line)?'<p class="bb-tie-note">Demo: ties count as under.</p>':'')+
      '<div class="bb-chance-odds"><div class="bb-editor-chance"><span>Chance to win</span><strong>'+pct(leg&&leg.p_at_line)+'</strong></div><div><label for="bb-odds">Your odds</label><input id="bb-odds" data-bb-field="odds" inputmode="decimal" value="'+esc(state.odds)+'"'+(!valid?' aria-invalid="true" aria-describedby="bb-odds-help"':'')+'></div></div>'+
      (!valid?'<p id="bb-odds-help" class="bb-inline-error">Use +100 or higher, or -100 or lower.</p>':'')+
      (!leg?'<p class="bb-inline-error">Outside this sample ladder. Move the line back into its supported window.</p>':'')+
      (c.blind_spot?'<p class="bb-blind">Missing context may change this projection.</p>':'')+
      (state.mode==='parlay'?button('add',state.legs.length>=4?'Four-bet limit':'Add to parlay',null,!editorLeg()||state.legs.length>=4,' class="bb-primary"')+editorExtras():'')+'</section>';
  }
  function totals(legs){
    const t=payout(legs);
    return '<div class="bb-return"><span>Return if won · includes stake</span><strong>'+money(t&&t.total)+'</strong></div>';
  }
  function stake(){return '<label for="bb-stake">Stake</label><input id="bb-stake" data-bb-field="stake" inputmode="decimal" value="'+esc(state.stake)+'">';}
  const teamColors={KC:'#a71930',CIN:'#be4c16',BUF:'#1555a3',NYJ:'#175b48',BAL:'#44326b',PIT:'#916a0c',LAR:'#225aa4',SF:'#a32630'};
  function matchup(leg){if(leg.forecast_source&&leg.forecast_source.kind==='edge')return '';const c=catalogFor(leg);if(!c)return '';const parts=c.game.split(/\s*@\s*/);if(parts.length!==2||!parts.includes(c.team))return '';const away=parts[0]===c.team,opponent=parts[away?1:0],pill=t=>'<b class="bb-team-pill" style="--team-color:'+esc(teamColors[t]||'var(--muted)')+'">'+esc(t)+'</b>';return '<span class="bb-matchup">'+pill(c.team)+'<span>'+(away?'@':'vs')+'</span>'+pill(opponent)+'</span>';}
  function parlaySummary(){const priced=price();return header('Your parlay',true)+'<section class="bb-parlay-summary">'+state.legs.map((l,i)=>'<article class="bb-summary-leg">'+button('edit-leg','<span><strong>'+esc(l.player)+'</strong><small>'+esc(l.side+' '+l.line+' '+l.market)+'</small>'+matchup(l)+'</span><span><strong>'+pct(l.p_at_line)+'</strong><small>'+esc(l.odds)+' odds</small></span>',String(i),false,' class="bb-summary-edit" aria-label="Edit '+esc(l.player)+'"')+button('remove','Remove',String(i),false,' class="bb-text-button"')+'</article>').join('')+button('add-leg','Add a bet',null,state.legs.length>=4,' class="bb-link"')+(state.legs.length<2?'<p>Add at least two bets.</p>':(priced?window.OutlookHistory.combination(state.legs,priced.p_joint)+window.OutlookHistory.differential(priced.break_even,priced.p_joint):'')+stakeReturn(state.legs)+(!price()?'<p class="bb-inline-error">No exact recorded price for these terms. Choose a supported combination and valid payout.</p>':'')+button('create','Create parlay',null,!price(),' class="bb-primary"')+payoutExplanation(state.legs,'slip'))+'</section>';}
  function legEditor(){const l=state.legDraft;if(!l)return header('Edit bet',true)+'<p>Select a bet from your parlay.</p>'+button('view-parlay','Your parlay');const r=sourceRung(l),candidate=editCandidate(),duplicate=state.legs.some((x,i)=>i!==state.legIndex&&x.player===l.player&&x.market===l.market);return header(state.legIndex===null?'Add a bet':'Edit bet',true)+'<section class="bb-leg-editor"><h2>'+esc(l.player)+'</h2><p class="bb-meta">'+(l.forecast_source&&l.forecast_source.kind==='edge'?'Edge Finder sample ladder':'Builder sample ladder')+'</p><label for="bb-edit-player">Replace player</label><select id="bb-edit-player" data-bb-field="edit-player"><option value="">Choose a replacement</option>'+F.catalog.map((c,i)=>'<option value="'+i+'"'+(l.forecast_source&&l.forecast_source.kind==='catalog'&&l.player===c.player&&l.market===c.market?' selected':'')+'>'+esc(c.player+' · '+c.market)+'</option>').join('')+'</select><div class="bb-side">'+['Over','Under'].map(side=>button('edit-side',side,side,false,' aria-pressed="'+(l.side===side)+'"')).join('')+'</div><div class="bb-line-step">'+button('edit-step','−','-1',false,' aria-label="Lower line"')+'<strong>'+esc(l.side+' '+l.line+' '+l.market)+'</strong>'+button('edit-step','+','1',false,' aria-label="Raise line"')+'</div>'+(Number.isInteger(l.line)?'<p class="bb-tie-note">Demo: ties count as under.</p>':'')+'<div class="bb-chance-odds"><div><span>Chance to win</span><strong>'+pct(r&&r.p_at_line)+'</strong></div><div><label for="bb-edit-odds">Your odds</label><input id="bb-edit-odds" aria-invalid="'+(!validOdds(l.odds))+'"'+(!validOdds(l.odds)?' aria-describedby="bb-edit-odds-error"':'')+' data-bb-field="edit-odds" value="'+esc(l.odds)+'" inputmode="decimal"></div></div>'+(!validOdds(l.odds)?'<p class="bb-inline-error" id="bb-edit-odds-error" role="status">Use +100 or higher, or -100 or lower for odds.</p>':'')+(!r?'<p class="bb-inline-error">This side or line is unavailable in the original sample ladder.</p>':'')+(duplicate?'<p class="bb-inline-error">This player and market are already in your parlay.</p>':'')+'<div class="bb-actions">'+button('cancel-leg','Cancel')+button('apply-leg','Apply',null,!candidate||duplicate,' class="bb-primary"')+'</div></section>';}
  function browse(){
    return header('Bets',false)+'<div class="bb-browse-actions">'+button('create-menu','Create bet')+button('players','Find a player')+'</div>'+
      '<section class="browse-feature"><span class="overline">Tracked sample parlay</span><strong>2 cashed · 2 open</strong><span>Separate frozen example</span>'+button('root','Follow sample','live')+'</section>'+
      '<div class="browse-section"><h2>Saved sample picks <span>'+state.picks.length+'</span></h2><p>This visit only</p>'+button('root','My picks','picks')+'</div>'+
      '<div class="browse-section"><h2>Recommended parlays</h2><p>'+esc(F.recommended[0].title || 'Explore six sample combinations')+'</p>'+button('recommended','Explore recommendations')+'</div>'+
      '<div class="browse-section"><h2>Line movement</h2><p>Separate Home sample · Renner catches</p>'+button('history','View bet history')+'</div>';
  }
  function builder(){
    return header('Create bet',true)+'<div class="bb-modes" role="group" aria-label="Bet type">'+['single','parlay'].map(mode=>button('mode',mode==='single'?'Single bet':'Parlay',mode,false,' aria-pressed="'+(state.mode===mode)+'"')).join('')+'</div><nav class="bb-secondary" aria-label="More Bets views">'+button('recommended','Recommended')+button('root','Live','live')+button('root','My picks','picks')+'</nav>'+editor()+
      (state.mode==='parlay'?(state.legs.length?button('view-parlay','View your parlay · '+state.legs.length+' bets',null,false,' class="bb-primary"'):''):stakeReturn(editorLeg()?[editorLeg()]:[])+button('preview-single','Preview bet',null,!editorLeg()||!payout(editorLeg()?[editorLeg()]:[]),' class="bb-primary"')+editorExtras());
  }
  function convergence(record){const points=record.trace.slice(0,state.frame+1);const xy=points.map((p,i)=>(28+i/(record.trace.length-1)*278)+','+(134-p[1]*110));const y=134-record.break_even*110;return '<svg class="bb-convergence" viewBox="0 0 340 165" role="img" aria-label="Recorded independent estimate and break-even '+pct(record.break_even)+'"><line x1="28" x2="306" y1="'+y+'" y2="'+y+'" class="bb-break-even"/><text x="28" y="'+(y-5)+'">Break even '+pct(record.break_even)+'</text><polyline points="'+xy.join(' ')+'"/><text x="28" y="155">'+(record.illustrative_reveal?'Start':'0 games')+'</text><text x="235" y="155">'+(record.illustrative_reveal?'Final':'10,000 games')+'</text></svg>';}
  function simulation(){
    const r=state.record;
    if(!r)return header('Your parlay',true)+'<p>No demo parlay selected.</p>'+button('root','Open builder','betbuilder');
    const final=state.frame===r.trace.length-1,t=r.trace[state.frame],pay=r.totals,gap=(r.p_joint-r.break_even)*100;
    const buckets='<div class="bb-buckets" aria-label="Recorded final legs-hit distribution">'+r.buckets.map((p,i)=>'<div><div class="bb-bucket-track"><i style="height:'+(p*100*(state.frame+1)/r.trace.length)+'%"></i></div><strong>'+pct(p)+'</strong><span>'+(i===0?'None':i===r.legs.length?'All '+i:i+' hit')+'</span></div>').join('')+'</div><p>Recorded final distribution; the fill follows replay progress.</p>';
    const method=convergence(r)+buckets+'<p>Final sample estimate '+pct(r.p_joint)+'; priced apart '+pct(r.p_product)+'.</p>'+independence()+(r.illustrative_reveal?'<p>The reveal is illustrative; the final chance is the stored independent product.</p>':'<p>The small difference is prerecorded sampling noise, not a benefit from combining bets.</p>')+'<p>Break-even chance '+pct(r.break_even)+' is the chance your payout needs. '+Math.abs(gap).toFixed(1)+' points '+(gap>=0?'above':'below')+' that requirement.</p>';
    return header('Your parlay',true)+'<p class="bb-meta">'+(r.illustrative_reveal?'Illustrative recorded reveal':'Prerecorded demo')+'</p><div class="bb-compact-legs">'+r.legs.map((l,i)=>'<p><i style="background:'+color(l,i)+'"></i>'+legName(l)+'</p>').join('')+'</div>'+chips(r.legs)+
      '<div class="bb-replay-head"><span>Chance all bets win</span><strong>'+pct(r.p_joint)+'</strong><small>'+(r.illustrative_reveal?'Recorded reveal':t[0].toLocaleString('en-US')+' simulated games')+(final?' · complete':'')+'</small></div>'+independence()+
      '<div class="bb-totals"><div><span>Stake</span><strong>'+money(pay&&pay.stake)+'</strong></div><div><span>Return if won · includes stake</span><strong>'+money(pay&&pay.total)+'</strong></div></div>'+stakeReminder()+window.OutlookHistory.combination(r.legs,r.p_joint)+
      (!final?button('skip','Skip animation',null,false,' class="bb-link"'):'<section class="bb-verdict '+(gap>=0?'positive':'negative')+'"><h2>'+(gap>=0?'Above':'Below')+' the chance your payout needs</h2><p>'+Math.abs(gap).toFixed(1)+' percentage points '+(gap>=0?'above':'below')+' break even.</p></section>')+
      '<div class="bb-actions">'+button('edit','Edit parlay')+button('reset','Start over')+(final&&host.take?(r.decision&&host.decisionPanel?host.decisionPanel(r.decision):button('take-parlay','Record parlay',null,false,' class="bb-primary"')+stakeReminder()):'')+'</div>'+explanation('sim-method',method)+button('root','View a separate live demo','live',false,' class="bb-link"');
  }
  function recommended(){
    return header('Recommended',true)+'<div class="bb-sort" role="group" aria-label="Recommended sort">'+[['edge','Best edge'],['chance','Highest chance'],['payout','Biggest payout']].map(x=>button('sort',x[1],x[0],false,' aria-pressed="'+(state.sort===x[0])+'"')).join('')+'</div>'+sorted().map((r,i)=>{
      const open=state.recExpanded===r.index,id='bb-rec-'+r.index,saved=state.recDecisions[r.index];
      return '<article class="bb-recommendation">'+button('rec-toggle','<span><strong>'+esc(r.title)+'</strong><span class="bb-rec-players">'+r.legs.map(l=>'<span><strong>'+esc(l.player)+'</strong><small class="bb-rec-line">'+esc(l.side+' '+l.line+' '+l.market)+'</small>'+matchup(l)+'</span>').join('')+'</span></span><span aria-hidden="true">'+(open?'⌃':'⌄')+'</span>',String(r.index),false,' class="bb-rec-toggle" aria-expanded="'+open+'" aria-controls="'+id+'"')+'<div class="bb-rec-overview"><div><strong>'+pct(r.chance)+'</strong><span>All bets win</span></div><div><strong>'+money(r.payout)+'</strong><span>Return on $10 · includes stake</span></div></div>'+independence()+stakeReminder()+'<div class="bb-rec-body" id="'+id+'"'+(open?'':' hidden')+'>'+(open?'<p class="bb-meta">'+esc(r.tag)+'</p>'+r.legs.map((l,j)=>'<p class="bb-rec-leg"><i style="background:'+teamColor(l)+'"></i>'+legName(l)+' · '+esc(l.odds)+' odds · '+pct(l.p_at_line)+'</p>').join('')+chips(r.legs)+window.OutlookHistory.combination(r.legs,r.chance)+window.OutlookHistory.differential(r.break_even,r.chance)+'<p>Return on $10: '+money(r.payout)+' · includes stake</p>'+stakeReminder()+'<p class="bb-why">'+(r.edge>=0?'Our estimate is above the chance this payout needs.':'Our estimate is below the chance this payout needs.')+'</p>'+(r.blind_spot?'<p class="bb-blind">Missing context may change this projection. This example stays below complete-context picks.</p>':'')+(saved&&host.decisionPanel?host.decisionPanel(saved):button('rec-save','Save parlay',String(r.index),false,' class="bb-primary"'))+button('recommend','Customize legs',String(r.index))+explanation('recommend-'+r.index,'<p>'+Math.abs(r.edge).toFixed(1)+' percentage points '+(r.edge>=0?'above':'below')+' the price requirement.</p><p>Recorded sample · '+esc(r.generated_at)+'</p>'):'')+'</div></article>';
    }).join('');
  }
  function ladderRows(leg){
    const rungs=leg.ladder_now.filter((r,j)=>j%2===0||r.line===leg.line);
    const first=rungs[0].line,last=rungs[rungs.length-1].line;
    const now='<p class="bb-now">Now '+leg.banked_stat+(leg.banked_stat<first?' · below shown rungs':leg.banked_stat>last?' · above shown rungs':'')+'</p>';
    let placed=false;
    const html=rungs.map(r=>{let marker='';if(!placed&&leg.banked_stat<=r.line){marker=now;placed=true;}return marker+'<div class="'+(r.line===leg.line?'is-placed':'')+'"><span>'+r.line+'</span><strong>'+pct(r.p_over)+'</strong></div>';}).join('');
    return html+(placed?'':now);
  }
  function trackingChart(frame){
    const xs=[42,86,132,200,264],y=p=>144-p*110;
    const path=values=>values.map((p,i)=>xs[i]+','+y(p)).join(' ');
    const labels=frame.legs.map((leg,i)=>({name:leg.player.split(' ').pop(),p:leg.p_now,color:color(leg,i),combined:false}));
    labels.push({name:'Combined',p:frame.p_joint_now,color:'var(--ink)',combined:true});
    labels.sort((a,b)=>b.p-a.p);let previous=12;
    labels.forEach(label=>{label.labelY=Math.max(y(label.p)+3,previous+18);previous=label.labelY;});
    return '<div class="bb-track-legend">'+frame.legs.map((l,i)=>'<span><i style="background:'+color(l,i)+'"></i>'+esc(l.player)+'</span>').join('')+'<span>Combined · heavier line</span></div><svg class="bb-tracking-chart" viewBox="0 0 400 210" role="img" aria-label="Frozen sample leg probabilities and independent combined chance"><rect x="139" y="20" width="53" height="120" class="bb-gap"/><text x="136" y="13">Between games</text>'+[0,.5,1].map(p=>'<line x1="42" x2="264" y1="'+y(p)+'" y2="'+y(p)+'" class="bb-grid"/><text x="36" text-anchor="end" y="'+(y(p)+3)+'">'+Math.round(p*100)+'%</text>').join('')+frame.series.map((series,i)=>'<polyline points="'+path(series)+'" style="stroke:'+color(frame.legs[i],i)+'"/>').join('')+'<polyline points="'+path(frame.combined)+'" class="bb-combined"/>'+labels.map(label=>'<path d="M264 '+y(label.p)+' L271 '+label.labelY+' H276" fill="none" stroke="'+label.color+'" stroke-width=".6"/><text x="280" y="'+(label.labelY+3)+'" style="fill:'+label.color+';font-weight:'+(label.combined?'600':'400')+'">'+esc(label.name)+' '+pct(label.p)+'</text>').join('')+'<text x="42" y="195">Thursday</text><text x="210" y="195">Sunday</text></svg>';
  }
  function tracking(){
    const f=state.scenario==='lost'?F.lost:F.tracking;
    return header('Live',false)+navigation('live')+'<p class="bb-meta">Separate demo parlay · frozen snapshot</p><div class="bb-side" role="group" aria-label="Tracking scenario">'+button('scenario','In progress','live',false,' aria-pressed="'+(state.scenario==='live')+'"')+button('scenario','Lost example','lost',false,' aria-pressed="'+(state.scenario==='lost')+'"')+'</div>'+
      '<div class="bb-replay-head"><span>Chance all bets win</span><strong>'+pct(f.p_joint_now)+'</strong><small>'+(state.scenario==='live'?'Two cashed · two live':'Three cashed · one lost')+'</small></div>'+independence()+
      '<div class="bb-ladders" tabindex="0" aria-label="Four player ladders, scroll horizontally">'+f.legs.map((l,i)=>'<section class="bb-ladder"><h2><i style="background:'+color(l,i)+'"></i>'+esc(l.player)+'</h2><p class="bb-leg-state">'+(l.state==='cashed'?'✓ Cashed':l.state==='lost'?'Lost':pct(l.p_now)+' now')+'</p><strong>'+l.banked_stat+' '+esc(l.market)+'</strong><div class="bb-ladder-rungs '+(l.state==='open'?'':'is-final')+'">'+ladderRows(l)+'</div>'+details(l,'tracking-'+i)+'</section>').join('')+'</div>'+trackingChart(f)+independence()+
      f.events.map(e=>'<p class="bb-event"><i style="background:'+color(f.legs[e.leg],e.leg)+'"></i>'+esc(e.t+' · '+e.sentence)+'</p>').join('')+
      explanation('tracking','<p>'+esc(f.timestamp)+'. This frozen demo does not poll.</p><p>Initial combined chance: '+pct(f.combined[0])+'.</p>'+independence()+'<p>This is a separate example, not your builder selection.</p>');
  }
  function singleLadder(item,key){
    const leg=item.leg,source=F.rungs[leg.player];
    const rows=source?Object.values(source).map(pair=>pair[leg.side]).filter(row=>row && row.player===leg.player && row.market===leg.market && row.side===leg.side && Number.isFinite(row.line) && Number.isFinite(row.p_at_line)).sort((a,b)=>a.line-b.line):[];
    const at=rows.findIndex(row=>row.line===leg.line);
    if(at<0)return '<section class="bb-single-ladder"><h2>Pre-game chances</h2><p>Pre-game ladder unavailable for this sample line.</p></section>';
    const expanded=!!state.ladders[key],visible=expanded?rows:rows.slice(Math.max(0,at-1),at+2),id='bb-ladder-'+key;
    return '<section class="bb-single-ladder" aria-label="'+esc(leg.player+' '+leg.side+' '+leg.market)+'"><h2>Pre-game chances</h2><div id="'+id+'" class="bb-single-rows'+(expanded?' is-expanded':'')+'"'+(expanded?' tabindex="0" aria-label="Full pre-game ladder"':'')+'>'+visible.map(row=>{
      const own=row.line===leg.line,chance=own?leg.p_at_line:row.p_at_line;
      return '<div class="bb-single-rung'+(own?' is-selected':'')+'"><span><span>'+esc(leg.side+' '+row.line+' '+leg.market)+'</span>'+(own?'<small>Your line</small>':'')+'</span><strong>'+pct(chance)+'</strong></div>';
    }).join('')+'</div>'+button('ladder-toggle',expanded?'Show less':'Show full ladder',key,false,' aria-expanded="'+expanded+'" aria-controls="'+id+'" class="bb-text-button"')+'</section>';
  }
  function singleSummary(item,save,ladderKey){
    if(!item)return '<p>No demo selected.</p>'+button('root','Open builder','betbuilder');
    return '<p class="bb-target">'+legName(item.leg)+'</p><div class="bb-chance"><strong>'+pct(item.leg.p_at_line)+'</strong><span>Chance to win</span></div><div class="bb-totals"><div><span>Stake</span><strong>'+money(item.totals.stake)+'</strong></div><div><span>Return if won · includes stake</span><strong>'+money(item.totals.total)+'</strong></div></div>'+stakeReminder()+'<p class="bb-meta">Sample summary · not placed. '+esc(item.leg.odds)+' odds.</p>'+
      (save?(item.decision&&host.decisionPanel?host.decisionPanel(item.decision):button('save-single','Add to sample picks',null,false,' class="bb-primary"')):'')+(host.historyChart?host.historyChart(item.leg,'single-'+(ladderKey||'preview')):'')+singleLadder(item,ladderKey||(save?'preview':'pick-'+state.pick))+details(item.leg,'single')+
      explanation('single-summary','<p>'+esc(F.config.settlement)+'</p><p>Break-even chance '+pct(item.totals.break_even)+'. The return includes your stake.</p><p>No money or real account is connected. Saved sample picks last only for this visit.</p>');
  }
  function picks(){return header('My sample picks',false)+navigation('picks')+'<p class="bb-meta">This visit only · not saved after reload.</p>'+(state.picks.length?state.picks.map((p,i)=>'<article class="bb-leg"><h2>'+legName(p.leg)+'</h2><p>'+money(p.totals.stake)+' stake · '+esc(p.leg.odds)+' odds</p>'+stakeReminder()+button('pick','View sample detail',String(i))+'</article>').join(''):'<p class="bb-empty">Preview a single bet and add it here.</p>')+button('root','View separate tracked parlay example','live',false,' class="bb-link"');}
  function render(route){const body=route==='betsparlay'?parlaySummary():route==='betsleg'?legEditor():route==='screen'?browse():route==='betssim'?simulation():route==='betsrecommended'?recommended():route==='live'?tracking():route==='picks'?picks():route==='betssingle'?header('Sample bet preview',true)+singleSummary(state.single,true):route==='betspick'?header('Sample pick detail',true)+singleSummary(state.picks[state.pick],false):builder();return '<div class="page bb-page">'+body+'<p class="bb-status" role="status">'+esc(state.message)+'</p></div>';}
  window.BetsBuilder={prefill:function(legs){state.pricingMode='exact';state.mode='parlay';state.legs=copy(legs);state.message='';state.record=null;state.legDraft=null;host.root('betsparlay');},renderSavedSingle:function(item,id){const key='external-'+id;state.externalSingles[key]=item;return singleSummary(item,false,key);},sourceRung,editCandidate,matchup,configure,state,input,action,render,price,payout,sorted,sync,cancel,finish,captureLadderScroll};
}());
