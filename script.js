// helper functions to shorten syntax
const $q = (singleSelector) => document.querySelector(singleSelector);
const $qa = (multiSelector) => document.querySelectorAll(multiSelector);

// define element variables
const output = $q("body");
const hex = $q("#hex");
const rgb_inputs = {
    r: $qa("input[data-color='r']"),
    g: $qa("input[data-color='g']"),
    b: $qa("input[data-color='b']"),
};
const rgb_inputArray = [...rgb_inputs.r, ...rgb_inputs.g, ...rgb_inputs.b];
const hsl_inputs = {
    h: $qa("input[data-color='h']"),
    s: $qa("input[data-color='s']"),
    l: $qa("input[data-color='l']"),
};
const hsl_inputArray = [...hsl_inputs.h, ...hsl_inputs.s, ...hsl_inputs.l];
const palateOutput = $q("#palate-output");
const palateTemplate = $q("#show-color");
const palateSelect = $q("select#palate-select");

// setup
const angleArray = [0];
const palateAngles = {};
const palates = [2, 3, 4, 5, 6, 8, 10, 12];
palates.forEach((palateSize) => {
    addPalateOption(palateSize);
    palateAngles[palateSize] = [0];
    const angle = 360 / palateSize;
    for (let i = 1; i < palateSize; i++) {
        palateAngles[palateSize].push(angle * i);
        angleArray.push(angle * i);
    }
});
const angles = [...new Set(angleArray)];
const colorData = {};
angles.forEach((angle) => (colorData[angle] = {}));
const colorWidth = [12.5, 25];

// set and display defaults
const rgb = { r: 0, g: 0, b: 0 };
rgb_syncAllInputValues(rgb);

const hsl = { h: 0, s: 0, l: 0 };
hsl_syncAllInputValues(hsl);

const rgbHex = buildHexValue(rgb);
setBackgroundColor(rgbHex);
setAccentColor(rgbHex);
generateComplementaryColors(rgb);
displayHexValue(rgbHex);

// create event listeners
rgb_inputArray.forEach((input) => input.addEventListener("input", rgb_handleColorInput));

hsl_inputArray.forEach((input) => input.addEventListener("input", hsl_handleColorInput));

hex.addEventListener("input", ({ target: { value } }) => handleHexInput(value));

palateSelect.addEventListener("change", ({ target }) => {
    palateOutput.querySelectorAll("p").forEach((p) => p.remove());

    const palateSize = target.value;
    palateSize && buildPalate(palateSize);
});

// handle (color adjust) slider input events
function rgb_handleColorInput({
    target: {
        value,
        max,
        min,
        dataset: { color },
    },
}) {
    const colorValue = parseInt(+value > +max ? max : +value < +min ? min : value);
    rgb[color] = colorValue;
    rgb_syncInputValues(color, colorValue);
    hsl_syncAllInputValues(update_hsl(hsl_output(rgbToHsl(rgb))));
    const hexValue = buildHexValue(rgb);
    setBackgroundColor(hexValue);
    setAccentColor(hexValue);
    displayHexValue(hexValue);
    generateComplementaryColors(rgb);
}

function hsl_handleColorInput({
    target: {
        value,
        max,
        min,
        dataset: { color },
    },
}) {
    const colorValue = parseInt(+value > +max ? max : +value < +min ? min : value);
    hsl[color] = colorValue;
    hsl_syncInputValues(color, colorValue);
    rgb_syncAllInputValues(update_rgb(hslToRgb(hsl_input(hsl))));
    const hexValue = buildHexValue(rgb);
    setBackgroundColor(hexValue);
    setAccentColor(hexValue);
    displayHexValue(hexValue);
    generateComplementaryColors(rgb);
}

// handle (hex) text input event
function handleHexInput(value) {
    const values = value.match(/[0-9a-fA-F]{2}/g);
    if (values?.length === 3) {
        setBackgroundColor(value);
        setAccentColor(value);
        Object.keys(rgb).forEach((color, i) => (rgb[color] = hexToNum(values[i])));
        rgb_syncAllInputValues(rgb);
        hsl_syncAllInputValues(update_hsl(hsl_output(rgbToHsl(rgb))));
        generateComplementaryColors(rgb);
    }
}

