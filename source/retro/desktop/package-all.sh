#!/usr/bin/env bash
# Packages Windows + macOS builds, ad-hoc signs the Mac apps, and zips everything into ../dist-desktop
set -euo pipefail
cd "$(dirname "$0")"
RCODESIGN=${RCODESIGN:-rcodesign}
APP="Sprout Siege Retro"
rm -rf out stage
node build.mjs win32-x64,darwin-arm64,darwin-x64
mkdir -p stage ../dist-desktop
for a in arm64 x64; do "$RCODESIGN" sign "out/$APP-darwin-$a/$APP.app" >/dev/null; done
mv "out/$APP-win32-x64" "stage/$APP"
(cd stage && rm -f ../../dist-desktop/SproutSiegeRetro-Windows.zip && zip -qry ../../dist-desktop/SproutSiegeRetro-Windows.zip "$APP")
(cd "out/$APP-darwin-arm64" && rm -f ../../../dist-desktop/SproutSiegeRetro-Mac-AppleSilicon.zip && zip -qry ../../../dist-desktop/SproutSiegeRetro-Mac-AppleSilicon.zip "$APP.app")
(cd "out/$APP-darwin-x64" && rm -f ../../../dist-desktop/SproutSiegeRetro-Mac-Intel.zip && zip -qry ../../../dist-desktop/SproutSiegeRetro-Mac-Intel.zip "$APP.app")
rm -rf out stage
ls -la ../dist-desktop
