const express = require('express');
let fetch;
import('node-fetch').then(module => {
  fetch = module.default;
});
const cors = require('cors');
const { parse } = require('node-html-parser');

const app = express();
const ipCounter = {};
const maxRequests = 20;
const timeLimit = 3600000;

// Enable CORS for all routes
app.use(cors());

// Enable JSON parsing for POST requests
app.use(express.json());

// POST /identify endpoint
app.post('/identify', async (req, res) => {
    const ip = req.ip;
    const currentTime = Date.now();

    // Check if this IP has made a request before
    if (ipCounter[ip]) {
        if (ipCounter[ip].count >= maxRequests) {
            const timeSinceFirstRequest = currentTime - ipCounter[ip].firstRequestTime;

            if (timeSinceFirstRequest <= timeLimit) {
                return res.status(429).json({ error: 'Rate limit exceeded', message: 'You must wait 1 hour after making 20 requests to make more.' });
            }

            // Reset counter and time if more than an hour has passed
            ipCounter[ip].count = 0;
            ipCounter[ip].firstRequestTime = currentTime;
        }
    } else {
        // Initialize counter and time for this IP
        ipCounter[ip] = { count: 0, firstRequestTime: currentTime };
    }

    // Increment the request count for this IP
    ipCounter[ip].count += 1;

    let url = req.body.url;

    // Validate and correct the URL if necessary
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'http://' + url;
    }

    let isWordPress = false;
    let version = "Unknown";
    let theme = "Unknown";

    try {
        const response = await fetch(url);
        const text = await response.text();
        const root = parse(text);

        if (text.includes("wp-")) {
            isWordPress = true;

            const generatorMeta = root.querySelector("meta[name='generator']");
            if (generatorMeta && generatorMeta.getAttribute("content")) {
                const content = generatorMeta.getAttribute("content");
                const match = content.match(/WordPress\s([\d.]+)/);
                if (match) {
                    version = match[1];
                }
            }

            const themeMatch = text.match(/\/themes\/([a-zA-Z0-9_-]+)/);
            if (themeMatch) {
                theme = themeMatch[1];
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Something went wrong' });
    }

    res.json({ isWordPress, version, theme });
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
});
