import type { Registration, RegistrationKey } from './types.js';

/**
 * Internal registration store keyed by class or symbol.
 */
export class Registry {
	private items: Map<RegistrationKey, Registration[]>;

	constructor() {
		this.items = new Map();
	}

	/**
	 * Appends a registration to a key.
	 */
	add(registration: Registration): void {
		let list = this.items.get(registration.key);
		if (!list) {
			list = [];
			this.items.set(registration.key, list);
		}

		list.push(registration);
	}

	/**
	 * Returns the latest registration for a key.
	 */
	find(key: RegistrationKey): Registration | undefined {
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

	/**
	 * Checks whether a key has at least one registration.
	 */
	has(key: RegistrationKey): boolean {
		return !!this.find(key);
	}

	/**
	 * Returns all registrations for a key.
	 */
	getAll(key: RegistrationKey): Registration[] | undefined {
		const list = this.items.get(key);
		return list;
	}
}
