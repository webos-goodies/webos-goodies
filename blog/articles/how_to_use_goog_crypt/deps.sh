#! /bin/sh

python ../../../closure-library/closure/bin/build/depswriter.py \
  --root_with_prefix="scripts ../../../blog/articles/how_to_use_goog_crypt/scripts" \
  --output_file=deps.js
