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
      "foreground": "color-status-danger-foreground",
      "background": "color-status-danger-background",
      "minimum": 4.5
    },
    {
      "foreground": "color-status-success-foreground",
      "background": "color-status-success-background",
      "minimum": 4.5
    },
    {
      "foreground": "color-status-warning-foreground",
      "background": "color-status-warning-background",
      "minimum": 4.5
    },
    {
      "foreground": "color-status-info-foreground",
      "background": "color-status-info-background",
      "minimum": 4.5
    },
    {
      "background": "color-action-primary-hover",
      "foreground": "color-foreground-inverse",
      "minimum": 2.5,
      "note": "hover 면(blue.400)은 대비가 2.54로 기본 면보다 더 낮다. 제품이 hover에서 밝아지기 때문이며(filter: brightness(1.06)), 그 방향을 따랐다. 기본 면이 이미 AA 미달이므로 hover만 따로 지킬 수 없다. 이 쌍을 게이트에 올려 두는 이유는 통과시키려는 것이 아니라 수치를 드러내 두기 위해서다."
    },
    {
      "background": "color-action-primary-pressed",
      "foreground": "color-foreground-inverse",
      "minimum": 4,
      "note": "pressed 면(blue.600)은 대비 4.41로 AA에 근소하게 미달한다. hover가 밝아지므로 pressed는 어두워져 두 상태를 구분한다. 기본 면과 같은 사유로 미달을 수용한다."
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
        "transform"
      ]
    },
    {
      "motion": "motion-overlay-exit",
      "properties": [
        "opacity",
        "transform"
      ]
    },
    {
      "motion": "motion-modal-enter",
      "properties": [
        "opacity",
        "transform"
      ]
    },
    {
      "motion": "motion-modal-exit",
      "properties": [
        "opacity",
        "transform"
      ]
    },
    {
      "motion": "motion-reduced",
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
      }
    }
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
      }
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
      }
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
      }
    }
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
        }
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
        }
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
        }
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
        }
      }
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
    "layout-app-shell-sidebar-minimum": {
      "aliasTarget": {
        "id": "space-120",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-layout-app-shell-sidebar-minimum": "120px"
      },
      "deprecated": null,
      "description": null,
      "id": "layout-app-shell-sidebar-minimum",
      "mode": "global",
      "rawValue": "{primitive.spacing.120}",
      "sourcePath": "semantic.global.layout.app-shell-sidebar-minimum",
      "tier": "semantic",
      "type": "dimension",
      "value": {
        "value": 120,
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
    "radius-card": {
      "aliasTarget": {
        "id": "radius-20",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-radius-card": "20px"
      },
      "deprecated": null,
      "description": null,
      "id": "radius-card",
      "mode": "global",
      "rawValue": "{primitive.radius.20}",
      "sourcePath": "semantic.global.radius.card",
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
    "color-action-primary-pressed": {
      "aliasTarget": {
        "id": "color-blue-600",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-action-primary-pressed": "color(srgb 0 0.458824 0.858824 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-action-primary-pressed",
      "mode": "light",
      "rawValue": "{primitive.color.blue.600}",
      "sourcePath": "semantic.light.color.action-primary-pressed",
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
    "color-status-danger-background": {
      "aliasTarget": {
        "id": "color-red-100",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-status-danger-background": "color(srgb 1 0.898039 0.909804 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-status-danger-background",
      "mode": "light",
      "rawValue": "{primitive.color.red.100}",
      "sourcePath": "semantic.light.color.status-danger-background",
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
    "color-status-danger-foreground": {
      "aliasTarget": {
        "id": "color-red-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-status-danger-foreground": "color(srgb 0.329412 0.066667 0.098039 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-status-danger-foreground",
      "mode": "light",
      "rawValue": "{primitive.color.red.900}",
      "sourcePath": "semantic.light.color.status-danger-foreground",
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
    "color-status-info-background": {
      "aliasTarget": {
        "id": "color-blue-50",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-status-info-background": "color(srgb 0.941176 0.968627 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-status-info-background",
      "mode": "light",
      "rawValue": "{primitive.color.blue.50}",
      "sourcePath": "semantic.light.color.status-info-background",
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
    "color-status-info-foreground": {
      "aliasTarget": {
        "id": "color-blue-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-status-info-foreground": "color(srgb 0 0.203922 0.380392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-status-info-foreground",
      "mode": "light",
      "rawValue": "{primitive.color.blue.900}",
      "sourcePath": "semantic.light.color.status-info-foreground",
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
    "color-status-success-background": {
      "aliasTarget": {
        "id": "color-green-100",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-status-success-background": "color(srgb 0.894118 0.972549 0.917647 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-status-success-background",
      "mode": "light",
      "rawValue": "{primitive.color.green.100}",
      "sourcePath": "semantic.light.color.status-success-background",
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
    "color-status-success-foreground": {
      "aliasTarget": {
        "id": "color-green-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-status-success-foreground": "color(srgb 0.043137 0.239216 0.094118 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-status-success-foreground",
      "mode": "light",
      "rawValue": "{primitive.color.green.900}",
      "sourcePath": "semantic.light.color.status-success-foreground",
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
    "color-status-warning-background": {
      "aliasTarget": {
        "id": "color-amber-100",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-status-warning-background": "color(srgb 1 0.960784 0.839216 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-status-warning-background",
      "mode": "light",
      "rawValue": "{primitive.color.amber.100}",
      "sourcePath": "semantic.light.color.status-warning-background",
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
    "color-status-warning-foreground": {
      "aliasTarget": {
        "id": "color-amber-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-status-warning-foreground": "color(srgb 0.360784 0.239216 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-status-warning-foreground",
      "mode": "light",
      "rawValue": "{primitive.color.amber.900}",
      "sourcePath": "semantic.light.color.status-warning-foreground",
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
    }
  },
  "dark": {
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
    "color-action-primary-pressed": {
      "aliasTarget": {
        "id": "color-blue-600",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-action-primary-pressed": "color(srgb 0 0.458824 0.858824 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-action-primary-pressed",
      "mode": "dark",
      "rawValue": "{primitive.color.blue.600}",
      "sourcePath": "semantic.dark.color.action-primary-pressed",
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
    "color-status-danger-background": {
      "aliasTarget": {
        "id": "color-red-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-status-danger-background": "color(srgb 0.329412 0.066667 0.098039 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-status-danger-background",
      "mode": "dark",
      "rawValue": "{primitive.color.red.900}",
      "sourcePath": "semantic.dark.color.status-danger-background",
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
    "color-status-danger-foreground": {
      "aliasTarget": {
        "id": "color-red-100",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-status-danger-foreground": "color(srgb 1 0.898039 0.909804 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-status-danger-foreground",
      "mode": "dark",
      "rawValue": "{primitive.color.red.100}",
      "sourcePath": "semantic.dark.color.status-danger-foreground",
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
    "color-status-info-background": {
      "aliasTarget": {
        "id": "color-blue-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-status-info-background": "color(srgb 0 0.203922 0.380392 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-status-info-background",
      "mode": "dark",
      "rawValue": "{primitive.color.blue.900}",
      "sourcePath": "semantic.dark.color.status-info-background",
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
    "color-status-info-foreground": {
      "aliasTarget": {
        "id": "color-blue-50",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-status-info-foreground": "color(srgb 0.941176 0.968627 1 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-status-info-foreground",
      "mode": "dark",
      "rawValue": "{primitive.color.blue.50}",
      "sourcePath": "semantic.dark.color.status-info-foreground",
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
    "color-status-success-background": {
      "aliasTarget": {
        "id": "color-green-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-status-success-background": "color(srgb 0.043137 0.239216 0.094118 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-status-success-background",
      "mode": "dark",
      "rawValue": "{primitive.color.green.900}",
      "sourcePath": "semantic.dark.color.status-success-background",
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
    "color-status-success-foreground": {
      "aliasTarget": {
        "id": "color-green-100",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-status-success-foreground": "color(srgb 0.894118 0.972549 0.917647 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-status-success-foreground",
      "mode": "dark",
      "rawValue": "{primitive.color.green.100}",
      "sourcePath": "semantic.dark.color.status-success-foreground",
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
    "color-status-warning-background": {
      "aliasTarget": {
        "id": "color-amber-900",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-status-warning-background": "color(srgb 0.360784 0.239216 0 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-status-warning-background",
      "mode": "dark",
      "rawValue": "{primitive.color.amber.900}",
      "sourcePath": "semantic.dark.color.status-warning-background",
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
    "color-status-warning-foreground": {
      "aliasTarget": {
        "id": "color-amber-100",
        "mode": "base"
      },
      "cssProperties": {
        "--kds-color-status-warning-foreground": "color(srgb 1 0.960784 0.839216 / 1)"
      },
      "deprecated": null,
      "description": null,
      "id": "color-status-warning-foreground",
      "mode": "dark",
      "rawValue": "{primitive.color.amber.100}",
      "sourcePath": "semantic.dark.color.status-warning-foreground",
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
    }
  }
};
