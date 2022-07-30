import { Gpio } from 'onoff';
import { GpioMock } from './gpio-mock';
import { ERROR_PIN_NOT_INIT, ERROR_PIN_RANGE } from './gpio.constants';
import {
	BinaryValue,
	Direction,
	DirectionResolution,
	Edge,
	GroupGpio,
	IGpio,
	IGpioController,
	PinValueCallback,
	SetGroupParam,
	ValueCallback,
} from './gpio.interface';
import { IOnoff } from './onoff.interface';

/** */
export class GpioController implements IGpioController {
	static HIGH: BinaryValue = 1;
	static LOW: BinaryValue = 0;
	static DISABLE: -1;

	static MINPIN = 1;
	static MAXPIN = 40;

	private socket: Map<number, Gpio> = new Map();
	private groups: GroupGpio[] = [];

	public static GPIOACCESS = Gpio.accessible;

	// Разрешение на запись для разного типа настройки ввода / вывода;
	public directionResolution: DirectionResolution = {
		in: false,
		out: true,
		high: true,
		low: true,
	};

	// mock
	private mock = false;

	constructor(options?: { [key: string]: boolean }) {
		if (options?.mock) this.mock = options.mock;
	}

	public getSoscket(): Map<number, Gpio> {
		return new Map(this.socket);
	}

	public getGroups(): GroupGpio[] {
		return [...this.groups];
	}

	/**
	 ** Открывает к работе пин, либо мокает его из GpioMock, для разработки на компьтерах без GPIO
	 * 	Пин не добавляется в сокет.
	 *	При работе с GpioMock происходит эмуляция работы c GPIO библиотеки onoff
	 *
	 * @param  {IGpio} pin
	 * @returns IOnoff
	 */
	public createPin(pin: IGpio): IOnoff {
		const { gpio, direction, edge, options } = pin;
		if (this.mock) {
			return new GpioMock(gpio, direction, edge, options);
		}
		return new Gpio(gpio, direction, edge, options);
	}

	/**
	 ** Открывает в работу(создает) пин с заданными параметрами и добавляет его в this.socket
	 *
	 *  IGpio:
	 *
	 *  gpio: number - номер пина для инициализации
	 *
	 * 	direction: направление ввода/вывода('in' | 'out' | 'high' | 'low')
	 *
	 * 	edge?: Edge - область прерывания, используется для Direction: 'in'
	 *
	 * 	options?: {
	 * 		debounceTimeout?: number - Целое число без знака, указывающее миллисекундную задержку.
	 *			Задерживает вызов обратного вызова наблюдения для прерывания, генерирующего входной GPIO,
	 *			пока вход дребезжит. Обратный вызов наблюдения не будет вызываться до тех пор, пока ввод не прекратит
	 *			подпрыгивать и не будет находиться в стабильном состоянии в течение debounceTimeout миллисекунд.
	 *			Необязательно, если не указано, входной GPIO не будет дребезжать
	 *
	 * 		activeLow?: boolean - Логическое значение, указывающее, следует ли инвертировать значения,
	 * 			считанные из GPIO или записанные в него. Фронт генерации прерывания для GPIO также соответствует этому
	 * 			параметру. Допустимыми значениями для activeLow являются true и false.
	 * 			Установка activeLow в true инвертирует. Необязательно, значение по умолчанию — false.
	 *
	 * 	 	reconfigureDirection?: boolean - Логическое значение, указывающее, следует ли перенастроить направление
	 * 			для GPIO, даже если направление уже настроено правильно. Когда приложение запускается, направление GPIO,
	 * 			используемое этим приложением, может быть уже настроено правильно, например, из предыдущего запуска
	 * 			приложения. Изменение направления этого GPIO может привести к нежелательным побочным эффектам.
	 * 			Например, если GPIO уже сконфигурирован как выход и переконфигурирован как выход путем передачи «out»
	 * 			в конструктор, значение этого выхода будет установлено на 0. В некоторых приложениях это нежелательно,
	 * 			и значение вывод не должен быть изменен. Здесь может помочь параметр reconfigureDirection.
	 * 			Если для параметра reconfigureDirection задано значение false, направление GPIO, которое уже правильно
	 * 			настроено, не будет изменено. Необязательно, значение по умолчанию — true.
	 *	};
	 *
	 *
	 * @param  {IGpio} pin - параметры для создания пина
	 * @param  {boolean} rewrite=false - перезапись существующего пина, предидущее значение будет полностью обнулено
	 * @returns boolean
	 */
	public setPIN(pin: IGpio): boolean {
		const checkPin = this.getPIN(pin.gpio);
		if (!checkPin) {
			const { gpio, direction, edge, options } = pin;
			const newPin = this.createPin(pin);
			this.socket.set(pin.gpio, newPin);
			return true;
		}
		return false;
	}

