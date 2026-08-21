// 생성물. scripts/build-figma-inventory.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 이 파일 내용을 그대로 넘긴다. 손대면 계획과 어긋난다.
const RESET=false;
const PLAN=[{"k":"banner-carousel","L":"배너 캐러셀","sp":[{"i":"banner-carousel/appHome","l":"앱 홈 배너 캐러셀 — 슬라이드 + 우하단 컨트롤(화살표·점)","j":"AppHomeScene.tsx:857-989","t":{"p":"updateBanner","w":372,"h":360,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"bg":[0.09,0.106,0.133,1],"r":16,"c":[{"p":"bannerTrack","w":372,"h":360,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","c":[{"p":"bannerSlide","w":376.46,"h":364.32,"wx":"FIX","hx":"FIX","abs":1,"x":-2.23,"y":-2.16,"wy":"선언","hy":"선언","H":1,"bg":[0.09,0.106,0.133,1],"gr":{"t":[[1,0,0],[0,1,0]],"s":[[0,[0,0,0,0.78]],[0.3,[0,0,0,0.46]]]},"c":[{"p":"bannerContent","w":376.46,"h":364.32,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[20,20,20,20],"gap":12,"c":[{"p":"bannerTitle","w":301.32,"h":49.18,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","t":"영상 제작을 더 빠르게","fg":[0.98,0.98,0.98,1],"fs":36,"fw":500,"ls":-0.72,"lp":135,"T":1},{"p":"bannerDescription","w":314.19,"h":24.29,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","t":"AI 워크플로로 아이디어를 완성작까지 이어 보세요.","fg":[0.98,0.98,0.98,0.86],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1,"xw":480}]}]}]},{"p":"bannerControls","w":113,"h":36,"wx":"FIX","hx":"FIX","abs":1,"x":243,"y":308,"wy":"주축","hy":"내용","pad":[4,4,4,4],"gap":8,"H":1,"bg":[0,0,0,0.28],"r":999,"c":[{"p":"bannerArrowButton","w":28,"h":28,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"r":999},{"p":"bannerDots","w":33,"h":7,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","gap":6,"H":1,"c":[{"p":"bannerDot","w":7,"h":7,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","bg":[0.98,0.98,0.98,0.45],"r":999},{"p":"bannerDot","w":7,"h":7,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","bg":[0.98,0.98,0.98,0.45],"r":999},{"p":"bannerDot","w":7,"h":7,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","bg":[0.98,0.98,0.98,0.45],"r":999}]},{"p":"bannerArrowButton","w":28,"h":28,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"r":999}]}]}},{"i":"banner-carousel/appHomeControls","l":"앱 홈 배너 컨트롤 — 화살표 둘과 점 셋의 글래스 필","j":"AppHomeScene.tsx:926-988","t":{"p":"bannerControls","w":113,"h":36,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[4,4,4,4],"gap":8,"H":1,"bg":[0,0,0,0.28],"r":999,"c":[{"p":"bannerArrowButton","w":28,"h":28,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"r":999},{"p":"bannerDots","w":33,"h":7,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","gap":6,"H":1,"c":[{"p":"bannerDot","w":7,"h":7,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","bg":[0.98,0.98,0.98,0.45],"r":999},{"p":"bannerDot","w":7,"h":7,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","bg":[0.98,0.98,0.98,0.45],"r":999},{"p":"bannerDot","w":7,"h":7,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","bg":[0.98,0.98,0.98,0.45],"r":999}]},{"p":"bannerArrowButton","w":28,"h":28,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"r":999}]}},{"i":"banner-carousel/appHomeFrame","l":"앱 홈 배너 캐러셀 프레임 — 슬라이드 트랙을 담는 틀","j":"AppHomeScene.tsx:857-989","t":{"p":"updateBanner","w":372,"h":360,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"bg":[0.09,0.106,0.133,1],"r":16,"c":[{"p":"bannerTrack","w":372,"h":360,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언"}]}},{"i":"banner-carousel/highlightTab","l":"탭 배너 캐러셀(boxed) — 하이라이트 탭 소비처","j":"TabBannerCarousel.tsx:295-357","t":{"p":"CAROUSEL","w":372,"h":360,"wx":"FILL","hx":"FIX","wy":"교차축","hy":"선언","H":1,"bg":[0.09,0.106,0.133,1],"c":[{"p":"TRACK","w":372,"h":360,"wx":"FILL","hx":"FILL","wy":"선언(채움)","hy":"선언(채움)","c":[{"p":"SLIDE","w":372,"h":360,"wx":"FILL","hx":"FILL","wy":"선언(채움)","hy":"선언(채움)","H":1,"bg":[0.192,0.212,0.251,1],"c":[{"p":"CONTENT","w":372,"h":360,"wx":"FIX","hx":"FILL","wy":"선언","hy":"선언(채움)","pad":[24,20,24,20],"c":[{"p":"TEXT_GROUP","w":289.69,"h":84.59,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","gap":12,"c":[{"p":"TITLE","w":289.69,"h":48.59,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","t":"하이라이트 베타 오픈","fg":[0.98,0.98,0.98,1],"fs":36,"fw":500,"ls":-0.72,"lp":135,"T":1},{"p":"DESCRIPTION","w":289.69,"h":24,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","t":"경기 영상에서 명장면을 자동으로 찾아 드려요.","fg":[0.98,0.98,0.98,1],"fs":16,"fw":400,"ls":-0.16,"lp":150,"T":1}]}]}]}]},{"p":"CONTROLS","w":92,"h":36,"wx":"FIX","hx":"FIX","abs":1,"x":264,"y":308,"wy":"주축","hy":"내용","pad":[4,4,4,4],"gap":8,"H":1,"bg":[0,0,0,0.28],"r":999,"c":[{"p":"ARROW_BUTTON","w":28,"h":28,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"r":999},{"p":"DOTS","w":12,"h":7,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","gap":6,"H":1,"c":[{"p":"DOT","w":0,"h":7,"wx":"HUG","hx":"FIX","slot":1,"wy":"슬롯","hy":"선언","bg":[0.42,0.42,0.42,1],"r":999},{"p":"DOT","w":0,"h":7,"wx":"HUG","hx":"FIX","slot":1,"wy":"슬롯","hy":"선언","bg":[0.42,0.42,0.42,1],"r":999},{"p":"DOT","w":0,"h":7,"wx":"HUG","hx":"FIX","slot":1,"wy":"슬롯","hy":"선언","bg":[0.42,0.42,0.42,1],"r":999}]},{"p":"ARROW_BUTTON","w":28,"h":28,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"r":999}]}]}},{"i":"banner-carousel/tabCarouselControls","l":"공용 탭 배너 캐러셀 컨트롤 — 화살표·점 글래스 필","j":"TabBannerCarousel.tsx:321-355","t":{"p":"CONTROLS","w":80,"h":36,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","pad":[4,4,4,4],"gap":8,"H":1,"bg":[0,0,0,0.28],"r":999,"c":[{"p":"ARROW_BUTTON","w":28,"h":28,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"r":999},{"p":"DOTS","w":0,"h":0,"wx":"HUG","hx":"HUG","slot":1,"wy":"슬롯","hy":"슬롯","H":1},{"p":"ARROW_BUTTON","w":28,"h":28,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"r":999}]}}]},{"k":"gnb-sidebar","L":"GNB 사이드바","sp":[{"i":"gnb-sidebar/brandRow","l":"사이드바 브랜드 행 — 로고 히트 영역","j":"Gnb.tsx:4378-4424","t":{"p":"sidebarHeaderRow","w":256,"h":40,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[0,0,0,4],"H":1,"mh":40,"c":[{"p":"sidebarLogoHit","w":252,"h":40,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","H":1,"mh":40,"c":[{"p":"sidebarLogoRail","w":252,"h":28,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","H":1,"mh":28,"c":[{"p":"sidebarBrandCrop","w":252,"h":28,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","H":1,"c":[{"p":"logo","w":0,"h":28,"wx":"HUG","hx":"FIX","slot":1,"wy":"슬롯","hy":"선언"}]}]}]}]}},{"i":"gnb-sidebar/createCompoundRow","l":"사이드바 만들기 복합 항목 — 메뉴 줄 + 새 프로젝트 추가 버튼","j":"Gnb.tsx:4643-4691","t":{"p":"menuLink","w":256,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","pad":[0,4,0,4],"H":1,"r":10,"mh":32,"c":[{"p":"menuSidebarCreateNavPart","w":224,"h":32,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","H":1,"c":[{"p":"menuLinkInner","w":224,"h":21,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":10,"H":1,"c":[{"p":"menuLinkIconMask","w":20,"h":20,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","bg":[0.835,0.843,0.867,1]},{"p":"menuLinkLabel","w":63.92,"h":21,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","t":"노드 캔버스","fg":[0.835,0.843,0.867,1],"fs":14,"fw":500,"lp":150,"T":1,"xw":220}]}]},{"p":"menuSidebarCreateAddonInset","w":24,"h":24,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","H":1,"bg":[0.341,0.365,0.408,1],"r":6}]}},{"i":"gnb-sidebar/menuLinkRow","l":"사이드바 메뉴 항목 한 줄 — 아이콘·라벨 (쉬는 상태)","j":"Gnb.tsx:4808-4844","t":{"p":"menuLink","w":256,"h":32,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","pad":[0,4,0,4],"H":1,"r":10,"mh":32,"c":[{"p":"menuLinkInner","w":248,"h":21,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":10,"H":1,"c":[{"p":"menuLinkIconMask","w":20,"h":20,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","bg":[0.98,0.98,0.98,1]},{"p":"menuLinkLabel","w":11.97,"h":21,"wx":"HUG","hx":"HUG","wy":"주축","hy":"내용","t":"홈","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1,"xw":220}]}]}},{"i":"gnb-sidebar/profileTrigger","l":"프로필 트리거 — 크레딧 링을 두른 아바타 버튼","j":"Gnb.tsx:5312-5337","t":{"p":"profileTrigger","w":36,"h":36,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","bw":2,"bc":[1,1,1,1],"mw":36,"mh":36,"c":[{"p":"profileImage","w":28,"h":28,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","r":999}]}},{"i":"gnb-sidebar/rail","l":"GNB 사이드바 레일 — 메뉴 기둥과 분석 아이브로우","j":"Gnb.tsx:4466-4852","t":{"p":"menuSidebarOuter","w":256,"h":34,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","c":[{"p":"menuSidebar","w":256,"h":34,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","c":[{"p":"menuSidebarEyebrowRow","w":256,"h":34,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","pad":[12,0,4,0],"c":[{"p":"menuSidebarEyebrow","w":256,"h":18,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","pad":[0,0,0,4],"t":"분석","fg":[0.737,0.753,0.788,1],"fs":12,"fw":500,"ls":-0.12,"lp":150,"T":1}]}]}]}}]},{"k":"skeleton","L":"스켈레톤","sp":[{"i":"skeleton/analysisModalIg","l":"노드 캔버스 분석 모달 · 인스타그램 로딩 뼈대","j":"NodeCanvasAnalysisModal.tsx:616-670","t":{"p":"IG_SKELETON_ROOT","w":372,"h":144,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","c":[{"p":"IG_SKELETON_WRAPPER","w":372,"h":132,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","c":[{"p":"IG_SKELETON_SECTION","w":372,"h":132,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":8,"c":[{"p":"IG_SKELETON_HEADER","w":372,"h":22,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","gap":6,"H":1,"c":[{"p":"SKELETON_IG_ICON","w":20,"h":20,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","bg":[0.98,0.98,0.98,0.06],"r":6},{"p":"SKELETON_HEADER_TEXT","w":346,"h":22,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","c":[{"p":"SKELETON_LINE_TITLE","w":240,"h":22,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","bg":[0.98,0.98,0.98,0.06],"r":999}]}]},{"p":"IG_SKELETON_META","w":372,"h":54,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":4,"c":[{"p":"SKELETON_LINE_TITLE","w":240,"h":22,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","bg":[0.98,0.98,0.98,0.06],"r":999},{"p":"SKELETON_LINE_WIDE","w":372,"h":12,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","bg":[0.98,0.98,0.98,0.06],"r":999},{"p":"SKELETON_LINE_WIDE","w":372,"h":12,"wx":"FILL","hx":"FIX","wy":"선언(채움)","hy":"선언","bg":[0.98,0.98,0.98,0.06],"r":999}]},{"p":"IG_SKELETON_UPLOADED_ROW","w":372,"h":40,"wx":"FILL","hx":"HUG","wy":"교차축","hy":"내용","gap":4,"H":1,"c":[{"p":"SKELETON_DATE_GROUP","w":184,"h":40,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":4,"c":[{"p":"SKELETON_LINE_SHORT","w":84,"h":12,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","bg":[0.98,0.98,0.98,0.06],"r":999},{"p":"SKELETON_LINE_VALUE","w":80,"h":24,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","bg":[0.98,0.98,0.98,0.06],"r":999}]},{"p":"SKELETON_DATE_GROUP","w":184,"h":40,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":4,"c":[{"p":"SKELETON_LINE_SHORT","w":84,"h":12,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","bg":[0.98,0.98,0.98,0.06],"r":999},{"p":"SKELETON_LINE_VALUE","w":80,"h":24,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","bg":[0.98,0.98,0.98,0.06],"r":999}]}]}]}]}]}},{"i":"skeleton/channelAvatarIg","l":"인스타그램 대시보드 채널 아바타 로딩 뼈대","j":"InstagramAnalyticsScene.tsx:1773-1773","t":{"p":"CHANNEL_AVATAR_SKELETON","w":48,"h":48,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","r":-1}},{"i":"skeleton/channelInfoIg","l":"인스타그램 대시보드 채널 정보 로딩 뼈대 — SKELETON_BLOCK 막대 두 줄","j":"InstagramAnalyticsScene.tsx:1774-1777","t":{"p":"CHANNEL_INFO_SKELETON","w":372,"h":74,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":12,"c":[{"p":"SKELETON_CHANNEL_TITLE","w":150,"h":48,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","r":8},{"p":"SKELETON_CHANNEL_DESC","w":93,"h":14,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","r":8}]}},{"i":"skeleton/instagramTopBar","l":"인스타그램 분석 상단바 로딩 뼈대 — 같은 상수 이름의 두 번째 벌","j":"InstagramAnalyticsScene.tsx:1770-1778","t":{"p":"DASHBOARD_TOP_BAR_LEFT","w":292,"h":134,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":12,"c":[{"p":"CHANNEL_AVATAR_SKELETON","w":48,"h":48,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","r":-1},{"p":"CHANNEL_INFO_SKELETON","w":292,"h":74,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":12,"c":[{"p":"SKELETON_CHANNEL_TITLE","w":150,"h":48,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","r":8},{"p":"SKELETON_CHANNEL_DESC","w":73,"h":14,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","r":8}]}]}},{"i":"skeleton/youtubeTopBar","l":"유튜브 분석 상단바 로딩 뼈대 — 아바타 원 + 줄 셋","j":"YoutubeAnalyticsScene.tsx:1960-1978","t":{"p":"DASHBOARD_TOP_BAR_LEFT","w":292,"h":160,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":12,"c":[{"p":"CHANNEL_AVATAR_SKELETON","w":48,"h":48,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","r":-1},{"p":"CHANNEL_INFO_SKELETON","w":292,"h":100,"wx":"FIX","hx":"HUG","wy":"선언","hy":"내용","gap":12,"c":[{"p":"SKELETON_CHANNEL_TITLE","w":150,"h":48,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","r":8},{"p":"SKELETON_CHANNEL_DESC","w":73,"h":14,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","r":8},{"p":"SKELETON_CHANNEL_DESC_SHORT","w":43.8,"h":14,"wx":"FIX","hx":"FIX","wy":"선언","hy":"선언","r":8}]}]}}]}];

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
  head.appendChild(T(sp.t.p+" · "+sp.t.w+"×"+sp.t.h+" · 폭 "+(sp.t.wx==="FIX"?"선언":sp.t.wx==="FILL"?"부모가 줌":"내용이 정함")+
   " · 높이 "+(sp.t.hx==="FIX"?"선언":sp.t.hx==="FILL"?"부모가 줌":"내용이 정함"),11,"r",0.62,cardW-40));
  created.push(card.id);}}
const drift=check.filter(c=>c.m!==c.f);
return {count:created.length,어긋난것:drift.length,drift:drift.slice(0,12),그릴수없음:skipped};
