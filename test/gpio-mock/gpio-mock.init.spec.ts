import { GpioMock } from '../../src/gpio/gpio-mock';
import { IGpio } from '../../src/gpio/gpio.interface';

const led13: IGpio = {
	gpio: 13,
	direction: 'out',
};

const button2: IGpio = {
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
		const outPin = new GpioMock(gpio, direction);
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
		const outPin = new GpioMock(gpio, 'high');
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
		const outPin = new GpioMock(gpio, 'low');
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
		const outPin = new GpioMock(gpio, direction, edge);
		expect(outPin).toEqual(checkResult);
	});
});
