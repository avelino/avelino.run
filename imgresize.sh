#!/usr/bin/env bash

FILE=$1
OUT_PATH=$2

echo "${FILE} - ${OUT_PATH}"

mogrify -path $OUT_PATH -define filter:support=2 -unsharp 0.25x0.08+8.3+0.045 -dither None -posterize 136 -quality 75 -define jpeg:fancy-upsampling=off -define png:compression-filter=5 -define png:compression-level=9 -define png:compression-strategy=1 -define png:exclude-chunk=all -interlace none -colorspace sRGB $FILE


