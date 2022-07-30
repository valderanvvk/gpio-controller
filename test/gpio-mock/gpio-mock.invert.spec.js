"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const gpio_mock_1 = require("../../src/gpio/gpio-mock");
const button_1 = require("../../src/gpio/components/button");
describe('GpioMock invert(activeLow) functions', () => {
    it('[ activeLow() ] Creating invert pin SUCSESS', () => {
        const gpio = new gpio_mock_1.GpioMock(12, 'high', 'none', { activeLow: true });
        const check = gpio.activeLow();
        expect(check).toBe(true);
    });
    it('[ activeLow() ] Read sync invert pin SUCSESS', () => {
        const gpio = new gpio_mock_1.GpioMock(12, 'high', 'none', { activeLow: true });
        const check = gpio.readSync();
        expect(check).toBe(0);
    });
    it('[ activeLow() ] Read async invert pin SUCSESS', () => __awaiter(void 0, void 0, void 0, function* () {
        const gpio = new gpio_mock_1.GpioMock(12, 'high', 'none', { activeLow: true });
        const check = yield gpio.read();
        expect(check).toBe(0);
    }));
    it('[ activeLow() ] Read async with callback invert pin SUCSESS', () => __awaiter(void 0, void 0, void 0, function* () {
        const gpio = new gpio_mock_1.GpioMock(12, 'low', 'none', { activeLow: true });
        const testCallback = (err, value) => {
            expect(value).toBe(1);
        };
        yield gpio.read();
    }));
    it('[ activeLow() ] Write async with callback invert pin SUCSESS', () => __awaiter(void 0, void 0, void 0, function* () {
        const gpio = new gpio_mock_1.GpioMock(12, 'out', 'none', { activeLow: true });
        gpio.write(0);
        const testCallback = (err, value) => {
            expect(value).toBe(0);
        };
        yield gpio.read();
    }));
    it('[ activeLow() ] Read async with listener invert pin SUCSESS', () => __awaiter(void 0, void 0, void 0, function* () {
        const gpio = new gpio_mock_1.GpioMock(12, 'in', 'both', { activeLow: true });
        const button = new button_1.Button(gpio);
        const shouldBe = [gpio._edge_faling, gpio._edge_rising];
        const check = [];
        const testCallback = (err, value) => {
            check.push(value);
        };
        gpio.watch(testCallback);
        yield button.push();
        expect(check).toEqual(shouldBe);
    }));
});
