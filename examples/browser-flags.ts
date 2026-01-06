import { Webview } from "../src/webview";

/**
 * Example demonstrating browser flags configuration.
 * This example shows how to enable autoplay and pass custom browser flags.
 */

const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Browser Flags Demo</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      background: #1a1a2e;
      color: #eee;
    }
    .video-container {
      margin: 20px 0;
      padding: 15px;
      background: #16213e;
      border-radius: 8px;
    }
    video {
      width: 100%;
      max-width: 600px;
      border-radius: 4px;
    }
    .status {
      padding: 10px;
      margin: 10px 0;
      border-radius: 4px;
    }
    .success {
      background: #0f3460;
      border-left: 4px solid #4caf50;
    }
    .error {
      background: #4a0e0e;
      border-left: 4px solid #f44336;
    }
    button {
      padding: 10px 20px;
      margin: 5px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: #e94560;
      color: white;
      font-size: 14px;
    }
    button:hover {
      background: #ff6b6b;
    }
  </style>
</head>
<body>
  <h1>Browser Flags Demo</h1>
  
  <div class="video-container">
    <h2>Autoplay Video Test</h2>
    <video id="testVideo" controls muted>
      <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
      Your browser does not support HTML5 video.
    </video>
  </div>
  
  <div>
    <button onclick="testAutoplay()">Test Autoplay</button>
    <button onclick="testAudio()">Test Audio Autoplay</button>
  </div>
  
  <div id="status" class="status"></div>
  
  <script>
    function showStatus(message, isError = false) {
      const status = document.getElementById('status');
      status.textContent = message;
      status.className = 'status ' + (isError ? 'error' : 'success');
    }
    
    function testAutoplay() {
      const video = document.getElementById('testVideo');
      video.play()
        .then(() => showStatus('✓ Video autoplay succeeded!'))
        .catch(e => showStatus('✗ Video autoplay blocked: ' + e.message, true));
    }
    
    function testAudio() {
      const audio = new Audio('https://www.w3schools.com/html/horse.mp3');
      audio.play()
        .then(() => showStatus('✓ Audio autoplay succeeded!'))
        .catch(e => showStatus('✗ Audio autoplay blocked: ' + e.message, true));
    }
    
    // Auto-test on load
    window.onload = function() {
      showStatus('Page loaded. Click "Test Autoplay" to test video autoplay.');
    };
  </script>
</body>
</html>
`;

async function main() {
  console.log("Creating webview with browser flags...");
  
  // Create a webview with autoplay enabled
  const webview = new Webview(true, undefined, null, {
    enableAutoplay: true,
    muteAutoplay: false,
    customFlags: []
  });
  
  // Navigate to data URL with test content
  const encodedHtml = encodeURIComponent(html);
  webview.navigate(`data:text/html,${encodedHtml}`);
  
  webview.title = "Browser Flags Demo - Autoplay Enabled";
  
  console.log("Running webview...");
  webview.run();
}

main().catch(console.error);
