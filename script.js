// helper functions to shorten syntax
const $q = (singleSelector) => document.querySelector(singleSelector);
const $qa = (multiSelector) => document.querySelectorAll(multiSelector);

// define element variables
const output = $q("body");
const hexInput = $q("#hex");
const rgbInputs = {
    r: $qa("input[data-color='r']"),
    g: $qa("input[data-color='g']"),
    b: $qa("input[data-color='b']"),
};
const rgbInputArray = [...rgbInputs.r, ...rgbInputs.g, ...rgbInputs.b];
const hslInputs = {
    h: $qa("input[data-color='h']"),
    s: $qa("input[data-color='s']"),
    l: $qa("input[data-color='l']"),
};
const hslInputArray = [...hslInputs.h, ...hslInputs.s, ...hslInputs.l];
const palateOutput = $q("#palate-output");
const palateTemplate = $q("#show-color");
const palateSelect = $q("select#palate-select");

// setup
const BLACK = "000000";
const WHITE = "FFFFFF";
const angleArray = [0];
const palateAngles = {};
const palates = [2, 3, 4, 5, 6, 8, 10, 12, 15, 18, 20];
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
rgbSyncAllInputValues(rgb);

const hsl = { h: 0, s: 0, l: 0 };
hslSyncAllInputValues(hsl);

const hex = BLACK;
updateDisplay(rgb, hex)

// create event listeners
rgbInputArray.forEach((input) => input.addEventListener("input", rgbHandleColorInput));

hslInputArray.forEach((input) => input.addEventListener("input", hslHandleColorInput));

hexInput.addEventListener("input", ({ target: { value: hex } }) => hexHandleInput(hex));

palateSelect.addEventListener("change", ({ target: { value: palateSize } }) => {
    palateOutput.querySelectorAll("p").forEach((p) => p.remove());
    palateSize && buildPalate(palateSize);
});

// handle (color adjust) slider input events
function rgbHandleColorInput({ target }) {
    const { value, max, min, dataset: { color } } = target;
    const colorValue = parseInt(+value > +max ? max : +value < +min ? min : value);
    rgb[color] = colorValue;
    rgbSyncInputValues(color, colorValue);
    hslSyncAllInputValues(hslUpdate(rgbToHsl(rgb)));
    updateDisplay(rgb);
}

function hslHandleColorInput({ target }) {
    const { value, max, min, dataset: { color } } = target;
    const colorValue = parseInt(+value > +max ? max : +value < +min ? min : value);
    hsl[color] = colorValue;
    hslSyncInputValues(color, colorValue);
    rgbSyncAllInputValues(rgbUpdate(hslToRgb(hsl)));
    updateDisplay(rgb);
}

// handle (hex) text input event
function hexHandleInput(hex) {
    const hexValues = hex.match(/[0-9a-fA-F]{2}/g);
    if (hexValues?.length === 3) {
        Object.keys(rgb).forEach((color, i) => (rgb[color] = hexToNum(hexValues[i])));
        rgbSyncAllInputValues(rgb);
        hslSyncAllInputValues(hslUpdate(rgbToHsl(rgb)));
        updateDisplay(rgb, hex)
    }
}

function updateDisplay(rgb, hex = null) {
    const hexValue = hex ?? rgbToHex(rgb);
    setBackgroundColor(hexValue);
    setAccentColor(hexValue);
    hex || displayHexValue(hexValue);
    generateComplementaryColors(rgb);
}

function generateComplementaryColors(rgb) {
    angles.forEach((angle) => {
        storeAdjustedColor(rgb, angle);
    });
}

// update code rgb/hsl values
function rgbUpdate({ r, g, b }) {
    rgb.r = r;
    rgb.g = g;
    rgb.b = b;
    return rgb;
}

function hslUpdate({ h, s, l }) {
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
    hexInput.value = `${hexValue}`;
}

function rgbSyncInputValues(dataColor, value) {
    rgbInputs[dataColor].forEach((input) => (input.value = value));
}

function rgbSyncAllInputValues(rgb) {
    for (let dataColor in rgb) {
        let value = rgb[dataColor];
        rgbSyncInputValues(dataColor, value);
    }
}

function hslSyncInputValues(dataColor, value) {
    hslInputs[dataColor].forEach((input) => (input.value = value));
}

function hslSyncAllInputValues(hsl) {
    for (let dataColor in hsl) {
        let value = hsl[dataColor];
        hslSyncInputValues(dataColor, value);
    }
}