	/**
	 ** Врзвращает существующий PIN по номеру, если он существует
	 *
	 *  @param  {number} gpio - номер пина
	 * @returns Gpio
	 */
	public getPIN(gpio: number): Gpio | IOnoff | undefined {
		if (gpio < GpioController.MINPIN || gpio > GpioController.MAXPIN) {
			throw new Error(ERROR_PIN_RANGE);
		}
		return this.socket.get(gpio);
	}

	/**
	 ** Изменение направления ВВОДА/ВЫВОДА пина (Direction)
	 * при измении типа на out | high | low - значение Edge устанавливается в none
	 *
	 * @param  {number} gpio - номер пина
	 * @param  {Direction} direction - напрвление 'in' | 'out' | 'high' | 'low'
	 * @returns boolean - false неудачно | true удачно
	 */
	public setPINDirection(gpio: number, direction: Direction): boolean {
		const pin = this.getPIN(gpio);
		if (pin) {
			if (direction !== 'in') {
				pin.setEdge('none');
			}
			pin.setDirection(direction);
			return true;
		}
		return false;
	}

	/**
	 ** Установка фронта прерывания для входного пина
	 * работает только с direction: 'in'
	 * при установке фронта прерывания, Direction автоматом устанавливается в 'in'
	 *
	 * @param  {number} gpio
	 * @param  {Edge} edge
	 * @returns boolean
	 */
	public setPINEdge(gpio: number, edge: Edge): boolean {
		const pin = this.getPIN(gpio);
		if (pin) {
			if (edge !== 'none') {
				pin.setDirection('in');
			}
			pin.setEdge(edge);
			return true;
		}
		return false;
	}

	/**
	 ** Инвертирует значение пина setActiveLow
	 *
	 * @param  {number} gpio - номер пина
	 * @param  {boolean} status - Логическое значение, указывающее, следует ли инвертировать значения,
	 * 	считанные из GPIO или записанные в него. Фронт генерации прерывания для GPIO также
	 *  соответствует этому параметру. Допустимыми значениями для инвертирования являются true и false.
	 *  Установка activeLow в true инвертирует.
	 * @returns void
	 */
	public invert(gpio: number, status: boolean): void {
		const pin = this.getPIN(gpio);
		if (pin) {
			pin.setActiveLow(status);
		}
	}

	/**
	 ** Возвращает значение true или false, указывающее, инвертированы ли значения,
	 ** считанные из GPIO или записанные в него.
	 *
	 * @param  {number} gpio - Номер пина для проверки
	 * @returns boolean true - инвертирован / false - нет
	 */
	public checkInvert(gpio: number): boolean | undefined {
		const pin = this.getPIN(gpio);
		if (pin) {
			return pin.activeLow();
		}
		return undefined;
	}

	/**
	 ** Полное удаление пина из сокета с выгрузкой(пин надо инициализировать заново)
	 * @param  {number} gpio - номер пина для удаления
	 * @returns void
	 */
	public deletePIN(gpio: number): void {
		const pin = this.getPIN(gpio);
		if (pin) {
			this.socket.delete(gpio);
			pin.unexport();
		}
	}

	/**
	 ** Задает обработчик событий для пина(-IN- Direction)
	 * работает только для Direction: in
	 *
	 * @param  {PinValueCallback} callback - callback функция для вызова
	 * @param  {number} gpio - номер пина
	 * @returns ValueCallback - возвращает декорированную функцию-слушатель, необходимо для снятия в unwatchPIN(ValueCallback, PIN)
	 */
	public watchPIN(
		callback: PinValueCallback,
		gpio: number,
		group?: string,
	): ValueCallback | undefined {
		const watchFunction: ValueCallback = (err: Error | null | undefined, value: BinaryValue) => {
			callback(err, value, gpio, group);
		};
		const pin = this.getPIN(gpio);
		if (pin) {
			pin.watch(watchFunction);
			return watchFunction;
		}
		return undefined;
	}
	/**
	 ** Удаляет callback-функцию слушателя возвращенную в качестве return параметра watchPIN
	 *
	 * @param  {ValueCallback} callback - функция для удаления
	 * @param  {number} gpio
	 * @returns boolean
	 */
	public unwatchPIN(callback: ValueCallback, gpio: number): boolean {
		const pin = this.getPIN(gpio);
		if (pin) {
			pin.unwatch(callback);
			return true;
		}
		return false;
	}
	/**
	 ** Удаляет все обработчики событий для заданного пина
	 *
	 *  @param  {number} gpio - номер пина для очистки
	 * @returns void
	 */
	public unwatchAllPIN(gpio: number): void {
		const pin = this.getPIN(gpio);
		if (pin) {
			pin.unwatchAll();
		}
	}

