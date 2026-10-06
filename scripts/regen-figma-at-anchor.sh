#!/usr/bin/env bash
# 제품 앵커를 옮긴 뒤 원장 · Figma 계획 · 문서를 **순서대로** 다시 만든다.
#
# 순서에 뜻이 있다 — 측정 → 생성 → 문서.
#   생성기는 측정값의 `productCommit` 을 그대로 베껴 쓴다(build-figma-product-sidebar-states 등).
#   측정이 낙후된 채 생성기를 돌리면 낙후 핀이 복제되고 verify-product-anchor 는 계속 빨갛다.
#   2026-09-11 에 이 스크립트가 생성기만 돌려 sidebar-states 핀을 풀지 못한 것이 그 사례다.
#   생성기 안에서도 순서가 있다: 제품 보드 여덟이 선 뒤에야 build-figma-app-screens 가 얹을
#   것이 있고, 인벤토리와 보드 구성 측정은 그 둘 뒤다.
#
# 사용:
#   scripts/regen-figma-at-anchor.sh              전제(fixture) 확인 → 측정 → 생성 → 문서
#   scripts/regen-figma-at-anchor.sh --figma-only 전제(원장 핀) 확인 → 생성 → 문서 (측정이 이미 새 앵커일 때)
#   scripts/regen-figma-at-anchor.sh --preflight  전제(fixture) 확인만 하고 아무것도 쓰지 않는다
#
# --figma-only 는 fixture 를 보지 않는다 — 생성기는 fixture 가 아니라 제품 저장소
# (KLIPSE_PRODUCT_REPO)와 migration/*.json 원장을 읽는다. 대신 그 원장들의 핀이 lock 과 같은지 본다.
#
# 이 스크립트는 **fixture 를 체크아웃하거나 빌드하지 않는다** — 확인만 하고, 어긋나면 할 일을
# 인쇄하고 멈춘다. 자동으로 체크아웃하면 fixture 의 로컬 상태를 덮을 수 있기 때문이다.
#
# 끝난 뒤 사람이 할 일(스크립트가 대신하지 않는다):
#   앵커 이동 커밋에 **기준선도 함께** 옮긴다.
#     scripts/check-coverage-targets.mjs
#       표면 총수가 움직이면 SURFACE_TOTAL_BASELINE · SCOPED_BASELINE 을 옮긴다.
#       세워야 할 표면이 오르면 NEEDED_BASELINE 을 새 수로 올린다 (줄면 게이트가 이미 빨갛다).
#     scripts/check-figma-board-composition.mjs
#       보드 bespoke 가 오르면 BESPOKE_BASELINE 을 새 수로 올린다 (줄면 게이트가 이미 빨갛다).
#       컴포넌트 후보가 오르면 CANDIDATE_FLOOR 를 새 수로 올린다 (줄면 게이트가 이미 빨갛다).
#       보드의 셸 인스턴스(사이드바 · 상단 바)가 바뀌면 SHELL_INSTANCES_BY_BOARD 를 고친다. 이것은
#       양방향이라 늘든 줄든 게이트가 빨갛다 — 옮기기 전에 매처가 옳은 노드에 붙였는지 먼저 본다.
#       합계 INSTANCE_FLOOR 는 셸을 잃고 그 안의 부품이 따로 세어지면 같은 수로 남는다(2026-09-11).
#   NEEDED_BASELINE · BESPOKE_BASELINE · CANDIDATE_FLOOR 셋은 `수 < 기준` 만 errors 에 넣는다
#   (check-coverage-targets.mjs `needed < NEEDED_BASELINE` · check-figma-board-composition.mjs
#   `recounted.bespoke < BESPOKE_BASELINE` · `candidates < CANDIDATE_FLOOR`) — 오른 수는 조용히
#   통과하고 그만큼 그물이 늘어진다. 옮기지 않으면 canary 가 물지 못한다 —
#   2026-09-10 · 09-11 두 회차 연속 그렇게 됐다(verify-gates 가 「checker 가 주입을 통과시켰다」).
#   그 뒤 `pnpm verify` 와 `pnpm clean-room`.

set -u

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT" || exit 2

# 경로 비교용. 있는 디렉터리는 실경로로, 없는 경로는 끝 / 만 떼고 그대로 둔다.
canon() { ( cd "$1" 2>/dev/null && pwd -P ) || printf '%s\n' "${1%/}"; }

