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
describe('GpioMock watch functions', () => {
    it('[ watch() ] Add callback SUCSESS', () => {
        const gpio13 = new gpio_mock_1.GpioMock(13, 'in', 'rising');
        const callback = (err, value) => { };
        const checkBeforeAddCallback = gpio13._listeners.length;
        gpio13.watch(callback);
        const checkAfterAddCallBAck = [checkBeforeAddCallback, gpio13._listeners.length];
        expect(checkAfterAddCallBAck).toEqual([0, 1]);
    });
    it('[ watch() ] check call callback SUCSESS', () => __awaiter(void 0, void 0, void 0, function* () {
        const gpio13 = new gpio_mock_1.GpioMock(13, 'in', 'falling');
        const button = new button_1.Button(gpio13);
        const callback = (err, value) => {
            expect(value).toBe(0);
        };
        gpio13.watch(callback);
        yield button.push();
    }));
    it('[ watch() ] (button press) Edge="Both" 2 cals callback SUCSESS', () => __awaiter(void 0, void 0, void 0, function* () {
        const gpio13 = new gpio_mock_1.GpioMock(13, 'in', 'both');
        const button = new button_1.Button(gpio13);
        let i = 0;
        const callback = (err, value) => {
            i++;
        };
        gpio13.watch(callback);
        yield button.push();
        expect(i).toBe(2);
    }));
    it('[ unwatch() ] call deletion check from listeners list SUCSESS', () => {
        const gpio13 = new gpio_mock_1.GpioMock(13, 'in', 'rising');
        const callback = (err, value) => { };
        gpio13.watch(callback);
        const checkBeforeAddCallback = gpio13._listeners.length;
        gpio13.unwatch(callback);
        const checkAfterAddCallBAck = [checkBeforeAddCallback, gpio13._listeners.length];
        expect(checkAfterAddCallBAck).toEqual([1, 0]);
    });
    it('[ unwatch() ] 2 cals callback before and after unwatch, should be called 1 time', () => __awaiter(void 0, void 0, void 0, function* () {
        const gpio13 = new gpio_mock_1.GpioMock(13, 'in', 'rising');
        const button = new button_1.Button(gpio13);
        let i = 0;
        const callback = (err, value) => {
            i++;
        };
        gpio13.watch(callback);
        yield button.push();
        gpio13.unwatch(callback);
        yield button.push();
        expect(i).toBe(1);
    }));
    it('[ unwatchAll() ] call deletion check all from listeners list SUCSESS', () => {
        const gpio13 = new gpio_mock_1.GpioMock(13, 'in', 'rising');
        const callback1 = (err, value) => { };
        const callback2 = (err, value) => { };
        const checkBeforeAddCallback = gpio13._listeners.length;
        gpio13.watch(callback1);
        gpio13.watch(callback2);
        const checkAfterAddCallback = gpio13._listeners.length;
        gpio13.unwatchAll();
        const check = [checkBeforeAddCallback, checkAfterAddCallback, gpio13._listeners.length];
        expect(check).toEqual([0, 2, 0]);
    });
});
