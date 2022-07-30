import { GpioMock } from '../../src/gpio/gpio-mock';
import { ValueCallback } from '../../src/gpio/gpio.interface';
import { Button } from '../../src/gpio/components/button';

describe('GpioMock watch functions', () => {
	it('[ watch() ] Add callback SUCSESS', () => {
		const gpio13 = new GpioMock(13, 'in', 'rising');
		const callback: ValueCallback = (err, value): void => {};
		const checkBeforeAddCallback = gpio13._listeners.length;
		gpio13.watch(callback);
		const checkAfterAddCallBAck = [checkBeforeAddCallback, gpio13._listeners.length];
		expect(checkAfterAddCallBAck).toEqual([0, 1]);
	});

	it('[ watch() ] check call callback SUCSESS', async () => {
		const gpio13 = new GpioMock(13, 'in', 'falling');
		const button = new Button(gpio13);
		const callback: ValueCallback = (err, value): void => {
			expect(value).toBe(0);
		};
		gpio13.watch(callback);
		await button.push();
	});

	it('[ watch() ] (button press) Edge="Both" 2 cals callback SUCSESS', async () => {
		const gpio13 = new GpioMock(13, 'in', 'both');
		const button = new Button(gpio13);
		let i = 0;
		const callback: ValueCallback = (err, value): void => {
			i++;
		};
		gpio13.watch(callback);
		await button.push();
		expect(i).toBe(2);
	});

	it('[ unwatch() ] call deletion check from listeners list SUCSESS', () => {
		const gpio13 = new GpioMock(13, 'in', 'rising');
		const callback: ValueCallback = (err, value): void => {};
		gpio13.watch(callback);
		const checkBeforeAddCallback = gpio13._listeners.length;
		gpio13.unwatch(callback);
		const checkAfterAddCallBAck = [checkBeforeAddCallback, gpio13._listeners.length];
		expect(checkAfterAddCallBAck).toEqual([1, 0]);
	});

	it('[ unwatch() ] 2 cals callback before and after unwatch, should be called 1 time', async () => {
		const gpio13 = new GpioMock(13, 'in', 'rising');
		const button = new Button(gpio13);
		let i = 0;
		const callback: ValueCallback = (err, value): void => {
			i++;
		};
		gpio13.watch(callback);
		await button.push();
		gpio13.unwatch(callback);
		await button.push();
		expect(i).toBe(1);
	});

	it('[ unwatchAll() ] call deletion check all from listeners list SUCSESS', () => {
		const gpio13 = new GpioMock(13, 'in', 'rising');
		const callback1: ValueCallback = (err, value): void => {};
		const callback2: ValueCallback = (err, value): void => {};
		const checkBeforeAddCallback = gpio13._listeners.length;
		gpio13.watch(callback1);
		gpio13.watch(callback2);
		const checkAfterAddCallback = gpio13._listeners.length;
		gpio13.unwatchAll();
		const check = [checkBeforeAddCallback, checkAfterAddCallback, gpio13._listeners.length];
		expect(check).toEqual([0, 2, 0]);
	});
});
