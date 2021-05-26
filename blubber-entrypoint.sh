#!/usr/bin/env bash

echo "Configuring HAProxy"

cat > haproxy-generated.cfg <<EOF
global
	daemon
	maxconn ${HAPROXY_QUEUE_SIZE:-100}

defaults
	mode tcp
	timeout connect ${HAPROXY_TIMEOUT_CONNECT:-60s}
	timeout client ${HAPROXY_TIMEOUT_CLIENT:-60s}
	timeout server ${HAPROXY_TIMEOUT_SERVER:-60s}

frontend frontend_1
	bind *:${HAPROXY_WIKISPEECH_SERVER_FRONTEND_PORT:-10001}
	default_backend backend_1

backend backend_1
	server server_1 127.0.0.1:${HAPROXY_WIKISPEECH_SERVER_BACKEND_PORT:-10000} maxconn ${HAPROXY_WIKISPEECH_SERVER_BACKEND_MAXIMUM_CONCURRENT_CONNECTIONS:-4}

frontend stats
	mode http
	bind *:${HAPROXY_STATS_FRONTEND_PORT:-10002}
	stats enable
	stats uri /stats
	stats refresh ${HAPROXY_STATS_FRONTEND_REFRESH_RATE:-4s}
	stats admin if TRUE
EOF
echo "Starting HAProxy"
/usr/sbin/haproxy -f haproxy-generated.cfg

echo "Starting Wikispeech server"
python3 bin/wikispeech