// update code rgb/hsl values
function update_rgb({ r, g, b }) {
    rgb.r = r;
    rgb.g = g;
    rgb.b = b;
    return rgb;
}

function update_hsl({ h, s, l }) {
    hsl.h = h;
    hsl.s = s;
    hsl.l = l;
    return hsl;
}

// functions that visually update inputs/outputs
function setBackgroundColor(hexValue) {
    output.style.backgroundColor = `#${hexValue}`;
}

function displayHexValue(hexValue) {
    hex.value = `${hexValue}`;
}

function rgb_syncInputValues(dataColor, value) {
    rgb_inputs[dataColor].forEach((input) => (input.value = value));
}

function rgb_syncAllInputValues(rgb) {
    for (let dataColor in rgb) {
        let value = rgb[dataColor];
        rgb_syncInputValues(dataColor, value);
    }
}

function hsl_syncInputValues(dataColor, value) {
    hsl_inputs[dataColor].forEach((input) => (input.value = value));
}

function hsl_syncAllInputValues(hsl) {
    for (let dataColor in hsl) {
        let value = hsl[dataColor];
        hsl_syncInputValues(dataColor, value);
    }
}

// functions that do convertions
function buildHexValue({ r, g, b }) {
    return `${numToHex(r)}${numToHex(g)}${numToHex(b)}`;
}

function numToHex(number) {
    return number.toString(16).padStart(2, "0").toUpperCase();
}

function hexToNum(hex) {
    return parseInt(hex, 16);
}

