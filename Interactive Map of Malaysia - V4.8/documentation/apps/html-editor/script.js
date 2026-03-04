// Apply selected style to text in the contenteditable div
function applyStyle(style) {
    const editor = document.getElementById('editor');
    
    if (style === 'bold') {
        document.execCommand('bold');
    } else if (style === 'italic') {
        document.execCommand('italic');
    } else if (style === 'underline') {
        document.execCommand('underline');
    }
}

// Change text color
function changeTextColor() {
    let color = prompt('Enter a color hex code:', '#000000');
    if (color) {
        document.execCommand('foreColor', false, color);
    }
}

// Add a link to selected text
/*function addLink() {
    let url = prompt('Enter the URL for the link:');
    if (url) {
        document.execCommand('createLink', false, url);
    }
}*/

// Add an image to the editor
function addImage() {
    let url = prompt('Enter the image URL:');
    if (url) {
        document.execCommand('insertImage', false, url);
    }
}

// Copy content to clipboard
function copyToClipboard() {
    const editor = document.getElementById('editor');
    
    // Create a temporary textarea to copy content from the editor div
    const textarea = document.createElement('textarea');
    textarea.value = editor.innerHTML; // Get the HTML content from the editor
    document.body.appendChild(textarea);
    
    // Select the content and copy it
    textarea.select();
    document.execCommand('copy');
    
    // Remove the temporary textarea
    document.body.removeChild(textarea);
    
    // Alert the user that the content has been copied
    // alert('Content copied to clipboard!');
}

// Clear content in the editor
function clearContent() {
    const editor = document.getElementById('editor');
    editor.innerHTML = ''; // Clear the content of the editor div
}

/*-----------------------------------------------------------------
-------------------------------------------------------------------
-------------------------- COLOR PICKER ---------------------------
-------------------------------------------------------------------
-----------------------------------------------------------------*/

// Define the 25 colors for the color swatch (your provided colors)
const colors = [
"#ff0000", "#ff4000", "#ff8000", "#ffbf00", "#ffff00", "#bfff00", 
"#80ff00", "#40ff00", "#00ff00", "#00ff40", "#00ff80", "#00ffbf", 
"#00ffff", "#00bfff", "#0080ff", "#0040ff", "#0000ff", "#4000ff", 
"#8000ff", "#bf00ff", "#ff00ff", "#ff00bf", "#ff0080", "#ff0040", "#808080"
];

let selectedColor = "#ff0000"; // Default selected color (Red)

// Create the color swatches
function createColorSwatches() {
  const swatchContainer = document.getElementById("colorSwatches");

  colors.forEach(color => {
    const swatch = document.createElement("div");
    swatch.classList.add("color-swatch");
    swatch.style.backgroundColor = color;
    swatch.addEventListener("click", () => {
      selectedColor = color;
      updateGradientBar(color);
      updatePreviewBoxAndCode(color);
    });
    swatchContainer.appendChild(swatch);
  });
}

// Update the gradient bar with the selected color
function updateGradientBar(color) {
  const gradientBar = document.getElementById("gradientBar");
  gradientBar.innerHTML = ''; // Clear the existing gradient segments

  // Create 25 gradient segments
  for (let i = 0; i < 25; i++) {
    const segment = document.createElement("div");
    segment.classList.add("gradient-segment");

    // Calculate the color of each segment based on the position
    const ratio = i / 24; // 24 because we have 25 segments

    // Calculate the color based on the gradient (white -> selected color -> black)
    const gradientColor = getColorFromGradient(ratio, color);
    segment.style.backgroundColor = gradientColor;

    segment.addEventListener("click", () => {
      updatePreviewBoxAndCode(gradientColor);
    });

    gradientBar.appendChild(segment);
  }
}

// Calculate color from gradient (white -> selected color -> black)
function getColorFromGradient(ratio, color) {
  const rgb = hexToRgb(color);
  let r, g, b;

  if (ratio < 0.5) {
    // First half: White to selected color
    r = Math.round(255 * (1 - ratio * 2) + rgb.r * ratio * 2);
    g = Math.round(255 * (1 - ratio * 2) + rgb.g * ratio * 2);
    b = Math.round(255 * (1 - ratio * 2) + rgb.b * ratio * 2);
  } else {
    // Second half: Selected color to black
    const inverseRatio = (ratio - 0.5) * 2;
    r = Math.round(rgb.r * (1 - inverseRatio));
    g = Math.round(rgb.g * (1 - inverseRatio));
    b = Math.round(rgb.b * (1 - inverseRatio));
  }

  return rgbToHex({ r, g, b });
}

// Convert hex color to RGB
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return { r, g, b };
}

// Convert RGB to hex
function rgbToHex(rgb) {
  const r = rgb.r.toString(16).padStart(2, '0');
  const g = rgb.g.toString(16).padStart(2, '0');
  const b = rgb.b.toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

// Update the color preview box and hex code
function updatePreviewBoxAndCode(hexColor) {
  document.getElementById("colorPreviewBox").style.backgroundColor = hexColor;
  document.getElementById("hexCode").innerText = hexColor;
}

// Copy color hex code to clipboard
function copyColor() {
  const hexCode = document.getElementById("hexCode").innerText;
  const textArea = document.createElement("textarea");
  textArea.value = hexCode;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
  //alert("Copied: " + hexCode); // Optional: alert the user
}

// Add event listener to the copy button
document.getElementById("copyButton").addEventListener("click", copyColor);

// Initialize the page
createColorSwatches();
updateGradientBar(selectedColor); // Set the initial gradient bar
