#!/usr/bin/env bash
# Builds Sprout Siege APK without Gradle (aapt2 + javac + d8 + apksigner).
set -euo pipefail
cd "$(dirname "$0")"
SDK=${ANDROID_HOME:-/opt/android-sdk}
BT=$SDK/build-tools/35.0.0
PLAT=$SDK/platforms/android-34/android.jar
rm -rf build && mkdir -p build/gen build/classes build/dex ../dist-apk
cp ../dist/index.html assets/index.html
$BT/aapt2 compile --dir res -o build/res.zip
$BT/aapt2 link -o build/base.apk -I "$PLAT" --manifest AndroidManifest.xml -A assets --java build/gen \
  --min-sdk-version 21 --target-sdk-version 34 --version-code 1 --version-name 1.0 build/res.zip
javac -nowarn -Xlint:-options -source 8 -target 8 -bootclasspath "$PLAT" -d build/classes \
  build/gen/com/sproutsiege/retro/R.java src/com/sproutsiege/retro/MainActivity.java
$BT/d8 --release --min-api 21 --lib "$PLAT" --output build/dex $(find build/classes -name '*.class')
cp build/base.apk build/unsigned.apk
(cd build/dex && zip -q ../unsigned.apk classes.dex)
$BT/zipalign -p -f 4 build/unsigned.apk build/aligned.apk
if [ ! -f retro-release.keystore ]; then
  keytool -genkeypair -keystore retro-release.keystore -alias sprout -keyalg RSA -keysize 2048 -validity 10000 \
    -storepass sproutsiege -keypass sproutsiege -dname "CN=Sprout Siege Retro, O=Sprout Siege" >/dev/null 2>&1
fi
$BT/apksigner sign --ks retro-release.keystore --ks-key-alias sprout --ks-pass pass:sproutsiege --key-pass pass:sproutsiege \
  --out ../dist-apk/SproutSiegeRetro.apk build/aligned.apk
$BT/apksigner verify --verbose ../dist-apk/SproutSiegeRetro.apk | head -5
ls -la ../dist-apk/SproutSiegeRetro.apk