	/**
	 ** Задает значение равное 1 для пина(активация)
	 *
	 * !ВАЖНО: Если значение this.directionResolution.in = false, то изменение значения невозможно
	 * Работа с изменением значений пина возможна в случае Direction: 'out' | 'high' | 'low'
	 *
	 *  @param  {number} gpio - номер пина для задания значения
	 * @returns Promise
	 */
	public async switchOn(gpio: number): Promise<boolean> {
		if (this.directionResolutionCheck(gpio)) {
			return await this.writeSignal(gpio, GpioController.HIGH);
		}
		return false;
	}

	/**
	 ** Задает значение равное 0 для пина(деактивация)
	 *
	 * !ВАЖНО: Если значение this.directionResolution.in = false, то изменение значения невозможно
	 * Работа с изменением значений пина возможна в случае Direction: 'out' | 'high' | 'low'
	 *
	 * @param  {number} gpio - номер пина для задания значения
	 * @returns Promise
	 */
	public async switchOff(gpio: number): Promise<boolean> {
		if (this.directionResolutionCheck(gpio)) {
			return await this.writeSignal(gpio, GpioController.LOW);
		}
		return false;
	}

	/**
	 ** Меняет значение пина на обратное. Если 1 то будет задан 0, если 0 > 1
	 *
	 * !ВАЖНО: Если значение this.directionResolution.in = false, то изменение значения невозможно
	 * Работа с изменением значений пина возможна в случае Direction: 'out' | 'high' | 'low'
	 *
	 * @param  {number} gpio
	 * @returns Promise
	 */
	public async toggle(gpio: number): Promise<void> {
		const pin = this.getPIN(gpio);
		if (pin) {
			const value = await this.readSignal(gpio);
			if (value == 1) {
				this.switchOff(gpio);
			} else {
				this.switchOn(gpio);
			}
		}
	}

	/**
	 ** Деактивация пина, после выполнения пин необходимо инициализировать заново!
	 *
	 * @param  {number} gpio
	 * @returns void
	 */
	public unexport(gpio: number): void {
		const pin = this.getPIN(gpio);
		if (pin) {
			pin.unexport();
		}
	}

	/**
	 ** Проверка разрешения подачи сигнала на пин в зависимости от типа Direction
	 * задается в this.directionResolution
	 *
	 * @param  {number} gpio - номер пина
	 * @returns boolean - true/false
	 */
	private directionResolutionCheck(gpio: number): boolean {
		const pin = this.getPIN(gpio);
		if (pin) {
			const direction = pin?.direction();
			return this.directionResolution[direction];
		}
		return false;
	}

	/**
	 ** Читает значение состояния пина, возможны два значения: 0 или 1
	 *
	 * @param  {number} gpio - номер пина для чтения состояния
	 * @returns Promise
	 */
	public readSignal(gpio: number): Promise<BinaryValue> {
		return new Promise((resolve, reject) => {
			const pin = this.getPIN(gpio);
			if (pin) {
				pin.read((err: any, value: BinaryValue) => {
					if (err) reject(err);
					resolve(value);
				});
			} else {
				reject(new Error(ERROR_PIN_NOT_INIT));
			}
		});
	}

	/**
	 ** Изменение значения состояния пина, принимает 2 значения: 0 или 1
	 * @param  {number} pinNumber - номер пина для записи
	 * @param  {BinaryValue} signal - значение для записи 0 или 1
	 * @returns Promise
	 */
	public writeSignal(pinNumber: number, signal: BinaryValue): Promise<boolean> {
		return new Promise((resolve, reject) => {
			const pin = this.getPIN(pinNumber);
			if (!this.directionResolutionCheck(pinNumber)) resolve(false);
			if (pin) {
				pin.write(signal, (err) => {
					if (err) {
						reject(err);
					}
					resolve(true);
				});
			}
			resolve(false);
		});
	}

