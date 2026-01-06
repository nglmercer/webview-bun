import { $ } from "bun";
// $.nothrow();

const { arch, platform } = process;

switch (platform) {
  case "win32":
    await $`
        scripts/build.bat
        cp webview/build/core/Release/webview.dll build/libwebview.dll
        `;
    break;
  case "linux": {
    // Detect GTK version
    const hasGtk4 = (await $`pkg-config --exists gtk4`.nothrow()).exitCode === 0;
    let webkitApi = "4.0";
    if (hasGtk4) {
      webkitApi = "6.0";
    } else {
      const hasWebkit41 =
        (await $`pkg-config --exists webkit2gtk-4.1`.nothrow()).exitCode === 0;
      if (hasWebkit41) {
        webkitApi = "4.1";
      }
    }

    console.log(`Building for Linux (${arch}) using GTK ${hasGtk4 ? "4" : "3"} (WebKitAPI ${webkitApi})`);

    await $`
        cd webview
        cmake -B build -S . \
            -DCMAKE_BUILD_TYPE=Release \
            -DWEBVIEW_WEBKITGTK_API=${webkitApi} \
            -DWEBVIEW_ENABLE_CHECKS=false \
            -DWEBVIEW_BUILD_AMALGAMATION=false \
            -DWEBVIEW_BUILD_EXAMPLES=false \
            -DWEBVIEW_BUILD_STATIC_LIBRARY=false \
            -DWEBVIEW_BUILD_TESTS=false \
            -DWEBVIEW_BUILD_DOCS=false
        cmake --build build
        mkdir -p ../build
        cp build/core/libwebview.so ../build/libwebview-${arch}.so
        strip ../build/libwebview-${arch}.so
        `;
    break;
  }
  case "darwin":
    await $`
        cd webview
        cmake -G "Ninja Multi-Config" -B build -S . \
            -DCMAKE_TOOLCHAIN_FILE=cmake/toolchains/universal-macos-llvm.cmake \
            -DWEBVIEW_ENABLE_CHECKS=false \
            -DWEBVIEW_BUILD_AMALGAMATION=false \
            -DWEBVIEW_BUILD_EXAMPLES=false \
            -DWEBVIEW_BUILD_STATIC_LIBRARY=false \
            -DWEBVIEW_BUILD_TESTS=false \
            -DWEBVIEW_BUILD_DOCS=false
        cmake --build build --config Release
        cp build/core/Release/libwebview.dylib ../build/libwebview.dylib
        strip -x -S ../build/libwebview.dylib
        `;
    break;
}
