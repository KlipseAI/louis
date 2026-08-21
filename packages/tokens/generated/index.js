// GENERATED FILE — edit packages/tokens/src/klipse.tokens.json.
export const formatVersion = 1;
export const themes = Object.freeze(["light","dark"]);
export const metadata = Object.freeze({
  "contrastPairs": [
    {
      "foreground": "color-foreground-primary",
      "background": "color-background-canvas",
      "minimum": 4.5
    },
    {
      "foreground": "color-foreground-primary",
      "background": "color-background-surface",
      "minimum": 4.5
    },
    {
      "foreground": "color-foreground-on-inverse",
      "background": "color-background-inverse",
      "minimum": 4.5
    },
    {
      "background": "color-action-primary",
      "foreground": "color-foreground-inverse",
      "minimum": 3,
      "note": "제품 브랜드 블루(blue.500 #0088ff)를 정본으로 채택한 owner 결정의 결과다. 흰 글자(neutral-0) 대비가 3.37로 WCAG 2.2 AA의 일반 텍스트 기준 4.5에 미달한다. 4.5를 넘는 첫 단계는 blue.700(6.12)인데 제품에서 2번밖에 쓰이지 않는 색이라 브랜드가 아니다. 이 미달은 제품이 이미 갖고 있는 것이며 DS가 그것을 그대로 재현한다. 해소하려면 라벨을 18.66px bold 이상으로 키우거나 면 색을 어둡게 바꿔야 하고, 둘 다 owner 판정 대상이다."
    },
    {
      "foreground": "color-foreground-danger",
      "background": "color-background-danger",
      "minimum": 4.5
    },
    {
      "foreground": "color-foreground-success",
      "background": "color-background-success",
      "minimum": 4.5
    },
    {
      "foreground": "color-foreground-warning",
      "background": "color-background-warning",
      "minimum": 4.5
    },
    {
      "foreground": "color-foreground-info",
      "background": "color-background-info",
      "minimum": 4.5
    },
    {
      "background": "color-action-primary-hover",
      "foreground": "color-foreground-inverse",
      "minimum": 2.5,
      "note": "hover 면(blue.400)은 대비가 2.54로 기본 면보다 더 낮다. 제품이 hover에서 밝아지기 때문이며(filter: brightness(1.06)), 그 방향을 따랐다. 기본 면이 이미 AA 미달이므로 hover만 따로 지킬 수 없다. 이 쌍을 게이트에 올려 두는 이유는 통과시키려는 것이 아니라 수치를 드러내 두기 위해서다."
    },
    {
      "background": "color-action-primary-active",
      "foreground": "color-foreground-inverse",
      "minimum": 4,
      "note": "pressed 면(blue.600)은 대비 4.41로 AA에 근소하게 미달한다. hover가 밝아지므로 pressed는 어두워져 두 상태를 구분한다. 기본 면과 같은 사유로 미달을 수용한다."
    },
    {
      "background": "color-action-danger",
      "foreground": "color-foreground-on-danger",
      "minimum": 3,
      "note": "제품의 danger는 solid #ff4b59에 흰 글자이고 대비가 3.14로 WCAG AA 4.5에 미달한다. owner가 제품 공용 컴포넌트를 정본으로 택했고 이 미달은 제품이 이미 갖고 있는 것이다. 해소하려면 면을 어둡게(red.600 이하) 하거나 라벨을 크게 해야 하며 둘 다 브랜드 판정 대상이다."
    },
    {
      "background": "color-background-canvas",
      "foreground": "color-action-secondary-foreground",
      "minimum": 3.5,
      "note": "제품의 secondary·ghost 전경은 gray-600 #777d89이고 흰 배경 대비 4.13, DS canvas 대비 3.67로 WCAG AA 4.5에 미달한다. 제품 값을 정본으로 채택한 결과다. 한 단계 진한 neutral.700을 쓰면 6.35로 통과하지만 제품과 달라진다. 다크 모드는 제품이 알파(paper-alpha 72)를 쓰는데 알파 전경은 배경에 따라 대비가 달라져 게이트가 잴 수 없으므로 가장 가까운 불투명 단계 neutral.400을 쓴다."
    },
    {
      "foreground": "color-foreground-danger-on-surface",
      "background": "color-background-surface",
      "minimum": 4.5
    },
    {
      "foreground": "color-foreground-danger-on-surface",
      "background": "color-background-menu",
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
      "motion": "motion-list-enter",
      "reduced": "motion-reduced"
    },
    {
      "motion": "motion-list-stagger-step",
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
  "color-amber-100": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-amber-100",
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
    "sourcePath": "primitive.color.amber.100",
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
  "color-amber-500": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-amber-500",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.741176,
        0.180392
      ],
      "hex": "#ffbd2e"
    },
    "sourcePath": "primitive.color.amber.500",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.741176,
        0.180392
      ],
      "alpha": 1
    }
  },
  "color-amber-700": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-amber-700",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.721569,
        0.478431,
        0
      ],
      "hex": "#b87a00"
    },
    "sourcePath": "primitive.color.amber.700",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.721569,
        0.478431,
        0
      ],
      "alpha": 1
    }
  },
  "color-amber-900": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-amber-900",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.360784,
        0.239216,
        0
      ],
      "hex": "#5c3d00"
    },
    "sourcePath": "primitive.color.amber.900",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.360784,
        0.239216,
        0
      ],
      "alpha": 1
    }
  },
  "color-black-alpha-28": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-black-alpha-28",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0,
        0,
        0
      ],
      "alpha": 0.28,
      "hex": "#000000"
    },
    "sourcePath": "primitive.color.black-alpha.28",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0,
        0,
        0
      ],
      "alpha": 0.28
    }
  },
  "color-black-alpha-56": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-black-alpha-56",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0,
        0,
        0
      ],
      "alpha": 0.56,
      "hex": "#000000"
    },
    "sourcePath": "primitive.color.black-alpha.56",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0,
        0,
        0
      ],
      "alpha": 0.56
    }
  },
  "color-black-alpha-72": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-black-alpha-72",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0,
        0,
        0
      ],
      "alpha": 0.72,
      "hex": "#000000"
    },
    "sourcePath": "primitive.color.black-alpha.72",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0,
        0,
        0
      ],
      "alpha": 0.72
    }
  },
  "color-blue-100": {
    "aliasTarget": null,
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
  "color-blue-400": {
    "aliasTarget": null,
    "cssProperties": {},
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
  "color-blue-50": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-blue-50",
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
    "sourcePath": "primitive.color.blue.50",
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
  "color-blue-500": {
    "aliasTarget": null,
    "cssProperties": {},
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
  "color-blue-600": {
    "aliasTarget": null,
    "cssProperties": {},
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
  "color-blue-700": {
    "aliasTarget": null,
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-green-100",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.894118,
        0.972549,
        0.917647
      ],
      "hex": "#e4f8ea"
    },
    "sourcePath": "primitive.color.green.100",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.894118,
        0.972549,
        0.917647
      ],
      "alpha": 1
    }
  },
  "color-green-500": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-green-500",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.156863,
        0.784314,
        0.25098
      ],
      "hex": "#28c840"
    },
    "sourcePath": "primitive.color.green.500",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.156863,
        0.784314,
        0.25098
      ],
      "alpha": 1
    }
  },
  "color-green-700": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-green-700",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.478431,
        0.172549
      ],
      "hex": "#177a2c"
    },
    "sourcePath": "primitive.color.green.700",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.478431,
        0.172549
      ],
      "alpha": 1
    }
  },
  "color-green-900": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-green-900",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.043137,
        0.239216,
        0.094118
      ],
      "hex": "#0b3d18"
    },
    "sourcePath": "primitive.color.green.900",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.043137,
        0.239216,
        0.094118
      ],
      "alpha": 1
    }
  },
  "color-ink-alpha-10": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-ink-alpha-10",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.1,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.ink-alpha.10",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.1
    }
  },
  "color-ink-alpha-12": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-ink-alpha-12",
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
    "sourcePath": "primitive.color.ink-alpha.12",
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
  "color-ink-alpha-16": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-ink-alpha-16",
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
    "sourcePath": "primitive.color.ink-alpha.16",
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
  "color-ink-alpha-20": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-ink-alpha-20",
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
    "sourcePath": "primitive.color.ink-alpha.20",
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
  "color-ink-alpha-25": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-ink-alpha-25",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.25,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.ink-alpha.25",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.25
    }
  },
  "color-ink-alpha-30": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-ink-alpha-30",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.3,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.ink-alpha.30",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.3
    }
  },
  "color-ink-alpha-4": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-ink-alpha-4",
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
    "sourcePath": "primitive.color.ink-alpha.4",
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
  "color-ink-alpha-40": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-ink-alpha-40",
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
    "sourcePath": "primitive.color.ink-alpha.40",
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
  "color-ink-alpha-5": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-ink-alpha-5",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.05,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.ink-alpha.5",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.05
    }
  },
  "color-ink-alpha-50": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-ink-alpha-50",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.5,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.ink-alpha.50",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.5
    }
  },
  "color-ink-alpha-6": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-ink-alpha-6",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.06,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.ink-alpha.6",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.06
    }
  },
  "color-ink-alpha-60": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-ink-alpha-60",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.6,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.ink-alpha.60",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.6
    }
  },
  "color-ink-alpha-70": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-ink-alpha-70",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.7,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.ink-alpha.70",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.7
    }
  },
  "color-ink-alpha-8": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-ink-alpha-8",
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
    "sourcePath": "primitive.color.ink-alpha.8",
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
  "color-ink-alpha-80": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-ink-alpha-80",
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
    "sourcePath": "primitive.color.ink-alpha.80",
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
  "color-ink-alpha-86": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-ink-alpha-86",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.86,
      "hex": "#171b22"
    },
    "sourcePath": "primitive.color.ink-alpha.86",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.090196,
        0.105882,
        0.133333
      ],
      "alpha": 0.86
    }
  },
  "color-inverse-alpha-dark-70": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-inverse-alpha-dark-70",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.192157,
        0.211765,
        0.25098
      ],
      "alpha": 0.7,
      "hex": "#313640"
    },
    "sourcePath": "primitive.color.inverse-alpha.dark-70",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.192157,
        0.211765,
        0.25098
      ],
      "alpha": 0.7
    }
  },
  "color-inverse-alpha-light-70": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-inverse-alpha-light-70",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.890196,
        0.894118,
        0.909804
      ],
      "alpha": 0.7,
      "hex": "#e3e4e8"
    },
    "sourcePath": "primitive.color.inverse-alpha.light-70",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.890196,
        0.894118,
        0.909804
      ],
      "alpha": 0.7
    }
  },
  "color-mint-100": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-mint-100",
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
    "sourcePath": "primitive.color.mint.100",
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
  "color-mint-200": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-mint-200",
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
    "sourcePath": "primitive.color.mint.200",
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
  "color-mint-300": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-mint-300",
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
    "sourcePath": "primitive.color.mint.300",
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
  "color-mint-400": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-mint-400",
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
    "sourcePath": "primitive.color.mint.400",
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
  "color-mint-500": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-mint-500",
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
    "sourcePath": "primitive.color.mint.500",
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
  "color-mint-600": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-mint-600",
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
    "sourcePath": "primitive.color.mint.600",
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
  "color-mint-700": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-mint-700",
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
    "sourcePath": "primitive.color.mint.700",
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
  "color-mint-800": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-mint-800",
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
    "sourcePath": "primitive.color.mint.800",
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
  "color-mint-900": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-mint-900",
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
    "sourcePath": "primitive.color.mint.900",
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
  "color-neutral-0": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-neutral-0",
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
    "sourcePath": "primitive.color.neutral.0",
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
  "color-neutral-100": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-neutral-100",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.945098,
        0.945098,
        0.952941
      ],
      "hex": "#f1f1f3"
    },
    "sourcePath": "primitive.color.neutral.100",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.945098,
        0.945098,
        0.952941
      ],
      "alpha": 1
    }
  },
  "color-neutral-1000": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-neutral-1000",
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
    "sourcePath": "primitive.color.neutral.1000",
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
  "color-neutral-150": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-neutral-150",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.917647,
        0.921569,
        0.933333
      ],
      "hex": "#eaebee"
    },
    "sourcePath": "primitive.color.neutral.150",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.917647,
        0.921569,
        0.933333
      ],
      "alpha": 1
    }
  },
  "color-neutral-200": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-neutral-200",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.890196,
        0.894118,
        0.909804
      ],
      "hex": "#e3e4e8"
    },
    "sourcePath": "primitive.color.neutral.200",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.890196,
        0.894118,
        0.909804
      ],
      "alpha": 1
    }
  },
  "color-neutral-300": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-neutral-300",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.835294,
        0.843137,
        0.866667
      ],
      "hex": "#d5d7dd"
    },
    "sourcePath": "primitive.color.neutral.300",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.835294,
        0.843137,
        0.866667
      ],
      "alpha": 1
    }
  },
  "color-neutral-400": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-neutral-400",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.737255,
        0.752941,
        0.788235
      ],
      "hex": "#bcc0c9"
    },
    "sourcePath": "primitive.color.neutral.400",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.737255,
        0.752941,
        0.788235
      ],
      "alpha": 1
    }
  },
  "color-neutral-50": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-neutral-50",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.972549,
        0.972549,
        0.976471
      ],
      "hex": "#f8f8f9"
    },
    "sourcePath": "primitive.color.neutral.50",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.972549,
        0.972549,
        0.976471
      ],
      "alpha": 1
    }
  },
  "color-neutral-500": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-neutral-500",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.603922,
        0.627451,
        0.670588
      ],
      "hex": "#9aa0ab"
    },
    "sourcePath": "primitive.color.neutral.500",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.603922,
        0.627451,
        0.670588
      ],
      "alpha": 1
    }
  },
  "color-neutral-600": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-neutral-600",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.466667,
        0.490196,
        0.537255
      ],
      "hex": "#777d89"
    },
    "sourcePath": "primitive.color.neutral.600",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.466667,
        0.490196,
        0.537255
      ],
      "alpha": 1
    }
  },
  "color-neutral-700": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-neutral-700",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.341176,
        0.364706,
        0.407843
      ],
      "hex": "#575d68"
    },
    "sourcePath": "primitive.color.neutral.700",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.341176,
        0.364706,
        0.407843
      ],
      "alpha": 1
    }
  },
  "color-neutral-800": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-neutral-800",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.192157,
        0.211765,
        0.25098
      ],
      "hex": "#313640"
    },
    "sourcePath": "primitive.color.neutral.800",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.192157,
        0.211765,
        0.25098
      ],
      "alpha": 1
    }
  },
  "color-neutral-900": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-neutral-900",
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
    "sourcePath": "primitive.color.neutral.900",
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
  "color-paper-alpha-10": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-paper-alpha-10",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.1,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.paper-alpha.10",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.1
    }
  },
  "color-paper-alpha-12": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-paper-alpha-12",
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
    "sourcePath": "primitive.color.paper-alpha.12",
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
  "color-paper-alpha-14": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-paper-alpha-14",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.14,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.paper-alpha.14",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.14
    }
  },
  "color-paper-alpha-16": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-paper-alpha-16",
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
    "sourcePath": "primitive.color.paper-alpha.16",
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
  "color-paper-alpha-20": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-paper-alpha-20",
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
    "sourcePath": "primitive.color.paper-alpha.20",
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
  "color-paper-alpha-25": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-paper-alpha-25",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.25,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.paper-alpha.25",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.25
    }
  },
  "color-paper-alpha-30": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-paper-alpha-30",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.3,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.paper-alpha.30",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.3
    }
  },
  "color-paper-alpha-4": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-paper-alpha-4",
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
    "sourcePath": "primitive.color.paper-alpha.4",
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
  "color-paper-alpha-40": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-paper-alpha-40",
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
    "sourcePath": "primitive.color.paper-alpha.40",
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
  "color-paper-alpha-45": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-paper-alpha-45",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.45,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.paper-alpha.45",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.45
    }
  },
  "color-paper-alpha-50": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-paper-alpha-50",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.5,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.paper-alpha.50",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.5
    }
  },
  "color-paper-alpha-6": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-paper-alpha-6",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.06,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.paper-alpha.6",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.06
    }
  },
  "color-paper-alpha-60": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-paper-alpha-60",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.6,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.paper-alpha.60",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.6
    }
  },
  "color-paper-alpha-70": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-paper-alpha-70",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.7,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.paper-alpha.70",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.7
    }
  },
  "color-paper-alpha-72": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-paper-alpha-72",
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
    "sourcePath": "primitive.color.paper-alpha.72",
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
  "color-paper-alpha-8": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-paper-alpha-8",
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
    "sourcePath": "primitive.color.paper-alpha.8",
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
  "color-paper-alpha-80": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-paper-alpha-80",
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
    "sourcePath": "primitive.color.paper-alpha.80",
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
  "color-paper-alpha-86": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-paper-alpha-86",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.86,
      "hex": "#fafafa"
    },
    "sourcePath": "primitive.color.paper-alpha.86",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        0.980392,
        0.980392,
        0.980392
      ],
      "alpha": 0.86
    }
  },
  "color-paper-alpha-88": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-paper-alpha-88",
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
    "sourcePath": "primitive.color.paper-alpha.88",
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
  "color-pink-100": {
    "aliasTarget": null,
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
  "color-red-alpha-10": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-red-alpha-10",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 0.1,
      "hex": "#ff4b59"
    },
    "sourcePath": "primitive.color.red-alpha.10",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 0.1
    }
  },
  "color-red-alpha-12": {
    "aliasTarget": null,
    "cssProperties": {},
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
  "color-red-alpha-16": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-red-alpha-16",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 0.16,
      "hex": "#ff4b59"
    },
    "sourcePath": "primitive.color.red-alpha.16",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 0.16
    }
  },
  "color-red-alpha-20": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-red-alpha-20",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 0.2,
      "hex": "#ff4b59"
    },
    "sourcePath": "primitive.color.red-alpha.20",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 0.2
    }
  },
  "color-red-alpha-25": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-red-alpha-25",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 0.25,
      "hex": "#ff4b59"
    },
    "sourcePath": "primitive.color.red-alpha.25",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 0.25
    }
  },
  "color-red-alpha-6": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-red-alpha-6",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 0.06,
      "hex": "#ff4b59"
    },
    "sourcePath": "primitive.color.red-alpha.6",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 0.06
    }
  },
  "color-red-alpha-60": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-red-alpha-60",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 0.6,
      "hex": "#ff4b59"
    },
    "sourcePath": "primitive.color.red-alpha.60",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 0.6
    }
  },
  "color-red-alpha-8": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-red-alpha-8",
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
    "sourcePath": "primitive.color.red-alpha.8",
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
  "color-red-alpha-80": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "color-red-alpha-80",
    "mode": "base",
    "rawValue": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 0.8,
      "hex": "#ff4b59"
    },
    "sourcePath": "primitive.color.red-alpha.80",
    "tier": "primitive",
    "type": "color",
    "value": {
      "colorSpace": "srgb",
      "components": [
        1,
        0.294118,
        0.34902
      ],
      "alpha": 0.8
    }
  },
  "color-violet-100": {
    "aliasTarget": null,
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
    "cssProperties": {},
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
  "line-height-body": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "line-height-body",
    "mode": "base",
    "rawValue": 1.5,
    "sourcePath": "primitive.line-height.body",
    "tier": "primitive",
    "type": "number",
    "value": 1.5
  },
  "line-height-heading": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "line-height-heading",
    "mode": "base",
    "rawValue": 1.35,
    "sourcePath": "primitive.line-height.heading",
    "tier": "primitive",
    "type": "number",
    "value": 1.35
  },
  "line-height-tight": {
    "aliasTarget": null,
    "cssProperties": {},
    "deprecated": null,
    "description": null,
    "id": "line-height-tight",
    "mode": "base",
    "rawValue": 1.2,
    "sourcePath": "primitive.line-height.tight",
    "tier": "primitive",
    "type": "number",
    "value": 1.2
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
          "alpha": 0.04,
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
          "value": 15,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        }
      },
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0.341176,
            0.364706,
            0.407843
          ],
          "alpha": 1,
          "hex": "#575d68"
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
          "value": 0.5,
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
          "alpha": 0.04
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
          "value": 15,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        },
        "inset": false
      },
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0.341176,
            0.364706,
            0.407843
          ],
          "alpha": 1
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
          "value": 0.5,
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
          "alpha": 0.04,
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
          "value": 15,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        }
      },
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0.835294,
            0.843137,
            0.866667
          ],
          "alpha": 1,
          "hex": "#d5d7dd"
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
          "value": 0.5,
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
          "alpha": 0.04
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
          "value": 15,
          "unit": "px"
        },
        "spread": {
          "value": 0,
          "unit": "px"
        },
        "inset": false
      },
      {
        "color": {
          "colorSpace": "srgb",
          "components": [
            0.835294,
            0.843137,
            0.866667
          ],
          "alpha": 1
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
          "value": 0.5,
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
          "alpha": 0.06,
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
          "alpha": 0.06
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
    "blur-panel": {
      "aliasTarget": {
        "id": "blur-12",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-blur-panel": "12px"
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
        "--kds-blur-surface": "10px"
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
        "--kds-blur-toast": "16px"
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
        "--kds-border-width-default": "1px"
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
        "--kds-border-width-hairline": "0.5px"
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
        "--kds-border-width-ring": "2px"
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
    "elevation-focus-ring": {
      "aliasTarget": {
        "id": "shadow-focus-ring",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-elevation-focus-ring": "0px 0px 0px 3px color(srgb 0 0.533333 1 / 0.42)"
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
        "--kds-elevation-modal": "0px 16px 48px -8px color(srgb 0 0 0 / 0.22)"
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
        "--kds-elevation-popover": "0px 8px 24px -4px color(srgb 0 0 0 / 0.14)"
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
        "--kds-elevation-surface": "0px 2px 8px 0px color(srgb 0 0 0 / 0.06)"
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
    "elevation-toast": {
      "aliasTarget": {
        "id": "shadow-toast",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-elevation-toast": "0px 8px 20px 0px color(srgb 0 0 0 / 0.16)"
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
    "icon-size-lg": {
      "aliasTarget": {
        "id": "space-24",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-icon-size-lg": "24px"
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
        "--kds-icon-size-md": "20px"
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
        "--kds-icon-size-sm": "16px"
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
        "--kds-icon-size-xl": "64px"
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
        "--kds-layer-content": "0"
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
        "--kds-layer-critical": "400"
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
        "--kds-layer-modal": "300"
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
        "--kds-layer-popover": "200"
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
        "--kds-layer-sticky": "100"
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
    "layout-app-shell-brand-mark-height": {
      "aliasTarget": {
        "id": "space-28",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-layout-app-shell-brand-mark-height": "28px"
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
        "--kds-layout-app-shell-content-inset": "16px"
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
        "--kds-layout-app-shell-content-reserve": "120px"
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
        "--kds-layout-app-shell-outer-gap": "12px"
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
        "--kds-layout-app-shell-sidebar-collapsed": "56px"
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
        "--kds-layout-app-shell-sidebar-padding": "12px"
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
        "--kds-layout-app-shell-sidebar-width": "280px"
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
        "--kds-layout-app-shell-top-bar-height": "40px"
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
    "layout-control-height-md": {
      "aliasTarget": {
        "id": "space-40",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-layout-control-height-md": "40px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-control-height-md",
      "mode": "global",
      "rawValue": "{primitive.spacing.40}",
      "sourcePath": "semantic.global.layout.control-height-md",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 40,
        "unit": "px"
      }
    },
    "layout-control-height-sm": {
      "aliasTarget": {
        "id": "space-32",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-layout-control-height-sm": "32px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-control-height-sm",
      "mode": "global",
      "rawValue": "{primitive.spacing.32}",
      "sourcePath": "semantic.global.layout.control-height-sm",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 32,
        "unit": "px"
      }
    },
    "layout-control-hit-target-minimum": {
      "aliasTarget": {
        "id": "space-44",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-layout-control-hit-target-minimum": "44px"
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
    "layout-control-minimum-width-sm": {
      "aliasTarget": {
        "id": "space-48",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-layout-control-minimum-width-sm": "48px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-control-minimum-width-sm",
      "mode": "global",
      "rawValue": "{primitive.spacing.48}",
      "sourcePath": "semantic.global.layout.control-minimum-width-sm",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 48,
        "unit": "px"
      }
    },
    "layout-progress-bar-height": {
      "aliasTarget": {
        "id": "space-6",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-layout-progress-bar-height": "6px"
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
        "--kds-layout-progress-bar-max-inline-size": "320px"
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
        "--kds-layout-project-card-minimum": "240px"
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
        "id": "space-12",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-layout-project-grid-gap": "12px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-project-grid-gap",
      "mode": "global",
      "rawValue": "{primitive.spacing.12}",
      "sourcePath": "semantic.global.layout.project-grid-gap",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 12,
        "unit": "px"
      }
    },
    "motion-content-fade": {
      "aliasTarget": {
        "id": "transition-content-fade",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-motion-content-fade-duration": "300ms",
        "--kds-motion-content-fade-delay": "0ms",
        "--kds-motion-content-fade-timing-function": "cubic-bezier(0.25, 0.1, 0.25, 1)"
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
        "--kds-motion-content-rise-duration": "360ms",
        "--kds-motion-content-rise-delay": "0ms",
        "--kds-motion-content-rise-timing-function": "cubic-bezier(0.22, 1, 0.36, 1)"
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
        "--kds-motion-control-hover-duration": "160ms",
        "--kds-motion-control-hover-delay": "0ms",
        "--kds-motion-control-hover-timing-function": "cubic-bezier(0.25, 0.1, 0.25, 1)"
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
        "--kds-motion-crossfade-enter-duration": "420ms",
        "--kds-motion-crossfade-enter-delay": "0ms",
        "--kds-motion-crossfade-enter-timing-function": "cubic-bezier(0.25, 0.1, 0.25, 1)"
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
        "--kds-motion-layout-change-duration": "220ms",
        "--kds-motion-layout-change-delay": "0ms",
        "--kds-motion-layout-change-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)"
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
        "--kds-motion-list-enter-duration": "560ms",
        "--kds-motion-list-enter-delay": "0ms",
        "--kds-motion-list-enter-timing-function": "cubic-bezier(0.23, 1, 0.32, 1)"
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
        "--kds-motion-list-stagger-step-duration": "560ms",
        "--kds-motion-list-stagger-step-delay": "36ms",
        "--kds-motion-list-stagger-step-timing-function": "cubic-bezier(0.23, 1, 0.32, 1)"
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
        "--kds-motion-menu-enter-duration": "260ms",
        "--kds-motion-menu-enter-delay": "0ms",
        "--kds-motion-menu-enter-timing-function": "cubic-bezier(0.32, 0.72, 0, 1)"
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
        "--kds-motion-menu-exit-duration": "130ms",
        "--kds-motion-menu-exit-delay": "0ms",
        "--kds-motion-menu-exit-timing-function": "cubic-bezier(0.42, 0, 1, 1)"
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
        "--kds-motion-modal-enter-duration": "320ms",
        "--kds-motion-modal-enter-delay": "0ms",
        "--kds-motion-modal-enter-timing-function": "cubic-bezier(0.32, 0.72, 0, 1)"
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
        "--kds-motion-modal-exit-duration": "200ms",
        "--kds-motion-modal-exit-delay": "0ms",
        "--kds-motion-modal-exit-timing-function": "cubic-bezier(0.4, 0, 1, 1)"
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
        "--kds-motion-overlay-enter-duration": "200ms",
        "--kds-motion-overlay-enter-delay": "0ms",
        "--kds-motion-overlay-enter-timing-function": "cubic-bezier(0.32, 0.72, 0, 1)"
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
        "--kds-motion-overlay-exit-duration": "120ms",
        "--kds-motion-overlay-exit-delay": "0ms",
        "--kds-motion-overlay-exit-timing-function": "cubic-bezier(0.4, 0, 1, 1)"
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
        "--kds-motion-reduced-duration": "0ms",
        "--kds-motion-reduced-delay": "0ms",
        "--kds-motion-reduced-timing-function": "cubic-bezier(0.2, 0, 0, 1)"
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
    "motion-shell-collapse": {
      "aliasTarget": {
        "id": "transition-shell-collapse",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-motion-shell-collapse-duration": "320ms",
        "--kds-motion-shell-collapse-delay": "0ms",
        "--kds-motion-shell-collapse-timing-function": "cubic-bezier(0.4, 0, 0.2, 1)"
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
        "--kds-motion-shimmer-duration": "1600ms",
        "--kds-motion-shimmer-delay": "0ms",
        "--kds-motion-shimmer-timing-function": "cubic-bezier(0.2, 0, 0, 1)"
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
        "--kds-motion-spin-duration": "700ms",
        "--kds-motion-spin-delay": "0ms",
        "--kds-motion-spin-timing-function": "cubic-bezier(0, 0, 1, 1)"
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
        "--kds-motion-stagger-1-duration": "360ms",
        "--kds-motion-stagger-1-delay": "40ms",
        "--kds-motion-stagger-1-timing-function": "cubic-bezier(0.22, 1, 0.36, 1)"
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
        "--kds-motion-stagger-2-duration": "360ms",
        "--kds-motion-stagger-2-delay": "80ms",
        "--kds-motion-stagger-2-timing-function": "cubic-bezier(0.22, 1, 0.36, 1)"
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
        "--kds-motion-stagger-3-duration": "360ms",
        "--kds-motion-stagger-3-delay": "150ms",
        "--kds-motion-stagger-3-timing-function": "cubic-bezier(0.22, 1, 0.36, 1)"
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
    "motion-tooltip-enter": {
      "aliasTarget": {
        "id": "transition-tooltip-enter",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-motion-tooltip-enter-duration": "140ms",
        "--kds-motion-tooltip-enter-delay": "0ms",
        "--kds-motion-tooltip-enter-timing-function": "cubic-bezier(0.23, 1, 0.32, 1)"
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
        "--kds-motion-tooltip-exit-duration": "120ms",
        "--kds-motion-tooltip-exit-delay": "0ms",
        "--kds-motion-tooltip-exit-timing-function": "cubic-bezier(0.19, 1, 0.22, 1)"
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
        "--kds-motion-zoom-settle-duration": "680ms",
        "--kds-motion-zoom-settle-delay": "0ms",
        "--kds-motion-zoom-settle-timing-function": "cubic-bezier(0.22, 1, 0.36, 1)"
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
    "radius-card": {
      "aliasTarget": {
        "id": "radius-16",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-radius-card": "16px"
      },
      "deprecated": null,
      "description": null,
      "id": "radius-card",
      "mode": "global",
      "rawValue": "{primitive.radius.16}",
      "sourcePath": "semantic.global.radius.card",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 16,
        "unit": "px"
      }
    },
    "radius-card-lg": {
      "aliasTarget": {
        "id": "radius-20",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-radius-card-lg": "20px"
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
        "--kds-radius-control": "12px"
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
        "--kds-radius-control-sm": "8px"
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
    "radius-overlay": {
      "aliasTarget": {
        "id": "radius-16",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-radius-overlay": "16px"
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
        "--kds-radius-overlay-item": "10px"
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
        "--kds-radius-overlay-lg": "24px"
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
        "--kds-radius-pill": "999px"
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
    "space-control-lg": {
      "aliasTarget": {
        "id": "space-16",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-space-control-lg": "16px"
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
        "--kds-space-control-md": "12px"
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
        "--kds-space-control-sm": "8px"
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
        "--kds-space-control-xs": "4px"
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
        "--kds-space-layout-gutter": "16px"
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
        "--kds-space-layout-section": "24px"
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
        "--kds-space-media-inset": "20px"
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
        "--kds-space-overlay-inset": "6px"
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
        "--kds-space-overlay-item-content-gap": "6px"
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
        "--kds-space-overlay-item-gap": "2px"
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
    "space-progress-ring-gap": {
      "aliasTarget": {
        "id": "space-2",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-space-progress-ring-gap": "2px"
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
        "--kds-space-stack-md": "12px"
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
        "--kds-space-stack-xs": "4px"
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
        "--kds-space-toast-inline": "20px"
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
    "typography-body-lg-medium": {
      "aliasTarget": {
        "id": "type-style-body-lg-medium",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-typography-body-lg-medium-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--kds-typography-body-lg-medium-font-size": "20px",
        "--kds-typography-body-lg-medium-font-weight": "500",
        "--kds-typography-body-lg-medium-letter-spacing": "-0.2px",
        "--kds-typography-body-lg-medium-line-height": "1.5"
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
        "--kds-typography-body-lg-regular-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--kds-typography-body-lg-regular-font-size": "20px",
        "--kds-typography-body-lg-regular-font-weight": "400",
        "--kds-typography-body-lg-regular-letter-spacing": "-0.2px",
        "--kds-typography-body-lg-regular-line-height": "1.5"
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
        "--kds-typography-body-lg-semibold-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--kds-typography-body-lg-semibold-font-size": "20px",
        "--kds-typography-body-lg-semibold-font-weight": "600",
        "--kds-typography-body-lg-semibold-letter-spacing": "-0.2px",
        "--kds-typography-body-lg-semibold-line-height": "1.5"
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
        "--kds-typography-body-md-medium-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--kds-typography-body-md-medium-font-size": "16px",
        "--kds-typography-body-md-medium-font-weight": "500",
        "--kds-typography-body-md-medium-letter-spacing": "-0.16px",
        "--kds-typography-body-md-medium-line-height": "1.5"
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
        "--kds-typography-body-md-regular-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--kds-typography-body-md-regular-font-size": "16px",
        "--kds-typography-body-md-regular-font-weight": "400",
        "--kds-typography-body-md-regular-letter-spacing": "-0.16px",
        "--kds-typography-body-md-regular-line-height": "1.5"
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
        "--kds-typography-body-md-semibold-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--kds-typography-body-md-semibold-font-size": "16px",
        "--kds-typography-body-md-semibold-font-weight": "600",
        "--kds-typography-body-md-semibold-letter-spacing": "-0.16px",
        "--kds-typography-body-md-semibold-line-height": "1.5"
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
        "--kds-typography-body-sm-medium-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--kds-typography-body-sm-medium-font-size": "14px",
        "--kds-typography-body-sm-medium-font-weight": "500",
        "--kds-typography-body-sm-medium-letter-spacing": "-0.14px",
        "--kds-typography-body-sm-medium-line-height": "1.5"
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
        "--kds-typography-body-sm-regular-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--kds-typography-body-sm-regular-font-size": "14px",
        "--kds-typography-body-sm-regular-font-weight": "400",
        "--kds-typography-body-sm-regular-letter-spacing": "-0.14px",
        "--kds-typography-body-sm-regular-line-height": "1.5"
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
        "--kds-typography-body-sm-semibold-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--kds-typography-body-sm-semibold-font-size": "14px",
        "--kds-typography-body-sm-semibold-font-weight": "600",
        "--kds-typography-body-sm-semibold-letter-spacing": "-0.14px",
        "--kds-typography-body-sm-semibold-line-height": "1.5"
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
        "--kds-typography-caption-medium-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--kds-typography-caption-medium-font-size": "12px",
        "--kds-typography-caption-medium-font-weight": "500",
        "--kds-typography-caption-medium-letter-spacing": "-0.12px",
        "--kds-typography-caption-medium-line-height": "1.5"
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
        "--kds-typography-caption-regular-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--kds-typography-caption-regular-font-size": "12px",
        "--kds-typography-caption-regular-font-weight": "400",
        "--kds-typography-caption-regular-letter-spacing": "-0.12px",
        "--kds-typography-caption-regular-line-height": "1.5"
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
        "--kds-typography-caption-semibold-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--kds-typography-caption-semibold-font-size": "12px",
        "--kds-typography-caption-semibold-font-weight": "600",
        "--kds-typography-caption-semibold-letter-spacing": "-0.12px",
        "--kds-typography-caption-semibold-line-height": "1.5"
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
        "--kds-typography-heading-lg-medium-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--kds-typography-heading-lg-medium-font-size": "48px",
        "--kds-typography-heading-lg-medium-font-weight": "500",
        "--kds-typography-heading-lg-medium-letter-spacing": "-0.96px",
        "--kds-typography-heading-lg-medium-line-height": "1.35"
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
        "--kds-typography-heading-md-medium-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--kds-typography-heading-md-medium-font-size": "36px",
        "--kds-typography-heading-md-medium-font-weight": "500",
        "--kds-typography-heading-md-medium-letter-spacing": "-0.72px",
        "--kds-typography-heading-md-medium-line-height": "1.35"
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
    "typography-heading-sm-medium": {
      "aliasTarget": {
        "id": "type-style-heading-sm-medium",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-typography-heading-sm-medium-font-family": "\"Pretendard Variable\", \"Pretendard\", \"Inter\", \"Noto Sans KR\", \"Noto Sans JP\", system-ui, sans-serif",
        "--kds-typography-heading-sm-medium-font-size": "28px",
        "--kds-typography-heading-sm-medium-font-weight": "500",
        "--kds-typography-heading-sm-medium-letter-spacing": "-0.56px",
        "--kds-typography-heading-sm-medium-line-height": "1.35"
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
    "color-action-danger": {
      "aliasTarget": {
        "id": "color-red-500",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-action-danger": "color(srgb 1 0.294118 0.34902 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-action-danger",
      "mode": "light",
      "rawValue": "{primitive.color.red.500}",
      "sourcePath": "semantic.light.color.action-danger",
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
    "color-action-ghost-hover": {
      "aliasTarget": {
        "id": "color-ink-alpha-8",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-action-ghost-hover": "color(srgb 0.090196 0.105882 0.133333 / 0.08)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-action-ghost-hover",
      "mode": "light",
      "rawValue": "{primitive.color.ink-alpha.8}",
      "sourcePath": "semantic.light.color.action-ghost-hover",
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
    "color-action-menu-danger-hover": {
      "aliasTarget": {
        "id": "color-red-alpha-10",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-action-menu-danger-hover": "color(srgb 1 0.294118 0.34902 / 0.1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-action-menu-danger-hover",
      "mode": "light",
      "rawValue": "{primitive.color.red-alpha.10}",
      "sourcePath": "semantic.light.color.action-menu-danger-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          1,
          0.294118,
          0.34902
        ],
        "alpha": 0.1
      }
    },
    "color-action-menu-item-hover": {
      "aliasTarget": {
        "id": "color-ink-alpha-6",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-action-menu-item-hover": "color(srgb 0.090196 0.105882 0.133333 / 0.06)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-action-menu-item-hover",
      "mode": "light",
      "rawValue": "{primitive.color.ink-alpha.6}",
      "sourcePath": "semantic.light.color.action-menu-item-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.06
      }
    },
    "color-action-primary": {
      "aliasTarget": {
        "id": "color-blue-500",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-action-primary": "color(srgb 0 0.533333 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-action-primary",
      "mode": "light",
      "rawValue": "{primitive.color.blue.500}",
      "sourcePath": "semantic.light.color.action-primary",
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
    "color-action-primary-active": {
      "aliasTarget": {
        "id": "color-blue-600",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-action-primary-active": "color(srgb 0 0.458824 0.858824 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-action-primary-active",
      "mode": "light",
      "rawValue": "{primitive.color.blue.600}",
      "sourcePath": "semantic.light.color.action-primary-active",
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
    "color-action-primary-hover": {
      "aliasTarget": {
        "id": "color-blue-400",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-action-primary-hover": "color(srgb 0.219608 0.643137 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-action-primary-hover",
      "mode": "light",
      "rawValue": "{primitive.color.blue.400}",
      "sourcePath": "semantic.light.color.action-primary-hover",
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
    "color-action-secondary-foreground": {
      "aliasTarget": {
        "id": "color-neutral-600",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-action-secondary-foreground": "color(srgb 0.466667 0.490196 0.537255 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-action-secondary-foreground",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.600}",
      "sourcePath": "semantic.light.color.action-secondary-foreground",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.466667,
          0.490196,
          0.537255
        ],
        "alpha": 1
      }
    },
    "color-action-secondary-hover": {
      "aliasTarget": {
        "id": "color-ink-alpha-5",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-action-secondary-hover": "color(srgb 0.090196 0.105882 0.133333 / 0.05)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-action-secondary-hover",
      "mode": "light",
      "rawValue": "{primitive.color.ink-alpha.5}",
      "sourcePath": "semantic.light.color.action-secondary-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.05
      }
    },
    "color-background-canvas": {
      "aliasTarget": {
        "id": "color-neutral-100",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-canvas": "color(srgb 0.945098 0.945098 0.952941 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-canvas",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.100}",
      "sourcePath": "semantic.light.color.background-canvas",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.945098,
          0.945098,
          0.952941
        ],
        "alpha": 1
      }
    },
    "color-background-danger": {
      "aliasTarget": {
        "id": "color-red-100",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-danger": "color(srgb 1 0.898039 0.909804 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-danger",
      "mode": "light",
      "rawValue": "{primitive.color.red.100}",
      "sourcePath": "semantic.light.color.background-danger",
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
    "color-background-info": {
      "aliasTarget": {
        "id": "color-blue-50",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-info": "color(srgb 0.941176 0.968627 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-info",
      "mode": "light",
      "rawValue": "{primitive.color.blue.50}",
      "sourcePath": "semantic.light.color.background-info",
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
    "color-background-inset": {
      "aliasTarget": {
        "id": "color-neutral-150",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-inset": "color(srgb 0.917647 0.921569 0.933333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-inset",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.150}",
      "sourcePath": "semantic.light.color.background-inset",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.917647,
          0.921569,
          0.933333
        ],
        "alpha": 1
      }
    },
    "color-background-inverse": {
      "aliasTarget": {
        "id": "color-neutral-800",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-inverse": "color(srgb 0.192157 0.211765 0.25098 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-inverse",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.800}",
      "sourcePath": "semantic.light.color.background-inverse",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.192157,
          0.211765,
          0.25098
        ],
        "alpha": 1
      }
    },
    "color-background-inverse-translucent": {
      "aliasTarget": {
        "id": "color-inverse-alpha-dark-70",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-inverse-translucent": "color(srgb 0.192157 0.211765 0.25098 / 0.7)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-inverse-translucent",
      "mode": "light",
      "rawValue": "{primitive.color.inverse-alpha.dark-70}",
      "sourcePath": "semantic.light.color.background-inverse-translucent",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.192157,
          0.211765,
          0.25098
        ],
        "alpha": 0.7
      }
    },
    "color-background-menu": {
      "aliasTarget": {
        "id": "color-neutral-100",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-menu": "color(srgb 0.945098 0.945098 0.952941 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-menu",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.100}",
      "sourcePath": "semantic.light.color.background-menu",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.945098,
          0.945098,
          0.952941
        ],
        "alpha": 1
      }
    },
    "color-background-overlay": {
      "aliasTarget": {
        "id": "color-neutral-0",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-overlay": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-overlay",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.0}",
      "sourcePath": "semantic.light.color.background-overlay",
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
    "color-background-raised": {
      "aliasTarget": {
        "id": "color-neutral-0",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-raised": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-raised",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.0}",
      "sourcePath": "semantic.light.color.background-raised",
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
    "color-background-success": {
      "aliasTarget": {
        "id": "color-green-100",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-success": "color(srgb 0.894118 0.972549 0.917647 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-success",
      "mode": "light",
      "rawValue": "{primitive.color.green.100}",
      "sourcePath": "semantic.light.color.background-success",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.894118,
          0.972549,
          0.917647
        ],
        "alpha": 1
      }
    },
    "color-background-surface": {
      "aliasTarget": {
        "id": "color-neutral-0",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-surface": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-surface",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.0}",
      "sourcePath": "semantic.light.color.background-surface",
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
    "color-background-upgrade": {
      "aliasTarget": {
        "id": "color-neutral-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-upgrade": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-upgrade",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.900}",
      "sourcePath": "semantic.light.color.background-upgrade",
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
    "color-background-upgrade-current": {
      "aliasTarget": {
        "id": "color-neutral-50",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-upgrade-current": "color(srgb 0.972549 0.972549 0.976471 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-upgrade-current",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.50}",
      "sourcePath": "semantic.light.color.background-upgrade-current",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.972549,
          0.972549,
          0.976471
        ],
        "alpha": 1
      }
    },
    "color-background-upgrade-hover": {
      "aliasTarget": {
        "id": "color-neutral-800",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-upgrade-hover": "color(srgb 0.192157 0.211765 0.25098 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-upgrade-hover",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.800}",
      "sourcePath": "semantic.light.color.background-upgrade-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.192157,
          0.211765,
          0.25098
        ],
        "alpha": 1
      }
    },
    "color-background-warning": {
      "aliasTarget": {
        "id": "color-amber-100",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-warning": "color(srgb 1 0.960784 0.839216 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-warning",
      "mode": "light",
      "rawValue": "{primitive.color.amber.100}",
      "sourcePath": "semantic.light.color.background-warning",
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
    "color-border-control": {
      "aliasTarget": {
        "id": "color-ink-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-border-control": "color(srgb 0.090196 0.105882 0.133333 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-border-control",
      "mode": "light",
      "rawValue": "{primitive.color.ink-alpha.12}",
      "sourcePath": "semantic.light.color.border-control",
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
    "color-border-danger": {
      "aliasTarget": {
        "id": "color-red-500",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-border-danger": "color(srgb 1 0.294118 0.34902 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-border-danger",
      "mode": "light",
      "rawValue": "{primitive.color.red.500}",
      "sourcePath": "semantic.light.color.border-danger",
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
    "color-border-default": {
      "aliasTarget": {
        "id": "color-neutral-300",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-border-default": "color(srgb 0.835294 0.843137 0.866667 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-border-default",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.300}",
      "sourcePath": "semantic.light.color.border-default",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.835294,
          0.843137,
          0.866667
        ],
        "alpha": 1
      }
    },
    "color-border-focus": {
      "aliasTarget": {
        "id": "color-blue-500",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-border-focus": "color(srgb 0 0.533333 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-border-focus",
      "mode": "light",
      "rawValue": "{primitive.color.blue.500}",
      "sourcePath": "semantic.light.color.border-focus",
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
    "color-border-strong": {
      "aliasTarget": {
        "id": "color-neutral-500",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-border-strong": "color(srgb 0.603922 0.627451 0.670588 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-border-strong",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.500}",
      "sourcePath": "semantic.light.color.border-strong",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.603922,
          0.627451,
          0.670588
        ],
        "alpha": 1
      }
    },
    "color-border-subtle": {
      "aliasTarget": {
        "id": "color-neutral-200",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-border-subtle": "color(srgb 0.890196 0.894118 0.909804 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-border-subtle",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.200}",
      "sourcePath": "semantic.light.color.border-subtle",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.890196,
          0.894118,
          0.909804
        ],
        "alpha": 1
      }
    },
    "color-border-tooltip": {
      "aliasTarget": {
        "id": "color-paper-alpha-14",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-border-tooltip": "color(srgb 0.980392 0.980392 0.980392 / 0.14)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-border-tooltip",
      "mode": "light",
      "rawValue": "{primitive.color.paper-alpha.14}",
      "sourcePath": "semantic.light.color.border-tooltip",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.14
      }
    },
    "color-foreground-danger": {
      "aliasTarget": {
        "id": "color-red-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-danger": "color(srgb 0.329412 0.066667 0.098039 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-danger",
      "mode": "light",
      "rawValue": "{primitive.color.red.900}",
      "sourcePath": "semantic.light.color.foreground-danger",
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
    "color-foreground-danger-on-surface": {
      "aliasTarget": {
        "id": "color-red-700",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-danger-on-surface": "color(srgb 0.717647 0.141176 0.192157 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-danger-on-surface",
      "mode": "light",
      "rawValue": "{primitive.color.red.700}",
      "sourcePath": "semantic.light.color.foreground-danger-on-surface",
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
    "color-foreground-disabled": {
      "aliasTarget": {
        "id": "color-neutral-500",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-disabled": "color(srgb 0.603922 0.627451 0.670588 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-disabled",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.500}",
      "sourcePath": "semantic.light.color.foreground-disabled",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.603922,
          0.627451,
          0.670588
        ],
        "alpha": 1
      }
    },
    "color-foreground-info": {
      "aliasTarget": {
        "id": "color-blue-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-info": "color(srgb 0 0.203922 0.380392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-info",
      "mode": "light",
      "rawValue": "{primitive.color.blue.900}",
      "sourcePath": "semantic.light.color.foreground-info",
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
    "color-foreground-inverse": {
      "aliasTarget": {
        "id": "color-neutral-0",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-inverse": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-inverse",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.0}",
      "sourcePath": "semantic.light.color.foreground-inverse",
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
    "color-foreground-menu-item": {
      "aliasTarget": {
        "id": "color-ink-alpha-86",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-menu-item": "color(srgb 0.090196 0.105882 0.133333 / 0.86)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-menu-item",
      "mode": "light",
      "rawValue": "{primitive.color.ink-alpha.86}",
      "sourcePath": "semantic.light.color.foreground-menu-item",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.090196,
          0.105882,
          0.133333
        ],
        "alpha": 0.86
      }
    },
    "color-foreground-on-danger": {
      "aliasTarget": {
        "id": "color-neutral-0",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-on-danger": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-on-danger",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.0}",
      "sourcePath": "semantic.light.color.foreground-on-danger",
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
    "color-foreground-on-inverse": {
      "aliasTarget": {
        "id": "color-neutral-0",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-on-inverse": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-on-inverse",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.0}",
      "sourcePath": "semantic.light.color.foreground-on-inverse",
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
    "color-foreground-primary": {
      "aliasTarget": {
        "id": "color-neutral-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-primary": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-primary",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.900}",
      "sourcePath": "semantic.light.color.foreground-primary",
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
    "color-foreground-secondary": {
      "aliasTarget": {
        "id": "color-neutral-700",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-secondary": "color(srgb 0.341176 0.364706 0.407843 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-secondary",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.700}",
      "sourcePath": "semantic.light.color.foreground-secondary",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.341176,
          0.364706,
          0.407843
        ],
        "alpha": 1
      }
    },
    "color-foreground-success": {
      "aliasTarget": {
        "id": "color-green-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-success": "color(srgb 0.043137 0.239216 0.094118 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-success",
      "mode": "light",
      "rawValue": "{primitive.color.green.900}",
      "sourcePath": "semantic.light.color.foreground-success",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.043137,
          0.239216,
          0.094118
        ],
        "alpha": 1
      }
    },
    "color-foreground-tertiary": {
      "aliasTarget": {
        "id": "color-neutral-600",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-tertiary": "color(srgb 0.466667 0.490196 0.537255 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-tertiary",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.600}",
      "sourcePath": "semantic.light.color.foreground-tertiary",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.466667,
          0.490196,
          0.537255
        ],
        "alpha": 1
      }
    },
    "color-foreground-upgrade": {
      "aliasTarget": {
        "id": "color-neutral-50",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-upgrade": "color(srgb 0.972549 0.972549 0.976471 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-upgrade",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.50}",
      "sourcePath": "semantic.light.color.foreground-upgrade",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.972549,
          0.972549,
          0.976471
        ],
        "alpha": 1
      }
    },
    "color-foreground-upgrade-current": {
      "aliasTarget": {
        "id": "color-neutral-1000",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-upgrade-current": "color(srgb 0 0 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-upgrade-current",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.1000}",
      "sourcePath": "semantic.light.color.foreground-upgrade-current",
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
    "color-foreground-upgrade-hover": {
      "aliasTarget": {
        "id": "color-neutral-50",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-upgrade-hover": "color(srgb 0.972549 0.972549 0.976471 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-upgrade-hover",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.50}",
      "sourcePath": "semantic.light.color.foreground-upgrade-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.972549,
          0.972549,
          0.976471
        ],
        "alpha": 1
      }
    },
    "color-foreground-warning": {
      "aliasTarget": {
        "id": "color-amber-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-warning": "color(srgb 0.360784 0.239216 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-warning",
      "mode": "light",
      "rawValue": "{primitive.color.amber.900}",
      "sourcePath": "semantic.light.color.foreground-warning",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.360784,
          0.239216,
          0
        ],
        "alpha": 1
      }
    },
    "color-media-control-foreground": {
      "aliasTarget": {
        "id": "color-paper-alpha-88",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-media-control-foreground": "color(srgb 0.980392 0.980392 0.980392 / 0.88)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-control-foreground",
      "mode": "light",
      "rawValue": "{primitive.color.paper-alpha.88}",
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
        "id": "color-paper-alpha-14",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-media-control-hover": "color(srgb 0.980392 0.980392 0.980392 / 0.14)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-control-hover",
      "mode": "light",
      "rawValue": "{primitive.color.paper-alpha.14}",
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
        "alpha": 0.14
      }
    },
    "color-media-control-surface": {
      "aliasTarget": {
        "id": "color-black-alpha-28",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-media-control-surface": "color(srgb 0 0 0 / 0.28)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-control-surface",
      "mode": "light",
      "rawValue": "{primitive.color.black-alpha.28}",
      "sourcePath": "semantic.light.color.media-control-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 0.28
      }
    },
    "color-media-foreground-bright": {
      "aliasTarget": {
        "id": "color-neutral-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-media-foreground-bright": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-foreground-bright",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.900}",
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
        "id": "color-neutral-0",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-media-foreground-dark": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-foreground-dark",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.0}",
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
        "id": "color-neutral-0",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-media-indicator-active": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-indicator-active",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.0}",
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
        "id": "color-paper-alpha-45",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-media-indicator-rest": "color(srgb 0.980392 0.980392 0.980392 / 0.45)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-indicator-rest",
      "mode": "light",
      "rawValue": "{primitive.color.paper-alpha.45}",
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
        "alpha": 0.45
      }
    },
    "color-media-scrim-bright": {
      "aliasTarget": {
        "id": "color-neutral-0",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-media-scrim-bright": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-scrim-bright",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.0}",
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
        "id": "color-neutral-1000",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-media-scrim-dark": "color(srgb 0 0 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-scrim-dark",
      "mode": "light",
      "rawValue": "{primitive.color.neutral.1000}",
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
        "--kds-color-node-audio-accent": "color(srgb 1 0.301961 0.533333 / 1)"
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
        "--kds-color-node-audio-icon": "color(srgb 1 0.301961 0.533333 / 1)"
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
        "--kds-color-node-audio-surface": "color(srgb 1 0.756863 0.839216 / 1)"
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
    "color-node-edit-accent": {
      "aliasTarget": {
        "id": "color-violet-500",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-node-edit-accent": "color(srgb 0.376471 0.333333 1 / 1)"
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
        "--kds-color-node-edit-icon": "color(srgb 0.376471 0.333333 1 / 1)"
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
        "--kds-color-node-edit-surface": "color(srgb 0.788235 0.760784 1 / 1)"
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
    "color-node-image-accent": {
      "aliasTarget": {
        "id": "color-mint-500",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-node-image-accent": "color(srgb 0 0.776471 0.556863 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-image-accent",
      "mode": "light",
      "rawValue": "{primitive.color.mint.500}",
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
        "id": "color-mint-500",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-node-image-icon": "color(srgb 0 0.776471 0.556863 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-image-icon",
      "mode": "light",
      "rawValue": "{primitive.color.mint.500}",
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
        "id": "color-mint-200",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-node-image-surface": "color(srgb 0.721569 0.972549 0.898039 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-image-surface",
      "mode": "light",
      "rawValue": "{primitive.color.mint.200}",
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
        "--kds-color-node-instagram-accent": "color(srgb 1 0.294118 0.34902 / 1)"
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
        "--kds-color-node-instagram-icon": "color(srgb 1 0.294118 0.34902 / 1)"
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
        "--kds-color-node-instagram-surface": "color(srgb 1 0.768627 0.792157 / 1)"
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
        "--kds-color-node-text-accent": "color(srgb 1 0.698039 0 / 1)"
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
        "--kds-color-node-text-icon": "color(srgb 1 0.698039 0 / 1)"
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
        "--kds-color-node-text-surface": "color(srgb 1 0.909804 0.639216 / 1)"
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
        "--kds-color-node-video-accent": "color(srgb 0 0.533333 1 / 1)"
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
        "--kds-color-node-youtube-accent": "color(srgb 1 0.294118 0.34902 / 1)"
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
        "--kds-color-node-youtube-icon": "color(srgb 1 0.294118 0.34902 / 1)"
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
        "--kds-color-node-youtube-surface": "color(srgb 1 0.768627 0.792157 / 1)"
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
        "--kds-color-progress-fill": "color(srgb 0 0.533333 1 / 1)"
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
        "id": "color-mint-500",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-progress-ring-fill": "color(srgb 0 0.776471 0.556863 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-progress-ring-fill",
      "mode": "light",
      "rawValue": "{primitive.color.mint.500}",
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
        "id": "color-ink-alpha-20",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-progress-ring-track": "color(srgb 0.090196 0.105882 0.133333 / 0.2)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-progress-ring-track",
      "mode": "light",
      "rawValue": "{primitive.color.ink-alpha.20}",
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
        "id": "color-ink-alpha-10",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-progress-track": "color(srgb 0.090196 0.105882 0.133333 / 0.1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-progress-track",
      "mode": "light",
      "rawValue": "{primitive.color.ink-alpha.10}",
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
        "alpha": 0.1
      }
    },
    "color-scrim-modal": {
      "aliasTarget": {
        "id": "color-black-alpha-56",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-scrim-modal": "color(srgb 0 0 0 / 0.56)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-scrim-modal",
      "mode": "light",
      "rawValue": "{primitive.color.black-alpha.56}",
      "sourcePath": "semantic.light.color.scrim-modal",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 0.56
      }
    },
    "elevation-menu": {
      "aliasTarget": {
        "id": "shadow-menu-light",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-elevation-menu": "0px 8px 15px 0px color(srgb 0 0 0 / 0.04), 0px 0px 0px 0.5px color(srgb 0.835294 0.843137 0.866667 / 1)"
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
            "alpha": 0.04
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
            "value": 15,
            "unit": "px"
          },
          "spread": {
            "value": 0,
            "unit": "px"
          },
          "inset": false
        },
        {
          "color": {
            "colorSpace": "srgb",
            "components": [
              0.835294,
              0.843137,
              0.866667
            ],
            "alpha": 1
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
            "value": 0.5,
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
        "--kds-elevation-tooltip": "0px 12px 24px 0px color(srgb 0.466667 0.490196 0.537255 / 0.12)"
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
        "--kds-elevation-upgrade": "inset 0px 0px 0px 1px color(srgb 0.980392 0.980392 0.980392 / 0.08), 0px 1px 2px 0px color(srgb 0 0 0 / 0.06)"
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
            "alpha": 0.06
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
    "color-action-danger": {
      "aliasTarget": {
        "id": "color-red-500",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-action-danger": "color(srgb 1 0.294118 0.34902 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-action-danger",
      "mode": "dark",
      "rawValue": "{primitive.color.red.500}",
      "sourcePath": "semantic.dark.color.action-danger",
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
    "color-action-ghost-hover": {
      "aliasTarget": {
        "id": "color-paper-alpha-10",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-action-ghost-hover": "color(srgb 0.980392 0.980392 0.980392 / 0.1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-action-ghost-hover",
      "mode": "dark",
      "rawValue": "{primitive.color.paper-alpha.10}",
      "sourcePath": "semantic.dark.color.action-ghost-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.1
      }
    },
    "color-action-menu-danger-hover": {
      "aliasTarget": {
        "id": "color-red-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-action-menu-danger-hover": "color(srgb 1 0.294118 0.34902 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-action-menu-danger-hover",
      "mode": "dark",
      "rawValue": "{primitive.color.red-alpha.12}",
      "sourcePath": "semantic.dark.color.action-menu-danger-hover",
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
    "color-action-menu-item-hover": {
      "aliasTarget": {
        "id": "color-paper-alpha-10",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-action-menu-item-hover": "color(srgb 0.980392 0.980392 0.980392 / 0.1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-action-menu-item-hover",
      "mode": "dark",
      "rawValue": "{primitive.color.paper-alpha.10}",
      "sourcePath": "semantic.dark.color.action-menu-item-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.1
      }
    },
    "color-action-primary": {
      "aliasTarget": {
        "id": "color-blue-500",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-action-primary": "color(srgb 0 0.533333 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-action-primary",
      "mode": "dark",
      "rawValue": "{primitive.color.blue.500}",
      "sourcePath": "semantic.dark.color.action-primary",
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
    "color-action-primary-active": {
      "aliasTarget": {
        "id": "color-blue-600",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-action-primary-active": "color(srgb 0 0.458824 0.858824 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-action-primary-active",
      "mode": "dark",
      "rawValue": "{primitive.color.blue.600}",
      "sourcePath": "semantic.dark.color.action-primary-active",
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
    "color-action-primary-hover": {
      "aliasTarget": {
        "id": "color-blue-400",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-action-primary-hover": "color(srgb 0.219608 0.643137 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-action-primary-hover",
      "mode": "dark",
      "rawValue": "{primitive.color.blue.400}",
      "sourcePath": "semantic.dark.color.action-primary-hover",
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
    "color-action-secondary-foreground": {
      "aliasTarget": {
        "id": "color-neutral-400",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-action-secondary-foreground": "color(srgb 0.737255 0.752941 0.788235 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-action-secondary-foreground",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.400}",
      "sourcePath": "semantic.dark.color.action-secondary-foreground",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.737255,
          0.752941,
          0.788235
        ],
        "alpha": 1
      }
    },
    "color-action-secondary-hover": {
      "aliasTarget": {
        "id": "color-paper-alpha-8",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-action-secondary-hover": "color(srgb 0.980392 0.980392 0.980392 / 0.08)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-action-secondary-hover",
      "mode": "dark",
      "rawValue": "{primitive.color.paper-alpha.8}",
      "sourcePath": "semantic.dark.color.action-secondary-hover",
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
    "color-background-canvas": {
      "aliasTarget": {
        "id": "color-neutral-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-canvas": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-canvas",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.900}",
      "sourcePath": "semantic.dark.color.background-canvas",
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
    "color-background-danger": {
      "aliasTarget": {
        "id": "color-red-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-danger": "color(srgb 0.329412 0.066667 0.098039 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-danger",
      "mode": "dark",
      "rawValue": "{primitive.color.red.900}",
      "sourcePath": "semantic.dark.color.background-danger",
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
    "color-background-info": {
      "aliasTarget": {
        "id": "color-blue-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-info": "color(srgb 0 0.203922 0.380392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-info",
      "mode": "dark",
      "rawValue": "{primitive.color.blue.900}",
      "sourcePath": "semantic.dark.color.background-info",
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
    "color-background-inset": {
      "aliasTarget": {
        "id": "color-neutral-800",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-inset": "color(srgb 0.192157 0.211765 0.25098 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-inset",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.800}",
      "sourcePath": "semantic.dark.color.background-inset",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.192157,
          0.211765,
          0.25098
        ],
        "alpha": 1
      }
    },
    "color-background-inverse": {
      "aliasTarget": {
        "id": "color-neutral-200",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-inverse": "color(srgb 0.890196 0.894118 0.909804 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-inverse",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.200}",
      "sourcePath": "semantic.dark.color.background-inverse",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.890196,
          0.894118,
          0.909804
        ],
        "alpha": 1
      }
    },
    "color-background-inverse-translucent": {
      "aliasTarget": {
        "id": "color-inverse-alpha-light-70",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-inverse-translucent": "color(srgb 0.890196 0.894118 0.909804 / 0.7)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-inverse-translucent",
      "mode": "dark",
      "rawValue": "{primitive.color.inverse-alpha.light-70}",
      "sourcePath": "semantic.dark.color.background-inverse-translucent",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.890196,
          0.894118,
          0.909804
        ],
        "alpha": 0.7
      }
    },
    "color-background-menu": {
      "aliasTarget": {
        "id": "color-neutral-800",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-menu": "color(srgb 0.192157 0.211765 0.25098 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-menu",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.800}",
      "sourcePath": "semantic.dark.color.background-menu",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.192157,
          0.211765,
          0.25098
        ],
        "alpha": 1
      }
    },
    "color-background-overlay": {
      "aliasTarget": {
        "id": "color-neutral-800",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-overlay": "color(srgb 0.192157 0.211765 0.25098 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-overlay",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.800}",
      "sourcePath": "semantic.dark.color.background-overlay",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.192157,
          0.211765,
          0.25098
        ],
        "alpha": 1
      }
    },
    "color-background-raised": {
      "aliasTarget": {
        "id": "color-neutral-700",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-raised": "color(srgb 0.341176 0.364706 0.407843 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-raised",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.700}",
      "sourcePath": "semantic.dark.color.background-raised",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.341176,
          0.364706,
          0.407843
        ],
        "alpha": 1
      }
    },
    "color-background-success": {
      "aliasTarget": {
        "id": "color-green-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-success": "color(srgb 0.043137 0.239216 0.094118 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-success",
      "mode": "dark",
      "rawValue": "{primitive.color.green.900}",
      "sourcePath": "semantic.dark.color.background-success",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.043137,
          0.239216,
          0.094118
        ],
        "alpha": 1
      }
    },
    "color-background-surface": {
      "aliasTarget": {
        "id": "color-neutral-800",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-surface": "color(srgb 0.192157 0.211765 0.25098 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-surface",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.800}",
      "sourcePath": "semantic.dark.color.background-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.192157,
          0.211765,
          0.25098
        ],
        "alpha": 1
      }
    },
    "color-background-upgrade": {
      "aliasTarget": {
        "id": "color-neutral-100",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-upgrade": "color(srgb 0.945098 0.945098 0.952941 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-upgrade",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.100}",
      "sourcePath": "semantic.dark.color.background-upgrade",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.945098,
          0.945098,
          0.952941
        ],
        "alpha": 1
      }
    },
    "color-background-upgrade-current": {
      "aliasTarget": {
        "id": "color-neutral-800",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-upgrade-current": "color(srgb 0.192157 0.211765 0.25098 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-upgrade-current",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.800}",
      "sourcePath": "semantic.dark.color.background-upgrade-current",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.192157,
          0.211765,
          0.25098
        ],
        "alpha": 1
      }
    },
    "color-background-upgrade-hover": {
      "aliasTarget": {
        "id": "color-neutral-200",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-upgrade-hover": "color(srgb 0.890196 0.894118 0.909804 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-upgrade-hover",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.200}",
      "sourcePath": "semantic.dark.color.background-upgrade-hover",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.890196,
          0.894118,
          0.909804
        ],
        "alpha": 1
      }
    },
    "color-background-warning": {
      "aliasTarget": {
        "id": "color-amber-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-background-warning": "color(srgb 0.360784 0.239216 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-background-warning",
      "mode": "dark",
      "rawValue": "{primitive.color.amber.900}",
      "sourcePath": "semantic.dark.color.background-warning",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.360784,
          0.239216,
          0
        ],
        "alpha": 1
      }
    },
    "color-border-control": {
      "aliasTarget": {
        "id": "color-paper-alpha-16",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-border-control": "color(srgb 0.980392 0.980392 0.980392 / 0.16)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-border-control",
      "mode": "dark",
      "rawValue": "{primitive.color.paper-alpha.16}",
      "sourcePath": "semantic.dark.color.border-control",
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
    "color-border-danger": {
      "aliasTarget": {
        "id": "color-red-500",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-border-danger": "color(srgb 1 0.294118 0.34902 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-border-danger",
      "mode": "dark",
      "rawValue": "{primitive.color.red.500}",
      "sourcePath": "semantic.dark.color.border-danger",
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
    "color-border-default": {
      "aliasTarget": {
        "id": "color-neutral-600",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-border-default": "color(srgb 0.466667 0.490196 0.537255 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-border-default",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.600}",
      "sourcePath": "semantic.dark.color.border-default",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.466667,
          0.490196,
          0.537255
        ],
        "alpha": 1
      }
    },
    "color-border-focus": {
      "aliasTarget": {
        "id": "color-blue-400",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-border-focus": "color(srgb 0.219608 0.643137 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-border-focus",
      "mode": "dark",
      "rawValue": "{primitive.color.blue.400}",
      "sourcePath": "semantic.dark.color.border-focus",
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
    "color-border-strong": {
      "aliasTarget": {
        "id": "color-neutral-500",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-border-strong": "color(srgb 0.603922 0.627451 0.670588 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-border-strong",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.500}",
      "sourcePath": "semantic.dark.color.border-strong",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.603922,
          0.627451,
          0.670588
        ],
        "alpha": 1
      }
    },
    "color-border-subtle": {
      "aliasTarget": {
        "id": "color-neutral-700",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-border-subtle": "color(srgb 0.341176 0.364706 0.407843 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-border-subtle",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.700}",
      "sourcePath": "semantic.dark.color.border-subtle",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.341176,
          0.364706,
          0.407843
        ],
        "alpha": 1
      }
    },
    "color-border-tooltip": {
      "aliasTarget": {
        "id": "color-ink-alpha-12",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-border-tooltip": "color(srgb 0.090196 0.105882 0.133333 / 0.12)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-border-tooltip",
      "mode": "dark",
      "rawValue": "{primitive.color.ink-alpha.12}",
      "sourcePath": "semantic.dark.color.border-tooltip",
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
    "color-foreground-danger": {
      "aliasTarget": {
        "id": "color-red-100",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-danger": "color(srgb 1 0.898039 0.909804 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-danger",
      "mode": "dark",
      "rawValue": "{primitive.color.red.100}",
      "sourcePath": "semantic.dark.color.foreground-danger",
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
    "color-foreground-danger-on-surface": {
      "aliasTarget": {
        "id": "color-red-400",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-danger-on-surface": "color(srgb 1 0.435294 0.486275 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-danger-on-surface",
      "mode": "dark",
      "rawValue": "{primitive.color.red.400}",
      "sourcePath": "semantic.dark.color.foreground-danger-on-surface",
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
    "color-foreground-disabled": {
      "aliasTarget": {
        "id": "color-neutral-600",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-disabled": "color(srgb 0.466667 0.490196 0.537255 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-disabled",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.600}",
      "sourcePath": "semantic.dark.color.foreground-disabled",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.466667,
          0.490196,
          0.537255
        ],
        "alpha": 1
      }
    },
    "color-foreground-info": {
      "aliasTarget": {
        "id": "color-blue-50",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-info": "color(srgb 0.941176 0.968627 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-info",
      "mode": "dark",
      "rawValue": "{primitive.color.blue.50}",
      "sourcePath": "semantic.dark.color.foreground-info",
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
    "color-foreground-inverse": {
      "aliasTarget": {
        "id": "color-neutral-0",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-inverse": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-inverse",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.0}",
      "sourcePath": "semantic.dark.color.foreground-inverse",
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
    "color-foreground-menu-item": {
      "aliasTarget": {
        "id": "color-paper-alpha-86",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-menu-item": "color(srgb 0.980392 0.980392 0.980392 / 0.86)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-menu-item",
      "mode": "dark",
      "rawValue": "{primitive.color.paper-alpha.86}",
      "sourcePath": "semantic.dark.color.foreground-menu-item",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.980392,
          0.980392,
          0.980392
        ],
        "alpha": 0.86
      }
    },
    "color-foreground-on-danger": {
      "aliasTarget": {
        "id": "color-neutral-0",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-on-danger": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-on-danger",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.0}",
      "sourcePath": "semantic.dark.color.foreground-on-danger",
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
    "color-foreground-on-inverse": {
      "aliasTarget": {
        "id": "color-neutral-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-on-inverse": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-on-inverse",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.900}",
      "sourcePath": "semantic.dark.color.foreground-on-inverse",
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
    "color-foreground-primary": {
      "aliasTarget": {
        "id": "color-neutral-0",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-primary": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-primary",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.0}",
      "sourcePath": "semantic.dark.color.foreground-primary",
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
    "color-foreground-secondary": {
      "aliasTarget": {
        "id": "color-neutral-300",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-secondary": "color(srgb 0.835294 0.843137 0.866667 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-secondary",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.300}",
      "sourcePath": "semantic.dark.color.foreground-secondary",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.835294,
          0.843137,
          0.866667
        ],
        "alpha": 1
      }
    },
    "color-foreground-success": {
      "aliasTarget": {
        "id": "color-green-100",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-success": "color(srgb 0.894118 0.972549 0.917647 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-success",
      "mode": "dark",
      "rawValue": "{primitive.color.green.100}",
      "sourcePath": "semantic.dark.color.foreground-success",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.894118,
          0.972549,
          0.917647
        ],
        "alpha": 1
      }
    },
    "color-foreground-tertiary": {
      "aliasTarget": {
        "id": "color-neutral-400",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-tertiary": "color(srgb 0.737255 0.752941 0.788235 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-tertiary",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.400}",
      "sourcePath": "semantic.dark.color.foreground-tertiary",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0.737255,
          0.752941,
          0.788235
        ],
        "alpha": 1
      }
    },
    "color-foreground-upgrade": {
      "aliasTarget": {
        "id": "color-neutral-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-upgrade": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-upgrade",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.900}",
      "sourcePath": "semantic.dark.color.foreground-upgrade",
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
    "color-foreground-upgrade-current": {
      "aliasTarget": {
        "id": "color-neutral-0",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-upgrade-current": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-upgrade-current",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.0}",
      "sourcePath": "semantic.dark.color.foreground-upgrade-current",
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
    "color-foreground-upgrade-hover": {
      "aliasTarget": {
        "id": "color-neutral-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-upgrade-hover": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-upgrade-hover",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.900}",
      "sourcePath": "semantic.dark.color.foreground-upgrade-hover",
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
    "color-foreground-warning": {
      "aliasTarget": {
        "id": "color-amber-100",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-foreground-warning": "color(srgb 1 0.960784 0.839216 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-foreground-warning",
      "mode": "dark",
      "rawValue": "{primitive.color.amber.100}",
      "sourcePath": "semantic.dark.color.foreground-warning",
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
    "color-media-control-foreground": {
      "aliasTarget": {
        "id": "color-paper-alpha-88",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-media-control-foreground": "color(srgb 0.980392 0.980392 0.980392 / 0.88)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-control-foreground",
      "mode": "dark",
      "rawValue": "{primitive.color.paper-alpha.88}",
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
        "id": "color-paper-alpha-14",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-media-control-hover": "color(srgb 0.980392 0.980392 0.980392 / 0.14)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-control-hover",
      "mode": "dark",
      "rawValue": "{primitive.color.paper-alpha.14}",
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
        "alpha": 0.14
      }
    },
    "color-media-control-surface": {
      "aliasTarget": {
        "id": "color-black-alpha-28",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-media-control-surface": "color(srgb 0 0 0 / 0.28)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-control-surface",
      "mode": "dark",
      "rawValue": "{primitive.color.black-alpha.28}",
      "sourcePath": "semantic.dark.color.media-control-surface",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 0.28
      }
    },
    "color-media-foreground-bright": {
      "aliasTarget": {
        "id": "color-neutral-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-media-foreground-bright": "color(srgb 0.090196 0.105882 0.133333 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-foreground-bright",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.900}",
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
        "id": "color-neutral-0",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-media-foreground-dark": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-foreground-dark",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.0}",
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
        "id": "color-neutral-0",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-media-indicator-active": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-indicator-active",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.0}",
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
        "id": "color-paper-alpha-45",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-media-indicator-rest": "color(srgb 0.980392 0.980392 0.980392 / 0.45)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-indicator-rest",
      "mode": "dark",
      "rawValue": "{primitive.color.paper-alpha.45}",
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
        "alpha": 0.45
      }
    },
    "color-media-scrim-bright": {
      "aliasTarget": {
        "id": "color-neutral-0",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-media-scrim-bright": "color(srgb 0.980392 0.980392 0.980392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-scrim-bright",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.0}",
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
        "id": "color-neutral-1000",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-media-scrim-dark": "color(srgb 0 0 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-media-scrim-dark",
      "mode": "dark",
      "rawValue": "{primitive.color.neutral.1000}",
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
        "--kds-color-node-audio-accent": "color(srgb 1 0.301961 0.533333 / 1)"
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
        "--kds-color-node-audio-icon": "color(srgb 1 0.301961 0.533333 / 1)"
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
        "--kds-color-node-audio-surface": "color(srgb 0.517647 0.101961 0.247059 / 1)"
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
    "color-node-edit-accent": {
      "aliasTarget": {
        "id": "color-violet-500",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-node-edit-accent": "color(srgb 0.376471 0.333333 1 / 1)"
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
        "--kds-color-node-edit-icon": "color(srgb 0.376471 0.333333 1 / 1)"
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
        "--kds-color-node-edit-surface": "color(srgb 0.133333 0.101961 0.501961 / 1)"
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
    "color-node-image-accent": {
      "aliasTarget": {
        "id": "color-mint-500",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-node-image-accent": "color(srgb 0 0.776471 0.556863 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-image-accent",
      "mode": "dark",
      "rawValue": "{primitive.color.mint.500}",
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
        "id": "color-mint-500",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-node-image-icon": "color(srgb 0 0.776471 0.556863 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-image-icon",
      "mode": "dark",
      "rawValue": "{primitive.color.mint.500}",
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
        "id": "color-mint-800",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-node-image-surface": "color(srgb 0 0.431373 0.317647 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-node-image-surface",
      "mode": "dark",
      "rawValue": "{primitive.color.mint.800}",
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
        "--kds-color-node-instagram-accent": "color(srgb 1 0.294118 0.34902 / 1)"
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
        "--kds-color-node-instagram-icon": "color(srgb 1 0.294118 0.34902 / 1)"
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
        "--kds-color-node-instagram-surface": "color(srgb 0.517647 0.101961 0.141176 / 1)"
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
        "--kds-color-node-text-accent": "color(srgb 1 0.698039 0 / 1)"
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
        "--kds-color-node-text-icon": "color(srgb 1 0.698039 0 / 1)"
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
        "--kds-color-node-text-surface": "color(srgb 0.478431 0.321569 0 / 1)"
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
        "--kds-color-node-video-accent": "color(srgb 0 0.533333 1 / 1)"
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
        "--kds-color-node-youtube-accent": "color(srgb 1 0.294118 0.34902 / 1)"
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
        "--kds-color-node-youtube-icon": "color(srgb 1 0.294118 0.34902 / 1)"
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
        "--kds-color-node-youtube-surface": "color(srgb 0.517647 0.101961 0.141176 / 1)"
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
        "--kds-color-progress-fill": "color(srgb 0 0.533333 1 / 1)"
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
        "id": "color-mint-500",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-progress-ring-fill": "color(srgb 0 0.776471 0.556863 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-progress-ring-fill",
      "mode": "dark",
      "rawValue": "{primitive.color.mint.500}",
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
        "id": "color-paper-alpha-20",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-progress-ring-track": "color(srgb 0.980392 0.980392 0.980392 / 0.2)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-progress-ring-track",
      "mode": "dark",
      "rawValue": "{primitive.color.paper-alpha.20}",
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
        "id": "color-paper-alpha-10",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-progress-track": "color(srgb 0.980392 0.980392 0.980392 / 0.1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-progress-track",
      "mode": "dark",
      "rawValue": "{primitive.color.paper-alpha.10}",
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
        "alpha": 0.1
      }
    },
    "color-scrim-modal": {
      "aliasTarget": {
        "id": "color-black-alpha-72",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-scrim-modal": "color(srgb 0 0 0 / 0.72)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-scrim-modal",
      "mode": "dark",
      "rawValue": "{primitive.color.black-alpha.72}",
      "sourcePath": "semantic.dark.color.scrim-modal",
      "tier": "semantic",
      "type": "color",
      "value": {
        "colorSpace": "srgb",
        "components": [
          0,
          0,
          0
        ],
        "alpha": 0.72
      }
    },
    "elevation-menu": {
      "aliasTarget": {
        "id": "shadow-menu-dark",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-elevation-menu": "0px 8px 15px 0px color(srgb 0 0 0 / 0.04), 0px 0px 0px 0.5px color(srgb 0.341176 0.364706 0.407843 / 1)"
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
            "alpha": 0.04
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
            "value": 15,
            "unit": "px"
          },
          "spread": {
            "value": 0,
            "unit": "px"
          },
          "inset": false
        },
        {
          "color": {
            "colorSpace": "srgb",
            "components": [
              0.341176,
              0.364706,
              0.407843
            ],
            "alpha": 1
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
            "value": 0.5,
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
        "--kds-elevation-tooltip": "0px 12px 24px 0px color(srgb 0.090196 0.105882 0.133333 / 0.12)"
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
        "--kds-elevation-upgrade": "inset 0px 0px 0px 1px color(srgb 0 0 0 / 0.08), 0px 1px 2px 0px color(srgb 0 0 0 / 0.12)"
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
