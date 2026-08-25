import type { Meta, StoryObj } from "@storybook/react-vite";
import type { IconComponent, IconSize } from "@klipse-design/react/icons";
import * as icons from "@klipse-design/react/icons";
import { Button } from "@klipse-design/react";

/**
 * 아이콘의 **실루엣 정확성은 게이트가 판정하지 못한다.** 정규화·해시·이름·고지는 기계가 잡지만
 * "이 그림이 의도한 글리프인가"는 사람의 시각 review이고, iconography.md가 그것을 Known
 * deviation으로 선언했다. 이 story가 그 공백을 메우는 자리다 — 26개를 한 화면에 세워 두께가
 * 튀는 글리프, 광학 크기가 어긋난 글리프, 엉뚱한 그림을 눈으로 찾는다.
 */
const glyphs = Object.entries(icons)
  .filter((entry): entry is [string, IconComponent] =>
    entry[0].startsWith("Icon") && typeof entry[1] === "function",
  )
  .sort(([a], [b]) => (a < b ? -1 : 1));

const meta: Meta = {
  title: "Foundations/Iconography",
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj;

const cell: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  padding: 12,
  borderRadius: "var(--kds-radius-control)",
};

const caption: React.CSSProperties = {
  font: "var(--kds-typography-caption-regular-font-weight) var(--kds-typography-caption-regular-font-size)/var(--kds-typography-caption-regular-line-height) var(--kds-typography-caption-regular-font-family)",
  color: "var(--kds-color-fg-tertiary)",
  textAlign: "center",
  wordBreak: "break-word",
};

/** 전체 글리프. 이름은 kebab-case 정본 이름이 아니라 방출된 심볼 이름을 보여 준다. */
export const Overview: Story = {
  render: () => (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))",
        gap: 4,
      }}
    >
      {glyphs.map(([name, Glyph]) => (
        <div key={name} style={cell}>
          <Glyph size="lg" />
          <span style={caption}>{name.replace(/^Icon/, "")}</span>
        </div>
      ))}
    </div>
  ),
};

/** 세 크기를 나란히 두면 광학 크기가 어긋난 글리프가 드러난다. */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {(["sm", "md", "lg"] as IconSize[]).map((size) => (
        <div key={size} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <code style={{ width: 32 }}>{size}</code>
          {glyphs.map(([name, Glyph]) => (
            <Glyph key={name} size={size} />
          ))}
        </div>
      ))}
    </div>
  ),
};

/**
 * 아이콘은 자기 색을 정하지 않는다. 부모의 `color`만 바꿔도 전부 따라와야 하며, 여기서
 * 따라오지 않는 글리프가 있으면 정본에 색이 하드코딩된 것이다.
 */
export const InheritsColor: Story = {
  render: () => (
    <div style={{ display: "grid", gap: 12 }}>
      {[
        ["foreground-primary", "var(--kds-color-fg-primary)"],
        ["foreground-tertiary", "var(--kds-color-fg-tertiary)"],
        ["action-primary", "var(--kds-color-accent-primary)"],
        ["status-danger-foreground", "var(--kds-color-status-danger-foreground)"],
      ].map(([label, value]) => (
        <div key={label} style={{ display: "flex", gap: 12, alignItems: "center", color: value }}>
          <code style={{ width: 200, color: "var(--kds-color-fg-secondary)" }}>
            {label}
          </code>
          {glyphs.slice(0, 12).map(([name, Glyph]) => (
            <Glyph key={name} size="lg" />
          ))}
        </div>
      ))}
    </div>
  ),
};

/**
 * 아이콘 전용 버튼의 이름은 **버튼이** 소유한다. 아이콘에 `label`을 주면 이름이 두 겹이 되므로
 * 주지 않는다 — addon-a11y가 이 story에서 그 계약을 검사한다.
 */
export const InButton: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button leftIcon={<icons.IconPlus />}>새 프로젝트</Button>
      <Button variant="secondary" rightIcon={<icons.IconArrowUp />}>
        업로드
      </Button>
      <Button variant="ghost" aria-label="검색" leftIcon={<icons.IconMagnifyingGlass />}>
        {null}
      </Button>
      <Button variant="danger" leftIcon={<icons.IconTrashSimple />}>
        삭제
      </Button>
    </div>
  ),
};
