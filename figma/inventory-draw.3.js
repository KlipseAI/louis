// 생성물. scripts/build-figma-inventory.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 이 파일 내용을 그대로 넘긴다. 손대면 계획과 어긋난다.
const RESET=false;
const PLAN=[{"k":"dialog","L":"모달","sp":[{"i":"dialog/appHome","l":"삭제 확인 모달","j":"AppHomeScene.tsx:1379-1410","t":{"p":"modalCard","w":360,"h":148,"wx":"FIX","hx":"HUG","pad":[16,16,8,8],"ins":[0,0,8,8],"gs":[8,24],"bg":[0.192,0.212,0.251,1],"r":24,"c":[{"p":"modalTitle","w":328,"h":24,"wx":"FILL","hx":"HUG","t":"프로젝트를 삭제할까요?","fg":[0.98,0.98,0.98,1],"fs":16,"fw":600,"ls":-0.16,"lp":150,"T":1},{"p":"modalDescription","w":328,"h":24,"wx":"FILL","hx":"HUG","t":"삭제하면 되돌릴 수 없습니다.","fg":[0.98,0.98,0.98,0.6],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1},{"p":"modalActions","w":344,"h":44,"wx":"FILL","hx":"HUG","gap":8,"H":1,"c":[{"p":"modalCancel","w":168,"h":44,"wx":"HUG","hx":"FIX","bg":[0.98,0.98,0.98,0.1],"r":16,"t":"취소","fg":[0.98,0.98,0.98,1],"fs":16,"fw":500,"ls":-0.16,"lp":150},{"p":"modalConfirm","w":168,"h":44,"wx":"HUG","hx":"FIX","bg":[1,0.294,0.349,1],"r":16,"t":"삭제","fg":[0.98,0.98,0.98,1],"fs":16,"fw":500,"ls":-0.16,"lp":150}]}]}},{"i":"dialog/myPage","l":"마이페이지 확인 모달","j":"SubscriptionScene.tsx:1275-1310","t":{"p":"modalCard","w":360,"h":169,"wx":"FIX","hx":"HUG","pad":[16,16,8,8],"ins":[0,0,8,8],"gs":[16,40],"bg":[0.192,0.212,0.251,1],"r":24,"c":[{"p":"modalTitle","w":328,"h":24,"wx":"FILL","hx":"HUG","t":"프로젝트를 삭제할까요?","fg":[0.98,0.98,0.98,1],"fs":16,"fw":600,"ls":-0.16,"lp":150,"T":1},{"p":"modalDescription","w":328,"h":21,"wx":"FILL","hx":"HUG","t":"삭제하면 되돌릴 수 없습니다.","fg":[0.98,0.98,0.98,0.6],"fs":14,"fw":400,"ls":-0.14,"lp":150,"T":1},{"p":"modalActions","w":344,"h":44,"wx":"FILL","hx":"HUG","gap":8,"H":1,"c":[{"p":"modalCancel","w":168,"h":44,"wx":"FIX","hx":"FIX","bg":[0.98,0.98,0.98,0.1],"r":16,"t":"취소","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150},{"p":"modalConfirm","w":168,"h":44,"wx":"HUG","hx":"FIX","bg":[0.98,0.98,0.98,1],"r":16,"t":"삭제","fg":[0,0,0,1],"fs":14,"fw":500,"ls":-0.14,"lp":150}]}]}}]},{"k":"project-card","L":"프로젝트 카드","sp":[{"i":"project-card/appHome","l":"앱 홈 · 프로젝트 카드","j":"AppHomeScene.tsx:1061-1352","t":{"p":"archiveCard","w":84,"h":0,"wx":"HUG","hx":"HUG","r":16,"c":[{"p":"archivePreview","w":84,"h":0,"wx":"FIX","hx":"HUG","bg":[0.09,0.106,0.133,1],"r":16,"c":[{"p":"archivePreviewClip","w":84,"h":0,"wx":"FILL","hx":"HUG","r":16,"c":[{"p":"archivePreviewPlaceholder","w":84,"h":0,"wx":"FILL","hx":"HUG","bg":[0.09,0.106,0.133,1],"r":16,"c":[{"p":"cardDraftThumbnail","w":84,"h":0,"wx":"FIX","hx":"FIX","bg":[0.09,0.106,0.133,1]}]}]},{"p":"archivePreviewTitleOverlay","w":84,"h":32,"wx":"FILL","hx":"FIX","pad":[16,16,16,16],"H":1,"c":[{"p":"archivePreviewTitleOverlayInner","w":52,"h":60.78,"wx":"FIX","hx":"HUG","gap":4,"c":[{"p":"archivePreviewEyebrow","w":52,"h":16.8,"wx":"FILL","hx":"HUG","t":"노드 캔버스","fg":[0.945,0.945,0.953,1],"fs":14,"fw":400,"ls":-0.14,"lp":120,"T":1},{"p":"archivePreviewTitleOverlayText","w":52,"h":19.19,"wx":"FILL","hx":"HUG","t":"여름 캠페인 키비주얼","fg":[0.945,0.945,0.953,1],"fs":16,"fw":500,"ls":-0.16,"lp":120,"T":1},{"p":"archivePreviewLastEdited","w":52,"h":16.8,"wx":"FILL","hx":"HUG","t":"3일 전 편집","fg":[0.945,0.945,0.953,1],"fs":14,"fw":400,"ls":-0.14,"lp":120,"T":1}]}]},{"p":"archiveMenuAnchorInThumbnail","w":32,"h":39,"wx":"FILL","hx":"HUG","c":[{"p":"archiveMoreButton","w":32,"h":32,"wx":"FIX","hx":"FIX","H":1,"bg":[0.192,0.212,0.251,0.5],"r":12},{"p":"archiveDropdown","w":147.2,"h":116.84,"wx":"FILL","hx":"HUG","pad":[6,6,4.72,6],"ins":[0,0,1.28,0],"gap":2,"bg":[0.192,0.212,0.251,1],"r":16,"sh":[[0,0,0,0.04],0,8,15],"mw":160,"c":[{"p":"archiveDropdownItem","w":136.16,"h":34.04,"wx":"FIX","hx":"HUG","pad":[8,12,8,12],"H":1,"r":10,"t":"새 탭에서 열기","fg":[0.98,0.98,0.98,0.86],"fs":14,"fw":400,"ls":-0.14,"lp":150},{"p":"archiveDropdownItem","w":136.16,"h":34.04,"wx":"FIX","hx":"HUG","pad":[8,12,8,12],"H":1,"r":10,"t":"이름 바꾸기","fg":[0.98,0.98,0.98,0.86],"fs":14,"fw":400,"ls":-0.14,"lp":150},{"p":"archiveDropdownItem","w":136.16,"h":34.04,"wx":"FIX","hx":"HUG","pad":[8,12,8,12],"H":1,"r":10,"t":"삭제","fg":[0.98,0.98,0.98,0.86],"fs":14,"fw":400,"ls":-0.14,"lp":150}]}]}]}]}},{"i":"project-card/nodeCanvasHome","l":"노드캔버스 홈 · 프로젝트 카드 — 아이브로우가 없다","j":"NodeCanvasHomeScene.tsx:1361-1601","t":{"p":"ARCHIVE_CARD","w":84,"h":0,"wx":"FIX","hx":"HUG","r":16,"c":[{"p":"ARCHIVE_PREVIEW","w":84,"h":0,"wx":"FIX","hx":"HUG","bg":[0.09,0.106,0.133,1],"r":16,"c":[{"p":"ARCHIVE_PREVIEW_CLIP","w":84,"h":0,"wx":"FILL","hx":"HUG","r":16,"c":[{"p":"ARCHIVE_PREVIEW_PLACEHOLDER","w":84,"h":0,"wx":"FILL","hx":"HUG","bg":[0.09,0.106,0.133,1],"r":16,"c":[{"p":"CARD_DRAFT_WORDMARK_CANVAS","w":84,"h":0,"wx":"FIX","hx":"FIX","H":1,"bg":[0.09,0.106,0.133,1]}]}]},{"p":"ARCHIVE_PREVIEW_TITLE_OVERLAY","w":84,"h":32,"wx":"FILL","hx":"FIX","pad":[16,16,16,16],"H":1,"c":[{"p":"ARCHIVE_PREVIEW_TITLE_OVERLAY_INNER","w":52,"h":39.98,"wx":"FILL","hx":"HUG","gap":4,"c":[{"p":"ARCHIVE_PREVIEW_TITLE_OVERLAY_TEXT","w":52,"h":19.19,"wx":"FILL","hx":"HUG","t":"여름 캠페인 키비주얼","fg":[0.945,0.945,0.953,1],"fs":16,"fw":500,"ls":-0.16,"lp":120,"T":1},{"p":"ARCHIVE_PREVIEW_LAST_EDITED","w":52,"h":16.8,"wx":"FILL","hx":"HUG","t":"3일 전 편집","fg":[0.945,0.945,0.953,1],"fs":14,"fw":400,"ls":-0.14,"lp":120,"T":1}]}]},{"p":"ARCHIVE_MENU_ANCHOR_IN_THUMBNAIL","w":32,"h":39,"wx":"FILL","hx":"HUG","c":[{"p":"ARCHIVE_MORE_BUTTON","w":32,"h":32,"wx":"FIX","hx":"FIX","H":1,"bg":[0.192,0.212,0.251,0.5],"r":12},{"p":"ARCHIVE_DROPDOWN","w":160,"h":127,"wx":"FIX","hx":"HUG","pad":[6,6,6,6],"gap":2,"bg":[0.192,0.212,0.251,1],"r":16,"sh":[[0,0,0,0.04],0,8,15],"mw":160,"c":[{"p":"ARCHIVE_DROPDOWN_ITEM_BASE","w":148,"h":37,"wx":"FILL","hx":"HUG","pad":[8,12,8,12],"H":1,"r":10,"t":"새 탭에서 열기","fg":[1,1,1,1],"fs":14,"fw":400,"ls":-0.14,"lp":150},{"p":"ARCHIVE_DROPDOWN_ITEM_BASE","w":148,"h":37,"wx":"FILL","hx":"HUG","pad":[8,12,8,12],"H":1,"r":10,"t":"이름 바꾸기","fg":[1,1,1,1],"fs":14,"fw":400,"ls":-0.14,"lp":150},{"p":"ARCHIVE_DROPDOWN_ITEM_BASE","w":148,"h":37,"wx":"FILL","hx":"HUG","pad":[8,12,8,12],"H":1,"r":10,"t":"삭제","fg":[1,1,1,1],"fs":14,"fw":400,"ls":-0.14,"lp":150}]}]}]}]}}]},{"k":"segmented-control","L":"세그먼트 컨트롤","sp":[{"i":"segmented-control/instagramAnalytics","l":"인스타그램 분석 · 기간 선택기 (3구간)","j":"InstagramAnalyticsScene.tsx:1825-1846","t":{"p":"PERIOD_SELECTOR","w":92.53,"h":28,"wx":"HUG","hx":"HUG","pad":[3,1,3,3],"ins":[0,2,0,0],"gap":2,"H":1,"r":8,"c":[{"p":"PERIOD_SELECTOR_THUMB","w":0,"h":22,"wx":"FIX","hx":"FIX","r":6},{"p":"PERIOD_BTN","w":20.86,"h":22,"wx":"HUG","hx":"HUG","bg":[0.42,0.42,0.42,1],"bw":2,"bc":[1,1,1,1],"t":"7일","fg":[0.98,0.98,0.98,0.58],"fs":12,"fw":500,"ls":-0.12,"lp":150},{"p":"PERIOD_BTN_ACTIVE","w":29.78,"h":22,"wx":"HUG","hx":"HUG","bg":[0.42,0.42,0.42,1],"bw":2,"bc":[1,1,1,1],"t":"1개월","fg":[0.98,0.98,0.98,1],"fs":12,"fw":500,"ls":-0.12,"lp":150},{"p":"PERIOD_BTN","w":31.89,"h":22,"wx":"HUG","hx":"HUG","bg":[0.42,0.42,0.42,1],"bw":2,"bc":[1,1,1,1],"t":"3개월","fg":[0.98,0.98,0.98,0.58],"fs":12,"fw":500,"ls":-0.12,"lp":150}]}},{"i":"segmented-control/youtubeAnalytics","l":"유튜브 분석 · 기간 선택기 (5구간)","j":"YoutubeAnalyticsScene.tsx:2090-2117","t":{"p":"PERIOD_SELECTOR","w":340,"h":28,"wx":"HUG","hx":"HUG","pad":[3,3,3,3],"gap":2,"H":1,"r":8,"c":[{"p":"PERIOD_SELECTOR_THUMB","w":0,"h":22,"wx":"FIX","hx":"FIX","r":6},{"p":"PERIOD_BTN","w":20.86,"h":22,"wx":"HUG","hx":"HUG","bg":[0.42,0.42,0.42,1],"bw":2,"bc":[1,1,1,1],"t":"7일","fg":[0.98,0.98,0.98,0.58],"fs":12,"fw":500,"ls":-0.12,"lp":150},{"p":"PERIOD_BTN_ACTIVE","w":29.78,"h":22,"wx":"HUG","hx":"HUG","bg":[0.42,0.42,0.42,1],"bw":2,"bc":[1,1,1,1],"t":"1개월","fg":[0.98,0.98,0.98,1],"fs":12,"fw":500,"ls":-0.12,"lp":150},{"p":"PERIOD_BTN","w":31.89,"h":22,"wx":"HUG","hx":"HUG","bg":[0.42,0.42,0.42,1],"bw":2,"bc":[1,1,1,1],"t":"3개월","fg":[0.98,0.98,0.98,0.58],"fs":12,"fw":500,"ls":-0.12,"lp":150},{"p":"PERIOD_BTN","w":19.53,"h":22,"wx":"HUG","hx":"HUG","bg":[0.42,0.42,0.42,1],"bw":2,"bc":[1,1,1,1],"t":"1년","fg":[0.98,0.98,0.98,0.58],"fs":12,"fw":500,"ls":-0.12,"lp":150},{"p":"PERIOD_BTN","w":47.83,"h":22,"wx":"HUG","hx":"HUG","bg":[0.42,0.42,0.42,1],"bw":2,"bc":[1,1,1,1],"t":"전체 기간","fg":[0.98,0.98,0.98,0.58],"fs":12,"fw":500,"ls":-0.12,"lp":150}]}}]},{"k":"toast","L":"토스트","sp":[{"i":"toast/appHome","l":"앱 홈 · 하이라이트 토스트","j":"AppHomeScene.tsx:1418-1428","t":{"p":"toast","w":108.34,"h":48,"wx":"FILL","hx":"HUG","pad":[12,20,12,20],"bg":[0.89,0.894,0.91,0.7],"r":16,"sh":[[0,0,0,0.16],0,8,20],"c":[{"p":"toastText","w":68.34,"h":19,"wx":"HUG","hx":"HUG","t":"저장했어요","fg":[0.09,0.106,0.133,1],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"toast/myPage","l":"마이페이지 토스트 — 글자를 자기가 갖는다","j":"SubscriptionScene.tsx:1322 · SettingsScene.tsx:1959","t":{"p":"toast","w":118.34,"h":50,"wx":"FILL","hx":"HUG","pad":[12,24,12,24],"bg":[0.09,0.106,0.133,1],"r":999,"bw":1,"bc":[0.98,0.98,0.98,0.1],"t":"저장했어요","fg":[0.98,0.98,0.98,0.92],"fs":16,"fw":400,"ls":-0.16,"lp":150}}]}];

const page=figma.root.children.find(p=>p.name==="Product inventory");
await figma.setCurrentPageAsync(page);
let root=page.children.find(n=>n.name==="합치기 비교판 — 제품 경쟁 정의");
if(RESET){for(const s of [...root.children]) if(s.name!=="읽는 법") s.remove();}
const INK={r:0.98,g:0.98,b:0.98};
const stageFill=[{type:"SOLID",color:INK,opacity:0.03}];
const WT={400:"Regular",500:"Medium",600:"SemiBold",700:"Bold"};
const F=w=>({family:"Pretendard",style:WT[w]||"Regular"});
for(const w of Object.keys(WT)) await figma.loadFontAsync(F(+w));
const bold=F(700),reg=F(400);
const P=v=>Math.max(0,Number(v)||0);
const paint=c=>(!c||c[3]===0?[]:[{type:"SOLID",color:{r:c[0],g:c[1],b:c[2]},opacity:c[3]}]);
const mkTxt=n=>{const t=figma.createText();t.name=n.p;t.fontName=F(n.fw);t.characters=n.t;t.fontSize=n.fs||14;
 t.lineHeight={unit:"PERCENT",value:n.lp||150};if(n.ls)t.letterSpacing={unit:"PIXELS",value:n.ls};
 t.fills=paint(n.fg);t.textAutoResize="WIDTH_AND_HEIGHT";
 t.textAlignHorizontal="CENTER";t.textAlignVertical="CENTER";return t;};
// FILL은 FILL로 남긴다. FILL이 성립하려면 부모가 폭을 가져야 하므로,
// hug 부모가 FILL 자식을 가지면 build()가 그 부모를 실측폭으로 고정한다.
const place=(parent,spec)=>{const node=build(spec);parent.appendChild(node);
 try{if(spec.wx==="FILL")node.layoutSizingHorizontal="FILL";}catch(e){}
 try{if(spec.hx==="FILL")node.layoutSizingVertical="FILL";}catch(e){}
 return node;};
// 간격이 제각각이면 큰 간격에서 잘라 중첩 오토레이아웃으로 묶는다. spacer는 쓰지 않는다.
// 음수 마진으로 바깥 여백이 깎였으면(ins) 묶음이 그만큼 안쪽 여백을 갖는다.
const addKids=(f,n)=>{const kids=n.c||[];
 const ins=n.ins||[0,0,0,0];
 if(!n.gs||!n.gs.length){
  if(ins[0]||ins[1]||ins[2]||ins[3]){
   const grp=figma.createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:"묶음",itemSpacing:P(n.gap)});
   grp.fills=[];grp.paddingTop=P(ins[0]);grp.paddingRight=P(ins[1]);grp.paddingBottom=P(ins[2]);grp.paddingLeft=P(ins[3]);
   f.appendChild(grp);for(const k of kids)place(grp,k);
   grp.layoutSizingHorizontal=n.H?"HUG":"FILL";grp.layoutSizingVertical=n.H?"FILL":"HUG";return;}
  for(const k of kids)place(f,k);return;}
 const big=Math.max.apply(null,n.gs);let inner=0;
 for(const g of n.gs){if(Math.abs(g-big)>=0.02){inner=g;break;}}
 f.itemSpacing=big;const segs=[[kids[0]]];
 n.gs.forEach((g,i)=>{if(Math.abs(g-big)<0.02)segs.push([kids[i+1]]);else segs[segs.length-1].push(kids[i+1]);});
 for(const seg of segs){
  const grp=figma.createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:"묶음",itemSpacing:seg.length>1?inner:0});
  grp.fills=[];grp.paddingRight=P(ins[1]);grp.paddingLeft=P(ins[3]);
  f.appendChild(grp);for(const k of seg)place(grp,k);
  grp.layoutSizingHorizontal=n.H?"HUG":"FILL";grp.layoutSizingVertical=n.H?"FILL":"HUG";}};
const build=n=>{
 if(n.T&&!(n.c||[]).length)return mkTxt(n);
 const f=figma.createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:n.p,itemSpacing:P(n.gap)});
 const pad=n.pad||[0,0,0,0];
 f.paddingTop=P(pad[0]);f.paddingRight=P(pad[1]);f.paddingBottom=P(pad[2]);f.paddingLeft=P(pad[3]);
 f.fills=paint(n.bg);
 f.cornerRadius=n.r===-1?Math.max(1,Math.min(n.w,n.h))/2:Math.min(P(n.r),Math.max(1,Math.min(n.w,n.h))/2);
 if(n.bw>0&&n.bc){f.strokes=paint(n.bc);f.strokeWeight=n.bw;f.strokeAlign="INSIDE";}
 if(n.sh)f.effects=[{type:"DROP_SHADOW",visible:true,blendMode:"NORMAL",
   color:{r:n.sh[0][0],g:n.sh[0][1],b:n.sh[0][2],a:n.sh[0][3]},offset:{x:n.sh[1],y:n.sh[2]},radius:n.sh[3],spread:0}];
 f.primaryAxisAlignItems="CENTER";f.counterAxisAlignItems="CENTER";f.clipsContent=false;
 if(n.t)f.appendChild(mkTxt(n));
 addKids(f,n);
 // hug 부모가 FILL 자식을 가지면 FILL이 성립하지 않는다. 그때 부모를 실측 크기로
 // 고정한다 — 자식의 FILL은 그대로 남아, 조립할 때 부모 고정만 풀면 된다.
 const kidsAll=n.c||[];
 const wxEff=(n.wx==="HUG"&&kidsAll.some(k=>k.wx==="FILL"))?"FIX":n.wx;
 const hxEff=(n.hx==="HUG"&&kidsAll.some(k=>k.hx==="FILL"))?"FIX":n.hx;
 if(wxEff==="FIX"){f.layoutSizingHorizontal="FIXED";f.resize(Math.max(1,n.w),f.height);}
 if(hxEff==="FIX"){f.layoutSizingVertical="FIXED";f.resize(f.width,Math.max(1,n.h));}
 if(n.mw)f.minWidth=n.mw;if(n.mh)f.minHeight=n.mh;if(n.xw)f.maxWidth=n.xw;
 return f;};
const T=(s,sz,w,a,wd)=>{const t=figma.createText();t.fontName=w==="b"?bold:reg;t.characters=s;t.fontSize=sz;
 t.fills=[{type:"SOLID",color:INK,opacity:a}];
 if(wd){t.textAutoResize="NONE";t.resize(wd,10);t.textAutoResize="HEIGHT";}return t;};
const created=[],check=[],skipped=[];
for(const sec of PLAN){
 const s=figma.createAutoLayout("VERTICAL",{name:"sec:"+sec.k,itemSpacing:24});
 s.fills=[];root.appendChild(s);
 s.appendChild(T(sec.L+" — 제품 표본 "+sec.sp.length+"종",24,"b",1));
 const rows=figma.createAutoLayout("HORIZONTAL",{name:"실제 모습",itemSpacing:40});
 rows.fills=[];rows.layoutWrap="WRAP";rows.counterAxisSpacing=40;s.appendChild(rows);
 rows.layoutSizingHorizontal="FIXED";rows.resize(1700,rows.height);rows.layoutSizingVertical="HUG";
 for(const sp of sec.sp){
  const cardW=Math.max(360,Math.ceil(sp.t.w)+80);
  const card=figma.createAutoLayout("VERTICAL",{name:sp.i,itemSpacing:12});
  card.fills=[];rows.appendChild(card);
  card.layoutSizingHorizontal="FIXED";card.resize(cardW,card.height);card.layoutSizingVertical="HUG";
  const stage=figma.createAutoLayout("HORIZONTAL",{name:"stage",itemSpacing:0,paddingTop:28,paddingRight:28,paddingBottom:28,paddingLeft:28});
  stage.fills=stageFill;stage.cornerRadius=12;
  stage.primaryAxisAlignItems="CENTER";stage.counterAxisAlignItems="CENTER";stage.clipsContent=true;
  card.appendChild(stage);stage.layoutSizingHorizontal="FILL";stage.layoutSizingVertical="HUG";
  if(sp.t.h<1||sp.t.w<1){
   stage.appendChild(T("실측 "+sp.t.w+"×"+sp.t.h+" — 하네스에서 내용(썸네일·비디오)이 없어 접혔다. 아직 그릴 수 없다.",12,"r",0.55,cardW-96));
   skipped.push(sp.i);
  } else {
   // FILL은 FILL로 남긴다 — 나중에 조립할 때 그대로 쓰기 위해서다.
   // 대신 **무대를 실측폭+여백으로 고정**해 FILL이 정확히 실측폭을 받게 한다.
   if(sp.t.wx==="FILL"){stage.layoutSizingHorizontal="FIXED";stage.resize(Math.ceil(sp.t.w)+56,stage.height);}
   const built=place(stage,sp.t);
   check.push({i:sp.i,m:sp.t.w+"×"+sp.t.h,f:Math.round(built.width*100)/100+"×"+Math.round(built.height*100)/100});
  }
  const head=figma.createAutoLayout("VERTICAL",{name:"head",itemSpacing:3});
  head.fills=[];card.appendChild(head);head.layoutSizingHorizontal="FILL";
  head.appendChild(T(sp.l,14,"b",1,cardW-40));
  head.appendChild(T(sp.j,11,"r",0.42,cardW-40));
  head.appendChild(T(sp.t.p+" · "+sp.t.w+"×"+sp.t.h+" · 폭 "+(sp.t.wx==="FIX"?"선언":sp.t.wx==="FILL"?"부모가 줌":"내용이 정함")+
   " · 높이 "+(sp.t.hx==="FIX"?"선언":sp.t.hx==="FILL"?"부모가 줌":"내용이 정함"),11,"r",0.62,cardW-40));
  created.push(card.id);}}
const drift=check.filter(c=>c.m!==c.f);
return {count:created.length,어긋난것:drift.length,drift:drift.slice(0,12),그릴수없음:skipped};
