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
const led13 = {
    gpio: 13,
    direction: 'high',
};
let gpio13;
describe('GpioMock Read functions', () => {
    beforeAll(() => {
        const { gpio, direction } = led13;
        gpio13 = new gpio_mock_1.GpioMock(gpio, direction);
    });
    it('[ read() ] Read Async without callback SUCSESS', () => __awaiter(void 0, void 0, void 0, function* () {
        const checkValue = yield gpio13.read();
        expect(checkValue).toBe(1);
    }));
    it('[ read() ] Read Async with callback SUCSESS', () => __awaiter(void 0, void 0, void 0, function* () {
        const callback = (err, value) => {
            expect(value).toBe(1);
        };
        yield gpio13.read(callback);
    }));
    it('[ read() ] Read Async with callback Error SUCSESS', () => __awaiter(void 0, void 0, void 0, function* () {
        const callback = (err, value) => {
            if (err instanceof Error) {
                expect(err.message).toEqual('test error');
            }
        };
        yield gpio13.read(callback, new Error('test error'));
    }));
    it('[ read() ] Read Async with UNEXPORT PIN Error SUCSESS', () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const callback = (err, value) => { };
            const testPin = new gpio_mock_1.GpioMock(12, 'high');
            testPin.unexport();
            yield testPin.read(callback);
        }
        catch (error) {
            if (error instanceof Error) {
                expect(error.message).toBe(gpio_mock_1.EBADF);
            }
        }
    }));
    it('[ readSync() ] Read sync SUCSESS', () => {
        expect(gpio13.readSync()).toBe(1);
    });
});
describe('GpioMock Write functions', () => {
    it('[ write() ] Write without callback SUCSESS', () => {
        gpio13 = new gpio_mock_1.GpioMock(13, 'low');
        gpio13.write(1);
        expect(gpio13._value).toBe(1);
    });
    it('[ write() ] Write without callback UNEXPROT ERROR', () => {
        gpio13 = new gpio_mock_1.GpioMock(13, 'low');
        gpio13.unexport();
        try {
            gpio13.write(1);
        }
        catch (error) {
            if (error instanceof Error) {
                expect(error.message).toBe(gpio_mock_1.EBADF);
            }
        }
    });
    it('[ write() ] Write DIRECTION IN without callback PERMITION ERROR', () => {
        gpio13 = new gpio_mock_1.GpioMock(13, 'in');
        try {
            gpio13.write(1);
        }
        catch (error) {
            if (error instanceof Error) {
                expect(error.message).toBe(gpio_mock_1.EPERM);
            }
        }
    });
    it('[ write() ] Write with callback without error SUCSESS', () => {
        gpio13 = new gpio_mock_1.GpioMock(13, 'low');
        const testCallback = (err) => {
            expect(err).toBeUndefined();
        };
        gpio13.write(1, testCallback);
    });
    it('[ write() ] Write with callback UNEXPORT ERROR', () => {
        gpio13 = new gpio_mock_1.GpioMock(13, 'low');
        gpio13.unexport();
        const testCallback = (err) => {
            if (err instanceof Error) {
                expect(err.message).toBe(gpio_mock_1.EBADF);
            }
        };
        gpio13.write(1, testCallback);
    });
    it('[ write() ] Write DIRECTION IN with callback PERMITION ERROR', () => {
        gpio13 = new gpio_mock_1.GpioMock(13, 'in');
        const testCallback = (err) => {
            if (err instanceof Error) {
                expect(err.message).toBe(gpio_mock_1.EPERM);
            }
        };
        gpio13.write(1, testCallback);
    });
    it('[ writeSync() ] Write sync SUCSESS', () => {
        gpio13 = new gpio_mock_1.GpioMock(13, 'low');
        gpio13.writeSync(1);
        expect(gpio13._value).toBe(1);
    });
    it('[ writeSync() ] Write sync UNEXPROT ERROR', () => {
        gpio13 = new gpio_mock_1.GpioMock(13, 'low');
        gpio13.unexport();
        try {
            gpio13.writeSync(1);
        }
        catch (error) {
            if (error instanceof Error) {
                expect(error.message).toBe(gpio_mock_1.EBADF);
            }
        }
    });
    it('[ writeSync() ] Write DIRECTION IN sync PERMITION ERROR', () => {
        gpio13 = new gpio_mock_1.GpioMock(13, 'in');
        try {
            gpio13.writeSync(1);
        }
        catch (error) {
            if (error instanceof Error) {
                expect(error.message).toBe(gpio_mock_1.EPERM);
            }
        }
    });
});
describe('GpioMock Unexport Pin', () => {
    it('[ unexport() ] Unexport pin and read error - SUCCESS', () => {
        const gpio = new gpio_mock_1.GpioMock(12, 'out');
        try {
            gpio.read();
        }
        catch (error) {
            if (error instanceof Error) {
                expect(error.message).toBe(gpio_mock_1.EBADF);
            }
        }
    });
});
