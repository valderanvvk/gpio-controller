import { BinaryValue, Direction, Edge, ValueCallback } from './gpio.interface';

export interface IOnoff {
	_gpio?: number;
	_value?: BinaryValue;
	_direction?: Direction;
	_edge?: Edge;
	_listeners?: ValueCallback[];
	_unexport?: boolean;
	_activeLow?: boolean;
	_edge_rising?: BinaryValue;
	_edge_faling?: BinaryValue;
	_write_in_direction_mode?: boolean;

	read(callback: ValueCallback): void;
	read(err?: Error | null | undefined): Promise<BinaryValue>;
	read(callback: ValueCallback, err?: Error | null | undefined): void;

	readSync(): BinaryValue;

	write(value: BinaryValue, callback: (err: Error | null | undefined) => void): void;
	write(value: BinaryValue): Promise<void>;

	writeSync(value: BinaryValue): void;

	watch(callback: ValueCallback): void;
	unwatch(callback?: ValueCallback): void;
	unwatchAll(): void;

	direction(): Direction;
	setDirection(direction: Direction): void;

	edge(): Edge;
	setEdge(edge: Edge): void;

	activeLow(): boolean;
	setActiveLow(invert: boolean): void;

	unexport(): void;
}
