cd /Users/sejunki/klipse-design-system
export KLIPSE_PRODUCT_FIXTURE_ROOT=/Users/sejunki/klipse-web-fixture
export KLIPSE_PRODUCT_BUILD_ROOT=/Users/sejunki/klipse-web-fixture
S=/private/tmp/claude-501/-Users-sejunki-klipse-web/cdd1ce74-8966-4791-8560-5af17fe4e4b9/scratchpad
fail=0
for m in \
  build-figma-snapshot build-figma-variables build-figma-styles build-figma-summaries \
  build-figma-product-components build-figma-product-app-shell build-figma-product-sidebar-states \
  build-figma-product-payment-scenes build-figma-product-checkout-status \
  build-figma-product-upgrade-scene build-figma-product-pricing-page build-figma-product-highlight-hub \
  build-figma-app-screens build-figma-inventory measure-figma-board-composition
do
  node ./scripts/$m.mjs > $S/f-$m.log 2>&1
  code=$?
  printf '%-38s exit=%s\n' "$m" "$code"
  [ $code -ne 0 ] && fail=1
done
echo "=== Figma 재생성 끝 (실패있음=$fail) ==="
