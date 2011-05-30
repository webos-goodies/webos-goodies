#! /bin/sh

CLOSURE_COMPIER=~/lib/closure-compiler/compiler.jar
SRC_FILE=dragresize-debug.js
DEST_FILE=dragresize.js

#yuicompressor --charset UTF-8 dragresize-debug.js | jsjuicer -smo > dragresize.js

java -jar $CLOSURE_COMPIER --js=$SRC_FILE --js_output_file=$DEST_FILE --compilation_level=ADVANCED_OPTIMIZATIONS
