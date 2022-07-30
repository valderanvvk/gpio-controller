"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gpio_mock_1 = require("../../src/gpio/gpio-mock");
describe('GpioMock direction functions', () => {
    it('[ direction() ] Checking Pin Directions and Values SUCSESS', () => {
        const shouldBe = [
            ['out', 1],
            ['out', 0],
            ['out', 0],
            ['in', 1],
        ];
        const gpio1 = new gpio_mock_1.GpioMock(12, 'high');
        const gpio2 = new gpio_mock_1.GpioMock(13, 'low');
        const gpio3 = new gpio_mock_1.GpioMock(14, 'out');
        const gpio4 = new gpio_mock_1.GpioMock(2, 'in');
        const check1 = [gpio1.direction(), gpio1.readSync()];
        const check2 = [gpio2.direction(), gpio2.readSync()];
        const check3 = [gpio3.direction(), gpio3.readSync()];
        const check4 = [gpio4.direction(), gpio4.readSync()];
        const forCheck = [check1, check2, check3, check4];
        expect(forCheck).toEqual(shouldBe);
    });
    it('[ setDirection() ] Checking Pin Directions and Values with setDirect SUCSESS', () => {
        const shouldBe = [
            ['out', 1],
            ['out', 0],
            ['out', 0],
            ['in', 1],
        ];
        const gpio = new gpio_mock_1.GpioMock(13, 'high');
        const check1 = [gpio.direction(), gpio.readSync()];
        gpio.setDirection('low');
        const check2 = [gpio.direction(), gpio.readSync()];
        gpio.setDirection('out');
        const check3 = [gpio.direction(), gpio.readSync()];
        gpio.setDirection('in');
        const check4 = [gpio.direction(), gpio.readSync()];
        const forCheck = [check1, check2, check3, check4];
        expect(forCheck).toEqual(shouldBe);
    });
});
