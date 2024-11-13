export default class ColorConverter {
    constructor() {
        return this;
    }

    convertHEXtoRGB(hex) {
        const hexToNum = (hex) => parseInt(hex, 16);
        const hexValues = (hex) => hex.match(/[0-9a-fA-F]{2}/g) || [];

        try {
            const hexValueArray = hexValues(typeof hex === "string" ? hex : hex.x);

            if (hexValueArray?.length !== 3) {
                return undefined;
            }

            const rgb = {};
            ['r','g','b'].forEach((color, i) => {
                rgb[color] = hexToNum(hexValueArray[i]);
            });

            return rgb;
        } catch (e) {
            console.error(e);
            return null;
        }
    }
    static ConvertHEXtoRGB(hex) {
        const that = new WebColor();
        return that.convertHEXtoRGB(hex);
    }

    convertRGBtoHEX(rgb) {
        const numToHex = (num) => parseInt(num).toString(16).padStart(2, "0").toUpperCase();

        try {
            const RR = numToHex(rgb.r);
            const GG = numToHex(rgb.g);
            const BB = numToHex(rgb.b);

            const hex = { x: `${RR}${GG}${BB}` };

            return hex;
        } catch (e) {
            console.error(e);
            return null;
        }
    }
    static ConvertRGBtoHEX(rgb) {
        const that = new WebColor();
        return that.convertRGBtoHEX(rgb);
    }

    convertHSLtoRGB(hsl) {
        const hslInput = ({ h, s, l }) => ({ h: h / 359, s: s / 100, l: l / 100 });
        const rgbOutput = ({ r, g, b }) => ({ r: this.round(r * 255), g: this.round(g * 255), b: this.round(b * 255) });
        const hueToRgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        try {
            const { h, s, l } = hslInput(hsl);
        
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
    
            const rgb = rgbOutput({
                r: hueToRgb(p, q, h + 1 / 3),
                g: hueToRgb(p, q, h),
                b: hueToRgb(p, q, h - 1 / 3),
            });
    
            return rgb;
        } catch (e) {
            console.error(e);
            return null;
        }
    }
    static ConvertHSLtoRGB(hsl) {
        const that = new WebColor();
        return that.convertHSLtoRGB(hsl);
    }

    convertRGBtoHSL(rgb) {
        const rgbInput = ({ r, g, b }) => ({ r: r / 255, g: g / 255, b: b / 255 });
        const hslOutput = ({ h, s, l }) => ({ h: this.round(h * 359), s: this.round(s * 100), l: this.round(l * 100) });

        try {
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
        
            const hsl = hslOutput({ h, s, l });

            return hsl;
        } catch (e) {
            console.error(e);
            return null;
        }
    }
    static ConvertRGBtoHSL(rgb) {
        const that = new WebColor();
        return that.convertRGBtoHSL(rgb);
    }

    convertCMYKtoRGB(cmyk) {
        try {
            const c = cmyk.c / 100;
            const m = cmyk.m / 100;
            const y = cmyk.y / 100;
            const k = cmyk.k / 100;

            const rgb = {
                r: this.round(255 * (1 - c) * (1 - k)),
                g: this.round(255 * (1 - m) * (1 - k)),
                b: this.round(255 * (1 - y) * (1 - k)),
            }
    
            return rgb;
        } catch (e) {
            console.error(e);
            return null;
        }
    }
    static ConvertCMYKtoRGB(cmyk) {
        const that = new WebColor();
        return that.convertCMYKtoRGB(cmyk);
    }

    convertRGBtoCMYK(rgb) {
        try {
            const r = rgb.r / 255;
            const g = rgb.g / 255;
            const b = rgb.b / 255;

            const k = 1 - Math.max(r, g, b);
            const c = (1 - r - k) / (1 - k);
            const m = (1 - g - k) / (1 - k);
            const y = (1 - b - k) / (1 - k);

            const cmyk = { c, m, y, k };

            Object.entries(cmyk).forEach(([color, val]) => {
                const value = this.round(val * 100);
                cmyk[color] = value;
            });

            return cmyk;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
    static ConvertRGBtoCMYK(rgb) {
        const that = new WebColor();
        return that.convertRGBtoCMYK(rgb);
    }

    round(num) {
        return Math.round(num);
    }
}

// // This is all theoretical planning stuff
// const colorConverter = new ColorConverter();

// let from = colorConverter.inHSL({ h, s, l });
// let to = colorConverter.outRGB();
// let adjustmentObj = {
//     s: 10,
//     l: -10,
//     c: 20,
//     r: -10,
// }

// let newColor = colorConverter.convert(from, to, adjustmentObj);

// function convert(colorIn = {}, colorOut = "RGB", colorAdjust = {}) {
//     const inKeys = Object.keys(colorIn);
//     if(inKeys.length <= 0) throw "Invalid colorIn value";

//     const outKeys = Object.keys(colorOut);
//     if(outKeys.length <= 0) throw "Invalid colorOut value";

//     const adjKeys = Object.keys(colorOut);
// }
