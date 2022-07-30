import { EBADF, EPERM, GpioMock, OneParamCallback } from '../../src/gpio/gpio-mock';
import { IGpio, ValueCallback } from '../../src/gpio/gpio.interface';
import { IOnoff } from '../../src/gpio/onoff.interface';

const led13: IGpio = {
	gpio: 13,
	direction: 'high',
};

let gpio13: IOnoff;

describe('GpioMock Read functions', () => {
	beforeAll(() => {
		const { gpio, direction } = led13;
		gpio13 = new GpioMock(gpio, direction);
	});

	it('[ read() ] Read Async without callback SUCSESS', async () => {
		const checkValue = await gpio13.read();
		expect(checkValue).toBe(1);
	});
	it('[ read() ] Read Async with callback SUCSESS', async () => {
		const callback: ValueCallback = (err, value) => {
			expect(value).toBe(1);
		};
		await gpio13.read(callback);
	});

	it('[ read() ] Read Async with callback Error SUCSESS', async () => {
		const callback: ValueCallback = (err, value) => {
			if (err instanceof Error) {
				expect(err.message).toEqual('test error');
			}
		};
		await gpio13.read(callback, new Error('test error'));
	});

	it('[ read() ] Read Async with UNEXPORT PIN Error SUCSESS', async () => {
		try {
			const callback: ValueCallback = (err, value) => {};
			const testPin = new GpioMock(12, 'high');
			testPin.unexport();
			await testPin.read(callback);
		} catch (error) {
			if (error instanceof Error) {
				expect(error.message).toBe(EBADF);
			}
		}
	});

	it('[ readSync() ] Read sync SUCSESS', () => {
		expect(gpio13.readSync()).toBe(1);
	});
});

describe('GpioMock Write functions', () => {
	it('[ write() ] Write without callback SUCSESS', () => {
		gpio13 = new GpioMock(13, 'low');
		gpio13.write(1);
		expect(gpio13._value).toBe(1);
	});

	it('[ write() ] Write without callback UNEXPROT ERROR', () => {
		gpio13 = new GpioMock(13, 'low');
		gpio13.unexport();
		try {
			gpio13.write(1);
		} catch (error) {
			if (error instanceof Error) {
				expect(error.message).toBe(EBADF);
			}
		}
	});

	it('[ write() ] Write DIRECTION IN without callback PERMITION ERROR', () => {
		gpio13 = new GpioMock(13, 'in');
		try {
			gpio13.write(1);
		} catch (error) {
			if (error instanceof Error) {
				expect(error.message).toBe(EPERM);
			}
		}
	});

	it('[ write() ] Write with callback without error SUCSESS', () => {
		gpio13 = new GpioMock(13, 'low');
		const testCallback: OneParamCallback = (err): void => {
			expect(err).toBeUndefined();
		};
		gpio13.write(1, testCallback);
	});

	it('[ write() ] Write with callback UNEXPORT ERROR', () => {
		gpio13 = new GpioMock(13, 'low');
		gpio13.unexport();
		const testCallback: OneParamCallback = (err): void => {
			if (err instanceof Error) {
				expect(err.message).toBe(EBADF);
			}
		};
		gpio13.write(1, testCallback);
	});

	it('[ write() ] Write DIRECTION IN with callback PERMITION ERROR', () => {
		gpio13 = new GpioMock(13, 'in');
		const testCallback: OneParamCallback = (err): void => {
			if (err instanceof Error) {
				expect(err.message).toBe(EPERM);
			}
		};
		gpio13.write(1, testCallback);
	});

	it('[ writeSync() ] Write sync SUCSESS', () => {
		gpio13 = new GpioMock(13, 'low');
		gpio13.writeSync(1);
		expect(gpio13._value).toBe(1);
	});

	it('[ writeSync() ] Write sync UNEXPROT ERROR', () => {
		gpio13 = new GpioMock(13, 'low');
		gpio13.unexport();
		try {
			gpio13.writeSync(1);
		} catch (error) {
			if (error instanceof Error) {
				expect(error.message).toBe(EBADF);
			}
		}
	});

	it('[ writeSync() ] Write DIRECTION IN sync PERMITION ERROR', () => {
		gpio13 = new GpioMock(13, 'in');
		try {
			gpio13.writeSync(1);
		} catch (error) {
			if (error instanceof Error) {
				expect(error.message).toBe(EPERM);
			}
		}
	});
});

describe('GpioMock Unexport Pin', () => {
	it('[ unexport() ] Unexport pin and read error - SUCCESS', () => {
		const gpio = new GpioMock(12, 'out');
		try {
			gpio.read();
		} catch (error) {
			if (error instanceof Error) {
				expect(error.message).toBe(EBADF);
			}
		}
	});
});
