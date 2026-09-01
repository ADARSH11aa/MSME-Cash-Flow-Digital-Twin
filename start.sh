#!/bin/sh
# Starts both processes this combined container runs: the Python AI server
# (all 8 models, from AI_models/main.py) on a fixed internal port, then the
# Node backend gateway on Cloud Run's public $PORT once the AI server is
# actually answering requests - the gateway's first real request would
# otherwise race a uvicorn process that hasn't finished loading the ~360MB
# of model artifacts yet.
set -e

cd /app/AI_models
PORT=8000 uvicorn main:app --host 127.0.0.1 --port 8000 &
AI_PID=$!

echo "start.sh: waiting for AI server (pid $AI_PID) on :8000..."
i=0
while ! wget -q -O /dev/null http://127.0.0.1:8000/docs 2>/dev/null; do
    i=$((i + 1))
    if [ "$i" -ge 60 ]; then
        echo "start.sh: AI server did not become ready in 60s" >&2
        exit 1
    fi
    kill -0 "$AI_PID" 2>/dev/null || { echo "start.sh: AI server process died" >&2; exit 1; }
    sleep 1
done
echo "start.sh: AI server ready after ${i}s"

cd /app/backend
export MODEL1_BASE_URL=http://127.0.0.1:8000
exec node src/server.js
