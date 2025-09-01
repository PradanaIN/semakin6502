#!/usr/bin/env bash
set -e

docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

