import { EBADF, GpioMock } from '../../src/gpio/gpio-mock';
import { GpioController } from '../../src/gpio/gpio.controller';
import { IGpio, ValueCallback } from '../../src/gpio/gpio.interface';
import { IOnoff } from '../../src/gpio/onoff.interface';
import { Button } from '../../src/gpio/components/button';

const pin13data: IGpio = {
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

const pin14data: IGpio = {
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

let gpio: GpioController;

describe('GpioController work with single gpio', () => {
	beforeAll(() => {});
	it('[ setPIN() getPIN() ] test setPIN and getPIN - SUCCSEES ()', () => {
		gpio = new GpioController({ mock: true });
		const createResult = gpio.setPIN(pin13data);
		const pin = gpio.getPIN(13);
		const getpinResult = pin instanceof GpioMock;
		expect([createResult, getpinResult, pin]).toEqual([true, true, testPin13data]);
	});

	it('[ setPIN() ] trying to create an existing pin - ERROR ()', () => {
		gpio = new GpioController({ mock: true });
		const createResult = gpio.setPIN(pin13data);
		const createAgainResult = gpio.setPIN(pin13data);
		expect([createResult, createAgainResult]).toEqual([true, false]);
	});

	it('[ setPINDirection() ] change pin direction - SUCCESS ()', () => {
		gpio = new GpioController({ mock: true });
		gpio.setPIN(pin13data);
		const pin13 = gpio.getPIN(13) as IOnoff;
		const createDirection = pin13.direction();
		const returnValue = gpio.setPINDirection(13, 'in');
		const checkDirection = pin13.direction();
		expect([createDirection, returnValue, checkDirection]).toEqual(['out', true, 'in']);
	});

	it('[ setPINEdge() ] change pin edge, direction in - SUCCESS ()', () => {
		const PIN = 14;
		gpio = new GpioController({ mock: true });
		gpio.setPIN(pin14data);
		const pin: IOnoff = gpio.getPIN(PIN) as IOnoff;
		const create = pin.edge();
		const returnValue = gpio.setPINEdge(PIN, 'falling');
		const check = pin.edge();
		expect([create, returnValue, check]).toEqual(['both', true, 'falling']);
	});

	it('[ setPINEdge() ] when using the edge in the outward direction, automatic change of direction  - SUCCESS ()', () => {
		const PIN = 13;
		gpio = new GpioController({ mock: true });
		gpio.setPIN(pin13data);
		const pin: IOnoff = gpio.getPIN(PIN) as IOnoff;
		const create = pin.edge();
		const returnValue = gpio.setPINEdge(PIN, 'falling');
		const checkDirection = pin.direction();
		const check = pin.edge();
		expect([create, returnValue, check, checkDirection]).toEqual(['none', true, 'falling', 'in']);
	});

	it('[ invert() ] pin inversion test - SUCCESS ()', () => {
		const PIN = 13;
		gpio = new GpioController({ mock: true });
		gpio.setPIN(pin13data);
		const pin: IOnoff = gpio.getPIN(PIN) as IOnoff;
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
		gpio = new GpioController({ mock: true });
		gpio.setPIN(pin13data);
		const pinValueBeforeInversion = gpio.checkInvert(PIN);
		gpio.invert(PIN, true);
		const pinValueAfterInversion = gpio.checkInvert(PIN);
		expect([pinValueBeforeInversion, pinValueAfterInversion]).toEqual([false, true]);
	});

	it('[ deletePIN() ] deletePIN function test - SUCCESS ()', () => {
		const PIN = 13;
		gpio = new GpioController({ mock: true });
		gpio.setPIN(pin13data);
		gpio.deletePIN(PIN);
		const checkDelete = gpio.getPIN(PIN);
		expect(checkDelete).toBeUndefined();
	});
	it('[ watchPIN() ] watchPIN function test - SUCCESS ()', async () => {
		const PIN = 14;
		gpio = new GpioController({ mock: true });
		gpio.setPIN(pin14data);
		let countCall = 0;
		const testCallback: ValueCallback = (err, value): void => {
			countCall++;
		};
		gpio.watchPIN(testCallback, PIN);
		const button = new Button(gpio.getPIN(PIN) as IOnoff);
		await button.push();
		expect(countCall).toBe(2);
	});

	it('[ unwatchPIN() ] unwatchPIN function test - SUCCESS ()', async () => {
		const PIN = 14;
		gpio = new GpioController({ mock: true });
		gpio.setPIN(pin14data);
		let countCall = 0;
		const testCallback: ValueCallback = (err, value): void => {
			countCall++;
		};
		const returnCallback: ValueCallback = gpio.watchPIN(testCallback, PIN) as ValueCallback;
		const unwatchResult = gpio.unwatchPIN(returnCallback, PIN);
		const button = new Button(gpio.getPIN(PIN) as IOnoff);
		await button.push();
		expect([countCall, unwatchResult]).toEqual([0, true]);
	});

	it('[ unwatchAllPIN() ] unwatchAllPIN function test - SUCCESS ()', async () => {
		const PIN = 14;
		gpio = new GpioController({ mock: true });
		gpio.setPIN(pin14data);
		let countCall = 0;
		const testCallback1: ValueCallback = (err, value): void => {
			countCall++;
		};
		const testCallback2: ValueCallback = (err, value): void => {
			countCall++;
		};
		gpio.watchPIN(testCallback1, PIN);
		gpio.watchPIN(testCallback2, PIN);
		const button = new Button(gpio.getPIN(PIN) as IOnoff);
		await button.push();
		gpio.unwatchAllPIN(PIN);
		await button.push();
		expect(countCall).toBe(4);
	});

	it('[ readSignal() ] readSignal function test - SUCCESS ()', async () => {
		const PIN = 13;
		gpio = new GpioController({ mock: true });
		gpio.setPIN(pin13data);
		expect(await gpio.readSignal(PIN)).toBe(0);
	});

	it('[ writeSignal() ] writeSignal function test - SUCCESS ()', async () => {
		const PIN = 13;
		gpio = new GpioController({ mock: true });
		gpio.setPIN(pin13data);
		const valueBefore = await gpio.readSignal(PIN);
		const executionResult = await gpio.writeSignal(PIN, 1);
		const valueAfter = await gpio.readSignal(PIN);
		expect([valueBefore, valueAfter, executionResult]).toEqual([0, 1, true]);
	});

	it('[ switchOff() ] switchOff function test - SUCCESS ()', async () => {
		const PIN = 13;
		gpio = new GpioController({ mock: true });
		gpio.setPIN(pin13data);
		await gpio.writeSignal(PIN, 1);
		const valueBefore = await gpio.readSignal(PIN);
		const executionResult = await gpio.switchOff(PIN);
		const valueAfter = await gpio.readSignal(PIN);
		expect([valueBefore, valueAfter, executionResult]).toEqual([1, 0, true]);
	});

	it('[ switchOn() ] switchOn function test - SUCCESS ()', async () => {
		const PIN = 13;
		gpio = new GpioController({ mock: true });
		gpio.setPIN(pin13data);
		const valueBefore = await gpio.readSignal(PIN);
		const executionResult = await gpio.switchOn(PIN);
		const valueAfter = await gpio.readSignal(PIN);
		expect([valueBefore, valueAfter, executionResult]).toEqual([0, 1, true]);
	});

	it('[ toggle() ] toggle function test - SUCCESS ()', async () => {
		const PIN = 13;
		gpio = new GpioController({ mock: true });
		gpio.setPIN(pin13data);
		const valueBefore = await gpio.readSignal(PIN);
		await gpio.toggle(PIN);
		const valueAfter = await gpio.readSignal(PIN);
		expect([valueBefore, valueAfter]).toEqual([0, 1]);
	});
	it('[ unexport() ] unexport function test - SUCCESS ()', async () => {
		const PIN = 13;
		gpio = new GpioController({ mock: true });
		gpio.setPIN(pin13data);
		gpio.unexport(PIN);
		try {
			await gpio.readSignal(PIN);
		} catch (error) {
			if (error instanceof Error) {
				expect(error.message).toEqual(EBADF);
			}
		}
	});
});