function setAccentColor(hexColor) {
    $qa(`input[type="range"]`).forEach((range) => {
        range.style.accentColor = `#${hexColor}`;
    });
}

function updatePalateColors(palateElement, color) {
    const shades = ["verylite", "lite", "norm", "dark", "verydark"];
    shades.forEach((shade) => {
        const shadeElement = palateElement.querySelector(`span.color-${shade}`);
        shadeElement.innerText = `#${color[shade].backgroundColor}`;
        shadeElement.style.backgroundColor = `#${color[shade].backgroundColor}`;
        shadeElement.style.color = `#${color[shade].color}`;
    })
}

function storeAdjustedColor(rgb, angle) {
    const [narrow, wide] = colorWidth;
    const hslAdjusted = angle === 0 ? hsl : colorAdjust(hsl, angle);
    const rgbAdjusted = angle === 0 ? rgb : hslToRgb(hslAdjusted);
    const hexAdjusted = rgbToHex(rgbAdjusted);
    const color = colorData[angle];
    color.norm = {
        backgroundColor: `${hexAdjusted}`,
        color: `${getContrastColorHex(rgbAdjusted)}`,
    };

    const shades = [
        ["verylite", wide],
        ["lite", narrow],
        ["dark", -narrow],
        ["verydark", -wide],
    ];
    shades.forEach(([shadeName, shadeValue]) => {
        const rgb = hslToRgb(colorLightness(hslAdjusted, shadeValue));
        const hex = rgbToHex(rgb);
        color[shadeName] = {
            backgroundColor: `${hex}`,
            color: `${getContrastColorHex(rgb)}`,
        };
    })

    const palate = palateOutput.querySelector(`p.palate-${angle}`);
    if (palate) {
        updatePalateColors(palate, color);
    }
}

// functions that do convertions
function rgbToHex({ r, g, b }) {
    return `${numToHex(r)}${numToHex(g)}${numToHex(b)}`;
}

function numToHex(number) {
    return number.toString(16).padStart(2, "0").toUpperCase();
}

function hexToNum(hex) {
    return parseInt(hex, 16);
}

function rgbToHsl(rgb) {
    const rgbInput = ({ r, g, b }) => ({ r: r / 255, g: g / 255, b: b / 255 });
    const hslOutput = ({ h, s, l }) => ({ h: round(h * 359), s: round(s * 100), l: round(l * 100) });
    const { r, g, b } = rgbInput(rgb);
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

    return hslOutput({ h, s, l });
}

function hslToRgb(hsl) {
    const hslInput = ({ h, s, l }) => ({ h: h / 359, s: s / 100, l: l / 100 });
    const rgbOutput = ({ r, g, b }) => ({ r: round(r * 255), g: round(g * 255), b: round(b * 255) });
    const hueToRgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };

    const { h, s, l } = hslInput(hsl);

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    const r = hueToRgb(p, q, h + 1 / 3);
    const g = hueToRgb(p, q, h);
    const b = hueToRgb(p, q, h - 1 / 3);

    return rgbOutput({ r, g, b });
}

function getAdjustedColor(rgb, angle) {
    const hsl = rgbToHsl(rgb);
    const hslAdjusted = colorAdjust(hsl, angle);
    const rgbAdjusted = hslToRgb(hslAdjusted);
    return rgbAdjusted;
}

function getContrastColorHex({ r, g, b }) {
    const relativeLuminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    const contrastColor = relativeLuminance > 0.5 ? BLACK : WHITE;
    return contrastColor;
}

function setContrastColor(hexColor) {
    contrast.style.color = `#${hexColor}`;
}

function colorAdjust(hsl, angle) {
    const h = (hsl.h + angle) % 360;
    return {
        ...hsl,
        h: h < 0 ? 360 + h : h,
    };
}

function colorLightness(hsl, diff) {
    const l = hsl.l + diff;
    return { ...hsl, l: l < 0 ? 0 : l > 100 ? 100 : l };
}

// functions that modify the DOM
function buildPalate(size) {
    palateAngles[size].forEach((angle) => {
        const palateClone = palateTemplate.content.cloneNode(true);

        const palate = palateClone.querySelector("p.show-color");
        palate.classList.add(`palate-${angle}`);

        updatePalateColors(palate, colorData[angle]);

        palateOutput.appendChild(palateClone);
    });
}

function addPalateOption(size) {
    const option = document.createElement("option");
    option.value = size;
    option.innerText = `${size} Colors`;
    palateSelect.appendChild(option);
}

// utility functions
function round(num) {
    return Math.round(num);
}
