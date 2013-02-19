#! /bin/sh

python ../../../closure-library/closure/bin/build/closurebuilder.py \
    -n crypt.App -o compiled --output_file=release.js \
    --root=../../../closure-library --root=scripts \
    -c ~/lib/closure-compiler/compiler.jar -f "--compilation_level=ADVANCED_OPTIMIZATIONS" \
    -f "--define=goog.DEBUG=false"
