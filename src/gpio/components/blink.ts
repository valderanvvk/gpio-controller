import { GpioController } from '../gpio.controller';

export class Blink {
	private gpio: GpioController;
	private interval: NodeJS.Timer | undefined;
	private group: string | undefined;
	private pin: number | undefined;
	private count = 0;

	constructor(gpio: GpioController) {
		this.gpio = gpio;
	}

	setPin(gpio: number): void {
		const pin = this.gpio.getPIN(gpio);
		if (pin) {
			if (pin.direction() !== 'in') {
				this.pin = gpio;
			}
		}
	}

	clearPin(): void {
		this.pin = undefined;
	}

	setGroup(groupid: string): boolean {
		if (this.gpio.isExsistGroup(groupid) > -1) {
			this.group = groupid;
		}
		return false;
	}

	clearGroup(): void {
		this.group = undefined;
	}

	clearAll(): void {
		this.pin = undefined;
		this.group = undefined;
	}

	start(msek = 1000, count = 0): void {
		this.count = 0;
		this.interval = setInterval(() => {
			this.count++;
			if (this.group) {
				this.gpio.switchGroupToggle(this.group);
			}
			if (this.pin) {
				this.gpio.toggle(this.pin);
			}
			if (this.count >= count) {
				this.stop();
			}
		}, msek);
	}

	stop(): void {
		clearInterval(this.interval);
		this.interval = undefined;
		this.count = 0;
		if (this.group) {
			this.gpio.switchGroupOff(this.group);
		}
		if (this.pin) {
			this.gpio.switchOff(this.pin);
		}
	}
}
