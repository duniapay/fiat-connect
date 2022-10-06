#!/usr/bin/env bash
pm2-runtime start ecosystem.config.js build/src/index.js -i 1 --env development