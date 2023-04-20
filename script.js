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
const hsl_inputs = {
    h: $qa("input[data-color='h']"),
    s: $qa("input[data-color='s']"),
    l: $qa("input[data-color='l']"),
};

// set and display defaults
const rgb = { r: 0, g: 0, b: 0 };
rgb_syncAllInputValues(rgb);

const hsl = { h: 0, s: 0, l: 0 };
hsl_syncAllInputValues(hsl);

const rgbHex = buildHexValue(rgb);
setBackgroundColor(rgbHex);
displayComplementaryColors(rgb);
displayHexValue(rgbHex);

// create event listeners
[...rgb_inputs.r, ...rgb_inputs.g, ...rgb_inputs.b].forEach((input) => {
    input.addEventListener("input", rgb_handleColorInput);
});

[...hsl_inputs.h, ...hsl_inputs.s, ...hsl_inputs.l].forEach((input) => {
    input.addEventListener("input", hsl_handleColorInput);
});

$qa(".show-color > span").forEach((el) => {
    el.addEventListener("click", ({ target }) => {
        console.log(`#${target.dataset.hex}`);
        // hex.value = target.dataset.hex;
        // handleHexInput(target.dataset.hex);
    });
});

hex.addEventListener("input", ({ target: { value } }) => {
    handleHexInput(value);
});

$q("#palate-select").addEventListener("change", ({ target }) => {
    $qa(".color-palate").forEach((palate) => (palate.style.display = "none"));
    const pNum = target.value;
    if (pNum) $q(`div#palate-${pNum}`).style.display = "block";
});

// handle (color adjust) slider input events
function rgb_handleColorInput(evt) {
    const {
        target: {
            value,
            max,
            min,
            dataset: { color },
        },
    } = evt;
    const colorValue = parseInt(+value > +max ? max : +value < +min ? min : value);
    rgb[color] = colorValue;
    rgb_syncInputValues(color, colorValue);
    const hexValue = buildHexValue(rgb);
    setBackgroundColor(hexValue);
    displayComplementaryColors(rgb);
    displayHexValue(hexValue);
    hsl_syncAllInputValues(update_hsl(hsl_output(rgbToHsl(rgb))));
}

function hsl_handleColorInput(evt) {
    const {
        target: {
            value,
            max,
            min,
            dataset: { color },
        },
    } = evt;
    const colorValue = parseInt(+value > +max ? max : +value < +min ? min : value);
    hsl[color] = colorValue;
    hsl_syncInputValues(color, colorValue);
    rgb_syncAllInputValues(update_rgb(hslToRgb(hsl_input(hsl))));
    const hexValue = buildHexValue(rgb);
    setBackgroundColor(hexValue);
    displayComplementaryColors(rgb);
    displayHexValue(hexValue);
}

// handle (hex) text input event
function handleHexInput(value) {
    const values = value.match(/[0-9a-fA-F]{2}/g);
    if (values?.length === 3) {
        setBackgroundColor(value);
        Object.keys(rgb).forEach((color, i) => (rgb[color] = hexToNum(values[i])));
        displayComplementaryColors(rgb);
        rgb_syncAllInputValues(rgb);
        hsl_syncAllInputValues(update_hsl(hsl_output(rgbToHsl(rgb))));
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

function setAdjustedColor(rgb, angle) {
    const hsl = hsl_output(rgbToHsl(rgb));
    const adjusted_hsl = angle === 0 ? hsl : colorAdjust(hsl, angle);
    const adjusted_rgb = angle === 0 ? rgb : hslToRgb(hsl_input(adjusted_hsl));
    const adjusted_hex = buildHexValue(adjusted_rgb);
    const els = $qa(`.comp-${angle}`);
    els.forEach((el) => {
        const lite = el.querySelector(".color-lite");
        const norm = el.querySelector(".color-norm");
        const dark = el.querySelector(".color-dark");
        const lite_rgb = hslToRgb(hsl_input(colorLightness(adjusted_hsl, 15)));
        const lite_hex = buildHexValue(lite_rgb);
        const dark_rgb = hslToRgb(hsl_input(colorLightness(adjusted_hsl, -15)));
        const dark_hex = buildHexValue(dark_rgb);
        norm.style.backgroundColor = `#${adjusted_hex}`;
        norm.style.color = `#${getContrastColorHex(adjusted_rgb)}`;
        norm.dataset.hex = `${adjusted_hex}`;
        // norm.innerText = `${angle}°`; // `${angle}° #${adjusted_hex}`;
        norm.innerText = `#${adjusted_hex}`;

        lite.style.backgroundColor = `#${lite_hex}`;
        lite.style.color = `#${getContrastColorHex(lite_rgb)}`;
        lite.dataset.hex = `${lite_hex}`;
        lite.innerText = `#${lite_hex}`;

        dark.style.backgroundColor = `#${dark_hex}`;
        dark.style.color = `#${getContrastColorHex(dark_rgb)}`;
        dark.dataset.hex = `${dark_hex}`;
        dark.innerText = `#${dark_hex}`;
    });
}

function displayComplementaryColors(rgb) {
    const angles = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330];

    angles.forEach((angle) => {
        setAdjustedColor(rgb, angle);
    });
}

// input  { r: 0~255, g:0~255, b:0~255 }
// output 000000||FFFFFF
function getContrastColorHex({ r, g, b }) {
    const relativeLuminance = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
    const contrastColor = relativeLuminance > 0.5 ? "000000" : "FFFFFF";
    return contrastColor;
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
