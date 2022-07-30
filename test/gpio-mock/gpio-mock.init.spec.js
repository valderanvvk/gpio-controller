"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gpio_mock_1 = require("../../src/gpio/gpio-mock");
const led13 = {
    gpio: 13,
    direction: 'out',
};
const button2 = {
    gpio: 2,
    direction: 'in',
    edge: 'both',
};
describe('GpioMock Initialize', () => {
    it('Direction out', () => {
        const { gpio, direction } = led13;
        const checkResult = {
            _listeners: [],
            _gpio: 13,
            _direction: 'out',
            _value: 0,
            _edge: 'none',
            _unexport: false,
            _activeLow: false,
            _edge_rising: 1,
            _edge_faling: 0,
            _write_in_direction_mode: false,
        };
        const outPin = new gpio_mock_1.GpioMock(gpio, direction);
        expect(outPin).toEqual(checkResult);
    });
    it('Direction out high', () => {
        const { gpio } = led13;
        const checkResult = {
            _listeners: [],
            _gpio: 13,
            _direction: 'high',
            _value: 1,
            _edge: 'none',
            _unexport: false,
            _activeLow: false,
            _edge_rising: 1,
            _edge_faling: 0,
            _write_in_direction_mode: false,
        };
        const outPin = new gpio_mock_1.GpioMock(gpio, 'high');
        expect(outPin).toEqual(checkResult);
    });
    it('Direction out low', () => {
        const { gpio } = led13;
        const checkResult = {
            _listeners: [],
            _gpio: 13,
            _direction: 'low',
            _value: 0,
            _edge: 'none',
            _unexport: false,
            _activeLow: false,
            _edge_rising: 1,
            _edge_faling: 0,
            _write_in_direction_mode: false,
        };
        const outPin = new gpio_mock_1.GpioMock(gpio, 'low');
        expect(outPin).toEqual(checkResult);
    });
    it('Direction in both', () => {
        const { gpio, direction, edge } = button2;
        const checkResult = {
            _listeners: [],
            _gpio: 2,
            _direction: 'in',
            _value: 1,
            _edge: 'both',
            _unexport: false,
            _activeLow: false,
            _edge_rising: 1,
            _edge_faling: 0,
            _write_in_direction_mode: false,
        };
        const outPin = new gpio_mock_1.GpioMock(gpio, direction, edge);
        expect(outPin).toEqual(checkResult);
    });
});
