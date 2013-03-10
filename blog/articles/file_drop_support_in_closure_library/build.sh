#! /bin/sh

CLOSURE_LIBRARY=../../../closure-library

python $CLOSURE_LIBRARY/closure/bin/build/closurebuilder.py --root=$CLOSURE_LIBRARY --root=. -n RequiredScripts -o compiled --output_file=closure-library/closure/goog/base.js -c compiler.jar -f "--compilation_level=SIMPLE_OPTIMIZATIONS" -f "--define=goog.DEBUG=false"
