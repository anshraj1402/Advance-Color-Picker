console.log("content script injected");

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'extractAllColors') {
        let colors = extractAllColors();
        sendResponse({ colors: colors });
    } else if (message.from === 'popup' && message.query === 'eye_dropper_clicked') {
        if (!window.EyeDropper) {
            console.log('EyeDropper API not supported.');
            sendResponse({ error: 'EyeDropper API not supported.' });
            return;
        }

        const eyeDropper = new EyeDropper();

        eyeDropper.open().then(result => {
            const color = result.sRGBHex;
            sendResponse({ color: color });
        }).catch(e => {
            console.error('Error in EyeDropper:', e);
            sendResponse({ error: e.message });
        });

        return true; // Indicates that sendResponse will be called asynchronously
    }
});

// Function to extract all unique colors from the webpage
function extractAllColors() {
    let allElements = document.querySelectorAll('*');
    let colorsUsed = new Set();

    allElements.forEach(function(element) {
        let computedStyle = window.getComputedStyle(element);

        // Extracting various color properties
        let bgColor = computedStyle.backgroundColor;
        let textColor = computedStyle.color;
        let borderColor = computedStyle.borderColor;

        // Adding detected colors to the Set
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
            colorsUsed.add(rgbToHex(bgColor));
        }
        if (textColor && textColor !== 'rgba(0, 0, 0, 0)') {
            colorsUsed.add(rgbToHex(textColor));
        }
        if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
            colorsUsed.add(rgbToHex(borderColor));
        }
    });

    return Array.from(colorsUsed); // Convert Set to Array
}

// Convert RGB color to Hex
function rgbToHex(color) {
    let [r, g, b] = color.match(/\d+/g);
    return "#" + ((1 << 24) + (parseInt(r) << 16) + (parseInt(g) << 8) + parseInt(b)).toString(16).slice(1);
}
