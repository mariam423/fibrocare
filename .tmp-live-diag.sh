#!/usr/bin/env bash
set -u
# Start the live production server in the background
NEXT_DIST_DIR=.next-live GEMINI_API_KEY=fake-live-e2e-key AI_MOCK_MODE=false NEXTAUTH_URL=http://localhost:3101 npx next start -p 3101 > /tmp/live-server.log 2>&1 &
SERVER_PID=$!
echo "server pid: $SERVER_PID"
# Wait for it to come up
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 http://localhost:3101/login 2>/dev/null || echo 000)
  if [ "$code" != "000" ]; then echo "server up (http $code) after ${i}s"; break; fi
  sleep 1
done
