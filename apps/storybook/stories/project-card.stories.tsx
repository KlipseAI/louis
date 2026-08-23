import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ProjectCard,
  ProjectCardMedia,
  ProjectCardThumbnail,
  ProjectCardOverlay,
  ProjectCardTitle,
  ProjectCardMeta,
  ProjectCardAction,
  ProjectCardMore,
} from "@klipse-design/react";

const meta: Meta<typeof ProjectCard> = {
  title: "Components/ProjectCard",
  component: ProjectCard,
};
export default meta;

export const Default: StoryObj<typeof ProjectCard> = {
  render: () => (
    <div style={{ width: 360 }}>
      <ProjectCard>
        <ProjectCardMedia>
          <ProjectCardThumbnail>
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80"
              alt="AI Generated Artwork"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </ProjectCardThumbnail>
        </ProjectCardMedia>
        <ProjectCardAction href="#">
          <span className="sr-only">프로젝트 열기</span>
        </ProjectCardAction>
        <ProjectCardOverlay>
          <ProjectCardTitle>시네마틱 트레일러 프로젝트</ProjectCardTitle>
          <ProjectCardMeta>2026. 8. 23. 수정됨 · 4K 60fps</ProjectCardMeta>
        </ProjectCardOverlay>
        <ProjectCardMore label="더보기 작업" />
      </ProjectCard>
    </div>
  ),
};