# 두 루트는 **실경로로 굳혀서** 내보낸다. 2026-09-13 에 생성기 다섯(product-app-shell · components ·
# highlight-hub · sidebar-states · upgrade-scene)이 받은 경로를 근거 명령 문자열에 그대로 적어,
# `$REPO_ROOT/../klipse-web` 철자로 돌리자 같은 트리를 재고도 계획 다섯과 draw.js 둘이 diff 를 남겼다.
# 생성기는 이제 `"$KLIPSE_PRODUCT_REPO"` 자리표시를 적지만, 경로를 산출물에 적는 도구가 또 생겨도
# 철자가 흔들리지 않게 여기서 한 번 굳힌다.
export KLIPSE_PRODUCT_REPO="$(canon "${KLIPSE_PRODUCT_REPO:-$REPO_ROOT/../klipse-web}")"
export KLIPSE_PRODUCT_FIXTURE_ROOT="$(canon "${KLIPSE_PRODUCT_FIXTURE_ROOT:-$REPO_ROOT/../klipse-web-fixture}")"
# BUILD_ROOT 는 FIXTURE_ROOT 와 **같은 트리**여야 한다. 전제 확인은 FIXTURE_ROOT 만 보는데
# measure-product-scenes 는 BUILD_ROOT 를 읽는다 — 둘이 갈리면 확인한 트리와 잰 트리가 다르다.
# 사용자가 준 값은 전제 단계에서 대조하고, 여기서는 강제로 같게 둔다.
build_root_env="${KLIPSE_PRODUCT_BUILD_ROOT:-}"
export KLIPSE_PRODUCT_BUILD_ROOT="$KLIPSE_PRODUCT_FIXTURE_ROOT"

MODE="full"
case "${1:-}" in
  "") ;;
  --figma-only) MODE="figma-only" ;;
  --preflight) MODE="preflight" ;;
  *) echo "알 수 없는 인자: $1 (--figma-only | --preflight)" >&2; exit 2 ;;
esac

LOG_DIR="$REPO_ROOT/scratchpad/anchor-logs/$(date +%Y%m%d-%H%M%S)"
failed=()

# ── 0. 전제 ──────────────────────────────────────────────────────────────
echo "════ 0) 전제 ($MODE) ════"
pre_ok=1
lock_commit="$(node -e 'process.stdout.write(require("./migration/product-evidence.lock.json").productCommit)' 2>/dev/null)"
if [ -z "$lock_commit" ]; then
  echo "  ✗ migration/product-evidence.lock.json 의 productCommit 을 읽지 못했다"; pre_ok=0
else
  echo "  lock 앵커            ${lock_commit:0:8}"
fi

# 측정기와 build-figma-inventory 는 scripts/lib/product-ref.mjs 를 거쳐 `KLIPSE_PRODUCT_REF` 를
# lock 보다 **앞에** 둔다. 그 값이 lock 과 다르면 아래에서 lock 으로 확인한 것과 다른 커밋을 잰다.
if [ -n "${KLIPSE_PRODUCT_REF:-}" ] && [ "$KLIPSE_PRODUCT_REF" != "$lock_commit" ]; then
  echo "  ✗ KLIPSE_PRODUCT_REF=$KLIPSE_PRODUCT_REF 가 lock 앵커(${lock_commit:-읽지 못함})와 다르다."
  echo "      측정기는 lock 보다 이 값을 먼저 읽으므로 확인한 커밋과 잰 커밋이 갈린다."
  echo "      unset KLIPSE_PRODUCT_REF 뒤 다시 돌린다(후보 커밋 시험 측정은 이 스크립트 밖에서)."
  exit 2
fi

# 같은 종류의 함정이 둘 더 있다. KLIPSE_PRODUCT_MEASURE_URL 은 measure-product-sidebar-states 가 fixture
# 대신 임의의 서버를 재게 하면서도 lock 커밋을 찍게 만들고, LOUIS_DUMP_RULE 은 measure-product-components
# 가 원장을 쓰지 않고 SKIPPED 도 찍지 않은 채 exit 0 하게 만든다 — 아래 SKIPPED 검사로도 잡히지 않는다.
for trap_var in KLIPSE_PRODUCT_MEASURE_URL LOUIS_DUMP_RULE; do
  eval "trap_val=\"\${$trap_var:-}\""
  if [ -n "$trap_val" ]; then
    echo "  ✗ $trap_var 가 설정돼 있다 — 측정이 확인한 트리를 재지 않거나 원장을 쓰지 않고 성공한다."
    echo "      unset $trap_var 뒤 다시 돌린다(진단용 값은 이 스크립트 밖에서 쓴다)."
    exit 2
  fi
