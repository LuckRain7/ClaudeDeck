# 本地 Claude Code 看板

读取本地 `~/.claude` 目录，展示 Claude Code 配置、各项目历史会话，并统计 token 消耗的本地看板。

- 后端：Go（标准库 `net/http`，零依赖）
- 前端：Vite + React + TypeScript + react-router

## 功能

- **全局概览**：汇总所有项目的 input / output / cache_create / cache_read token，按模型分组展示，并渲染 `settings.json`
- **项目列表**：列出 `~/.claude/projects/` 下所有项目，显示会话数、最后活跃时间和总 token
- **会话历史**：进入项目可查看该项目所有 session（开始/结束时间、消息数、模型、token）
- **会话详情**：单个 session 的消息流（时间戳、类型、角色、模型、单条 usage）
- **历史记录**：解析 `history.jsonl`，按天分组、可折叠展开，显示每条 prompt 的时间、项目和内容
- **插件**：从 `installed_plugins.json` 读取已安装插件（版本、scope、安装/更新时间）
- **Skills**：列出 `~/.claude/skills/`，解析 `SKILL.md` frontmatter（名称、描述、user-invocable）
- **Commands**：列出 `~/.claude/commands/*.md` 自定义 Slash 命令及描述

## 数据来源

| 路径 | 说明 |
|---|---|
| `~/.claude/settings.json` | 全局配置 |
| `~/.claude/projects/<encoded-cwd>/<sessionId>.jsonl` | 每个 session 的事件流，逐行 JSON |
| `~/.claude/history.jsonl` | 全局 prompt 历史 |
| `~/.claude/plugins/installed_plugins.json` | 已安装插件清单 |
| `~/.claude/skills/<name>/SKILL.md` | 用户级 skill 定义 |
| `~/.claude/commands/<name>.md` | 用户级 slash command |

后端流式扫描 jsonl，仅当 `type == "assistant"` 且存在 `message.usage` 时累加 token。

## 目录结构

```
cc-look/
├── dev.sh                    # 一键启动前后端
├── backend/                  # Go 后端，监听 :7788
│   ├── go.mod
│   ├── main.go
│   └── internal/
│       ├── claudedir/        # ~/.claude 解析（paths/projects/sessions/usage）
│       └── api/handlers.go   # HTTP handlers
└── frontend/                 # Vite + React，监听 :5173
    ├── vite.config.ts        # /api 代理到 :7788
    └── src/
        ├── api.ts            # 接口封装
        ├── components/       # Layout, TokenStats
        └── pages/            # Overview, Projects, ProjectDetail, SessionDetail
```

## API

所有接口前缀 `/api`，仅 GET：

| 路径 | 说明 |
|---|---|
| `/api/settings` | `~/.claude/settings.json` 内容 |
| `/api/projects` | 项目列表（含 sessionCount / lastActive / usage） |
| `/api/projects/{id}/sessions` | 某项目的 session 列表 |
| `/api/projects/{id}/sessions/{sid}` | 单 session 详情（含消息列表） |
| `/api/usage/summary` | 全局聚合：总 usage + 按项目 + 按模型 |
| `/api/plugins` | 已安装插件列表 |
| `/api/skills` | 用户级 skills |
| `/api/commands` | 用户级 slash commands |
| `/api/history` | `history.jsonl` 按天分组的 prompt 历史 |

## 启动

需要本地已安装 Go 1.21+ 和 Node.js（前端使用 pnpm）。

```bash
# 一键启动
./dev.sh

# 或分别启动
cd backend && go run .          # 后端 :7788
cd frontend && pnpm install && pnpm dev   # 前端 :5173
```

打开 http://localhost:5173 即可。

## 范围说明

只读看板，不修改 `~/.claude` 任何文件。仅供本机使用，未做鉴权。
