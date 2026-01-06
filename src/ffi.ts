import { dlopen, FFIType, ptr, type Pointer, CString } from "bun:ffi";
import { Webview } from "./webview";

export function encodeCString(value: string) {
  return ptr(new TextEncoder().encode(value + "\0"));
}

export const instances: Webview[] = [];

/**
 * Unload the library and destroy all webview instances. Should only be run
 * once all windows are closed.
 */
export function unload() {
  for (const instance of instances) instance.destroy();
  lib.close();
}

let lib_file;

if (process.env.WEBVIEW_PATH) {
  lib_file = { default: process.env.WEBVIEW_PATH };
} else if (process.platform === "win32") {
  //@ts-expect-error
  lib_file = await import("../build/libwebview.dll");
} else if (process.platform === "linux") {
  lib_file = await import(`../build/libwebview-${process.arch}.so`);
} else if (process.platform === "darwin") {
  //@ts-expect-error
  lib_file = await import("../build/libwebview.dylib");
}

export const lib = dlopen(lib_file.default, {
  webview_create: {
    args: [FFIType.i32, FFIType.ptr],
    returns: FFIType.ptr,
  },
  webview_destroy: {
    args: [FFIType.ptr],
    returns: FFIType.void,
  },
  webview_run: {
    args: [FFIType.ptr],
    returns: FFIType.void,
  },
  webview_terminate: {
    args: [FFIType.ptr],
    returns: FFIType.void,
  },
  webview_get_window: {
    args: [FFIType.ptr],
    returns: FFIType.ptr,
  },
  webview_set_title: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.void,
  },
  webview_set_size: {
    args: [FFIType.ptr, FFIType.i32, FFIType.i32, FFIType.i32],
    returns: FFIType.void,
  },
  webview_navigate: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.void,
  },
  webview_set_html: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.void,
  },
  webview_init: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.void,
  },
  webview_eval: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.void,
  },
  webview_set_frame: {
    args: [FFIType.ptr, FFIType.i32],
    returns: FFIType.void,
  },
  webview_set_opacity: {
    args: [FFIType.ptr, FFIType.f64],
    returns: FFIType.void,
  },
  webview_set_pixel_transparency: {
    args: [FFIType.ptr, FFIType.i32],
    returns: FFIType.void,
  },
  webview_set_always_on_top: {
    args: [FFIType.ptr, FFIType.i32],
    returns: FFIType.void,
  },
  webview_set_click_through: {
    args: [FFIType.ptr, FFIType.i32],
    returns: FFIType.void,
  },
  webview_bind: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.function, FFIType.ptr],
    returns: FFIType.void,
  },
  webview_unbind: {
    args: [FFIType.ptr, FFIType.ptr],
    returns: FFIType.void,
  },
  webview_return: {
    args: [FFIType.ptr, FFIType.ptr, FFIType.i32, FFIType.ptr],
    returns: FFIType.void,
  },
  webview_pump_msgloop: {
    args: [FFIType.ptr, FFIType.i32],
    returns: FFIType.i32,
  },
});

/**
 * Type definition for webview_set_browser_flags function.
 * This function may not exist in older library versions.
 */
type WebviewSetBrowserFlagsFn = (
  handle: Pointer,
  enableAutoplay: number,
  muteAutoplay: number,
  customFlags: Pointer
) => void;

// Cache for browser flags support check
let browserFlagsSupportChecked = false;
let browserFlagsSupported = false;

/**
 * Check if browser flags function is available in the library.
 * Returns false if the function doesn't exist (old library version).
 */
export function hasBrowserFlagsSupport(): boolean {
  if (browserFlagsSupportChecked) {
    return browserFlagsSupported;
  }
  browserFlagsSupportChecked = true;
  try {
    //@ts-ignore - Dynamically check if symbol exists
    const fn = lib.symbols.webview_set_browser_flags;
    if (typeof fn === "function") {
      browserFlagsSupported = true;
      return true;
    }
  } catch {
    // Symbol doesn't exist
  }
  browserFlagsSupported = false;
  return false;
}

/**
 * Set browser flags - with fallback if not supported by the library.
 * This function safely calls webview_set_browser_flags if available,
 * otherwise does nothing.
 */
export function setBrowserFlags(
  handle: Pointer,
  enableAutoplay: number,
  muteAutoplay: number,
  customFlagsPtr: Pointer
): void {
  if (hasBrowserFlagsSupport()) {
    //@ts-ignore - Function exists at runtime
    lib.symbols.webview_set_browser_flags(handle, enableAutoplay, muteAutoplay, customFlagsPtr);
  }
  // If not supported, silently ignore (for backwards compatibility)
}
