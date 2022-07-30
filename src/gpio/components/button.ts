import { BinaryValue } from '../gpio.interface';
import { IOnoff } from '../onoff.interface';

// только я для GpioMock - Эмуляция нажатия кнопки;
export class Button {
	private gpio: IOnoff;
	private options: { up: BinaryValue; down: BinaryValue };

	constructor(gpio: IOnoff, options: { up: BinaryValue; down: BinaryValue } = { up: 1, down: 0 }) {
		this.gpio = gpio;
		this.options = options;
	}

	public async push(): Promise<void> {
		await this.pushDown();
		await this.pushUp();
	}

	public async pushUp(): Promise<void> {
		const prev = this.gpio._write_in_direction_mode;
		this.gpio._write_in_direction_mode = true;
		await this.gpio.write(this.options.up);
		this.gpio._write_in_direction_mode = prev;
	}

	public async pushDown(): Promise<void> {
		const prev = this.gpio._write_in_direction_mode;
		this.gpio._write_in_direction_mode = true;
		await this.gpio.write(this.options.down);
		this.gpio._write_in_direction_mode = prev;
	}
}
