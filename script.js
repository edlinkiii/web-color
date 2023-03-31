// helper functions to shorten syntax
const $q = (singleSelector) => document.querySelector(singleSelector);
const $qa = (multiSelector) => document.querySelectorAll(multiSelector);

// define element variables
const output = $q("body");
const hex = $q("#hex");
const rgb_inputs = {
  r: $qa("input[data-color='r']"),
  g: $qa("input[data-color='g']"),
  b: $qa("input[data-color='b']")
};
const hsl_inputs = {
  h: $qa("input[data-color='h']"),
  s: $qa("input[data-color='s']"),
  l: $qa("input[data-color='l']")
};

// set and display defaults
const rgb = { r: 0, g: 0, b: 0 };
rgb_syncAllInputValues(rgb)

const hsl = { h: 0, s: 0, l: 0 };
hsl_syncAllInputValues(hsl)

const rgbHex = buildHexValue(rgb);
setBackgroundColor(rgbHex);
displayHexValue(rgbHex);

// create event listeners
[...rgb_inputs.r, ...rgb_inputs.g, ...rgb_inputs.b].forEach((input) => {
  input.addEventListener("input", rgb_handleColorInput);
});

[...hsl_inputs.h, ...hsl_inputs.s, ...hsl_inputs.l].forEach((input) => {
  input.addEventListener("input", hsl_handleColorInput);
});

hex.addEventListener("input", handleHexInput);

// handle (color adjust) slider input events
function rgb_handleColorInput(evt) {
  const { target: { value, max, min, dataset: { color } } } = evt;
  const colorValue = parseInt(+value > +max ? max : +value < +min ? min : value);
  rgb[color] = colorValue;
  rgb_syncInputValues(color, colorValue);
  const hexValue = buildHexValue(rgb);
  setBackgroundColor(hexValue);
  displayHexValue(hexValue);
  hsl_syncAllInputValues(update_hsl(hsl_output(rgbToHsl(rgb))));
}

function hsl_handleColorInput(evt) {
  const { target: { value, max, min, dataset: { color } } } = evt;
  const colorValue = parseInt(+value > +max ? max : +value < +min ? min : value);
  hsl[color] = colorValue;
  hsl_syncInputValues(color, colorValue);
  rgb_syncAllInputValues(update_rgb(hslToRgb(hsl_input(hsl))));
  const hexValue = buildHexValue(rgb);
  setBackgroundColor(hexValue);
  displayHexValue(hexValue);
}

// handle (hex) text input event
function handleHexInput({ target: { value } }) {
  const values = value.match(/[0-9a-fA-F]{2}/g);
  if (values?.length === 3) {
    setBackgroundColor(value);
    Object.keys(rgb).forEach((color, i) => (rgb[color] = hexToNum(values[i])));
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
  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h,
    s,
    l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
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
function hslToRgb({h, s, l}) {
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
