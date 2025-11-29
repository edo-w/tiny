import { RegisterKey, Registration } from './types.js';

export class Registry {
	private items: Map<RegisterKey, Registration[]>;

	constructor() {
		this.items = new Map();
	}

	add(registration: Registration): void {
		let list = this.items.get(registration.key);
		if (!list) {
			list = [];
			this.items.set(registration.key, list);
		}

		list.push(registration);
	}

	find(key: RegisterKey): Registration | undefined {
		const list = this.items.get(key);
		if (!list) {
			return undefined;
		}

		/* v8 ignore next -- @preserve */
		if (list.length === 0) {
			return undefined;
		}

		const last = list.length - 1;
		const reg = list[last];
		return reg;
	}

	has(key: RegisterKey): boolean {
		return !!this.find(key);
	}

	getAll(key: RegisterKey): Registration[] | undefined {
		const list = this.items.get(key);
		return list;
	}
}