done

if [ ! -d "$KLIPSE_PRODUCT_REPO/.git" ]; then
  echo "  ✗ 제품 저장소가 없다: $KLIPSE_PRODUCT_REPO  (KLIPSE_PRODUCT_REPO 로 지정)"; pre_ok=0
elif [ -n "$lock_commit" ] && ! git -C "$KLIPSE_PRODUCT_REPO" cat-file -e "$lock_commit^{commit}" 2>/dev/null; then
  echo "  ✗ 제품 저장소에 lock 커밋이 없다 — git -C \"$KLIPSE_PRODUCT_REPO\" fetch"; pre_ok=0
fi

F="$KLIPSE_PRODUCT_FIXTURE_ROOT"
SA="$F/apps/web/.next/standalone/apps/web"

print_rebuild() {
  echo "    할 일 — lock 커밋에서 빌드 산출물을 다시 만든다(체크아웃만으로는 .next 가 이전 빌드로 남는다):"
  echo "      (pnpm-lock.yaml 이 바뀌었으면 \"$F\" 안에서 pnpm install)"
  # `exec` 를 뺀 `pnpm -C <dir> turbo …` 는 pnpm 10 에서 디렉터리 자체를 실행하려다
  # `spawn <dir> EACCES` 로 죽는다(2026-09-15, pnpm 10.30.2). 인쇄한 대로 붙여 넣으면 도는 명령이어야 한다.
  echo "      pnpm -C \"$F\" exec turbo run build --filter=web"
  echo "      mkdir -p \"$SA/.next\" && cp -R \"$F/apps/web/.next/static\" \"$SA/.next/\" && cp -R \"$F/apps/web/public\" \"$SA/\""
}

