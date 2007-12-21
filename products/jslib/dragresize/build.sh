#! /bin/sh

yuicompressor --charset UTF-8 dragresize-debug.js | jsjuicer -smo > dragresize.js