	/**
	 ** Проверка типа входа/выхода(direction) пинов для заданной группы.
	 *	Тип для группы должен быть одинаковым.
	 *	Возвращает массив номеров пинов не соотвествующих заданному условию проверки,
	 * 	либо пустой массив
	 *
	 * @param  {number[]} pins 				- массив номеров пинов
	 * @param  {Direction} direction	- тип входа/выхода пина direction: in/out
	 * @returns {number[]} 						- массив номеров пинов не соотвествующих заданному direction
	 */
	public checkGroupDirection(pins: number[], direction: Direction): number[] {
		const check: number[] = [];
		pins.forEach((e) => {
			const pin = this.getPIN(e);
			if (pin) {
				if (pin.direction() !== direction) {
					check.push(e);
				}
			} else {
				check.push(e);
			}
		});
		return check;
	}

	/**
	 ** Задает тип Direction для всех пинов группы, если указанный пин существует
	 *
	 * @param  {string} groupid - ID группы
	 * @param  {Direction} direction -  напрваление ввода/вывода для пинов
	 * @returns void
	 */
	public setGroupDirection(groupid: string, direction: Direction): void {
		const group = this.getGroup(groupid);
		if (group) {
			group.gpio.forEach((el: number) => {
				const pin: Gpio | undefined = this.getPIN(el);
				if (pin) {
					pin.setDirection(direction);
				}
			});
		}
	}

	/**
	 ** Возвращает массив группы со значением Direction для каждого типа
	 * Пример возврата для пинов 11 и 12 имеющих direction: out
	 * [[11, 'out'],[12, 'out']]
	 * @param  {string} groupid - id группы
	 * @returns Array
	 */
	public getGroupDirection(groupid: string): Array<[number, Direction]> {
		const groupDirection: Array<[number, Direction]> = [];
		const group = this.getGroup(groupid);
		if (group) {
			group.gpio.forEach((el: number) => {
				const pin: Gpio | undefined = this.getPIN(el);
				if (pin) {
					const pinDirection: [number, Direction] = [el, pin.direction()];
					groupDirection.push(pinDirection);
				}
			});
		}
		return groupDirection;
	}

	/**
	 ** Установка фронта прерывания группы(работает только для Direction = 'in' пинов)
	 * фронт перрывания автоматически меняет Direction пина
	 * если знаенчие 'none' - Direction пина не меняется
	 *
	 * @param  {string} groupid - id группы
	 * @param  {Edge} edge - значение фронта прерывания пина 'none' | 'rising' | 'falling' | 'both'
	 * @returns void
	 */
	setGroupEdge(groupid: string, edge: Edge): void {
		const group = this.getGroup(groupid);
		if (group) {
			group.gpio.forEach((gpio: number) => {
				this.setPINEdge(gpio, edge);
			});
		}
	}

	/**
	 ** Инвертирует значение пинов группы setLowActive
	 *
	 * @param  {string} groupid - id группы
	 * @param  {boolean} status - значение true инверсия / false без инверсии
	 * @returns void
	 */
	public invertGroup(groupid: string, status: boolean): void {
		const group = this.getGroup(groupid);
		if (group) {
			group.gpio.forEach((gpio: number) => {
				this.invert(gpio, status);
			});
		}
	}

	/**
	 ** Быстрая иницилизация пинов в группе, которые не были инициализированны.
	 * автоматически инициализирует пины по заданным в группе параметрам
	 * добавляет только тип  Direction, для более сложно взаимодействия
	 * либо инициализация нужного пина отдельно, либо применять групповые методы
	 *
	 * @param  {number[]} pins - массив пинов
	 * @param  {Direction} direction - тип ввода/вывода
	 * @returns number[] - возвращает массив с номерами пинов, которые не были инициализированны раньше
	 * и были инициализированны методом
	 */
	public fillGroupMissingPins(pins: number[], direction: Direction): number[] {
		const createdPins: number[] = [];
		pins.forEach((gpio: number) => {
			const pin = this.getPIN(gpio);
			if (!pin) {
				createdPins.push(gpio);
				this.setPIN({ gpio, direction });
			}
		});
		return createdPins;
	}