if [ "$MODE" != "figma-only" ]; then
  if [ -n "$build_root_env" ] && [ "$(canon "$build_root_env")" != "$(canon "$F")" ]; then
    echo "  ✗ KLIPSE_PRODUCT_BUILD_ROOT=$build_root_env 가 KLIPSE_PRODUCT_FIXTURE_ROOT=$F 와 다르다."
    echo "      전제 확인은 FIXTURE_ROOT 를 보고 measure-product-scenes 는 BUILD_ROOT 를 잰다."
    echo "      둘을 같게 두거나 KLIPSE_PRODUCT_BUILD_ROOT 를 unset 한다."
    exit 2
  fi

  # worktree 의 `.git` 은 디렉터리가 아니라 gitdir 을 가리키는 파일이다 — `-d` 로 보면 worktree fixture 를
  # 「클론이 없다」로 거부한다(2026-10-06, fixture 를 제품 저장소의 worktree 로 둔다).
  if [ ! -e "$F/.git" ]; then
    echo "  ✗ fixture 클론이 없다: $F  (KLIPSE_PRODUCT_FIXTURE_ROOT 로 지정)"; pre_ok=0
  else
    need_rebuild=0
    fx_head="$(git -C "$F" rev-parse HEAD 2>/dev/null)"
    fx_dirty="$(git -C "$F" status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
    echo "  fixture HEAD         ${fx_head:0:8}  (변경 $fx_dirty)"
    if [ -n "$lock_commit" ] && [ "$fx_head" != "$lock_commit" ]; then
      echo "  ✗ fixture 가 lock 앵커가 아니다:"
      echo "      git -C \"$F\" fetch origin && git -C \"$F\" checkout --detach ${lock_commit:0:8}"
      pre_ok=0; need_rebuild=1
    fi
    if [ "$fx_dirty" != "0" ]; then
      echo "  ✗ fixture 가 깨끗하지 않다 — 측정 근거로 쓸 수 없다"; pre_ok=0
    fi
    # 전제가 통과해도 측정 중간에 죽으면 그 앞 원장들은 이미 다시 쓰인 뒤다. 측정이 부르는 것을 미리 본다.
    #   measure-product-components · variants 는 제품 저장소의 tailwindcss 를 해석한다.
    #   measure-product-auth-fixture · sidebar-states 는 fixture 의 Next CLI 로 dev server 를 띄운다.
    if ! node -e 'require("module").createRequire(process.argv[1] + "/package.json").resolve("tailwindcss/package.json")' \
         "$KLIPSE_PRODUCT_REPO" >/dev/null 2>&1; then
      echo "  ✗ 제품 저장소에서 tailwindcss 를 해석하지 못한다 — 그 안에서 pnpm install"; pre_ok=0
    fi
    if [ ! -e "$F/node_modules/next/dist/bin/next" ] && [ ! -e "$F/apps/web/node_modules/next/dist/bin/next" ]; then
      echo "  ✗ fixture 에 Next CLI 가 없다 — \"$F\" 안에서 pnpm install"; pre_ok=0
    fi
    for p in "$SA/server.js" "$F/apps/web/.next/BUILD_ID" "$SA/.next/BUILD_ID" "$SA/.next/static" "$SA/public" \
             "$F/apps/web/.next/required-server-files.json" "$SA/.next/required-server-files.json"; do
      [ -e "$p" ] || { echo "  ✗ standalone 산출물이 없다: ${p#$F/}"; pre_ok=0; need_rebuild=1; }
    done

    # HEAD 가 lock 이어도 .next 는 체크아웃 전 커밋의 빌드일 수 있다(git status 는 .next 를 보지 않는다).
    # 빌드가 어느 커밋의 것인지는 required-server-files 의 config.env._sentryRelease 가 말한다 —
    # measure-product-scenes 가 같은 값을 productCommit 과 대조하고 멈춘다.
    read_release() {
      node -e '
        try {
          const j = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
          process.stdout.write(String((j.config && j.config.env && j.config.env._sentryRelease) || ""));
        } catch {}
      ' "$1" 2>/dev/null
    }
    rel_build=""; rel_sa=""
    [ -f "$F/apps/web/.next/required-server-files.json" ] && rel_build="$(read_release "$F/apps/web/.next/required-server-files.json")"
    [ -f "$SA/.next/required-server-files.json" ] && rel_sa="$(read_release "$SA/.next/required-server-files.json")"
    echo "  빌드 release         ${rel_build:0:8}  (standalone ${rel_sa:0:8})"
    if [ -n "$lock_commit" ]; then
      if [ -f "$F/apps/web/.next/required-server-files.json" ] && [ "$rel_build" != "$lock_commit" ]; then
        echo "  ✗ .next 빌드의 release 가 lock 앵커가 아니다: ${rel_build:-(없음)}"; pre_ok=0; need_rebuild=1
      fi
      if [ -f "$SA/.next/required-server-files.json" ] && [ "$rel_sa" != "$lock_commit" ]; then
        echo "  ✗ standalone 의 release 가 lock 앵커가 아니다: ${rel_sa:-(없음)}"; pre_ok=0; need_rebuild=1
      fi
    fi

    if [ -f "$F/apps/web/.next/BUILD_ID" ] && [ -f "$SA/.next/BUILD_ID" ] &&
       ! cmp -s "$F/apps/web/.next/BUILD_ID" "$SA/.next/BUILD_ID"; then
      echo "  ✗ .next 와 standalone 의 BUILD_ID 가 다르다 — standalone 이 이 빌드의 것이 아니다"
      echo "      (이전 빌드에서 남았거나 다른 트리에서 왔다. 복사 누락만의 문제가 아니다)"
      pre_ok=0; need_rebuild=1
    fi
    [ "$need_rebuild" = "1" ] && print_rebuild
  fi
