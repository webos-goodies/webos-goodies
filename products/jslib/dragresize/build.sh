#! /bin/sh

yuicompressor --charset UTF-8 dragresize.js | jsjuicer -smo > dragresize-min.js
