#!/usr/bin/env bash
#
# figma-reference 팩을 레포에서 다시 만든다.
#
#   ./refresh.sh              # 기본 레포 ~/klipse
#   REPO=~/klipse-aws ./refresh.sh
#
# 이 팩은 손으로 조립하지 않는다. 한 번 손으로 만들었더니 `skill-references/` 가 통째로
# 빠졌고, 그 안에 장표 그리드가 들어 있어서 팩만 본 세션은 컴포넌트가 있다는 건 알아도
# 어디에 놓을지 몰랐다. 목록을 코드에 두면 그 실수가 반복되지 않는다.

set -euo pipefail

REPO="${REPO:-$HOME/klipse}"
DEST="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

[ -d "$REPO" ] || { echo "레포를 찾을 수 없습니다: $REPO" >&2; exit 1; }

# 레포가 스스로와 어긋난 상태면 그걸 그대로 팩에 옮기지 않는다.
echo "== 게이트 확인 =="
if ! (cd "$REPO/apps/web" && pnpm check-llms-docs >/dev/null 2>&1 \
      && pnpm check-design-tokens >/dev/null 2>&1); then
  echo "생성 문서가 globals.css 와 어긋나 있습니다." >&2
  echo "레포에서 먼저 맞추세요:" >&2
  echo "  cd $REPO/apps/web && pnpm build-llms-docs && pnpm build-design-tokens" >&2
  exit 1
fi
echo "OK — 생성 문서가 원천과 일치"

# 원본 → 팩 안에서의 이름.
# 새 참조 파일이 생기면 여기에 추가한다.
copy() {
  local src="$REPO/$1" dst="$DEST/$2"
  [ -f "$src" ] || { echo "원본 없음: $src" >&2; exit 1; }
  mkdir -p "$(dirname "$dst")"
  cp "$src" "$dst"
  printf '  %-28s %6s 줄\n' "$2" "$(wc -l < "$dst" | tr -d ' ')"
}

echo
echo "== 복사 =="
for f in llms foundations components patterns guidelines; do
  copy "design/llms/$f.txt" "$f.txt"
done
copy "design/tokens.yaml"                        "tokens.yaml"
copy "DESIGN_SYSTEM.md"                          "DESIGN_SYSTEM.md"
copy "design/figma/components.json"              "components.json"
copy ".claude/skills/klipse-design/SKILL.md"     "KLIPSE-DESIGN-SKILL.md"

# SKILL.md §6 이 가리키는 참조 파일 — 전부 따라간다.
# 장표 그리드(deck-structure.md)와 판형(layout-rules.md)이 여기 있다.
rm -rf "$DEST/skill-references"
for f in "$REPO"/.claude/skills/klipse-design/references/*.md; do
  copy ".claude/skills/klipse-design/references/$(basename "$f")" "skill-references/$(basename "$f")"
done

# SKILL.md 가 참조하는 파일이 전부 왔는지 대조한다 — 지난번 누락이 여기서 걸린다.
missing=0
while read -r ref; do
  [ -f "$DEST/skill-references/$ref" ] || { echo "  !! SKILL.md 가 가리키는데 없음: $ref" >&2; missing=1; }
done < <(grep -o 'references/[a-z-]*\.md' "$DEST/KLIPSE-DESIGN-SKILL.md" | sed 's|references/||' | sort -u)
[ "$missing" -eq 0 ] || { echo "참조 파일이 빠졌습니다." >&2; exit 1; }

{
  git -C "$REPO" log -1 --format='%h %s'
  git -C "$REPO" status --porcelain >/dev/null 2>&1 && {
    n=$(git -C "$REPO" status --porcelain | wc -l | tr -d ' ')
    [ "$n" -gt 0 ] && echo "작업 트리에 커밋 안 된 변경 $n 건 — 팩은 커밋이 아니라 이 상태를 담는다."
  }
  date
} > "$DEST/_SNAPSHOT.txt"

echo
echo "== 완료 =="
cat "$DEST/_SNAPSHOT.txt"