else
  # 생성기는 측정 원장의 productCommit 을 베껴 쓴다(머리말). 측정이 새 앵커가 아닌데 생성기만 돌면
  # 낙후 핀이 복제된다 — 2026-09-11 의 그 사례. 그래서 원장 핀이 lock 과 같은지 읽기만 해서 본다.
  # 빼는 파일:
  #   consolidation-choices.json · product-has-refutation.json  역사 기록(verify-product-anchor 의 DECLARED_HISTORICAL_PINS)
  #   product.measured.json · product.variable-modes.json        낙후가 알려진 부채(같은 파일의 KNOWN_STALE)
  #   product-evidence.lock.json                                 정본 자신
  #   figma-board-composition.json                               2) 의 measure-figma-board-composition 이 이번에 다시 쓴다
  pin_out="$(node -e '
    const fs = require("fs");
    const lock = process.argv[1];
    const skip = new Set([
      "consolidation-choices.json", "product-has-refutation.json",
      "product.measured.json", "product.variable-modes.json",
      "product-evidence.lock.json", "figma-board-composition.json",
    ]);
    const stale = [];
    let checked = 0;
    const visit = (node, file, path) => {
      if (!node || typeof node !== "object") return;
      for (const [k, v] of Object.entries(node)) {
        if ((k === "productCommit" || k === "releaseCommit") && typeof v === "string") {
          checked++;
          if (v !== lock) stale.push("migration/" + file + " " + path + "/" + k + " = " + v.slice(0, 8));
        } else visit(v, file, path + "/" + k);
      }
    };
    for (const f of fs.readdirSync("migration").filter((f) => f.endsWith(".json")).sort()) {
      if (skip.has(f)) continue;
      let j;
      try { j = JSON.parse(fs.readFileSync("migration/" + f, "utf8")); }
      catch { stale.push("migration/" + f + " (JSON 을 읽지 못했다)"); continue; }
      visit(j, f, "");
    }
    if (stale.length) { process.stdout.write(stale.join("\n")); process.exit(1); }
    if (checked === 0) { process.stdout.write("핀을 하나도 찾지 못했다"); process.exit(3); }
    process.stdout.write(String(checked));
  ' "$lock_commit" 2>&1)"
  pin_code=$?
  if [ -z "$lock_commit" ]; then
    : # 위에서 이미 실패로 적었다
  elif [ "$pin_code" -eq 0 ]; then
    echo "  원장 핀               $pin_out 개가 lock 앵커와 같다"
  else
    echo "  ✗ 측정 원장의 핀이 lock 앵커가 아니다(exit=$pin_code) — 기본 모드로 측정부터 다시 돈다:"
    echo "$pin_out" | sed 's/^/      /'
    pre_ok=0
  fi
fi

if [ "$pre_ok" != "1" ]; then
  echo "════ 전제 미충족 — 아무것도 쓰지 않고 멈춘다 ════"
  exit 1
fi
echo "  ✓ 전제 충족"
[ "$MODE" = "preflight" ] && exit 0

mkdir -p "$LOG_DIR"
echo "  로그: ${LOG_DIR#$REPO_ROOT/}"

run() {
  local name="$1"; shift
  node "./scripts/$name.mjs" "$@" > "$LOG_DIR/$name.log" 2>&1
  local code=$?
  printf '  %-40s exit=%s  %s\n' "$name" "$code" "$(tail -1 "$LOG_DIR/$name.log" | cut -c1-70)"
  if [ "$code" -ne 0 ]; then
    failed+=("$name")
    grep -m1 -E 'Error|error' "$LOG_DIR/$name.log" | cut -c1-160 | sed 's/^/      ↳ /'
  fi
  return "$code"
}

