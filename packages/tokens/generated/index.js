// GENERATED FILE — edit packages/tokens/src/klipse.tokens.json.
export const formatVersion = 1;
export const themes = Object.freeze(["light","dark"]);
export const metadata = Object.freeze({
  "contrastPairs": [
    {
      "foreground": "color-fg-primary",
      "background": "color-bg-canvas",
      "minimum": 4.5
    },
    {
      "foreground": "color-fg-primary",
      "background": "color-bg-surface",
      "minimum": 4.5
    },
    {
      "foreground": "color-fg-on-inverse",
      "background": "color-bg-inverse",
      "minimum": 4.5
    },
    {
      "background": "color-accent-primary",
      "foreground": "color-fg-inverse",
      "minimum": 3,
      "note": "제품 브랜드 블루(blue.500 #0088ff)를 정본으로 채택한 owner 결정의 결과다. 흰 글자(gray-0) 대비가 3.37로 WCAG 2.2 AA의 일반 텍스트 기준 4.5에 미달한다. 4.5를 넘는 첫 단계는 blue.700(6.12)인데 제품에서 2번밖에 쓰이지 않는 색이라 브랜드가 아니다. 이 미달은 제품이 이미 갖고 있는 것이며 DS가 그것을 그대로 재현한다. 해소하려면 라벨을 18.66px bold 이상으로 키우거나 면 색을 어둡게 바꿔야 하고, 둘 다 owner 판정 대상이다."
    },
    {
      "foreground": "color-fg-danger",
      "background": "color-bg-danger",
      "minimum": 4.5
    },
    {
      "foreground": "color-fg-success",
      "background": "color-bg-success",
      "minimum": 4.5
    },
    {
      "foreground": "color-fg-warning",
      "background": "color-bg-warning",
      "minimum": 4.5
    },
    {
      "foreground": "color-fg-info",
      "background": "color-bg-info",
      "minimum": 4.5
    },
    {
      "background": "color-accent-primary-hover",
      "foreground": "color-fg-inverse",
      "minimum": 2.5,
      "note": "hover 면(blue.400)은 대비가 2.54로 기본 면보다 더 낮다. 제품이 hover에서 밝아지기 때문이며(filter: brightness(1.06)), 그 방향을 따랐다. 기본 면이 이미 AA 미달이므로 hover만 따로 지킬 수 없다. 이 쌍을 게이트에 올려 두는 이유는 통과시키려는 것이 아니라 수치를 드러내 두기 위해서다."
    },
    {
      "background": "color-accent-primary-active",
      "foreground": "color-fg-inverse",
      "minimum": 4,
      "note": "pressed 면(blue.600)은 대비 4.41로 AA에 근소하게 미달한다. hover가 밝아지므로 pressed는 어두워져 두 상태를 구분한다. 기본 면과 같은 사유로 미달을 수용한다."
    },
    {
      "background": "color-accent-danger",
      "foreground": "color-fg-on-danger",
      "minimum": 3,
      "note": "제품의 danger는 solid #ff4b59에 흰 글자이고 대비가 3.14로 WCAG AA 4.5에 미달한다. owner가 제품 공용 컴포넌트를 정본으로 택했고 이 미달은 제품이 이미 갖고 있는 것이다. 해소하려면 면을 어둡게(red.600 이하) 하거나 라벨을 크게 해야 하며 둘 다 브랜드 판정 대상이다."
    },
    {
      "background": "color-bg-canvas",
      "foreground": "color-accent-secondary-foreground",
      "minimum": 3.5,
      "note": "제품의 secondary·ghost 전경은 gray-600 #777d89이고 흰 배경 대비 4.13, DS canvas 대비 3.67로 WCAG AA 4.5에 미달한다. 제품 값을 정본으로 채택한 결과다. 한 단계 진한 gray.700을 쓰면 6.35로 통과하지만 제품과 달라진다. 다크 모드는 제품이 알파(static-white-alpha 72)를 쓰는데 알파 전경은 배경에 따라 대비가 달라져 게이트가 잴 수 없으므로 가장 가까운 불투명 단계 gray.400을 쓴다."
    },
    {
      "foreground": "color-fg-danger-on-surface",
      "background": "color-bg-surface",
      "minimum": 4.5
    },
    {
      "foreground": "color-fg-danger-on-surface",
      "background": "color-bg-menu",
      "minimum": 4.5
    }
  ],
  "description": "Klipse Design의 DTCG 2025.10 기반 토큰 정본",
  "figmaCollection": "Klipse",
  "layerOrder": [
    "layer-content",
    "layer-sticky",
    "layer-popover",
    "layer-modal",
    "layer-critical"
  ],
  "motionProperties": [
    {
      "motion": "motion-overlay-enter",
      "properties": [
        "opacity",
        "translate",
        "scale"
      ]
    },
    {
      "motion": "motion-overlay-exit",
      "properties": [
        "opacity",
        "translate",
        "scale"
      ]
    },
    {
      "motion": "motion-modal-enter",
      "properties": [
        "opacity",
        "translate",
        "scale"
      ]
    },
    {
      "motion": "motion-modal-exit",
      "properties": [
        "opacity",
        "translate",
        "scale"
      ]
    },
    {
      "motion": "motion-reduced",
      "properties": [
        "opacity"
      ]
    },
    {
      "motion": "motion-tooltip-enter",
      "properties": [
        "opacity",
        "scale"
      ]
    },
    {
      "motion": "motion-tooltip-exit",
      "properties": [
        "opacity",
        "scale"
      ]
    },
    {
      "motion": "motion-menu-enter",
      "properties": [
        "opacity",
        "translate",
        "scale"
      ]
    },
    {
      "motion": "motion-menu-exit",
      "properties": [
        "opacity",
        "translate",
        "scale"
      ]
    },
    {
      "motion": "motion-spin",
      "properties": [
        "rotate"
      ],
      "lifecycle": "loop"
    },
    {
      "motion": "motion-shimmer",
      "properties": [
        "background-position",
        "opacity"
      ],
      "lifecycle": "loop"
    },
    {
      "motion": "motion-crossfade-enter",
      "properties": [
        "opacity"
      ]
    },
    {
      "motion": "motion-zoom-settle",
      "properties": [
        "scale"
      ]
    },
    {
      "motion": "motion-content-fade",
      "properties": [
        "opacity"
      ]
    },
    {
      "motion": "motion-content-rise",
      "properties": [
        "translate"
      ]
    },
    {
      "motion": "motion-stagger-1",
      "properties": [
        "opacity",
        "translate"
      ]
    },
    {
      "motion": "motion-stagger-2",
      "properties": [
        "opacity",
        "translate"
      ]
    },
    {
      "motion": "motion-stagger-3",
      "properties": [
        "opacity",
        "translate"
      ]
    },
    {
      "motion": "motion-layout-change",
      "properties": [
        "inline-size",
        "background-color"
      ],
      "lifecycle": "layout-change"
    },
    {
      "motion": "motion-control-hover",
      "properties": [
        "background-color"
      ],
      "lifecycle": "layout-change"
    },
    {
      "motion": "motion-shell-collapse",
      "properties": [
        "inline-size"
      ],
      "lifecycle": "layout-change"
    },
    {
      "motion": "motion-reveal-enter",
      "properties": [
        "opacity",
        "translate"
      ]
    },
    {
      "motion": "motion-list-enter",
      "properties": [
        "opacity",
        "translate"
      ]
    },
    {
      "motion": "motion-list-stagger-step",
      "properties": [
        "opacity",
        "translate"
      ]
    },
    {
      "motion": "motion-tab-select",
      "properties": [
        "opacity"
      ]
    }
  ],
  "reducedMotionPairs": [
    {
      "motion": "motion-overlay-enter",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-overlay-exit",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-modal-enter",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-modal-exit",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-tooltip-enter",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-tooltip-exit",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-menu-enter",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-menu-exit",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-crossfade-enter",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-zoom-settle",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-content-fade",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-content-rise",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-stagger-1",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-stagger-2",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-stagger-3",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-layout-change",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-control-hover",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-shell-collapse",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-reveal-enter",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-list-enter",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-list-stagger-step",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-tab-select",
      "reduced": "motion-reduced"
    }
  ],
  "responsiveProfiles": {
    "projectGrid": {
      "measurement": "container",
      "minimumColumns": 1,
      "maximumColumns": 5,
      "minimumCard": "layout-project-card-minimum",
      "gap": "layout-project-grid-gap",
      "compatibilitySteps": [
        {
          "minimumWidth": {
            "value": 0,
            "unit": "px"
          },
          "preferredColumns": 2
        },
        {
          "minimumWidth": {
            "value": 720,
            "unit": "px"
          },
          "preferredColumns": 3
        },
        {
          "minimumWidth": {
            "value": 1200,
            "unit": "px"
          },
          "preferredColumns": 4
        },
        {
          "minimumWidth": {
            "value": 1800,
            "unit": "px"
          },
          "preferredColumns": 5
        }
      ]
    }
  }
});
export const primitives = {
  "blur-10": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "blur-10",
    "mode": "base",
    "rawValue": {
      "value": 10,
      "unit": "px"
    },
    "sourcePath": "primitive.blur.10",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 10,
      "unit": "px"
    }
  },
  "blur-12": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "blur-12",
    "mode": "base",
    "rawValue": {
      "value": 12,
      "unit": "px"
    },
    "sourcePath": "primitive.blur.12",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 12,
      "unit": "px"
    }
  },
  "blur-16": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "blur-16",
    "mode": "base",
    "rawValue": {
      "value": 16,
      "unit": "px"
    },
    "sourcePath": "primitive.blur.16",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 16,
      "unit": "px"
    }
  },
  "border-width-default-base": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "border-width-default-base",
    "mode": "base",
    "rawValue": {
      "value": 1,
      "unit": "px"
    },
    "sourcePath": "primitive.border-width.default",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 1,
      "unit": "px"
    }
  },
  "border-width-hairline-base": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "border-width-hairline-base",
    "mode": "base",
    "rawValue": {
      "value": 0.5,
      "unit": "px"
    },
    "sourcePath": "primitive.border-width.hairline",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 0.5,
      "unit": "px"
    }
  },
  "border-width-ring-base": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "border-width-ring-base",
    "mode": "base",
    "rawValue": {
      "value": 2,
      "unit": "px"
    },
    "sourcePath": "primitive.border-width.ring",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 2,
      "unit": "px"
    }
  },
  "color-blue-050": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-blue-050": "color(srgb 0.941176 0.968627 1 / 1)",
      "--louis-color-blue-050-rgb": "240 247 255"
    },
    "deprecated": null,
    "description": null,
    "id": "color-blue-050",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.941176,
        0.968627,
        1
      ],
      "hex": "#f0f7ff"
    },
    "sourcePath": "primitive.color.blue.050",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.941176,
        0.968627,
        1
      ],
      "alpha": 1
    }
  },
  "color-blue-100": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-blue-100": "color(srgb 0.839216 0.921569 1 / 1)",
      "--louis-color-blue-100-rgb": "214 235 255"
    },
    "deprecated": null,
    "description": null,
    "id": "color-blue-100",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.839216,
        0.921569,
        1
      ],
      "hex": "#d6ebff"
    },
    "sourcePath": "primitive.color.blue.100",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.839216,
        0.921569,
        1
      ],
      "alpha": 1
    }
  },
  "color-blue-200": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-blue-200": "color(srgb 0.639216 0.835294 1 / 1)",
      "--louis-color-blue-200-rgb": "163 213 255"
    },
    "deprecated": null,
    "description": null,
    "id": "color-blue-200",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.639216,
        0.835294,
        1
      ],
      "hex": "#a3d5ff"
    },
    "sourcePath": "primitive.color.blue.200",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.639216,
        0.835294,
        1
      ],
      "alpha": 1
    }
  },
  "color-blue-300": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-blue-300": "color(srgb 0.439216 0.74902 1 / 1)",
      "--louis-color-blue-300-rgb": "112 191 255"
    },
    "deprecated": null,
    "description": null,
    "id": "color-blue-300",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.439216,
        0.74902,
        1
      ],
      "hex": "#70bfff"
    },
    "sourcePath": "primitive.color.blue.300",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.439216,
        0.74902,
        1
      ],
      "alpha": 1
    }
  },
  "color-blue-350": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-blue-350": "color(srgb 0.329412 0.694118 1 / 1)",
      "--louis-color-blue-350-rgb": "84 177 255"
    },
    "deprecated": null,
    "description": null,
    "id": "color-blue-350",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.329412,
        0.694118,
        1
      ],
      "hex": "#54b1ff"
    },
    "sourcePath": "primitive.color.blue.350",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.329412,
        0.694118,
        1
      ],
      "alpha": 1
    }
  },
  "color-blue-400": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-blue-400": "color(srgb 0.219608 0.643137 1 / 1)",
      "--louis-color-blue-400-rgb": "56 164 255"
    },
    "deprecated": null,
    "description": null,
    "id": "color-blue-400",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.219608,
        0.643137,
        1
      ],
      "hex": "#38a4ff"
    },
    "sourcePath": "primitive.color.blue.400",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.219608,
        0.643137,
        1
      ],
      "alpha": 1
    }
  },
  "color-blue-420": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-blue-420": "color(srgb 0.160784 0.603922 1 / 1)",
      "--louis-color-blue-420-rgb": "41 154 255"
    },
    "deprecated": null,
    "description": null,
    "id": "color-blue-420",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.160784,
        0.603922,
        1
      ],
      "hex": "#299aff"
    },
    "sourcePath": "primitive.color.blue.420",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.160784,
        0.603922,
        1
      ],
      "alpha": 1
    }
  },
  "color-blue-450": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-blue-450": "color(srgb 0.078431 0.568627 1 / 1)",
      "--louis-color-blue-450-rgb": "20 145 255"
    },
    "deprecated": null,
    "description": null,
    "id": "color-blue-450",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.078431,
        0.568627,
        1
      ],
      "hex": "#1491ff"
    },
    "sourcePath": "primitive.color.blue.450",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.078431,
        0.568627,
        1
      ],
      "alpha": 1
    }
  },
  "color-blue-500": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-blue-500": "color(srgb 0 0.533333 1 / 1)",
      "--louis-color-blue-500-rgb": "0 136 255"
    },
    "deprecated": null,
    "description": null,
    "id": "color-blue-500",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.533333,
        1
      ],
      "hex": "#0088ff"
    },
    "sourcePath": "primitive.color.blue.500",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.533333,
        1
      ],
      "alpha": 1
    }
  },
  "color-blue-550": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-blue-550": "color(srgb 0 0.494118 0.909804 / 1)",
      "--louis-color-blue-550-rgb": "0 126 232"
    },
    "deprecated": null,
    "description": null,
    "id": "color-blue-550",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.494118,
        0.909804
      ],
      "hex": "#007ee8"
    },
    "sourcePath": "primitive.color.blue.550",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.494118,
        0.909804
      ],
      "alpha": 1
    }
  },
  "color-blue-580": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-blue-580": "color(srgb 0 0.462745 0.85098 / 1)",
      "--louis-color-blue-580-rgb": "0 118 217"
    },
    "deprecated": null,
    "description": null,
    "id": "color-blue-580",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.462745,
        0.85098
      ],
      "hex": "#0076d9"
    },
    "sourcePath": "primitive.color.blue.580",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.462745,
        0.85098
      ],
      "alpha": 1
    }
  },
  "color-blue-600": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-blue-600": "color(srgb 0 0.458824 0.858824 / 1)",
      "--louis-color-blue-600-rgb": "0 117 219"
    },
    "deprecated": null,
    "description": null,
    "id": "color-blue-600",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.458824,
        0.858824
      ],
      "hex": "#0075db"
    },
    "sourcePath": "primitive.color.blue.600",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.458824,
        0.858824
      ],
      "alpha": 1
    }
  },
  "color-blue-620": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-blue-620": "color(srgb 0 0.431373 0.768627 / 1)",
      "--louis-color-blue-620-rgb": "0 110 196"
    },
    "deprecated": null,
    "description": null,
    "id": "color-blue-620",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.431373,
        0.768627
      ],
      "hex": "#006ec4"
    },
    "sourcePath": "primitive.color.blue.620",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.431373,
        0.768627
      ],
      "alpha": 1
    }
  },
  "color-blue-700": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-blue-700": "color(srgb 0 0.372549 0.701961 / 1)",
      "--louis-color-blue-700-rgb": "0 95 179"
    },
    "deprecated": null,
    "description": null,
    "id": "color-blue-700",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.372549,
        0.701961
      ],
      "hex": "#005fb3"
    },
    "sourcePath": "primitive.color.blue.700",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.372549,
        0.701961
      ],
      "alpha": 1
    }
  },
  "color-blue-800": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-blue-800": "color(srgb 0 0.286275 0.541176 / 1)",
      "--louis-color-blue-800-rgb": "0 73 138"
    },
    "deprecated": null,
    "description": null,
    "id": "color-blue-800",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.286275,
        0.541176
      ],
      "hex": "#00498a"
    },
    "sourcePath": "primitive.color.blue.800",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.286275,
        0.541176
      ],
      "alpha": 1
    }
  },
  "color-blue-900": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-blue-900": "color(srgb 0 0.203922 0.380392 / 1)",
      "--louis-color-blue-900-rgb": "0 52 97"
    },
    "deprecated": null,
    "description": null,
    "id": "color-blue-900",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.203922,
        0.380392
      ],
      "hex": "#003461"
    },
    "sourcePath": "primitive.color.blue.900",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.203922,
        0.380392
      ],
      "alpha": 1
    }
  },
  "color-green-100": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-green-100": "color(srgb 0.898039 1 0.968627 / 1)",
      "--louis-color-green-100-rgb": "229 255 247"
    },
    "deprecated": null,
    "description": null,
    "id": "color-green-100",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.898039,
        1,
        0.968627
      ],
      "hex": "#e5fff7"
    },
    "sourcePath": "primitive.color.green.100",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.898039,
        1,
        0.968627
      ],
      "alpha": 1
    }
  },
  "color-green-200": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-green-200": "color(srgb 0.721569 0.972549 0.898039 / 1)",
      "--louis-color-green-200-rgb": "184 248 229"
    },
    "deprecated": null,
    "description": null,
    "id": "color-green-200",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.721569,
        0.972549,
        0.898039
      ],
      "hex": "#b8f8e5"
    },
    "sourcePath": "primitive.color.green.200",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.721569,
        0.972549,
        0.898039
      ],
      "alpha": 1
    }
  },
  "color-green-300": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-green-300": "color(srgb 0.47451 0.92549 0.8 / 1)",
      "--louis-color-green-300-rgb": "121 236 204"
    },
    "deprecated": null,
    "description": null,
    "id": "color-green-300",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.47451,
        0.92549,
        0.8
      ],
      "hex": "#79eccc"
    },
    "sourcePath": "primitive.color.green.300",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.47451,
        0.92549,
        0.8
      ],
      "alpha": 1
    }
  },
  "color-green-400": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-green-400": "color(srgb 0.156863 0.85098 0.647059 / 1)",
      "--louis-color-green-400-rgb": "40 217 165"
    },
    "deprecated": null,
    "description": null,
    "id": "color-green-400",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.156863,
        0.85098,
        0.647059
      ],
      "hex": "#28d9a5"
    },
    "sourcePath": "primitive.color.green.400",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.156863,
        0.85098,
        0.647059
      ],
      "alpha": 1
    }
  },
  "color-green-500": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-green-500": "color(srgb 0 0.776471 0.556863 / 1)",
      "--louis-color-green-500-rgb": "0 198 142"
    },
    "deprecated": null,
    "description": null,
    "id": "color-green-500",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.776471,
        0.556863
      ],
      "alpha": 1,
      "hex": "#00c68e"
    },
    "sourcePath": "primitive.color.green.500",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.776471,
        0.556863
      ],
      "alpha": 1
    }
  },
  "color-green-500-alpha-08": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-green-500-alpha-08": "color(srgb 0 0.776471 0.556863 / 0.08)",
      "--louis-color-green-500-alpha-08-rgb": "0 198 142"
    },
    "deprecated": null,
    "description": null,
    "id": "color-green-500-alpha-08",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.776471,
        0.556863
      ],
      "alpha": 0.08,
      "hex": "#00c68e"
    },
    "sourcePath": "primitive.color.green-500-alpha.08",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.776471,
        0.556863
      ],
      "alpha": 0.08
    }
  },
  "color-green-600": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-green-600": "color(srgb 0 0.701961 0.498039 / 1)",
      "--louis-color-green-600-rgb": "0 179 127"
    },
    "deprecated": null,
    "description": null,
    "id": "color-green-600",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.701961,
        0.498039
      ],
      "hex": "#00b37f"
    },
    "sourcePath": "primitive.color.green.600",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.701961,
        0.498039
      ],
      "alpha": 1
    }
  },
  "color-green-700": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-green-700": "color(srgb 0 0.560784 0.403922 / 1)",
      "--louis-color-green-700-rgb": "0 143 103"
    },
    "deprecated": null,
    "description": null,
    "id": "color-green-700",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.560784,
        0.403922
      ],
      "hex": "#008f67"
    },
    "sourcePath": "primitive.color.green.700",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.560784,
        0.403922
      ],
      "alpha": 1
    }
  },
  "color-green-800": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-green-800": "color(srgb 0 0.431373 0.317647 / 1)",
      "--louis-color-green-800-rgb": "0 110 81"
    },
    "deprecated": null,
    "description": null,
    "id": "color-green-800",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.431373,
        0.317647
      ],
      "hex": "#006e51"
    },
    "sourcePath": "primitive.color.green.800",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.431373,
        0.317647
      ],
      "alpha": 1
    }
  },
  "color-green-900": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-green-900": "color(srgb 0 0.298039 0.223529 / 1)",
      "--louis-color-green-900-rgb": "0 76 57"
    },
    "deprecated": null,
    "description": null,
    "id": "color-green-900",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.298039,
        0.223529
      ],
      "hex": "#004c39"
    },
    "sourcePath": "primitive.color.green.900",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0,
        0.298039,
        0.223529
      ],
      "alpha": 1
    }
  },
  "color-palette-gray-000": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-palette-gray-000": "color(srgb 0.980392 0.980392 0.980392 / 1)",
      "--louis-color-palette-gray-000-rgb": "250 250 250"
    },
    "deprecated": null,
    "description": null,
    "id": "color-palette-gray-000",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.palette-gray.000",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 1
    }
  },
  "color-palette-gray-025": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-palette-gray-025": "color(srgb 0.94902 0.952941 0.960784 / 1)",
      "--louis-color-palette-gray-025-rgb": "242 243 245"
    },
    "deprecated": null,
    "description": null,
    "id": "color-palette-gray-025",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.94902,
        0.952941,
        0.960784
      ],
      "hex": "#f2f3f5"
    },
    "sourcePath": "primitive.color.palette-gray.025",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.94902,
        0.952941,
        0.960784
      ],
      "alpha": 1
    }
  },
  "color-palette-gray-050": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-palette-gray-050": "color(srgb 0.921569 0.92549 0.933333 / 1)",
      "--louis-color-palette-gray-050-rgb": "235 236 238"
    },
    "deprecated": null,
    "description": null,
    "id": "color-palette-gray-050",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.921569,
        0.92549,
        0.933333
      ],
      "hex": "#ebecee"
    },
    "sourcePath": "primitive.color.palette-gray.050",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.921569,
        0.92549,
        0.933333
      ],
      "alpha": 1
    }
  },
  "color-palette-gray-100": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-palette-gray-100": "color(srgb 0.862745 0.870588 0.882353 / 1)",
      "--louis-color-palette-gray-100-rgb": "220 222 225"
    },
    "deprecated": null,
    "description": null,
    "id": "color-palette-gray-100",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.862745,
        0.870588,
        0.882353
      ],
      "hex": "#dcdee1"
    },
    "sourcePath": "primitive.color.palette-gray.100",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.862745,
        0.870588,
        0.882353
      ],
      "alpha": 1
    }
  },
  "color-palette-gray-150": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-palette-gray-150": "color(srgb 0.807843 0.815686 0.831373 / 1)",
      "--louis-color-palette-gray-150-rgb": "206 208 212"
    },
    "deprecated": null,
    "description": null,
    "id": "color-palette-gray-150",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.807843,
        0.815686,
        0.831373
      ],
      "hex": "#ced0d4"
    },
    "sourcePath": "primitive.color.palette-gray.150",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.807843,
        0.815686,
        0.831373
      ],
      "alpha": 1
    }
  },
  "color-palette-gray-200": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-palette-gray-200": "color(srgb 0.756863 0.764706 0.776471 / 1)",
      "--louis-color-palette-gray-200-rgb": "193 195 198"
    },
    "deprecated": null,
    "description": null,
    "id": "color-palette-gray-200",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.756863,
        0.764706,
        0.776471
      ],
      "hex": "#c1c3c6"
    },
    "sourcePath": "primitive.color.palette-gray.200",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.756863,
        0.764706,
        0.776471
      ],
      "alpha": 1
    }
  },
  "color-palette-gray-300": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-palette-gray-300": "color(srgb 0.647059 0.658824 0.678431 / 1)",
      "--louis-color-palette-gray-300-rgb": "165 168 173"
    },
    "deprecated": null,
    "description": null,
    "id": "color-palette-gray-300",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.647059,
        0.658824,
        0.678431
      ],
      "hex": "#a5a8ad"
    },
    "sourcePath": "primitive.color.palette-gray.300",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.647059,
        0.658824,
        0.678431
      ],
      "alpha": 1
    }
  },
  "color-palette-gray-400": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-palette-gray-400": "color(srgb 0.545098 0.556863 0.576471 / 1)",
      "--louis-color-palette-gray-400-rgb": "139 142 147"
    },
    "deprecated": null,
    "description": null,
    "id": "color-palette-gray-400",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.545098,
        0.556863,
        0.576471
      ],
      "hex": "#8b8e93"
    },
    "sourcePath": "primitive.color.palette-gray.400",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.545098,
        0.556863,
        0.576471
      ],
      "alpha": 1
    }
  },
  "color-palette-gray-500": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-palette-gray-500": "color(srgb 0.447059 0.458824 0.482353 / 1)",
      "--louis-color-palette-gray-500-rgb": "114 117 123"
    },
    "deprecated": null,
    "description": null,
    "id": "color-palette-gray-500",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.447059,
        0.458824,
        0.482353
      ],
      "hex": "#72757b"
    },
    "sourcePath": "primitive.color.palette-gray.500",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.447059,
        0.458824,
        0.482353
      ],
      "alpha": 1
    }
  },
  "color-palette-gray-600": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-palette-gray-600": "color(srgb 0.345098 0.360784 0.388235 / 1)",
      "--louis-color-palette-gray-600-rgb": "88 92 99"
    },
    "deprecated": null,
    "description": null,
    "id": "color-palette-gray-600",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.345098,
        0.360784,
        0.388235
      ],
      "hex": "#585c63"
    },
    "sourcePath": "primitive.color.palette-gray.600",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.345098,
        0.360784,
        0.388235
      ],
      "alpha": 1
    }
  },
  "color-palette-gray-700": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-palette-gray-700": "color(srgb 0.254902 0.270588 0.298039 / 1)",
      "--louis-color-palette-gray-700-rgb": "65 69 76"
    },
    "deprecated": null,
    "description": null,
    "id": "color-palette-gray-700",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.254902,
        0.270588,
        0.298039
      ],
      "hex": "#41454c"
    },
    "sourcePath": "primitive.color.palette-gray.700",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.254902,
        0.270588,
        0.298039
      ],
      "alpha": 1
    }
  },
  "color-palette-gray-800": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-palette-gray-800": "color(srgb 0.168627 0.184314 0.211765 / 1)",
      "--louis-color-palette-gray-800-rgb": "43 47 54"
    },
    "deprecated": null,
    "description": null,
    "id": "color-palette-gray-800",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.168627,
        0.184314,
        0.211765
      ],
      "hex": "#2b2f36"
    },
    "sourcePath": "primitive.color.palette-gray.800",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.168627,
        0.184314,
        0.211765
      ],
      "alpha": 1
    }
  },
  "color-palette-gray-850": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-palette-gray-850": "color(srgb 0.129412 0.145098 0.176471 / 1)",
      "--louis-color-palette-gray-850-rgb": "33 37 45"
    },
    "deprecated": null,
    "description": null,
    "id": "color-palette-gray-850",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.129412,
        0.145098,
        0.176471
      ],
      "hex": "#21252d"
    },
    "sourcePath": "primitive.color.palette-gray.850",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.129412,
        0.145098,
        0.176471
      ],
      "alpha": 1
    }
  },
  "color-palette-gray-900": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-palette-gray-900": "color(srgb 0.090196 0.105882 0.133333 / 1)",
      "--louis-color-palette-gray-900-rgb": "23 27 34"
    },
    "deprecated": null,
    "description": null,
    "id": "color-palette-gray-900",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.palette-gray.900",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 1
    }
  },
  "color-pink-100": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-pink-100": "color(srgb 1 0.898039 0.929412 / 1)",
      "--louis-color-pink-100-rgb": "255 229 237"
    },
    "deprecated": null,
    "description": null,
    "id": "color-pink-100",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.898039,
        0.929412
      ],
      "hex": "#ffe5ed"
    },
    "sourcePath": "primitive.color.pink.100",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.898039,
        0.929412
      ],
      "alpha": 1
    }
  },
  "color-pink-200": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-pink-200": "color(srgb 1 0.756863 0.839216 / 1)",
      "--louis-color-pink-200-rgb": "255 193 214"
    },
    "deprecated": null,
    "description": null,
    "id": "color-pink-200",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.756863,
        0.839216
      ],
      "hex": "#ffc1d6"
    },
    "sourcePath": "primitive.color.pink.200",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.756863,
        0.839216
      ],
      "alpha": 1
    }
  },
  "color-pink-300": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-pink-300": "color(srgb 1 0.607843 0.745098 / 1)",
      "--louis-color-pink-300-rgb": "255 155 190"
    },
    "deprecated": null,
    "description": null,
    "id": "color-pink-300",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.607843,
        0.745098
      ],
      "hex": "#ff9bbe"
    },
    "sourcePath": "primitive.color.pink.300",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.607843,
        0.745098
      ],
      "alpha": 1
    }
  },
  "color-pink-400": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-pink-400": "color(srgb 1 0.427451 0.615686 / 1)",
      "--louis-color-pink-400-rgb": "255 109 157"
    },
    "deprecated": null,
    "description": null,
    "id": "color-pink-400",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.427451,
        0.615686
      ],
      "hex": "#ff6d9d"
    },
    "sourcePath": "primitive.color.pink.400",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.427451,
        0.615686
      ],
      "alpha": 1
    }
  },
  "color-pink-500": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-pink-500": "color(srgb 1 0.301961 0.533333 / 1)",
      "--louis-color-pink-500-rgb": "255 77 136"
    },
    "deprecated": null,
    "description": null,
    "id": "color-pink-500",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.301961,
        0.533333
      ],
      "hex": "#ff4d88"
    },
    "sourcePath": "primitive.color.pink.500",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.301961,
        0.533333
      ],
      "alpha": 1
    }
  },
  "color-pink-600": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-pink-600": "color(srgb 0.886275 0.211765 0.443137 / 1)",
      "--louis-color-pink-600-rgb": "226 54 113"
    },
    "deprecated": null,
    "description": null,
    "id": "color-pink-600",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.886275,
        0.211765,
        0.443137
      ],
      "hex": "#e23671"
    },
    "sourcePath": "primitive.color.pink.600",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.886275,
        0.211765,
        0.443137
      ],
      "alpha": 1
    }
  },
  "color-pink-700": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-pink-700": "color(srgb 0.717647 0.141176 0.345098 / 1)",
      "--louis-color-pink-700-rgb": "183 36 88"
    },
    "deprecated": null,
    "description": null,
    "id": "color-pink-700",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.717647,
        0.141176,
        0.345098
      ],
      "hex": "#b72458"
    },
    "sourcePath": "primitive.color.pink.700",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.717647,
        0.141176,
        0.345098
      ],
      "alpha": 1
    }
  },
  "color-pink-800": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-pink-800": "color(srgb 0.517647 0.101961 0.247059 / 1)",
      "--louis-color-pink-800-rgb": "132 26 63"
    },
    "deprecated": null,
    "description": null,
    "id": "color-pink-800",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.517647,
        0.101961,
        0.247059
      ],
      "hex": "#841a3f"
    },
    "sourcePath": "primitive.color.pink.800",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.517647,
        0.101961,
        0.247059
      ],
      "alpha": 1
    }
  },
  "color-pink-900": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-pink-900": "color(srgb 0.329412 0.066667 0.164706 / 1)",
      "--louis-color-pink-900-rgb": "84 17 42"
    },
    "deprecated": null,
    "description": null,
    "id": "color-pink-900",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.329412,
        0.066667,
        0.164706
      ],
      "hex": "#54112a"
    },
    "sourcePath": "primitive.color.pink.900",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.329412,
        0.066667,
        0.164706
      ],
      "alpha": 1
    }
  },
  "color-red-100": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-red-100": "color(srgb 1 0.898039 0.909804 / 1)",
      "--louis-color-red-100-rgb": "255 229 232"
    },
    "deprecated": null,
    "description": null,
    "id": "color-red-100",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.898039,
        0.909804
      ],
      "hex": "#ffe5e8"
    },
    "sourcePath": "primitive.color.red.100",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.898039,
        0.909804
      ],
      "alpha": 1
    }
  },
  "color-red-200": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-red-200": "color(srgb 1 0.768627 0.792157 / 1)",
      "--louis-color-red-200-rgb": "255 196 202"
    },
    "deprecated": null,
    "description": null,
    "id": "color-red-200",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.768627,
        0.792157
      ],
      "hex": "#ffc4ca"
    },
    "sourcePath": "primitive.color.red.200",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.768627,
        0.792157
      ],
      "alpha": 1
    }
  },
  "color-red-300": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-red-300": "color(srgb 1 0.603922 0.643137 / 1)",
      "--louis-color-red-300-rgb": "255 154 164"
    },
    "deprecated": null,
    "description": null,
    "id": "color-red-300",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.603922,
        0.643137
      ],
      "hex": "#ff9aa4"
    },
    "sourcePath": "primitive.color.red.300",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.603922,
        0.643137
      ],
      "alpha": 1
    }
  },
  "color-red-400": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-red-400": "color(srgb 1 0.435294 0.486275 / 1)",
      "--louis-color-red-400-rgb": "255 111 124"
    },
    "deprecated": null,
    "description": null,
    "id": "color-red-400",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.435294,
        0.486275
      ],
      "hex": "#ff6f7c"
    },
    "sourcePath": "primitive.color.red.400",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.435294,
        0.486275
      ],
      "alpha": 1
    }
  },
  "color-red-500": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-red-500": "color(srgb 1 0.294118 0.34902 / 1)",
      "--louis-color-red-500-rgb": "255 75 89"
    },
    "deprecated": null,
    "description": null,
    "id": "color-red-500",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "hex": "#ff4b59"
    },
    "sourcePath": "primitive.color.red.500",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 1
    }
  },
  "color-red-600": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-red-600": "color(srgb 0.886275 0.211765 0.270588 / 1)",
      "--louis-color-red-600-rgb": "226 54 69"
    },
    "deprecated": null,
    "description": null,
    "id": "color-red-600",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.886275,
        0.211765,
        0.270588
      ],
      "hex": "#e23645"
    },
    "sourcePath": "primitive.color.red.600",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.886275,
        0.211765,
        0.270588
      ],
      "alpha": 1
    }
  },
  "color-red-700": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-red-700": "color(srgb 0.717647 0.141176 0.192157 / 1)",
      "--louis-color-red-700-rgb": "183 36 49"
    },
    "deprecated": null,
    "description": null,
    "id": "color-red-700",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.717647,
        0.141176,
        0.192157
      ],
      "hex": "#b72431"
    },
    "sourcePath": "primitive.color.red.700",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.717647,
        0.141176,
        0.192157
      ],
      "alpha": 1
    }
  },
  "color-red-800": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-red-800": "color(srgb 0.517647 0.101961 0.141176 / 1)",
      "--louis-color-red-800-rgb": "132 26 36"
    },
    "deprecated": null,
    "description": null,
    "id": "color-red-800",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.517647,
        0.101961,
        0.141176
      ],
      "hex": "#841a24"
    },
    "sourcePath": "primitive.color.red.800",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.517647,
        0.101961,
        0.141176
      ],
      "alpha": 1
    }
  },
  "color-red-900": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-red-900": "color(srgb 0.329412 0.066667 0.098039 / 1)",
      "--louis-color-red-900-rgb": "84 17 25"
    },
    "deprecated": null,
    "description": null,
    "id": "color-red-900",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.329412,
        0.066667,
        0.098039
      ],
      "hex": "#541119"
    },
    "sourcePath": "primitive.color.red.900",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.329412,
        0.066667,
        0.098039
      ],
      "alpha": 1
    }
  },
  "color-red-alpha-08": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-red-alpha-08": "color(srgb 1 0.294118 0.34902 / 0.08)",
      "--louis-color-red-alpha-08-rgb": "255 75 89"
    },
    "deprecated": null,
    "description": null,
    "id": "color-red-alpha-08",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 0.08,
      "hex": "#ff4b59"
    },
    "sourcePath": "primitive.color.red-alpha.08",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 0.08
    }
  },
  "color-red-alpha-12": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-red-alpha-12": "color(srgb 1 0.294118 0.34902 / 0.12)",
      "--louis-color-red-alpha-12-rgb": "255 75 89"
    },
    "deprecated": null,
    "description": null,
    "id": "color-red-alpha-12",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 0.12,
      "hex": "#ff4b59"
    },
    "sourcePath": "primitive.color.red-alpha.12",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 0.12
    }
  },
  "color-red-alpha-24": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-red-alpha-24": "color(srgb 1 0.294118 0.34902 / 0.24)",
      "--louis-color-red-alpha-24-rgb": "255 75 89"
    },
    "deprecated": null,
    "description": null,
    "id": "color-red-alpha-24",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 0.24,
      "hex": "#ff4b59"
    },
    "sourcePath": "primitive.color.red-alpha.24",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 0.24
    }
  },
  "color-static-black": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-black": "color(srgb 0 0 0 / 1)",
      "--louis-color-static-black-rgb": "0 0 0"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-black",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0,
        0,
        0
      ],
      "hex": "#000000"
    },
    "sourcePath": "primitive.color.static.black",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0,
        0,
        0
      ],
      "alpha": 1
    }
  },
  "color-static-black-alpha-04": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-black-alpha-04": "color(srgb 0.090196 0.105882 0.133333 / 0.04)",
      "--louis-color-static-black-alpha-04-rgb": "23 27 34"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-black-alpha-04",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.04,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.static-black-alpha.04",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.04
    }
  },
  "color-static-black-alpha-08": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-black-alpha-08": "color(srgb 0.090196 0.105882 0.133333 / 0.08)",
      "--louis-color-static-black-alpha-08-rgb": "23 27 34"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-black-alpha-08",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.08,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.static-black-alpha.08",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.08
    }
  },
  "color-static-black-alpha-12": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-black-alpha-12": "color(srgb 0.090196 0.105882 0.133333 / 0.12)",
      "--louis-color-static-black-alpha-12-rgb": "23 27 34"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-black-alpha-12",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.12,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.static-black-alpha.12",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.12
    }
  },
  "color-static-black-alpha-16": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-black-alpha-16": "color(srgb 0.090196 0.105882 0.133333 / 0.16)",
      "--louis-color-static-black-alpha-16-rgb": "23 27 34"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-black-alpha-16",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.16,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.static-black-alpha.16",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.16
    }
  },
  "color-static-black-alpha-20": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-black-alpha-20": "color(srgb 0.090196 0.105882 0.133333 / 0.2)",
      "--louis-color-static-black-alpha-20-rgb": "23 27 34"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-black-alpha-20",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.2,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.static-black-alpha.20",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.2
    }
  },
  "color-static-black-alpha-24": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-black-alpha-24": "color(srgb 0.090196 0.105882 0.133333 / 0.24)",
      "--louis-color-static-black-alpha-24-rgb": "23 27 34"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-black-alpha-24",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.24,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.static-black-alpha.24",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.24
    }
  },
  "color-static-black-alpha-28": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-black-alpha-28": "color(srgb 0.090196 0.105882 0.133333 / 0.28)",
      "--louis-color-static-black-alpha-28-rgb": "23 27 34"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-black-alpha-28",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.28,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.static-black-alpha.28",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.28
    }
  },
  "color-static-black-alpha-32": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-black-alpha-32": "color(srgb 0.090196 0.105882 0.133333 / 0.32)",
      "--louis-color-static-black-alpha-32-rgb": "23 27 34"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-black-alpha-32",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.32,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.static-black-alpha.32",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.32
    }
  },
  "color-static-black-alpha-40": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-black-alpha-40": "color(srgb 0.090196 0.105882 0.133333 / 0.4)",
      "--louis-color-static-black-alpha-40-rgb": "23 27 34"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-black-alpha-40",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.4,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.static-black-alpha.40",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.4
    }
  },
  "color-static-black-alpha-48": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-black-alpha-48": "color(srgb 0.090196 0.105882 0.133333 / 0.48)",
      "--louis-color-static-black-alpha-48-rgb": "23 27 34"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-black-alpha-48",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.48,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.static-black-alpha.48",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.48
    }
  },
  "color-static-black-alpha-56": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-black-alpha-56": "color(srgb 0.090196 0.105882 0.133333 / 0.56)",
      "--louis-color-static-black-alpha-56-rgb": "23 27 34"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-black-alpha-56",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.56,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.static-black-alpha.56",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.56
    }
  },
  "color-static-black-alpha-64": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-black-alpha-64": "color(srgb 0.090196 0.105882 0.133333 / 0.64)",
      "--louis-color-static-black-alpha-64-rgb": "23 27 34"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-black-alpha-64",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.64,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.static-black-alpha.64",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.64
    }
  },
  "color-static-black-alpha-72": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-black-alpha-72": "color(srgb 0.090196 0.105882 0.133333 / 0.72)",
      "--louis-color-static-black-alpha-72-rgb": "23 27 34"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-black-alpha-72",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.72,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.static-black-alpha.72",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.72
    }
  },
  "color-static-black-alpha-80": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-black-alpha-80": "color(srgb 0.090196 0.105882 0.133333 / 0.8)",
      "--louis-color-static-black-alpha-80-rgb": "23 27 34"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-black-alpha-80",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.8,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.static-black-alpha.80",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.8
    }
  },
  "color-static-black-alpha-88": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-black-alpha-88": "color(srgb 0.090196 0.105882 0.133333 / 0.88)",
      "--louis-color-static-black-alpha-88-rgb": "23 27 34"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-black-alpha-88",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.88,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.static-black-alpha.88",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.88
    }
  },
  "color-static-black-alpha-96": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-black-alpha-96": "color(srgb 0.090196 0.105882 0.133333 / 0.96)",
      "--louis-color-static-black-alpha-96-rgb": "23 27 34"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-black-alpha-96",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.96,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.static-black-alpha.96",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.96
    }
  },
  "color-static-white": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-white": "color(srgb 1 1 1 / 1)",
      "--louis-color-static-white-rgb": "255 255 255"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-white",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        1,
        1
      ],
      "hex": "#ffffff"
    },
    "sourcePath": "primitive.color.static.white",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        1,
        1
      ],
      "alpha": 1
    }
  },
  "color-static-white-alpha-04": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-white-alpha-04": "color(srgb 0.980392 0.980392 0.980392 / 0.04)",
      "--louis-color-static-white-alpha-04-rgb": "250 250 250"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-white-alpha-04",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.04,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.static-white-alpha.04",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.04
    }
  },
  "color-static-white-alpha-08": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-white-alpha-08": "color(srgb 0.980392 0.980392 0.980392 / 0.08)",
      "--louis-color-static-white-alpha-08-rgb": "250 250 250"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-white-alpha-08",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.08,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.static-white-alpha.08",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.08
    }
  },
  "color-static-white-alpha-12": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-white-alpha-12": "color(srgb 0.980392 0.980392 0.980392 / 0.12)",
      "--louis-color-static-white-alpha-12-rgb": "250 250 250"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-white-alpha-12",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.12,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.static-white-alpha.12",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.12
    }
  },
  "color-static-white-alpha-16": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-white-alpha-16": "color(srgb 0.980392 0.980392 0.980392 / 0.16)",
      "--louis-color-static-white-alpha-16-rgb": "250 250 250"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-white-alpha-16",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.16,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.static-white-alpha.16",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.16
    }
  },
  "color-static-white-alpha-20": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-white-alpha-20": "color(srgb 0.980392 0.980392 0.980392 / 0.2)",
      "--louis-color-static-white-alpha-20-rgb": "250 250 250"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-white-alpha-20",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.2,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.static-white-alpha.20",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.2
    }
  },
  "color-static-white-alpha-24": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-white-alpha-24": "color(srgb 0.980392 0.980392 0.980392 / 0.24)",
      "--louis-color-static-white-alpha-24-rgb": "250 250 250"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-white-alpha-24",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.24,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.static-white-alpha.24",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.24
    }
  },
  "color-static-white-alpha-28": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-white-alpha-28": "color(srgb 0.980392 0.980392 0.980392 / 0.28)",
      "--louis-color-static-white-alpha-28-rgb": "250 250 250"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-white-alpha-28",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.28,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.static-white-alpha.28",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.28
    }
  },
  "color-static-white-alpha-32": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-white-alpha-32": "color(srgb 0.980392 0.980392 0.980392 / 0.32)",
      "--louis-color-static-white-alpha-32-rgb": "250 250 250"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-white-alpha-32",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.32,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.static-white-alpha.32",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.32
    }
  },
  "color-static-white-alpha-40": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-white-alpha-40": "color(srgb 0.980392 0.980392 0.980392 / 0.4)",
      "--louis-color-static-white-alpha-40-rgb": "250 250 250"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-white-alpha-40",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.4,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.static-white-alpha.40",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.4
    }
  },
  "color-static-white-alpha-48": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-white-alpha-48": "color(srgb 0.980392 0.980392 0.980392 / 0.48)",
      "--louis-color-static-white-alpha-48-rgb": "250 250 250"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-white-alpha-48",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.48,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.static-white-alpha.48",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.48
    }
  },
  "color-static-white-alpha-56": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-white-alpha-56": "color(srgb 0.980392 0.980392 0.980392 / 0.56)",
      "--louis-color-static-white-alpha-56-rgb": "250 250 250"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-white-alpha-56",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.56,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.static-white-alpha.56",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.56
    }
  },
  "color-static-white-alpha-64": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-white-alpha-64": "color(srgb 0.980392 0.980392 0.980392 / 0.64)",
      "--louis-color-static-white-alpha-64-rgb": "250 250 250"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-white-alpha-64",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.64,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.static-white-alpha.64",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.64
    }
  },
  "color-static-white-alpha-72": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-white-alpha-72": "color(srgb 0.980392 0.980392 0.980392 / 0.72)",
      "--louis-color-static-white-alpha-72-rgb": "250 250 250"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-white-alpha-72",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.72,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.static-white-alpha.72",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.72
    }
  },
  "color-static-white-alpha-80": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-white-alpha-80": "color(srgb 0.980392 0.980392 0.980392 / 0.8)",
      "--louis-color-static-white-alpha-80-rgb": "250 250 250"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-white-alpha-80",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.8,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.static-white-alpha.80",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.8
    }
  },
  "color-static-white-alpha-88": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-white-alpha-88": "color(srgb 0.980392 0.980392 0.980392 / 0.88)",
      "--louis-color-static-white-alpha-88-rgb": "250 250 250"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-white-alpha-88",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.88,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.static-white-alpha.88",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.88
    }
  },
  "color-static-white-alpha-96": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-static-white-alpha-96": "color(srgb 0.980392 0.980392 0.980392 / 0.96)",
      "--louis-color-static-white-alpha-96-rgb": "250 250 250"
    },
    "deprecated": null,
    "description": null,
    "id": "color-static-white-alpha-96",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.96,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.static-white-alpha.96",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.96
    }
  },
  "color-violet-100": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-violet-100": "color(srgb 0.921569 0.909804 1 / 1)",
      "--louis-color-violet-100-rgb": "235 232 255"
    },
    "deprecated": null,
    "description": null,
    "id": "color-violet-100",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.921569,
        0.909804,
        1
      ],
      "hex": "#ebe8ff"
    },
    "sourcePath": "primitive.color.violet.100",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.921569,
        0.909804,
        1
      ],
      "alpha": 1
    }
  },
  "color-violet-200": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-violet-200": "color(srgb 0.788235 0.760784 1 / 1)",
      "--louis-color-violet-200-rgb": "201 194 255"
    },
    "deprecated": null,
    "description": null,
    "id": "color-violet-200",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.788235,
        0.760784,
        1
      ],
      "hex": "#c9c2ff"
    },
    "sourcePath": "primitive.color.violet.200",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.788235,
        0.760784,
        1
      ],
      "alpha": 1
    }
  },
  "color-violet-300": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-violet-300": "color(srgb 0.615686 0.568627 1 / 1)",
      "--louis-color-violet-300-rgb": "157 145 255"
    },
    "deprecated": null,
    "description": null,
    "id": "color-violet-300",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.615686,
        0.568627,
        1
      ],
      "hex": "#9d91ff"
    },
    "sourcePath": "primitive.color.violet.300",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.615686,
        0.568627,
        1
      ],
      "alpha": 1
    }
  },
  "color-violet-400": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-violet-400": "color(srgb 0.517647 0.470588 1 / 1)",
      "--louis-color-violet-400-rgb": "132 120 255"
    },
    "deprecated": null,
    "description": null,
    "id": "color-violet-400",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.517647,
        0.470588,
        1
      ],
      "hex": "#8478ff"
    },
    "sourcePath": "primitive.color.violet.400",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.517647,
        0.470588,
        1
      ],
      "alpha": 1
    }
  },
  "color-violet-500": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-violet-500": "color(srgb 0.376471 0.333333 1 / 1)",
      "--louis-color-violet-500-rgb": "96 85 255"
    },
    "deprecated": null,
    "description": null,
    "id": "color-violet-500",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.376471,
        0.333333,
        1
      ],
      "hex": "#6055ff"
    },
    "sourcePath": "primitive.color.violet.500",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.376471,
        0.333333,
        1
      ],
      "alpha": 1
    }
  },
  "color-violet-600": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-violet-600": "color(srgb 0.309804 0.270588 0.890196 / 1)",
      "--louis-color-violet-600-rgb": "79 69 227"
    },
    "deprecated": null,
    "description": null,
    "id": "color-violet-600",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.309804,
        0.270588,
        0.890196
      ],
      "hex": "#4f45e3"
    },
    "sourcePath": "primitive.color.violet.600",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.309804,
        0.270588,
        0.890196
      ],
      "alpha": 1
    }
  },
  "color-violet-700": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-violet-700": "color(srgb 0.207843 0.156863 0.721569 / 1)",
      "--louis-color-violet-700-rgb": "53 40 184"
    },
    "deprecated": null,
    "description": null,
    "id": "color-violet-700",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.207843,
        0.156863,
        0.721569
      ],
      "hex": "#3528b8"
    },
    "sourcePath": "primitive.color.violet.700",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.207843,
        0.156863,
        0.721569
      ],
      "alpha": 1
    }
  },
  "color-violet-800": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-violet-800": "color(srgb 0.133333 0.101961 0.501961 / 1)",
      "--louis-color-violet-800-rgb": "34 26 128"
    },
    "deprecated": null,
    "description": null,
    "id": "color-violet-800",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.133333,
        0.101961,
        0.501961
      ],
      "hex": "#221a80"
    },
    "sourcePath": "primitive.color.violet.800",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.133333,
        0.101961,
        0.501961
      ],
      "alpha": 1
    }
  },
  "color-violet-900": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-violet-900": "color(srgb 0.082353 0.062745 0.301961 / 1)",
      "--louis-color-violet-900-rgb": "21 16 77"
    },
    "deprecated": null,
    "description": null,
    "id": "color-violet-900",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.082353,
        0.062745,
        0.301961
      ],
      "hex": "#15104d"
    },
    "sourcePath": "primitive.color.violet.900",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.082353,
        0.062745,
        0.301961
      ],
      "alpha": 1
    }
  },
  "color-yellow-100": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-yellow-100": "color(srgb 1 0.960784 0.839216 / 1)",
      "--louis-color-yellow-100-rgb": "255 245 214"
    },
    "deprecated": null,
    "description": null,
    "id": "color-yellow-100",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.960784,
        0.839216
      ],
      "hex": "#fff5d6"
    },
    "sourcePath": "primitive.color.yellow.100",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.960784,
        0.839216
      ],
      "alpha": 1
    }
  },
  "color-yellow-200": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-yellow-200": "color(srgb 1 0.909804 0.639216 / 1)",
      "--louis-color-yellow-200-rgb": "255 232 163"
    },
    "deprecated": null,
    "description": null,
    "id": "color-yellow-200",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.909804,
        0.639216
      ],
      "hex": "#ffe8a3"
    },
    "sourcePath": "primitive.color.yellow.200",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.909804,
        0.639216
      ],
      "alpha": 1
    }
  },
  "color-yellow-300": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-yellow-300": "color(srgb 1 0.85098 0.501961 / 1)",
      "--louis-color-yellow-300-rgb": "255 217 128"
    },
    "deprecated": null,
    "description": null,
    "id": "color-yellow-300",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.85098,
        0.501961
      ],
      "hex": "#ffd980"
    },
    "sourcePath": "primitive.color.yellow.300",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.85098,
        0.501961
      ],
      "alpha": 1
    }
  },
  "color-yellow-400": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-yellow-400": "color(srgb 1 0.760784 0.2 / 1)",
      "--louis-color-yellow-400-rgb": "255 194 51"
    },
    "deprecated": null,
    "description": null,
    "id": "color-yellow-400",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.760784,
        0.2
      ],
      "hex": "#ffc233"
    },
    "sourcePath": "primitive.color.yellow.400",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.760784,
        0.2
      ],
      "alpha": 1
    }
  },
  "color-yellow-500": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-yellow-500": "color(srgb 1 0.698039 0 / 1)",
      "--louis-color-yellow-500-rgb": "255 178 0"
    },
    "deprecated": null,
    "description": null,
    "id": "color-yellow-500",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.698039,
        0
      ],
      "hex": "#ffb200"
    },
    "sourcePath": "primitive.color.yellow.500",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.698039,
        0
      ],
      "alpha": 1
    }
  },
  "color-yellow-600": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-yellow-600": "color(srgb 0.894118 0.603922 0 / 1)",
      "--louis-color-yellow-600-rgb": "228 154 0"
    },
    "deprecated": null,
    "description": null,
    "id": "color-yellow-600",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.894118,
        0.603922,
        0
      ],
      "hex": "#e49a00"
    },
    "sourcePath": "primitive.color.yellow.600",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.894118,
        0.603922,
        0
      ],
      "alpha": 1
    }
  },
  "color-yellow-700": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-yellow-700": "color(srgb 0.721569 0.462745 0 / 1)",
      "--louis-color-yellow-700-rgb": "184 118 0"
    },
    "deprecated": null,
    "description": null,
    "id": "color-yellow-700",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.721569,
        0.462745,
        0
      ],
      "hex": "#b87600"
    },
    "sourcePath": "primitive.color.yellow.700",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.721569,
        0.462745,
        0
      ],
      "alpha": 1
    }
  },
  "color-yellow-800": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-yellow-800": "color(srgb 0.478431 0.321569 0 / 1)",
      "--louis-color-yellow-800-rgb": "122 82 0"
    },
    "deprecated": null,
    "description": null,
    "id": "color-yellow-800",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.478431,
        0.321569,
        0
      ],
      "hex": "#7a5200"
    },
    "sourcePath": "primitive.color.yellow.800",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.478431,
        0.321569,
        0
      ],
      "alpha": 1
    }
  },
  "color-yellow-900": {
    "aliasTarget": null,
    "cssProperties": {
      "--louis-color-yellow-900": "color(srgb 0.298039 0.2 0 / 1)",
      "--louis-color-yellow-900-rgb": "76 51 0"
    },
    "deprecated": null,
    "description": null,
    "id": "color-yellow-900",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.298039,
        0.2,
        0
      ],
      "hex": "#4c3300"
    },
    "sourcePath": "primitive.color.yellow.900",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.298039,
        0.2,
        0
      ],
      "alpha": 1
    }
  },
  "duration-fast": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "duration-fast",
    "mode": "base",
    "rawValue": {
      "value": 120,
      "unit": "ms"
    },
    "sourcePath": "primitive.duration.fast",
    "tier": "primitive",
    "type": "duration",
    "value": {
      "value": 120,
      "unit": "ms"
    }
  },
  "duration-instant": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "duration-instant",
    "mode": "base",
    "rawValue": {
      "value": 0,
      "unit": "ms"
    },
    "sourcePath": "primitive.duration.instant",
    "tier": "primitive",
    "type": "duration",
    "value": {
      "value": 0,
      "unit": "ms"
    }
  },
  "duration-normal": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "duration-normal",
    "mode": "base",
    "rawValue": {
      "value": 200,
      "unit": "ms"
    },
    "sourcePath": "primitive.duration.normal",
    "tier": "primitive",
    "type": "duration",
    "value": {
      "value": 200,
      "unit": "ms"
    }
  },
  "duration-slow": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "duration-slow",
    "mode": "base",
    "rawValue": {
      "value": 320,
      "unit": "ms"
    },
    "sourcePath": "primitive.duration.slow",
    "tier": "primitive",
    "type": "duration",
    "value": {
      "value": 320,
      "unit": "ms"
    }
  },
  "easing-enter": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "easing-enter",
    "mode": "base",
    "rawValue": [
      0.32,
      0.72,
      0,
      1
    ],
    "sourcePath": "primitive.easing.enter",
    "tier": "primitive",
    "type": "cubicBezier",
    "value": [
      0.32,
      0.72,
      0,
      1
    ]
  },
  "easing-exit": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "easing-exit",
    "mode": "base",
    "rawValue": [
      0.4,
      0,
      1,
      1
    ],
    "sourcePath": "primitive.easing.exit",
    "tier": "primitive",
    "type": "cubicBezier",
    "value": [
      0.4,
      0,
      1,
      1
    ]
  },
  "easing-linear": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "easing-linear",
    "mode": "base",
    "rawValue": [
      0,
      0,
      1,
      1
    ],
    "sourcePath": "primitive.easing.linear",
    "tier": "primitive",
    "type": "cubicBezier",
    "value": [
      0,
      0,
      1,
      1
    ]
  },
  "easing-standard": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "easing-standard",
    "mode": "base",
    "rawValue": [
      0.2,
      0,
      0,
      1
    ],
    "sourcePath": "primitive.easing.standard",
    "tier": "primitive",
    "type": "cubicBezier",
    "value": [
      0.2,
      0,
      0,
      1
    ]
  },
  "font-family-mono": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "font-family-mono",
    "mode": "base",
    "rawValue": [
      "SFMono-Regular",
      "Consolas",
      "Liberation Mono",
      "monospace"
    ],
    "sourcePath": "primitive.font-family.mono",
    "tier": "primitive",
    "type": "fontFamily",
    "value": [
      "SFMono-Regular",
      "Consolas",
      "Liberation Mono",
      "monospace"
    ]
  },
  "font-family-sans": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "font-family-sans",
    "mode": "base",
    "rawValue": [
      "Pretendard Variable",
      "Pretendard",
      "Inter",
      "Noto Sans KR",
      "Noto Sans JP",
      "system-ui",
      "sans-serif"
    ],
    "sourcePath": "primitive.font-family.sans",
    "tier": "primitive",
    "type": "fontFamily",
    "value": [
      "Pretendard Variable",
      "Pretendard",
      "Inter",
      "Noto Sans KR",
      "Noto Sans JP",
      "system-ui",
      "sans-serif"
    ]
  },
  "font-size-body-lg": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "font-size-body-lg",
    "mode": "base",
    "rawValue": {
      "value": 20,
      "unit": "px"
    },
    "sourcePath": "primitive.font-size.body-lg",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 20,
      "unit": "px"
    }
  },
  "font-size-body-md": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "font-size-body-md",
    "mode": "base",
    "rawValue": {
      "value": 16,
      "unit": "px"
    },
    "sourcePath": "primitive.font-size.body-md",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 16,
      "unit": "px"
    }
  },
  "font-size-body-sm": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "font-size-body-sm",
    "mode": "base",
    "rawValue": {
      "value": 14,
      "unit": "px"
    },
    "sourcePath": "primitive.font-size.body-sm",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 14,
      "unit": "px"
    }
  },
  "font-size-caption": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "font-size-caption",
    "mode": "base",
    "rawValue": {
      "value": 12,
      "unit": "px"
    },
    "sourcePath": "primitive.font-size.caption",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 12,
      "unit": "px"
    }
  },
  "font-size-heading-lg": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "font-size-heading-lg",
    "mode": "base",
    "rawValue": {
      "value": 48,
      "unit": "px"
    },
    "sourcePath": "primitive.font-size.heading-lg",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 48,
      "unit": "px"
    }
  },
  "font-size-heading-md": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "font-size-heading-md",
    "mode": "base",
    "rawValue": {
      "value": 36,
      "unit": "px"
    },
    "sourcePath": "primitive.font-size.heading-md",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 36,
      "unit": "px"
    }
  },
  "font-size-heading-sm": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "font-size-heading-sm",
    "mode": "base",
    "rawValue": {
      "value": 28,
      "unit": "px"
    },
    "sourcePath": "primitive.font-size.heading-sm",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 28,
      "unit": "px"
    }
  },
  "font-weight-medium": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "font-weight-medium",
    "mode": "base",
    "rawValue": 500,
    "sourcePath": "primitive.font-weight.medium",
    "tier": "primitive",
    "type": "fontWeight",
    "value": 500
  },
  "font-weight-regular": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "font-weight-regular",
    "mode": "base",
    "rawValue": 400,
    "sourcePath": "primitive.font-weight.regular",
    "tier": "primitive",
    "type": "fontWeight",
    "value": 400
  },
  "font-weight-semibold": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "font-weight-semibold",
    "mode": "base",
    "rawValue": 600,
    "sourcePath": "primitive.font-weight.semibold",
    "tier": "primitive",
    "type": "fontWeight",
    "value": 600
  },
  "layer-base-content": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "layer-base-content",
    "mode": "base",
    "rawValue": 0,
    "sourcePath": "primitive.layer.content",
    "tier": "primitive",
    "type": "number",
    "value": 0
  },
  "layer-base-critical": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "layer-base-critical",
    "mode": "base",
    "rawValue": 400,
    "sourcePath": "primitive.layer.critical",
    "tier": "primitive",
    "type": "number",
    "value": 400
  },
  "layer-base-modal": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "layer-base-modal",
    "mode": "base",
    "rawValue": 300,
    "sourcePath": "primitive.layer.modal",
    "tier": "primitive",
    "type": "number",
    "value": 300
  },
  "layer-base-popover": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "layer-base-popover",
    "mode": "base",
    "rawValue": 200,
    "sourcePath": "primitive.layer.popover",
    "tier": "primitive",
    "type": "number",
    "value": 200
  },
  "layer-base-sticky": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "layer-base-sticky",
    "mode": "base",
    "rawValue": 100,
    "sourcePath": "primitive.layer.sticky",
    "tier": "primitive",
    "type": "number",
    "value": 100
  },
  "line-height-percent-120": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": "행간 120% — Figma 의 PERCENT 단위 값이다. CSS 비율로 쓰려면 100 으로 나눈다(1.2).",
    "id": "line-height-percent-120",
    "mode": "base",
    "rawValue": 120,
    "sourcePath": "primitive.line-height.percent-120",
    "tier": "primitive",
    "type": "number",
    "value": 120
  },
  "line-height-percent-135": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": "행간 135% — Figma 의 PERCENT 단위 값이다. CSS 비율로 쓰려면 100 으로 나눈다(1.35).",
    "id": "line-height-percent-135",
    "mode": "base",
    "rawValue": 135,
    "sourcePath": "primitive.line-height.percent-135",
    "tier": "primitive",
    "type": "number",
    "value": 135
  },
  "line-height-percent-150": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": "행간 150% — Figma 의 PERCENT 단위 값이다. CSS 비율로 쓰려면 100 으로 나눈다(1.5).",
    "id": "line-height-percent-150",
    "mode": "base",
    "rawValue": 150,
    "sourcePath": "primitive.line-height.percent-150",
    "tier": "primitive",
    "type": "number",
    "value": 150
  },
  "radius-0": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "radius-0",
    "mode": "base",
    "rawValue": {
      "value": 0,
      "unit": "px"
    },
    "sourcePath": "primitive.radius.0",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 0,
      "unit": "px"
    }
  },
  "radius-10": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "radius-10",
    "mode": "base",
    "rawValue": {
      "value": 10,
      "unit": "px"
    },
    "sourcePath": "primitive.radius.10",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 10,
      "unit": "px"
    }
  },
  "radius-12": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "radius-12",
    "mode": "base",
    "rawValue": {
      "value": 12,
      "unit": "px"
    },
    "sourcePath": "primitive.radius.12",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 12,
      "unit": "px"
    }
  },
  "radius-16": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "radius-16",
    "mode": "base",
    "rawValue": {
      "value": 16,
      "unit": "px"
    },
    "sourcePath": "primitive.radius.16",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 16,
      "unit": "px"
    }
  },
  "radius-2": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "radius-2",
    "mode": "base",
    "rawValue": {
      "value": 2,
      "unit": "px"
    },
    "sourcePath": "primitive.radius.2",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 2,
      "unit": "px"
    }
  },
  "radius-20": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "radius-20",
    "mode": "base",
    "rawValue": {
      "value": 20,
      "unit": "px"
    },
    "sourcePath": "primitive.radius.20",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 20,
      "unit": "px"
    }
  },
  "radius-24": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "radius-24",
    "mode": "base",
    "rawValue": {
      "value": 24,
      "unit": "px"
    },
    "sourcePath": "primitive.radius.24",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 24,
      "unit": "px"
    }
  },
  "radius-4": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "radius-4",
    "mode": "base",
    "rawValue": {
      "value": 4,
      "unit": "px"
    },
    "sourcePath": "primitive.radius.4",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 4,
      "unit": "px"
    }
  },
  "radius-6": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "radius-6",
    "mode": "base",
    "rawValue": {
      "value": 6,
      "unit": "px"
    },
    "sourcePath": "primitive.radius.6",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 6,
      "unit": "px"
    }
  },
  "radius-8": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "radius-8",
    "mode": "base",
    "rawValue": {
      "value": 8,
      "unit": "px"
    },
    "sourcePath": "primitive.radius.8",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 8,
      "unit": "px"
    }
  },
  "radius-full": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "radius-full",
    "mode": "base",
    "rawValue": {
      "value": 999,
      "unit": "px"
    },
    "sourcePath": "primitive.radius.full",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 999,
      "unit": "px"
    }
  },
  "scale-tooltip-rest": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "scale-tooltip-rest",
    "mode": "base",
    "rawValue": 0.97,
    "sourcePath": "primitive.scale.tooltip-rest",
    "tier": "primitive",
    "type": "number",
    "value": 0.97
  },
  "shadow-focus-ring": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "shadow-focus-ring",
    "mode": "base",
    "rawValue": {
      "color": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.533333,
          1
        ],
        "alpha": 0.42,
        "hex": "#0088ff"
      },
      "offsetX": {
        "value": 0,
        "unit": "px"
      },
      "offsetY": {
        "value": 0,
        "unit": "px"
      },
      "blur": {
        "value": 0,
        "unit": "px"
      },
      "spread": {
        "value": 3,
        "unit": "px"
      }
    },
    "sourcePath": "primitive.shadow.focus-ring",
    "tier": "primitive",
    "type": "shadow",
    "value": {
      "color": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.533333,
          1
        ],
        "alpha": 0.42
      },
      "offsetX": {
        "value": 0,
        "unit": "px"
      },
      "offsetY": {
        "value": 0,
        "unit": "px"
      },
      "blur": {
        "value": 0,
        "unit": "px"
      },
      "spread": {
        "value": 3,
        "unit": "px"
      },
      "inset": false
    }
  },
  "shadow-menu-dark": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "shadow-menu-dark",
    "mode": "base",
    "rawValue": [
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.48,
          "hex": "#000000"
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 12,
          "unit": "px"
        },
        "blur": {
          "value": 32,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        }
      }
    ],
    "sourcePath": "primitive.shadow.menu-dark",
    "tier": "primitive",
    "type": "shadow",
    "value": [
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.48
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 12,
          "unit": "px"
        },
        "blur": {
          "value": 32,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        },
        "inset": false
      }
    ]
  },
  "shadow-menu-light": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "shadow-menu-light",
    "mode": "base",
    "rawValue": [
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.24,
          "hex": "#000000"
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 12,
          "unit": "px"
        },
        "blur": {
          "value": 32,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        }
      }
    ],
    "sourcePath": "primitive.shadow.menu-light",
    "tier": "primitive",
    "type": "shadow",
    "value": [
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.24
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 12,
          "unit": "px"
        },
        "blur": {
          "value": 32,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        },
        "inset": false
      }
    ]
  },
  "shadow-modal": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "shadow-modal",
    "mode": "base",
    "rawValue": {
      "color": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 0.22,
        "hex": "#000000"
      },
      "offsetX": {
        "value": 0,
        "unit": "px"
      },
      "offsetY": {
        "value": 16,
        "unit": "px"
      },
      "blur": {
        "value": 48,
        "unit": "px"
      },
      "spread": {
        "value": -8,
        "unit": "px"
      }
    },
    "sourcePath": "primitive.shadow.modal",
    "tier": "primitive",
    "type": "shadow",
    "value": {
      "color": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 0.22
      },
      "offsetX": {
        "value": 0,
        "unit": "px"
      },
      "offsetY": {
        "value": 16,
        "unit": "px"
      },
      "blur": {
        "value": 48,
        "unit": "px"
      },
      "spread": {
        "value": -8,
        "unit": "px"
      },
      "inset": false
    }
  },
  "shadow-popover": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "shadow-popover",
    "mode": "base",
    "rawValue": {
      "color": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 0.14,
        "hex": "#000000"
      },
      "offsetX": {
        "value": 0,
        "unit": "px"
      },
      "offsetY": {
        "value": 8,
        "unit": "px"
      },
      "blur": {
        "value": 24,
        "unit": "px"
      },
      "spread": {
        "value": -4,
        "unit": "px"
      }
    },
    "sourcePath": "primitive.shadow.popover",
    "tier": "primitive",
    "type": "shadow",
    "value": {
      "color": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 0.14
      },
      "offsetX": {
        "value": 0,
        "unit": "px"
      },
      "offsetY": {
        "value": 8,
        "unit": "px"
      },
      "blur": {
        "value": 24,
        "unit": "px"
      },
      "spread": {
        "value": -4,
        "unit": "px"
      },
      "inset": false
    }
  },
  "shadow-surface": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "shadow-surface",
    "mode": "base",
    "rawValue": {
      "color": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 0.06,
        "hex": "#000000"
      },
      "offsetX": {
        "value": 0,
        "unit": "px"
      },
      "offsetY": {
        "value": 2,
        "unit": "px"
      },
      "blur": {
        "value": 8,
        "unit": "px"
      },
      "spread": {
        "value": 0,
        "unit": "px"
      }
    },
    "sourcePath": "primitive.shadow.surface",
    "tier": "primitive",
    "type": "shadow",
    "value": {
      "color": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 0.06
      },
      "offsetX": {
        "value": 0,
        "unit": "px"
      },
      "offsetY": {
        "value": 2,
        "unit": "px"
      },
      "blur": {
        "value": 8,
        "unit": "px"
      },
      "spread": {
        "value": 0,
        "unit": "px"
      },
      "inset": false
    }
  },
  "shadow-switch-thumb": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "shadow-switch-thumb",
    "mode": "base",
    "rawValue": {
      "color": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 0.2,
        "hex": "#000000"
      },
      "offsetX": {
        "value": 0,
        "unit": "px"
      },
      "offsetY": {
        "value": 1,
        "unit": "px"
      },
      "blur": {
        "value": 3,
        "unit": "px"
      },
      "spread": {
        "value": 0,
        "unit": "px"
      }
    },
    "sourcePath": "primitive.shadow.switch-thumb",
    "tier": "primitive",
    "type": "shadow",
    "value": {
      "color": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 0.2
      },
      "offsetX": {
        "value": 0,
        "unit": "px"
      },
      "offsetY": {
        "value": 1,
        "unit": "px"
      },
      "blur": {
        "value": 3,
        "unit": "px"
      },
      "spread": {
        "value": 0,
        "unit": "px"
      },
      "inset": false
    }
  },
  "shadow-toast": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "shadow-toast",
    "mode": "base",
    "rawValue": [
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.16,
          "hex": "#000000"
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 8,
          "unit": "px"
        },
        "blur": {
          "value": 20,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        }
      }
    ],
    "sourcePath": "primitive.shadow.toast",
    "tier": "primitive",
    "type": "shadow",
    "value": [
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.16
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 8,
          "unit": "px"
        },
        "blur": {
          "value": 20,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        },
        "inset": false
      }
    ]
  },
  "shadow-tooltip-dark": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "shadow-tooltip-dark",
    "mode": "base",
    "rawValue": {
      "color": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.12,
        "hex": "#171b22"
      },
      "offsetX": {
        "value": 0,
        "unit": "px"
      },
      "offsetY": {
        "value": 12,
        "unit": "px"
      },
      "blur": {
        "value": 24,
        "unit": "px"
      },
      "spread": {
        "value": 0,
        "unit": "px"
      }
    },
    "sourcePath": "primitive.shadow.tooltip-dark",
    "tier": "primitive",
    "type": "shadow",
    "value": {
      "color": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.12
      },
      "offsetX": {
        "value": 0,
        "unit": "px"
      },
      "offsetY": {
        "value": 12,
        "unit": "px"
      },
      "blur": {
        "value": 24,
        "unit": "px"
      },
      "spread": {
        "value": 0,
        "unit": "px"
      },
      "inset": false
    }
  },
  "shadow-tooltip-light": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "shadow-tooltip-light",
    "mode": "base",
    "rawValue": {
      "color": {
        "colorSpace": "srgb",
        "components": [
          0.466667,
          0.490196,
          0.537255
        ],
        "alpha": 0.12,
        "hex": "#777d89"
      },
      "offsetX": {
        "value": 0,
        "unit": "px"
      },
      "offsetY": {
        "value": 12,
        "unit": "px"
      },
      "blur": {
        "value": 24,
        "unit": "px"
      },
      "spread": {
        "value": 0,
        "unit": "px"
      }
    },
    "sourcePath": "primitive.shadow.tooltip-light",
    "tier": "primitive",
    "type": "shadow",
    "value": {
      "color": {
        "colorSpace": "srgb",
        "components": [
          0.466667,
          0.490196,
          0.537255
        ],
        "alpha": 0.12
      },
      "offsetX": {
        "value": 0,
        "unit": "px"
      },
      "offsetY": {
        "value": 12,
        "unit": "px"
      },
      "blur": {
        "value": 24,
        "unit": "px"
      },
      "spread": {
        "value": 0,
        "unit": "px"
      },
      "inset": false
    }
  },
  "shadow-upgrade-dark": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "shadow-upgrade-dark",
    "mode": "base",
    "rawValue": [
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.08,
          "hex": "#000000"
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 0,
          "unit": "px"
        },
        "blur": {
          "value": 0,
          "unit": "px"
        },
        "spread": {
          "value": 1,
          "unit": "px"
        },
        "inset": true
      },
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.12,
          "hex": "#000000"
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 1,
          "unit": "px"
        },
        "blur": {
          "value": 2,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        }
      }
    ],
    "sourcePath": "primitive.shadow.upgrade-dark",
    "tier": "primitive",
    "type": "shadow",
    "value": [
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.08
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 0,
          "unit": "px"
        },
        "blur": {
          "value": 0,
          "unit": "px"
        },
        "spread": {
          "value": 1,
          "unit": "px"
        },
        "inset": true
      },
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.12
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 1,
          "unit": "px"
        },
        "blur": {
          "value": 2,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        },
        "inset": false
      }
    ]
  },
  "shadow-upgrade-light": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "shadow-upgrade-light",
    "mode": "base",
    "rawValue": [
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0.980392,
            0.980392,
            0.980392
          ],
          "alpha": 0.08,
          "hex": "#fafafa"
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 0,
          "unit": "px"
        },
        "blur": {
          "value": 0,
          "unit": "px"
        },
        "spread": {
          "value": 1,
          "unit": "px"
        },
        "inset": true
      },
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.04,
          "hex": "#000000"
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 1,
          "unit": "px"
        },
        "blur": {
          "value": 2,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        }
      }
    ],
    "sourcePath": "primitive.shadow.upgrade-light",
    "tier": "primitive",
    "type": "shadow",
    "value": [
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0.980392,
            0.980392,
            0.980392
          ],
          "alpha": 0.08
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 0,
          "unit": "px"
        },
        "blur": {
          "value": 0,
          "unit": "px"
        },
        "spread": {
          "value": 1,
          "unit": "px"
        },
        "inset": true
      },
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.04
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 1,
          "unit": "px"
        },
        "blur": {
          "value": 2,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        },
        "inset": false
      }
    ]
  },
  "space-0": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-0",
    "mode": "base",
    "rawValue": {
      "value": 0,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.0",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 0,
      "unit": "px"
    }
  },
  "space-10": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-10",
    "mode": "base",
    "rawValue": {
      "value": 10,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.10",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 10,
      "unit": "px"
    }
  },
  "space-12": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-12",
    "mode": "base",
    "rawValue": {
      "value": 12,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.12",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 12,
      "unit": "px"
    }
  },
  "space-120": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-120",
    "mode": "base",
    "rawValue": {
      "value": 120,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.120",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 120,
      "unit": "px"
    }
  },
  "space-14": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-14",
    "mode": "base",
    "rawValue": {
      "value": 14,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.14",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 14,
      "unit": "px"
    }
  },
  "space-16": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-16",
    "mode": "base",
    "rawValue": {
      "value": 16,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.16",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 16,
      "unit": "px"
    }
  },
  "space-18": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-18",
    "mode": "base",
    "rawValue": {
      "value": 18,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.18",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 18,
      "unit": "px"
    }
  },
  "space-2": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-2",
    "mode": "base",
    "rawValue": {
      "value": 2,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.2",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 2,
      "unit": "px"
    }
  },
  "space-20": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-20",
    "mode": "base",
    "rawValue": {
      "value": 20,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.20",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 20,
      "unit": "px"
    }
  },
  "space-24": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-24",
    "mode": "base",
    "rawValue": {
      "value": 24,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.24",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 24,
      "unit": "px"
    }
  },
  "space-240": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-240",
    "mode": "base",
    "rawValue": {
      "value": 240,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.240",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 240,
      "unit": "px"
    }
  },
  "space-28": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-28",
    "mode": "base",
    "rawValue": {
      "value": 28,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.28",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 28,
      "unit": "px"
    }
  },
  "space-280": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-280",
    "mode": "base",
    "rawValue": {
      "value": 280,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.280",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 280,
      "unit": "px"
    }
  },
  "space-32": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-32",
    "mode": "base",
    "rawValue": {
      "value": 32,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.32",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 32,
      "unit": "px"
    }
  },
  "space-320": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-320",
    "mode": "base",
    "rawValue": {
      "value": 320,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.320",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 320,
      "unit": "px"
    }
  },
  "space-4": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-4",
    "mode": "base",
    "rawValue": {
      "value": 4,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.4",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 4,
      "unit": "px"
    }
  },
  "space-40": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-40",
    "mode": "base",
    "rawValue": {
      "value": 40,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.40",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 40,
      "unit": "px"
    }
  },
  "space-44": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-44",
    "mode": "base",
    "rawValue": {
      "value": 44,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.44",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 44,
      "unit": "px"
    }
  },
  "space-48": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-48",
    "mode": "base",
    "rawValue": {
      "value": 48,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.48",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 48,
      "unit": "px"
    }
  },
  "space-56": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-56",
    "mode": "base",
    "rawValue": {
      "value": 56,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.56",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 56,
      "unit": "px"
    }
  },
  "space-6": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-6",
    "mode": "base",
    "rawValue": {
      "value": 6,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.6",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 6,
      "unit": "px"
    }
  },
  "space-60": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-60",
    "mode": "base",
    "rawValue": {
      "value": 60,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.60",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 60,
      "unit": "px"
    }
  },
  "space-64": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-64",
    "mode": "base",
    "rawValue": {
      "value": 64,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.64",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 64,
      "unit": "px"
    }
  },
  "space-8": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-8",
    "mode": "base",
    "rawValue": {
      "value": 8,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.8",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 8,
      "unit": "px"
    }
  },
  "space-80": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-80",
    "mode": "base",
    "rawValue": {
      "value": 80,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.80",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 80,
      "unit": "px"
    }
  },
  "space-96": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-96",
    "mode": "base",
    "rawValue": {
      "value": 96,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.96",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 96,
      "unit": "px"
    }
  },
  "space-960": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "space-960",
    "mode": "base",
    "rawValue": {
      "value": 960,
      "unit": "px"
    },
    "sourcePath": "primitive.spacing.960",
    "tier": "primitive",
    "type": "dimension",
    "value": {
      "value": 960,
      "unit": "px"
    }
  },
  "transition-content-fade": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-content-fade",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 300,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.25,
        0.1,
        0.25,
        1
      ]
    },
    "sourcePath": "primitive.transition.content-fade",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 300,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.25,
        0.1,
        0.25,
        1
      ]
    }
  },
  "transition-content-rise": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-content-rise",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 360,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.22,
        1,
        0.36,
        1
      ]
    },
    "sourcePath": "primitive.transition.content-rise",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 360,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.22,
        1,
        0.36,
        1
      ]
    }
  },
  "transition-control-hover": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-control-hover",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 160,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.25,
        0.1,
        0.25,
        1
      ]
    },
    "sourcePath": "primitive.transition.control-hover",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 160,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.25,
        0.1,
        0.25,
        1
      ]
    }
  },
  "transition-crossfade-enter": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-crossfade-enter",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 420,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.25,
        0.1,
        0.25,
        1
      ]
    },
    "sourcePath": "primitive.transition.crossfade-enter",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 420,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.25,
        0.1,
        0.25,
        1
      ]
    }
  },
  "transition-layout-change": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-layout-change",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 220,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.4,
        0,
        0.2,
        1
      ]
    },
    "sourcePath": "primitive.transition.layout-change",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 220,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.4,
        0,
        0.2,
        1
      ]
    }
  },
  "transition-list-enter": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-list-enter",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 560,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.23,
        1,
        0.32,
        1
      ]
    },
    "sourcePath": "primitive.transition.list-enter",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 560,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.23,
        1,
        0.32,
        1
      ]
    }
  },
  "transition-list-stagger-step": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-list-stagger-step",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 560,
        "unit": "ms"
      },
      "delay": {
        "value": 36,
        "unit": "ms"
      },
      "timingFunction": [
        0.23,
        1,
        0.32,
        1
      ]
    },
    "sourcePath": "primitive.transition.list-stagger-step",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 560,
        "unit": "ms"
      },
      "delay": {
        "value": 36,
        "unit": "ms"
      },
      "timingFunction": [
        0.23,
        1,
        0.32,
        1
      ]
    }
  },
  "transition-menu-enter": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-menu-enter",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 260,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.32,
        0.72,
        0,
        1
      ]
    },
    "sourcePath": "primitive.transition.menu-enter",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 260,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.32,
        0.72,
        0,
        1
      ]
    }
  },
  "transition-menu-exit": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-menu-exit",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 130,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.42,
        0,
        1,
        1
      ]
    },
    "sourcePath": "primitive.transition.menu-exit",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 130,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.42,
        0,
        1,
        1
      ]
    }
  },
  "transition-modal-enter": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-modal-enter",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 320,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.32,
        0.72,
        0,
        1
      ]
    },
    "sourcePath": "primitive.transition.modal-enter",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 320,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.32,
        0.72,
        0,
        1
      ]
    }
  },
  "transition-modal-exit": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-modal-exit",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 200,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.4,
        0,
        1,
        1
      ]
    },
    "sourcePath": "primitive.transition.modal-exit",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 200,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.4,
        0,
        1,
        1
      ]
    }
  },
  "transition-overlay-enter": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-overlay-enter",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 200,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.32,
        0.72,
        0,
        1
      ]
    },
    "sourcePath": "primitive.transition.overlay-enter",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 200,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.32,
        0.72,
        0,
        1
      ]
    }
  },
  "transition-overlay-exit": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-overlay-exit",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 120,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.4,
        0,
        1,
        1
      ]
    },
    "sourcePath": "primitive.transition.overlay-exit",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 120,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.4,
        0,
        1,
        1
      ]
    }
  },
  "transition-reduced": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-reduced",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 0,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.2,
        0,
        0,
        1
      ]
    },
    "sourcePath": "primitive.transition.reduced",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 0,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.2,
        0,
        0,
        1
      ]
    }
  },
  "transition-reveal-enter": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-reveal-enter",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 720,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.19,
        1,
        0.22,
        1
      ]
    },
    "sourcePath": "primitive.transition.reveal-enter",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 720,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.19,
        1,
        0.22,
        1
      ]
    }
  },
  "transition-shell-collapse": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-shell-collapse",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 320,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.4,
        0,
        0.2,
        1
      ]
    },
    "sourcePath": "primitive.transition.shell-collapse",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 320,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.4,
        0,
        0.2,
        1
      ]
    }
  },
  "transition-shimmer": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-shimmer",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 1600,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.2,
        0,
        0,
        1
      ]
    },
    "sourcePath": "primitive.transition.shimmer",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 1600,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.2,
        0,
        0,
        1
      ]
    }
  },
  "transition-spin": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-spin",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 700,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0,
        0,
        1,
        1
      ]
    },
    "sourcePath": "primitive.transition.spin",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 700,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0,
        0,
        1,
        1
      ]
    }
  },
  "transition-stagger-1": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-stagger-1",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 360,
        "unit": "ms"
      },
      "delay": {
        "value": 40,
        "unit": "ms"
      },
      "timingFunction": [
        0.22,
        1,
        0.36,
        1
      ]
    },
    "sourcePath": "primitive.transition.stagger-1",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 360,
        "unit": "ms"
      },
      "delay": {
        "value": 40,
        "unit": "ms"
      },
      "timingFunction": [
        0.22,
        1,
        0.36,
        1
      ]
    }
  },
  "transition-stagger-2": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-stagger-2",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 360,
        "unit": "ms"
      },
      "delay": {
        "value": 80,
        "unit": "ms"
      },
      "timingFunction": [
        0.22,
        1,
        0.36,
        1
      ]
    },
    "sourcePath": "primitive.transition.stagger-2",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 360,
        "unit": "ms"
      },
      "delay": {
        "value": 80,
        "unit": "ms"
      },
      "timingFunction": [
        0.22,
        1,
        0.36,
        1
      ]
    }
  },
  "transition-stagger-3": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-stagger-3",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 360,
        "unit": "ms"
      },
      "delay": {
        "value": 150,
        "unit": "ms"
      },
      "timingFunction": [
        0.22,
        1,
        0.36,
        1
      ]
    },
    "sourcePath": "primitive.transition.stagger-3",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 360,
        "unit": "ms"
      },
      "delay": {
        "value": 150,
        "unit": "ms"
      },
      "timingFunction": [
        0.22,
        1,
        0.36,
        1
      ]
    }
  },
  "transition-tab-select": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-tab-select",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 200,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.25,
        0.1,
        0.25,
        1
      ]
    },
    "sourcePath": "primitive.transition.tab-select",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 200,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.25,
        0.1,
        0.25,
        1
      ]
    }
  },
  "transition-tooltip-enter": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-tooltip-enter",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 140,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.23,
        1,
        0.32,
        1
      ]
    },
    "sourcePath": "primitive.transition.tooltip-enter",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 140,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.23,
        1,
        0.32,
        1
      ]
    }
  },
  "transition-tooltip-exit": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-tooltip-exit",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 120,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.19,
        1,
        0.22,
        1
      ]
    },
    "sourcePath": "primitive.transition.tooltip-exit",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 120,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.19,
        1,
        0.22,
        1
      ]
    }
  },
  "transition-zoom-settle": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "transition-zoom-settle",
    "mode": "base",
    "rawValue": {
      "duration": {
        "value": 680,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.22,
        1,
        0.36,
        1
      ]
    },
    "sourcePath": "primitive.transition.zoom-settle",
    "tier": "primitive",
    "type": "transition",
    "value": {
      "duration": {
        "value": 680,
        "unit": "ms"
      },
      "delay": {
        "value": 0,
        "unit": "ms"
      },
      "timingFunction": [
        0.22,
        1,
        0.36,
        1
      ]
    }
  },
  "type-style-body-lg-medium": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "type-style-body-lg-medium",
    "mode": "base",
    "rawValue": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 20,
        "unit": "px"
      },
      "fontWeight": 500,
      "letterSpacing": {
        "value": -0.2,
        "unit": "px"
      },
      "lineHeight": 1.5
    },
    "sourcePath": "primitive.typography.body-lg-medium",
    "tier": "primitive",
    "type": "typography",
    "value": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 20,
        "unit": "px"
      },
      "fontWeight": 500,
      "letterSpacing": {
        "value": -0.2,
        "unit": "px"
      },
      "lineHeight": 1.5
    }
  },
  "type-style-body-lg-regular": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "type-style-body-lg-regular",
    "mode": "base",
    "rawValue": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 20,
        "unit": "px"
      },
      "fontWeight": 400,
      "letterSpacing": {
        "value": -0.2,
        "unit": "px"
      },
      "lineHeight": 1.5
    },
    "sourcePath": "primitive.typography.body-lg-regular",
    "tier": "primitive",
    "type": "typography",
    "value": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 20,
        "unit": "px"
      },
      "fontWeight": 400,
      "letterSpacing": {
        "value": -0.2,
        "unit": "px"
      },
      "lineHeight": 1.5
    }
  },
  "type-style-body-lg-semibold": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "type-style-body-lg-semibold",
    "mode": "base",
    "rawValue": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 20,
        "unit": "px"
      },
      "fontWeight": 600,
      "letterSpacing": {
        "value": -0.2,
        "unit": "px"
      },
      "lineHeight": 1.5
    },
    "sourcePath": "primitive.typography.body-lg-semibold",
    "tier": "primitive",
    "type": "typography",
    "value": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 20,
        "unit": "px"
      },
      "fontWeight": 600,
      "letterSpacing": {
        "value": -0.2,
        "unit": "px"
      },
      "lineHeight": 1.5
    }
  },
  "type-style-body-md-medium": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "type-style-body-md-medium",
    "mode": "base",
    "rawValue": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 16,
        "unit": "px"
      },
      "fontWeight": 500,
      "letterSpacing": {
        "value": -0.16,
        "unit": "px"
      },
      "lineHeight": 1.5
    },
    "sourcePath": "primitive.typography.body-md-medium",
    "tier": "primitive",
    "type": "typography",
    "value": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 16,
        "unit": "px"
      },
      "fontWeight": 500,
      "letterSpacing": {
        "value": -0.16,
        "unit": "px"
      },
      "lineHeight": 1.5
    }
  },
  "type-style-body-md-regular": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "type-style-body-md-regular",
    "mode": "base",
    "rawValue": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 16,
        "unit": "px"
      },
      "fontWeight": 400,
      "letterSpacing": {
        "value": -0.16,
        "unit": "px"
      },
      "lineHeight": 1.5
    },
    "sourcePath": "primitive.typography.body-md-regular",
    "tier": "primitive",
    "type": "typography",
    "value": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 16,
        "unit": "px"
      },
      "fontWeight": 400,
      "letterSpacing": {
        "value": -0.16,
        "unit": "px"
      },
      "lineHeight": 1.5
    }
  },
  "type-style-body-md-semibold": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "type-style-body-md-semibold",
    "mode": "base",
    "rawValue": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 16,
        "unit": "px"
      },
      "fontWeight": 600,
      "letterSpacing": {
        "value": -0.16,
        "unit": "px"
      },
      "lineHeight": 1.5
    },
    "sourcePath": "primitive.typography.body-md-semibold",
    "tier": "primitive",
    "type": "typography",
    "value": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 16,
        "unit": "px"
      },
      "fontWeight": 600,
      "letterSpacing": {
        "value": -0.16,
        "unit": "px"
      },
      "lineHeight": 1.5
    }
  },
  "type-style-body-sm-medium": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "type-style-body-sm-medium",
    "mode": "base",
    "rawValue": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 14,
        "unit": "px"
      },
      "fontWeight": 500,
      "letterSpacing": {
        "value": -0.14,
        "unit": "px"
      },
      "lineHeight": 1.5
    },
    "sourcePath": "primitive.typography.body-sm-medium",
    "tier": "primitive",
    "type": "typography",
    "value": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 14,
        "unit": "px"
      },
      "fontWeight": 500,
      "letterSpacing": {
        "value": -0.14,
        "unit": "px"
      },
      "lineHeight": 1.5
    }
  },
  "type-style-body-sm-regular": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "type-style-body-sm-regular",
    "mode": "base",
    "rawValue": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 14,
        "unit": "px"
      },
      "fontWeight": 400,
      "letterSpacing": {
        "value": -0.14,
        "unit": "px"
      },
      "lineHeight": 1.5
    },
    "sourcePath": "primitive.typography.body-sm-regular",
    "tier": "primitive",
    "type": "typography",
    "value": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 14,
        "unit": "px"
      },
      "fontWeight": 400,
      "letterSpacing": {
        "value": -0.14,
        "unit": "px"
      },
      "lineHeight": 1.5
    }
  },
  "type-style-body-sm-semibold": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "type-style-body-sm-semibold",
    "mode": "base",
    "rawValue": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 14,
        "unit": "px"
      },
      "fontWeight": 600,
      "letterSpacing": {
        "value": -0.14,
        "unit": "px"
      },
      "lineHeight": 1.5
    },
    "sourcePath": "primitive.typography.body-sm-semibold",
    "tier": "primitive",
    "type": "typography",
    "value": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 14,
        "unit": "px"
      },
      "fontWeight": 600,
      "letterSpacing": {
        "value": -0.14,
        "unit": "px"
      },
      "lineHeight": 1.5
    }
  },
  "type-style-caption-medium": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "type-style-caption-medium",
    "mode": "base",
    "rawValue": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 12,
        "unit": "px"
      },
      "fontWeight": 500,
      "letterSpacing": {
        "value": -0.12,
        "unit": "px"
      },
      "lineHeight": 1.5
    },
    "sourcePath": "primitive.typography.caption-medium",
    "tier": "primitive",
    "type": "typography",
    "value": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 12,
        "unit": "px"
      },
      "fontWeight": 500,
      "letterSpacing": {
        "value": -0.12,
        "unit": "px"
      },
      "lineHeight": 1.5
    }
  },
  "type-style-caption-regular": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "type-style-caption-regular",
    "mode": "base",
    "rawValue": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 12,
        "unit": "px"
      },
      "fontWeight": 400,
      "letterSpacing": {
        "value": -0.12,
        "unit": "px"
      },
      "lineHeight": 1.5
    },
    "sourcePath": "primitive.typography.caption-regular",
    "tier": "primitive",
    "type": "typography",
    "value": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 12,
        "unit": "px"
      },
      "fontWeight": 400,
      "letterSpacing": {
        "value": -0.12,
        "unit": "px"
      },
      "lineHeight": 1.5
    }
  },
  "type-style-caption-semibold": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "type-style-caption-semibold",
    "mode": "base",
    "rawValue": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 12,
        "unit": "px"
      },
      "fontWeight": 600,
      "letterSpacing": {
        "value": -0.12,
        "unit": "px"
      },
      "lineHeight": 1.5
    },
    "sourcePath": "primitive.typography.caption-semibold",
    "tier": "primitive",
    "type": "typography",
    "value": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 12,
        "unit": "px"
      },
      "fontWeight": 600,
      "letterSpacing": {
        "value": -0.12,
        "unit": "px"
      },
      "lineHeight": 1.5
    }
  },
  "type-style-heading-lg-medium": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "type-style-heading-lg-medium",
    "mode": "base",
    "rawValue": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 48,
        "unit": "px"
      },
      "fontWeight": 500,
      "letterSpacing": {
        "value": -0.96,
        "unit": "px"
      },
      "lineHeight": 1.35
    },
    "sourcePath": "primitive.typography.heading-lg-medium",
    "tier": "primitive",
    "type": "typography",
    "value": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 48,
        "unit": "px"
      },
      "fontWeight": 500,
      "letterSpacing": {
        "value": -0.96,
        "unit": "px"
      },
      "lineHeight": 1.35
    }
  },
  "type-style-heading-md-medium": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "type-style-heading-md-medium",
    "mode": "base",
    "rawValue": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 36,
        "unit": "px"
      },
      "fontWeight": 500,
      "letterSpacing": {
        "value": -0.72,
        "unit": "px"
      },
      "lineHeight": 1.35
    },
    "sourcePath": "primitive.typography.heading-md-medium",
    "tier": "primitive",
    "type": "typography",
    "value": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 36,
        "unit": "px"
      },
      "fontWeight": 500,
      "letterSpacing": {
        "value": -0.72,
        "unit": "px"
      },
      "lineHeight": 1.35
    }
  },
  "type-style-heading-md-semibold": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "type-style-heading-md-semibold",
    "mode": "base",
    "rawValue": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 36,
        "unit": "px"
      },
      "fontWeight": 600,
      "letterSpacing": {
        "value": -0.72,
        "unit": "px"
      },
      "lineHeight": 1.35
    },
    "sourcePath": "primitive.typography.heading-md-semibold",
    "tier": "primitive",
    "type": "typography",
    "value": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 36,
        "unit": "px"
      },
      "fontWeight": 600,
      "letterSpacing": {
        "value": -0.72,
        "unit": "px"
      },
      "lineHeight": 1.35
    }
  },
  "type-style-heading-sm-medium": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "type-style-heading-sm-medium",
    "mode": "base",
    "rawValue": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 28,
        "unit": "px"
      },
      "fontWeight": 500,
      "letterSpacing": {
        "value": -0.56,
        "unit": "px"
      },
      "lineHeight": 1.35
    },
    "sourcePath": "primitive.typography.heading-sm-medium",
    "tier": "primitive",
    "type": "typography",
    "value": {
      "fontFamily": [
        "Pretendard Variable",
        "Pretendard",
        "Inter",
        "Noto Sans KR",
        "Noto Sans JP",
        "system-ui",
        "sans-serif"
      ],
      "fontSize": {
        "value": 28,
        "unit": "px"
      },
      "fontWeight": 500,
      "letterSpacing": {
        "value": -0.56,
        "unit": "px"
      },
      "lineHeight": 1.35
    }
  }
};
export const tokens = {
  "global": {
    "app-gnb-main-card-padding-block-start": {
      "aliasTarget": {
        "id": "space-0",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-app-gnb-main-card-padding-block-start": "0px"
      },
      "deprecated": null,
      "description": null,
      "id": "app-gnb-main-card-padding-block-start",
      "mode": "global",
      "rawValue": "{primitive.spacing.0}",
      "sourcePath": "semantic.global.app.gnb-main-card-padding-block-start",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 0,
        "unit": "px"
      }
    },
    "app-gnb-main-inline-padding-end": {
      "aliasTarget": {
        "id": "space-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-app-gnb-main-inline-padding-end": "12px"
      },
      "deprecated": null,
      "description": null,
      "id": "app-gnb-main-inline-padding-end",
      "mode": "global",
      "rawValue": "{primitive.spacing.12}",
      "sourcePath": "semantic.global.app.gnb-main-inline-padding-end",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 12,
        "unit": "px"
      }
    },
    "app-gnb-rail-below-chrome-gap": {
      "aliasTarget": {
        "id": "space-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-app-gnb-rail-below-chrome-gap": "12px"
      },
      "deprecated": null,
      "description": null,
      "id": "app-gnb-rail-below-chrome-gap",
      "mode": "global",
      "rawValue": "{primitive.spacing.12}",
      "sourcePath": "semantic.global.app.gnb-rail-below-chrome-gap",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 12,
        "unit": "px"
      }
    },
    "app-gnb-rail-padding-bottom": {
      "aliasTarget": {
        "id": "space-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-app-gnb-rail-padding-bottom": "12px"
      },
      "deprecated": null,
      "description": null,
      "id": "app-gnb-rail-padding-bottom",
      "mode": "global",
      "rawValue": "{primitive.spacing.12}",
      "sourcePath": "semantic.global.app.gnb-rail-padding-bottom",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 12,
        "unit": "px"
      }
    },
    "app-gnb-sidebar-logo-h": {
      "aliasTarget": {
        "id": "space-28",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-app-gnb-sidebar-logo-h": "28px"
      },
      "deprecated": null,
      "description": null,
      "id": "app-gnb-sidebar-logo-h",
      "mode": "global",
      "rawValue": "{primitive.spacing.28}",
      "sourcePath": "semantic.global.app.gnb-sidebar-logo-h",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 28,
        "unit": "px"
      }
    },
    "app-gnb-sidebar-logo-symbol-w": {
      "aliasTarget": {
        "id": "space-28",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-app-gnb-sidebar-logo-symbol-w": "28px"
      },
      "deprecated": null,
      "description": null,
      "id": "app-gnb-sidebar-logo-symbol-w",
      "mode": "global",
      "rawValue": "{primitive.spacing.28}",
      "sourcePath": "semantic.global.app.gnb-sidebar-logo-symbol-w",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 28,
        "unit": "px"
      }
    },
    "app-gnb-sidebar-logo-wordmark-w": {
      "aliasTarget": {
        "id": "space-96",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-app-gnb-sidebar-logo-wordmark-w": "96px"
      },
      "deprecated": null,
      "description": null,
      "id": "app-gnb-sidebar-logo-wordmark-w",
      "mode": "global",
      "rawValue": "{primitive.spacing.96}",
      "sourcePath": "semantic.global.app.gnb-sidebar-logo-wordmark-w",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 96,
        "unit": "px"
      }
    },
    "app-shell-min-width": {
      "aliasTarget": {
        "id": "space-960",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-app-shell-min-width": "960px"
      },
      "deprecated": null,
      "description": null,
      "id": "app-shell-min-width",
      "mode": "global",
      "rawValue": "{primitive.spacing.960}",
      "sourcePath": "semantic.global.app.shell-min-width",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 960,
        "unit": "px"
      }
    },
    "blur-glass": {
      "aliasTarget": {
        "id": "blur-16",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-blur-glass": "16px"
      },
      "deprecated": null,
      "description": null,
      "id": "blur-glass",
      "mode": "global",
      "rawValue": "{primitive.blur.16}",
      "sourcePath": "semantic.global.blur.glass",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 16,
        "unit": "px"
      }
    },
    "blur-header": {
      "aliasTarget": {
        "id": "blur-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-blur-header": "12px"
      },
      "deprecated": null,
      "description": null,
      "id": "blur-header",
      "mode": "global",
      "rawValue": "{primitive.blur.12}",
      "sourcePath": "semantic.global.blur.header",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 12,
        "unit": "px"
      }
    },
    "blur-panel": {
      "aliasTarget": {
        "id": "blur-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-blur-panel": "12px"
      },
      "deprecated": null,
      "description": null,
      "id": "blur-panel",
      "mode": "global",
      "rawValue": "{primitive.blur.12}",
      "sourcePath": "semantic.global.blur.panel",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 12,
        "unit": "px"
      }
    },
    "blur-surface": {
      "aliasTarget": {
        "id": "blur-10",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-blur-surface": "10px"
      },
      "deprecated": null,
      "description": null,
      "id": "blur-surface",
      "mode": "global",
      "rawValue": "{primitive.blur.10}",
      "sourcePath": "semantic.global.blur.surface",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 10,
        "unit": "px"
      }
    },
    "blur-toast": {
      "aliasTarget": {
        "id": "blur-16",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-blur-toast": "16px"
      },
      "deprecated": null,
      "description": null,
      "id": "blur-toast",
      "mode": "global",
      "rawValue": "{primitive.blur.16}",
      "sourcePath": "semantic.global.blur.toast",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 16,
        "unit": "px"
      }
    },
    "border-width-default": {
      "aliasTarget": {
        "id": "border-width-default-base",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-border-width-default": "1px"
      },
      "deprecated": null,
      "description": null,
      "id": "border-width-default",
      "mode": "global",
      "rawValue": "{primitive.border-width.default}",
      "sourcePath": "semantic.global.border-width.default",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 1,
        "unit": "px"
      }
    },
    "border-width-hairline": {
      "aliasTarget": {
        "id": "border-width-hairline-base",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-border-width-hairline": "0.5px"
      },
      "deprecated": null,
      "description": null,
      "id": "border-width-hairline",
      "mode": "global",
      "rawValue": "{primitive.border-width.hairline}",
      "sourcePath": "semantic.global.border-width.hairline",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 0.5,
        "unit": "px"
      }
    },
    "border-width-ring": {
      "aliasTarget": {
        "id": "border-width-ring-base",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-border-width-ring": "2px"
      },
      "deprecated": null,
      "description": null,
      "id": "border-width-ring",
      "mode": "global",
      "rawValue": "{primitive.border-width.ring}",
      "sourcePath": "semantic.global.border-width.ring",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 2,
        "unit": "px"
      }
    },
    "button-height-lg": {
      "aliasTarget": {
        "id": "layout-control-height-lg",
        "mode": "global"
      },
      "cssProperties": {
        "--louis-button-height-lg": "40px"
      },
      "deprecated": null,
      "description": null,
      "id": "button-height-lg",
      "mode": "global",
      "rawValue": "{semantic.global.layout.control-height-lg}",
      "sourcePath": "semantic.global.button.height-lg",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 40,
        "unit": "px"
      }
    },
    "button-height-md": {
      "aliasTarget": {
        "id": "layout-control-height-md",
        "mode": "global"
      },
      "cssProperties": {
        "--louis-button-height-md": "32px"
      },
      "deprecated": null,
      "description": null,
      "id": "button-height-md",
      "mode": "global",
      "rawValue": "{semantic.global.layout.control-height-md}",
      "sourcePath": "semantic.global.button.height-md",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 32,
        "unit": "px"
      }
    },
    "button-min-width-md": {
      "aliasTarget": {
        "id": "layout-control-minimum-width-md",
        "mode": "global"
      },
      "cssProperties": {
        "--louis-button-min-width-md": "48px"
      },
      "deprecated": null,
      "description": null,
      "id": "button-min-width-md",
      "mode": "global",
      "rawValue": "{semantic.global.layout.control-minimum-width-md}",
      "sourcePath": "semantic.global.button.min-width-md",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 48,
        "unit": "px"
      }
    },
    "button-padding-inline-lg": {
      "aliasTarget": {
        "id": "space-control-lg",
        "mode": "global"
      },
      "cssProperties": {
        "--louis-button-padding-inline-lg": "16px"
      },
      "deprecated": null,
      "description": null,
      "id": "button-padding-inline-lg",
      "mode": "global",
      "rawValue": "{semantic.global.spacing.control-lg}",
      "sourcePath": "semantic.global.button.padding-inline-lg",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 16,
        "unit": "px"
      }
    },
    "button-padding-inline-md": {
      "aliasTarget": {
        "id": "space-control-md",
        "mode": "global"
      },
      "cssProperties": {
        "--louis-button-padding-inline-md": "12px"
      },
      "deprecated": null,
      "description": null,
      "id": "button-padding-inline-md",
      "mode": "global",
      "rawValue": "{semantic.global.spacing.control-md}",
      "sourcePath": "semantic.global.button.padding-inline-md",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 12,
        "unit": "px"
      }
    },
    "button-radius": {
      "aliasTarget": {
        "id": "radius-control",
        "mode": "global"
      },
      "cssProperties": {
        "--louis-button-radius": "12px"
      },
      "deprecated": null,
      "description": null,
      "id": "button-radius",
      "mode": "global",
      "rawValue": "{semantic.global.radius.control}",
      "sourcePath": "semantic.global.button.radius",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 12,
        "unit": "px"
      }
    },
    "elevation-focus-ring": {
      "aliasTarget": {
        "id": "shadow-focus-ring",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-elevation-focus-ring": "0px 0px 0px 3px color(srgb 0 0.533333 1 / 0.42)"
      },
      "deprecated": null,
      "description": null,
      "id": "elevation-focus-ring",
      "mode": "global",
      "rawValue": "{primitive.shadow.focus-ring}",
      "sourcePath": "semantic.global.elevation.focus-ring",
      "tier": "semantic",
      "type": "shadow",
      "value": {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0.533333,
            1
          ],
          "alpha": 0.42
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 0,
          "unit": "px"
        },
        "blur": {
          "value": 0,
          "unit": "px"
        },
        "spread": {
          "value": 3,
          "unit": "px"
        },
        "inset": false
      }
    },
    "elevation-modal": {
      "aliasTarget": {
        "id": "shadow-modal",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-elevation-modal": "0px 16px 48px -8px color(srgb 0 0 0 / 0.22)"
      },
      "deprecated": null,
      "description": null,
      "id": "elevation-modal",
      "mode": "global",
      "rawValue": "{primitive.shadow.modal}",
      "sourcePath": "semantic.global.elevation.modal",
      "tier": "semantic",
      "type": "shadow",
      "value": {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.22
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 16,
          "unit": "px"
        },
        "blur": {
          "value": 48,
          "unit": "px"
        },
        "spread": {
          "value": -8,
          "unit": "px"
        },
        "inset": false
      }
    },
    "elevation-popover": {
      "aliasTarget": {
        "id": "shadow-popover",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-elevation-popover": "0px 8px 24px -4px color(srgb 0 0 0 / 0.14)"
      },
      "deprecated": null,
      "description": null,
      "id": "elevation-popover",
      "mode": "global",
      "rawValue": "{primitive.shadow.popover}",
      "sourcePath": "semantic.global.elevation.popover",
      "tier": "semantic",
      "type": "shadow",
      "value": {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.14
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 8,
          "unit": "px"
        },
        "blur": {
          "value": 24,
          "unit": "px"
        },
        "spread": {
          "value": -4,
          "unit": "px"
        },
        "inset": false
      }
    },
    "elevation-surface": {
      "aliasTarget": {
        "id": "shadow-surface",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-elevation-surface": "0px 2px 8px 0px color(srgb 0 0 0 / 0.06)"
      },
      "deprecated": null,
      "description": null,
      "id": "elevation-surface",
      "mode": "global",
      "rawValue": "{primitive.shadow.surface}",
      "sourcePath": "semantic.global.elevation.surface",
      "tier": "semantic",
      "type": "shadow",
      "value": {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.06
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 2,
          "unit": "px"
        },
        "blur": {
          "value": 8,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        },
        "inset": false
      }
    },
    "elevation-switch-thumb": {
      "aliasTarget": {
        "id": "shadow-switch-thumb",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-elevation-switch-thumb": "0px 1px 3px 0px color(srgb 0 0 0 / 0.2)"
      },
      "deprecated": null,
      "description": null,
      "id": "elevation-switch-thumb",
      "mode": "global",
      "rawValue": "{primitive.shadow.switch-thumb}",
      "sourcePath": "semantic.global.elevation.switch-thumb",
      "tier": "semantic",
      "type": "shadow",
      "value": {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0,
            0,
            0
          ],
          "alpha": 0.2
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 1,
          "unit": "px"
        },
        "blur": {
          "value": 3,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        },
        "inset": false
      }
    },
    "elevation-toast": {
      "aliasTarget": {
        "id": "shadow-toast",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-elevation-toast": "0px 8px 20px 0px color(srgb 0 0 0 / 0.16)"
      },
      "deprecated": null,
      "description": null,
      "id": "elevation-toast",
      "mode": "global",
      "rawValue": "{primitive.shadow.toast}",
      "sourcePath": "semantic.global.elevation.toast",
      "tier": "semantic",
      "type": "shadow",
      "value": [
        {
          "color": {
            "colorSpace": "srgb",
            "components": [
              0,
              0,
              0
            ],
            "alpha": 0.16
          },
          "offsetX": {
            "value": 0,
            "unit": "px"
          },
          "offsetY": {
            "value": 8,
            "unit": "px"
          },
          "blur": {
            "value": 20,
            "unit": "px"
          },
          "spread": {
            "value": 0,
            "unit": "px"
          },
          "inset": false
        }
      ]
    },
    "footer-reveal-height": {
      "aliasTarget": {
        "id": "space-0",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-footer-reveal-height": "0px"
      },
      "deprecated": null,
      "description": null,
      "id": "footer-reveal-height",
      "mode": "global",
      "rawValue": "{primitive.spacing.0}",
      "sourcePath": "semantic.global.footer.reveal-height",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 0,
        "unit": "px"
      }
    },
    "icon-size-lg": {
      "aliasTarget": {
        "id": "space-24",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-icon-size-lg": "24px"
      },
      "deprecated": null,
      "description": null,
      "id": "icon-size-lg",
      "mode": "global",
      "rawValue": "{primitive.spacing.24}",
      "sourcePath": "semantic.global.icon.size-lg",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 24,
        "unit": "px"
      }
    },
    "icon-size-md": {
      "aliasTarget": {
        "id": "space-20",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-icon-size-md": "20px"
      },
      "deprecated": null,
      "description": null,
      "id": "icon-size-md",
      "mode": "global",
      "rawValue": "{primitive.spacing.20}",
      "sourcePath": "semantic.global.icon.size-md",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 20,
        "unit": "px"
      }
    },
    "icon-size-sm": {
      "aliasTarget": {
        "id": "space-16",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-icon-size-sm": "16px"
      },
      "deprecated": null,
      "description": null,
      "id": "icon-size-sm",
      "mode": "global",
      "rawValue": "{primitive.spacing.16}",
      "sourcePath": "semantic.global.icon.size-sm",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 16,
        "unit": "px"
      }
    },
    "icon-size-xl": {
      "aliasTarget": {
        "id": "space-64",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-icon-size-xl": "64px"
      },
      "deprecated": null,
      "description": null,
      "id": "icon-size-xl",
      "mode": "global",
      "rawValue": "{primitive.spacing.64}",
      "sourcePath": "semantic.global.icon.size-xl",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 64,
        "unit": "px"
      }
    },
    "layer-content": {
      "aliasTarget": {
        "id": "layer-base-content",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layer-content": "0"
      },
      "deprecated": null,
      "description": null,
      "id": "layer-content",
      "mode": "global",
      "rawValue": "{primitive.layer.content}",
      "sourcePath": "semantic.global.layer.content",
      "tier": "semantic",
      "type": "number",
      "value": 0
    },
    "layer-critical": {
      "aliasTarget": {
        "id": "layer-base-critical",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layer-critical": "400"
      },
      "deprecated": null,
      "description": null,
      "id": "layer-critical",
      "mode": "global",
      "rawValue": "{primitive.layer.critical}",
      "sourcePath": "semantic.global.layer.critical",
      "tier": "semantic",
      "type": "number",
      "value": 400
    },
    "layer-modal": {
      "aliasTarget": {
        "id": "layer-base-modal",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layer-modal": "300"
      },
      "deprecated": null,
      "description": null,
      "id": "layer-modal",
      "mode": "global",
      "rawValue": "{primitive.layer.modal}",
      "sourcePath": "semantic.global.layer.modal",
      "tier": "semantic",
      "type": "number",
      "value": 300
    },
    "layer-popover": {
      "aliasTarget": {
        "id": "layer-base-popover",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layer-popover": "200"
      },
      "deprecated": null,
      "description": null,
      "id": "layer-popover",
      "mode": "global",
      "rawValue": "{primitive.layer.popover}",
      "sourcePath": "semantic.global.layer.popover",
      "tier": "semantic",
      "type": "number",
      "value": 200
    },
    "layer-sticky": {
      "aliasTarget": {
        "id": "layer-base-sticky",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layer-sticky": "100"
      },
      "deprecated": null,
      "description": null,
      "id": "layer-sticky",
      "mode": "global",
      "rawValue": "{primitive.layer.sticky}",
      "sourcePath": "semantic.global.layer.sticky",
      "tier": "semantic",
      "type": "number",
      "value": 100
    },
    "layout-alert-compact-inset": {
      "aliasTarget": {
        "id": "space-10",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-alert-compact-inset": "10px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-alert-compact-inset",
      "mode": "global",
      "rawValue": "{primitive.spacing.10}",
      "sourcePath": "semantic.global.layout.alert-compact-inset",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 10,
        "unit": "px"
      }
    },
    "layout-alert-inset": {
      "aliasTarget": {
        "id": "space-18",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-alert-inset": "18px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-alert-inset",
      "mode": "global",
      "rawValue": "{primitive.spacing.18}",
      "sourcePath": "semantic.global.layout.alert-inset",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 18,
        "unit": "px"
      }
    },
    "layout-app-shell-brand-mark-height": {
      "aliasTarget": {
        "id": "space-28",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-app-shell-brand-mark-height": "28px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-app-shell-brand-mark-height",
      "mode": "global",
      "rawValue": "{primitive.spacing.28}",
      "sourcePath": "semantic.global.layout.app-shell-brand-mark-height",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 28,
        "unit": "px"
      }
    },
    "layout-app-shell-content-inset": {
      "aliasTarget": {
        "id": "space-16",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-app-shell-content-inset": "16px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-app-shell-content-inset",
      "mode": "global",
      "rawValue": "{primitive.spacing.16}",
      "sourcePath": "semantic.global.layout.app-shell-content-inset",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 16,
        "unit": "px"
      }
    },
    "layout-app-shell-content-reserve": {
      "aliasTarget": {
        "id": "space-120",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-app-shell-content-reserve": "120px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-app-shell-content-reserve",
      "mode": "global",
      "rawValue": "{primitive.spacing.120}",
      "sourcePath": "semantic.global.layout.app-shell-content-reserve",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 120,
        "unit": "px"
      }
    },
    "layout-app-shell-outer-gap": {
      "aliasTarget": {
        "id": "space-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-app-shell-outer-gap": "12px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-app-shell-outer-gap",
      "mode": "global",
      "rawValue": "{primitive.spacing.12}",
      "sourcePath": "semantic.global.layout.app-shell-outer-gap",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 12,
        "unit": "px"
      }
    },
    "layout-app-shell-sidebar-collapsed": {
      "aliasTarget": {
        "id": "space-56",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-app-shell-sidebar-collapsed": "56px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-app-shell-sidebar-collapsed",
      "mode": "global",
      "rawValue": "{primitive.spacing.56}",
      "sourcePath": "semantic.global.layout.app-shell-sidebar-collapsed",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 56,
        "unit": "px"
      }
    },
    "layout-app-shell-sidebar-padding": {
      "aliasTarget": {
        "id": "space-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-app-shell-sidebar-padding": "12px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-app-shell-sidebar-padding",
      "mode": "global",
      "rawValue": "{primitive.spacing.12}",
      "sourcePath": "semantic.global.layout.app-shell-sidebar-padding",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 12,
        "unit": "px"
      }
    },
    "layout-app-shell-sidebar-width": {
      "aliasTarget": {
        "id": "space-280",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-app-shell-sidebar-width": "280px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-app-shell-sidebar-width",
      "mode": "global",
      "rawValue": "{primitive.spacing.280}",
      "sourcePath": "semantic.global.layout.app-shell-sidebar-width",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 280,
        "unit": "px"
      }
    },
    "layout-app-shell-top-bar-height": {
      "aliasTarget": {
        "id": "space-40",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-app-shell-top-bar-height": "40px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-app-shell-top-bar-height",
      "mode": "global",
      "rawValue": "{primitive.spacing.40}",
      "sourcePath": "semantic.global.layout.app-shell-top-bar-height",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 40,
        "unit": "px"
      }
    },
    "layout-control-height-lg": {
      "aliasTarget": {
        "id": "space-40",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-control-height-lg": "40px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-control-height-lg",
      "mode": "global",
      "rawValue": "{primitive.spacing.40}",
      "sourcePath": "semantic.global.layout.control-height-lg",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 40,
        "unit": "px"
      }
    },
    "layout-control-height-md": {
      "aliasTarget": {
        "id": "space-32",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-control-height-md": "32px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-control-height-md",
      "mode": "global",
      "rawValue": "{primitive.spacing.32}",
      "sourcePath": "semantic.global.layout.control-height-md",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 32,
        "unit": "px"
      }
    },
    "layout-control-height-sm": {
      "aliasTarget": {
        "id": "space-24",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-control-height-sm": "24px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-control-height-sm",
      "mode": "global",
      "rawValue": "{primitive.spacing.24}",
      "sourcePath": "semantic.global.layout.control-height-sm",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 24,
        "unit": "px"
      }
    },
    "layout-control-hit-target-minimum": {
      "aliasTarget": {
        "id": "space-44",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-control-hit-target-minimum": "44px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-control-hit-target-minimum",
      "mode": "global",
      "rawValue": "{primitive.spacing.44}",
      "sourcePath": "semantic.global.layout.control-hit-target-minimum",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 44,
        "unit": "px"
      }
    },
    "layout-control-minimum-width-md": {
      "aliasTarget": {
        "id": "space-48",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-control-minimum-width-md": "48px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-control-minimum-width-md",
      "mode": "global",
      "rawValue": "{primitive.spacing.48}",
      "sourcePath": "semantic.global.layout.control-minimum-width-md",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 48,
        "unit": "px"
      }
    },
    "layout-inspector-control-height": {
      "aliasTarget": {
        "id": "space-28",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-inspector-control-height": "28px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-inspector-control-height",
      "mode": "global",
      "rawValue": "{primitive.spacing.28}",
      "sourcePath": "semantic.global.layout.inspector-control-height",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 28,
        "unit": "px"
      }
    },
    "layout-node-chip-height": {
      "aliasTarget": {
        "id": "space-32",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-node-chip-height": "32px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-node-chip-height",
      "mode": "global",
      "rawValue": "{primitive.spacing.32}",
      "sourcePath": "semantic.global.layout.node-chip-height",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 32,
        "unit": "px"
      }
    },
    "layout-node-chip-inset": {
      "aliasTarget": {
        "id": "space-10",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-node-chip-inset": "10px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-node-chip-inset",
      "mode": "global",
      "rawValue": "{primitive.spacing.10}",
      "sourcePath": "semantic.global.layout.node-chip-inset",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 10,
        "unit": "px"
      }
    },
    "layout-pane-divider-grip-length": {
      "aliasTarget": {
        "id": "space-60",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-pane-divider-grip-length": "60px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-pane-divider-grip-length",
      "mode": "global",
      "rawValue": "{primitive.spacing.60}",
      "sourcePath": "semantic.global.layout.pane-divider-grip-length",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 60,
        "unit": "px"
      }
    },
    "layout-pane-divider-grip-length-active": {
      "aliasTarget": {
        "id": "space-80",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-pane-divider-grip-length-active": "80px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-pane-divider-grip-length-active",
      "mode": "global",
      "rawValue": "{primitive.spacing.80}",
      "sourcePath": "semantic.global.layout.pane-divider-grip-length-active",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 80,
        "unit": "px"
      }
    },
    "layout-pane-divider-grip-length-compact": {
      "aliasTarget": {
        "id": "space-48",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-pane-divider-grip-length-compact": "48px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-pane-divider-grip-length-compact",
      "mode": "global",
      "rawValue": "{primitive.spacing.48}",
      "sourcePath": "semantic.global.layout.pane-divider-grip-length-compact",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 48,
        "unit": "px"
      }
    },
    "layout-pane-divider-track": {
      "aliasTarget": {
        "id": "space-4",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-pane-divider-track": "4px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-pane-divider-track",
      "mode": "global",
      "rawValue": "{primitive.spacing.4}",
      "sourcePath": "semantic.global.layout.pane-divider-track",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 4,
        "unit": "px"
      }
    },
    "layout-progress-bar-height": {
      "aliasTarget": {
        "id": "space-6",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-progress-bar-height": "6px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-progress-bar-height",
      "mode": "global",
      "rawValue": "{primitive.spacing.6}",
      "sourcePath": "semantic.global.layout.progress-bar-height",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 6,
        "unit": "px"
      }
    },
    "layout-progress-bar-max-inline-size": {
      "aliasTarget": {
        "id": "space-320",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-progress-bar-max-inline-size": "320px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-progress-bar-max-inline-size",
      "mode": "global",
      "rawValue": "{primitive.spacing.320}",
      "sourcePath": "semantic.global.layout.progress-bar-max-inline-size",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 320,
        "unit": "px"
      }
    },
    "layout-project-card-minimum": {
      "aliasTarget": {
        "id": "space-240",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-project-card-minimum": "240px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-project-card-minimum",
      "mode": "global",
      "rawValue": "{primitive.spacing.240}",
      "sourcePath": "semantic.global.layout.project-card-minimum",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 240,
        "unit": "px"
      }
    },
    "layout-project-grid-gap": {
      "aliasTarget": {
        "id": "space-4",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-project-grid-gap": "4px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-project-grid-gap",
      "mode": "global",
      "rawValue": "{primitive.spacing.4}",
      "sourcePath": "semantic.global.layout.project-grid-gap",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 4,
        "unit": "px"
      }
    },
    "layout-settings-segment-height": {
      "aliasTarget": {
        "id": "space-28",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-settings-segment-height": "28px"
      },
      "deprecated": null,
      "description": "설정·구독 화면의 세그먼티드 토글이 쓰는 **세그먼트** 높이. 같은 28 이지만 inspector-control-height 와 뜻이 다르다 — 저것은 트랙 높이이고 이것은 트랙 «안»의 칸 높이다. 트랙은 이 값에서 파생한다(4 + 28 + 4 = 36). DS-D-0048 정정.",
      "id": "layout-settings-segment-height",
      "mode": "global",
      "rawValue": "{primitive.spacing.28}",
      "sourcePath": "semantic.global.layout.settings-segment-height",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 28,
        "unit": "px"
      }
    },
    "layout-tab-height": {
      "aliasTarget": {
        "id": "space-28",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-layout-tab-height": "28px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-tab-height",
      "mode": "global",
      "rawValue": "{primitive.spacing.28}",
      "sourcePath": "semantic.global.layout.tab-height",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 28,
        "unit": "px"
      }
    },
    "misc-project-card-overlay-stack-gap": {
      "aliasTarget": {
        "id": "space-4",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-misc-project-card-overlay-stack-gap": "4px"
      },
      "deprecated": null,
      "description": null,
      "id": "misc-project-card-overlay-stack-gap",
      "mode": "global",
      "rawValue": "{primitive.spacing.4}",
      "sourcePath": "semantic.global.misc.project-card-overlay-stack-gap",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 4,
        "unit": "px"
      }
    },
    "misc-scrollbar-size": {
      "aliasTarget": {
        "id": "space-10",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-misc-scrollbar-size": "10px"
      },
      "deprecated": null,
      "description": null,
      "id": "misc-scrollbar-size",
      "mode": "global",
      "rawValue": "{primitive.spacing.10}",
      "sourcePath": "semantic.global.misc.scrollbar-size",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 10,
        "unit": "px"
      }
    },
    "motion-content-fade": {
      "aliasTarget": {
        "id": "transition-content-fade",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-content-fade-duration": "300ms",
        "--louis-motion-content-fade-delay": "0ms",
        "--louis-motion-content-fade-timing-function": "cubic-bezier(0.25, 0.1, 0.25, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-content-fade",
      "mode": "global",
      "rawValue": "{primitive.transition.content-fade}",
      "sourcePath": "semantic.global.motion.content-fade",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 300,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0.25,
          0.1,
          0.25,
          1
        ]
      }
    },
    "motion-content-rise": {
      "aliasTarget": {
        "id": "transition-content-rise",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-content-rise-duration": "360ms",
        "--louis-motion-content-rise-delay": "0ms",
        "--louis-motion-content-rise-timing-function": "cubic-bezier(0.22, 1, 0.36, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-content-rise",
      "mode": "global",
      "rawValue": "{primitive.transition.content-rise}",
      "sourcePath": "semantic.global.motion.content-rise",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 360,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0.22,
          1,
          0.36,
          1
        ]
      }
    },
    "motion-control-hover": {
      "aliasTarget": {
        "id": "transition-control-hover",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-control-hover-duration": "160ms",
        "--louis-motion-control-hover-delay": "0ms",
        "--louis-motion-control-hover-timing-function": "cubic-bezier(0.25, 0.1, 0.25, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-control-hover",
      "mode": "global",
      "rawValue": "{primitive.transition.control-hover}",
      "sourcePath": "semantic.global.motion.control-hover",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 160,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0.25,
          0.1,
          0.25,
          1
        ]
      }
    },
    "motion-crossfade-enter": {
      "aliasTarget": {
        "id": "transition-crossfade-enter",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-crossfade-enter-duration": "420ms",
        "--louis-motion-crossfade-enter-delay": "0ms",
        "--louis-motion-crossfade-enter-timing-function": "cubic-bezier(0.25, 0.1, 0.25, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-crossfade-enter",
      "mode": "global",
      "rawValue": "{primitive.transition.crossfade-enter}",
      "sourcePath": "semantic.global.motion.crossfade-enter",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 420,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0.25,
          0.1,
          0.25,
          1
        ]
      }
    },
    "motion-layout-change": {
      "aliasTarget": {
        "id": "transition-layout-change",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-layout-change-duration": "220ms",
        "--louis-motion-layout-change-delay": "0ms",
        "--louis-motion-layout-change-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-layout-change",
      "mode": "global",
      "rawValue": "{primitive.transition.layout-change}",
      "sourcePath": "semantic.global.motion.layout-change",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 220,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0.4,
          0,
          0.2,
          1
        ]
      }
    },
    "motion-list-enter": {
      "aliasTarget": {
        "id": "transition-list-enter",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-list-enter-duration": "560ms",
        "--louis-motion-list-enter-delay": "0ms",
        "--louis-motion-list-enter-timing-function": "cubic-bezier(0.23, 1, 0.32, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-list-enter",
      "mode": "global",
      "rawValue": "{primitive.transition.list-enter}",
      "sourcePath": "semantic.global.motion.list-enter",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 560,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0.23,
          1,
          0.32,
          1
        ]
      }
    },
    "motion-list-stagger-step": {
      "aliasTarget": {
        "id": "transition-list-stagger-step",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-list-stagger-step-duration": "560ms",
        "--louis-motion-list-stagger-step-delay": "36ms",
        "--louis-motion-list-stagger-step-timing-function": "cubic-bezier(0.23, 1, 0.32, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-list-stagger-step",
      "mode": "global",
      "rawValue": "{primitive.transition.list-stagger-step}",
      "sourcePath": "semantic.global.motion.list-stagger-step",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 560,
          "unit": "ms"
        },
        "delay": {
          "value": 36,
          "unit": "ms"
        },
        "timingFunction": [
          0.23,
          1,
          0.32,
          1
        ]
      }
    },
    "motion-menu-enter": {
      "aliasTarget": {
        "id": "transition-menu-enter",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-menu-enter-duration": "260ms",
        "--louis-motion-menu-enter-delay": "0ms",
        "--louis-motion-menu-enter-timing-function": "cubic-bezier(0.32, 0.72, 0, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-menu-enter",
      "mode": "global",
      "rawValue": "{primitive.transition.menu-enter}",
      "sourcePath": "semantic.global.motion.menu-enter",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 260,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0.32,
          0.72,
          0,
          1
        ]
      }
    },
    "motion-menu-exit": {
      "aliasTarget": {
        "id": "transition-menu-exit",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-menu-exit-duration": "130ms",
        "--louis-motion-menu-exit-delay": "0ms",
        "--louis-motion-menu-exit-timing-function": "cubic-bezier(0.42, 0, 1, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-menu-exit",
      "mode": "global",
      "rawValue": "{primitive.transition.menu-exit}",
      "sourcePath": "semantic.global.motion.menu-exit",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 130,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0.42,
          0,
          1,
          1
        ]
      }
    },
    "motion-modal-enter": {
      "aliasTarget": {
        "id": "transition-modal-enter",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-modal-enter-duration": "320ms",
        "--louis-motion-modal-enter-delay": "0ms",
        "--louis-motion-modal-enter-timing-function": "cubic-bezier(0.32, 0.72, 0, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-modal-enter",
      "mode": "global",
      "rawValue": "{primitive.transition.modal-enter}",
      "sourcePath": "semantic.global.motion.modal-enter",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 320,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0.32,
          0.72,
          0,
          1
        ]
      }
    },
    "motion-modal-exit": {
      "aliasTarget": {
        "id": "transition-modal-exit",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-modal-exit-duration": "200ms",
        "--louis-motion-modal-exit-delay": "0ms",
        "--louis-motion-modal-exit-timing-function": "cubic-bezier(0.4, 0, 1, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-modal-exit",
      "mode": "global",
      "rawValue": "{primitive.transition.modal-exit}",
      "sourcePath": "semantic.global.motion.modal-exit",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 200,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0.4,
          0,
          1,
          1
        ]
      }
    },
    "motion-overlay-enter": {
      "aliasTarget": {
        "id": "transition-overlay-enter",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-overlay-enter-duration": "200ms",
        "--louis-motion-overlay-enter-delay": "0ms",
        "--louis-motion-overlay-enter-timing-function": "cubic-bezier(0.32, 0.72, 0, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-overlay-enter",
      "mode": "global",
      "rawValue": "{primitive.transition.overlay-enter}",
      "sourcePath": "semantic.global.motion.overlay-enter",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 200,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0.32,
          0.72,
          0,
          1
        ]
      }
    },
    "motion-overlay-exit": {
      "aliasTarget": {
        "id": "transition-overlay-exit",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-overlay-exit-duration": "120ms",
        "--louis-motion-overlay-exit-delay": "0ms",
        "--louis-motion-overlay-exit-timing-function": "cubic-bezier(0.4, 0, 1, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-overlay-exit",
      "mode": "global",
      "rawValue": "{primitive.transition.overlay-exit}",
      "sourcePath": "semantic.global.motion.overlay-exit",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 120,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0.4,
          0,
          1,
          1
        ]
      }
    },
    "motion-reduced": {
      "aliasTarget": {
        "id": "transition-reduced",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-reduced-duration": "0ms",
        "--louis-motion-reduced-delay": "0ms",
        "--louis-motion-reduced-timing-function": "cubic-bezier(0.2, 0, 0, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-reduced",
      "mode": "global",
      "rawValue": "{primitive.transition.reduced}",
      "sourcePath": "semantic.global.motion.reduced",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 0,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0.2,
          0,
          0,
          1
        ]
      }
    },
    "motion-reveal-enter": {
      "aliasTarget": {
        "id": "transition-reveal-enter",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-reveal-enter-duration": "720ms",
        "--louis-motion-reveal-enter-delay": "0ms",
        "--louis-motion-reveal-enter-timing-function": "cubic-bezier(0.19, 1, 0.22, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-reveal-enter",
      "mode": "global",
      "rawValue": "{primitive.transition.reveal-enter}",
      "sourcePath": "semantic.global.motion.reveal-enter",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 720,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0.19,
          1,
          0.22,
          1
        ]
      }
    },
    "motion-scale-tooltip-rest": {
      "aliasTarget": {
        "id": "scale-tooltip-rest",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-scale-tooltip-rest": "0.97"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-scale-tooltip-rest",
      "mode": "global",
      "rawValue": "{primitive.scale.tooltip-rest}",
      "sourcePath": "semantic.global.motion-scale.tooltip-rest",
      "tier": "semantic",
      "type": "number",
      "value": 0.97
    },
    "motion-shell-collapse": {
      "aliasTarget": {
        "id": "transition-shell-collapse",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-shell-collapse-duration": "320ms",
        "--louis-motion-shell-collapse-delay": "0ms",
        "--louis-motion-shell-collapse-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-shell-collapse",
      "mode": "global",
      "rawValue": "{primitive.transition.shell-collapse}",
      "sourcePath": "semantic.global.motion.shell-collapse",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 320,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0.4,
          0,
          0.2,
          1
        ]
      }
    },
    "motion-shimmer": {
      "aliasTarget": {
        "id": "transition-shimmer",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-shimmer-duration": "1600ms",
        "--louis-motion-shimmer-delay": "0ms",
        "--louis-motion-shimmer-timing-function": "cubic-bezier(0.2, 0, 0, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-shimmer",
      "mode": "global",
      "rawValue": "{primitive.transition.shimmer}",
      "sourcePath": "semantic.global.motion.shimmer",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 1600,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0.2,
          0,
          0,
          1
        ]
      }
    },
    "motion-spin": {
      "aliasTarget": {
        "id": "transition-spin",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-spin-duration": "700ms",
        "--louis-motion-spin-delay": "0ms",
        "--louis-motion-spin-timing-function": "cubic-bezier(0, 0, 1, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-spin",
      "mode": "global",
      "rawValue": "{primitive.transition.spin}",
      "sourcePath": "semantic.global.motion.spin",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 700,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0,
          0,
          1,
          1
        ]
      }
    },
    "motion-stagger-1": {
      "aliasTarget": {
        "id": "transition-stagger-1",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-stagger-1-duration": "360ms",
        "--louis-motion-stagger-1-delay": "40ms",
        "--louis-motion-stagger-1-timing-function": "cubic-bezier(0.22, 1, 0.36, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-stagger-1",
      "mode": "global",
      "rawValue": "{primitive.transition.stagger-1}",
      "sourcePath": "semantic.global.motion.stagger-1",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 360,
          "unit": "ms"
        },
        "delay": {
          "value": 40,
          "unit": "ms"
        },
        "timingFunction": [
          0.22,
          1,
          0.36,
          1
        ]
      }
    },
    "motion-stagger-2": {
      "aliasTarget": {
        "id": "transition-stagger-2",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-stagger-2-duration": "360ms",
        "--louis-motion-stagger-2-delay": "80ms",
        "--louis-motion-stagger-2-timing-function": "cubic-bezier(0.22, 1, 0.36, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-stagger-2",
      "mode": "global",
      "rawValue": "{primitive.transition.stagger-2}",
      "sourcePath": "semantic.global.motion.stagger-2",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 360,
          "unit": "ms"
        },
        "delay": {
          "value": 80,
          "unit": "ms"
        },
        "timingFunction": [
          0.22,
          1,
          0.36,
          1
        ]
      }
    },
    "motion-stagger-3": {
      "aliasTarget": {
        "id": "transition-stagger-3",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-stagger-3-duration": "360ms",
        "--louis-motion-stagger-3-delay": "150ms",
        "--louis-motion-stagger-3-timing-function": "cubic-bezier(0.22, 1, 0.36, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-stagger-3",
      "mode": "global",
      "rawValue": "{primitive.transition.stagger-3}",
      "sourcePath": "semantic.global.motion.stagger-3",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 360,
          "unit": "ms"
        },
        "delay": {
          "value": 150,
          "unit": "ms"
        },
        "timingFunction": [
          0.22,
          1,
          0.36,
          1
        ]
      }
    },
    "motion-tab-select": {
      "aliasTarget": {
        "id": "transition-tab-select",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-tab-select-duration": "200ms",
        "--louis-motion-tab-select-delay": "0ms",
        "--louis-motion-tab-select-timing-function": "cubic-bezier(0.25, 0.1, 0.25, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-tab-select",
      "mode": "global",
      "rawValue": "{primitive.transition.tab-select}",
      "sourcePath": "semantic.global.motion.tab-select",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 200,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0.25,
          0.1,
          0.25,
          1
        ]
      }
    },
    "motion-tooltip-enter": {
      "aliasTarget": {
        "id": "transition-tooltip-enter",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-tooltip-enter-duration": "140ms",
        "--louis-motion-tooltip-enter-delay": "0ms",
        "--louis-motion-tooltip-enter-timing-function": "cubic-bezier(0.23, 1, 0.32, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-tooltip-enter",
      "mode": "global",
      "rawValue": "{primitive.transition.tooltip-enter}",
      "sourcePath": "semantic.global.motion.tooltip-enter",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 140,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0.23,
          1,
          0.32,
          1
        ]
      }
    },
    "motion-tooltip-exit": {
      "aliasTarget": {
        "id": "transition-tooltip-exit",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-tooltip-exit-duration": "120ms",
        "--louis-motion-tooltip-exit-delay": "0ms",
        "--louis-motion-tooltip-exit-timing-function": "cubic-bezier(0.19, 1, 0.22, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-tooltip-exit",
      "mode": "global",
      "rawValue": "{primitive.transition.tooltip-exit}",
      "sourcePath": "semantic.global.motion.tooltip-exit",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 120,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0.19,
          1,
          0.22,
          1
        ]
      }
    },
    "motion-zoom-settle": {
      "aliasTarget": {
        "id": "transition-zoom-settle",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-motion-zoom-settle-duration": "680ms",
        "--louis-motion-zoom-settle-delay": "0ms",
        "--louis-motion-zoom-settle-timing-function": "cubic-bezier(0.22, 1, 0.36, 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "motion-zoom-settle",
      "mode": "global",
      "rawValue": "{primitive.transition.zoom-settle}",
      "sourcePath": "semantic.global.motion.zoom-settle",
      "tier": "semantic",
      "type": "transition",
      "value": {
        "duration": {
          "value": 680,
          "unit": "ms"
        },
        "delay": {
          "value": 0,
          "unit": "ms"
        },
        "timingFunction": [
          0.22,
          1,
          0.36,
          1
        ]
      }
    },
    "node-chrome-btn-gap": {
      "aliasTarget": {
        "id": "space-4",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-node-chrome-btn-gap": "4px"
      },
      "deprecated": null,
      "description": null,
      "id": "node-chrome-btn-gap",
      "mode": "global",
      "rawValue": "{primitive.spacing.4}",
      "sourcePath": "semantic.global.node.chrome-btn-gap",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 4,
        "unit": "px"
      }
    },
    "node-chrome-btn-h": {
      "aliasTarget": {
        "id": "space-32",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-node-chrome-btn-h": "32px"
      },
      "deprecated": null,
      "description": null,
      "id": "node-chrome-btn-h",
      "mode": "global",
      "rawValue": "{primitive.spacing.32}",
      "sourcePath": "semantic.global.node.chrome-btn-h",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 32,
        "unit": "px"
      }
    },
    "node-chrome-btn-padding-x": {
      "aliasTarget": {
        "id": "space-10",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-node-chrome-btn-padding-x": "10px"
      },
      "deprecated": null,
      "description": null,
      "id": "node-chrome-btn-padding-x",
      "mode": "global",
      "rawValue": "{primitive.spacing.10}",
      "sourcePath": "semantic.global.node.chrome-btn-padding-x",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 10,
        "unit": "px"
      }
    },
    "node-chrome-btn-radius": {
      "aliasTarget": {
        "id": "radius-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-node-chrome-btn-radius": "12px"
      },
      "deprecated": null,
      "description": null,
      "id": "node-chrome-btn-radius",
      "mode": "global",
      "rawValue": "{primitive.radius.12}",
      "sourcePath": "semantic.global.node.chrome-btn-radius",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 12,
        "unit": "px"
      }
    },
    "node-side-ctrl": {
      "aliasTarget": {
        "id": "space-28",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-node-side-ctrl": "28px"
      },
      "deprecated": null,
      "description": null,
      "id": "node-side-ctrl",
      "mode": "global",
      "rawValue": "{primitive.spacing.28}",
      "sourcePath": "semantic.global.node.side-ctrl",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 28,
        "unit": "px"
      }
    },
    "node-side-gap": {
      "aliasTarget": {
        "id": "space-10",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-node-side-gap": "10px"
      },
      "deprecated": null,
      "description": null,
      "id": "node-side-gap",
      "mode": "global",
      "rawValue": "{primitive.spacing.10}",
      "sourcePath": "semantic.global.node.side-gap",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 10,
        "unit": "px"
      }
    },
    "node-side-handle-radius": {
      "aliasTarget": {
        "id": "radius-8",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-node-side-handle-radius": "8px"
      },
      "deprecated": null,
      "description": null,
      "id": "node-side-handle-radius",
      "mode": "global",
      "rawValue": "{primitive.radius.8}",
      "sourcePath": "semantic.global.node.side-handle-radius",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 8,
        "unit": "px"
      }
    },
    "node-side-handle-size": {
      "aliasTarget": {
        "id": "space-28",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-node-side-handle-size": "28px"
      },
      "deprecated": null,
      "description": null,
      "id": "node-side-handle-size",
      "mode": "global",
      "rawValue": "{primitive.spacing.28}",
      "sourcePath": "semantic.global.node.side-handle-size",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 28,
        "unit": "px"
      }
    },
    "node-side-stack-gap": {
      "aliasTarget": {
        "id": "space-8",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-node-side-stack-gap": "8px"
      },
      "deprecated": null,
      "description": null,
      "id": "node-side-stack-gap",
      "mode": "global",
      "rawValue": "{primitive.spacing.8}",
      "sourcePath": "semantic.global.node.side-stack-gap",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 8,
        "unit": "px"
      }
    },
    "radius-alert": {
      "aliasTarget": {
        "id": "radius-20",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-radius-alert": "20px"
      },
      "deprecated": null,
      "description": null,
      "id": "radius-alert",
      "mode": "global",
      "rawValue": "{primitive.radius.20}",
      "sourcePath": "semantic.global.radius.alert",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 20,
        "unit": "px"
      }
    },
    "radius-card": {
      "aliasTarget": {
        "id": "radius-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-radius-card": "12px"
      },
      "deprecated": null,
      "description": null,
      "id": "radius-card",
      "mode": "global",
      "rawValue": "{primitive.radius.12}",
      "sourcePath": "semantic.global.radius.card",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 12,
        "unit": "px"
      }
    },
    "radius-card-lg": {
      "aliasTarget": {
        "id": "radius-20",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-radius-card-lg": "20px"
      },
      "deprecated": null,
      "description": null,
      "id": "radius-card-lg",
      "mode": "global",
      "rawValue": "{primitive.radius.20}",
      "sourcePath": "semantic.global.radius.card-lg",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 20,
        "unit": "px"
      }
    },
    "radius-control": {
      "aliasTarget": {
        "id": "radius-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-radius-control": "12px"
      },
      "deprecated": null,
      "description": null,
      "id": "radius-control",
      "mode": "global",
      "rawValue": "{primitive.radius.12}",
      "sourcePath": "semantic.global.radius.control",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 12,
        "unit": "px"
      }
    },
    "radius-control-sm": {
      "aliasTarget": {
        "id": "radius-8",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-radius-control-sm": "8px"
      },
      "deprecated": null,
      "description": null,
      "id": "radius-control-sm",
      "mode": "global",
      "rawValue": "{primitive.radius.8}",
      "sourcePath": "semantic.global.radius.control-sm",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 8,
        "unit": "px"
      }
    },
    "radius-inspector-control": {
      "aliasTarget": {
        "id": "radius-10",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-radius-inspector-control": "10px"
      },
      "deprecated": null,
      "description": null,
      "id": "radius-inspector-control",
      "mode": "global",
      "rawValue": "{primitive.radius.10}",
      "sourcePath": "semantic.global.radius.inspector-control",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 10,
        "unit": "px"
      }
    },
    "radius-node-chip": {
      "aliasTarget": {
        "id": "radius-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-radius-node-chip": "12px"
      },
      "deprecated": null,
      "description": null,
      "id": "radius-node-chip",
      "mode": "global",
      "rawValue": "{primitive.radius.12}",
      "sourcePath": "semantic.global.radius.node-chip",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 12,
        "unit": "px"
      }
    },
    "radius-overlay": {
      "aliasTarget": {
        "id": "radius-16",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-radius-overlay": "16px"
      },
      "deprecated": null,
      "description": null,
      "id": "radius-overlay",
      "mode": "global",
      "rawValue": "{primitive.radius.16}",
      "sourcePath": "semantic.global.radius.overlay",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 16,
        "unit": "px"
      }
    },
    "radius-overlay-item": {
      "aliasTarget": {
        "id": "radius-10",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-radius-overlay-item": "10px"
      },
      "deprecated": null,
      "description": null,
      "id": "radius-overlay-item",
      "mode": "global",
      "rawValue": "{primitive.radius.10}",
      "sourcePath": "semantic.global.radius.overlay-item",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 10,
        "unit": "px"
      }
    },
    "radius-overlay-lg": {
      "aliasTarget": {
        "id": "radius-24",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-radius-overlay-lg": "24px"
      },
      "deprecated": null,
      "description": null,
      "id": "radius-overlay-lg",
      "mode": "global",
      "rawValue": "{primitive.radius.24}",
      "sourcePath": "semantic.global.radius.overlay-lg",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 24,
        "unit": "px"
      }
    },
    "radius-pill": {
      "aliasTarget": {
        "id": "radius-full",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-radius-pill": "999px"
      },
      "deprecated": null,
      "description": null,
      "id": "radius-pill",
      "mode": "global",
      "rawValue": "{primitive.radius.full}",
      "sourcePath": "semantic.global.radius.pill",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 999,
        "unit": "px"
      }
    },
    "radius-table-header": {
      "aliasTarget": {
        "id": "radius-4",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-radius-table-header": "4px"
      },
      "deprecated": null,
      "description": null,
      "id": "radius-table-header",
      "mode": "global",
      "rawValue": "{primitive.radius.4}",
      "sourcePath": "semantic.global.radius.table-header",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 4,
        "unit": "px"
      }
    },
    "space-control-lg": {
      "aliasTarget": {
        "id": "space-16",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-space-control-lg": "16px"
      },
      "deprecated": null,
      "description": null,
      "id": "space-control-lg",
      "mode": "global",
      "rawValue": "{primitive.spacing.16}",
      "sourcePath": "semantic.global.spacing.control-lg",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 16,
        "unit": "px"
      }
    },
    "space-control-md": {
      "aliasTarget": {
        "id": "space-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-space-control-md": "12px"
      },
      "deprecated": null,
      "description": null,
      "id": "space-control-md",
      "mode": "global",
      "rawValue": "{primitive.spacing.12}",
      "sourcePath": "semantic.global.spacing.control-md",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 12,
        "unit": "px"
      }
    },
    "space-control-sm": {
      "aliasTarget": {
        "id": "space-8",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-space-control-sm": "8px"
      },
      "deprecated": null,
      "description": null,
      "id": "space-control-sm",
      "mode": "global",
      "rawValue": "{primitive.spacing.8}",
      "sourcePath": "semantic.global.spacing.control-sm",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 8,
        "unit": "px"
      }
    },
    "space-control-xs": {
      "aliasTarget": {
        "id": "space-4",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-space-control-xs": "4px"
      },
      "deprecated": null,
      "description": null,
      "id": "space-control-xs",
      "mode": "global",
      "rawValue": "{primitive.spacing.4}",
      "sourcePath": "semantic.global.spacing.control-xs",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 4,
        "unit": "px"
      }
    },
    "space-layout-gutter": {
      "aliasTarget": {
        "id": "space-16",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-space-layout-gutter": "16px"
      },
      "deprecated": null,
      "description": null,
      "id": "space-layout-gutter",
      "mode": "global",
      "rawValue": "{primitive.spacing.16}",
      "sourcePath": "semantic.global.spacing.layout-gutter",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 16,
        "unit": "px"
      }
    },
    "space-layout-section": {
      "aliasTarget": {
        "id": "space-24",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-space-layout-section": "24px"
      },
      "deprecated": null,
      "description": null,
      "id": "space-layout-section",
      "mode": "global",
      "rawValue": "{primitive.spacing.24}",
      "sourcePath": "semantic.global.spacing.layout-section",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 24,
        "unit": "px"
      }
    },
    "space-media-inset": {
      "aliasTarget": {
        "id": "space-20",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-space-media-inset": "20px"
      },
      "deprecated": null,
      "description": null,
      "id": "space-media-inset",
      "mode": "global",
      "rawValue": "{primitive.spacing.20}",
      "sourcePath": "semantic.global.spacing.media-inset",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 20,
        "unit": "px"
      }
    },
    "space-overlay-inset": {
      "aliasTarget": {
        "id": "space-6",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-space-overlay-inset": "6px"
      },
      "deprecated": null,
      "description": null,
      "id": "space-overlay-inset",
      "mode": "global",
      "rawValue": "{primitive.spacing.6}",
      "sourcePath": "semantic.global.spacing.overlay-inset",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 6,
        "unit": "px"
      }
    },
    "space-overlay-item-content-gap": {
      "aliasTarget": {
        "id": "space-6",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-space-overlay-item-content-gap": "6px"
      },
      "deprecated": null,
      "description": null,
      "id": "space-overlay-item-content-gap",
      "mode": "global",
      "rawValue": "{primitive.spacing.6}",
      "sourcePath": "semantic.global.spacing.overlay-item-content-gap",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 6,
        "unit": "px"
      }
    },
    "space-overlay-item-gap": {
      "aliasTarget": {
        "id": "space-2",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-space-overlay-item-gap": "2px"
      },
      "deprecated": null,
      "description": null,
      "id": "space-overlay-item-gap",
      "mode": "global",
      "rawValue": "{primitive.spacing.2}",
      "sourcePath": "semantic.global.spacing.overlay-item-gap",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 2,
        "unit": "px"
      }
    },
    "space-pane-divider-hit-slop": {
      "aliasTarget": {
        "id": "space-4",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-space-pane-divider-hit-slop": "4px"
      },
      "deprecated": null,
      "description": null,
      "id": "space-pane-divider-hit-slop",
      "mode": "global",
      "rawValue": "{primitive.spacing.4}",
      "sourcePath": "semantic.global.spacing.pane-divider-hit-slop",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 4,
        "unit": "px"
      }
    },
    "space-progress-ring-gap": {
      "aliasTarget": {
        "id": "space-2",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-space-progress-ring-gap": "2px"
      },
      "deprecated": null,
      "description": null,
      "id": "space-progress-ring-gap",
      "mode": "global",
      "rawValue": "{primitive.spacing.2}",
      "sourcePath": "semantic.global.spacing.progress-ring-gap",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 2,
        "unit": "px"
      }
    },
    "space-stack-md": {
      "aliasTarget": {
        "id": "space-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-space-stack-md": "12px"
      },
      "deprecated": null,
      "description": null,
      "id": "space-stack-md",
      "mode": "global",
      "rawValue": "{primitive.spacing.12}",
      "sourcePath": "semantic.global.spacing.stack-md",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 12,
        "unit": "px"
      }
    },
    "space-stack-xs": {
      "aliasTarget": {
        "id": "space-4",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-space-stack-xs": "4px"
      },
      "deprecated": null,
      "description": null,
      "id": "space-stack-xs",
      "mode": "global",
      "rawValue": "{primitive.spacing.4}",
      "sourcePath": "semantic.global.spacing.stack-xs",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 4,
        "unit": "px"
      }
    },
    "space-toast-inline": {
      "aliasTarget": {
        "id": "space-20",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-space-toast-inline": "20px"
      },
      "deprecated": null,
      "description": null,
      "id": "space-toast-inline",
      "mode": "global",
      "rawValue": "{primitive.spacing.20}",
      "sourcePath": "semantic.global.spacing.toast-inline",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 20,
        "unit": "px"
      }
    },
    "space-underline-gap": {
      "aliasTarget": {
        "id": "space-2",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-space-underline-gap": "2px"
      },
      "deprecated": null,
      "description": null,
      "id": "space-underline-gap",
      "mode": "global",
      "rawValue": "{primitive.spacing.2}",
      "sourcePath": "semantic.global.spacing.underline-gap",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 2,
        "unit": "px"
      }
    },
    "type-body-14-size": {
      "aliasTarget": {
        "id": "font-size-body-sm",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-type-body-14-size": "14px"
      },
      "deprecated": null,
      "description": null,
      "id": "type-body-14-size",
      "mode": "global",
      "rawValue": "{primitive.font-size.body-sm}",
      "sourcePath": "semantic.global.type.body-14-size",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 14,
        "unit": "px"
      }
    },
    "type-body-16-size": {
      "aliasTarget": {
        "id": "font-size-body-md",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-type-body-16-size": "16px"
      },
      "deprecated": null,
      "description": null,
      "id": "type-body-16-size",
      "mode": "global",
      "rawValue": "{primitive.font-size.body-md}",
      "sourcePath": "semantic.global.type.body-16-size",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 16,
        "unit": "px"
      }
    },
    "type-body-20-size": {
      "aliasTarget": {
        "id": "font-size-body-lg",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-type-body-20-size": "20px"
      },
      "deprecated": null,
      "description": null,
      "id": "type-body-20-size",
      "mode": "global",
      "rawValue": "{primitive.font-size.body-lg}",
      "sourcePath": "semantic.global.type.body-20-size",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 20,
        "unit": "px"
      }
    },
    "type-caption-12-size": {
      "aliasTarget": {
        "id": "font-size-caption",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-type-caption-12-size": "12px"
      },
      "deprecated": null,
      "description": null,
      "id": "type-caption-12-size",
      "mode": "global",
      "rawValue": "{primitive.font-size.caption}",
      "sourcePath": "semantic.global.type.caption-12-size",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 12,
        "unit": "px"
      }
    },
    "type-heading-28-size": {
      "aliasTarget": {
        "id": "font-size-heading-sm",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-type-heading-28-size": "28px"
      },
      "deprecated": null,
      "description": null,
      "id": "type-heading-28-size",
      "mode": "global",
      "rawValue": "{primitive.font-size.heading-sm}",
      "sourcePath": "semantic.global.type.heading-28-size",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 28,
        "unit": "px"
      }
    },
    "type-heading-36-size": {
      "aliasTarget": {
        "id": "font-size-heading-md",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-type-heading-36-size": "36px"
      },
      "deprecated": null,
      "description": null,
      "id": "type-heading-36-size",
      "mode": "global",
      "rawValue": "{primitive.font-size.heading-md}",
      "sourcePath": "semantic.global.type.heading-36-size",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 36,
        "unit": "px"
      }
    },
    "type-heading-48-size": {
      "aliasTarget": {
        "id": "font-size-heading-lg",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-type-heading-48-size": "48px"
      },
      "deprecated": null,
      "description": null,
      "id": "type-heading-48-size",
      "mode": "global",
      "rawValue": "{primitive.font-size.heading-lg}",
      "sourcePath": "semantic.global.type.heading-48-size",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 48,
        "unit": "px"
      }
    },
    "type-line-height-percent-body-14": {
      "aliasTarget": {
        "id": "line-height-percent-150",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-type-line-height-percent-body-14": "150"
      },
      "deprecated": null,
      "description": null,
      "id": "type-line-height-percent-body-14",
      "mode": "global",
      "rawValue": "{primitive.line-height.percent-150}",
      "sourcePath": "semantic.global.type-line-height-percent.body-14",
      "tier": "semantic",
      "type": "number",
      "value": 150
    },
    "type-line-height-percent-body-16": {
      "aliasTarget": {
        "id": "line-height-percent-150",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-type-line-height-percent-body-16": "150"
      },
      "deprecated": null,
      "description": null,
      "id": "type-line-height-percent-body-16",
      "mode": "global",
      "rawValue": "{primitive.line-height.percent-150}",
      "sourcePath": "semantic.global.type-line-height-percent.body-16",
      "tier": "semantic",
      "type": "number",
      "value": 150
    },
    "type-line-height-percent-body-20": {
      "aliasTarget": {
        "id": "line-height-percent-150",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-type-line-height-percent-body-20": "150"
      },
      "deprecated": null,
      "description": null,
      "id": "type-line-height-percent-body-20",
      "mode": "global",
      "rawValue": "{primitive.line-height.percent-150}",
      "sourcePath": "semantic.global.type-line-height-percent.body-20",
      "tier": "semantic",
      "type": "number",
      "value": 150
    },
    "type-line-height-percent-caption-12": {
      "aliasTarget": {
        "id": "line-height-percent-150",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-type-line-height-percent-caption-12": "150"
      },
      "deprecated": null,
      "description": null,
      "id": "type-line-height-percent-caption-12",
      "mode": "global",
      "rawValue": "{primitive.line-height.percent-150}",
      "sourcePath": "semantic.global.type-line-height-percent.caption-12",
      "tier": "semantic",
      "type": "number",
      "value": 150
    },
    "type-line-height-percent-heading-28": {
      "aliasTarget": {
        "id": "line-height-percent-135",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-type-line-height-percent-heading-28": "135"
      },
      "deprecated": null,
      "description": null,
      "id": "type-line-height-percent-heading-28",
      "mode": "global",
      "rawValue": "{primitive.line-height.percent-135}",
      "sourcePath": "semantic.global.type-line-height-percent.heading-28",
      "tier": "semantic",
      "type": "number",
      "value": 135
    },
    "type-line-height-percent-heading-36": {
      "aliasTarget": {
        "id": "line-height-percent-135",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-type-line-height-percent-heading-36": "135"
      },
      "deprecated": null,
      "description": null,
      "id": "type-line-height-percent-heading-36",
      "mode": "global",
      "rawValue": "{primitive.line-height.percent-135}",
      "sourcePath": "semantic.global.type-line-height-percent.heading-36",
      "tier": "semantic",
      "type": "number",
      "value": 135
    },
    "type-line-height-percent-heading-48": {
      "aliasTarget": {
        "id": "line-height-percent-135",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-type-line-height-percent-heading-48": "135"
      },
      "deprecated": null,
      "description": null,
      "id": "type-line-height-percent-heading-48",
      "mode": "global",
      "rawValue": "{primitive.line-height.percent-135}",
      "sourcePath": "semantic.global.type-line-height-percent.heading-48",
      "tier": "semantic",
      "type": "number",
      "value": 135
    },
    "type-line-height-percent-project-card-overlay": {
      "aliasTarget": {
        "id": "line-height-percent-120",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-type-line-height-percent-project-card-overlay": "120"
      },
      "deprecated": null,
      "description": null,
      "id": "type-line-height-percent-project-card-overlay",
      "mode": "global",
      "rawValue": "{primitive.line-height.percent-120}",
      "sourcePath": "semantic.global.type-line-height-percent.project-card-overlay",
      "tier": "semantic",
      "type": "number",
      "value": 120
    },
    "type-line-height-percent-tooltip": {
      "aliasTarget": {
        "id": "line-height-percent-150",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-type-line-height-percent-tooltip": "150"
      },
      "deprecated": null,
      "description": null,
      "id": "type-line-height-percent-tooltip",
      "mode": "global",
      "rawValue": "{primitive.line-height.percent-150}",
      "sourcePath": "semantic.global.type-line-height-percent.tooltip",
      "tier": "semantic",
      "type": "number",
      "value": 150
    },
    "type-weight-medium": {
      "aliasTarget": {
        "id": "font-weight-medium",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-type-weight-medium": "500"
      },
      "deprecated": null,
      "description": null,
      "id": "type-weight-medium",
      "mode": "global",
      "rawValue": "{primitive.font-weight.medium}",
      "sourcePath": "semantic.global.type-weight.medium",
      "tier": "semantic",
      "type": "fontWeight",
      "value": 500
    },
    "type-weight-regular": {
      "aliasTarget": {
        "id": "font-weight-regular",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-type-weight-regular": "400"
      },
      "deprecated": null,
      "description": null,
      "id": "type-weight-regular",
      "mode": "global",
      "rawValue": "{primitive.font-weight.regular}",
      "sourcePath": "semantic.global.type-weight.regular",
      "tier": "semantic",
      "type": "fontWeight",
      "value": 400
    },
    "type-weight-semibold": {
      "aliasTarget": {
        "id": "font-weight-semibold",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-type-weight-semibold": "600"
      },
      "deprecated": null,
      "description": null,
      "id": "type-weight-semibold",
      "mode": "global",
      "rawValue": "{primitive.font-weight.semibold}",
      "sourcePath": "semantic.global.type-weight.semibold",
      "tier": "semantic",
      "type": "fontWeight",
      "value": 600
    },
    "type-weight-tooltip": {
      "aliasTarget": {
        "id": "font-weight-regular",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-type-weight-tooltip": "400"
      },
      "deprecated": null,
      "description": null,
      "id": "type-weight-tooltip",
      "mode": "global",
      "rawValue": "{primitive.font-weight.regular}",
      "sourcePath": "semantic.global.type-weight.tooltip",
      "tier": "semantic",
      "type": "fontWeight",
      "value": 400
    },
    "typography-body-lg-medium": {
      "aliasTarget": {
        "id": "type-style-body-lg-medium",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-typography-body-lg-medium-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--louis-typography-body-lg-medium-font-size": "20px",
        "--louis-typography-body-lg-medium-font-weight": "500",
        "--louis-typography-body-lg-medium-letter-spacing": "-0.2px",
        "--louis-typography-body-lg-medium-line-height": "1.5"
      },
      "deprecated": null,
      "description": null,
      "id": "typography-body-lg-medium",
      "mode": "global",
      "rawValue": "{primitive.typography.body-lg-medium}",
      "sourcePath": "semantic.global.typography.body-lg-medium",
      "tier": "semantic",
      "type": "typography",
      "value": {
        "fontFamily": [
          "Pretendard Variable",
          "Pretendard",
          "Inter",
          "Noto Sans KR",
          "Noto Sans JP",
          "system-ui",
          "sans-serif"
        ],
        "fontSize": {
          "value": 20,
          "unit": "px"
        },
        "fontWeight": 500,
        "letterSpacing": {
          "value": -0.2,
          "unit": "px"
        },
        "lineHeight": 1.5
      }
    },
    "typography-body-lg-regular": {
      "aliasTarget": {
        "id": "type-style-body-lg-regular",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-typography-body-lg-regular-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--louis-typography-body-lg-regular-font-size": "20px",
        "--louis-typography-body-lg-regular-font-weight": "400",
        "--louis-typography-body-lg-regular-letter-spacing": "-0.2px",
        "--louis-typography-body-lg-regular-line-height": "1.5"
      },
      "deprecated": null,
      "description": null,
      "id": "typography-body-lg-regular",
      "mode": "global",
      "rawValue": "{primitive.typography.body-lg-regular}",
      "sourcePath": "semantic.global.typography.body-lg-regular",
      "tier": "semantic",
      "type": "typography",
      "value": {
        "fontFamily": [
          "Pretendard Variable",
          "Pretendard",
          "Inter",
          "Noto Sans KR",
          "Noto Sans JP",
          "system-ui",
          "sans-serif"
        ],
        "fontSize": {
          "value": 20,
          "unit": "px"
        },
        "fontWeight": 400,
        "letterSpacing": {
          "value": -0.2,
          "unit": "px"
        },
        "lineHeight": 1.5
      }
    },
    "typography-body-lg-semibold": {
      "aliasTarget": {
        "id": "type-style-body-lg-semibold",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-typography-body-lg-semibold-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--louis-typography-body-lg-semibold-font-size": "20px",
        "--louis-typography-body-lg-semibold-font-weight": "600",
        "--louis-typography-body-lg-semibold-letter-spacing": "-0.2px",
        "--louis-typography-body-lg-semibold-line-height": "1.5"
      },
      "deprecated": null,
      "description": null,
      "id": "typography-body-lg-semibold",
      "mode": "global",
      "rawValue": "{primitive.typography.body-lg-semibold}",
      "sourcePath": "semantic.global.typography.body-lg-semibold",
      "tier": "semantic",
      "type": "typography",
      "value": {
        "fontFamily": [
          "Pretendard Variable",
          "Pretendard",
          "Inter",
          "Noto Sans KR",
          "Noto Sans JP",
          "system-ui",
          "sans-serif"
        ],
        "fontSize": {
          "value": 20,
          "unit": "px"
        },
        "fontWeight": 600,
        "letterSpacing": {
          "value": -0.2,
          "unit": "px"
        },
        "lineHeight": 1.5
      }
    },
    "typography-body-md-medium": {
      "aliasTarget": {
        "id": "type-style-body-md-medium",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-typography-body-md-medium-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--louis-typography-body-md-medium-font-size": "16px",
        "--louis-typography-body-md-medium-font-weight": "500",
        "--louis-typography-body-md-medium-letter-spacing": "-0.16px",
        "--louis-typography-body-md-medium-line-height": "1.5"
      },
      "deprecated": null,
      "description": null,
      "id": "typography-body-md-medium",
      "mode": "global",
      "rawValue": "{primitive.typography.body-md-medium}",
      "sourcePath": "semantic.global.typography.body-md-medium",
      "tier": "semantic",
      "type": "typography",
      "value": {
        "fontFamily": [
          "Pretendard Variable",
          "Pretendard",
          "Inter",
          "Noto Sans KR",
          "Noto Sans JP",
          "system-ui",
          "sans-serif"
        ],
        "fontSize": {
          "value": 16,
          "unit": "px"
        },
        "fontWeight": 500,
        "letterSpacing": {
          "value": -0.16,
          "unit": "px"
        },
        "lineHeight": 1.5
      }
    },
    "typography-body-md-regular": {
      "aliasTarget": {
        "id": "type-style-body-md-regular",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-typography-body-md-regular-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--louis-typography-body-md-regular-font-size": "16px",
        "--louis-typography-body-md-regular-font-weight": "400",
        "--louis-typography-body-md-regular-letter-spacing": "-0.16px",
        "--louis-typography-body-md-regular-line-height": "1.5"
      },
      "deprecated": null,
      "description": null,
      "id": "typography-body-md-regular",
      "mode": "global",
      "rawValue": "{primitive.typography.body-md-regular}",
      "sourcePath": "semantic.global.typography.body-md-regular",
      "tier": "semantic",
      "type": "typography",
      "value": {
        "fontFamily": [
          "Pretendard Variable",
          "Pretendard",
          "Inter",
          "Noto Sans KR",
          "Noto Sans JP",
          "system-ui",
          "sans-serif"
        ],
        "fontSize": {
          "value": 16,
          "unit": "px"
        },
        "fontWeight": 400,
        "letterSpacing": {
          "value": -0.16,
          "unit": "px"
        },
        "lineHeight": 1.5
      }
    },
    "typography-body-md-semibold": {
      "aliasTarget": {
        "id": "type-style-body-md-semibold",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-typography-body-md-semibold-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--louis-typography-body-md-semibold-font-size": "16px",
        "--louis-typography-body-md-semibold-font-weight": "600",
        "--louis-typography-body-md-semibold-letter-spacing": "-0.16px",
        "--louis-typography-body-md-semibold-line-height": "1.5"
      },
      "deprecated": null,
      "description": null,
      "id": "typography-body-md-semibold",
      "mode": "global",
      "rawValue": "{primitive.typography.body-md-semibold}",
      "sourcePath": "semantic.global.typography.body-md-semibold",
      "tier": "semantic",
      "type": "typography",
      "value": {
        "fontFamily": [
          "Pretendard Variable",
          "Pretendard",
          "Inter",
          "Noto Sans KR",
          "Noto Sans JP",
          "system-ui",
          "sans-serif"
        ],
        "fontSize": {
          "value": 16,
          "unit": "px"
        },
        "fontWeight": 600,
        "letterSpacing": {
          "value": -0.16,
          "unit": "px"
        },
        "lineHeight": 1.5
      }
    },
    "typography-body-sm-medium": {
      "aliasTarget": {
        "id": "type-style-body-sm-medium",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-typography-body-sm-medium-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--louis-typography-body-sm-medium-font-size": "14px",
        "--louis-typography-body-sm-medium-font-weight": "500",
        "--louis-typography-body-sm-medium-letter-spacing": "-0.14px",
        "--louis-typography-body-sm-medium-line-height": "1.5"
      },
      "deprecated": null,
      "description": null,
      "id": "typography-body-sm-medium",
      "mode": "global",
      "rawValue": "{primitive.typography.body-sm-medium}",
      "sourcePath": "semantic.global.typography.body-sm-medium",
      "tier": "semantic",
      "type": "typography",
      "value": {
        "fontFamily": [
          "Pretendard Variable",
          "Pretendard",
          "Inter",
          "Noto Sans KR",
          "Noto Sans JP",
          "system-ui",
          "sans-serif"
        ],
        "fontSize": {
          "value": 14,
          "unit": "px"
        },
        "fontWeight": 500,
        "letterSpacing": {
          "value": -0.14,
          "unit": "px"
        },
        "lineHeight": 1.5
      }
    },
    "typography-body-sm-regular": {
      "aliasTarget": {
        "id": "type-style-body-sm-regular",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-typography-body-sm-regular-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--louis-typography-body-sm-regular-font-size": "14px",
        "--louis-typography-body-sm-regular-font-weight": "400",
        "--louis-typography-body-sm-regular-letter-spacing": "-0.14px",
        "--louis-typography-body-sm-regular-line-height": "1.5"
      },
      "deprecated": null,
      "description": null,
      "id": "typography-body-sm-regular",
      "mode": "global",
      "rawValue": "{primitive.typography.body-sm-regular}",
      "sourcePath": "semantic.global.typography.body-sm-regular",
      "tier": "semantic",
      "type": "typography",
      "value": {
        "fontFamily": [
          "Pretendard Variable",
          "Pretendard",
          "Inter",
          "Noto Sans KR",
          "Noto Sans JP",
          "system-ui",
          "sans-serif"
        ],
        "fontSize": {
          "value": 14,
          "unit": "px"
        },
        "fontWeight": 400,
        "letterSpacing": {
          "value": -0.14,
          "unit": "px"
        },
        "lineHeight": 1.5
      }
    },
    "typography-body-sm-semibold": {
      "aliasTarget": {
        "id": "type-style-body-sm-semibold",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-typography-body-sm-semibold-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--louis-typography-body-sm-semibold-font-size": "14px",
        "--louis-typography-body-sm-semibold-font-weight": "600",
        "--louis-typography-body-sm-semibold-letter-spacing": "-0.14px",
        "--louis-typography-body-sm-semibold-line-height": "1.5"
      },
      "deprecated": null,
      "description": null,
      "id": "typography-body-sm-semibold",
      "mode": "global",
      "rawValue": "{primitive.typography.body-sm-semibold}",
      "sourcePath": "semantic.global.typography.body-sm-semibold",
      "tier": "semantic",
      "type": "typography",
      "value": {
        "fontFamily": [
          "Pretendard Variable",
          "Pretendard",
          "Inter",
          "Noto Sans KR",
          "Noto Sans JP",
          "system-ui",
          "sans-serif"
        ],
        "fontSize": {
          "value": 14,
          "unit": "px"
        },
        "fontWeight": 600,
        "letterSpacing": {
          "value": -0.14,
          "unit": "px"
        },
        "lineHeight": 1.5
      }
    },
    "typography-caption-medium": {
      "aliasTarget": {
        "id": "type-style-caption-medium",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-typography-caption-medium-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--louis-typography-caption-medium-font-size": "12px",
        "--louis-typography-caption-medium-font-weight": "500",
        "--louis-typography-caption-medium-letter-spacing": "-0.12px",
        "--louis-typography-caption-medium-line-height": "1.5"
      },
      "deprecated": null,
      "description": null,
      "id": "typography-caption-medium",
      "mode": "global",
      "rawValue": "{primitive.typography.caption-medium}",
      "sourcePath": "semantic.global.typography.caption-medium",
      "tier": "semantic",
      "type": "typography",
      "value": {
        "fontFamily": [
          "Pretendard Variable",
          "Pretendard",
          "Inter",
          "Noto Sans KR",
          "Noto Sans JP",
          "system-ui",
          "sans-serif"
        ],
        "fontSize": {
          "value": 12,
          "unit": "px"
        },
        "fontWeight": 500,
        "letterSpacing": {
          "value": -0.12,
          "unit": "px"
        },
        "lineHeight": 1.5
      }
    },
    "typography-caption-regular": {
      "aliasTarget": {
        "id": "type-style-caption-regular",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-typography-caption-regular-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--louis-typography-caption-regular-font-size": "12px",
        "--louis-typography-caption-regular-font-weight": "400",
        "--louis-typography-caption-regular-letter-spacing": "-0.12px",
        "--louis-typography-caption-regular-line-height": "1.5"
      },
      "deprecated": null,
      "description": null,
      "id": "typography-caption-regular",
      "mode": "global",
      "rawValue": "{primitive.typography.caption-regular}",
      "sourcePath": "semantic.global.typography.caption-regular",
      "tier": "semantic",
      "type": "typography",
      "value": {
        "fontFamily": [
          "Pretendard Variable",
          "Pretendard",
          "Inter",
          "Noto Sans KR",
          "Noto Sans JP",
          "system-ui",
          "sans-serif"
        ],
        "fontSize": {
          "value": 12,
          "unit": "px"
        },
        "fontWeight": 400,
        "letterSpacing": {
          "value": -0.12,
          "unit": "px"
        },
        "lineHeight": 1.5
      }
    },
    "typography-caption-semibold": {
      "aliasTarget": {
        "id": "type-style-caption-semibold",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-typography-caption-semibold-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--louis-typography-caption-semibold-font-size": "12px",
        "--louis-typography-caption-semibold-font-weight": "600",
        "--louis-typography-caption-semibold-letter-spacing": "-0.12px",
        "--louis-typography-caption-semibold-line-height": "1.5"
      },
      "deprecated": null,
      "description": null,
      "id": "typography-caption-semibold",
      "mode": "global",
      "rawValue": "{primitive.typography.caption-semibold}",
      "sourcePath": "semantic.global.typography.caption-semibold",
      "tier": "semantic",
      "type": "typography",
      "value": {
        "fontFamily": [
          "Pretendard Variable",
          "Pretendard",
          "Inter",
          "Noto Sans KR",
          "Noto Sans JP",
          "system-ui",
          "sans-serif"
        ],
        "fontSize": {
          "value": 12,
          "unit": "px"
        },
        "fontWeight": 600,
        "letterSpacing": {
          "value": -0.12,
          "unit": "px"
        },
        "lineHeight": 1.5
      }
    },
    "typography-heading-lg-medium": {
      "aliasTarget": {
        "id": "type-style-heading-lg-medium",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-typography-heading-lg-medium-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--louis-typography-heading-lg-medium-font-size": "48px",
        "--louis-typography-heading-lg-medium-font-weight": "500",
        "--louis-typography-heading-lg-medium-letter-spacing": "-0.96px",
        "--louis-typography-heading-lg-medium-line-height": "1.35"
      },
      "deprecated": null,
      "description": null,
      "id": "typography-heading-lg-medium",
      "mode": "global",
      "rawValue": "{primitive.typography.heading-lg-medium}",
      "sourcePath": "semantic.global.typography.heading-lg-medium",
      "tier": "semantic",
      "type": "typography",
      "value": {
        "fontFamily": [
          "Pretendard Variable",
          "Pretendard",
          "Inter",
          "Noto Sans KR",
          "Noto Sans JP",
          "system-ui",
          "sans-serif"
        ],
        "fontSize": {
          "value": 48,
          "unit": "px"
        },
        "fontWeight": 500,
        "letterSpacing": {
          "value": -0.96,
          "unit": "px"
        },
        "lineHeight": 1.35
      }
    },
    "typography-heading-md-medium": {
      "aliasTarget": {
        "id": "type-style-heading-md-medium",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-typography-heading-md-medium-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--louis-typography-heading-md-medium-font-size": "36px",
        "--louis-typography-heading-md-medium-font-weight": "500",
        "--louis-typography-heading-md-medium-letter-spacing": "-0.72px",
        "--louis-typography-heading-md-medium-line-height": "1.35"
      },
      "deprecated": null,
      "description": null,
      "id": "typography-heading-md-medium",
      "mode": "global",
      "rawValue": "{primitive.typography.heading-md-medium}",
      "sourcePath": "semantic.global.typography.heading-md-medium",
      "tier": "semantic",
      "type": "typography",
      "value": {
        "fontFamily": [
          "Pretendard Variable",
          "Pretendard",
          "Inter",
          "Noto Sans KR",
          "Noto Sans JP",
          "system-ui",
          "sans-serif"
        ],
        "fontSize": {
          "value": 36,
          "unit": "px"
        },
        "fontWeight": 500,
        "letterSpacing": {
          "value": -0.72,
          "unit": "px"
        },
        "lineHeight": 1.35
      }
    },
    "typography-heading-md-semibold": {
      "aliasTarget": {
        "id": "type-style-heading-md-semibold",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-typography-heading-md-semibold-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--louis-typography-heading-md-semibold-font-size": "36px",
        "--louis-typography-heading-md-semibold-font-weight": "600",
        "--louis-typography-heading-md-semibold-letter-spacing": "-0.72px",
        "--louis-typography-heading-md-semibold-line-height": "1.35"
      },
      "deprecated": null,
      "description": null,
      "id": "typography-heading-md-semibold",
      "mode": "global",
      "rawValue": "{primitive.typography.heading-md-semibold}",
      "sourcePath": "semantic.global.typography.heading-md-semibold",
      "tier": "semantic",
      "type": "typography",
      "value": {
        "fontFamily": [
          "Pretendard Variable",
          "Pretendard",
          "Inter",
          "Noto Sans KR",
          "Noto Sans JP",
          "system-ui",
          "sans-serif"
        ],
        "fontSize": {
          "value": 36,
          "unit": "px"
        },
        "fontWeight": 600,
        "letterSpacing": {
          "value": -0.72,
          "unit": "px"
        },
        "lineHeight": 1.35
      }
    },
    "typography-heading-sm-medium": {
      "aliasTarget": {
        "id": "type-style-heading-sm-medium",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-typography-heading-sm-medium-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--louis-typography-heading-sm-medium-font-size": "28px",
        "--louis-typography-heading-sm-medium-font-weight": "500",
        "--louis-typography-heading-sm-medium-letter-spacing": "-0.56px",
        "--louis-typography-heading-sm-medium-line-height": "1.35"
      },
      "deprecated": null,
      "description": null,
      "id": "typography-heading-sm-medium",
      "mode": "global",
      "rawValue": "{primitive.typography.heading-sm-medium}",
      "sourcePath": "semantic.global.typography.heading-sm-medium",
      "tier": "semantic",
      "type": "typography",
      "value": {
        "fontFamily": [
          "Pretendard Variable",
          "Pretendard",
          "Inter",
          "Noto Sans KR",
          "Noto Sans JP",
          "system-ui",
          "sans-serif"
        ],
        "fontSize": {
          "value": 28,
          "unit": "px"
        },
        "fontWeight": 500,
        "letterSpacing": {
          "value": -0.56,
          "unit": "px"
        },
        "lineHeight": 1.35
      }
    }
  },
  "light": {
    "color-accent-danger": {
      "aliasTarget": {
        "id": "color-red-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-danger": "color(srgb 1 0.294118 0.34902 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-danger",
      "mode": "light",
      "rawValue": "{primitive.color.red.500}",
      "sourcePath": "semantic.light.color.accent-danger",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 1
      }
    },
    "color-accent-danger-secondary": {
      "aliasTarget": {
        "id": "color-red-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-danger-secondary": "color(srgb 1 0.294118 0.34902 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-danger-secondary",
      "mode": "light",
      "rawValue": "{primitive.color.red-alpha.12}",
      "sourcePath": "semantic.light.color.accent-danger-secondary",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 0.12
      }
    },
    "color-accent-danger-secondary-hover": {
      "aliasTarget": {
        "id": "color-red-alpha-24",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-danger-secondary-hover": "color(srgb 1 0.294118 0.34902 / 0.24)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-danger-secondary-hover",
      "mode": "light",
      "rawValue": "{primitive.color.red-alpha.24}",
      "sourcePath": "semantic.light.color.accent-danger-secondary-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 0.24
      }
    },
    "color-accent-ghost-hover": {
      "aliasTarget": {
        "id": "color-static-black-alpha-08",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-ghost-hover": "color(srgb 0.090196 0.105882 0.133333 / 0.08)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-ghost-hover",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.08}",
      "sourcePath": "semantic.light.color.accent-ghost-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.08
      }
    },
    "color-accent-green-500-alpha-08": {
      "aliasTarget": {
        "id": "color-green-500-alpha-08",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-green-500-alpha-08": "color(srgb 0 0.776471 0.556863 / 0.08)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-green-500-alpha-08",
      "mode": "light",
      "rawValue": "{primitive.color.green-500-alpha.08}",
      "sourcePath": "semantic.light.color.accent.green.500-alpha.08",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.776471,
          0.556863
        ],
        "alpha": 0.08
      }
    },
    "color-accent-inverse": {
      "aliasTarget": {
        "id": "color-static-black",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-inverse": "color(srgb 0 0 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-inverse",
      "mode": "light",
      "rawValue": "{primitive.color.static.black}",
      "sourcePath": "semantic.light.color.accent-inverse",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 1
      }
    },
    "color-accent-menu-danger-hover": {
      "aliasTarget": {
        "id": "color-red-alpha-08",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-menu-danger-hover": "color(srgb 1 0.294118 0.34902 / 0.08)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-menu-danger-hover",
      "mode": "light",
      "rawValue": "{primitive.color.red-alpha.08}",
      "sourcePath": "semantic.light.color.accent-menu-danger-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 0.08
      }
    },
    "color-accent-menu-item-hover": {
      "aliasTarget": {
        "id": "color-static-black-alpha-04",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-menu-item-hover": "color(srgb 0.090196 0.105882 0.133333 / 0.04)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-menu-item-hover",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.04}",
      "sourcePath": "semantic.light.color.accent-menu-item-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.04
      }
    },
    "color-accent-primary": {
      "aliasTarget": {
        "id": "color-blue-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-primary": "color(srgb 0 0.533333 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-primary",
      "mode": "light",
      "rawValue": "{primitive.color.blue.500}",
      "sourcePath": "semantic.light.color.accent-primary",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.533333,
          1
        ],
        "alpha": 1
      }
    },
    "color-accent-primary-active": {
      "aliasTarget": {
        "id": "color-blue-600",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-primary-active": "color(srgb 0 0.458824 0.858824 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-primary-active",
      "mode": "light",
      "rawValue": "{primitive.color.blue.600}",
      "sourcePath": "semantic.light.color.accent-primary-active",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.458824,
          0.858824
        ],
        "alpha": 1
      }
    },
    "color-accent-primary-hover": {
      "aliasTarget": {
        "id": "color-blue-400",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-primary-hover": "color(srgb 0.219608 0.643137 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-primary-hover",
      "mode": "light",
      "rawValue": "{primitive.color.blue.400}",
      "sourcePath": "semantic.light.color.accent-primary-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.219608,
          0.643137,
          1
        ],
        "alpha": 1
      }
    },
    "color-accent-secondary": {
      "aliasTarget": {
        "id": "color-static-black-alpha-08",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-secondary": "color(srgb 0.090196 0.105882 0.133333 / 0.08)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-secondary",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.08}",
      "sourcePath": "semantic.light.color.accent-secondary",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.08
      }
    },
    "color-accent-secondary-foreground": {
      "aliasTarget": {
        "id": "color-palette-gray-600",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-secondary-foreground": "color(srgb 0.345098 0.360784 0.388235 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-secondary-foreground",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.600}",
      "sourcePath": "semantic.light.color.accent-secondary-foreground",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.345098,
          0.360784,
          0.388235
        ],
        "alpha": 1
      }
    },
    "color-accent-secondary-hover": {
      "aliasTarget": {
        "id": "color-static-black-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-secondary-hover": "color(srgb 0.090196 0.105882 0.133333 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-secondary-hover",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.12}",
      "sourcePath": "semantic.light.color.accent-secondary-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.12
      }
    },
    "color-accent-secondary-selected": {
      "aliasTarget": {
        "id": "color-static-white",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-secondary-selected": "color(srgb 1 1 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-secondary-selected",
      "mode": "light",
      "rawValue": "{primitive.color.static.white}",
      "sourcePath": "semantic.light.color.accent-secondary-selected",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          1,
          1
        ],
        "alpha": 1
      }
    },
    "color-alert-danger-foreground": {
      "aliasTarget": {
        "id": "color-red-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-danger-foreground": "color(srgb 0.717647 0.141176 0.192157 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-danger-foreground",
      "mode": "light",
      "rawValue": "{primitive.color.red.700}",
      "sourcePath": "semantic.light.color.alert-danger-foreground",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.717647,
          0.141176,
          0.192157
        ],
        "alpha": 1
      }
    },
    "color-alert-danger-stroke": {
      "aliasTarget": {
        "id": "color-red-alpha-24",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-danger-stroke": "color(srgb 1 0.294118 0.34902 / 0.24)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-danger-stroke",
      "mode": "light",
      "rawValue": "{primitive.color.red-alpha.24}",
      "sourcePath": "semantic.light.color.alert-danger-stroke",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 0.24
      }
    },
    "color-alert-danger-surface": {
      "aliasTarget": {
        "id": "color-red-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-danger-surface": "color(srgb 1 0.294118 0.34902 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-danger-surface",
      "mode": "light",
      "rawValue": "{primitive.color.red-alpha.12}",
      "sourcePath": "semantic.light.color.alert-danger-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 0.12
      }
    },
    "color-alert-info-foreground": {
      "aliasTarget": {
        "id": "color-blue-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-info-foreground": "color(srgb 0 0.372549 0.701961 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-info-foreground",
      "mode": "light",
      "rawValue": "{primitive.color.blue.700}",
      "sourcePath": "semantic.light.color.alert-info-foreground",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.372549,
          0.701961
        ],
        "alpha": 1
      }
    },
    "color-alert-info-stroke": {
      "aliasTarget": {
        "id": "color-blue-200",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-info-stroke": "color(srgb 0.639216 0.835294 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-info-stroke",
      "mode": "light",
      "rawValue": "{primitive.color.blue.200}",
      "sourcePath": "semantic.light.color.alert-info-stroke",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.639216,
          0.835294,
          1
        ],
        "alpha": 1
      }
    },
    "color-alert-info-surface": {
      "aliasTarget": {
        "id": "color-blue-050",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-info-surface": "color(srgb 0.941176 0.968627 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-info-surface",
      "mode": "light",
      "rawValue": "{primitive.color.blue.050}",
      "sourcePath": "semantic.light.color.alert-info-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.941176,
          0.968627,
          1
        ],
        "alpha": 1
      }
    },
    "color-alert-success-foreground": {
      "aliasTarget": {
        "id": "color-green-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-success-foreground": "color(srgb 0 0.560784 0.403922 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-success-foreground",
      "mode": "light",
      "rawValue": "{primitive.color.green.700}",
      "sourcePath": "semantic.light.color.alert-success-foreground",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.560784,
          0.403922
        ],
        "alpha": 1
      }
    },
    "color-alert-success-stroke": {
      "aliasTarget": {
        "id": "color-green-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-success-stroke": "color(srgb 0 0.776471 0.556863 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-success-stroke",
      "mode": "light",
      "rawValue": "{primitive.color.green.500}",
      "sourcePath": "semantic.light.color.alert-success-stroke",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.776471,
          0.556863
        ],
        "alpha": 1
      }
    },
    "color-alert-success-surface": {
      "aliasTarget": {
        "id": "color-green-100",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-success-surface": "color(srgb 0.898039 1 0.968627 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-success-surface",
      "mode": "light",
      "rawValue": "{primitive.color.green.100}",
      "sourcePath": "semantic.light.color.alert-success-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.898039,
          1,
          0.968627
        ],
        "alpha": 1
      }
    },
    "color-alert-warning-foreground": {
      "aliasTarget": {
        "id": "color-yellow-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-warning-foreground": "color(srgb 0.721569 0.462745 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-warning-foreground",
      "mode": "light",
      "rawValue": "{primitive.color.yellow.700}",
      "sourcePath": "semantic.light.color.alert-warning-foreground",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.721569,
          0.462745,
          0
        ],
        "alpha": 1
      }
    },
    "color-alert-warning-stroke": {
      "aliasTarget": {
        "id": "color-yellow-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-warning-stroke": "color(srgb 1 0.698039 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-warning-stroke",
      "mode": "light",
      "rawValue": "{primitive.color.yellow.500}",
      "sourcePath": "semantic.light.color.alert-warning-stroke",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.698039,
          0
        ],
        "alpha": 1
      }
    },
    "color-alert-warning-surface": {
      "aliasTarget": {
        "id": "color-yellow-100",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-warning-surface": "color(srgb 1 0.960784 0.839216 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-warning-surface",
      "mode": "light",
      "rawValue": "{primitive.color.yellow.100}",
      "sourcePath": "semantic.light.color.alert-warning-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.960784,
          0.839216
        ],
        "alpha": 1
      }
    },
    "color-app-avatar-default-ink": {
      "aliasTarget": {
        "id": "color-palette-gray-400",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-app-avatar-default-ink": "color(srgb 0.545098 0.556863 0.576471 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-app-avatar-default-ink",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.400}",
      "sourcePath": "semantic.light.color.app.avatar-default-ink",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.545098,
          0.556863,
          0.576471
        ],
        "alpha": 1
      }
    },
    "color-app-nav-chip-tint": {
      "aliasTarget": {
        "id": "color-static-black-alpha-04",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-app-nav-chip-tint": "color(srgb 0.090196 0.105882 0.133333 / 0.04)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-app-nav-chip-tint",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.04}",
      "sourcePath": "semantic.light.color.app.nav-chip-tint",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.04
      }
    },
    "color-app-nav-create-btn-bg": {
      "aliasTarget": {
        "id": "color-palette-gray-200",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-app-nav-create-btn-bg": "color(srgb 0.756863 0.764706 0.776471 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-app-nav-create-btn-bg",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.200}",
      "sourcePath": "semantic.light.color.app.nav-create-btn-bg",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.756863,
          0.764706,
          0.776471
        ],
        "alpha": 1
      }
    },
    "color-app-page-bg": {
      "aliasTarget": {
        "id": "color-palette-gray-100",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-app-page-bg": "color(srgb 0.862745 0.870588 0.882353 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-app-page-bg",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.100}",
      "sourcePath": "semantic.light.color.app.page-bg",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.862745,
          0.870588,
          0.882353
        ],
        "alpha": 1
      }
    },
    "color-app-tooltip-bg": {
      "aliasTarget": {
        "id": "color-palette-gray-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-app-tooltip-bg": "color(srgb 0.168627 0.184314 0.211765 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-app-tooltip-bg",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.800}",
      "sourcePath": "semantic.light.color.app.tooltip-bg",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.168627,
          0.184314,
          0.211765
        ],
        "alpha": 1
      }
    },
    "color-app-tooltip-border": {
      "aliasTarget": {
        "id": "color-static-white-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-app-tooltip-border": "color(srgb 0.980392 0.980392 0.980392 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-app-tooltip-border",
      "mode": "light",
      "rawValue": "{primitive.color.static-white-alpha.12}",
      "sourcePath": "semantic.light.color.app.tooltip-border",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.12
      }
    },
    "color-app-tooltip-kbd-bg": {
      "aliasTarget": {
        "id": "color-static-black-alpha-08",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-app-tooltip-kbd-bg": "color(srgb 0.090196 0.105882 0.133333 / 0.08)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-app-tooltip-kbd-bg",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.08}",
      "sourcePath": "semantic.light.color.app.tooltip-kbd-bg",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.08
      }
    },
    "color-app-tooltip-text": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-app-tooltip-text": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-app-tooltip-text",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.light.color.app.tooltip-text",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-app-tooltip-text-subtle": {
      "aliasTarget": {
        "id": "color-static-white-alpha-72",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-app-tooltip-text-subtle": "color(srgb 0.980392 0.980392 0.980392 / 0.72)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-app-tooltip-text-subtle",
      "mode": "light",
      "rawValue": "{primitive.color.static-white-alpha.72}",
      "sourcePath": "semantic.light.color.app.tooltip-text-subtle",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.72
      }
    },
    "color-bg-canvas": {
      "aliasTarget": {
        "id": "color-palette-gray-025",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-canvas": "color(srgb 0.94902 0.952941 0.960784 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-canvas",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.025}",
      "sourcePath": "semantic.light.color.bg-canvas",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.94902,
          0.952941,
          0.960784
        ],
        "alpha": 1
      }
    },
    "color-bg-danger": {
      "aliasTarget": {
        "id": "color-red-100",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-danger": "color(srgb 1 0.898039 0.909804 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-danger",
      "mode": "light",
      "rawValue": "{primitive.color.red.100}",
      "sourcePath": "semantic.light.color.bg-danger",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.898039,
          0.909804
        ],
        "alpha": 1
      }
    },
    "color-bg-info": {
      "aliasTarget": {
        "id": "color-blue-050",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-info": "color(srgb 0.941176 0.968627 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-info",
      "mode": "light",
      "rawValue": "{primitive.color.blue.050}",
      "sourcePath": "semantic.light.color.bg-info",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.941176,
          0.968627,
          1
        ],
        "alpha": 1
      }
    },
    "color-bg-inset": {
      "aliasTarget": {
        "id": "color-palette-gray-025",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-inset": "color(srgb 0.94902 0.952941 0.960784 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-inset",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.025}",
      "sourcePath": "semantic.light.color.bg-inset",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.94902,
          0.952941,
          0.960784
        ],
        "alpha": 1
      }
    },
    "color-bg-inverse": {
      "aliasTarget": {
        "id": "color-palette-gray-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-inverse": "color(srgb 0.168627 0.184314 0.211765 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-inverse",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.800}",
      "sourcePath": "semantic.light.color.bg-inverse",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.168627,
          0.184314,
          0.211765
        ],
        "alpha": 1
      }
    },
    "color-bg-inverse-translucent": {
      "aliasTarget": {
        "id": "color-static-black-alpha-72",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-inverse-translucent": "color(srgb 0.090196 0.105882 0.133333 / 0.72)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-inverse-translucent",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.72}",
      "sourcePath": "semantic.light.color.bg-inverse-translucent",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.72
      }
    },
    "color-bg-menu": {
      "aliasTarget": {
        "id": "color-palette-gray-050",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-menu": "color(srgb 0.921569 0.92549 0.933333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-menu",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.050}",
      "sourcePath": "semantic.light.color.bg-menu",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.921569,
          0.92549,
          0.933333
        ],
        "alpha": 1
      }
    },
    "color-bg-overlay": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-overlay": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-overlay",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.light.color.bg-overlay",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-bg-raised": {
      "aliasTarget": {
        "id": "color-static-white",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-raised": "color(srgb 1 1 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-raised",
      "mode": "light",
      "rawValue": "{primitive.color.static.white}",
      "sourcePath": "semantic.light.color.bg-raised",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          1,
          1
        ],
        "alpha": 1
      }
    },
    "color-bg-success": {
      "aliasTarget": {
        "id": "color-green-100",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-success": "color(srgb 0.898039 1 0.968627 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-success",
      "mode": "light",
      "rawValue": "{primitive.color.green.100}",
      "sourcePath": "semantic.light.color.bg-success",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.898039,
          1,
          0.968627
        ],
        "alpha": 1
      }
    },
    "color-bg-surface": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-surface": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-surface",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.light.color.bg-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-bg-surface-translucent": {
      "aliasTarget": {
        "id": "color-static-white-alpha-72",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-surface-translucent": "color(srgb 0.980392 0.980392 0.980392 / 0.72)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-surface-translucent",
      "mode": "light",
      "rawValue": "{primitive.color.static-white-alpha.72}",
      "sourcePath": "semantic.light.color.bg-surface-translucent",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.72
      }
    },
    "color-bg-upgrade": {
      "aliasTarget": {
        "id": "color-palette-gray-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-upgrade": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-upgrade",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.900}",
      "sourcePath": "semantic.light.color.bg-upgrade",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 1
      }
    },
    "color-bg-upgrade-current": {
      "aliasTarget": {
        "id": "color-palette-gray-050",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-upgrade-current": "color(srgb 0.921569 0.92549 0.933333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-upgrade-current",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.050}",
      "sourcePath": "semantic.light.color.bg-upgrade-current",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.921569,
          0.92549,
          0.933333
        ],
        "alpha": 1
      }
    },
    "color-bg-upgrade-hover": {
      "aliasTarget": {
        "id": "color-palette-gray-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-upgrade-hover": "color(srgb 0.168627 0.184314 0.211765 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-upgrade-hover",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.800}",
      "sourcePath": "semantic.light.color.bg-upgrade-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.168627,
          0.184314,
          0.211765
        ],
        "alpha": 1
      }
    },
    "color-bg-warning": {
      "aliasTarget": {
        "id": "color-yellow-100",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-warning": "color(srgb 1 0.960784 0.839216 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-warning",
      "mode": "light",
      "rawValue": "{primitive.color.yellow.100}",
      "sourcePath": "semantic.light.color.bg-warning",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.960784,
          0.839216
        ],
        "alpha": 1
      }
    },
    "color-brand-logo-ink": {
      "aliasTarget": {
        "id": "color-static-black",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-brand-logo-ink": "color(srgb 0 0 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-brand-logo-ink",
      "mode": "light",
      "rawValue": "{primitive.color.static.black}",
      "sourcePath": "semantic.light.color.brand.logo-ink",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 1
      }
    },
    "color-dim-modal": {
      "aliasTarget": {
        "id": "color-static-black-alpha-56",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-dim-modal": "color(srgb 0.090196 0.105882 0.133333 / 0.56)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-dim-modal",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.56}",
      "sourcePath": "semantic.light.color.dim-modal",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.56
      }
    },
    "color-fg-danger": {
      "aliasTarget": {
        "id": "color-red-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-danger": "color(srgb 0.329412 0.066667 0.098039 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-danger",
      "mode": "light",
      "rawValue": "{primitive.color.red.900}",
      "sourcePath": "semantic.light.color.fg-danger",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.329412,
          0.066667,
          0.098039
        ],
        "alpha": 1
      }
    },
    "color-fg-danger-on-surface": {
      "aliasTarget": {
        "id": "color-red-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-danger-on-surface": "color(srgb 0.717647 0.141176 0.192157 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-danger-on-surface",
      "mode": "light",
      "rawValue": "{primitive.color.red.700}",
      "sourcePath": "semantic.light.color.fg-danger-on-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.717647,
          0.141176,
          0.192157
        ],
        "alpha": 1
      }
    },
    "color-fg-disabled": {
      "aliasTarget": {
        "id": "color-palette-gray-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-disabled": "color(srgb 0.447059 0.458824 0.482353 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-disabled",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.500}",
      "sourcePath": "semantic.light.color.fg-disabled",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.447059,
          0.458824,
          0.482353
        ],
        "alpha": 1
      }
    },
    "color-fg-info": {
      "aliasTarget": {
        "id": "color-blue-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-info": "color(srgb 0 0.203922 0.380392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-info",
      "mode": "light",
      "rawValue": "{primitive.color.blue.900}",
      "sourcePath": "semantic.light.color.fg-info",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.203922,
          0.380392
        ],
        "alpha": 1
      }
    },
    "color-fg-inverse": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-inverse": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-inverse",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.light.color.fg-inverse",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-fg-menu-item": {
      "aliasTarget": {
        "id": "color-static-black-alpha-88",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-menu-item": "color(srgb 0.090196 0.105882 0.133333 / 0.88)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-menu-item",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.88}",
      "sourcePath": "semantic.light.color.fg-menu-item",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.88
      }
    },
    "color-fg-on-accent-inverse": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-on-accent-inverse": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-on-accent-inverse",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.light.color.fg-on-accent-inverse",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-fg-on-danger": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-on-danger": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-on-danger",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.light.color.fg-on-danger",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-fg-on-inverse": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-on-inverse": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-on-inverse",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.light.color.fg-on-inverse",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-fg-primary": {
      "aliasTarget": {
        "id": "color-palette-gray-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-primary": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-primary",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.900}",
      "sourcePath": "semantic.light.color.fg-primary",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 1
      }
    },
    "color-fg-secondary": {
      "aliasTarget": {
        "id": "color-palette-gray-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-secondary": "color(srgb 0.254902 0.270588 0.298039 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-secondary",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.700}",
      "sourcePath": "semantic.light.color.fg-secondary",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.254902,
          0.270588,
          0.298039
        ],
        "alpha": 1
      }
    },
    "color-fg-success": {
      "aliasTarget": {
        "id": "color-green-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-success": "color(srgb 0 0.298039 0.223529 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-success",
      "mode": "light",
      "rawValue": "{primitive.color.green.900}",
      "sourcePath": "semantic.light.color.fg-success",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.298039,
          0.223529
        ],
        "alpha": 1
      }
    },
    "color-fg-tertiary": {
      "aliasTarget": {
        "id": "color-palette-gray-600",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-tertiary": "color(srgb 0.345098 0.360784 0.388235 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-tertiary",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.600}",
      "sourcePath": "semantic.light.color.fg-tertiary",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.345098,
          0.360784,
          0.388235
        ],
        "alpha": 1
      }
    },
    "color-fg-upgrade": {
      "aliasTarget": {
        "id": "color-palette-gray-050",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-upgrade": "color(srgb 0.921569 0.92549 0.933333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-upgrade",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.050}",
      "sourcePath": "semantic.light.color.fg-upgrade",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.921569,
          0.92549,
          0.933333
        ],
        "alpha": 1
      }
    },
    "color-fg-upgrade-current": {
      "aliasTarget": {
        "id": "color-static-black",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-upgrade-current": "color(srgb 0 0 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-upgrade-current",
      "mode": "light",
      "rawValue": "{primitive.color.static.black}",
      "sourcePath": "semantic.light.color.fg-upgrade-current",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 1
      }
    },
    "color-fg-upgrade-hover": {
      "aliasTarget": {
        "id": "color-palette-gray-050",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-upgrade-hover": "color(srgb 0.921569 0.92549 0.933333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-upgrade-hover",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.050}",
      "sourcePath": "semantic.light.color.fg-upgrade-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.921569,
          0.92549,
          0.933333
        ],
        "alpha": 1
      }
    },
    "color-fg-warning": {
      "aliasTarget": {
        "id": "color-yellow-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-warning": "color(srgb 0.298039 0.2 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-warning",
      "mode": "light",
      "rawValue": "{primitive.color.yellow.900}",
      "sourcePath": "semantic.light.color.fg-warning",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.298039,
          0.2,
          0
        ],
        "alpha": 1
      }
    },
    "color-gray-000": {
      "aliasTarget": {
        "id": "color-static-black",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000": "color(srgb 0 0 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000",
      "mode": "light",
      "rawValue": "{primitive.color.static.black}",
      "sourcePath": "semantic.light.color.gray.000",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 1
      }
    },
    "color-gray-000-alpha-04": {
      "aliasTarget": {
        "id": "color-static-black-alpha-04",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-04": "color(srgb 0.090196 0.105882 0.133333 / 0.04)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-04",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.04}",
      "sourcePath": "semantic.light.color.gray.000-alpha.04",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.04
      }
    },
    "color-gray-000-alpha-08": {
      "aliasTarget": {
        "id": "color-static-black-alpha-08",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-08": "color(srgb 0.090196 0.105882 0.133333 / 0.08)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-08",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.08}",
      "sourcePath": "semantic.light.color.gray.000-alpha.08",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.08
      }
    },
    "color-gray-000-alpha-12": {
      "aliasTarget": {
        "id": "color-static-black-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-12": "color(srgb 0.090196 0.105882 0.133333 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-12",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.12}",
      "sourcePath": "semantic.light.color.gray.000-alpha.12",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.12
      }
    },
    "color-gray-000-alpha-16": {
      "aliasTarget": {
        "id": "color-static-black-alpha-16",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-16": "color(srgb 0.090196 0.105882 0.133333 / 0.16)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-16",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.16}",
      "sourcePath": "semantic.light.color.gray.000-alpha.16",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.16
      }
    },
    "color-gray-000-alpha-20": {
      "aliasTarget": {
        "id": "color-static-black-alpha-20",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-20": "color(srgb 0.090196 0.105882 0.133333 / 0.2)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-20",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.20}",
      "sourcePath": "semantic.light.color.gray.000-alpha.20",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.2
      }
    },
    "color-gray-000-alpha-24": {
      "aliasTarget": {
        "id": "color-static-black-alpha-24",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-24": "color(srgb 0.090196 0.105882 0.133333 / 0.24)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-24",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.24}",
      "sourcePath": "semantic.light.color.gray.000-alpha.24",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.24
      }
    },
    "color-gray-000-alpha-28": {
      "aliasTarget": {
        "id": "color-static-black-alpha-28",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-28": "color(srgb 0.090196 0.105882 0.133333 / 0.28)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-28",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.28}",
      "sourcePath": "semantic.light.color.gray.000-alpha.28",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.28
      }
    },
    "color-gray-000-alpha-32": {
      "aliasTarget": {
        "id": "color-static-black-alpha-32",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-32": "color(srgb 0.090196 0.105882 0.133333 / 0.32)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-32",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.32}",
      "sourcePath": "semantic.light.color.gray.000-alpha.32",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.32
      }
    },
    "color-gray-000-alpha-40": {
      "aliasTarget": {
        "id": "color-static-black-alpha-40",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-40": "color(srgb 0.090196 0.105882 0.133333 / 0.4)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-40",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.40}",
      "sourcePath": "semantic.light.color.gray.000-alpha.40",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.4
      }
    },
    "color-gray-000-alpha-48": {
      "aliasTarget": {
        "id": "color-static-black-alpha-48",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-48": "color(srgb 0.090196 0.105882 0.133333 / 0.48)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-48",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.48}",
      "sourcePath": "semantic.light.color.gray.000-alpha.48",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.48
      }
    },
    "color-gray-000-alpha-56": {
      "aliasTarget": {
        "id": "color-static-black-alpha-56",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-56": "color(srgb 0.090196 0.105882 0.133333 / 0.56)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-56",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.56}",
      "sourcePath": "semantic.light.color.gray.000-alpha.56",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.56
      }
    },
    "color-gray-000-alpha-64": {
      "aliasTarget": {
        "id": "color-static-black-alpha-64",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-64": "color(srgb 0.090196 0.105882 0.133333 / 0.64)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-64",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.64}",
      "sourcePath": "semantic.light.color.gray.000-alpha.64",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.64
      }
    },
    "color-gray-000-alpha-72": {
      "aliasTarget": {
        "id": "color-static-black-alpha-72",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-72": "color(srgb 0.090196 0.105882 0.133333 / 0.72)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-72",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.72}",
      "sourcePath": "semantic.light.color.gray.000-alpha.72",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.72
      }
    },
    "color-gray-000-alpha-80": {
      "aliasTarget": {
        "id": "color-static-black-alpha-80",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-80": "color(srgb 0.090196 0.105882 0.133333 / 0.8)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-80",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.80}",
      "sourcePath": "semantic.light.color.gray.000-alpha.80",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.8
      }
    },
    "color-gray-000-alpha-88": {
      "aliasTarget": {
        "id": "color-static-black-alpha-88",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-88": "color(srgb 0.090196 0.105882 0.133333 / 0.88)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-88",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.88}",
      "sourcePath": "semantic.light.color.gray.000-alpha.88",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.88
      }
    },
    "color-gray-000-alpha-96": {
      "aliasTarget": {
        "id": "color-static-black-alpha-96",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-96": "color(srgb 0.090196 0.105882 0.133333 / 0.96)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-96",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.96}",
      "sourcePath": "semantic.light.color.gray.000-alpha.96",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.96
      }
    },
    "color-gray-100": {
      "aliasTarget": {
        "id": "color-palette-gray-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-100": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-100",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.900}",
      "sourcePath": "semantic.light.color.gray.100",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 1
      }
    },
    "color-gray-1000": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-1000": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-1000",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.light.color.gray.1000",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-gray-200": {
      "aliasTarget": {
        "id": "color-palette-gray-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-200": "color(srgb 0.168627 0.184314 0.211765 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-200",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.800}",
      "sourcePath": "semantic.light.color.gray.200",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.168627,
          0.184314,
          0.211765
        ],
        "alpha": 1
      }
    },
    "color-gray-300": {
      "aliasTarget": {
        "id": "color-palette-gray-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-300": "color(srgb 0.254902 0.270588 0.298039 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-300",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.700}",
      "sourcePath": "semantic.light.color.gray.300",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.254902,
          0.270588,
          0.298039
        ],
        "alpha": 1
      }
    },
    "color-gray-400": {
      "aliasTarget": {
        "id": "color-palette-gray-600",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-400": "color(srgb 0.345098 0.360784 0.388235 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-400",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.600}",
      "sourcePath": "semantic.light.color.gray.400",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.345098,
          0.360784,
          0.388235
        ],
        "alpha": 1
      }
    },
    "color-gray-500": {
      "aliasTarget": {
        "id": "color-palette-gray-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-500": "color(srgb 0.447059 0.458824 0.482353 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-500",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.500}",
      "sourcePath": "semantic.light.color.gray.500",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.447059,
          0.458824,
          0.482353
        ],
        "alpha": 1
      }
    },
    "color-gray-600": {
      "aliasTarget": {
        "id": "color-palette-gray-400",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-600": "color(srgb 0.545098 0.556863 0.576471 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-600",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.400}",
      "sourcePath": "semantic.light.color.gray.600",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.545098,
          0.556863,
          0.576471
        ],
        "alpha": 1
      }
    },
    "color-gray-700": {
      "aliasTarget": {
        "id": "color-palette-gray-300",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-700": "color(srgb 0.647059 0.658824 0.678431 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-700",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.300}",
      "sourcePath": "semantic.light.color.gray.700",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.647059,
          0.658824,
          0.678431
        ],
        "alpha": 1
      }
    },
    "color-gray-800": {
      "aliasTarget": {
        "id": "color-palette-gray-200",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-800": "color(srgb 0.756863 0.764706 0.776471 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-800",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.200}",
      "sourcePath": "semantic.light.color.gray.800",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.756863,
          0.764706,
          0.776471
        ],
        "alpha": 1
      }
    },
    "color-gray-900": {
      "aliasTarget": {
        "id": "color-palette-gray-100",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-900": "color(srgb 0.862745 0.870588 0.882353 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-900",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.100}",
      "sourcePath": "semantic.light.color.gray.900",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.862745,
          0.870588,
          0.882353
        ],
        "alpha": 1
      }
    },
    "color-icon-input-glyph": {
      "aliasTarget": {
        "id": "color-static-black-alpha-40",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-icon-input-glyph": "color(srgb 0.090196 0.105882 0.133333 / 0.4)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-icon-input-glyph",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.40}",
      "sourcePath": "semantic.light.color.icon.input-glyph",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.4
      }
    },
    "color-landing-line": {
      "aliasTarget": {
        "id": "color-static-black-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-landing-line": "color(srgb 0.090196 0.105882 0.133333 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-landing-line",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.12}",
      "sourcePath": "semantic.light.color.landing.line",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.12
      }
    },
    "color-landing-page-bg": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-landing-page-bg": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-landing-page-bg",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.light.color.landing.page-bg",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-landing-panel": {
      "aliasTarget": {
        "id": "color-static-black-alpha-04",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-landing-panel": "color(srgb 0.090196 0.105882 0.133333 / 0.04)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-landing-panel",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.04}",
      "sourcePath": "semantic.light.color.landing.panel",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.04
      }
    },
    "color-landing-panel-strong": {
      "aliasTarget": {
        "id": "color-palette-gray-050",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-landing-panel-strong": "color(srgb 0.921569 0.92549 0.933333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-landing-panel-strong",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.050}",
      "sourcePath": "semantic.light.color.landing.panel-strong",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.921569,
          0.92549,
          0.933333
        ],
        "alpha": 1
      }
    },
    "color-landing-text-muted": {
      "aliasTarget": {
        "id": "color-static-black-alpha-64",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-landing-text-muted": "color(srgb 0.090196 0.105882 0.133333 / 0.64)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-landing-text-muted",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.64}",
      "sourcePath": "semantic.light.color.landing.text-muted",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.64
      }
    },
    "color-landing-text-soft": {
      "aliasTarget": {
        "id": "color-static-black-alpha-72",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-landing-text-soft": "color(srgb 0.090196 0.105882 0.133333 / 0.72)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-landing-text-soft",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.72}",
      "sourcePath": "semantic.light.color.landing.text-soft",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.72
      }
    },
    "color-media-control-foreground": {
      "aliasTarget": {
        "id": "color-static-white-alpha-88",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-media-control-foreground": "color(srgb 0.980392 0.980392 0.980392 / 0.88)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-control-foreground",
      "mode": "light",
      "rawValue": "{primitive.color.static-white-alpha.88}",
      "sourcePath": "semantic.light.color.media-control-foreground",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.88
      }
    },
    "color-media-control-hover": {
      "aliasTarget": {
        "id": "color-static-white-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-media-control-hover": "color(srgb 0.980392 0.980392 0.980392 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-control-hover",
      "mode": "light",
      "rawValue": "{primitive.color.static-white-alpha.12}",
      "sourcePath": "semantic.light.color.media-control-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.12
      }
    },
    "color-media-control-surface": {
      "aliasTarget": {
        "id": "color-static-black-alpha-28",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-media-control-surface": "color(srgb 0.090196 0.105882 0.133333 / 0.28)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-control-surface",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.28}",
      "sourcePath": "semantic.light.color.media-control-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.28
      }
    },
    "color-media-foreground-bright": {
      "aliasTarget": {
        "id": "color-palette-gray-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-media-foreground-bright": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-foreground-bright",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.900}",
      "sourcePath": "semantic.light.color.media-foreground-bright",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 1
      }
    },
    "color-media-foreground-dark": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-media-foreground-dark": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-foreground-dark",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.light.color.media-foreground-dark",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-media-indicator-active": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-media-indicator-active": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-indicator-active",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.light.color.media-indicator-active",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-media-indicator-rest": {
      "aliasTarget": {
        "id": "color-static-white-alpha-28",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-media-indicator-rest": "color(srgb 0.980392 0.980392 0.980392 / 0.28)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-indicator-rest",
      "mode": "light",
      "rawValue": "{primitive.color.static-white-alpha.28}",
      "sourcePath": "semantic.light.color.media-indicator-rest",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.28
      }
    },
    "color-media-scrim-bright": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-media-scrim-bright": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-scrim-bright",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.light.color.media-scrim-bright",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-media-scrim-dark": {
      "aliasTarget": {
        "id": "color-static-black",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-media-scrim-dark": "color(srgb 0 0 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-scrim-dark",
      "mode": "light",
      "rawValue": "{primitive.color.static.black}",
      "sourcePath": "semantic.light.color.media-scrim-dark",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 1
      }
    },
    "color-node-audio-accent": {
      "aliasTarget": {
        "id": "color-pink-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-audio-accent": "color(srgb 1 0.301961 0.533333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-audio-accent",
      "mode": "light",
      "rawValue": "{primitive.color.pink.500}",
      "sourcePath": "semantic.light.color.node-audio-accent",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.301961,
          0.533333
        ],
        "alpha": 1
      }
    },
    "color-node-audio-icon": {
      "aliasTarget": {
        "id": "color-pink-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-audio-icon": "color(srgb 1 0.301961 0.533333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-audio-icon",
      "mode": "light",
      "rawValue": "{primitive.color.pink.500}",
      "sourcePath": "semantic.light.color.node-audio-icon",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.301961,
          0.533333
        ],
        "alpha": 1
      }
    },
    "color-node-audio-surface": {
      "aliasTarget": {
        "id": "color-pink-200",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-audio-surface": "color(srgb 1 0.756863 0.839216 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-audio-surface",
      "mode": "light",
      "rawValue": "{primitive.color.pink.200}",
      "sourcePath": "semantic.light.color.node-audio-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.756863,
          0.839216
        ],
        "alpha": 1
      }
    },
    "color-node-canvas-dot": {
      "aliasTarget": {
        "id": "color-static-black-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-canvas-dot": "color(srgb 0.090196 0.105882 0.133333 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-canvas-dot",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.12}",
      "sourcePath": "semantic.light.color.node.canvas-dot",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.12
      }
    },
    "color-node-chip-fg-disabled": {
      "aliasTarget": {
        "id": "color-palette-gray-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-chip-fg-disabled": "color(srgb 0.447059 0.458824 0.482353 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-chip-fg-disabled",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.500}",
      "sourcePath": "semantic.light.color.node-chip-fg-disabled",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.447059,
          0.458824,
          0.482353
        ],
        "alpha": 1
      }
    },
    "color-node-chip-surface": {
      "aliasTarget": {
        "id": "color-palette-gray-050",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-chip-surface": "color(srgb 0.921569 0.92549 0.933333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-chip-surface",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.050}",
      "sourcePath": "semantic.light.color.node-chip-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.921569,
          0.92549,
          0.933333
        ],
        "alpha": 1
      }
    },
    "color-node-chip-surface-hover": {
      "aliasTarget": {
        "id": "color-palette-gray-100",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-chip-surface-hover": "color(srgb 0.862745 0.870588 0.882353 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-chip-surface-hover",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.100}",
      "sourcePath": "semantic.light.color.node-chip-surface-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.862745,
          0.870588,
          0.882353
        ],
        "alpha": 1
      }
    },
    "color-node-chrome-btn-bg": {
      "aliasTarget": {
        "id": "color-palette-gray-050",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-chrome-btn-bg": "color(srgb 0.921569 0.92549 0.933333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-chrome-btn-bg",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.050}",
      "sourcePath": "semantic.light.color.node.chrome-btn-bg",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.921569,
          0.92549,
          0.933333
        ],
        "alpha": 1
      }
    },
    "color-node-edit-accent": {
      "aliasTarget": {
        "id": "color-violet-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-edit-accent": "color(srgb 0.376471 0.333333 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-edit-accent",
      "mode": "light",
      "rawValue": "{primitive.color.violet.500}",
      "sourcePath": "semantic.light.color.node-edit-accent",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.376471,
          0.333333,
          1
        ],
        "alpha": 1
      }
    },
    "color-node-edit-icon": {
      "aliasTarget": {
        "id": "color-violet-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-edit-icon": "color(srgb 0.376471 0.333333 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-edit-icon",
      "mode": "light",
      "rawValue": "{primitive.color.violet.500}",
      "sourcePath": "semantic.light.color.node-edit-icon",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.376471,
          0.333333,
          1
        ],
        "alpha": 1
      }
    },
    "color-node-edit-surface": {
      "aliasTarget": {
        "id": "color-violet-200",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-edit-surface": "color(srgb 0.788235 0.760784 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-edit-surface",
      "mode": "light",
      "rawValue": "{primitive.color.violet.200}",
      "sourcePath": "semantic.light.color.node-edit-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.788235,
          0.760784,
          1
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-audio": {
      "aliasTarget": {
        "id": "color-pink-200",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-audio": "color(srgb 1 0.756863 0.839216 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-audio",
      "mode": "light",
      "rawValue": "{primitive.color.pink.200}",
      "sourcePath": "semantic.light.color.node.handle-bg-audio",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.756863,
          0.839216
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-disabled-audio": {
      "aliasTarget": {
        "id": "color-pink-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-disabled-audio": "color(srgb 0.329412 0.066667 0.164706 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-disabled-audio",
      "mode": "light",
      "rawValue": "{primitive.color.pink.900}",
      "sourcePath": "semantic.light.color.node.handle-bg-disabled-audio",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.329412,
          0.066667,
          0.164706
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-disabled-edit": {
      "aliasTarget": {
        "id": "color-violet-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-disabled-edit": "color(srgb 0.082353 0.062745 0.301961 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-disabled-edit",
      "mode": "light",
      "rawValue": "{primitive.color.violet.900}",
      "sourcePath": "semantic.light.color.node.handle-bg-disabled-edit",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.082353,
          0.062745,
          0.301961
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-disabled-image": {
      "aliasTarget": {
        "id": "color-green-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-disabled-image": "color(srgb 0 0.298039 0.223529 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-disabled-image",
      "mode": "light",
      "rawValue": "{primitive.color.green.900}",
      "sourcePath": "semantic.light.color.node.handle-bg-disabled-image",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.298039,
          0.223529
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-disabled-instagram": {
      "aliasTarget": {
        "id": "color-red-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-disabled-instagram": "color(srgb 0.329412 0.066667 0.098039 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-disabled-instagram",
      "mode": "light",
      "rawValue": "{primitive.color.red.900}",
      "sourcePath": "semantic.light.color.node.handle-bg-disabled-instagram",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.329412,
          0.066667,
          0.098039
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-disabled-text": {
      "aliasTarget": {
        "id": "color-yellow-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-disabled-text": "color(srgb 0.298039 0.2 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-disabled-text",
      "mode": "light",
      "rawValue": "{primitive.color.yellow.900}",
      "sourcePath": "semantic.light.color.node.handle-bg-disabled-text",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.298039,
          0.2,
          0
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-disabled-youtube": {
      "aliasTarget": {
        "id": "color-red-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-disabled-youtube": "color(srgb 0.329412 0.066667 0.098039 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-disabled-youtube",
      "mode": "light",
      "rawValue": "{primitive.color.red.900}",
      "sourcePath": "semantic.light.color.node.handle-bg-disabled-youtube",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.329412,
          0.066667,
          0.098039
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-edit": {
      "aliasTarget": {
        "id": "color-violet-200",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-edit": "color(srgb 0.788235 0.760784 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-edit",
      "mode": "light",
      "rawValue": "{primitive.color.violet.200}",
      "sourcePath": "semantic.light.color.node.handle-bg-edit",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.788235,
          0.760784,
          1
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-image": {
      "aliasTarget": {
        "id": "color-green-200",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-image": "color(srgb 0.721569 0.972549 0.898039 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-image",
      "mode": "light",
      "rawValue": "{primitive.color.green.200}",
      "sourcePath": "semantic.light.color.node.handle-bg-image",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.721569,
          0.972549,
          0.898039
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-instagram": {
      "aliasTarget": {
        "id": "color-red-200",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-instagram": "color(srgb 1 0.768627 0.792157 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-instagram",
      "mode": "light",
      "rawValue": "{primitive.color.red.200}",
      "sourcePath": "semantic.light.color.node.handle-bg-instagram",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.768627,
          0.792157
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-text": {
      "aliasTarget": {
        "id": "color-yellow-200",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-text": "color(srgb 1 0.909804 0.639216 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-text",
      "mode": "light",
      "rawValue": "{primitive.color.yellow.200}",
      "sourcePath": "semantic.light.color.node.handle-bg-text",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.909804,
          0.639216
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-youtube": {
      "aliasTarget": {
        "id": "color-red-200",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-youtube": "color(srgb 1 0.768627 0.792157 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-youtube",
      "mode": "light",
      "rawValue": "{primitive.color.red.200}",
      "sourcePath": "semantic.light.color.node.handle-bg-youtube",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.768627,
          0.792157
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-audio": {
      "aliasTarget": {
        "id": "color-pink-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-audio": "color(srgb 1 0.301961 0.533333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-audio",
      "mode": "light",
      "rawValue": "{primitive.color.pink.500}",
      "sourcePath": "semantic.light.color.node.handle-icon-audio",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.301961,
          0.533333
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-disabled-audio": {
      "aliasTarget": {
        "id": "color-pink-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-disabled-audio": "color(srgb 0.717647 0.141176 0.345098 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-disabled-audio",
      "mode": "light",
      "rawValue": "{primitive.color.pink.700}",
      "sourcePath": "semantic.light.color.node.handle-icon-disabled-audio",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.717647,
          0.141176,
          0.345098
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-disabled-edit": {
      "aliasTarget": {
        "id": "color-violet-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-disabled-edit": "color(srgb 0.207843 0.156863 0.721569 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-disabled-edit",
      "mode": "light",
      "rawValue": "{primitive.color.violet.700}",
      "sourcePath": "semantic.light.color.node.handle-icon-disabled-edit",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.207843,
          0.156863,
          0.721569
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-disabled-image": {
      "aliasTarget": {
        "id": "color-green-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-disabled-image": "color(srgb 0 0.560784 0.403922 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-disabled-image",
      "mode": "light",
      "rawValue": "{primitive.color.green.700}",
      "sourcePath": "semantic.light.color.node.handle-icon-disabled-image",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.560784,
          0.403922
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-disabled-instagram": {
      "aliasTarget": {
        "id": "color-red-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-disabled-instagram": "color(srgb 0.717647 0.141176 0.192157 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-disabled-instagram",
      "mode": "light",
      "rawValue": "{primitive.color.red.700}",
      "sourcePath": "semantic.light.color.node.handle-icon-disabled-instagram",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.717647,
          0.141176,
          0.192157
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-disabled-text": {
      "aliasTarget": {
        "id": "color-yellow-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-disabled-text": "color(srgb 0.721569 0.462745 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-disabled-text",
      "mode": "light",
      "rawValue": "{primitive.color.yellow.700}",
      "sourcePath": "semantic.light.color.node.handle-icon-disabled-text",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.721569,
          0.462745,
          0
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-disabled-youtube": {
      "aliasTarget": {
        "id": "color-red-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-disabled-youtube": "color(srgb 0.717647 0.141176 0.192157 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-disabled-youtube",
      "mode": "light",
      "rawValue": "{primitive.color.red.700}",
      "sourcePath": "semantic.light.color.node.handle-icon-disabled-youtube",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.717647,
          0.141176,
          0.192157
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-edit": {
      "aliasTarget": {
        "id": "color-violet-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-edit": "color(srgb 0.376471 0.333333 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-edit",
      "mode": "light",
      "rawValue": "{primitive.color.violet.500}",
      "sourcePath": "semantic.light.color.node.handle-icon-edit",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.376471,
          0.333333,
          1
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-image": {
      "aliasTarget": {
        "id": "color-green-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-image": "color(srgb 0 0.776471 0.556863 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-image",
      "mode": "light",
      "rawValue": "{primitive.color.green.500}",
      "sourcePath": "semantic.light.color.node.handle-icon-image",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.776471,
          0.556863
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-instagram": {
      "aliasTarget": {
        "id": "color-red-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-instagram": "color(srgb 1 0.294118 0.34902 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-instagram",
      "mode": "light",
      "rawValue": "{primitive.color.red.500}",
      "sourcePath": "semantic.light.color.node.handle-icon-instagram",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-text": {
      "aliasTarget": {
        "id": "color-yellow-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-text": "color(srgb 1 0.698039 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-text",
      "mode": "light",
      "rawValue": "{primitive.color.yellow.500}",
      "sourcePath": "semantic.light.color.node.handle-icon-text",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.698039,
          0
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-youtube": {
      "aliasTarget": {
        "id": "color-red-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-youtube": "color(srgb 1 0.294118 0.34902 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-youtube",
      "mode": "light",
      "rawValue": "{primitive.color.red.500}",
      "sourcePath": "semantic.light.color.node.handle-icon-youtube",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 1
      }
    },
    "color-node-image-accent": {
      "aliasTarget": {
        "id": "color-green-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-image-accent": "color(srgb 0 0.776471 0.556863 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-image-accent",
      "mode": "light",
      "rawValue": "{primitive.color.green.500}",
      "sourcePath": "semantic.light.color.node-image-accent",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.776471,
          0.556863
        ],
        "alpha": 1
      }
    },
    "color-node-image-icon": {
      "aliasTarget": {
        "id": "color-green-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-image-icon": "color(srgb 0 0.776471 0.556863 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-image-icon",
      "mode": "light",
      "rawValue": "{primitive.color.green.500}",
      "sourcePath": "semantic.light.color.node-image-icon",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.776471,
          0.556863
        ],
        "alpha": 1
      }
    },
    "color-node-image-surface": {
      "aliasTarget": {
        "id": "color-green-200",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-image-surface": "color(srgb 0.721569 0.972549 0.898039 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-image-surface",
      "mode": "light",
      "rawValue": "{primitive.color.green.200}",
      "sourcePath": "semantic.light.color.node-image-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.721569,
          0.972549,
          0.898039
        ],
        "alpha": 1
      }
    },
    "color-node-instagram-accent": {
      "aliasTarget": {
        "id": "color-red-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-instagram-accent": "color(srgb 1 0.294118 0.34902 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-instagram-accent",
      "mode": "light",
      "rawValue": "{primitive.color.red.500}",
      "sourcePath": "semantic.light.color.node-instagram-accent",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 1
      }
    },
    "color-node-instagram-icon": {
      "aliasTarget": {
        "id": "color-red-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-instagram-icon": "color(srgb 1 0.294118 0.34902 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-instagram-icon",
      "mode": "light",
      "rawValue": "{primitive.color.red.500}",
      "sourcePath": "semantic.light.color.node-instagram-icon",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 1
      }
    },
    "color-node-instagram-surface": {
      "aliasTarget": {
        "id": "color-red-200",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-instagram-surface": "color(srgb 1 0.768627 0.792157 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-instagram-surface",
      "mode": "light",
      "rawValue": "{primitive.color.red.200}",
      "sourcePath": "semantic.light.color.node-instagram-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.768627,
          0.792157
        ],
        "alpha": 1
      }
    },
    "color-node-text-accent": {
      "aliasTarget": {
        "id": "color-yellow-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-text-accent": "color(srgb 1 0.698039 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-text-accent",
      "mode": "light",
      "rawValue": "{primitive.color.yellow.500}",
      "sourcePath": "semantic.light.color.node-text-accent",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.698039,
          0
        ],
        "alpha": 1
      }
    },
    "color-node-text-icon": {
      "aliasTarget": {
        "id": "color-yellow-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-text-icon": "color(srgb 1 0.698039 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-text-icon",
      "mode": "light",
      "rawValue": "{primitive.color.yellow.500}",
      "sourcePath": "semantic.light.color.node-text-icon",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.698039,
          0
        ],
        "alpha": 1
      }
    },
    "color-node-text-surface": {
      "aliasTarget": {
        "id": "color-yellow-200",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-text-surface": "color(srgb 1 0.909804 0.639216 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-text-surface",
      "mode": "light",
      "rawValue": "{primitive.color.yellow.200}",
      "sourcePath": "semantic.light.color.node-text-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.909804,
          0.639216
        ],
        "alpha": 1
      }
    },
    "color-node-video-accent": {
      "aliasTarget": {
        "id": "color-blue-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-video-accent": "color(srgb 0 0.533333 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-video-accent",
      "mode": "light",
      "rawValue": "{primitive.color.blue.500}",
      "sourcePath": "semantic.light.color.node-video-accent",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.533333,
          1
        ],
        "alpha": 1
      }
    },
    "color-node-youtube-accent": {
      "aliasTarget": {
        "id": "color-red-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-youtube-accent": "color(srgb 1 0.294118 0.34902 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-youtube-accent",
      "mode": "light",
      "rawValue": "{primitive.color.red.500}",
      "sourcePath": "semantic.light.color.node-youtube-accent",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 1
      }
    },
    "color-node-youtube-icon": {
      "aliasTarget": {
        "id": "color-red-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-youtube-icon": "color(srgb 1 0.294118 0.34902 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-youtube-icon",
      "mode": "light",
      "rawValue": "{primitive.color.red.500}",
      "sourcePath": "semantic.light.color.node-youtube-icon",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 1
      }
    },
    "color-node-youtube-surface": {
      "aliasTarget": {
        "id": "color-red-200",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-youtube-surface": "color(srgb 1 0.768627 0.792157 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-youtube-surface",
      "mode": "light",
      "rawValue": "{primitive.color.red.200}",
      "sourcePath": "semantic.light.color.node-youtube-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.768627,
          0.792157
        ],
        "alpha": 1
      }
    },
    "color-progress-fill": {
      "aliasTarget": {
        "id": "color-blue-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-progress-fill": "color(srgb 0 0.533333 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-progress-fill",
      "mode": "light",
      "rawValue": "{primitive.color.blue.500}",
      "sourcePath": "semantic.light.color.progress-fill",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.533333,
          1
        ],
        "alpha": 1
      }
    },
    "color-progress-ring-fill": {
      "aliasTarget": {
        "id": "color-green-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-progress-ring-fill": "color(srgb 0 0.776471 0.556863 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-progress-ring-fill",
      "mode": "light",
      "rawValue": "{primitive.color.green.500}",
      "sourcePath": "semantic.light.color.progress-ring-fill",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.776471,
          0.556863
        ],
        "alpha": 1
      }
    },
    "color-progress-ring-track": {
      "aliasTarget": {
        "id": "color-static-black-alpha-20",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-progress-ring-track": "color(srgb 0.090196 0.105882 0.133333 / 0.2)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-progress-ring-track",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.20}",
      "sourcePath": "semantic.light.color.progress-ring-track",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.2
      }
    },
    "color-progress-track": {
      "aliasTarget": {
        "id": "color-static-black-alpha-08",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-progress-track": "color(srgb 0.090196 0.105882 0.133333 / 0.08)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-progress-track",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.08}",
      "sourcePath": "semantic.light.color.progress-track",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.08
      }
    },
    "color-scrollbar-thumb": {
      "aliasTarget": {
        "id": "color-static-black-alpha-20",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-scrollbar-thumb": "color(srgb 0.090196 0.105882 0.133333 / 0.2)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-scrollbar-thumb",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.20}",
      "sourcePath": "semantic.light.color.scrollbar.thumb",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.2
      }
    },
    "color-scrollbar-thumb-hover": {
      "aliasTarget": {
        "id": "color-static-black-alpha-32",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-scrollbar-thumb-hover": "color(srgb 0.090196 0.105882 0.133333 / 0.32)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-scrollbar-thumb-hover",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.32}",
      "sourcePath": "semantic.light.color.scrollbar.thumb-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.32
      }
    },
    "color-stroke-control": {
      "aliasTarget": {
        "id": "color-static-black-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-stroke-control": "color(srgb 0.090196 0.105882 0.133333 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-stroke-control",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.12}",
      "sourcePath": "semantic.light.color.stroke-control",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.12
      }
    },
    "color-stroke-danger": {
      "aliasTarget": {
        "id": "color-red-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-stroke-danger": "color(srgb 1 0.294118 0.34902 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-stroke-danger",
      "mode": "light",
      "rawValue": "{primitive.color.red.500}",
      "sourcePath": "semantic.light.color.stroke-danger",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 1
      }
    },
    "color-stroke-default": {
      "aliasTarget": {
        "id": "color-palette-gray-300",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-stroke-default": "color(srgb 0.647059 0.658824 0.678431 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-stroke-default",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.300}",
      "sourcePath": "semantic.light.color.stroke-default",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.647059,
          0.658824,
          0.678431
        ],
        "alpha": 1
      }
    },
    "color-stroke-focus": {
      "aliasTarget": {
        "id": "color-blue-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-stroke-focus": "color(srgb 0 0.533333 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-stroke-focus",
      "mode": "light",
      "rawValue": "{primitive.color.blue.500}",
      "sourcePath": "semantic.light.color.stroke-focus",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.533333,
          1
        ],
        "alpha": 1
      }
    },
    "color-stroke-hairline": {
      "aliasTarget": {
        "id": "color-static-black-alpha-08",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-stroke-hairline": "color(srgb 0.090196 0.105882 0.133333 / 0.08)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-stroke-hairline",
      "mode": "light",
      "rawValue": "{primitive.color.static-black-alpha.08}",
      "sourcePath": "semantic.light.color.stroke-hairline",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.08
      }
    },
    "color-stroke-strong": {
      "aliasTarget": {
        "id": "color-palette-gray-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-stroke-strong": "color(srgb 0.447059 0.458824 0.482353 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-stroke-strong",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.500}",
      "sourcePath": "semantic.light.color.stroke-strong",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.447059,
          0.458824,
          0.482353
        ],
        "alpha": 1
      }
    },
    "color-stroke-subtle": {
      "aliasTarget": {
        "id": "color-palette-gray-200",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-stroke-subtle": "color(srgb 0.756863 0.764706 0.776471 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-stroke-subtle",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.200}",
      "sourcePath": "semantic.light.color.stroke-subtle",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.756863,
          0.764706,
          0.776471
        ],
        "alpha": 1
      }
    },
    "color-stroke-tooltip": {
      "aliasTarget": {
        "id": "color-static-white-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-stroke-tooltip": "color(srgb 0.980392 0.980392 0.980392 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-stroke-tooltip",
      "mode": "light",
      "rawValue": "{primitive.color.static-white-alpha.12}",
      "sourcePath": "semantic.light.color.stroke-tooltip",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.12
      }
    },
    "color-stroke-underline": {
      "aliasTarget": {
        "id": "color-palette-gray-400",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-stroke-underline": "color(srgb 0.545098 0.556863 0.576471 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-stroke-underline",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.400}",
      "sourcePath": "semantic.light.color.stroke-underline",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.545098,
          0.556863,
          0.576471
        ],
        "alpha": 1
      }
    },
    "color-switch-off-track": {
      "aliasTarget": {
        "id": "color-static-white-alpha-16",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-switch-off-track": "color(srgb 0.980392 0.980392 0.980392 / 0.16)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-switch-off-track",
      "mode": "light",
      "rawValue": "{primitive.color.static-white-alpha.16}",
      "sourcePath": "semantic.light.color.switch-off-track",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.16
      }
    },
    "color-switch-on-track": {
      "aliasTarget": {
        "id": "color-green-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-switch-on-track": "color(srgb 0 0.776471 0.556863 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-switch-on-track",
      "mode": "light",
      "rawValue": "{primitive.color.green.500}",
      "sourcePath": "semantic.light.color.switch-on-track",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.776471,
          0.556863
        ],
        "alpha": 1
      }
    },
    "color-switch-thumb": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-switch-thumb": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-switch-thumb",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.light.color.switch-thumb",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-table-header-surface": {
      "aliasTarget": {
        "id": "color-palette-gray-100",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-table-header-surface": "color(srgb 0.862745 0.870588 0.882353 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-table-header-surface",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.100}",
      "sourcePath": "semantic.light.color.table-header-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.862745,
          0.870588,
          0.882353
        ],
        "alpha": 1
      }
    },
    "color-table-row-hover": {
      "aliasTarget": {
        "id": "color-palette-gray-050",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-table-row-hover": "color(srgb 0.921569 0.92549 0.933333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-table-row-hover",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.050}",
      "sourcePath": "semantic.light.color.table-row-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.921569,
          0.92549,
          0.933333
        ],
        "alpha": 1
      }
    },
    "color-table-row-line": {
      "aliasTarget": {
        "id": "color-palette-gray-150",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-table-row-line": "color(srgb 0.807843 0.815686 0.831373 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-table-row-line",
      "mode": "light",
      "rawValue": "{primitive.color.palette-gray.150}",
      "sourcePath": "semantic.light.color.table-row-line",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.807843,
          0.815686,
          0.831373
        ],
        "alpha": 1
      }
    },
    "elevation-menu": {
      "aliasTarget": {
        "id": "shadow-menu-light",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-elevation-menu": "0px 12px 32px 0px color(srgb 0 0 0 / 0.24)"
      },
      "deprecated": null,
      "description": null,
      "id": "elevation-menu",
      "mode": "light",
      "rawValue": "{primitive.shadow.menu-light}",
      "sourcePath": "semantic.light.elevation.menu",
      "tier": "semantic",
      "type": "shadow",
      "value": [
        {
          "color": {
            "colorSpace": "srgb",
            "components": [
              0,
              0,
              0
            ],
            "alpha": 0.24
          },
          "offsetX": {
            "value": 0,
            "unit": "px"
          },
          "offsetY": {
            "value": 12,
            "unit": "px"
          },
          "blur": {
            "value": 32,
            "unit": "px"
          },
          "spread": {
            "value": 0,
            "unit": "px"
          },
          "inset": false
        }
      ]
    },
    "elevation-tooltip": {
      "aliasTarget": {
        "id": "shadow-tooltip-light",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-elevation-tooltip": "0px 12px 24px 0px color(srgb 0.466667 0.490196 0.537255 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "elevation-tooltip",
      "mode": "light",
      "rawValue": "{primitive.shadow.tooltip-light}",
      "sourcePath": "semantic.light.elevation.tooltip",
      "tier": "semantic",
      "type": "shadow",
      "value": {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0.466667,
            0.490196,
            0.537255
          ],
          "alpha": 0.12
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 12,
          "unit": "px"
        },
        "blur": {
          "value": 24,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        },
        "inset": false
      }
    },
    "elevation-upgrade": {
      "aliasTarget": {
        "id": "shadow-upgrade-light",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-elevation-upgrade": "inset 0px 0px 0px 1px color(srgb 0.980392 0.980392 0.980392 / 0.08), 0px 1px 2px 0px color(srgb 0 0 0 / 0.04)"
      },
      "deprecated": null,
      "description": null,
      "id": "elevation-upgrade",
      "mode": "light",
      "rawValue": "{primitive.shadow.upgrade-light}",
      "sourcePath": "semantic.light.elevation.upgrade",
      "tier": "semantic",
      "type": "shadow",
      "value": [
        {
          "color": {
            "colorSpace": "srgb",
            "components": [
              0.980392,
              0.980392,
              0.980392
            ],
            "alpha": 0.08
          },
          "offsetX": {
            "value": 0,
            "unit": "px"
          },
          "offsetY": {
            "value": 0,
            "unit": "px"
          },
          "blur": {
            "value": 0,
            "unit": "px"
          },
          "spread": {
            "value": 1,
            "unit": "px"
          },
          "inset": true
        },
        {
          "color": {
            "colorSpace": "srgb",
            "components": [
              0,
              0,
              0
            ],
            "alpha": 0.04
          },
          "offsetX": {
            "value": 0,
            "unit": "px"
          },
          "offsetY": {
            "value": 1,
            "unit": "px"
          },
          "blur": {
            "value": 2,
            "unit": "px"
          },
          "spread": {
            "value": 0,
            "unit": "px"
          },
          "inset": false
        }
      ]
    }
  },
  "dark": {
    "color-accent-danger": {
      "aliasTarget": {
        "id": "color-red-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-danger": "color(srgb 1 0.294118 0.34902 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-danger",
      "mode": "dark",
      "rawValue": "{primitive.color.red.500}",
      "sourcePath": "semantic.dark.color.accent-danger",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 1
      }
    },
    "color-accent-danger-secondary": {
      "aliasTarget": {
        "id": "color-red-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-danger-secondary": "color(srgb 1 0.294118 0.34902 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-danger-secondary",
      "mode": "dark",
      "rawValue": "{primitive.color.red-alpha.12}",
      "sourcePath": "semantic.dark.color.accent-danger-secondary",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 0.12
      }
    },
    "color-accent-danger-secondary-hover": {
      "aliasTarget": {
        "id": "color-red-alpha-24",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-danger-secondary-hover": "color(srgb 1 0.294118 0.34902 / 0.24)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-danger-secondary-hover",
      "mode": "dark",
      "rawValue": "{primitive.color.red-alpha.24}",
      "sourcePath": "semantic.dark.color.accent-danger-secondary-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 0.24
      }
    },
    "color-accent-ghost-hover": {
      "aliasTarget": {
        "id": "color-static-white-alpha-08",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-ghost-hover": "color(srgb 0.980392 0.980392 0.980392 / 0.08)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-ghost-hover",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.08}",
      "sourcePath": "semantic.dark.color.accent-ghost-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.08
      }
    },
    "color-accent-green-500-alpha-08": {
      "aliasTarget": {
        "id": "color-green-500-alpha-08",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-green-500-alpha-08": "color(srgb 0 0.776471 0.556863 / 0.08)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-green-500-alpha-08",
      "mode": "dark",
      "rawValue": "{primitive.color.green-500-alpha.08}",
      "sourcePath": "semantic.dark.color.accent.green.500-alpha.08",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.776471,
          0.556863
        ],
        "alpha": 0.08
      }
    },
    "color-accent-inverse": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-inverse": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-inverse",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.dark.color.accent-inverse",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-accent-menu-danger-hover": {
      "aliasTarget": {
        "id": "color-red-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-menu-danger-hover": "color(srgb 1 0.294118 0.34902 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-menu-danger-hover",
      "mode": "dark",
      "rawValue": "{primitive.color.red-alpha.12}",
      "sourcePath": "semantic.dark.color.accent-menu-danger-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 0.12
      }
    },
    "color-accent-menu-item-hover": {
      "aliasTarget": {
        "id": "color-static-white-alpha-08",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-menu-item-hover": "color(srgb 0.980392 0.980392 0.980392 / 0.08)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-menu-item-hover",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.08}",
      "sourcePath": "semantic.dark.color.accent-menu-item-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.08
      }
    },
    "color-accent-primary": {
      "aliasTarget": {
        "id": "color-blue-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-primary": "color(srgb 0 0.533333 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-primary",
      "mode": "dark",
      "rawValue": "{primitive.color.blue.500}",
      "sourcePath": "semantic.dark.color.accent-primary",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.533333,
          1
        ],
        "alpha": 1
      }
    },
    "color-accent-primary-active": {
      "aliasTarget": {
        "id": "color-blue-600",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-primary-active": "color(srgb 0 0.458824 0.858824 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-primary-active",
      "mode": "dark",
      "rawValue": "{primitive.color.blue.600}",
      "sourcePath": "semantic.dark.color.accent-primary-active",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.458824,
          0.858824
        ],
        "alpha": 1
      }
    },
    "color-accent-primary-hover": {
      "aliasTarget": {
        "id": "color-blue-400",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-primary-hover": "color(srgb 0.219608 0.643137 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-primary-hover",
      "mode": "dark",
      "rawValue": "{primitive.color.blue.400}",
      "sourcePath": "semantic.dark.color.accent-primary-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.219608,
          0.643137,
          1
        ],
        "alpha": 1
      }
    },
    "color-accent-secondary": {
      "aliasTarget": {
        "id": "color-static-white-alpha-08",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-secondary": "color(srgb 0.980392 0.980392 0.980392 / 0.08)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-secondary",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.08}",
      "sourcePath": "semantic.dark.color.accent-secondary",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.08
      }
    },
    "color-accent-secondary-foreground": {
      "aliasTarget": {
        "id": "color-palette-gray-400",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-secondary-foreground": "color(srgb 0.545098 0.556863 0.576471 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-secondary-foreground",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.400}",
      "sourcePath": "semantic.dark.color.accent-secondary-foreground",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.545098,
          0.556863,
          0.576471
        ],
        "alpha": 1
      }
    },
    "color-accent-secondary-hover": {
      "aliasTarget": {
        "id": "color-static-white-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-secondary-hover": "color(srgb 0.980392 0.980392 0.980392 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-secondary-hover",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.12}",
      "sourcePath": "semantic.dark.color.accent-secondary-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.12
      }
    },
    "color-accent-secondary-selected": {
      "aliasTarget": {
        "id": "color-static-white-alpha-20",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-accent-secondary-selected": "color(srgb 0.980392 0.980392 0.980392 / 0.2)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-accent-secondary-selected",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.20}",
      "sourcePath": "semantic.dark.color.accent-secondary-selected",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.2
      }
    },
    "color-alert-danger-foreground": {
      "aliasTarget": {
        "id": "color-red-100",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-danger-foreground": "color(srgb 1 0.898039 0.909804 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-danger-foreground",
      "mode": "dark",
      "rawValue": "{primitive.color.red.100}",
      "sourcePath": "semantic.dark.color.alert-danger-foreground",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.898039,
          0.909804
        ],
        "alpha": 1
      }
    },
    "color-alert-danger-stroke": {
      "aliasTarget": {
        "id": "color-red-alpha-24",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-danger-stroke": "color(srgb 1 0.294118 0.34902 / 0.24)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-danger-stroke",
      "mode": "dark",
      "rawValue": "{primitive.color.red-alpha.24}",
      "sourcePath": "semantic.dark.color.alert-danger-stroke",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 0.24
      }
    },
    "color-alert-danger-surface": {
      "aliasTarget": {
        "id": "color-red-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-danger-surface": "color(srgb 1 0.294118 0.34902 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-danger-surface",
      "mode": "dark",
      "rawValue": "{primitive.color.red-alpha.12}",
      "sourcePath": "semantic.dark.color.alert-danger-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 0.12
      }
    },
    "color-alert-info-foreground": {
      "aliasTarget": {
        "id": "color-blue-100",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-info-foreground": "color(srgb 0.839216 0.921569 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-info-foreground",
      "mode": "dark",
      "rawValue": "{primitive.color.blue.100}",
      "sourcePath": "semantic.dark.color.alert-info-foreground",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.839216,
          0.921569,
          1
        ],
        "alpha": 1
      }
    },
    "color-alert-info-stroke": {
      "aliasTarget": {
        "id": "color-blue-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-info-stroke": "color(srgb 0 0.372549 0.701961 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-info-stroke",
      "mode": "dark",
      "rawValue": "{primitive.color.blue.700}",
      "sourcePath": "semantic.dark.color.alert-info-stroke",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.372549,
          0.701961
        ],
        "alpha": 1
      }
    },
    "color-alert-info-surface": {
      "aliasTarget": {
        "id": "color-blue-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-info-surface": "color(srgb 0 0.203922 0.380392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-info-surface",
      "mode": "dark",
      "rawValue": "{primitive.color.blue.900}",
      "sourcePath": "semantic.dark.color.alert-info-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.203922,
          0.380392
        ],
        "alpha": 1
      }
    },
    "color-alert-success-foreground": {
      "aliasTarget": {
        "id": "color-green-100",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-success-foreground": "color(srgb 0.898039 1 0.968627 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-success-foreground",
      "mode": "dark",
      "rawValue": "{primitive.color.green.100}",
      "sourcePath": "semantic.dark.color.alert-success-foreground",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.898039,
          1,
          0.968627
        ],
        "alpha": 1
      }
    },
    "color-alert-success-stroke": {
      "aliasTarget": {
        "id": "color-green-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-success-stroke": "color(srgb 0 0.560784 0.403922 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-success-stroke",
      "mode": "dark",
      "rawValue": "{primitive.color.green.700}",
      "sourcePath": "semantic.dark.color.alert-success-stroke",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.560784,
          0.403922
        ],
        "alpha": 1
      }
    },
    "color-alert-success-surface": {
      "aliasTarget": {
        "id": "color-green-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-success-surface": "color(srgb 0 0.298039 0.223529 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-success-surface",
      "mode": "dark",
      "rawValue": "{primitive.color.green.900}",
      "sourcePath": "semantic.dark.color.alert-success-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.298039,
          0.223529
        ],
        "alpha": 1
      }
    },
    "color-alert-warning-foreground": {
      "aliasTarget": {
        "id": "color-yellow-100",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-warning-foreground": "color(srgb 1 0.960784 0.839216 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-warning-foreground",
      "mode": "dark",
      "rawValue": "{primitive.color.yellow.100}",
      "sourcePath": "semantic.dark.color.alert-warning-foreground",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.960784,
          0.839216
        ],
        "alpha": 1
      }
    },
    "color-alert-warning-stroke": {
      "aliasTarget": {
        "id": "color-yellow-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-warning-stroke": "color(srgb 0.721569 0.462745 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-warning-stroke",
      "mode": "dark",
      "rawValue": "{primitive.color.yellow.700}",
      "sourcePath": "semantic.dark.color.alert-warning-stroke",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.721569,
          0.462745,
          0
        ],
        "alpha": 1
      }
    },
    "color-alert-warning-surface": {
      "aliasTarget": {
        "id": "color-yellow-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-alert-warning-surface": "color(srgb 0.298039 0.2 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-alert-warning-surface",
      "mode": "dark",
      "rawValue": "{primitive.color.yellow.900}",
      "sourcePath": "semantic.dark.color.alert-warning-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.298039,
          0.2,
          0
        ],
        "alpha": 1
      }
    },
    "color-app-avatar-default-ink": {
      "aliasTarget": {
        "id": "color-palette-gray-600",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-app-avatar-default-ink": "color(srgb 0.345098 0.360784 0.388235 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-app-avatar-default-ink",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.600}",
      "sourcePath": "semantic.dark.color.app.avatar-default-ink",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.345098,
          0.360784,
          0.388235
        ],
        "alpha": 1
      }
    },
    "color-app-nav-chip-tint": {
      "aliasTarget": {
        "id": "color-static-white-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-app-nav-chip-tint": "color(srgb 0.980392 0.980392 0.980392 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-app-nav-chip-tint",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.12}",
      "sourcePath": "semantic.dark.color.app.nav-chip-tint",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.12
      }
    },
    "color-app-nav-create-btn-bg": {
      "aliasTarget": {
        "id": "color-palette-gray-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-app-nav-create-btn-bg": "color(srgb 0.254902 0.270588 0.298039 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-app-nav-create-btn-bg",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.700}",
      "sourcePath": "semantic.dark.color.app.nav-create-btn-bg",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.254902,
          0.270588,
          0.298039
        ],
        "alpha": 1
      }
    },
    "color-app-page-bg": {
      "aliasTarget": {
        "id": "color-palette-gray-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-app-page-bg": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-app-page-bg",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.900}",
      "sourcePath": "semantic.dark.color.app.page-bg",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 1
      }
    },
    "color-app-tooltip-bg": {
      "aliasTarget": {
        "id": "color-palette-gray-200",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-app-tooltip-bg": "color(srgb 0.756863 0.764706 0.776471 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-app-tooltip-bg",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.200}",
      "sourcePath": "semantic.dark.color.app.tooltip-bg",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.756863,
          0.764706,
          0.776471
        ],
        "alpha": 1
      }
    },
    "color-app-tooltip-border": {
      "aliasTarget": {
        "id": "color-static-black-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-app-tooltip-border": "color(srgb 0.090196 0.105882 0.133333 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-app-tooltip-border",
      "mode": "dark",
      "rawValue": "{primitive.color.static-black-alpha.12}",
      "sourcePath": "semantic.dark.color.app.tooltip-border",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.12
      }
    },
    "color-app-tooltip-kbd-bg": {
      "aliasTarget": {
        "id": "color-static-black-alpha-08",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-app-tooltip-kbd-bg": "color(srgb 0.090196 0.105882 0.133333 / 0.08)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-app-tooltip-kbd-bg",
      "mode": "dark",
      "rawValue": "{primitive.color.static-black-alpha.08}",
      "sourcePath": "semantic.dark.color.app.tooltip-kbd-bg",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.08
      }
    },
    "color-app-tooltip-text": {
      "aliasTarget": {
        "id": "color-palette-gray-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-app-tooltip-text": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-app-tooltip-text",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.900}",
      "sourcePath": "semantic.dark.color.app.tooltip-text",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 1
      }
    },
    "color-app-tooltip-text-subtle": {
      "aliasTarget": {
        "id": "color-static-black-alpha-40",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-app-tooltip-text-subtle": "color(srgb 0.090196 0.105882 0.133333 / 0.4)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-app-tooltip-text-subtle",
      "mode": "dark",
      "rawValue": "{primitive.color.static-black-alpha.40}",
      "sourcePath": "semantic.dark.color.app.tooltip-text-subtle",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.4
      }
    },
    "color-bg-canvas": {
      "aliasTarget": {
        "id": "color-palette-gray-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-canvas": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-canvas",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.900}",
      "sourcePath": "semantic.dark.color.bg-canvas",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 1
      }
    },
    "color-bg-danger": {
      "aliasTarget": {
        "id": "color-red-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-danger": "color(srgb 0.329412 0.066667 0.098039 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-danger",
      "mode": "dark",
      "rawValue": "{primitive.color.red.900}",
      "sourcePath": "semantic.dark.color.bg-danger",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.329412,
          0.066667,
          0.098039
        ],
        "alpha": 1
      }
    },
    "color-bg-info": {
      "aliasTarget": {
        "id": "color-blue-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-info": "color(srgb 0 0.203922 0.380392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-info",
      "mode": "dark",
      "rawValue": "{primitive.color.blue.900}",
      "sourcePath": "semantic.dark.color.bg-info",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.203922,
          0.380392
        ],
        "alpha": 1
      }
    },
    "color-bg-inset": {
      "aliasTarget": {
        "id": "color-palette-gray-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-inset": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-inset",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.900}",
      "sourcePath": "semantic.dark.color.bg-inset",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 1
      }
    },
    "color-bg-inverse": {
      "aliasTarget": {
        "id": "color-palette-gray-200",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-inverse": "color(srgb 0.756863 0.764706 0.776471 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-inverse",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.200}",
      "sourcePath": "semantic.dark.color.bg-inverse",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.756863,
          0.764706,
          0.776471
        ],
        "alpha": 1
      }
    },
    "color-bg-inverse-translucent": {
      "aliasTarget": {
        "id": "color-static-white-alpha-72",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-inverse-translucent": "color(srgb 0.980392 0.980392 0.980392 / 0.72)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-inverse-translucent",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.72}",
      "sourcePath": "semantic.dark.color.bg-inverse-translucent",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.72
      }
    },
    "color-bg-menu": {
      "aliasTarget": {
        "id": "color-palette-gray-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-menu": "color(srgb 0.168627 0.184314 0.211765 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-menu",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.800}",
      "sourcePath": "semantic.dark.color.bg-menu",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.168627,
          0.184314,
          0.211765
        ],
        "alpha": 1
      }
    },
    "color-bg-overlay": {
      "aliasTarget": {
        "id": "color-palette-gray-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-overlay": "color(srgb 0.168627 0.184314 0.211765 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-overlay",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.800}",
      "sourcePath": "semantic.dark.color.bg-overlay",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.168627,
          0.184314,
          0.211765
        ],
        "alpha": 1
      }
    },
    "color-bg-raised": {
      "aliasTarget": {
        "id": "color-palette-gray-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-raised": "color(srgb 0.168627 0.184314 0.211765 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-raised",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.800}",
      "sourcePath": "semantic.dark.color.bg-raised",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.168627,
          0.184314,
          0.211765
        ],
        "alpha": 1
      }
    },
    "color-bg-success": {
      "aliasTarget": {
        "id": "color-green-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-success": "color(srgb 0 0.298039 0.223529 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-success",
      "mode": "dark",
      "rawValue": "{primitive.color.green.900}",
      "sourcePath": "semantic.dark.color.bg-success",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.298039,
          0.223529
        ],
        "alpha": 1
      }
    },
    "color-bg-surface": {
      "aliasTarget": {
        "id": "color-palette-gray-850",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-surface": "color(srgb 0.129412 0.145098 0.176471 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-surface",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.850}",
      "sourcePath": "semantic.dark.color.bg-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.129412,
          0.145098,
          0.176471
        ],
        "alpha": 1
      }
    },
    "color-bg-surface-translucent": {
      "aliasTarget": {
        "id": "color-static-black-alpha-72",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-surface-translucent": "color(srgb 0.090196 0.105882 0.133333 / 0.72)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-surface-translucent",
      "mode": "dark",
      "rawValue": "{primitive.color.static-black-alpha.72}",
      "sourcePath": "semantic.dark.color.bg-surface-translucent",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.72
      }
    },
    "color-bg-upgrade": {
      "aliasTarget": {
        "id": "color-palette-gray-100",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-upgrade": "color(srgb 0.862745 0.870588 0.882353 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-upgrade",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.100}",
      "sourcePath": "semantic.dark.color.bg-upgrade",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.862745,
          0.870588,
          0.882353
        ],
        "alpha": 1
      }
    },
    "color-bg-upgrade-current": {
      "aliasTarget": {
        "id": "color-palette-gray-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-upgrade-current": "color(srgb 0.168627 0.184314 0.211765 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-upgrade-current",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.800}",
      "sourcePath": "semantic.dark.color.bg-upgrade-current",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.168627,
          0.184314,
          0.211765
        ],
        "alpha": 1
      }
    },
    "color-bg-upgrade-hover": {
      "aliasTarget": {
        "id": "color-palette-gray-200",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-upgrade-hover": "color(srgb 0.756863 0.764706 0.776471 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-upgrade-hover",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.200}",
      "sourcePath": "semantic.dark.color.bg-upgrade-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.756863,
          0.764706,
          0.776471
        ],
        "alpha": 1
      }
    },
    "color-bg-warning": {
      "aliasTarget": {
        "id": "color-yellow-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-bg-warning": "color(srgb 0.298039 0.2 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-bg-warning",
      "mode": "dark",
      "rawValue": "{primitive.color.yellow.900}",
      "sourcePath": "semantic.dark.color.bg-warning",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.298039,
          0.2,
          0
        ],
        "alpha": 1
      }
    },
    "color-brand-logo-ink": {
      "aliasTarget": {
        "id": "color-static-white",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-brand-logo-ink": "color(srgb 1 1 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-brand-logo-ink",
      "mode": "dark",
      "rawValue": "{primitive.color.static.white}",
      "sourcePath": "semantic.dark.color.brand.logo-ink",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          1,
          1
        ],
        "alpha": 1
      }
    },
    "color-dim-modal": {
      "aliasTarget": {
        "id": "color-static-black-alpha-72",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-dim-modal": "color(srgb 0.090196 0.105882 0.133333 / 0.72)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-dim-modal",
      "mode": "dark",
      "rawValue": "{primitive.color.static-black-alpha.72}",
      "sourcePath": "semantic.dark.color.dim-modal",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.72
      }
    },
    "color-fg-danger": {
      "aliasTarget": {
        "id": "color-red-100",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-danger": "color(srgb 1 0.898039 0.909804 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-danger",
      "mode": "dark",
      "rawValue": "{primitive.color.red.100}",
      "sourcePath": "semantic.dark.color.fg-danger",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.898039,
          0.909804
        ],
        "alpha": 1
      }
    },
    "color-fg-danger-on-surface": {
      "aliasTarget": {
        "id": "color-red-400",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-danger-on-surface": "color(srgb 1 0.435294 0.486275 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-danger-on-surface",
      "mode": "dark",
      "rawValue": "{primitive.color.red.400}",
      "sourcePath": "semantic.dark.color.fg-danger-on-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.435294,
          0.486275
        ],
        "alpha": 1
      }
    },
    "color-fg-disabled": {
      "aliasTarget": {
        "id": "color-palette-gray-600",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-disabled": "color(srgb 0.345098 0.360784 0.388235 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-disabled",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.600}",
      "sourcePath": "semantic.dark.color.fg-disabled",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.345098,
          0.360784,
          0.388235
        ],
        "alpha": 1
      }
    },
    "color-fg-info": {
      "aliasTarget": {
        "id": "color-blue-050",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-info": "color(srgb 0.941176 0.968627 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-info",
      "mode": "dark",
      "rawValue": "{primitive.color.blue.050}",
      "sourcePath": "semantic.dark.color.fg-info",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.941176,
          0.968627,
          1
        ],
        "alpha": 1
      }
    },
    "color-fg-inverse": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-inverse": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-inverse",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.dark.color.fg-inverse",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-fg-menu-item": {
      "aliasTarget": {
        "id": "color-static-white-alpha-88",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-menu-item": "color(srgb 0.980392 0.980392 0.980392 / 0.88)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-menu-item",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.88}",
      "sourcePath": "semantic.dark.color.fg-menu-item",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.88
      }
    },
    "color-fg-on-accent-inverse": {
      "aliasTarget": {
        "id": "color-static-black",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-on-accent-inverse": "color(srgb 0 0 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-on-accent-inverse",
      "mode": "dark",
      "rawValue": "{primitive.color.static.black}",
      "sourcePath": "semantic.dark.color.fg-on-accent-inverse",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 1
      }
    },
    "color-fg-on-danger": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-on-danger": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-on-danger",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.dark.color.fg-on-danger",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-fg-on-inverse": {
      "aliasTarget": {
        "id": "color-palette-gray-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-on-inverse": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-on-inverse",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.900}",
      "sourcePath": "semantic.dark.color.fg-on-inverse",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 1
      }
    },
    "color-fg-primary": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-primary": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-primary",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.dark.color.fg-primary",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-fg-secondary": {
      "aliasTarget": {
        "id": "color-palette-gray-300",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-secondary": "color(srgb 0.647059 0.658824 0.678431 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-secondary",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.300}",
      "sourcePath": "semantic.dark.color.fg-secondary",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.647059,
          0.658824,
          0.678431
        ],
        "alpha": 1
      }
    },
    "color-fg-success": {
      "aliasTarget": {
        "id": "color-green-100",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-success": "color(srgb 0.898039 1 0.968627 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-success",
      "mode": "dark",
      "rawValue": "{primitive.color.green.100}",
      "sourcePath": "semantic.dark.color.fg-success",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.898039,
          1,
          0.968627
        ],
        "alpha": 1
      }
    },
    "color-fg-tertiary": {
      "aliasTarget": {
        "id": "color-palette-gray-400",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-tertiary": "color(srgb 0.545098 0.556863 0.576471 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-tertiary",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.400}",
      "sourcePath": "semantic.dark.color.fg-tertiary",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.545098,
          0.556863,
          0.576471
        ],
        "alpha": 1
      }
    },
    "color-fg-upgrade": {
      "aliasTarget": {
        "id": "color-palette-gray-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-upgrade": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-upgrade",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.900}",
      "sourcePath": "semantic.dark.color.fg-upgrade",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 1
      }
    },
    "color-fg-upgrade-current": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-upgrade-current": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-upgrade-current",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.dark.color.fg-upgrade-current",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-fg-upgrade-hover": {
      "aliasTarget": {
        "id": "color-palette-gray-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-upgrade-hover": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-upgrade-hover",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.900}",
      "sourcePath": "semantic.dark.color.fg-upgrade-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 1
      }
    },
    "color-fg-warning": {
      "aliasTarget": {
        "id": "color-yellow-100",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-fg-warning": "color(srgb 1 0.960784 0.839216 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-fg-warning",
      "mode": "dark",
      "rawValue": "{primitive.color.yellow.100}",
      "sourcePath": "semantic.dark.color.fg-warning",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.960784,
          0.839216
        ],
        "alpha": 1
      }
    },
    "color-gray-000": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.dark.color.gray.000",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-gray-000-alpha-04": {
      "aliasTarget": {
        "id": "color-static-white-alpha-04",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-04": "color(srgb 0.980392 0.980392 0.980392 / 0.04)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-04",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.04}",
      "sourcePath": "semantic.dark.color.gray.000-alpha.04",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.04
      }
    },
    "color-gray-000-alpha-08": {
      "aliasTarget": {
        "id": "color-static-white-alpha-08",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-08": "color(srgb 0.980392 0.980392 0.980392 / 0.08)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-08",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.08}",
      "sourcePath": "semantic.dark.color.gray.000-alpha.08",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.08
      }
    },
    "color-gray-000-alpha-12": {
      "aliasTarget": {
        "id": "color-static-white-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-12": "color(srgb 0.980392 0.980392 0.980392 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-12",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.12}",
      "sourcePath": "semantic.dark.color.gray.000-alpha.12",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.12
      }
    },
    "color-gray-000-alpha-16": {
      "aliasTarget": {
        "id": "color-static-white-alpha-16",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-16": "color(srgb 0.980392 0.980392 0.980392 / 0.16)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-16",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.16}",
      "sourcePath": "semantic.dark.color.gray.000-alpha.16",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.16
      }
    },
    "color-gray-000-alpha-20": {
      "aliasTarget": {
        "id": "color-static-white-alpha-20",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-20": "color(srgb 0.980392 0.980392 0.980392 / 0.2)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-20",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.20}",
      "sourcePath": "semantic.dark.color.gray.000-alpha.20",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.2
      }
    },
    "color-gray-000-alpha-24": {
      "aliasTarget": {
        "id": "color-static-white-alpha-24",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-24": "color(srgb 0.980392 0.980392 0.980392 / 0.24)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-24",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.24}",
      "sourcePath": "semantic.dark.color.gray.000-alpha.24",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.24
      }
    },
    "color-gray-000-alpha-28": {
      "aliasTarget": {
        "id": "color-static-white-alpha-28",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-28": "color(srgb 0.980392 0.980392 0.980392 / 0.28)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-28",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.28}",
      "sourcePath": "semantic.dark.color.gray.000-alpha.28",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.28
      }
    },
    "color-gray-000-alpha-32": {
      "aliasTarget": {
        "id": "color-static-white-alpha-32",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-32": "color(srgb 0.980392 0.980392 0.980392 / 0.32)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-32",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.32}",
      "sourcePath": "semantic.dark.color.gray.000-alpha.32",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.32
      }
    },
    "color-gray-000-alpha-40": {
      "aliasTarget": {
        "id": "color-static-white-alpha-40",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-40": "color(srgb 0.980392 0.980392 0.980392 / 0.4)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-40",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.40}",
      "sourcePath": "semantic.dark.color.gray.000-alpha.40",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.4
      }
    },
    "color-gray-000-alpha-48": {
      "aliasTarget": {
        "id": "color-static-white-alpha-48",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-48": "color(srgb 0.980392 0.980392 0.980392 / 0.48)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-48",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.48}",
      "sourcePath": "semantic.dark.color.gray.000-alpha.48",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.48
      }
    },
    "color-gray-000-alpha-56": {
      "aliasTarget": {
        "id": "color-static-white-alpha-56",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-56": "color(srgb 0.980392 0.980392 0.980392 / 0.56)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-56",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.56}",
      "sourcePath": "semantic.dark.color.gray.000-alpha.56",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.56
      }
    },
    "color-gray-000-alpha-64": {
      "aliasTarget": {
        "id": "color-static-white-alpha-64",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-64": "color(srgb 0.980392 0.980392 0.980392 / 0.64)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-64",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.64}",
      "sourcePath": "semantic.dark.color.gray.000-alpha.64",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.64
      }
    },
    "color-gray-000-alpha-72": {
      "aliasTarget": {
        "id": "color-static-white-alpha-72",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-72": "color(srgb 0.980392 0.980392 0.980392 / 0.72)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-72",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.72}",
      "sourcePath": "semantic.dark.color.gray.000-alpha.72",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.72
      }
    },
    "color-gray-000-alpha-80": {
      "aliasTarget": {
        "id": "color-static-white-alpha-80",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-80": "color(srgb 0.980392 0.980392 0.980392 / 0.8)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-80",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.80}",
      "sourcePath": "semantic.dark.color.gray.000-alpha.80",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.8
      }
    },
    "color-gray-000-alpha-88": {
      "aliasTarget": {
        "id": "color-static-white-alpha-88",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-88": "color(srgb 0.980392 0.980392 0.980392 / 0.88)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-88",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.88}",
      "sourcePath": "semantic.dark.color.gray.000-alpha.88",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.88
      }
    },
    "color-gray-000-alpha-96": {
      "aliasTarget": {
        "id": "color-static-white-alpha-96",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-000-alpha-96": "color(srgb 0.980392 0.980392 0.980392 / 0.96)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-000-alpha-96",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.96}",
      "sourcePath": "semantic.dark.color.gray.000-alpha.96",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.96
      }
    },
    "color-gray-100": {
      "aliasTarget": {
        "id": "color-palette-gray-100",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-100": "color(srgb 0.862745 0.870588 0.882353 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-100",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.100}",
      "sourcePath": "semantic.dark.color.gray.100",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.862745,
          0.870588,
          0.882353
        ],
        "alpha": 1
      }
    },
    "color-gray-1000": {
      "aliasTarget": {
        "id": "color-static-black",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-1000": "color(srgb 0 0 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-1000",
      "mode": "dark",
      "rawValue": "{primitive.color.static.black}",
      "sourcePath": "semantic.dark.color.gray.1000",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 1
      }
    },
    "color-gray-200": {
      "aliasTarget": {
        "id": "color-palette-gray-200",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-200": "color(srgb 0.756863 0.764706 0.776471 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-200",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.200}",
      "sourcePath": "semantic.dark.color.gray.200",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.756863,
          0.764706,
          0.776471
        ],
        "alpha": 1
      }
    },
    "color-gray-300": {
      "aliasTarget": {
        "id": "color-palette-gray-300",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-300": "color(srgb 0.647059 0.658824 0.678431 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-300",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.300}",
      "sourcePath": "semantic.dark.color.gray.300",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.647059,
          0.658824,
          0.678431
        ],
        "alpha": 1
      }
    },
    "color-gray-400": {
      "aliasTarget": {
        "id": "color-palette-gray-400",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-400": "color(srgb 0.545098 0.556863 0.576471 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-400",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.400}",
      "sourcePath": "semantic.dark.color.gray.400",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.545098,
          0.556863,
          0.576471
        ],
        "alpha": 1
      }
    },
    "color-gray-500": {
      "aliasTarget": {
        "id": "color-palette-gray-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-500": "color(srgb 0.447059 0.458824 0.482353 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-500",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.500}",
      "sourcePath": "semantic.dark.color.gray.500",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.447059,
          0.458824,
          0.482353
        ],
        "alpha": 1
      }
    },
    "color-gray-600": {
      "aliasTarget": {
        "id": "color-palette-gray-600",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-600": "color(srgb 0.345098 0.360784 0.388235 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-600",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.600}",
      "sourcePath": "semantic.dark.color.gray.600",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.345098,
          0.360784,
          0.388235
        ],
        "alpha": 1
      }
    },
    "color-gray-700": {
      "aliasTarget": {
        "id": "color-palette-gray-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-700": "color(srgb 0.254902 0.270588 0.298039 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-700",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.700}",
      "sourcePath": "semantic.dark.color.gray.700",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.254902,
          0.270588,
          0.298039
        ],
        "alpha": 1
      }
    },
    "color-gray-800": {
      "aliasTarget": {
        "id": "color-palette-gray-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-800": "color(srgb 0.168627 0.184314 0.211765 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-800",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.800}",
      "sourcePath": "semantic.dark.color.gray.800",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.168627,
          0.184314,
          0.211765
        ],
        "alpha": 1
      }
    },
    "color-gray-900": {
      "aliasTarget": {
        "id": "color-palette-gray-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-gray-900": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-gray-900",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.900}",
      "sourcePath": "semantic.dark.color.gray.900",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 1
      }
    },
    "color-icon-input-glyph": {
      "aliasTarget": {
        "id": "color-static-white-alpha-56",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-icon-input-glyph": "color(srgb 0.980392 0.980392 0.980392 / 0.56)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-icon-input-glyph",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.56}",
      "sourcePath": "semantic.dark.color.icon.input-glyph",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.56
      }
    },
    "color-landing-line": {
      "aliasTarget": {
        "id": "color-static-white-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-landing-line": "color(srgb 0.980392 0.980392 0.980392 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-landing-line",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.12}",
      "sourcePath": "semantic.dark.color.landing.line",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.12
      }
    },
    "color-landing-page-bg": {
      "aliasTarget": {
        "id": "color-static-black",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-landing-page-bg": "color(srgb 0 0 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-landing-page-bg",
      "mode": "dark",
      "rawValue": "{primitive.color.static.black}",
      "sourcePath": "semantic.dark.color.landing.page-bg",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 1
      }
    },
    "color-landing-panel": {
      "aliasTarget": {
        "id": "color-static-white-alpha-04",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-landing-panel": "color(srgb 0.980392 0.980392 0.980392 / 0.04)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-landing-panel",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.04}",
      "sourcePath": "semantic.dark.color.landing.panel",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.04
      }
    },
    "color-landing-panel-strong": {
      "aliasTarget": {
        "id": "color-palette-gray-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-landing-panel-strong": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-landing-panel-strong",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.900}",
      "sourcePath": "semantic.dark.color.landing.panel-strong",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 1
      }
    },
    "color-landing-text-muted": {
      "aliasTarget": {
        "id": "color-static-white-alpha-64",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-landing-text-muted": "color(srgb 0.980392 0.980392 0.980392 / 0.64)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-landing-text-muted",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.64}",
      "sourcePath": "semantic.dark.color.landing.text-muted",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.64
      }
    },
    "color-landing-text-soft": {
      "aliasTarget": {
        "id": "color-static-white-alpha-72",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-landing-text-soft": "color(srgb 0.980392 0.980392 0.980392 / 0.72)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-landing-text-soft",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.72}",
      "sourcePath": "semantic.dark.color.landing.text-soft",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.72
      }
    },
    "color-media-control-foreground": {
      "aliasTarget": {
        "id": "color-static-white-alpha-88",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-media-control-foreground": "color(srgb 0.980392 0.980392 0.980392 / 0.88)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-control-foreground",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.88}",
      "sourcePath": "semantic.dark.color.media-control-foreground",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.88
      }
    },
    "color-media-control-hover": {
      "aliasTarget": {
        "id": "color-static-white-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-media-control-hover": "color(srgb 0.980392 0.980392 0.980392 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-control-hover",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.12}",
      "sourcePath": "semantic.dark.color.media-control-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.12
      }
    },
    "color-media-control-surface": {
      "aliasTarget": {
        "id": "color-static-black-alpha-28",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-media-control-surface": "color(srgb 0.090196 0.105882 0.133333 / 0.28)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-control-surface",
      "mode": "dark",
      "rawValue": "{primitive.color.static-black-alpha.28}",
      "sourcePath": "semantic.dark.color.media-control-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.28
      }
    },
    "color-media-foreground-bright": {
      "aliasTarget": {
        "id": "color-palette-gray-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-media-foreground-bright": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-foreground-bright",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.900}",
      "sourcePath": "semantic.dark.color.media-foreground-bright",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 1
      }
    },
    "color-media-foreground-dark": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-media-foreground-dark": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-foreground-dark",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.dark.color.media-foreground-dark",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-media-indicator-active": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-media-indicator-active": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-indicator-active",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.dark.color.media-indicator-active",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-media-indicator-rest": {
      "aliasTarget": {
        "id": "color-static-white-alpha-28",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-media-indicator-rest": "color(srgb 0.980392 0.980392 0.980392 / 0.28)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-indicator-rest",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.28}",
      "sourcePath": "semantic.dark.color.media-indicator-rest",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.28
      }
    },
    "color-media-scrim-bright": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-media-scrim-bright": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-scrim-bright",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.dark.color.media-scrim-bright",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-media-scrim-dark": {
      "aliasTarget": {
        "id": "color-static-black",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-media-scrim-dark": "color(srgb 0 0 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-scrim-dark",
      "mode": "dark",
      "rawValue": "{primitive.color.static.black}",
      "sourcePath": "semantic.dark.color.media-scrim-dark",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 1
      }
    },
    "color-node-audio-accent": {
      "aliasTarget": {
        "id": "color-pink-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-audio-accent": "color(srgb 1 0.301961 0.533333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-audio-accent",
      "mode": "dark",
      "rawValue": "{primitive.color.pink.500}",
      "sourcePath": "semantic.dark.color.node-audio-accent",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.301961,
          0.533333
        ],
        "alpha": 1
      }
    },
    "color-node-audio-icon": {
      "aliasTarget": {
        "id": "color-pink-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-audio-icon": "color(srgb 1 0.301961 0.533333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-audio-icon",
      "mode": "dark",
      "rawValue": "{primitive.color.pink.500}",
      "sourcePath": "semantic.dark.color.node-audio-icon",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.301961,
          0.533333
        ],
        "alpha": 1
      }
    },
    "color-node-audio-surface": {
      "aliasTarget": {
        "id": "color-pink-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-audio-surface": "color(srgb 0.517647 0.101961 0.247059 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-audio-surface",
      "mode": "dark",
      "rawValue": "{primitive.color.pink.800}",
      "sourcePath": "semantic.dark.color.node-audio-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.517647,
          0.101961,
          0.247059
        ],
        "alpha": 1
      }
    },
    "color-node-canvas-dot": {
      "aliasTarget": {
        "id": "color-static-white-alpha-16",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-canvas-dot": "color(srgb 0.980392 0.980392 0.980392 / 0.16)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-canvas-dot",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.16}",
      "sourcePath": "semantic.dark.color.node.canvas-dot",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.16
      }
    },
    "color-node-chip-fg-disabled": {
      "aliasTarget": {
        "id": "color-palette-gray-400",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-chip-fg-disabled": "color(srgb 0.545098 0.556863 0.576471 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-chip-fg-disabled",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.400}",
      "sourcePath": "semantic.dark.color.node-chip-fg-disabled",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.545098,
          0.556863,
          0.576471
        ],
        "alpha": 1
      }
    },
    "color-node-chip-surface": {
      "aliasTarget": {
        "id": "color-palette-gray-600",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-chip-surface": "color(srgb 0.345098 0.360784 0.388235 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-chip-surface",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.600}",
      "sourcePath": "semantic.dark.color.node-chip-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.345098,
          0.360784,
          0.388235
        ],
        "alpha": 1
      }
    },
    "color-node-chip-surface-hover": {
      "aliasTarget": {
        "id": "color-palette-gray-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-chip-surface-hover": "color(srgb 0.447059 0.458824 0.482353 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-chip-surface-hover",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.500}",
      "sourcePath": "semantic.dark.color.node-chip-surface-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.447059,
          0.458824,
          0.482353
        ],
        "alpha": 1
      }
    },
    "color-node-chrome-btn-bg": {
      "aliasTarget": {
        "id": "color-palette-gray-600",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-chrome-btn-bg": "color(srgb 0.345098 0.360784 0.388235 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-chrome-btn-bg",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.600}",
      "sourcePath": "semantic.dark.color.node.chrome-btn-bg",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.345098,
          0.360784,
          0.388235
        ],
        "alpha": 1
      }
    },
    "color-node-edit-accent": {
      "aliasTarget": {
        "id": "color-violet-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-edit-accent": "color(srgb 0.376471 0.333333 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-edit-accent",
      "mode": "dark",
      "rawValue": "{primitive.color.violet.500}",
      "sourcePath": "semantic.dark.color.node-edit-accent",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.376471,
          0.333333,
          1
        ],
        "alpha": 1
      }
    },
    "color-node-edit-icon": {
      "aliasTarget": {
        "id": "color-violet-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-edit-icon": "color(srgb 0.376471 0.333333 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-edit-icon",
      "mode": "dark",
      "rawValue": "{primitive.color.violet.500}",
      "sourcePath": "semantic.dark.color.node-edit-icon",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.376471,
          0.333333,
          1
        ],
        "alpha": 1
      }
    },
    "color-node-edit-surface": {
      "aliasTarget": {
        "id": "color-violet-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-edit-surface": "color(srgb 0.133333 0.101961 0.501961 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-edit-surface",
      "mode": "dark",
      "rawValue": "{primitive.color.violet.800}",
      "sourcePath": "semantic.dark.color.node-edit-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.133333,
          0.101961,
          0.501961
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-audio": {
      "aliasTarget": {
        "id": "color-pink-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-audio": "color(srgb 0.517647 0.101961 0.247059 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-audio",
      "mode": "dark",
      "rawValue": "{primitive.color.pink.800}",
      "sourcePath": "semantic.dark.color.node.handle-bg-audio",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.517647,
          0.101961,
          0.247059
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-disabled-audio": {
      "aliasTarget": {
        "id": "color-pink-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-disabled-audio": "color(srgb 0.329412 0.066667 0.164706 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-disabled-audio",
      "mode": "dark",
      "rawValue": "{primitive.color.pink.900}",
      "sourcePath": "semantic.dark.color.node.handle-bg-disabled-audio",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.329412,
          0.066667,
          0.164706
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-disabled-edit": {
      "aliasTarget": {
        "id": "color-violet-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-disabled-edit": "color(srgb 0.082353 0.062745 0.301961 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-disabled-edit",
      "mode": "dark",
      "rawValue": "{primitive.color.violet.900}",
      "sourcePath": "semantic.dark.color.node.handle-bg-disabled-edit",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.082353,
          0.062745,
          0.301961
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-disabled-image": {
      "aliasTarget": {
        "id": "color-green-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-disabled-image": "color(srgb 0 0.298039 0.223529 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-disabled-image",
      "mode": "dark",
      "rawValue": "{primitive.color.green.900}",
      "sourcePath": "semantic.dark.color.node.handle-bg-disabled-image",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.298039,
          0.223529
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-disabled-instagram": {
      "aliasTarget": {
        "id": "color-red-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-disabled-instagram": "color(srgb 0.329412 0.066667 0.098039 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-disabled-instagram",
      "mode": "dark",
      "rawValue": "{primitive.color.red.900}",
      "sourcePath": "semantic.dark.color.node.handle-bg-disabled-instagram",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.329412,
          0.066667,
          0.098039
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-disabled-text": {
      "aliasTarget": {
        "id": "color-yellow-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-disabled-text": "color(srgb 0.298039 0.2 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-disabled-text",
      "mode": "dark",
      "rawValue": "{primitive.color.yellow.900}",
      "sourcePath": "semantic.dark.color.node.handle-bg-disabled-text",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.298039,
          0.2,
          0
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-disabled-youtube": {
      "aliasTarget": {
        "id": "color-red-900",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-disabled-youtube": "color(srgb 0.329412 0.066667 0.098039 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-disabled-youtube",
      "mode": "dark",
      "rawValue": "{primitive.color.red.900}",
      "sourcePath": "semantic.dark.color.node.handle-bg-disabled-youtube",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.329412,
          0.066667,
          0.098039
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-edit": {
      "aliasTarget": {
        "id": "color-violet-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-edit": "color(srgb 0.133333 0.101961 0.501961 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-edit",
      "mode": "dark",
      "rawValue": "{primitive.color.violet.800}",
      "sourcePath": "semantic.dark.color.node.handle-bg-edit",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.133333,
          0.101961,
          0.501961
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-image": {
      "aliasTarget": {
        "id": "color-green-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-image": "color(srgb 0 0.431373 0.317647 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-image",
      "mode": "dark",
      "rawValue": "{primitive.color.green.800}",
      "sourcePath": "semantic.dark.color.node.handle-bg-image",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.431373,
          0.317647
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-instagram": {
      "aliasTarget": {
        "id": "color-red-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-instagram": "color(srgb 0.517647 0.101961 0.141176 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-instagram",
      "mode": "dark",
      "rawValue": "{primitive.color.red.800}",
      "sourcePath": "semantic.dark.color.node.handle-bg-instagram",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.517647,
          0.101961,
          0.141176
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-text": {
      "aliasTarget": {
        "id": "color-yellow-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-text": "color(srgb 0.478431 0.321569 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-text",
      "mode": "dark",
      "rawValue": "{primitive.color.yellow.800}",
      "sourcePath": "semantic.dark.color.node.handle-bg-text",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.478431,
          0.321569,
          0
        ],
        "alpha": 1
      }
    },
    "color-node-handle-bg-youtube": {
      "aliasTarget": {
        "id": "color-red-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-bg-youtube": "color(srgb 0.517647 0.101961 0.141176 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-bg-youtube",
      "mode": "dark",
      "rawValue": "{primitive.color.red.800}",
      "sourcePath": "semantic.dark.color.node.handle-bg-youtube",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.517647,
          0.101961,
          0.141176
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-audio": {
      "aliasTarget": {
        "id": "color-pink-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-audio": "color(srgb 1 0.301961 0.533333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-audio",
      "mode": "dark",
      "rawValue": "{primitive.color.pink.500}",
      "sourcePath": "semantic.dark.color.node.handle-icon-audio",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.301961,
          0.533333
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-disabled-audio": {
      "aliasTarget": {
        "id": "color-pink-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-disabled-audio": "color(srgb 0.717647 0.141176 0.345098 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-disabled-audio",
      "mode": "dark",
      "rawValue": "{primitive.color.pink.700}",
      "sourcePath": "semantic.dark.color.node.handle-icon-disabled-audio",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.717647,
          0.141176,
          0.345098
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-disabled-edit": {
      "aliasTarget": {
        "id": "color-violet-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-disabled-edit": "color(srgb 0.207843 0.156863 0.721569 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-disabled-edit",
      "mode": "dark",
      "rawValue": "{primitive.color.violet.700}",
      "sourcePath": "semantic.dark.color.node.handle-icon-disabled-edit",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.207843,
          0.156863,
          0.721569
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-disabled-image": {
      "aliasTarget": {
        "id": "color-green-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-disabled-image": "color(srgb 0 0.560784 0.403922 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-disabled-image",
      "mode": "dark",
      "rawValue": "{primitive.color.green.700}",
      "sourcePath": "semantic.dark.color.node.handle-icon-disabled-image",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.560784,
          0.403922
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-disabled-instagram": {
      "aliasTarget": {
        "id": "color-red-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-disabled-instagram": "color(srgb 0.717647 0.141176 0.192157 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-disabled-instagram",
      "mode": "dark",
      "rawValue": "{primitive.color.red.700}",
      "sourcePath": "semantic.dark.color.node.handle-icon-disabled-instagram",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.717647,
          0.141176,
          0.192157
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-disabled-text": {
      "aliasTarget": {
        "id": "color-yellow-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-disabled-text": "color(srgb 0.721569 0.462745 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-disabled-text",
      "mode": "dark",
      "rawValue": "{primitive.color.yellow.700}",
      "sourcePath": "semantic.dark.color.node.handle-icon-disabled-text",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.721569,
          0.462745,
          0
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-disabled-youtube": {
      "aliasTarget": {
        "id": "color-red-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-disabled-youtube": "color(srgb 0.717647 0.141176 0.192157 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-disabled-youtube",
      "mode": "dark",
      "rawValue": "{primitive.color.red.700}",
      "sourcePath": "semantic.dark.color.node.handle-icon-disabled-youtube",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.717647,
          0.141176,
          0.192157
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-edit": {
      "aliasTarget": {
        "id": "color-violet-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-edit": "color(srgb 0.376471 0.333333 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-edit",
      "mode": "dark",
      "rawValue": "{primitive.color.violet.500}",
      "sourcePath": "semantic.dark.color.node.handle-icon-edit",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.376471,
          0.333333,
          1
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-image": {
      "aliasTarget": {
        "id": "color-green-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-image": "color(srgb 0 0.776471 0.556863 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-image",
      "mode": "dark",
      "rawValue": "{primitive.color.green.500}",
      "sourcePath": "semantic.dark.color.node.handle-icon-image",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.776471,
          0.556863
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-instagram": {
      "aliasTarget": {
        "id": "color-red-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-instagram": "color(srgb 1 0.294118 0.34902 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-instagram",
      "mode": "dark",
      "rawValue": "{primitive.color.red.500}",
      "sourcePath": "semantic.dark.color.node.handle-icon-instagram",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-text": {
      "aliasTarget": {
        "id": "color-yellow-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-text": "color(srgb 1 0.698039 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-text",
      "mode": "dark",
      "rawValue": "{primitive.color.yellow.500}",
      "sourcePath": "semantic.dark.color.node.handle-icon-text",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.698039,
          0
        ],
        "alpha": 1
      }
    },
    "color-node-handle-icon-youtube": {
      "aliasTarget": {
        "id": "color-red-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-handle-icon-youtube": "color(srgb 1 0.294118 0.34902 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-handle-icon-youtube",
      "mode": "dark",
      "rawValue": "{primitive.color.red.500}",
      "sourcePath": "semantic.dark.color.node.handle-icon-youtube",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 1
      }
    },
    "color-node-image-accent": {
      "aliasTarget": {
        "id": "color-green-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-image-accent": "color(srgb 0 0.776471 0.556863 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-image-accent",
      "mode": "dark",
      "rawValue": "{primitive.color.green.500}",
      "sourcePath": "semantic.dark.color.node-image-accent",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.776471,
          0.556863
        ],
        "alpha": 1
      }
    },
    "color-node-image-icon": {
      "aliasTarget": {
        "id": "color-green-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-image-icon": "color(srgb 0 0.776471 0.556863 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-image-icon",
      "mode": "dark",
      "rawValue": "{primitive.color.green.500}",
      "sourcePath": "semantic.dark.color.node-image-icon",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.776471,
          0.556863
        ],
        "alpha": 1
      }
    },
    "color-node-image-surface": {
      "aliasTarget": {
        "id": "color-green-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-image-surface": "color(srgb 0 0.431373 0.317647 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-image-surface",
      "mode": "dark",
      "rawValue": "{primitive.color.green.800}",
      "sourcePath": "semantic.dark.color.node-image-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.431373,
          0.317647
        ],
        "alpha": 1
      }
    },
    "color-node-instagram-accent": {
      "aliasTarget": {
        "id": "color-red-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-instagram-accent": "color(srgb 1 0.294118 0.34902 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-instagram-accent",
      "mode": "dark",
      "rawValue": "{primitive.color.red.500}",
      "sourcePath": "semantic.dark.color.node-instagram-accent",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 1
      }
    },
    "color-node-instagram-icon": {
      "aliasTarget": {
        "id": "color-red-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-instagram-icon": "color(srgb 1 0.294118 0.34902 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-instagram-icon",
      "mode": "dark",
      "rawValue": "{primitive.color.red.500}",
      "sourcePath": "semantic.dark.color.node-instagram-icon",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 1
      }
    },
    "color-node-instagram-surface": {
      "aliasTarget": {
        "id": "color-red-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-instagram-surface": "color(srgb 0.517647 0.101961 0.141176 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-instagram-surface",
      "mode": "dark",
      "rawValue": "{primitive.color.red.800}",
      "sourcePath": "semantic.dark.color.node-instagram-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.517647,
          0.101961,
          0.141176
        ],
        "alpha": 1
      }
    },
    "color-node-text-accent": {
      "aliasTarget": {
        "id": "color-yellow-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-text-accent": "color(srgb 1 0.698039 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-text-accent",
      "mode": "dark",
      "rawValue": "{primitive.color.yellow.500}",
      "sourcePath": "semantic.dark.color.node-text-accent",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.698039,
          0
        ],
        "alpha": 1
      }
    },
    "color-node-text-icon": {
      "aliasTarget": {
        "id": "color-yellow-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-text-icon": "color(srgb 1 0.698039 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-text-icon",
      "mode": "dark",
      "rawValue": "{primitive.color.yellow.500}",
      "sourcePath": "semantic.dark.color.node-text-icon",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.698039,
          0
        ],
        "alpha": 1
      }
    },
    "color-node-text-surface": {
      "aliasTarget": {
        "id": "color-yellow-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-text-surface": "color(srgb 0.478431 0.321569 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-text-surface",
      "mode": "dark",
      "rawValue": "{primitive.color.yellow.800}",
      "sourcePath": "semantic.dark.color.node-text-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.478431,
          0.321569,
          0
        ],
        "alpha": 1
      }
    },
    "color-node-video-accent": {
      "aliasTarget": {
        "id": "color-blue-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-video-accent": "color(srgb 0 0.533333 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-video-accent",
      "mode": "dark",
      "rawValue": "{primitive.color.blue.500}",
      "sourcePath": "semantic.dark.color.node-video-accent",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.533333,
          1
        ],
        "alpha": 1
      }
    },
    "color-node-youtube-accent": {
      "aliasTarget": {
        "id": "color-red-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-youtube-accent": "color(srgb 1 0.294118 0.34902 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-youtube-accent",
      "mode": "dark",
      "rawValue": "{primitive.color.red.500}",
      "sourcePath": "semantic.dark.color.node-youtube-accent",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 1
      }
    },
    "color-node-youtube-icon": {
      "aliasTarget": {
        "id": "color-red-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-youtube-icon": "color(srgb 1 0.294118 0.34902 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-youtube-icon",
      "mode": "dark",
      "rawValue": "{primitive.color.red.500}",
      "sourcePath": "semantic.dark.color.node-youtube-icon",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 1
      }
    },
    "color-node-youtube-surface": {
      "aliasTarget": {
        "id": "color-red-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-node-youtube-surface": "color(srgb 0.517647 0.101961 0.141176 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-youtube-surface",
      "mode": "dark",
      "rawValue": "{primitive.color.red.800}",
      "sourcePath": "semantic.dark.color.node-youtube-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.517647,
          0.101961,
          0.141176
        ],
        "alpha": 1
      }
    },
    "color-progress-fill": {
      "aliasTarget": {
        "id": "color-blue-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-progress-fill": "color(srgb 0 0.533333 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-progress-fill",
      "mode": "dark",
      "rawValue": "{primitive.color.blue.500}",
      "sourcePath": "semantic.dark.color.progress-fill",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.533333,
          1
        ],
        "alpha": 1
      }
    },
    "color-progress-ring-fill": {
      "aliasTarget": {
        "id": "color-green-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-progress-ring-fill": "color(srgb 0 0.776471 0.556863 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-progress-ring-fill",
      "mode": "dark",
      "rawValue": "{primitive.color.green.500}",
      "sourcePath": "semantic.dark.color.progress-ring-fill",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.776471,
          0.556863
        ],
        "alpha": 1
      }
    },
    "color-progress-ring-track": {
      "aliasTarget": {
        "id": "color-static-white-alpha-20",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-progress-ring-track": "color(srgb 0.980392 0.980392 0.980392 / 0.2)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-progress-ring-track",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.20}",
      "sourcePath": "semantic.dark.color.progress-ring-track",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.2
      }
    },
    "color-progress-track": {
      "aliasTarget": {
        "id": "color-static-white-alpha-08",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-progress-track": "color(srgb 0.980392 0.980392 0.980392 / 0.08)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-progress-track",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.08}",
      "sourcePath": "semantic.dark.color.progress-track",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.08
      }
    },
    "color-scrollbar-thumb": {
      "aliasTarget": {
        "id": "color-static-white-alpha-24",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-scrollbar-thumb": "color(srgb 0.980392 0.980392 0.980392 / 0.24)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-scrollbar-thumb",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.24}",
      "sourcePath": "semantic.dark.color.scrollbar.thumb",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.24
      }
    },
    "color-scrollbar-thumb-hover": {
      "aliasTarget": {
        "id": "color-static-white-alpha-40",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-scrollbar-thumb-hover": "color(srgb 0.980392 0.980392 0.980392 / 0.4)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-scrollbar-thumb-hover",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.40}",
      "sourcePath": "semantic.dark.color.scrollbar.thumb-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.4
      }
    },
    "color-stroke-control": {
      "aliasTarget": {
        "id": "color-static-white-alpha-16",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-stroke-control": "color(srgb 0.980392 0.980392 0.980392 / 0.16)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-stroke-control",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.16}",
      "sourcePath": "semantic.dark.color.stroke-control",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.16
      }
    },
    "color-stroke-danger": {
      "aliasTarget": {
        "id": "color-red-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-stroke-danger": "color(srgb 1 0.294118 0.34902 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-stroke-danger",
      "mode": "dark",
      "rawValue": "{primitive.color.red.500}",
      "sourcePath": "semantic.dark.color.stroke-danger",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 1
      }
    },
    "color-stroke-default": {
      "aliasTarget": {
        "id": "color-palette-gray-600",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-stroke-default": "color(srgb 0.345098 0.360784 0.388235 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-stroke-default",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.600}",
      "sourcePath": "semantic.dark.color.stroke-default",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.345098,
          0.360784,
          0.388235
        ],
        "alpha": 1
      }
    },
    "color-stroke-focus": {
      "aliasTarget": {
        "id": "color-blue-400",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-stroke-focus": "color(srgb 0.219608 0.643137 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-stroke-focus",
      "mode": "dark",
      "rawValue": "{primitive.color.blue.400}",
      "sourcePath": "semantic.dark.color.stroke-focus",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.219608,
          0.643137,
          1
        ],
        "alpha": 1
      }
    },
    "color-stroke-hairline": {
      "aliasTarget": {
        "id": "color-static-white-alpha-08",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-stroke-hairline": "color(srgb 0.980392 0.980392 0.980392 / 0.08)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-stroke-hairline",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.08}",
      "sourcePath": "semantic.dark.color.stroke-hairline",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.08
      }
    },
    "color-stroke-strong": {
      "aliasTarget": {
        "id": "color-palette-gray-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-stroke-strong": "color(srgb 0.447059 0.458824 0.482353 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-stroke-strong",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.500}",
      "sourcePath": "semantic.dark.color.stroke-strong",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.447059,
          0.458824,
          0.482353
        ],
        "alpha": 1
      }
    },
    "color-stroke-subtle": {
      "aliasTarget": {
        "id": "color-palette-gray-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-stroke-subtle": "color(srgb 0.254902 0.270588 0.298039 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-stroke-subtle",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.700}",
      "sourcePath": "semantic.dark.color.stroke-subtle",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.254902,
          0.270588,
          0.298039
        ],
        "alpha": 1
      }
    },
    "color-stroke-tooltip": {
      "aliasTarget": {
        "id": "color-static-black-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-stroke-tooltip": "color(srgb 0.090196 0.105882 0.133333 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-stroke-tooltip",
      "mode": "dark",
      "rawValue": "{primitive.color.static-black-alpha.12}",
      "sourcePath": "semantic.dark.color.stroke-tooltip",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.12
      }
    },
    "color-stroke-underline": {
      "aliasTarget": {
        "id": "color-palette-gray-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-stroke-underline": "color(srgb 0.447059 0.458824 0.482353 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-stroke-underline",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.500}",
      "sourcePath": "semantic.dark.color.stroke-underline",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.447059,
          0.458824,
          0.482353
        ],
        "alpha": 1
      }
    },
    "color-switch-off-track": {
      "aliasTarget": {
        "id": "color-static-white-alpha-16",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-switch-off-track": "color(srgb 0.980392 0.980392 0.980392 / 0.16)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-switch-off-track",
      "mode": "dark",
      "rawValue": "{primitive.color.static-white-alpha.16}",
      "sourcePath": "semantic.dark.color.switch-off-track",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.16
      }
    },
    "color-switch-on-track": {
      "aliasTarget": {
        "id": "color-green-500",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-switch-on-track": "color(srgb 0 0.776471 0.556863 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-switch-on-track",
      "mode": "dark",
      "rawValue": "{primitive.color.green.500}",
      "sourcePath": "semantic.dark.color.switch-on-track",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0.776471,
          0.556863
        ],
        "alpha": 1
      }
    },
    "color-switch-thumb": {
      "aliasTarget": {
        "id": "color-palette-gray-000",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-switch-thumb": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-switch-thumb",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.000}",
      "sourcePath": "semantic.dark.color.switch-thumb",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 1
      }
    },
    "color-table-header-surface": {
      "aliasTarget": {
        "id": "color-palette-gray-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-table-header-surface": "color(srgb 0.168627 0.184314 0.211765 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-table-header-surface",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.800}",
      "sourcePath": "semantic.dark.color.table-header-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.168627,
          0.184314,
          0.211765
        ],
        "alpha": 1
      }
    },
    "color-table-row-hover": {
      "aliasTarget": {
        "id": "color-palette-gray-800",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-table-row-hover": "color(srgb 0.168627 0.184314 0.211765 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-table-row-hover",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.800}",
      "sourcePath": "semantic.dark.color.table-row-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.168627,
          0.184314,
          0.211765
        ],
        "alpha": 1
      }
    },
    "color-table-row-line": {
      "aliasTarget": {
        "id": "color-palette-gray-700",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-color-table-row-line": "color(srgb 0.254902 0.270588 0.298039 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-table-row-line",
      "mode": "dark",
      "rawValue": "{primitive.color.palette-gray.700}",
      "sourcePath": "semantic.dark.color.table-row-line",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.254902,
          0.270588,
          0.298039
        ],
        "alpha": 1
      }
    },
    "elevation-menu": {
      "aliasTarget": {
        "id": "shadow-menu-dark",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-elevation-menu": "0px 12px 32px 0px color(srgb 0 0 0 / 0.48)"
      },
      "deprecated": null,
      "description": null,
      "id": "elevation-menu",
      "mode": "dark",
      "rawValue": "{primitive.shadow.menu-dark}",
      "sourcePath": "semantic.dark.elevation.menu",
      "tier": "semantic",
      "type": "shadow",
      "value": [
        {
          "color": {
            "colorSpace": "srgb",
            "components": [
              0,
              0,
              0
            ],
            "alpha": 0.48
          },
          "offsetX": {
            "value": 0,
            "unit": "px"
          },
          "offsetY": {
            "value": 12,
            "unit": "px"
          },
          "blur": {
            "value": 32,
            "unit": "px"
          },
          "spread": {
            "value": 0,
            "unit": "px"
          },
          "inset": false
        }
      ]
    },
    "elevation-tooltip": {
      "aliasTarget": {
        "id": "shadow-tooltip-dark",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-elevation-tooltip": "0px 12px 24px 0px color(srgb 0.090196 0.105882 0.133333 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "elevation-tooltip",
      "mode": "dark",
      "rawValue": "{primitive.shadow.tooltip-dark}",
      "sourcePath": "semantic.dark.elevation.tooltip",
      "tier": "semantic",
      "type": "shadow",
      "value": {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0.090196,
            0.105882,
            0.133333
          ],
          "alpha": 0.12
        },
        "offsetX": {
          "value": 0,
          "unit": "px"
        },
        "offsetY": {
          "value": 12,
          "unit": "px"
        },
        "blur": {
          "value": 24,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        },
        "inset": false
      }
    },
    "elevation-upgrade": {
      "aliasTarget": {
        "id": "shadow-upgrade-dark",
        "mode": "base"
      },
      "cssProperties": {
        "--louis-elevation-upgrade": "inset 0px 0px 0px 1px color(srgb 0 0 0 / 0.08), 0px 1px 2px 0px color(srgb 0 0 0 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "elevation-upgrade",
      "mode": "dark",
      "rawValue": "{primitive.shadow.upgrade-dark}",
      "sourcePath": "semantic.dark.elevation.upgrade",
      "tier": "semantic",
      "type": "shadow",
      "value": [
        {
          "color": {
            "colorSpace": "srgb",
            "components": [
              0,
              0,
              0
            ],
            "alpha": 0.08
          },
          "offsetX": {
            "value": 0,
            "unit": "px"
          },
          "offsetY": {
            "value": 0,
            "unit": "px"
          },
          "blur": {
            "value": 0,
            "unit": "px"
          },
          "spread": {
            "value": 1,
            "unit": "px"
          },
          "inset": true
        },
        {
          "color": {
            "colorSpace": "srgb",
            "components": [
              0,
              0,
              0
            ],
            "alpha": 0.12
          },
          "offsetX": {
            "value": 0,
            "unit": "px"
          },
          "offsetY": {
            "value": 1,
            "unit": "px"
          },
          "blur": {
            "value": 2,
            "unit": "px"
          },
          "spread": {
            "value": 0,
            "unit": "px"
          },
          "inset": false
        }
      ]
    }
  }
};
