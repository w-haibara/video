#!/bin/bash
# Generate minimal test assets for export regression tests.
# Run from repo root: bash app/backend/scripts/generate-test-assets.sh

set -euo pipefail

OUTDIR="$(dirname "$0")/../src/__fixtures__/export/assets"
mkdir -p "$OUTDIR"

# 1-second red video, 160x90, 10fps
ffmpeg -y -f lavfi -i "color=c=red:s=160x90:d=1:r=10" \
  -c:v libx264 -pix_fmt yuv420p -preset ultrafast \
  "$OUTDIR/test-video-1s.mp4"

# 160x90 blue PNG
ffmpeg -y -f lavfi -i "color=c=blue:s=160x90" \
  -frames:v 1 \
  "$OUTDIR/test-image.png"

# 1-second silent audio
ffmpeg -y -f lavfi -i "anullsrc=r=44100:cl=mono" \
  -t 1 -c:a libmp3lame -q:a 9 \
  "$OUTDIR/test-audio-1s.mp3"

echo "Test assets generated in $OUTDIR"
