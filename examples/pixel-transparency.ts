import { Webview, SizeHint } from "../src";

/**
 * Example demonstrating per-pixel transparency and click-through functionality.
 * 
 * This example creates a circular window with a gradient background where:
 * - The center has opaque content
 * - The edges are transparent
 * - Click-through is enabled for transparent areas
 */

const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      height: 100%;
      width: 100%;
      overflow: hidden;
      background: transparent;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    .window-content {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 400px;
      height: 400px;
      border-radius: 50%;
      background: radial-gradient(circle at 30% 30%, 
        rgba(66, 153, 225, 0.95) 0%, 
        rgba(66, 153, 225, 0.8) 50%, 
        rgba(49, 130, 206, 0.7) 100%);
      box-shadow: 
        0 0 60px rgba(66, 153, 225, 0.5),
        0 10px 40px rgba(0, 0, 0, 0.3),
        inset 0 -10px 30px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      text-align: center;
      padding: 20px;
      box-sizing: border-box;
    }
    
    h1 {
      margin: 0 0 15px 0;
      font-size: 28px;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }
    
    p {
      margin: 0 0 20px 0;
      font-size: 14px;
      line-height: 1.6;
      opacity: 0.95;
    }
    
    .controls {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 10px;
    }
    
    button {
      padding: 10px 20px;
      font-size: 14px;
      border: none;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.9);
      color: #3182ce;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }
    
    button:hover {
      background: white;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }
    
    button:active {
      transform: translateY(0);
    }
    
    .status {
      margin-top: 15px;
      padding: 8px 16px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 12px;
      font-size: 12px;
    }
    
    .hint {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      padding: 8px 16px;
      background: rgba(0, 0, 0, 0.6);
      color: white;
      border-radius: 20px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="window-content">
    <h1>✨ Pixel Transparency</h1>
    <p>This is a circular window with per-pixel transparency.<br>
    Transparent areas allow click-through to underlying windows.</p>
    
    <div class="controls">
      <button onclick="toggleClickThrough()">Toggle Click-Through</button>
      <button onclick="togglePixelTransparency()">Toggle Pixel Transparency</button>
    </div>
    
    <div class="status" id="status">
      Click-through: ON | Pixel Transparency: ON
    </div>
  </div>
  
  <div class="hint">
    💡 Click on the transparent areas to test click-through!
  </div>
</body>
</html>
`;

const webview = new Webview(true, {
  width: 500,
  height: 500,
  hint: SizeHint.NONE,
});

// Track current state
let pixelTransparencyEnabled = false;
let clickThroughEnabled = false;

// Enable per-pixel transparency and click-through
webview.transparency = pixelTransparencyEnabled;
webview.clickThrough = clickThroughEnabled;
webview.frame = false;
webview.alwaysOnTop = true;
webview.navigate(`data:text/html,${encodeURIComponent(html)}`);

// Bind JavaScript functions
webview.bind("toggleClickThrough", () => {
  clickThroughEnabled = !clickThroughEnabled;
  webview.clickThrough = clickThroughEnabled;
  console.log(`Click-through ${clickThroughEnabled ? "enabled" : "disabled"}`);
  updateStatus();
  return { clickThrough: clickThroughEnabled };
});

webview.bind("togglePixelTransparency", () => {
  pixelTransparencyEnabled = !pixelTransparencyEnabled;
  webview.transparency = pixelTransparencyEnabled;
  console.log(`Pixel transparency ${pixelTransparencyEnabled ? "enabled" : "disabled"}`);
  updateStatus();
  return { pixelTransparency: pixelTransparencyEnabled };
});

function updateStatus() {
  webview.eval(`
    document.getElementById('status').textContent = 
      'Click-through: ${clickThroughEnabled ? 'ON' : 'OFF'} | Pixel Transparency: ${pixelTransparencyEnabled ? 'ON' : 'OFF'}';
  `);
}

// Initialize JavaScript
webview.init(`
  window.toggleClickThrough = async () => {
    await toggleClickThrough();
  };

  window.togglePixelTransparency = async () => {
    await togglePixelTransparency();
  };
`);

console.log("Pixel Transparency Demo");
console.log("========================");
console.log("This example demonstrates:");
console.log("1. Per-pixel transparency using UpdateLayeredWindow");
console.log("2. Click-through for transparent areas");
console.log("3. Real-time toggling of features");
console.log("");
console.log("Try clicking on the transparent areas around the circle!");
console.log("The clicks should pass through to windows behind this one.");

webview.runNonBlocking();
