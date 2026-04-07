#!/usr/bin/env bash
set -e
trap 'kill 0' EXIT
(cd backend && go run .) &
(cd frontend && pnpm run dev) &
wait
