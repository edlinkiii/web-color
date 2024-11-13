import ColorConverter from "./ColorConverter.js";

export default class WebColor {
    #colors = ['x','r','g','b','h','s','l','c','m','y','k'];
    #colorGroups = {
        RGB: ['r','g','b'],
        HEX: ['x'],
        HSL: ['h','s','l'],
        CMYK: ['c','m','y','k'],
    };
    #values = {};
    #elements = {};
    #bodyElement = document.querySelector("body");

    constructor(config = null) {
        this.cc = new ColorConverter();

        if(config) {
            this.config = config;
            this.#colors.forEach((color) => {
                config.elements[color] && this.setupElement(color)
            });
    
            this.setupListeners();
        }

        return this;
    }

    setupElement(color) {
        this.#elements[color] = this.config.elements[color];
        this.#elements[color].forEach((element) => (element.dataset['colorpicker'] = color));
        if(color === "x") {
            this.#values.x = [...this.#elements.x].reduce((ret, el) => {
                const val = el.value;
                ret = ret > val ? ret : val;
                return ret;
            },"0");
            this.#values.x && this.setBackgroundColor();
        } else {
            this.#values[color] = Math.max(...[...this.#elements[color]].map((element) => element.value));
            if(this.#values[color] && (this.#values[color] !== 0 || this.#values[color] !== "0")) {
                this.recalculateValues(color);
            } else {
                this.setBackgroundColor();
            }
        }
    }

    setupListeners() {
        Object.values(this.#elements).forEach((elements) => elements.forEach((el) => el.addEventListener("input", (evt) => {
            const element = evt.target;
            const value = element.value;
            const color = element.dataset['colorpicker'];
            this.updateInput(color, value);
            this.onChange(color, value);
        })))
    }

    onChange(key, value) {
        this.#values[key] = key === "x" ? value : parseInt(value);

        this.recalculateValues(key);
    }

    getGroupValues(group) {
        return this.#colorGroups[group].reduce((obj, color) => {
            obj[color] = this.#values[color];
            return obj;
        }, {});
    }

    recalculateValues(changedColor) {
        let updateObj = {};

        if(this.#colorGroups.RGB.includes(changedColor)) {
            const rgb  = this.getGroupValues(`RGB`);
            if(!rgb) return;
            const hex  = this.cc.convertRGBtoHEX(rgb);
            if(!hex) return;
            const hsl  = this.cc.convertRGBtoHSL(rgb);
            if(!hsl) return;
            const cmyk = this.cc.convertRGBtoCMYK(rgb);
            if(!cmyk) return;

            updateObj = {...hex, ...hsl, ...cmyk};
        }

        if(this.#colorGroups.HEX.includes(changedColor)) {
            const hex  = this.getGroupValues(`HEX`);
            if(!hex) return;
            const rgb  = this.cc.convertHEXtoRGB(hex);
            if(!rgb) return;
            const hsl  = this.cc.convertRGBtoHSL(rgb);
            if(!hsl) return;
            const cmyk = this.cc.convertRGBtoCMYK(rgb);
            if(!cmyk) return;

            updateObj = {...rgb, ...hsl, ...cmyk};
        }

        if(this.#colorGroups.HSL.includes(changedColor)) {
            const hsl  = this.getGroupValues(`HSL`);
            if(!hsl) return;
            const rgb  = this.cc.convertHSLtoRGB(hsl);
            if(!rgb) return;
            const hex  = this.cc.convertRGBtoHEX(rgb);
            if(!hex) return;
            const cmyk = this.cc.convertRGBtoCMYK(rgb);
            if(!cmyk) return;

            updateObj = {...rgb, ...hex, ...cmyk};
        }

        if(this.#colorGroups.CMYK.includes(changedColor)) {
            const cmyk = this.getGroupValues(`CMYK`);
            if(!cmyk) return;
            const rgb  = this.cc.convertCMYKtoRGB(cmyk);
            if(!rgb) return;
            const hex  = this.cc.convertRGBtoHEX(rgb);
            if(!hex) return;
            const hsl  = this.cc.convertRGBtoHSL(rgb);
            if(!hsl) return;

            updateObj = {...rgb, ...hex, ...hsl};
        }

        this.updateValues(updateObj);
        this.updateInputs(updateObj);
        this.setBackgroundColor();
        this.accentColor_HSL();
    }

    setBackgroundColor() {
        this.#bodyElement.style.backgroundColor = `#${this.#values.x}`;
    }

    updateValues(obj) {
        Object.entries(obj).forEach(([color, value]) => (this.#values[color] = value));
    }

    updateInputs(obj) {
        Object.entries(obj).forEach(([color, value]) => this.updateInput(color, value));
    }

    updateInput(color, value) {
        this.#elements[color].forEach((element) => (element.value = value));
    }

    accentColor_HSL() {
        const accent = {
            h: (hsl) => `hsl(${hsl.h}, 100%, 50%)`,
            s: (hsl) => `hsl(${hsl.h}, ${hsl.s}%, 50%)`,
            l: (hsl) => `hsl(${hsl.h}, 100%, ${hsl.l}%)`,
        }

        const hsl = this.#colorGroups.HSL.reduce((obj, color) => {
            obj[color] = this.#values[color];
            return obj;
        }, {});

        this.#colorGroups.HSL.forEach((color) => {
            const sliders = [...this.#elements[color]].filter((slider) => slider.type === "range");
            sliders.forEach((slider) => {
                slider.style.accentColor = accent[color](hsl);
            });
        })
    }
}
