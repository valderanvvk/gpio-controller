import { Gpio } from 'onoff';
import { IOnoff } from './onoff.interface';

export type High = 1;
export type Low = 0;
export type Disable = -1;
export type Direction = 'in' | 'out' | 'high' | 'low';
export type Edge = 'none' | 'rising' | 'falling' | 'both';

export type Options = {
	debounceTimeout?: number;
	activeLow?: boolean;
	reconfigureDirection?: boolean;
};

export type DirectionResolution = {
	in: boolean;
	out: boolean;
	high: boolean;
	low: boolean;
};

export type BinaryValue = High | Low;
export type ValueCallback = (err: Error | null | undefined, value: BinaryValue) => void;
export type PinValueCallback = (
	err: Error | null | undefined,
	value: BinaryValue,
	pin?: number,
	group?: string,
) => void;

export interface IGpio {
	gpio: number;
	direction: Direction;
	edge?: Edge;
	options?: Options;
}

export type GroupActiveStatus = BinaryValue | Disable;
export type GroupCallBack = (...args: unknown[]) => void;
export type GroupGpio = {
	groupid: string;
	direction: Direction;
	edge?: Edge;
	switch?: GroupActiveStatus;
	gpio: number[];
	watch?: PinValueCallback;
	watchCallback?: Map<number, ValueCallback>;
};

export type SetGroupParam = {
	overwriting?: boolean;
	setSingleDirection?: boolean;
	createEmpty?: boolean;
};

export interface IGpioController {
	createPin(pin: IGpio): IOnoff;
	setPIN(pin: IGpio): boolean;
	getPIN(gpio: number): Gpio | IOnoff | undefined;
	setPINDirection(gpio: number, direction: Direction): boolean;
	setPINEdge(gpio: number, edge: Edge): boolean;
	invert(gpio: number, status: boolean): void;
	checkInvert(gpio: number): boolean | undefined;
	deletePIN(gpio: number): void;
	watchPIN(callback: PinValueCallback, gpio: number): ValueCallback | undefined;
	unwatchPIN(callback: ValueCallback, gpio: number): boolean;
	unwatchAllPIN(gpio: number): void;

	readSignal(gpio: number): Promise<BinaryValue>;
	writeSignal(pinNumber: number, signal: BinaryValue): Promise<boolean>;
	switchOn(gpio: number): Promise<boolean>;
	switchOff(gpio: number): Promise<boolean>;
	toggle(gpio: number): Promise<void>;
	unexport(gpio: number): void;

	checkGroupDirection(pins: number[], direction: Direction): number[];
	setGroupDirection(groupid: string, direction: Direction): void;
	getGroupDirection(groupid: string): Array<[number, Direction]>;
	setGroupEdge(groupid: string, edge: Edge): void;
	invertGroup(groupid: string, status: boolean): void;
	setGroup(group: GroupGpio, param?: SetGroupParam): boolean;
	fillGroupMissingPins(pins: number[], direction: Direction): number[];
	addGroup(group: GroupGpio): boolean;
	deleteGroup(groupid: string, deletePins?: boolean): void;
	isExsistGroup(groupid: string): number;
	getGroup(groupid: string): GroupGpio | undefined;
	updateGroup(group: GroupGpio): boolean;
	addToGroup(groupid: string, gpio: number): boolean;
	switchGroupOn(groupid: string): Promise<void>;
	switchGroupOff(groupid: string): Promise<void>;
	switchGroupToggle(groupid: string): Promise<void>;
	watchGroup(groupid: string, callback?: PinValueCallback, saveCallback?: boolean): void;
	unwatchGroup(groupid: string, deleteCallback: boolean): void;
	unwatchGroupAll(groupid: string): void;
	unexportGroup(groupid: string, deletepins?: boolean): void;

	getSoscket(): Map<number, Gpio>;
	getGroups(): GroupGpio[];
}
