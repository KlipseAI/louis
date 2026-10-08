#!/bin/bash
# 제품 작업 브랜치 통합 판을 다시 만든다 — 제품 저장소(읽기 전용)에서 커밋만 가져와 별도 저장소에 병합한다.
#   bash migration/product-integration/build.sh [통합 저장소 경로, 기본 ../kds-integration]
# 같은 integration.json 이면 같은 병합 SHA 가 나온다(이름 · 날짜 고정). 끝에 통합 커밋 SHA 를 인쇄한다.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
PRODUCT="${KLIPSE_PRODUCT_SOURCE:-/Users/sejunki/klipse-web}"
OUT="${1:-$HERE/../../../kds-integration}"
J="$HERE/integration.json"
field() { node -e "const j=require('$J');process.stdout.write(String($1))"; }
[ -d "$OUT/.git" ] || git clone -q --no-checkout "$PRODUCT" "$OUT"
cd "$OUT"
export GIT_AUTHOR_NAME="$(field j.identity.name)" GIT_COMMITTER_NAME="$(field j.identity.name)"
export GIT_AUTHOR_EMAIL="$(field j.identity.email)" GIT_COMMITTER_EMAIL="$(field j.identity.email)"
export GIT_AUTHOR_DATE="$(field j.identity.date)" GIT_COMMITTER_DATE="$(field j.identity.date)"
base="$(field j.base.commit)"
git fetch -q "$PRODUCT" "$base" 2>/dev/null || git fetch -q "$PRODUCT" "refs/remotes/$(field j.base.ref)"
git checkout -q -f -B integration "$base"
n="$(field j.branches.length)"
for i in $(seq 0 $((n - 1))); do
  ref="$(field "j.branches[$i].ref")"; commit="$(field "j.branches[$i].commit")"
  # 고정 커밋을 SHA 로 가져온다 — 브랜치가 그 뒤 움직이거나 다시 쌓여도(rebase) 같은 판이 나온다.
  git fetch -q "$PRODUCT" "$commit" || { echo "✗ ${ref}: 고정 커밋 ${commit} 를 제품 저장소에서 찾을 수 없다"; exit 1; }
  tip="$(git -C "$PRODUCT" rev-parse -q --verify "refs/heads/${ref}" || true)"
  [ "$tip" = "$commit" ] || echo "· ${ref} 는 고정 뒤 움직였다(지금 ${tip:0:9}) — 고정 커밋 ${commit:0:9} 로 만든다"
  if ! git merge -q --no-edit -m "integrate ${ref}" "$commit" >/dev/null 2>&1; then
    for f in $(git diff --name-only --diff-filter=U); do
      how="$(node -e "const r=(require('$J').branches[$i].resolve||{})['$f'];process.stdout.write(r||'')")"
      case "$how" in
        ours) git checkout --ours -- "$f" ;;
        theirs) git checkout --theirs -- "$f" ;;
        delete) git rm -q -- "$f" ; continue ;;
        file:*) cp "$HERE/${how#file:}" "$f" ;;
        *) echo "✗ ${ref}: 해소 규칙 없는 충돌 $f"; exit 1 ;;
      esac
      git add "$f"
    done
    git commit -q --no-edit -m "integrate ${ref}"
  fi
done
nf="$(node -e "process.stdout.write(String((require('$J').fixups||[]).length))")"
for i in $(seq 0 $((nf - 1))); do
  patch="$(field "j.fixups[$i].patch")"
  git apply --index "$HERE/$patch" || { echo "✗ 보정 패치가 맞지 않는다: $patch"; exit 1; }
  git commit -q -m "integration fixup: $(basename "$patch" .patch)"
done
echo "통합 판 $(git rev-parse HEAD)"
