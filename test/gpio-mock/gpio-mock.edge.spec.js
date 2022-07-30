"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gpio_mock_1 = require("../../src/gpio/gpio-mock");
describe('GpioMock edge functions', () => {
    it('[ edge() ] Checking edge with direction SUCSESS', () => {
        const shouldBe = [
            ['out', 'none'],
            ['in', 'both'],
            ['in', 'falling'],
            ['in', 'rising'],
            ['in', 'none'],
        ];
        const gpio1 = new gpio_mock_1.GpioMock(12, 'out', 'both');
        const gpio2 = new gpio_mock_1.GpioMock(13, 'in', 'both');
        const gpio3 = new gpio_mock_1.GpioMock(14, 'in', 'falling');
        const gpio4 = new gpio_mock_1.GpioMock(2, 'in', 'rising');
        const gpio5 = new gpio_mock_1.GpioMock(3, 'in');
        const check1 = [gpio1.direction(), gpio1.edge()];
        const check2 = [gpio2.direction(), gpio2.edge()];
        const check3 = [gpio3.direction(), gpio3.edge()];
        const check4 = [gpio4.direction(), gpio4.edge()];
        const check5 = [gpio5.direction(), gpio5.edge()];
        const forCheck = [check1, check2, check3, check4, check5];
        expect(forCheck).toEqual(shouldBe);
    });
    it('[ setEdge() ] Checking setEddge with direction SUCSESS', () => {
        const shouldBe = [
            ['out', 'none'],
            ['in', 'both'],
            ['in', 'falling'],
            ['in', 'rising'],
            ['in', 'none'],
        ];
        const gpio = new gpio_mock_1.GpioMock(12, 'out', 'falling');
        const check1 = [gpio.direction(), gpio.edge()];
        gpio.setDirection('in');
        gpio.setEdge('both');
        const check2 = [gpio.direction(), gpio.edge()];
        gpio.setEdge('falling');
        const check3 = [gpio.direction(), gpio.edge()];
        gpio.setEdge('rising');
        const check4 = [gpio.direction(), gpio.edge()];
        gpio.setEdge('none');
        const check5 = [gpio.direction(), gpio.edge()];
        const forCheck = [check1, check2, check3, check4, check5];
        expect(forCheck).toEqual(shouldBe);
    });
});
