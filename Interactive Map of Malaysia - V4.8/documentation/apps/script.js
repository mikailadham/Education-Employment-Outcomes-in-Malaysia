/*--------------- Click 'test' to test the map link -----------------------*/
function testLink() {
    const websiteDir = document.getElementById("websiteDir").value.trim();
    if (websiteDir) {
        // Generate the full URL by appending '/index.html'
        const fullLink = websiteDir.endsWith("/") ? websiteDir + "index.html" : websiteDir + "/index.html";
        // Open the full URL in a new tab
        window.open(fullLink, '_blank');
    } else {
        alert("Please enter a valid website directory first.\ne.g., https://www.example.com/xx-js-map/");
    }
}

/*--------------- Click 'update' to add the website to the JS/CSS path -----------------------*/
function updateTextarea() {
    const websiteDir = document.getElementById("websiteDir").value.trim();
    if (websiteDir) {
        // Replace 'replaceme' with the entered website directory in the div
        const valLink = websiteDir.endsWith("/") ? websiteDir.slice(0, -1) : websiteDir;
        let updatedText = document.getElementById("headCode").innerHTML
            .replace(/replaceme/g, valLink);  // Global replace for 'replaceme'

        // Update the div with the new content
        document.getElementById("headCode").innerHTML = updatedText;
        document.getElementById("updateButton").disabled = true;
    } else {
        alert("Please enter a valid website directory first.\ne.g., https://www.example.com/xx-js-map/");
    }
}

/*--------------- Copy Code -----------------------*/
function copyToClipboard(elementId) {
    const codeElement = document.querySelector(`#${elementId} span`);
    const text = codeElement.textContent;
    const button = document.querySelector(`#${elementId} .copy-icon`);
    navigator.clipboard.writeText(text).then(() => {
        button.textContent = "Copied";
        button.classList.add('copied');
        setTimeout(() => {
            button.textContent = "Copy";
            button.classList.remove('copied');
        }, 1000);
    });
}

/*--------------- FAQs Tabs -----------------------*/
function toggleTab(tabId) {
    // Get all the tab content divs and buttons
    var contents = document.querySelectorAll('.tab-content');
    var buttons = document.querySelectorAll('.tab-button');

    // Hide all tab content and reset button styles
    contents.forEach(function(content) {
        content.classList.remove('active');
    });
    buttons.forEach(function(button) {
        button.classList.remove('active');
    });

    // Show the selected content and highlight the corresponding button
    var activeContent = document.getElementById(tabId);
    activeContent.classList.add('active');
    var activeButton = document.querySelector(`button[onclick="toggleTab('${tabId}')"]`);
    activeButton.classList.add('active');
}