	/**
	 ** Простое создание группы пинов с одинаковым типом direction и автоинициализацийей
	 * GroupGpio {
	 * 	groupid:				- наименование группы
	 *	direction:			- направление входа/выхода(Direction) для всей группы
	 *	switch:					- начальное значение High | Low | Disable (1|0|-1), при -1 значения не устанавливаются
	 *	gpio:						- массив номеров пинов группы
	 *	watchCallback?:	- callback вызывается при watch любого пина группы
	 * }
	 *
	 * @param  {GroupGpio} group 	- параметры для создания группы
	 * @param {boolean} createEmpty - инициализация пинов, если не были инициализированны ранее
	 * @returns boolean	- true создано / false ошибка создания группы
	 */
	public addGroup(group: GroupGpio, createEmpty = true): boolean {
		return this.setGroup(group, { createEmpty, setSingleDirection: true });
	}

	/**
	 ** Создание/Обновление группы c параметрами
	 * SetGroupParam:
	 *  overwriting(default: false)					- перезаписывать группу, если существует
	 *  setSingleDirection(default: false)	- задать единый тип Direction для всех пинов
	 *  createEmpty(default: false)					- инициализировать пины если не заданы с Direction группы
	 * @param  {GroupGpio} group 			- данные создаваемой/изменяемой группы
	 * @param  {SetGroupParam} param	- параметры
	 * @returns boolean
	 */
	setGroup(group: GroupGpio, param?: SetGroupParam): boolean {
		const defaultParam = { overwriting: false, setSingleDirection: false, createEmpty: false };
		const checkgroup = this.getGroup(group.groupid);
		const { overwriting, setSingleDirection, createEmpty } = Object.assign(defaultParam, param);
		if (!overwriting && checkgroup) {
			return false;
		}
		if (overwriting) {
			this.deleteGroup(group.groupid);
		}

		this.groups.push(group);

		if (createEmpty) {
			this.fillGroupMissingPins(group.gpio, group.direction);
		}

		if (setSingleDirection) {
			this.setGroupDirection(group.groupid, group.direction);
		}

		if (group.edge) {
			this.setGroupEdge(group.groupid, group.edge);
		}

		if (group.watch) {
			this.watchGroup(group.groupid, group.watch);
		}

		if (group.switch) {
			if (group.switch == GpioController.HIGH) {
				this.switchGroupOn(group.groupid);
			}
			if (group.switch == GpioController.LOW) {
				this.switchGroupOff(group.groupid);
			}
		}
		return true;
	}

	/**
	 ** Удаление группы, при параметре deletePins = true, происходит деактивация пинов группы
	 * Для деактивации пинов, без удаления группы - this.unexportGroup
	 *
	 * @param  {string} groupid - id группы
	 * @param  {boolean} deletePins=true - true происходит деактивация пинов группы и удаление из сокета
	 * @returns void
	 */
	deleteGroup(groupid: string, deletePins = true): void {
		const deleteGroupIndex = this.isExsistGroup(groupid);
		if (deleteGroupIndex > -1) {
			if (deletePins) {
				this.unexportGroup(groupid, true);
			}
			const newGroups: any = this.groups.filter((el: GroupGpio) =>
				el.groupid !== groupid ? true : false,
			);
			this.groups = newGroups;
		}
	}

	/**
	 ** Проверка существования группы
	 *
	 * @param  {string} groupid - id группы
	 * @returns number
	 * 	-1 группа не найдена
	 * 	>=0 индекс элемента в массиве this.groups, группа существует
	 */
	isExsistGroup(groupid: string): number {
		return this.groups.findIndex((el: GroupGpio) => el.groupid == groupid);
	}

	/**
	 ** Поиск и выдача параметров группы
	 *
	 * @param  {string} groupid - id группы
	 * @returns GroupGpio
	 */
	getGroup(groupid: string): GroupGpio | undefined {
		return this.groups.find((el: GroupGpio) => el.groupid == groupid);
	}

	/**
	 ** Обновление параметров группы(простое обновление)
	 * Если группа существует, данные будут переписаны, старая группа удалена.
	 *
	 *  @param  {GroupGpio} group - группа для обновления
	 * @returns boolean
	 */
	updateGroup(group: GroupGpio): boolean {
		return this.setGroup(group, { overwriting: true });
	}

	/**
	 ** Добавление пина в группу
	 * группа будет перезаписана с указанными в param параметрами
	 *
	 * @param  {string} groupid - id группы для добавления пина
	 * @param  {number} gpio - номер пина для добавления
	 * @param  {number} param - парметры для перезаписи группы метод setGroup
	 *
	 * @returns boolean
	 */
	addToGroup(groupid: string, gpio: number, param?: SetGroupParam): boolean {
		const group: GroupGpio | undefined = this.getGroup(groupid);
		if (!group) return false;
		if (group.gpio.includes(gpio)) return false;
		group.gpio.push(gpio);
		const addParam = { overwriting: true, ...param };
		this.setGroup(group, addParam);
		return true;
	}

