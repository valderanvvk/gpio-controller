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
const gpio_controller_1 = require("../../src/gpio/gpio.controller");
const button_1 = require("../../src/gpio/components/button");
const pin13data = {
    gpio: 13,
    direction: 'out',
};
const testPin13data = {
    _edge: 'none',
    _listeners: [],
    _unexport: false,
    _activeLow: false,
    _edge_rising: 1,
    _edge_faling: 0,
    _write_in_direction_mode: false,
    _gpio: 13,
    _direction: 'out',
    _value: 0,
};
const pin14data = {
    gpio: 14,
    direction: 'in',
    edge: 'both',
};
const testPin14data = {
    _edge: 'none',
    _listeners: [],
    _unexport: false,
    _activeLow: false,
    _edge_rising: 1,
    _edge_faling: 0,
    _write_in_direction_mode: false,
    _gpio: 14,
    _direction: 'out',
    _value: 0,
};
let gpio;
describe('GpioController work with single gpio', () => {
    beforeAll(() => { });
    it('[ setPIN() getPIN() ] test setPIN and getPIN - SUCCSEES ()', () => {
        gpio = new gpio_controller_1.GpioController({ mock: true });
        const createResult = gpio.setPIN(pin13data);
        const pin = gpio.getPIN(13);
        const getpinResult = pin instanceof gpio_mock_1.GpioMock;
        expect([createResult, getpinResult, pin]).toEqual([true, true, testPin13data]);
    });
    it('[ setPIN() ] trying to create an existing pin - ERROR ()', () => {
        gpio = new gpio_controller_1.GpioController({ mock: true });
        const createResult = gpio.setPIN(pin13data);
        const createAgainResult = gpio.setPIN(pin13data);
        expect([createResult, createAgainResult]).toEqual([true, false]);
    });
    it('[ setPINDirection() ] change pin direction - SUCCESS ()', () => {
        gpio = new gpio_controller_1.GpioController({ mock: true });
        gpio.setPIN(pin13data);
        const pin13 = gpio.getPIN(13);
        const createDirection = pin13.direction();
        const returnValue = gpio.setPINDirection(13, 'in');
        const checkDirection = pin13.direction();
        expect([createDirection, returnValue, checkDirection]).toEqual(['out', true, 'in']);
    });
    it('[ setPINEdge() ] change pin edge, direction in - SUCCESS ()', () => {
        const PIN = 14;
        gpio = new gpio_controller_1.GpioController({ mock: true });
        gpio.setPIN(pin14data);
        const pin = gpio.getPIN(PIN);
        const create = pin.edge();
        const returnValue = gpio.setPINEdge(PIN, 'falling');
        const check = pin.edge();
        expect([create, returnValue, check]).toEqual(['both', true, 'falling']);
    });
    it('[ setPINEdge() ] when using the edge in the outward direction, automatic change of direction  - SUCCESS ()', () => {
        const PIN = 13;
        gpio = new gpio_controller_1.GpioController({ mock: true });
        gpio.setPIN(pin13data);
        const pin = gpio.getPIN(PIN);
        const create = pin.edge();
        const returnValue = gpio.setPINEdge(PIN, 'falling');
        const checkDirection = pin.direction();
        const check = pin.edge();
        expect([create, returnValue, check, checkDirection]).toEqual(['none', true, 'falling', 'in']);
    });
    it('[ invert() ] pin inversion test - SUCCESS ()', () => {
        const PIN = 13;
        gpio = new gpio_controller_1.GpioController({ mock: true });
        gpio.setPIN(pin13data);
        const pin = gpio.getPIN(PIN);
        const pinValueBeforeInversion = pin.readSync();
        gpio.invert(PIN, true);
        const pinValueAfterInversion = pin.readSync();
        expect([pin.activeLow(), pinValueBeforeInversion, pinValueAfterInversion]).toEqual([
            true,
            0,
            1,
        ]);
    });
    it('[ checkInvert() ] checkInvert function test - SUCCESS ()', () => {
        const PIN = 13;
        gpio = new gpio_controller_1.GpioController({ mock: true });
        gpio.setPIN(pin13data);
        const pinValueBeforeInversion = gpio.checkInvert(PIN);
        gpio.invert(PIN, true);
        const pinValueAfterInversion = gpio.checkInvert(PIN);
        expect([pinValueBeforeInversion, pinValueAfterInversion]).toEqual([false, true]);
    });
    it('[ deletePIN() ] deletePIN function test - SUCCESS ()', () => {
        const PIN = 13;
        gpio = new gpio_controller_1.GpioController({ mock: true });
        gpio.setPIN(pin13data);
        gpio.deletePIN(PIN);
        const checkDelete = gpio.getPIN(PIN);
        expect(checkDelete).toBeUndefined();
    });
    it('[ watchPIN() ] watchPIN function test - SUCCESS ()', () => __awaiter(void 0, void 0, void 0, function* () {
        const PIN = 14;
        gpio = new gpio_controller_1.GpioController({ mock: true });
        gpio.setPIN(pin14data);
        let countCall = 0;
        const testCallback = (err, value) => {
            countCall++;
        };
        gpio.watchPIN(testCallback, PIN);
        const button = new button_1.Button(gpio.getPIN(PIN));
        yield button.push();
        expect(countCall).toBe(2);
    }));
    it('[ unwatchPIN() ] unwatchPIN function test - SUCCESS ()', () => __awaiter(void 0, void 0, void 0, function* () {
        const PIN = 14;
        gpio = new gpio_controller_1.GpioController({ mock: true });
        gpio.setPIN(pin14data);
        let countCall = 0;
        const testCallback = (err, value) => {
            countCall++;
        };
        const returnCallback = gpio.watchPIN(testCallback, PIN);
        const unwatchResult = gpio.unwatchPIN(returnCallback, PIN);
        const button = new button_1.Button(gpio.getPIN(PIN));
        yield button.push();
        expect([countCall, unwatchResult]).toEqual([0, true]);
    }));
    it('[ unwatchAllPIN() ] unwatchAllPIN function test - SUCCESS ()', () => __awaiter(void 0, void 0, void 0, function* () {
        const PIN = 14;
        gpio = new gpio_controller_1.GpioController({ mock: true });
        gpio.setPIN(pin14data);
        let countCall = 0;
        const testCallback1 = (err, value) => {
            countCall++;
        };
        const testCallback2 = (err, value) => {
            countCall++;
        };
        gpio.watchPIN(testCallback1, PIN);
        gpio.watchPIN(testCallback2, PIN);
        const button = new button_1.Button(gpio.getPIN(PIN));
        yield button.push();
        gpio.unwatchAllPIN(PIN);
        yield button.push();
        expect(countCall).toBe(4);
    }));
    it('[ readSignal() ] readSignal function test - SUCCESS ()', () => __awaiter(void 0, void 0, void 0, function* () {
        const PIN = 13;
        gpio = new gpio_controller_1.GpioController({ mock: true });
        gpio.setPIN(pin13data);
        expect(yield gpio.readSignal(PIN)).toBe(0);
    }));
    it('[ writeSignal() ] writeSignal function test - SUCCESS ()', () => __awaiter(void 0, void 0, void 0, function* () {
        const PIN = 13;
        gpio = new gpio_controller_1.GpioController({ mock: true });
        gpio.setPIN(pin13data);
        const valueBefore = yield gpio.readSignal(PIN);
        const executionResult = yield gpio.writeSignal(PIN, 1);
        const valueAfter = yield gpio.readSignal(PIN);
        expect([valueBefore, valueAfter, executionResult]).toEqual([0, 1, true]);
    }));
    it('[ switchOff() ] switchOff function test - SUCCESS ()', () => __awaiter(void 0, void 0, void 0, function* () {
        const PIN = 13;
        gpio = new gpio_controller_1.GpioController({ mock: true });
        gpio.setPIN(pin13data);
        yield gpio.writeSignal(PIN, 1);
        const valueBefore = yield gpio.readSignal(PIN);
        const executionResult = yield gpio.switchOff(PIN);
        const valueAfter = yield gpio.readSignal(PIN);
        expect([valueBefore, valueAfter, executionResult]).toEqual([1, 0, true]);
    }));
    it('[ switchOn() ] switchOn function test - SUCCESS ()', () => __awaiter(void 0, void 0, void 0, function* () {
        const PIN = 13;
        gpio = new gpio_controller_1.GpioController({ mock: true });
        gpio.setPIN(pin13data);
        const valueBefore = yield gpio.readSignal(PIN);
        const executionResult = yield gpio.switchOn(PIN);
        const valueAfter = yield gpio.readSignal(PIN);
        expect([valueBefore, valueAfter, executionResult]).toEqual([0, 1, true]);
    }));
    it('[ toggle() ] toggle function test - SUCCESS ()', () => __awaiter(void 0, void 0, void 0, function* () {
        const PIN = 13;
        gpio = new gpio_controller_1.GpioController({ mock: true });
        gpio.setPIN(pin13data);
        const valueBefore = yield gpio.readSignal(PIN);
        yield gpio.toggle(PIN);
        const valueAfter = yield gpio.readSignal(PIN);
        expect([valueBefore, valueAfter]).toEqual([0, 1]);
    }));
    it('[ unexport() ] unexport function test - SUCCESS ()', () => __awaiter(void 0, void 0, void 0, function* () {
        const PIN = 13;
        gpio = new gpio_controller_1.GpioController({ mock: true });
        gpio.setPIN(pin13data);
        gpio.unexport(PIN);
        try {
            yield gpio.readSignal(PIN);
        }
        catch (error) {
            if (error instanceof Error) {
                expect(error.message).toEqual(gpio_mock_1.EBADF);
            }
        }
    }));
});
