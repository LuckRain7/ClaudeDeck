# 快速启动

这份文档用于告诉其他人在下载项目后，如何在本地把 `ClaudeDeck` 跑起来。

## 1. 环境要求

启动前请先确认本机已安装：

- Go `1.21+`
- Node.js `18+`
- pnpm

如果还没有安装 pnpm，可以先执行：

```bash
npm install -g pnpm
```

## 2. 下载项目

```bash
git clone <你的仓库地址>
cd ClaudeDeck
```

## 3. 首次启动

第一次启动时，需要先安装前端依赖：

```bash
cd frontend
pnpm install
cd ..
```

然后回到项目根目录，执行一键启动：

```bash
./dev.sh
```

启动后：

- 前端地址：`http://localhost:5173`
- 后端接口：`http://localhost:7788`

## 4. 后续启动

前端依赖安装完成后，后续直接在项目根目录执行：

```bash
./dev.sh
```

## 5. 手动分别启动

如果你不想用一键脚本，也可以分别启动前后端。

启动后端：

```bash
cd backend
go run .
```

新开一个终端，启动前端：

```bash
cd frontend
pnpm dev
```

## 6. 常见问题

### `pnpm: command not found`

说明本机还没有安装 pnpm：

```bash
npm install -g pnpm
```

### 运行 `./dev.sh` 提示权限不足

给脚本增加执行权限：

```bash
chmod +x dev.sh
./dev.sh
```

### 页面打开了，但没有数据

这个项目会读取本机的 `~/.claude` 目录。如果你的机器上还没有 Claude Code 的本地数据，看板可以启动，但不会显示实际内容。