	/**
	 ** Устанавливает значение всех пинов группы в 1
	 *
	 *  @param  {string} groupid - id группы
	 * @returns void
	 */
	async switchGroupOn(groupid: string): Promise<void> {
		const group = this.getGroup(groupid);
		if (group) {
			group.gpio.forEach((el: number) => {
				this.switchOn(el);
			});
		}
	}

	/**
	 ** Устанавливает значение всех пинов группы в 0
	 * @param  {string} groupid - id группы
	 * @returns void
	 */
	async switchGroupOff(groupid: string): Promise<void> {
		const group = this.getGroup(groupid);
		if (group) {
			group.gpio.forEach(async (el: number) => {
				await this.switchOff(el);
			});
		}
	}

	/**
	 ** Меняет значение всех пинов группы на противоположное
	 *
	 * @param  {string} groupid - id группы
	 * @returns void
	 */
	async switchGroupToggle(groupid: string): Promise<void> {
		const group = this.getGroup(groupid);
		if (group) {
			group.gpio.forEach(async (el: number) => {
				await this.toggle(el);
			});
		}
	}

	private setGroupCallback(group: GroupGpio, pin: number, callback: ValueCallback): void {
		if (!group.watchCallback) {
			group.watchCallback = new Map();
		}
		group.watchCallback.set(pin, callback);
	}

	private getGroupCallback(group: GroupGpio, pin: number): ValueCallback | undefined {
		return group?.watchCallback?.get(pin);
	}

	/**
	 ** Задает функцию callback для слушателя группы. Функция будет назначена для каждого пина группы.
	 ** Вызов функции будет происходит каждый раз при срабатывании заданного события в Edge
	 *
	 * @param  {string} groupid - id группы
	 * @param  {PinValueCallback} callback? - функция-callback
	 * 	PinValueCallback:
	 * 		err: Error | null | undefined - ошибка
	 * 		value: BinaryValue - значение пина
	 * 		pin?: number - номер пина
	 * 		group?: string - номер группы в которой был вызван пин(опционально)
	 *
	 * @param  {} saveCallback=true - true - сохранить callback в группе
	 * @returns void
	 */
	watchGroup(groupid: string, callback?: PinValueCallback, saveCallback = true): void {
		const group = this.getGroup(groupid);
		if (!callback) {
			if (group?.watch) {
				callback = group.watch;
			} else {
				return;
			}
		}
		if (group) {
			group.gpio.forEach((el: number) => {
				const decorateCallback = this.watchPIN(callback as PinValueCallback, el, groupid);
				if (saveCallback) {
					this.setGroupCallback(group, el, decorateCallback as ValueCallback);
				}
			});
		}
	}

	/**
	 ** Удалет слушателя для группы
	 *
	 *  @param  {string} groupid - id группы
	 * @param  {} deleteCallback=false - очистить функцию-callback в группе, если не очищать, при обновлении группы слушатель будет создан автоматически
	 * @returns void
	 */
	unwatchGroup(groupid: string, deleteCallback = false): void {
		const group = this.getGroup(groupid);
		if (group) {
			if (group.watchCallback) {
				group.gpio.forEach((el: number) => {
					const unwatchCallback: ValueCallback | undefined = this.getGroupCallback(group, el);
					if (unwatchCallback) {
						this.unwatchPIN(unwatchCallback, el);
					}
				});
				group.watchCallback = undefined;
				if (deleteCallback) {
					group.watch = undefined;
				}
			}
		}
	}

	/**
	 ** Очищает всех слушателей у каждого пина группы
	 *
	 *  @param  {string} groupid - id группы
	 * @returns void
	 */
	unwatchGroupAll(groupid: string): void {
		const group = this.getGroup(groupid);
		if (group) {
			group.gpio.forEach((el: number) => {
				this.unwatchAllPIN(el);
			});
			group.watch = undefined;
			group.watchCallback = undefined;
		}
	}

	unexportGroup(groupid: string, deletepins = false): void {
		const group = this.getGroup(groupid);
		if (group) {
			group.gpio.forEach((el: number) => {
				if (deletepins) {
					this.deletePIN(el);
				} else {
					this.unexport(el);
				}
			});
		}
	}
}
