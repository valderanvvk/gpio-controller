import { GpioMock } from '../../src/gpio/gpio-mock';
import { BinaryValue, ValueCallback } from '../../src/gpio/gpio.interface';
import { Button } from '../../src/gpio/components/button';

describe('GpioMock invert(activeLow) functions', () => {
	it('[ activeLow() ] Creating invert pin SUCSESS', () => {
		const gpio = new GpioMock(12, 'high', 'none', { activeLow: true });
		const check = gpio.activeLow();
		expect(check).toBe(true);
	});

	it('[ activeLow() ] Read sync invert pin SUCSESS', () => {
		const gpio = new GpioMock(12, 'high', 'none', { activeLow: true });
		const check = gpio.readSync();
		expect(check).toBe(0);
	});

	it('[ activeLow() ] Read async invert pin SUCSESS', async () => {
		const gpio = new GpioMock(12, 'high', 'none', { activeLow: true });
		const check = await gpio.read();
		expect(check).toBe(0);
	});

	it('[ activeLow() ] Read async with callback invert pin SUCSESS', async () => {
		const gpio = new GpioMock(12, 'low', 'none', { activeLow: true });
		const testCallback: ValueCallback = (err, value) => {
			expect(value).toBe(1);
		};
		await gpio.read();
	});

	it('[ activeLow() ] Write async with callback invert pin SUCSESS', async () => {
		const gpio = new GpioMock(12, 'out', 'none', { activeLow: true });
		gpio.write(0);
		const testCallback: ValueCallback = (err, value) => {
			expect(value).toBe(0);
		};
		await gpio.read();
	});

	it('[ activeLow() ] Read async with listener invert pin SUCSESS', async () => {
		const gpio = new GpioMock(12, 'in', 'both', { activeLow: true });
		const button = new Button(gpio);
		const shouldBe = [gpio._edge_faling, gpio._edge_rising];
		const check: BinaryValue[] = [];
		const testCallback: ValueCallback = (err, value) => {
			check.push(value);
		};
		gpio.watch(testCallback);
		await button.push();
		expect(check).toEqual(shouldBe);
	});
});
