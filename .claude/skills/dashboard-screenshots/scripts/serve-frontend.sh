#!/usr/bin/env bash
# Starts or stops the Flexprice dashboard (flexprice-front) for docs screenshots.
#
# Usage: bash serve-frontend.sh start|stop|status
# Env:   FLEXPRICE_FRONT  frontend repo (default: flexprice-front next to the docs repo)
#        PORT             default 3100; never 3000, which is often a running `mintlify dev` preview
#        LOG_FILE         Vite output (default: $TMPDIR/flexprice-front-vite.log)
#        PID_FILE         pid of the server `start` launched (default: $TMPDIR/flexprice-front-vite-$PORT.pid)
#
# `stop` only stops the server that `start` launched: it reads the recorded pid and checks that
# the process is still Vite running from the frontend repo on this port before signalling it.
# Anything else listening on the port is left alone.
#
# VITE_API_URL points at the cloud API only so that URLs shown in the UI (webhook URLs) match
# production. capture.cjs answers every API request itself; nothing reaches the real API.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DOCS_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
FRONT="${FLEXPRICE_FRONT:-$DOCS_ROOT/../flexprice-front}"
PORT="${PORT:-3100}"
LOG_FILE="${LOG_FILE:-${TMPDIR:-/tmp}/flexprice-front-vite.log}"
PID_FILE="${PID_FILE:-${TMPDIR:-/tmp}/flexprice-front-vite-$PORT.pid}"

refuse_3000() {
	if [ "$PORT" = "3000" ]; then
		echo "Refusing port 3000: it is usually the docs preview. Use another PORT."
		exit 1
	fi
}
listener() { lsof -ti:"$PORT" -sTCP:LISTEN 2>/dev/null || true; }
front_dir() { (cd "$FRONT" 2>/dev/null && pwd -P) || true; }

# True when pid $1 is Vite, serving this port, started from the frontend repo.
is_our_server() {
	local pid="$1" cmd cwd
	cmd="$(ps -o command= -p "$pid" 2>/dev/null || true)"
	[[ "$cmd" == *vite* && "$cmd" == *"--port $PORT"* ]] || return 1
	cwd="$(lsof -a -p "$pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -1)"
	[ -n "$cwd" ] && [ "$cwd" = "$(front_dir)" ]
}

case "${1:-}" in
start)
	refuse_3000
	[ -n "$(front_dir)" ] || { echo "Frontend repo not found at $FRONT. Set FLEXPRICE_FRONT."; exit 1; }
	[ -d "$FRONT/node_modules" ] || { echo "Dependencies missing. Run: cd $FRONT && HUSKY=0 npm ci"; exit 1; }
	[ -z "$(listener)" ] || { echo "Port $PORT is already in use (pid $(listener)). Choose another PORT."; exit 1; }
	cd "$(front_dir)"
	VITE_API_URL=https://api.cloud.flexprice.io/v1 VITE_ENVIRONMENT=self-hosted \
		nohup ./node_modules/.bin/vite --port "$PORT" --strictPort >"$LOG_FILE" 2>&1 </dev/null &
	pid=$!
	if curl -s -o /dev/null --retry 30 --retry-connrefused --retry-delay 2 --max-time 120 "http://localhost:$PORT/" &&
		[ "$(listener)" = "$pid" ] && is_our_server "$pid"; then
		echo "$pid" >"$PID_FILE"
		echo "Frontend running at http://localhost:$PORT (pid $pid, log $LOG_FILE)"
	else
		kill "$pid" 2>/dev/null || true
		echo "Frontend did not start on port $PORT; see $LOG_FILE"
		exit 1
	fi
	;;
stop)
	refuse_3000
	if [ ! -f "$PID_FILE" ]; then
		echo "No frontend started by this script on port $PORT ($PID_FILE is missing). Nothing stopped."
		exit 0
	fi
	pid="$(cat "$PID_FILE")"
	rm -f "$PID_FILE"
	if ! kill -0 "$pid" 2>/dev/null; then
		echo "The recorded frontend (pid $pid) is no longer running. Nothing stopped."
		exit 0
	fi
	if ! is_our_server "$pid"; then
		echo "pid $pid is not the frontend this script started on port $PORT. Nothing stopped."
		exit 1
	fi
	kill "$pid"
	for _ in 1 2 3 4 5 6 7 8 9 10; do kill -0 "$pid" 2>/dev/null || break; sleep 0.5; done
	if kill -0 "$pid" 2>/dev/null; then kill -9 "$pid"; fi
	echo "Stopped the frontend on port $PORT (pid $pid)"
	;;
status)
	pid="$(listener)"
	if [ -z "$pid" ]; then
		echo "Port $PORT: free"
	elif [ -f "$PID_FILE" ] && [ "$(cat "$PID_FILE")" = "$pid" ] && is_our_server "$pid"; then
		echo "Port $PORT: the frontend this script started (pid $pid)"
	else
		echo "Port $PORT: in use by another process (pid $pid); stop will not touch it"
	fi
	;;
*)
	echo "Usage: bash serve-frontend.sh start|stop|status"
	exit 1
	;;
esac
