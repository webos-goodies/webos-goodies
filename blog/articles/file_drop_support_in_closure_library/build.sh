#! /bin/sh

python closure-library/closure/bin/build/closurebuilder.py --root=. -n RequiredScripts -o compiled --output_file=script.js -c compiler.jar -f "--compilation_level=SIMPLE_OPTIMIZATIONS" -f "--define=goog.DEBUG=false"
