import { Webview } from "../src/webview";

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Autoplay Test</title>
    <style>
        body {
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: #121212;
            color: white;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            overflow: hidden;
        }
        .container {
            text-align: center;
            background: rgba(255, 255, 255, 0.05);
            padding: 2rem;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        video {
            width: 80%;
            max-width: 600px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.8);
        }
        h1 { margin-bottom: 0.5rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5); }
        p { color: #aaa; margin-bottom: 2rem; }
        .status {
            display: inline-block;
            padding: 8px 16px;
            background: #4CAF50;
            border-radius: 20px;
            font-size: 0.9rem;
            margin-top: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Bypass Autoplay Policy</h1>
        <p>This video should play with <b>sound</b> automatically thanks to the browser flags.</p>
        
        <video id="myVideo" controls autoplay>
            <source src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4">
            Your browser does not support the video tag.
        </video>

        <div id="status" class="status">Status: Waiting for play event...</div>
    </div>

    <script>
        const video = document.getElementById('myVideo');
        const status = document.getElementById('status');

        video.onplay = () => {
            status.innerText = "Status: Autoplaying with sound!";
            status.style.background = "#2196F3";
        };

        // If it's blocked, it won't trigger onplay or will be paused immediately
        setTimeout(() => {
            if (video.paused) {
                status.innerText = "Status: Playback BLOCKED by policy";
                status.style.background = "#f44336";
            }
        }, 1000);
    </script>
</body>
</html>
`;

// Flags intended for WebView2 (Chromium)
// --autoplay-policy=no-user-gesture-required: Bypasses the requirement for user interaction
const flags = "--autoplay-policy=no-user-gesture-required";

console.log("Starting webview with flags:", flags);

const webview = new Webview(
  true, // debug mode
  undefined, // default size
  null, // new window
  flags // custom flags
);

webview.title = "Autoplay with Flags Demonstration";

// Bind a function to receive status reports
webview.bind("report", (status) => {
  console.log("Status report from webview:", status);
});

webview.setHTML(html + `
    <script>
        // Send a report every 2 seconds
        setInterval(() => {
            const video = document.getElementById('myVideo');
            const report = {
                paused: video.paused,
                muted: video.muted,
                currentTime: video.currentTime,
                playState: video.readyState,
                error: video.error ? video.error.code : null
            };
            window.report(report);
        }, 2000);
    </script>
`);

console.log("Webview is running. Check for autoplay status reports...");
webview.run();
