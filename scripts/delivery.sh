#!/bin/bash

if ! docker info > /dev/null 2>&1; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker compose ls > /dev/null 2>&1; then
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

if [ "$1" = "deploy" ]; then
    docker compose -f compose.prod.yaml up -d
elif [ "$1" = "stop" ]; then
    docker compose -f compose.prod.yaml down
elif [ "$1" = "restart" ]; then
    docker compose -f compose.prod.yaml restart
elif [ "$1" = "redeploy" ]; then
    if [ -z "$2" ]; then
        docker compose -f compose.prod.yaml build
        docker compose -f compose.prod.yaml up -d
    else
        if ! docker compose -f compose.prod.yaml config --services | grep -q "^$2\$"; then
            echo "Service '$2' does not exist in compose.prod.yaml"
            exit 1
        fi
        docker compose -f compose.prod.yaml build "$2"
        docker compose -f compose.prod.yaml up -d "$2"
    fi
else
    echo "Please provide either 'deploy', 'stop', 'restart', or 'redeploy' as an argument"
    exit 1
fi
