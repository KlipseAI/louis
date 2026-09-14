// 생성물. scripts/build-figma-inventory.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 이 파일 내용을 그대로 넘긴다. 손대면 계획과 어긋난다.
const RESET=true;
const PLAN=[{"k":"input-form","L":"폼 입력(플로팅 라벨)","sp":[{"i":"input-form/awsSignupNameResting","l":"AWS 가입 이름 입력 — 색 상수만 다른 넷째 벌 (navy 고정 다크)","j":"page.tsx:482-501","t":{"p":"INPUT_BOX","w":372,"h":80,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[20,16,12,16],"gap":2,"J":"normal","c":[{"p":"INPUT","w":340,"h":24,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"빈칸","J":"normal"},{"p":"FLOATING_LABEL_RESTING","w":27.34,"h":19,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"이름","fg":[0.98,0.98,0.98,1],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"input-form/loginEmailResting","l":"로그인 이메일 입력 — 라벨 쉬는 상태 (그룹 상단 상자, 둘째 벌)","j":"page.tsx:423-487","t":{"p":"INPUT_BOX","w":372,"h":82,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[20,16,12,16],"gap":2,"J":"normal","bg":[0.98,0.98,0.98,0.04],"bw":1,"bc":[0.98,0.98,0.98,1],"c":[{"p":"INPUT","w":338,"h":24,"wx":"FILL","hx":"FIX","ci":1,"wy":"선언(채움)","hy":"빈칸","J":"normal"},{"p":"FLOATING_LABEL_REST","w":41.02,"h":19,"wx":"HUG","hx":"HUG","ci":1,"wy":"주축","hy":"내용","J":"normal","t":"이메일","fg":[0.98,0.98,0.98,1],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"input-form/loginPasswordFloated","l":"로그인 비밀번호 입력 — 라벨 뜬 상태 + 지우기·보기 토글 두 개 (그룹 하단 상자)","j":"page.tsx:489-578","t":{"p":"INPUT_BOX","w":372,"h":82,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[20,16,12,16],"gap":6,"J":"normal","bg":[0.98,0.98,0.98,0.04],"bw":1,"bc":[0.98,0.98,0.98,1],"c":[{"p":"INPUT","w":338,"h":24,"wx":"FILL","hx":"FIX","ci":1,"wy":"선언(채움)","hy":"빈칸","J":"normal"},{"p":"PASSWORD_TOGGLE","w":22,"h":22,"wx":"FIX","hx":"FIX","abs":1,"x":355,"y":30,"wy":"교차축","hy":"내용","pad":[2,2,2,2],"H":1,"J":"center","c":[{"p":"PASSWORD_TOGGLE_ICON","w":18,"h":18,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal"}]},{"p":"PASSWORD_TOGGLE","w":22,"h":22,"wx":"FIX","hx":"FIX","abs":1,"x":355,"y":30,"wy":"교차축","hy":"내용","pad":[2,2,2,2],"H":1,"J":"center","c":[{"p":"PASSWORD_TOGGLE_ICON","w":18,"h":18,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal"}]},{"p":"FLOATING_LABEL_FLOATED","w":40.86,"h":14,"wx":"HUG","hx":"HUG","ci":1,"wy":"주축","hy":"내용","J":"normal","t":"비밀번호","fg":[0.98,0.98,0.98,1],"fs":12,"fw":400,"ls":-0.16,"lp":100,"T":1}]}},{"i":"input-form/recoverEmailResting","l":"계정 복구 이메일 입력 — 라벨 쉬는 상태 (같은 구조의 셋째 벌, 타이포가 INPUT 상수 안에 있다)","j":"page.tsx:214-276","t":{"p":"INPUT_BOX","w":372,"h":82,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[20,16,12,16],"gap":2,"J":"normal","bg":[0.98,0.98,0.98,0.04],"bw":1,"bc":[0.98,0.98,0.98,1],"c":[{"p":"INPUT","w":338,"h":24,"wx":"FILL","hx":"FIX","ci":1,"wy":"선언(채움)","hy":"빈칸","J":"normal"},{"p":"FLOATING_LABEL_RESTING","w":41.02,"h":19,"wx":"HUG","hx":"HUG","ci":1,"wy":"주축","hy":"내용","J":"normal","t":"이메일","fg":[0.98,0.98,0.98,1],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"input-form/resetPasswordEmailResting","l":"비밀번호 재설정 이메일 입력 — 반경을 제 몸에 갖는 벌","j":"page.tsx:196-224","t":{"p":"INPUT_BOX","w":372,"h":80,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[20,16,12,16],"gap":2,"J":"normal","bg":[0.98,0.98,0.98,0.04],"r":12,"c":[{"p":"INPUT","w":340,"h":24,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"빈칸","J":"normal"},{"p":"FLOATING_LABEL_RESTING","w":41.02,"h":19,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"이메일","fg":[0.98,0.98,0.98,1],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"input-form/signupNameResting","l":"회원가입 이름 입력 — 라벨 쉬는 상태 (단일 라운드 상자)","j":"page.tsx:424-456","t":{"p":"INPUT_BOX","w":372,"h":80,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[20,16,12,16],"gap":2,"J":"normal","bg":[0.98,0.98,0.98,0.04],"c":[{"p":"INPUT","w":340,"h":24,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"빈칸","J":"normal"},{"p":"FLOATING_LABEL_RESTING","w":27.34,"h":19,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"이름","fg":[0.98,0.98,0.98,1],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"input-form/signupPasswordFloated","l":"회원가입 비밀번호 입력 — 라벨 뜬 상태 + 비밀번호 보기 토글 (그룹 상단 상자)","j":"page.tsx:492-548","t":{"p":"INPUT_BOX","w":372,"h":80,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[20,16,12,16],"gap":6,"J":"normal","bg":[0.98,0.98,0.98,0.04],"c":[{"p":"INPUT","w":340,"h":24,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"빈칸","J":"normal"},{"p":"PASSWORD_TOGGLE","w":22,"h":22,"wx":"FIX","hx":"FIX","abs":1,"x":338,"y":35.6,"wy":"교차축","hy":"내용","pad":[2,2,2,2],"H":1,"J":"center","c":[{"p":"PASSWORD_TOGGLE_ICON","w":18,"h":18,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"normal"}]},{"p":"FLOATING_LABEL_FLOATED","w":40.86,"h":14,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"비밀번호","fg":[0.98,0.98,0.98,1],"fs":12,"fw":400,"ls":-0.16,"lp":100,"T":1}]}}]},{"k":"icon-button","L":"아이콘 버튼","sp":[{"i":"icon-button/archiveMore","l":"앱 홈 카드 더보기 버튼","j":"AppHomeScene.tsx:1259-1296","t":{"p":"archiveMoreButton","w":32,"h":32,"wx":"FIX","hx":"FIX","wy":"빈칸","hy":"빈칸","H":1,"J":"center","bg":[0.169,0.184,0.212,0.48],"r":12}},{"i":"icon-button/gnbProjectOptions","l":"GNB 프로젝트 헤더 옵션 버튼","j":"Gnb.tsx:4243-4270","t":{"p":"iconButton","w":32,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","bg":[0.98,0.98,0.98,0.08],"r":12,"mw":32,"mh":32,"xw":32}},{"i":"icon-button/historyMore","l":"하이라이트 기록 카드 더보기 버튼","j":"HighlightScene.tsx:1379-1420","t":{"p":"historyMoreButton","w":32,"h":32,"wx":"FIX","hx":"FIX","wy":"빈칸","hy":"빈칸","H":1,"J":"center","bg":[0.169,0.184,0.212,0.48],"r":12}},{"i":"icon-button/nodeHeaderDelete","l":"캔버스 노드 헤더 삭제 버튼 — NodeHeaderActions의 danger 액션(쉬는 상태는 중립과 같고 호버 틴트만 다르다)","j":"NodeHeaderActions.tsx:136-144","t":{"p":"BUTTON_DANGER","w":32,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","r":12,"c":[{"p":"GLYPH","w":16,"h":16,"wx":"FIX","hx":"FIX","ci":8,"wy":"선언","hy":"선언","J":"normal"}]}},{"i":"icon-button/nodeHeaderDownload","l":"캔버스 노드 헤더 다운로드 버튼 — 8개 노드가 공유하는 NodeHeaderActions의 중립 액션","j":"NodeHeaderActions.tsx:115-123","t":{"p":"BUTTON_NEUTRAL","w":32,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","r":12,"c":[{"p":"GLYPH","w":16,"h":16,"wx":"FIX","hx":"FIX","ci":8,"wy":"선언","hy":"선언","J":"normal"}]}},{"i":"icon-button/overlayDelete","l":"오버레이 삭제 버튼 — 글리프를 자식이 갖는다","j":"VideoEditModal.tsx:19788-19802","t":{"p":"overlayDeleteBtn","w":28,"h":28,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"J":"center","r":8,"mw":28,"mh":28,"c":[{"p":"overlayDeleteBtnGlyph","w":14,"h":14,"wx":"FIX","hx":"FIX","ci":7,"wy":"선언","hy":"선언","J":"normal"}]}}]},{"k":"gnb-sidebar","L":"GNB 사이드바","sp":[{"i":"gnb-sidebar/brandRow","l":"사이드바 브랜드 행 — 로고 히트 영역","j":"Gnb.tsx:4368-4414","t":{"p":"sidebarHeaderRow","w":256,"h":40,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[0,0,0,4],"H":1,"mh":40,"c":[{"p":"sidebarLogoHit","w":252,"h":40,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","H":1,"mh":40,"c":[{"p":"sidebarLogoRail","w":252,"h":28,"wx":"FIX","hx":"HUG","ci":6,"wy":"선언","hy":"내용","H":1,"mh":28,"c":[{"p":"sidebarBrandCrop","w":252,"h":28,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","H":1,"J":"normal","c":[{"p":"logo","w":0,"h":28,"wx":"HUG","hx":"FIX","slot":1,"wy":"슬롯","hy":"선언","J":"normal"}]}]}]}]}},{"i":"gnb-sidebar/createCompoundRow","l":"사이드바 만들기 복합 항목 — 메뉴 줄(「+」는 제품 658ece13 에서 걷혔다)","j":"Gnb.tsx:4717-4749","t":{"p":"menuLink","w":256,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","pad":[0,4,0,8],"H":1,"r":10,"mh":32,"c":[{"p":"menuSidebarCreateNavPart","w":244,"h":32,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","H":1,"c":[{"p":"menuLinkInner","w":244,"h":21,"wx":"FIX","hx":"HUG","ci":5.5,"wy":"선언","hy":"내용","gap":10,"H":1,"J":"normal","c":[{"p":"menuLinkIconMask","w":20,"h":20,"wx":"FIX","hx":"FIX","ci":0.5,"wy":"빈칸","hy":"빈칸","J":"normal","bg":[0.647,0.659,0.678,1]},{"p":"menuLinkLabel","w":63.92,"h":21,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"노드 캔버스","fg":[0.647,0.659,0.678,1],"fs":14,"fw":500,"lp":150,"T":1,"xw":220}]}]}]}},{"i":"gnb-sidebar/menuLinkRow","l":"사이드바 메뉴 항목 한 줄 — 아이콘·라벨 (쉬는 상태)","j":"Gnb.tsx:4798-4834","t":{"p":"menuLink","w":256,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","pad":[0,4,0,8],"H":1,"r":10,"mh":32,"c":[{"p":"menuLinkInner","w":244,"h":21,"wx":"FIX","hx":"HUG","ci":5.5,"wy":"선언","hy":"내용","gap":10,"H":1,"J":"normal","c":[{"p":"menuLinkIconMask","w":20,"h":20,"wx":"FIX","hx":"FIX","ci":0.5,"wy":"빈칸","hy":"빈칸","J":"normal","bg":[0.647,0.659,0.678,1]},{"p":"menuLinkLabel","w":11.97,"h":21,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","J":"normal","t":"홈","fg":[0.647,0.659,0.678,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1,"xw":220}]}]}},{"i":"gnb-sidebar/profileTrigger","l":"프로필 트리거 — 크레딧 링을 두른 아바타 버튼","j":"Gnb.tsx:5302-5327","t":{"p":"profileTrigger","w":32,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","J":"center","mw":32,"mh":32,"c":[{"p":"profileImage","w":24,"h":24,"wx":"FIX","hx":"FIX","ci":4,"wy":"선언","hy":"선언","H":1,"J":"center","r":999}]}},{"i":"gnb-sidebar/rail","l":"GNB 사이드바 레일 — 메뉴 기둥과 분석 아이브로우","j":"Gnb.tsx:4456-4842","t":{"p":"menuSidebarOuter","w":256,"h":34,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","J":"normal","c":[{"p":"menuSidebar","w":256,"h":34,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","J":"normal","c":[{"p":"menuSidebarEyebrowRow","w":256,"h":34,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[12,0,4,0],"J":"normal","c":[{"p":"menuSidebarEyebrow","w":256,"h":18,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[0,0,0,4],"J":"normal","t":"분석","fg":[0.545,0.557,0.576,1],"fs":12,"fw":500,"ls":-0.12,"lp":150,"T":1}]}]}]}}]}];

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
