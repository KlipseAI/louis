// 생성물. scripts/build-figma-inventory.mjs가 만든다. 직접 수정하지 않는다.
// use_figma에 이 파일 내용을 그대로 넘긴다. 손대면 계획과 어긋난다.
const RESET=false;
const PLAN=[{"k":"menu-popover","L":"메뉴 팝오버","sp":[{"i":"menu-popover/homeCreateNew","l":"앱 홈 새로 만들기 드롭다운","j":"HomeCreateNewMenu.tsx:141-167","t":{"p":"MENU","w":200,"h":136,"wx":"FIX","hx":"HUG","pad":[6,6,6,6],"gap":2,"bg":[0.192,0.212,0.251,1],"r":16,"sh":[[0,0,0,0.04],0,8,15],"mw":200,"c":[{"p":"ITEM","w":188,"h":40,"wx":"FILL","hx":"FIX","pad":[0,10,0,10],"H":1,"r":10,"t":"새 캔버스","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"c":[{"p":"ITEM_ICON","w":20,"h":20,"wx":"FIX","hx":"FIX","bg":[0.98,0.98,0.98,1]}]},{"p":"ITEM","w":188,"h":40,"wx":"FILL","hx":"FIX","pad":[0,10,0,10],"H":1,"r":10,"t":"영상 편집","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"c":[{"p":"ITEM_ICON","w":20,"h":20,"wx":"FIX","hx":"FIX","bg":[0.98,0.98,0.98,1]}]},{"p":"ITEM","w":188,"h":40,"wx":"FILL","hx":"FIX","pad":[0,10,0,10],"H":1,"r":10,"t":"하이라이트","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"c":[{"p":"ITEM_ICON","w":20,"h":20,"wx":"FIX","hx":"FIX","bg":[0.98,0.98,0.98,1]}]}]}},{"i":"menu-popover/paneContextMenu","l":"캔버스 빈 곳 우클릭 메뉴","j":"PaneContextMenu.tsx:253-316","t":{"p":"MENU_WRAP","w":190,"h":129,"wx":"FIX","hx":"HUG","pad":[6,6,6,6],"gs":[2,6,6],"bg":[0.09,0.106,0.133,0.88],"r":14,"sh":[[0,0,0,0.04],0,8,15],"mw":190,"c":[{"p":"MENU_ITEM","w":178,"h":34,"wx":"FILL","hx":"FIX","pad":[0,10,0,10],"H":1,"r":8,"c":[{"p":"ITEM_MAIN","w":79.8,"h":18,"wx":"FIX","hx":"HUG","gap":9,"H":1,"c":[{"p":"ITEM_ICON","w":16,"h":16,"wx":"FIX","hx":"FIX","H":1},{"p":"ITEM_LABEL","w":54.8,"h":18,"wx":"HUG","hx":"HUG","t":"텍스트 추가","fg":[0.98,0.98,0.98,1],"fs":12,"fw":500,"lp":150,"T":1}]}]},{"p":"MENU_ITEM","w":178,"h":34,"wx":"FILL","hx":"FIX","pad":[0,10,0,10],"H":1,"r":8,"c":[{"p":"ITEM_MAIN","w":90.16,"h":18,"wx":"FIX","hx":"HUG","gap":9,"H":1,"c":[{"p":"ITEM_ICON","w":16,"h":16,"wx":"FIX","hx":"FIX","H":1},{"p":"ITEM_LABEL","w":65.16,"h":18,"wx":"HUG","hx":"HUG","t":"이미지 만들기","fg":[0.98,0.98,0.98,1],"fs":12,"fw":500,"lp":150,"T":1}]}]},{"p":"DIVIDER","w":166,"h":1,"wx":"FIX","hx":"FIX","bg":[0.98,0.98,0.98,0.08]},{"p":"MENU_ITEM","w":178,"h":34,"wx":"FILL","hx":"FIX","pad":[0,10,0,10],"H":1,"r":8,"c":[{"p":"ITEM_MAIN","w":69.42,"h":18,"wx":"FIX","hx":"HUG","gap":9,"H":1,"c":[{"p":"ITEM_ICON","w":16,"h":16,"wx":"FIX","hx":"FIX","H":1},{"p":"ITEM_LABEL","w":44.42,"h":18,"wx":"HUG","hx":"HUG","t":"영상 추가","fg":[0.98,0.98,0.98,1],"fs":12,"fw":500,"lp":150,"T":1}]}]}]}},{"i":"menu-popover/projectVideos","l":"프로젝트 영상 팝오버 — 헤더와 목록을 가진 벌","j":"ProjectVideosPopover.tsx:237-305","t":{"p":"POPOVER","w":188.67,"h":152,"wx":"FILL","hx":"FIX","pad":[6,6,6,6],"gap":4,"bg":[0.192,0.212,0.251,1],"r":16,"sh":[[0,0,0,0.22],0,4,12],"c":[{"p":"HEADER","w":176.67,"h":28,"wx":"FILL","hx":"FIX","pad":[0,6,0,6],"gap":8,"H":1,"c":[{"p":"HEADER_TITLE","w":102.23,"h":21,"wx":"HUG","hx":"HUG","t":"이 프로젝트의 영상","fg":[0.98,0.98,0.98,0.96],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1},{"p":"HEADER_COUNT","w":22,"h":18,"wx":"FIX","hx":"FIX","pad":[0,6,0,6],"H":1,"bg":[0.98,0.98,0.98,0.08],"r":999,"t":"2","fg":[0.835,0.843,0.867,0.92],"fs":12,"fw":400,"ls":-0.12,"lp":150,"mw":22}]},{"p":"LIST","w":176.67,"h":108,"wx":"FILL","hx":"FIX","gap":2,"c":[{"p":"LIST_ITEM","w":176.67,"h":53,"wx":"FILL","hx":"HUG","H":1,"c":[{"p":"ITEM_BUTTON","w":176.67,"h":53,"wx":"FILL","hx":"HUG","pad":[6,6,6,6],"gap":10,"H":1,"r":10,"c":[{"p":"THUMBNAIL","w":64,"h":36,"wx":"FIX","hx":"FIX","bg":[0,0,0,0.6],"r":6,"bw":1,"bc":[0.835,0.843,0.867,0.18],"c":[{"p":"THUMBNAIL_MEDIA","w":62,"h":34,"wx":"FILL","hx":"FILL"}]},{"p":"ITEM_BODY","w":90.67,"h":41,"wx":"FIX","hx":"HUG","gap":2,"c":[{"p":"ITEM_NAME","w":90.67,"h":21,"wx":"FILL","hx":"HUG","t":"바닷가 오프닝 컷","fg":[0.98,0.98,0.98,0.96],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1},{"p":"ITEM_META","w":90.67,"h":18,"wx":"FILL","hx":"HUG","t":"생성됨 · 16:9 · 8s","fg":[0.737,0.753,0.788,0.88],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1}]}]}]},{"p":"LIST_ITEM","w":176.67,"h":53,"wx":"FILL","hx":"HUG","H":1,"c":[{"p":"ITEM_BUTTON","w":176.67,"h":53,"wx":"FILL","hx":"HUG","pad":[6,6,6,6],"gap":10,"H":1,"r":10,"c":[{"p":"THUMBNAIL","w":64,"h":36,"wx":"FIX","hx":"FIX","bg":[0,0,0,0.6],"r":6,"bw":1,"bc":[0.835,0.843,0.867,0.18],"c":[{"p":"THUMBNAIL_MEDIA","w":62,"h":34,"wx":"FILL","hx":"FILL"}]},{"p":"ITEM_BODY","w":90.67,"h":41,"wx":"FIX","hx":"HUG","gap":2,"c":[{"p":"ITEM_NAME","w":90.67,"h":21,"wx":"FILL","hx":"HUG","t":"인터뷰 편집본","fg":[0.98,0.98,0.98,0.96],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1},{"p":"ITEM_META","w":90.67,"h":18,"wx":"FILL","hx":"HUG","t":"편집됨 · 9:16 · 24s","fg":[0.737,0.753,0.788,0.88],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1}]}]}]}]}]}}]},{"k":"progress-bar","L":"진행 막대","sp":[{"i":"progress-bar/compositeSegmentPreview","l":"합본 미리보기 재생 진행바 — 트랙·게이지·핸들","j":"HighlightProjectScene.tsx:446-457","t":{"p":"compositeProgressBar","w":348,"h":20,"wx":"HUG","hx":"FIX","H":1,"c":[{"p":"compositeProgressTrack","w":348,"h":3,"wx":"HUG","hx":"FIX","r":1.5,"c":[{"p":"compositeProgressFill","w":348,"h":3,"wx":"FIX","hx":"FIX","bg":[0.98,0.98,0.98,1],"r":1.5}]},{"p":"compositeProgressThumb","w":0,"h":0,"wx":"FIX","hx":"FIX","bg":[0.98,0.98,0.98,1],"r":-1}]}},{"i":"progress-bar/editNodeProcessing","l":"편집 노드 처리 진행바 — 퍼센트 글자를 옆에 갖는다","j":"EditNode.tsx:622-640","t":{"p":"PROCESSING_PROGRESS","w":160,"h":18,"wx":"FIX","hx":"HUG","gap":8,"H":1,"c":[{"p":"PROCESSING_PROGRESS_TRACK","w":122,"h":4,"wx":"HUG","hx":"FIX","bg":[0.376,0.333,1,0.24],"r":999,"c":[{"p":"PROCESSING_PROGRESS_FILL","w":122,"h":4,"wx":"FIX","hx":"FILL","bg":[0.376,0.333,1,1],"r":999}]},{"p":"PROCESSING_PROGRESS_PERCENT","w":30,"h":18,"wx":"FIX","hx":"HUG","t":"62%","fg":[0.945,0.945,0.953,0.82],"fs":12,"fw":500,"ls":-0.12,"lp":150,"T":1,"mw":30}]}},{"i":"progress-bar/highlightUpload","l":"하이라이트 업로드 진행바","j":"HighlightProjectScene.tsx:2652-2657","t":{"p":"progressBarTrack","w":320,"h":6,"wx":"FIX","hx":"FIX","bg":[0.98,0.98,0.98,0.1],"r":3,"xw":320,"c":[{"p":"progressBarFill","w":320,"h":6,"wx":"FIX","hx":"FIX","bg":[0.388,0.4,0.945,1],"r":3}]}}]},{"k":"selectable-list-row","L":"선택 가능한 목록 행","sp":[{"i":"selectable-list-row/creditHistoryEntry","l":"크레딧 내역 행 — 링크가 있을 때만 눌리는 행","j":"SubscriptionScene.tsx:1071-1153","t":{"p":"creditHistoryListItem","w":352,"h":48,"wx":"HUG","hx":"FIX","pad":[8,4,0,4],"ins":[0,0,8,0],"gap":16,"mh":48,"c":[{"p":"creditHistoryListMain","w":161.5,"h":21,"wx":"HUG","hx":"HUG","gap":10,"H":1,"c":[{"p":"creditHistoryListTitle","w":87,"h":21,"wx":"HUG","hx":"HUG","t":"하이라이트 생성","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1},{"p":"creditHistoryListMeta","w":61.2,"h":18,"wx":"HUG","hx":"HUG","t":"2026. 8. 12.","fg":[0.604,0.627,0.671,1],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1}]},{"p":"creditHistoryListValue","w":166.5,"h":24,"wx":"HUG","hx":"HUG","gap":10,"H":1,"c":[{"p":"creditHistoryListDelta","w":32.58,"h":21,"wx":"HUG","hx":"HUG","t":"-120","fg":[0.604,0.627,0.671,1],"fs":14,"fw":600,"ls":-0.14,"lp":150,"T":1},{"p":"creditHistoryListBalance","w":52.09,"h":18,"wx":"HUG","hx":"HUG","t":"잔액 1,880","fg":[0.604,0.627,0.671,1],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1},{"p":"withdrawalButton","w":61.83,"h":24,"wx":"HUG","hx":"HUG","pad":[2,8,2,8],"r":4,"bw":1,"bc":[0.604,0.627,0.671,1],"t":"환불 요청","fg":[0.737,0.753,0.788,1],"fs":12,"fw":500,"ls":-0.12,"lp":150}]}]}},{"i":"selectable-list-row/highlightDetailClip","l":"하이라이트 상세 클립 행 — 행 자체가 버튼인 단일 선택 행","j":"HighlightProjectScene.tsx:3208-3246","t":{"p":"clipDetailListItem","w":368,"h":66,"wx":"FIX","hx":"HUG","pad":[6,6,6,6],"gap":10,"H":1,"r":14,"c":[{"p":"clipDetailListThumb","w":96,"h":54,"wx":"FIX","hx":"HUG","bg":[0.09,0.106,0.133,1],"r":10,"c":[{"p":"clipVideo","w":96,"h":54,"wx":"FIX","hx":"FIX","bg":[0,0,0,1]}]},{"p":"clipDetailListInfo","w":250,"h":41,"wx":"HUG","hx":"HUG","gap":2,"c":[{"p":"clipDetailListTitle","w":250,"h":21,"wx":"FILL","hx":"HUG","t":"전반 하이라이트 모음","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1},{"p":"clipDetailListMeta","w":250,"h":18,"wx":"FILL","hx":"HUG","t":"00:00 – 00:15 · 15s","fg":[0.604,0.627,0.671,1],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1}]}]}},{"i":"selectable-list-row/highlightReviewClip","l":"하이라이트 검수 클립 행 — 체크박스가 있는 다중 선택 행","j":"HighlightProjectScene.tsx:2924-2963","t":{"p":"clipDetailListItem","w":368,"h":110,"wx":"FIX","hx":"HUG","pad":[6,6,6,6],"gap":10,"H":1,"r":14,"c":[{"p":"segmentCheckbox","w":175,"h":28,"wx":"FIX","hx":"FIX","bg":[0.231,0.231,0.231,1],"bw":2,"bc":[0.522,0.522,0.522,1]},{"p":"clipDetailListThumb","w":96,"h":54,"wx":"FIX","hx":"HUG","bg":[0.09,0.106,0.133,1],"r":10,"c":[{"p":"clipVideo","w":96,"h":54,"wx":"FIX","hx":"FIX","bg":[0,0,0,1]}]},{"p":"clipDetailListInfo","w":65,"h":98,"wx":"HUG","hx":"HUG","gap":2,"c":[{"p":"clipDetailListTitle","w":65,"h":42,"wx":"FILL","hx":"HUG","t":"결승 3점슛이 들어간 순간","fg":[0.98,0.98,0.98,1],"fs":14,"fw":500,"ls":-0.14,"lp":150,"T":1},{"p":"clipDetailListMeta","w":65,"h":54,"wx":"FILL","hx":"HUG","t":"00:12 – 00:27 · 점수 92","fg":[0.604,0.627,0.671,1],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1}]}]}}]},{"k":"skeleton","L":"스켈레톤","sp":[{"i":"skeleton/analysisModalIg","l":"노드 캔버스 분석 모달 · 인스타그램 로딩 뼈대","j":"NodeCanvasAnalysisModal.tsx:616-670","t":{"p":"IG_SKELETON_ROOT","w":372,"h":144,"wx":"FIX","hx":"HUG","c":[{"p":"IG_SKELETON_WRAPPER","w":372,"h":132,"wx":"FIX","hx":"HUG","c":[{"p":"IG_SKELETON_SECTION","w":372,"h":132,"wx":"FIX","hx":"HUG","gap":8,"c":[{"p":"IG_SKELETON_HEADER","w":372,"h":22,"wx":"FILL","hx":"HUG","gap":6,"H":1,"c":[{"p":"SKELETON_IG_ICON","w":20,"h":20,"wx":"FIX","hx":"FIX","r":6},{"p":"SKELETON_HEADER_TEXT","w":346,"h":22,"wx":"FIX","hx":"HUG","c":[{"p":"SKELETON_LINE_TITLE","w":240,"h":22,"wx":"FIX","hx":"FIX","r":999}]}]},{"p":"IG_SKELETON_META","w":372,"h":54,"wx":"FIX","hx":"HUG","gap":4,"c":[{"p":"SKELETON_LINE_TITLE","w":240,"h":22,"wx":"FIX","hx":"FIX","r":999},{"p":"SKELETON_LINE_WIDE","w":372,"h":12,"wx":"FILL","hx":"FIX","r":999},{"p":"SKELETON_LINE_WIDE","w":372,"h":12,"wx":"FILL","hx":"FIX","r":999}]},{"p":"IG_SKELETON_UPLOADED_ROW","w":372,"h":40,"wx":"FILL","hx":"HUG","gap":4,"H":1,"c":[{"p":"SKELETON_DATE_GROUP","w":184,"h":40,"wx":"FIX","hx":"HUG","gap":4,"c":[{"p":"SKELETON_LINE_SHORT","w":84,"h":12,"wx":"FIX","hx":"FIX","r":999},{"p":"SKELETON_LINE_VALUE","w":80,"h":24,"wx":"FIX","hx":"FIX","r":999}]},{"p":"SKELETON_DATE_GROUP","w":184,"h":40,"wx":"FIX","hx":"HUG","gap":4,"c":[{"p":"SKELETON_LINE_SHORT","w":84,"h":12,"wx":"FIX","hx":"FIX","r":999},{"p":"SKELETON_LINE_VALUE","w":80,"h":24,"wx":"FIX","hx":"FIX","r":999}]}]}]}]}]}},{"i":"skeleton/instagramTopBar","l":"인스타그램 분석 상단바 로딩 뼈대 — 같은 상수 이름의 두 번째 벌","j":"InstagramAnalyticsScene.tsx:1770-1778","t":{"p":"DASHBOARD_TOP_BAR_LEFT","w":292,"h":134,"wx":"FIX","hx":"HUG","gap":12,"c":[{"p":"CHANNEL_AVATAR_SKELETON","w":48,"h":48,"wx":"FIX","hx":"FIX","r":-1},{"p":"CHANNEL_INFO_SKELETON","w":292,"h":74,"wx":"FIX","hx":"HUG","gap":12,"c":[{"p":"SKELETON_CHANNEL_TITLE","w":150,"h":48,"wx":"FIX","hx":"FIX"},{"p":"SKELETON_CHANNEL_DESC","w":73,"h":14,"wx":"FIX","hx":"FIX"}]}]}},{"i":"skeleton/youtubeTopBar","l":"유튜브 분석 상단바 로딩 뼈대 — 아바타 원 + 줄 셋","j":"YoutubeAnalyticsScene.tsx:1960-1978","t":{"p":"DASHBOARD_TOP_BAR_LEFT","w":292,"h":160,"wx":"FIX","hx":"HUG","gap":12,"c":[{"p":"CHANNEL_AVATAR_SKELETON","w":48,"h":48,"wx":"FIX","hx":"FIX","r":-1},{"p":"CHANNEL_INFO_SKELETON","w":292,"h":100,"wx":"FIX","hx":"HUG","gap":12,"c":[{"p":"SKELETON_CHANNEL_TITLE","w":150,"h":48,"wx":"FIX","hx":"FIX"},{"p":"SKELETON_CHANNEL_DESC","w":73,"h":14,"wx":"FIX","hx":"FIX"},{"p":"SKELETON_CHANNEL_DESC_SHORT","w":43.8,"h":14,"wx":"FIX","hx":"FIX"}]}]}}]},{"k":"text-field","L":"텍스트 필드","sp":[{"i":"text-field/inspectorFramedInput","l":"인스펙터 초·프레임 입력 행 — 숫자 입력 둘과 단위 둘","j":"VideoEditModal.tsx:22545-22593","t":{"p":"inspectorFramedInputRow","w":372,"h":28,"wx":"FIX","hx":"HUG","gap":4,"H":1,"mw":140,"xw":140,"c":[{"p":"inspectorNumInput","w":56,"h":28,"wx":"FIX","hx":"FIX","pad":[4,8,4,8],"bg":[0.98,0.98,0.98,0.06],"r":6,"bw":1,"bc":[0.98,0.98,0.98,0.12]},{"p":"inspectorFramedInputUnit","w":10.27,"h":18,"wx":"HUG","hx":"HUG","t":"초","fg":[0.737,0.753,0.788,0.8],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1},{"p":"inspectorNumInput","w":56,"h":28,"wx":"FIX","hx":"FIX","pad":[4,8,4,8],"bg":[0.98,0.98,0.98,0.06],"r":6,"bw":1,"bc":[0.98,0.98,0.98,0.12]},{"p":"inspectorFramedInputUnit","w":30.77,"h":18,"wx":"HUG","hx":"HUG","t":"프레임","fg":[0.737,0.753,0.788,0.8],"fs":12,"fw":400,"ls":-0.12,"lp":150,"T":1}]}},{"i":"text-field/refinementInput","l":"하이라이트 다듬기 입력 — 테두리 있는 사각 입력","j":"HighlightProjectScene.tsx:666-677","t":{"p":"refinementInput","w":372,"h":39,"wx":"FIX","hx":"FIX","pad":[8,12,8,12],"bg":[0.341,0.365,0.408,0.55],"r":12,"bw":1,"bc":[0.98,0.98,0.98,0.15]}},{"i":"text-field/settingsRowName","l":"설정 이름 편집 입력 — 테두리 없이 알약 배경만","j":"SettingsScene.tsx:1095-1111","t":{"p":"settingsRowNameInput","w":372,"h":34,"wx":"FIX","hx":"FIX","pad":[0,12,0,12],"bg":[0.98,0.98,0.98,0.1],"r":999,"mh":34}}]}];

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
