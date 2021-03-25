#!/bin/bash

set -eu

gatsby clean
ENTITIES_COUNT=10000 MODE=legacy  gatsby build 2>&1 | tee legacy-logs.txt
ls -al .cache/redux > legacy-size.txt
mv .cache .cache_legacy
mv public public_legacy


gatsby clean
ENTITIES_COUNT=10000 MODE=spike  gatsby build 2>&1 | tee spike-logs.txt
ls -al .cache/redux > spike-size.txt
mv .cache .cache_spike
mv public public_spike