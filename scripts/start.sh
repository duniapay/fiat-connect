#!/usr/bin/env bash
pm2-runtime start -n fiatconnect  build/src/index.js -i 1 --env development