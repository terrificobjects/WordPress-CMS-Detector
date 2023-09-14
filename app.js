const express = require('express');
let fetch;
import('node-fetch').then(module => {
  fetch = module.default;
});

const cors = require('cors');
const { parse } = require('node-html-parser');

const app = express();

// Enable CORS for all routes
app.use(cors());

// Enable JSON parsing for POST requests
app.use(express.json());

// POST /identify endpoint
app.post('/identify', async (req, res) => {
    const url = req.body.url;
    let isWordPress = false;
    let version = "Unknown";
    let theme = "Unknown";

    try {
        const response = await fetch(url);
        const text = await response.text();
        const root = parse(text);

        // Check if WordPress
        if (text.includes("wp-")) {
            isWordPress = true;

            // Find version
            const generatorMeta = root.querySelector("meta[name='generator']");
            if (generatorMeta && generatorMeta.getAttribute("content")) {
                const content = generatorMeta.getAttribute("content");
                const match = content.match(/WordPress\s([\d.]+)/);
                if (match) {
                    version = match[1];
                }
            }

            // Find theme
            const themeMatch = text.match(/\/themes\/([a-zA-Z0-9_-]+)/);
            if (themeMatch) {
                theme = themeMatch[1];
            }
        }
    } catch (error) {
        console.error(error);
    }

    res.json({ isWordPress, version, theme });
});

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
});