# ── 1. 측정 ──────────────────────────────────────────────────────────────
if [ "$MODE" = "full" ]; then
  echo
  echo "════ 1) 측정 — verify:product 순서 ════"
  # 순서의 정본은 package.json 의 verify:product 다. 각 verify-* 는 같은 스크립트의 --check 이므로
  # --check 를 뺀 것이 생성이다. 손으로 목록을 박으면 게이트가 늘 때 여기서 빠진다.
  measure_steps="$(node -e '
    const s = require("./package.json").scripts;
    const out = [];
    for (const step of s["verify:product"].split("&&").map((x) => x.trim().replace(/^pnpm run /, ""))) {
      const m = /^node \.\/scripts\/((?:measure-[a-z-]+|build-alpha-consolidation))\.mjs --check$/.exec(s[step] ?? "");
      if (m) out.push(m[1]);
    }
    process.stdout.write(out.join(" "));
  ')"
  if [ -z "$measure_steps" ]; then
    echo "  ✗ package.json 에서 측정 단계를 하나도 읽지 못했다"; exit 1
  fi
  for m in $measure_steps; do
    run "$m" || { echo "════ 측정이 실패했다 — 생성기가 낙후 핀을 복제하지 않도록 여기서 멈춘다 ════"; exit 1; }
    # 종료 코드만으로는 모자란다. measure-product-components · measure-product-variants 는 제품
    # tailwindcss 를 불러오지 못하면 `SKIPPED` 를 찍고 exit 0 하며 원장을 쓰지 않는다
    # (각 파일의 console.log("[product-…] SKIPPED …")). 낡은 원장이 새 앵커인 척 남는다.
    if grep -qw 'SKIPPED' "$LOG_DIR/$m.log"; then
      failed+=("$m")
      echo "  ✗ $m 이 exit 0 인데 SKIPPED 를 찍었다 — 원장을 쓰지 않았다:"
      grep -m1 -w 'SKIPPED' "$LOG_DIR/$m.log" | cut -c1-160 | sed 's/^/      ↳ /'
      echo "════ 측정이 실패했다 — 생성기가 낙후 핀을 복제하지 않도록 여기서 멈춘다 ════"
      exit 1
    fi
  done

  # palette ladder 기준선은 --update-baseline 으로만 앵커를 옮길 수 있는데, 그 모드는 지금 수를
  # 그대로 받아 적는다. 파일별 수가 **오르면** 그 파일의 $rule(한 방향)을 어기는 것이므로 막는다.
  # checker 는 기준선을 **먼저 쓰고** 문제가 있으면 exit 1 한다(scripts/check-palette-ladder-collision.mjs
  # 의 writeFileSync 뒤 `process.exit(problems.length > 0 ? 1 : 0)`). 그래서 종료 코드와 무관하게
  # 비교를 돌리고, checker 실패 · 비교 실패 · 파일별 상승 중 하나라도 있으면 되돌린다.
  before="$LOG_DIR/palette-ladder-baseline.before.json"
  cp migration/palette-ladder-baseline.json "$before" || { echo "  ✗ palette ladder 기준선을 떠 두지 못했다 — 멈춘다"; exit 1; }
  run check-palette-ladder-collision --update-baseline
  ladder_code=$?
  rose="$(node -e '
    const before = require(process.argv[1]).files ?? {};
    const after = require("./migration/palette-ladder-baseline.json").files ?? {};
    const up = Object.entries(after).filter(([f, n]) => n > (before[f] ?? 0)).map(([f, n]) => f + " " + (before[f] ?? 0) + "→" + n);
    process.stdout.write(up.join("\n"));
  ' "$before")"
  compare_code=$?
  if [ "$ladder_code" -ne 0 ] || [ "$compare_code" -ne 0 ] || [ -n "$rose" ]; then
    cp "$before" migration/palette-ladder-baseline.json
    if [ "$ladder_code" -ne 0 ]; then
      echo "  ✗ check-palette-ladder-collision --update-baseline 이 exit=$ladder_code — 기준선은 이미 다시 적혔으므로 되돌린다"
    fi
    if [ "$compare_code" -ne 0 ]; then
      echo "  ✗ 기준선 전후 비교가 돌지 못했다(exit=$compare_code) — 되돌린다"
    fi
    if [ -n "$rose" ]; then
      echo "  ✗ palette ladder 위반이 파일 단위로 올랐다 — 기준선을 되돌린다:"
      echo "$rose" | sed 's/^/      /'
    fi
    echo "════ 멈춘다 ════"
    exit 1
  fi
fi

# ── 2. 생성 ──────────────────────────────────────────────────────────────
echo
echo "════ 2) Figma 생성기 ════"
for m in \
  build-figma-snapshot build-figma-variables build-figma-styles build-figma-summaries \
  build-figma-product-components build-figma-product-app-shell build-figma-product-sidebar-states \
  build-figma-product-payment-scenes build-figma-product-checkout-status \
  build-figma-product-upgrade-scene build-figma-product-highlight-hub \
  build-figma-app-screens build-figma-inventory measure-figma-board-composition
do
  run "$m"
done

# ── 3. 문서 ──────────────────────────────────────────────────────────────
echo
echo "════ 3) 문서 generated region ════"
run build-design-docs
run build-llms-docs

# ── 4. 앵커 ──────────────────────────────────────────────────────────────
echo
echo "════ 4) verify-product-anchor ════"
run verify-product-anchor

echo
if [ "${#failed[@]}" -gt 0 ]; then
  echo "════ 실패 ${#failed[@]}: ${failed[*]} ════"
  exit 1
fi
echo "════ 끝. 이제 기준선을 확인하고(파일 머리말) pnpm verify · pnpm clean-room ════"
