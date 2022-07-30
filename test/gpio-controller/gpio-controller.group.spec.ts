import { Button } from '../../src/gpio/components/button';
import { GpioController } from '../../src/gpio/gpio.controller';
import { GroupGpio, PinValueCallback } from '../../src/gpio/gpio.interface';
import { IOnoff } from '../../src/gpio/onoff.interface';

const leds1: Array<number> = [10, 12];
const buttons: Array<number> = [2, 3, 4, 8];
const groupname1 = 'leds';
const groupname2 = 'buttons';

const ledsGroup: GroupGpio = {
	groupid: groupname1,
	direction: 'out',
	gpio: leds1,
};

const buttonsGroup: GroupGpio = {
	groupid: groupname2,
	direction: 'in',
	edge: 'both',
	gpio: buttons,
};

const ledsGroupData = {
	groupid: 'leds',
	direction: 'out',
	gpio: [10, 12],
};

describe('GpioController work with group gpio', () => {
	it('[ addGroup() ] addGroup function with autoinit pins test - SUCCESS ()', () => {
		const gpio = new GpioController({ mock: true });
		const countPinsBefore = gpio.getSoscket().size;
		const checkGroupBefore = gpio.getGroup(groupname1);
		const addGroupReturnValue = gpio.addGroup(ledsGroup, true);
		const checkGroupAfter = gpio.getGroup(groupname1);
		const countPinsAfter = gpio.getSoscket().size;
		expect([
			checkGroupBefore,
			addGroupReturnValue,
			checkGroupAfter,
			countPinsBefore,
			countPinsAfter,
		]).toEqual([undefined, true, ledsGroupData, 0, 2]);
	});

	it('[ addGroup() ] addGroup function without autoinit pins test - SUCCESS ()', () => {
		const gpio = new GpioController({ mock: true });
		const countPinsBefore = gpio.getSoscket().size;
		const checkGroupBefore = gpio.getGroup(groupname1);
		const addGroupReturnValue = gpio.addGroup(ledsGroup, false);
		const checkGroupAfter = gpio.getGroup(groupname1);
		const countPinsAfter = gpio.getSoscket().size;
		expect([
			checkGroupBefore,
			addGroupReturnValue,
			checkGroupAfter,
			countPinsBefore,
			countPinsAfter,
		]).toEqual([undefined, true, ledsGroupData, 0, 0]);
	});

	it('[ getGroupDirection() ] getGroupDirection function test - SUCCESS ()', () => {
		const gpio = new GpioController({ mock: true });
		gpio.addGroup(ledsGroup);
		const check = gpio.getGroupDirection(groupname1);
		expect(check).toEqual([
			[10, 'out'],
			[12, 'out'],
		]);
	});

	it('[ setGroupDirection() ] setGroupDirection function test - SUCCESS ()', () => {
		const gpio = new GpioController({ mock: true });
		gpio.addGroup(ledsGroup);
		const checkBefore = gpio.getGroupDirection(groupname1);
		gpio.setGroupDirection(groupname1, 'in');
		const checkAfter = gpio.getGroupDirection(groupname1);
		expect([checkBefore, checkAfter]).toEqual([
			[
				[10, 'out'],
				[12, 'out'],
			],
			[
				[10, 'in'],
				[12, 'in'],
			],
		]);
	});

	it('[ checkGroupDirection() ] checkGroupDirection function test - SUCCESS ()', () => {
		const gpio = new GpioController({ mock: true });
		gpio.addGroup(ledsGroup);
		const check = gpio.checkGroupDirection(leds1, 'out');
		expect(check.length).toBe(0);
	});

	it('[ checkGroupDirection() ] checkGroupDirection Direction does not match SUCCESS ()', () => {
		const gpio = new GpioController({ mock: true });
		gpio.addGroup(ledsGroup);
		const check = gpio.checkGroupDirection(leds1, 'in');
		expect(check.length).toBe(2);
	});

	it('[ setGroupEdge() ] setGroupEdge function test SUCCESS ()', () => {
		const gpio = new GpioController({ mock: true });
		gpio.addGroup(ledsGroup);
		const pin10 = gpio.getPIN(10);
		const pin12 = gpio.getPIN(12);
		const edgeBefore = [pin10?.edge(), pin12?.edge()];
		gpio.setGroupEdge(groupname1, 'both');
		const edgeAfter = [pin10?.edge(), pin12?.edge()];
		expect(edgeBefore).toEqual(['none', 'none']);
		expect(edgeAfter).toEqual(['both', 'both']);
	});

	it('[ invertGroup() ] invertGroup function test SUCCESS ()', () => {
		const gpio = new GpioController({ mock: true });
		gpio.addGroup(ledsGroup);
		const pin10 = gpio.getPIN(10);
		const pin12 = gpio.getPIN(12);
		const before = [pin10?.readSync(), pin12?.readSync()];
		gpio.invertGroup(groupname1, true);
		const after = [pin10?.readSync(), pin12?.readSync()];
		expect(before).toEqual([0, 0]);
		expect(after).toEqual([1, 1]);
	});

	it('[ fillGroupMissingPins() ] init the pins and adds them to the socket SUCCESS ()', () => {
		const gpio = new GpioController({ mock: true });
		const before = [gpio.getPIN(10) ? true : false, gpio.getPIN(12) ? true : false];
		const result = gpio.fillGroupMissingPins(leds1, 'out');
		const after = [gpio.getPIN(10) ? true : false, gpio.getPIN(12) ? true : false];
		expect(before).toEqual([false, false]);
		expect(after).toEqual([true, true]);
		expect(result).toEqual([10, 12]);
	});

	it('[ deleteGroup() ] group deletion check without delete pins SUCCESS ()', () => {
		const gpio = new GpioController({ mock: true });
		gpio.addGroup(ledsGroup, false);
		const before = gpio.getGroups().length;
		const countPinsBefore = gpio.getSoscket().size;
		gpio.deleteGroup(groupname1, false);
		const result = gpio.getGroups().length;
		const countPinsAfter = gpio.getSoscket().size;
		expect([before, result]).toEqual([1, 0]);
		expect([countPinsBefore, countPinsAfter]).toEqual([0, 0]);
	});

	it('[ deleteGroup() ] group deletion check with delete pins SUCCESS ()', () => {
		const gpio = new GpioController({ mock: true });
		gpio.addGroup(ledsGroup, true);
		const before = gpio.getGroups().length;
		const countPinsBefore = gpio.getSoscket().size;
		gpio.deleteGroup(groupname1);
		const result = gpio.getGroups().length;
		const countPinsAfter = gpio.getSoscket().size;
		expect([before, result]).toEqual([1, 0]);
		expect([countPinsBefore, countPinsAfter]).toEqual([2, 0]);
	});

	it('[ getGroup() ] getGroup function test SUCCESS ()', () => {
		const gpio = new GpioController({ mock: true });
		gpio.addGroup(ledsGroup, false);
		const groupData = gpio.getGroups()[0];
		const check = gpio.getGroup(groupname1);
		expect(check).toEqual(groupData);
	});

	it('[ isExsistGroup() ] isExsistGroup function test SUCCESS ()', () => {
		const gpio = new GpioController({ mock: true });
		gpio.addGroup(ledsGroup, false);
		gpio.addGroup(buttonsGroup, false);
		const positivecheck = gpio.isExsistGroup(groupname2);
		const negativecheck = gpio.isExsistGroup('notnamegroup');
		expect(positivecheck).toEqual(1);
		expect(negativecheck).toEqual(-1);
	});

	it('[ addToGroup() ] addToGroup function test SUCCESS ()', () => {
		const gpio = new GpioController({ mock: true });
		gpio.addGroup(ledsGroup, false);
		gpio.addToGroup(groupname1, 13);
		const groupData = gpio.getGroup(groupname1);
		const check = groupData?.gpio.includes(13);
		expect(check).toBeTruthy();
	});

	it('[ switchGroupOn() ] switchGroupOn function test SUCCESS ()', async () => {
		const gpio = new GpioController({ mock: true });
		gpio.addGroup(ledsGroup);
		const pin10 = gpio.getPIN(10);
		const pin12 = gpio.getPIN(12);
		const before = [pin10?.readSync(), pin12?.readSync()];
		await gpio.switchGroupOn(groupname1);
		const after = [pin10?.readSync(), pin12?.readSync()];
		expect(before).toEqual([0, 0]);
		expect(after).toEqual([1, 1]);
	});

	it('[ switchGroupOff() ] switchGroupOff function test SUCCESS ()', async () => {
		const gpio = new GpioController({ mock: true });
		gpio.addGroup(ledsGroup);
		await gpio.switchGroupOn(groupname1);
		const pin10 = gpio.getPIN(10);
		const pin12 = gpio.getPIN(12);
		const before = [pin10?.readSync(), pin12?.readSync()];
		await gpio.switchGroupOff(groupname1);
		const after = [pin10?.readSync(), pin12?.readSync()];
		expect(before).toEqual([1, 1]);
		expect(after).toEqual([0, 0]);
	});

	it('[ switchGroupToggle() ] switchGroupToggle function test SUCCESS ()', async () => {
		const gpio = new GpioController({ mock: true });
		gpio.addGroup(ledsGroup);
		const pin10 = gpio.getPIN(10);
		const pin12 = gpio.getPIN(12);
		const before = [pin10?.readSync(), pin12?.readSync()];
		await gpio.switchGroupToggle(groupname1);
		const toggle1 = [pin10?.readSync(), pin12?.readSync()];
		await gpio.switchGroupToggle(groupname1);
		const toggle2 = [pin10?.readSync(), pin12?.readSync()];
		expect(before).toEqual([0, 0]);
		expect(toggle1).toEqual([1, 1]);
		expect(toggle2).toEqual([0, 0]);
	});

	it('[ watchGroup() ] watchGroup function test SUCCESS ()', async () => {
		const gpio = new GpioController({ mock: true });
		gpio.addGroup(buttonsGroup);
		const pin2: IOnoff = gpio.getPIN(2) as IOnoff;
		const pin3: IOnoff = gpio.getPIN(3) as IOnoff;
		let i = 0;
		const testCallback: PinValueCallback = (err, value) => {
			i++;
		};
		const button1 = new Button(pin2);
		const button2 = new Button(pin3);
		gpio.watchGroup(groupname2, testCallback);
		await button1.push();
		await button2.push();
		expect(i).toBe(4);
	});

	it('[ unwatchGroup() ] unwatchGroup function test SUCCESS ()', async () => {
		const gpio = new GpioController({ mock: true });
		gpio.addGroup(buttonsGroup);
		const pin2: IOnoff = gpio.getPIN(2) as IOnoff;
		const pin3: IOnoff = gpio.getPIN(3) as IOnoff;
		let i = 0;
		const testCallback: PinValueCallback = (err, value) => {
			i++;
		};
		const button1 = new Button(pin2);
		const button2 = new Button(pin3);
		gpio.watchGroup(groupname2, testCallback);
		await button1.push();
		await button2.push();
		gpio.unwatchGroup(groupname2, true);
		await button1.push();
		await button2.push();
		expect(i).toBe(4);
	});

	it('[ unexportGroup() ] unexportGroup function test SUCCESS ()', async () => {
		const gpio = new GpioController({ mock: true });
		gpio.addGroup(buttonsGroup);
		const pin2: IOnoff = gpio.getPIN(2) as IOnoff;
		const pin3: IOnoff = gpio.getPIN(3) as IOnoff;
		gpio.unexportGroup(groupname2);
		expect(pin2._unexport).toBe(true);
		expect(pin3._unexport).toBe(true);
	});
});