// input  { r: 0~255, g:0~255, b:0~255 }
// output { h: 0~1, s:0~1, l:0~1 }
function rgbToHsl({ r, g, b }) {
    (r /= 255), (g /= 255), (b /= 255);
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    let h, s;
    if (max === min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return { h, s, l };
}

// input  { h: 0~1, s:0~1, l:0~1 }
// output { r: 0~255, g:0~255, b:0~255 }
function hslToRgb({ h, s, l }) {
    let r, g, b;

    if (s === 0) {
        r = g = b = Math.round(l * 255); // achromatic
    } else {
        const hueToRgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = Math.round(hueToRgb(p, q, h + 1 / 3) * 255);
        g = Math.round(hueToRgb(p, q, h) * 255);
        b = Math.round(hueToRgb(p, q, h - 1 / 3) * 255);
    }

    return { r, g, b };
}

// input  { h: 0~1, s:0~1, l:0~1 }
// output { h: 0~359, s:0~100, l:0~100 }
function hsl_output({ h, s, l }) {
    return { h: Math.round(h * 359), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// input  { h: 0~359, s:0~100, l:0~100 }
// output { h: 0~1, s:0~1, l:0~1 }
function hsl_input({ h, s, l }) {
    return { h: h / 359, s: s / 100, l: l / 100 };
}

// input  ({ r: 0~255, g:0~255, b:0~255 }, 0~359)
// output { r: 0~255, g:0~255, b:0~255 }
function getAdjustedColor(rgb, angle) {
    const hsl = hsl_output(rgbToHsl(rgb));
    const adjusted_hsl = colorAdjust(hsl, angle);
    const adjusted_rgb = hslToRgb(hsl_input(adjusted_hsl));
    return adjusted_rgb;
}

// input  { r: 0~255, g:0~255, b:0~255 }
// output 000000||FFFFFF
function getContrastColorHex({ r, g, b }) {
    const relativeLuminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    const contrastColor = relativeLuminance > 0.5 ? "000000" : "FFFFFF";
    return contrastColor;
}

function setContrastColor(hexColor) {
    contrast.style.color = `#${hexColor}`;
}

function colorAdjust(hsl, angle) {
    const _h = (hsl.h + angle) % 360;
    return {
        ...hsl,
        h: _h < 0 ? 360 + _h : _h,
    };
}

function colorLightness(hsl, light) {
    const _l = hsl.l + light;
    return { ...hsl, l: _l < 0 ? 0 : _l > 100 ? 100 : _l };
}

function buildPalate(size) {
    palateAngles[size].forEach((angle) => {
        const palateClone = palateTemplate.content.cloneNode(true);

        const palate = palateClone.querySelector("p.show-color");
        palate.classList.add(`palate-${angle}`);

        updatePalateColors(palateClone, colorData[angle]);

        palateOutput.appendChild(palateClone);
    });
}

function setAccentColor(hexColor) {
    $qa(`input[type="range"]`).forEach((range) => {
        range.style.accentColor = `#${hexColor}`;
    });
}

function addPalateOption(size) {
    const option = document.createElement("option");
    option.value = size;
    option.innerText = `${size} Colors`;
    palateSelect.appendChild(option);
}

function updatePalateColors(palateElement, color) {
    const very_lite = palateElement.querySelector("span.color-very-lite");
    very_lite.innerText = `#${color.very_lite.backgroundColor}`;
    very_lite.style.backgroundColor = `#${color.very_lite.backgroundColor}`;
    very_lite.style.color = `#${color.very_lite.color}`;

    const lite = palateElement.querySelector("span.color-lite");
    lite.innerText = `#${color.lite.backgroundColor}`;
    lite.style.backgroundColor = `#${color.lite.backgroundColor}`;
    lite.style.color = `#${color.lite.color}`;

    const norm = palateElement.querySelector("span.color-norm");
    norm.innerText = `#${color.norm.backgroundColor}`;
    norm.style.backgroundColor = `#${color.norm.backgroundColor}`;
    norm.style.color = `#${color.norm.color}`;

    const dark = palateElement.querySelector("span.color-dark");
    dark.innerText = `#${color.dark.backgroundColor}`;
    dark.style.backgroundColor = `#${color.dark.backgroundColor}`;
    dark.style.color = `#${color.dark.color}`;

    const very_dark = palateElement.querySelector("span.color-very-dark");
    very_dark.innerText = `#${color.very_dark.backgroundColor}`;
    very_dark.style.backgroundColor = `#${color.very_dark.backgroundColor}`;
    very_dark.style.color = `#${color.very_dark.color}`;
}

function storeAdjustedColor(rgb, angle) {
    const [narrow, wide] = colorWidth;
    const adjusted_hsl = angle === 0 ? hsl : colorAdjust(hsl, angle);
    const adjusted_rgb = angle === 0 ? rgb : hslToRgb(hsl_input(adjusted_hsl));
    const adjusted_hex = buildHexValue(adjusted_rgb);
    const color = colorData[angle];
    color.norm = {
        backgroundColor: `${adjusted_hex}`,
        color: `${getContrastColorHex(adjusted_rgb)}`,
    };

    const very_lite_rgb = hslToRgb(hsl_input(colorLightness(adjusted_hsl, wide)));
    const very_lite_hex = buildHexValue(very_lite_rgb);
    color.very_lite = {
        backgroundColor: `${very_lite_hex}`,
        color: `${getContrastColorHex(very_lite_rgb)}`,
    };

    const lite_rgb = hslToRgb(hsl_input(colorLightness(adjusted_hsl, narrow)));
    const lite_hex = buildHexValue(lite_rgb);
    color.lite = {
        backgroundColor: `${lite_hex}`,
        color: `${getContrastColorHex(lite_rgb)}`,
    };

    const dark_rgb = hslToRgb(hsl_input(colorLightness(adjusted_hsl, -narrow)));
    const dark_hex = buildHexValue(dark_rgb);
    color.dark = {
        backgroundColor: `${dark_hex}`,
        color: `${getContrastColorHex(dark_rgb)}`,
    };

    const very_dark_rgb = hslToRgb(hsl_input(colorLightness(adjusted_hsl, -wide)));
    const very_dark_hex = buildHexValue(very_dark_rgb);
    color.very_dark = {
        backgroundColor: `${very_dark_hex}`,
        color: `${getContrastColorHex(very_dark_rgb)}`,
    };

    const palate = palateOutput.querySelector(`p.palate-${angle}`);
    if (palate) {
        updatePalateColors(palate, color);
    }
}

function generateComplementaryColors(rgb) {
    angles.forEach((angle) => {
        storeAdjustedColor(rgb, angle);
    });
}
