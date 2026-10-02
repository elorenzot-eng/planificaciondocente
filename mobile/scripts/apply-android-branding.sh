#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RES="$ROOT/android/app/src/main/res"
SRC="$ROOT/assets/educantay-app-icon.svg"
for item in "mdpi:48" "hdpi:72" "xhdpi:96" "xxhdpi:144" "xxxhdpi:192"; do
  density="${item%%:*}"; size="${item##*:}"
  mkdir -p "$RES/mipmap-$density"
  rsvg-convert -w "$size" -h "$size" "$SRC" -o "$RES/mipmap-$density/ic_launcher.png"
  cp "$RES/mipmap-$density/ic_launcher.png" "$RES/mipmap-$density/ic_launcher_round.png"
  cp "$RES/mipmap-$density/ic_launcher.png" "$RES/mipmap-$density/ic_launcher_foreground.png"
done
echo "EducAntay Android branding generated."
