// 생성물. scripts/build-figma-inventory.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 이 파일 내용을 그대로 넘긴다. 손대면 계획과 어긋난다.
const RESET=true;
const PLAN=[{"k":"avatar","L":"아바타","sp":[{"i":"avatar/adminUser","l":"관리자 사용자 머리글자 아바타","j":"AdminClient.tsx:1719-1719","t":{"p":"AVATAR","w":44,"h":44,"wx":"FIX","hx":"FIX","H":1,"bg":[0.98,0.98,0.98,0.1],"r":-1,"t":"K","fg":[0.98,0.98,0.98,0.5],"fs":20,"fw":400,"ls":-0.16,"lp":150}},{"i":"avatar/instagramChannel","l":"인스타그램 대시보드 채널 아바타 — 유튜브와 같은 정의를 한 벌 더 갖는다","j":"InstagramAnalyticsScene.tsx:1781-1794","t":{"p":"CHANNEL_AVATAR","w":48,"h":48,"wx":"FIX","hx":"FIX","bg":[0.341,0.365,0.408,1],"r":-1,"c":[{"p":"CHANNEL_AVATAR_PLACEHOLDER","w":48,"h":48,"wx":"FILL","hx":"FILL","bg":[0.467,0.49,0.537,1]}]}},{"i":"avatar/settingsProfile","l":"설정 프로필 사진","j":"SettingsScene.tsx:990-1006","t":{"p":"settingsAvatarFigure","w":40,"h":40,"wx":"FIX","hx":"FIX","H":1,"bg":[0.98,0.98,0.98,0.12],"r":999,"c":[{"p":"settingsAvatarFigureImage","w":40,"h":40,"wx":"FIX","hx":"FIX"}]}},{"i":"avatar/youtubeChannel","l":"유튜브 대시보드 채널 아바타","j":"YoutubeAnalyticsScene.tsx:1981-2000","t":{"p":"CHANNEL_AVATAR","w":48,"h":48,"wx":"FIX","hx":"FIX","bg":[0.341,0.365,0.408,1],"r":-1,"c":[{"p":"CHANNEL_AVATAR_PLACEHOLDER","w":48,"h":48,"wx":"FILL","hx":"FILL","bg":[0.467,0.49,0.537,1]}]}}]},{"k":"badge","L":"배지·칩","sp":[{"i":"badge/customSidebarBadge","l":"사이드바 개수 배지","j":"Gnb.tsx:4540-4548","t":{"p":"customSidebarBadge","w":18,"h":18,"wx":"HUG","hx":"FIX","pad":[0,5,0,5],"H":1,"bg":[0.98,0.98,0.98,0.14],"r":999,"t":"3","fg":[0.835,0.843,0.867,1],"fs":12,"fw":500,"ls":-0.12,"lp":150,"mw":18}},{"i":"badge/exploreSoonChip","l":"사이드바 예정 칩","j":"Gnb.tsx:4795-4800","t":{"p":"exploreSoonChip","w":44.41,"h":24,"wx":"HUG","hx":"HUG","pad":[3,8,3,8],"bg":[0.98,0.98,0.98,0.14],"r":6,"t":"BETA","fg":[0.737,0.753,0.788,1],"fs":12,"fw":500,"ls":-0.12,"lp":150}},{"i":"badge/previewZoomBadge","l":"미리보기 확대 배지","j":"VideoEditModal.tsx:17823-17829","t":{"p":"previewZoomBadge","w":50.19,"h":24,"wx":"FILL","hx":"HUG","pad":[3,10,3,10],"bg":[0.09,0.106,0.133,0.7],"r":8,"t":"120%","fg":[0.98,0.98,0.98,1],"fs":12,"fw":500,"ls":-0.12,"lp":150}},{"i":"badge/profileMenuItemBadge","l":"프로필 메뉴 플랜 배지 — 글자를 자식이 갖는다","j":"Gnb.tsx:3153-3157","t":{"p":"profileMenuItemBadge","w":36.44,"h":22,"wx":"HUG","hx":"HUG","pad":[2,8,2,8],"bg":[0,0.533,1,1],"r":6,"c":[{"p":"profileMenuItemBadgeText","w":20.44,"h":14,"wx":"HUG","hx":"HUG","t":"프로","fg":[0.98,0.98,0.98,1],"fs":12,"fw":600,"ls":-0.16,"lp":150,"T":1}]}}]},{"k":"empty-state","L":"빈 상태","sp":[{"i":"empty-state/analyticsStatePanel","l":"분석 대시보드 상태 패널 — 제목 + 본문","j":"shared.tsx:555-568","t":{"p":"STATE_PANEL","w":372,"h":93,"wx":"FILL","hx":"HUG","pad":[20,20,20,20],"gap":6,"r":12,"bw":1,"bc":[0.98,0.98,0.98,1],"c":[{"p":"STATE_PANEL_TITLE","w":330,"h":24,"wx":"FILL","hx":"HUG","t":"개요","fg":[0.98,0.98,0.98,1],"fs":16,"fw":600,"ls":-0.16,"lp":150,"T":1},{"p":"STATE_PANEL_BODY","w":330,"h":21,"wx":"FILL","hx":"HUG","t":"이 기간에 표시할 데이터가 없어요.","fg":[0.98,0.98,0.98,1],"fs":14,"fw":400,"ls":-0.14,"lp":150,"T":1}]}},{"i":"empty-state/appHomeArchive","l":"앱 홈 아카이브 빈 상태 — 제목 + 설명","j":"AppHomeScene.tsx:1003-1010","t":{"p":"emptyState","w":179.97,"h":360,"wx":"HUG","hx":"HUG","pad":[80,0,80,0],"gap":12,"c":[{"p":"emptyTitle","w":179.97,"h":30,"wx":"FILL","hx":"HUG","t":"아직 프로젝트가 없어요","fg":[0.98,0.98,0.98,1],"fs":20,"fw":600,"ls":-0.2,"lp":150,"T":1},{"p":"emptyDescription","w":152.16,"h":24,"wx":"FILL","hx":"HUG","t":"첫 영상을 만들어 보세요.","fg":[0.98,0.98,0.98,0.55],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"empty-state/projectVideosPopover","l":"프로젝트 영상 팝오버 빈 상태 — 타이포 클래스를 안 얹는다","j":"ProjectVideosPopover.tsx:258-262","t":{"p":"EMPTY_STATE","w":138.39,"h":93,"wx":"FILL","hx":"HUG","pad":[36,12,36,12],"H":1,"c":[{"p":"EMPTY_TEXT","w":114.39,"h":21,"wx":"HUG","hx":"HUG","t":"저장된 영상이 없어요","fg":[0.737,0.753,0.788,0.92],"fs":14,"fw":400,"ls":-0.14,"lp":150,"T":1}]}},{"i":"empty-state/videoEditInspector","l":"비디오 편집 인스펙터 빈 상태","j":"VideoEditModal.tsx:22662-22668","t":{"p":"inspectorEmptyState","w":340,"h":200,"wx":"FILL","hx":"HUG","pad":[32,20,32,20],"H":1,"mh":200,"c":[{"p":"inspectorEmptyStateText","w":153.64,"h":21,"wx":"HUG","hx":"HUG","t":"아직 선택된 항목이 없습니다","fg":[0.604,0.627,0.671,0.88],"fs":14,"fw":400,"ls":-0.14,"lp":150,"T":1}]}}]},{"k":"icon-button","L":"아이콘 버튼","sp":[{"i":"icon-button/archiveMore","l":"앱 홈 카드 더보기 버튼","j":"AppHomeScene.tsx:1259-1296","t":{"p":"archiveMoreButton","w":32,"h":32,"wx":"FIX","hx":"FIX","H":1,"bg":[0.192,0.212,0.251,0.5],"r":12}},{"i":"icon-button/gnbProjectOptions","l":"GNB 프로젝트 헤더 옵션 버튼","j":"Gnb.tsx:4253-4280","t":{"p":"iconButton","w":32,"h":32,"wx":"FIX","hx":"FIX","H":1,"bg":[0.98,0.98,0.98,0.1],"r":12,"mw":32,"mh":32,"xw":32}},{"i":"icon-button/historyMore","l":"하이라이트 기록 카드 더보기 버튼","j":"HighlightScene.tsx:1379-1420","t":{"p":"historyMoreButton","w":32,"h":32,"wx":"FIX","hx":"FIX","H":1,"bg":[0.192,0.212,0.251,0.5],"r":12}},{"i":"icon-button/overlayDelete","l":"오버레이 삭제 버튼 — 글리프를 자식이 갖는다","j":"VideoEditModal.tsx:19788-19802","t":{"p":"overlayDeleteBtn","w":28,"h":28,"wx":"FIX","hx":"FIX","H":1,"r":999,"mw":28,"mh":28,"c":[{"p":"overlayDeleteBtnGlyph","w":14,"h":14,"wx":"FIX","hx":"FIX"}]}}]},{"k":"slider","L":"슬라이더","sp":[{"i":"slider/bgmNode","l":"BGM 노드 range 슬라이더 (길이·볼륨·강도 공용)","j":"BgmNode.tsx:1429-1446","t":{"p":"RANGE_SLIDER","w":348,"h":4,"wx":"FIX","hx":"FIX"}},{"i":"slider/colorPopover","l":"컬러 팝오버 색상·투명도 슬라이더 행","j":"ColorPopover.tsx:675-719","t":{"p":"SLIDER_ROW","w":256,"h":32,"wx":"FILL","hx":"HUG","H":1,"c":[{"p":"SLIDER_COLUMN","w":256,"h":32,"wx":"HUG","hx":"HUG","gap":8,"c":[{"p":"HUE_SLIDER","w":256,"h":12,"wx":"FILL","hx":"FIX","r":999,"c":[{"p":"SLIDER_HANDLE","w":14,"h":14,"wx":"FIX","hx":"FIX","r":-1,"bw":2,"bc":[0.98,0.98,0.98,0.96]}]},{"p":"ALPHA_SLIDER","w":256,"h":12,"wx":"FILL","hx":"FIX","r":999,"c":[{"p":"SLIDER_HANDLE","w":14,"h":14,"wx":"FIX","hx":"FIX","r":-1,"bw":2,"bc":[0.98,0.98,0.98,0.96]}]}]}]}},{"i":"slider/highlightRefineOpacity","l":"하이라이트 다듬기 위젯 불투명도 슬라이더","j":"HighlightProjectScene.tsx:3572-3606","t":{"p":"refinementExpandShellOpacity","w":64,"h":12,"wx":"HUG","hx":"HUG","H":1,"c":[{"p":"refinementExpandShellOpacitySlider","w":64,"h":12,"wx":"FIX","hx":"FIX","bw":2,"bc":[0.522,0.522,0.522,1]}]}},{"i":"slider/ttsNode","l":"TTS 노드 range 슬라이더 (속도·볼륨 공용)","j":"TtsNode.tsx:1349-1366","t":{"p":"RANGE_SLIDER","w":348,"h":4,"wx":"FIX","hx":"FIX"}}]},{"k":"spinner","L":"스피너","sp":[{"i":"spinner/editNodeProcess","l":"편집 노드 처리 중 스피너","j":"EditNode.tsx:1074-1074","t":{"p":"PROCESS_BUTTON_SPINNER","w":16,"h":16,"wx":"FIX","hx":"FIX","r":-1,"bw":2,"bc":[0.98,0.98,0.98,1]}},{"i":"spinner/gnbBackButton","l":"GNB 뒤로가기 스피너 — 슬롯이 링을 감싼다","j":"Gnb.tsx:4118-4123","t":{"p":"backButtonLoading","w":16,"h":16,"wx":"FIX","hx":"FIX","H":1,"c":[{"p":"projectSaveSpinner","w":16,"h":16,"wx":"FIX","hx":"FIX","r":-1,"bw":2,"bc":[0.98,0.98,0.98,1]}]}},{"i":"spinner/highlightScene","l":"하이라이트 히스토리 로딩 스피너","j":"HighlightScene.tsx:116-118","t":{"p":"spinner","w":36,"h":36,"wx":"FIX","hx":"FIX","r":-1,"bw":3,"bc":[0.835,0.843,0.867,1]}},{"i":"spinner/highlightShorts","l":"숏폼 편집 로딩 스피너 — 같은 링을 옮겨 적은 둘째 벌","j":"page.tsx:1055-1055","t":{"p":"SPINNER","w":36,"h":36,"wx":"FIX","hx":"FIX","r":-1,"bw":3,"bc":[0.835,0.843,0.867,1]}}]},{"k":"tooltip","L":"툴팁","sp":[{"i":"tooltip/analyticsBar","l":"애널리틱스 막대 툴팁 — 포인터를 따라간다","j":"useAnalyticsBarTooltip.tsx:169-177","t":{"p":"TOOLTIP_BASE","w":81.64,"h":32,"wx":"FILL","hx":"FIX","pad":[4,8,4,8],"H":1,"bg":[0.89,0.894,0.91,1],"r":8,"bw":1,"bc":[0.09,0.106,0.133,0.12],"sh":[[0.09,0.106,0.133,0.12],0,12,24],"t":"여성 · 42.3%","fg":[0.09,0.106,0.133,1],"fs":12,"fw":400,"ls":-0.12,"lp":150,"mh":32}},{"i":"tooltip/chromeTooltip","l":"공용 크롬 툴팁 — body로 포털되는 버블(사이드바·노드 캔버스)","j":"ChromeTooltip.tsx:293-304","t":{"p":"PORTAL_ANCHOR","w":105.8,"h":28,"wx":"FIX","hx":"HUG","c":[{"p":"BUBBLE","w":105.8,"h":28,"wx":"FILL","hx":"HUG","c":[{"p":"BUBBLE_INNER","w":105.8,"h":28,"wx":"FILL","hx":"HUG","pad":[4,8,4,8],"bg":[0.89,0.894,0.91,1],"r":8,"bw":1,"bc":[0.09,0.106,0.133,0.12],"sh":[[0.09,0.106,0.133,0.12],0,12,24],"t":"전체 화면으로 보기","fg":[0.09,0.106,0.133,1],"fs":12,"fw":400,"ls":-0.12,"lp":150}]}]}},{"i":"tooltip/composerShotMode","l":"컴포저 모드 힌트 툴팁 — 부모 hover로만 열린다","j":"ComposerBar.tsx:408-410","t":{"p":"SHOT_MODE_TOOLTIP","w":112.57,"h":27.16,"wx":"FILL","hx":"HUG","pad":[4,8,4,8],"bg":[0.89,0.894,0.91,1],"r":8,"bw":1,"bc":[0.09,0.106,0.133,0.12],"sh":[[0.09,0.106,0.133,0.12],0,12,24],"t":"한 장면으로 만들어요","fg":[0.09,0.106,0.133,1],"fs":12,"fw":400,"ls":-0.12,"lp":150}},{"i":"tooltip/upgradeTierFeature","l":"업그레이드 요금제 기능 툴팁","j":"page.tsx:623","t":{"p":"TIER_FEATURE_TIP","w":252.2,"h":27.16,"wx":"FIX","hx":"HUG","pad":[4,8,4,8],"bg":[0.89,0.894,0.91,1],"r":8,"bw":1,"bc":[0.09,0.106,0.133,0.12],"sh":[[0.09,0.106,0.133,0.12],0,12,24],"t":"매달 크레딧 1,200개가 충전됩니다","fg":[0.09,0.106,0.133,1],"fs":12,"fw":400,"ls":-0.12,"lp":150}}]},{"k":"checkbox","L":"체크박스","sp":[{"i":"checkbox/awsSignupLegal","l":"AWS 가입 약관 동의 체크박스 — 구조는 같고 색 상수만 다른 두 번째 벌","j":"page.tsx:607-620","t":{"p":"LEGAL_AGREEMENT_LABEL","w":372,"h":25,"wx":"FIX","hx":"HUG","gap":10,"H":1,"c":[{"p":"LEGAL_CHECKBOX_OUTER","w":22,"h":22,"wx":"FIX","hx":"FIX","c":[{"p":"LEGAL_CHECKBOX_INPUT","w":22,"h":22,"wx":"FILL","hx":"FILL","bg":[0.231,0.231,0.231,1],"bw":2,"bc":[0.522,0.522,0.522,1]},{"p":"LEGAL_CHECKBOX_FACE","w":22,"h":22,"wx":"FIX","hx":"FIX","r":5}]},{"p":"LEGAL_AGREEMENT_TEXT","w":199.08,"h":25,"wx":"HUG","hx":"HUG","pad":[1,0,0,0],"t":"개인정보 처리방침에 동의합니다","fg":[0.835,0.843,0.867,1],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"checkbox/signupLegal","l":"가입 약관 동의 체크박스","j":"page.tsx:632-655","t":{"p":"LEGAL_AGREEMENT_LABEL","w":372,"h":25,"wx":"FIX","hx":"HUG","gap":10,"H":1,"c":[{"p":"LEGAL_CHECKBOX_OUTER","w":22,"h":22,"wx":"FIX","hx":"FIX","c":[{"p":"LEGAL_CHECKBOX_INPUT","w":22,"h":22,"wx":"FILL","hx":"FILL","bg":[0.231,0.231,0.231,1],"bw":2,"bc":[0.522,0.522,0.522,1]},{"p":"LEGAL_CHECKBOX_FACE","w":22,"h":22,"wx":"FIX","hx":"FIX","r":5}]},{"p":"LEGAL_AGREEMENT_TEXT","w":199.08,"h":25,"wx":"HUG","hx":"HUG","pad":[1,0,0,0],"t":"개인정보 처리방침에 동의합니다","fg":[0.98,0.98,0.98,0.86],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}},{"i":"checkbox/videoEditSourceRow","l":"영상 편집 소스 고르기 체크박스 — 네이티브 입력 자신","j":"VideoEditProjectPicker.tsx:499-505","t":{"p":"SOURCE_ROW_CHECK","w":20,"h":20,"wx":"FIX","hx":"FIX","bg":[0.231,0.231,0.231,1],"bw":2,"bc":[0.522,0.522,0.522,1]}}]}];

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
 if(n.wx==="FIX"){f.layoutSizingHorizontal="FIXED";f.resize(Math.max(1,n.w),f.height);}
 if(n.hx==="FIX"){f.layoutSizingVertical="FIXED";f.resize(f.width,Math.max(1,n.h));}
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
   const built=build(sp.t);stage.appendChild(built);
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
