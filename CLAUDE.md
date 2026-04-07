# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

本地只读看板，读取 `~/.claude` 目录展示 Claude Code 的配置、项目/会话历史、token 用量、插件、skills、commands。**只读，不修改 `~/.claude` 任何文件，无鉴权，仅本机使用。**

## 启动 / 开发命令

```bash
./dev.sh                                  # 一键启动前后端
cd backend && go run .                    # 后端 :7788
cd frontend && pnpm install && pnpm dev   # 前端 :5173 (Vite 把 /api 代理到 :7788)
```

依赖：Go 1.21+，Node.js + pnpm。后端零依赖（仅标准库 `net/http`）。

## 架构

两个独立进程，通过 `/api` 通信：

- **backend/** — Go，标准库 `net/http`
  - `internal/claudedir/` — 解析 `~/.claude`（paths / projects / sessions / usage）。流式按行读 `*.jsonl`，仅当 `type == "assistant"` 且存在 `message.usage` 时累加 input/output/cache_create/cache_read token。
  - `internal/api/handlers.go` — HTTP handlers，所有接口前缀 `/api`，仅 GET。
- **frontend/** — Vite + React + TS + react-router
  - `src/api.ts` — 接口封装
  - `src/pages/` — Overview / Projects / ProjectDetail / SessionDetail / History 等
  - 历史记录页按 sessionId 分组展示。

### 数据来源（`~/.claude`）

| 路径 | 用途 |
|---|---|
| `settings.json` | 全局配置 |
| `projects/<encoded-cwd>/<sessionId>.jsonl` | 每个 session 的事件流（逐行 JSON） |
| `history.jsonl` | 全局 prompt 历史 |
| `plugins/installed_plugins.json` | 已安装插件清单 |
| `skills/<name>/SKILL.md` | 用户级 skill（解析 frontmatter） |
| `commands/<name>.md` | 用户级 slash command |

### API（全部 GET，前缀 `/api`）

`/settings` `/projects` `/projects/{id}/sessions` `/projects/{id}/sessions/{sid}` `/usage/summary` `/plugins` `/skills` `/commands` `/history`
