import { Webview } from "../src";

const html = /* html */ `
<head>
    <style>
        body {
            color: white !important;
            background: transparent;
        }
    </style>
</head>
<html>
    <body>
        <h1>Hello from bun v${Bun.version} !</h1>
    </body>
</html>
`;

const webview = new Webview(true);
webview.title = "Bun App";
webview.setHTML(html);
webview.run();
