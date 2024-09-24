document.addEventListener('DOMContentLoaded', function() {
    const resultList = document.getElementById('result');
    const pickerBtn = document.getElementById('picker_btn');

    const showMessage = (color, msg) => {
        const messageLabel = document.createElement("p");
        messageLabel.setAttribute("class", "errorLabel");
        messageLabel.style.backgroundColor = color;
        messageLabel.innerText = msg;

        document.body.appendChild(messageLabel);
        setTimeout(() => {
            document.body.removeChild(messageLabel);
        }, 2000);
    };

    // Function to display colors in the popup
    function displayColors(colors) {
        resultList.innerHTML = ''; // Clear previous list

        colors.forEach(function(hexCode) {
            addColorToList(hexCode);
        });
    }

    // Function to add color to the list and enable click to copy functionality
    function addColorToList(hexCode) {
        const liElem = document.createElement('li');

        const colorSwatch = document.createElement('div');
        colorSwatch.setAttribute('class', 'color-swatch');
        colorSwatch.style.backgroundColor = hexCode;

        const colorCode = document.createElement('span');
        colorCode.innerText = hexCode;

        liElem.appendChild(colorSwatch);
        liElem.appendChild(colorCode);

        liElem.addEventListener('click', function() {
            navigator.clipboard.writeText(hexCode);
            showMessage('#e19526', 'Hex code is copied to clipboard!');
        });

        resultList.appendChild(liElem);
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const tab = tabs[0];

        if (tab.url === undefined || tab.url.indexOf('chrome') === 0) {
            showMessage('#ff4f4f', 'Eye Dropper can\'t access Chrome pages');
        } else if (tab.url.indexOf('file') === 0) {
            showMessage('#ff4f4f', 'Eye Dropper can\'t access local pages');
        } else {
            // Request all colors when the popup is opened
            requestAllColors();

            // Add event listener to the search button
            pickerBtn.addEventListener('click', function() {
                // Clear previous results
                resultList.innerHTML = '';

                // Trigger EyeDropper
                chrome.tabs.sendMessage(tab.id, { from: 'popup', query: 'eye_dropper_clicked' }, function(response) {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                        return;
                    }

                    if (response && response.color) {
                        addColorToList(response.color);
                    } else {
                        console.log('No color selected');
                    }
                });
            });
        }
    });

    // Function to request all colors from content script
    function requestAllColors() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, { action: 'extractAllColors' }, function(response) {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError.message);
                    return;
                }

                if (response && response.colors) {
                    displayColors(response.colors);
                } else {
                    console.log('No colors extracted');
                }
            });
        });
    }
});
