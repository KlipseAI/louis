// 생성물. scripts/build-figma-inventory.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 이 파일 내용을 그대로 넘긴다. 손대면 계획과 어긋난다.
const RESET=false;
const PLAN=[{"k":"text-field","L":"텍스트 필드","sp":[{"i":"text-field/adminSearch","l":"관리자 검색 입력 — 알약형 유리 입력(FIELD_CONTROL), 이메일·이름 검색","j":"AdminClient.tsx:1391-1406","t":{"p":"FIELD_CONTROL","w":372,"h":38,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","pad":[0,16,0,16],"J":"normal","bg":[0.98,0.98,0.98,0.1],"r":999,"mh":38}},{"i":"text-field/inspectorFramedInput","l":"인스펙터 초·프레임 입력 행 — 숫자 입력 둘과 단위 둘","j":"VideoEditModal.tsx:22545-22593","t":{"p":"inspectorFramedInputRow","w":372,"h":28,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":4,"H":1,"J":"flex-end","mw":140,"xw":140,"c":[{"p":"inspectorNumInput","w":56,"h":28,"wx":"FIX","hx":"FILL","wy":"선언","hy":"부모높이","pad":[4,8,4,8],"J":"normal","bg":[0.98,0.98,0.98,0.06],"r":6,"bw":1,"bc":[0.98,0.98,0.98,0.12]},{"p":"inspectorFramedInputUnit","w":10.27,"h":18,"wx":"HUG","hx":"HUG","ci":5,"wy":"주축","hy":"내용","J":"normal","t":"초","fg":[0.737,0.753,0.788,0.8],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1},{"p":"inspectorNumInput","w":56,"h":28,"wx":"FIX","hx":"FILL","wy":"선언","hy":"부모높이","pad":[4,8,4,8],"J":"normal","bg":[0.98,0.98,0.98,0.06],"r":6,"bw":1,"bc":[0.98,0.98,0.98,0.12]},{"p":"inspectorFramedInputUnit","w":30.77,"h":18,"wx":"HUG","hx":"HUG","ci":5,"wy":"주축","hy":"내용","J":"normal","t":"프레임","fg":[0.737,0.753,0.788,0.8],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1}]}},{"i":"text-field/refinementInput","l":"하이라이트 다듬기 입력 — 테두리 있는 사각 입력","j":"HighlightProjectScene.tsx:664-675","t":{"p":"refinementInput","w":372,"h":39,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","pad":[8,12,8,12],"J":"normal","bg":[0.341,0.365,0.408,0.55],"r":12,"bw":1,"bc":[0.98,0.98,0.98,0.15]}},{"i":"text-field/settingsRowName","l":"설정 이름 편집 입력 — 테두리 없이 알약 배경만","j":"SettingsScene.tsx:1095-1111","t":{"p":"settingsRowNameInput","w":372,"h":34,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"빈칸","pad":[0,12,0,12],"J":"normal","bg":[0.98,0.98,0.98,0.1],"r":999,"mh":34}}]},{"k":"toast","L":"토스트","sp":[{"i":"toast/adminError","l":"관리자 토스트 · 오류 스킨 — TOAST_ERROR 색 상수가 JSX에서 합성된다","j":"AdminClient.tsx:1553-1557","t":{"p":"TOAST","w":372,"h":45,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[12,20,12,20],"H":1,"J":"normal","r":999,"t":"사용자 목록을 불러오지 못했습니다","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150}},{"i":"toast/adminSuccess","l":"관리자 토스트 · 성공 스킨 — TOAST_SUCCESS 색 상수가 JSX에서 합성된다","j":"AdminClient.tsx:1443-1451","t":{"p":"TOAST","w":372,"h":45,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[12,20,12,20],"H":1,"J":"normal","r":999,"t":"지급이 완료되었습니다","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150}},{"i":"toast/appHome","l":"앱 홈 · 하이라이트 토스트","j":"AppHomeScene.tsx:1418-1428","t":{"p":"toast","w":108.34,"h":48,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[12,20,12,20],"J":"normal","bg":[0.89,0.894,0.91,0.7],"r":16,"sh":[[0,0,0,0.16],0,8,20],"c":[{"p":"toastText","w":68.34,"h":19,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"저장했어요","fg":[0.09,0.106,0.133,1],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"toast/myPage","l":"마이페이지 토스트 — 글자를 자기가 갖는다","j":"SubscriptionScene.tsx:1322 · SettingsScene.tsx:1959","t":{"p":"toast","w":118.34,"h":50,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[12,24,12,24],"J":"normal","bg":[0.09,0.106,0.133,1],"r":999,"bw":1,"bc":[0.98,0.98,0.98,0.1],"t":"저장했어요","fg":[0.98,0.98,0.98,0.92],"fs":16,"fw":400,"ls":-0.16,"lp":150}}]},{"k":"tooltip","L":"툴팁","sp":[{"i":"tooltip/analyticsBar","l":"애널리틱스 막대 툴팁 — 포인터를 따라간다","j":"useAnalyticsBarTooltip.tsx:169-177","t":{"p":"TOOLTIP_BASE","w":81.64,"h":32,"wx":"FILL","hx":"FIX","wy":"교차축","hy":"선언","pad":[4,8,4,8],"H":1,"J":"normal","bg":[0.89,0.894,0.91,1],"r":8,"bw":1,"bc":[0.09,0.106,0.133,0.12],"sh":[[0.09,0.106,0.133,0.12],0,12,24],"t":"여성 · 42.3%","fg":[0.09,0.106,0.133,1],"fs":12,"fw":400,"ls":-0.12,"lp":150,"mh":32}},{"i":"tooltip/chromeTooltip","l":"공용 크롬 툴팁 — body로 포털되는 버블(사이드바·노드 캔버스)","j":"ChromeTooltip.tsx:293-304","t":{"p":"PORTAL_ANCHOR","w":105.8,"h":28,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","J":"normal","c":[{"p":"BUBBLE","w":105.8,"h":28,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","J":"normal","c":[{"p":"BUBBLE_INNER","w":105.8,"h":28,"wx":"FILL","hx":"HUG","wy":"선언(채움)","hy":"내용","pad":[4,8,4,8],"J":"normal","bg":[0.89,0.894,0.91,1],"r":8,"bw":1,"bc":[0.09,0.106,0.133,0.12],"sh":[[0.09,0.106,0.133,0.12],0,12,24],"t":"전체 화면으로 보기","fg":[0.09,0.106,0.133,1],"fs":12,"fw":400,"ls":-0.12,"lp":150}]}]}},{"i":"tooltip/composerShotMode","l":"컴포저 모드 힌트 툴팁 — 부모 hover로만 열린다","j":"ComposerBar.tsx:407-409","t":{"p":"SHOT_MODE_TOOLTIP","w":112.57,"h":27.16,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[4,8,4,8],"J":"normal","bg":[0.89,0.894,0.91,1],"r":8,"bw":1,"bc":[0.09,0.106,0.133,0.12],"sh":[[0.09,0.106,0.133,0.12],0,12,24],"t":"한 장면으로 만들어요","fg":[0.09,0.106,0.133,1],"fs":12,"fw":400,"ls":-0.12,"lp":150}},{"i":"tooltip/upgradeTierFeature","l":"업그레이드 요금제 기능 툴팁","j":"page.tsx:619","t":{"p":"TIER_FEATURE_TIP","w":252.2,"h":27.16,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[4,8,4,8],"J":"normal","bg":[0.89,0.894,0.91,1],"r":8,"bw":1,"bc":[0.09,0.106,0.133,0.12],"sh":[[0.09,0.106,0.133,0.12],0,12,24],"t":"매달 크레딧 1,200개가 충전됩니다","fg":[0.09,0.106,0.133,1],"fs":12,"fw":400,"ls":-0.12,"lp":150}}]},{"k":"checkbox","L":"체크박스","sp":[{"i":"checkbox/awsSignupLegal","l":"AWS 가입 약관 동의 체크박스 — 구조는 같고 색 상수만 다른 두 번째 벌","j":"page.tsx:607-620","t":{"p":"LEGAL_AGREEMENT_LABEL","w":372,"h":25,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":10,"H":1,"J":"normal","c":[{"p":"LEGAL_CHECKBOX_OUTER","w":22,"h":22,"wx":"FIX","hx":"FIX","ci":1,"wy":"선언","hy":"선언","J":"normal","c":[{"p":"LEGAL_CHECKBOX_INPUT","w":22,"h":22,"wx":"FILL","hx":"FILL","wy":"선언(채움)","hy":"선언(채움)","J":"normal","bg":[0.231,0.231,0.231,1],"bw":2,"bc":[0.522,0.522,0.522,1]},{"p":"LEGAL_CHECKBOX_FACE","w":22,"h":22,"wx":"FIX","hx":"FIX","abs":1,"x":0,"y":0,"wy":"선언","hy":"선언","J":"normal","r":5}]},{"p":"LEGAL_AGREEMENT_TEXT","w":199.08,"h":25,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[1,0,0,0],"J":"normal","t":"개인정보 처리방침에 동의합니다","fg":[0.835,0.843,0.867,1],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"checkbox/signupLegal","l":"가입 약관 동의 체크박스","j":"page.tsx:632-655","t":{"p":"LEGAL_AGREEMENT_LABEL","w":372,"h":25,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":10,"H":1,"J":"normal","c":[{"p":"LEGAL_CHECKBOX_OUTER","w":22,"h":22,"wx":"FIX","hx":"FIX","ci":1,"wy":"선언","hy":"선언","J":"normal","c":[{"p":"LEGAL_CHECKBOX_INPUT","w":22,"h":22,"wx":"FILL","hx":"FILL","wy":"선언(채움)","hy":"선언(채움)","J":"normal","bg":[0.231,0.231,0.231,1],"bw":2,"bc":[0.522,0.522,0.522,1]},{"p":"LEGAL_CHECKBOX_FACE","w":22,"h":22,"wx":"FIX","hx":"FIX","abs":1,"x":0,"y":0,"wy":"선언","hy":"선언","J":"normal","r":5}]},{"p":"LEGAL_AGREEMENT_TEXT","w":199.08,"h":25,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[1,0,0,0],"J":"normal","t":"개인정보 처리방침에 동의합니다","fg":[0.98,0.98,0.98,0.86],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"checkbox/videoEditSourceRow","l":"영상 편집 소스 고르기 체크박스 — 네이티브 입력 자신","j":"VideoEditProjectPicker.tsx:499-505","t":{"p":"SOURCE_ROW_CHECK","w":20,"h":20,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal","bg":[0.231,0.231,0.231,1],"bw":2,"bc":[0.522,0.522,0.522,1]}}]}];

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
// 그라디언트는 background-image에서 온다. 이걸 안 쓰면 채움 버튼이 투명해진다.
const fillOf=n=>{
 if(n.gr) return [{type:"GRADIENT_LINEAR",gradientTransform:n.gr.t,
   gradientStops:n.gr.s.map(st=>({position:st[0],color:{r:st[1][0],g:st[1][1],b:st[1][2],a:st[1][3]}}))}];
 return paint(n.bg);};
const mkTxt=n=>{const t=figma.createText();t.name=n.p;t.fontName=F(n.fw);t.characters=n.t;t.fontSize=n.fs||14;
 t.lineHeight={unit:"PERCENT",value:n.lp||150};if(n.ls)t.letterSpacing={unit:"PIXELS",value:n.ls};
 t.fills=paint(n.fg);t.textAutoResize="WIDTH_AND_HEIGHT";
 t.textAlignHorizontal="CENTER";t.textAlignVertical="CENTER";return t;};
// FILL은 FILL로 남긴다. FILL이 성립하려면 부모가 폭을 가져야 하므로,
// hug 부모가 FILL 자식을 가지면 build()가 그 부모를 실측폭으로 고정한다.
const place=(parent,spec)=>{const node=build(spec);parent.appendChild(node);
 if(spec.abs){
  // 제품이 absolute로 띄우는 자식이다. flow 밖에 측정 좌표 그대로 놓는다.
  try{node.layoutPositioning="ABSOLUTE";}catch(e){}
  node.x=spec.x;node.y=spec.y;
  return node;}
 try{if(spec.wx==="FILL")node.layoutSizingHorizontal="FILL";}catch(e){}
 try{if(spec.hx==="FILL")node.layoutSizingVertical="FILL";}catch(e){}
 return node;};
// 간격이 제각각이면 큰 간격에서 잘라 중첩 오토레이아웃으로 묶는다. spacer는 쓰지 않는다.
// 음수 마진으로 바깥 여백이 깎였으면(ins) 묶음이 그만큼 안쪽 여백을 갖는다.
// 묶음의 안쪽 여백은 일괄값이 아니라 **그 묶음 첫 자식의 ci**다 — 음수 마진이 없는
// 자식(제목·설명)만 안쪽으로 들어가고, 음수 마진 자식(액션 행)은 pad 자리에서 시작한다.
const wrapSeg=(f,n,seg,inner)=>{
 const ci=P(seg[0]&&seg[0].ci);
 if(!ci&&seg.length===1){place(f,seg[0]);return;}
 const grp=figma.createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:"묶음",itemSpacing:seg.length>1?inner:0});
 grp.fills=[];
 if(n.H){grp.paddingTop=ci;grp.paddingBottom=ci;}else{grp.paddingLeft=ci;grp.paddingRight=ci;}
 f.appendChild(grp);for(const k of seg)place(grp,k);
 grp.layoutSizingHorizontal=n.H?"HUG":"FILL";grp.layoutSizingVertical=n.H?"FILL":"HUG";};
const addKids=(f,n)=>{const kids=n.c||[];
 if(!n.gs||!n.gs.length){
  if(kids.some(k=>P(k.ci))){wrapSeg(f,n,kids,P(n.gap));return;}
  for(const k of kids)place(f,k);return;}
 const big=Math.max.apply(null,n.gs);let inner=0;
 for(const g of n.gs){if(Math.abs(g-big)>=0.02){inner=g;break;}}
 f.itemSpacing=big;const segs=[[kids[0]]];
 n.gs.forEach((g,i)=>{if(Math.abs(g-big)<0.02)segs.push([kids[i+1]]);else segs[segs.length-1].push(kids[i+1]);});
 for(const seg of segs)wrapSeg(f,n,seg,inner);};
const build=n=>{
 if(n.T&&!(n.c||[]).length)return mkTxt(n);
 const f=figma.createAutoLayout(n.H?"HORIZONTAL":"VERTICAL",{name:n.p,itemSpacing:P(n.gap)});
 const pad=n.pad||[0,0,0,0];
 f.paddingTop=P(pad[0]);f.paddingRight=P(pad[1]);f.paddingBottom=P(pad[2]);f.paddingLeft=P(pad[3]);
 f.fills=fillOf(n);
 f.cornerRadius=n.r===-1?Math.max(1,Math.min(n.w,n.h))/2:Math.min(P(n.r),Math.max(1,Math.min(n.w,n.h))/2);
 if(n.bw>0&&n.bc){f.strokes=paint(n.bc);f.strokeWeight=n.bw;f.strokeAlign="INSIDE";}
 // 내용 슬롯: 제품에서 SVG·자식이 채우는 자리라 하네스가 0으로 쟀다. 크기를 지어내지 않고
 // 점선으로 자리만 보여 준다 — 조립할 때 여기에 아이콘을 넣으면 hug로 자란다.
 if(n.slot){f.name="슬롯: "+n.p;f.strokes=[{type:"SOLID",color:INK,opacity:0.25}];
  f.strokeWeight=1;f.strokeAlign="INSIDE";f.dashPattern=[3,3];f.minWidth=8;f.minHeight=8;}
 if(n.sh)f.effects=[{type:"DROP_SHADOW",visible:true,blendMode:"NORMAL",
   color:{r:n.sh[0][0],g:n.sh[0][1],b:n.sh[0][2],a:n.sh[0][3]},offset:{x:n.sh[1],y:n.sh[2]},radius:n.sh[3],spread:0}];
 // CSS 정렬을 그대로 옮긴다. 하드코딩한 CENTER는 양끝 배치·왼쪽 정렬을 뭉갠다.
 const JM={"center":"CENTER","flex-end":"MAX","space-between":"SPACE_BETWEEN","flex-start":"MIN","normal":"MIN"};
 const AM={"center":"CENTER","flex-end":"MAX","flex-start":"MIN","baseline":"BASELINE","stretch":"MIN","normal":"MIN"};
 f.primaryAxisAlignItems=JM[n.J||"flex-start"]||"MIN";
 f.counterAxisAlignItems=AM[n.A||"stretch"]||"MIN";
 f.clipsContent=false;
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
 // 같은 섹션이 이미 있으면 지우고 다시 그린다 — draw 파일 하나만 재실행해도 중복이 없다.
 const prev=root.children.find(x=>x.name==="sec:"+sec.k);
 if(prev)prev.remove();
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
  // 크기 정책과 **그 근거**를 함께 적는다 — 조립할 때 무엇을 믿어도 되는지 알려면 필요하다.
  const SZ={FIX:"고정",FILL:"채움",HUG:"허그"};
  head.appendChild(T(sp.t.p+" · "+sp.t.w+"×"+sp.t.h,11,"r",0.62,cardW-40));
  head.appendChild(T("폭 "+SZ[sp.t.wx]+"("+sp.t.wy+")  ·  높이 "+SZ[sp.t.hx]+"("+sp.t.hy+")",11,"r",0.45,cardW-40));
  created.push(card.id);}}
const drift=check.filter(c=>c.m!==c.f);
return {count:created.length,어긋난것:drift.length,drift:drift.slice(0,12),그릴수없음:skipped};
