# Changelog (Current)

> 최근 변경사항이 상단에 기록됩니다.
> 200줄 초과 시 자동으로 archive/로 이동됩니다.

---

### [2026-02-25 15:00] feat(office): add pixel art office view with animated agents
- **Changes:** New "Office" view featuring a pixel art virtual office where all 10 HIVE agents (ARIA, BOLT, SAGE, PIXEL, 4 reviewers, test-agent, commit-agent) sit at individual workstations. Includes CSS box-shadow-based pixel renderer, animated character sprites (idle/working/error states), per-agent desk designs, room decorations (window, clock, plant, bookshelf), click-to-inspect agent tooltip with status/task/token info, and responsive scaling via ResizeObserver. Added pixel animation keyframes (breathe, type, error-flash, monitor-glow, float). Extended AGENT_META with 6 new utility agent entries. Added "Office" nav item to sidebar.
- **Reason:** Provide a visual, engaging way to monitor agent activity in real-time, reinforcing the HIVE "team office" metaphor and making agent status immediately scannable at a glance.
- **Files:** apps/desktop/src/components/office/OfficeView.tsx, OfficeRoom.tsx, AgentWorkstation.tsx, PixelCharacter.tsx, PixelDesk.tsx, PixelRenderer.tsx, AgentTooltip.tsx, pixelData/types.ts, pixelData/parser.ts, pixelData/characters.ts, pixelData/desks.ts, pixelData/room.ts, pixelData/index.ts, App.tsx, app.css, AppShell.tsx, Sidebar.tsx, constants.ts
