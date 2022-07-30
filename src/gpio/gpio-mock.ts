import { BinaryValue, Direction, Edge, Options, ValueCallback } from './gpio.interface';
import { IOnoff } from './onoff.interface';

export const EBADF = 'EBADF: bad file descriptor!';
export const EPERM = 'EPERM: operation is not permited, write';
export const ERROR_EMPTY_VALUE = 'Signal must be 0 or 1';

export type OneParamCallback = (err: Error | null | undefined) => void;
export type Callback = ValueCallback | OneParamCallback | unknown;

export const useCallback = (
	callback: Callback,
	err?: Error | null | undefined,
	args?: any,
): void => {
	if (typeof callback == 'function') {
		callback(err, args);
	}
};

export const useCallbackOrThrowError = (
	callback: Callback,
	error: Error,
	argsToCallback?: any,
): void => {
	if (typeof callback == 'function') {
		callback(error, argsToCallback);
	} else {
		throw error;
	}
};

const runCallbacks = async (
	forstart: ValueCallback[],
	err: Error | undefined | null,
	value: any,
): Promise<void> => {
	forstart.forEach((callback: ValueCallback) => {
		callback(err, value);
	});
};

export class GpioMock implements IOnoff {
	public _gpio: number;
	public _value: BinaryValue;
	public _direction: Direction;
	public _edge: Edge = 'none';
	public _listeners: ValueCallback[] = [];
	public _unexport = false;
	public _activeLow = false;

	public _edge_rising: BinaryValue = 1;
	public _edge_faling: BinaryValue = 0;

	public _write_in_direction_mode = false;

	constructor(gpio: number, direction: Direction, edge?: Edge, options?: Options) {
		this._gpio = gpio;
		this.setDirection(direction);
		if (edge) {
			this.setEdge(edge);
		}
		if (options?.activeLow) {
			this.setActiveLow(true);
		}
	}

	read(): Promise<BinaryValue>;
	read(callback: ValueCallback): void;
	read(callback?: unknown, err?: Error | null | undefined): void | Promise<BinaryValue> {
		if (this._unexport) useCallbackOrThrowError(callback, new Error(EBADF));
		const returnValue = this._activeLow ? this._value ^ 1 : this._value;
		if (callback) {
			useCallback(callback, err, returnValue);
		} else {
			return new Promise((resolve, reject) => {
				if (err) {
					reject(err);
				}
				resolve(returnValue as BinaryValue);
			});
		}
	}

	readSync(): BinaryValue {
		if (this._unexport) throw new Error(EBADF);
		const returnValue = this._activeLow ? this._value ^ 1 : this._value;
		return returnValue as BinaryValue;
	}

	write(value: BinaryValue, callback: Callback): void;
	write(value: BinaryValue): Promise<void>;
	write(value: unknown, callback?: unknown): void | Promise<void> {
		if (this._unexport) useCallbackOrThrowError(callback, new Error(EBADF));
		if (this._direction == 'in' && !this._write_in_direction_mode) {
			useCallbackOrThrowError(callback, new Error(EPERM));
		}
		if (value == 0 || value == 1) {
			this._value = value as BinaryValue;
			const returnValue = this._activeLow ? this._value ^ 1 : this._value;
			useCallback(callback, undefined, returnValue);
			if (this._direction == 'in') {
				if (this._edge == 'both') {
					runCallbacks(this._listeners, undefined, this._value);
				}
				if (this._edge == 'falling' && this._value == this._edge_faling) {
					runCallbacks(this._listeners, undefined, this._value);
				}
				if (this._edge == 'rising' && this._value == this._edge_faling) {
					runCallbacks(this._listeners, undefined, this._value);
				}
			}
		} else {
			useCallbackOrThrowError(callback, Error(ERROR_EMPTY_VALUE));
		}
	}

	writeSync(value: BinaryValue): void {
		if (this._unexport) throw new Error(EBADF);
		if (this._direction == 'in' && !this._write_in_direction_mode) {
			throw new Error(EPERM);
		}
		this._value = value;
	}

	watch(callback: ValueCallback): void {
		if (this._unexport) throw new Error(EBADF);
		if (callback) {
			this.unwatch(callback);
			this._listeners.push(callback);
		}
	}

	unwatch(callback?: ValueCallback): void {
		if (this._unexport) throw new Error(EBADF);
		if (callback) {
			if (this._listeners.includes(callback)) {
				const newListeners: ValueCallback[] = this._listeners.filter(
					(el: ValueCallback) => el !== callback,
				);
				this._listeners = newListeners;
			}
		}
	}

	unwatchAll(): void {
		if (this._unexport) throw new Error(EBADF);
		this._listeners = [];
	}

	direction(): Direction {
		if (this._unexport) throw new Error(EBADF);
		const d = this._direction;
		return d == 'high' || d == 'low' || d == 'out' ? 'out' : 'in';
	}

	setDirection(direction: Direction): void {
		if (this._unexport) throw new Error(EBADF);
		this._direction = direction;
		switch (direction) {
			case 'in':
				this._value = 1;
				break;
			case 'low':
				this._value = 0;
				break;
			case 'high':
				this._value = 1;
				break;
			case 'out':
				this._value = 0;
				break;
		}
	}

	edge(): Edge {
		if (this._unexport) throw new Error(EBADF);
		return this._edge;
	}

	setEdge(edge: Edge): void {
		if (this._unexport) throw new Error(EBADF);
		if (this._direction !== 'in') {
			this._edge = 'none';
		}
		if (this._direction == 'in') this._edge = edge;
	}

	activeLow(): boolean {
		if (this._unexport) throw new Error(EBADF);
		return this._activeLow;
	}

	setActiveLow(invert: boolean): void {
		if (this._unexport) throw new Error(EBADF);
		this._activeLow = invert;
	}

	unexport(): void {
		this._unexport = true;
	}
}
