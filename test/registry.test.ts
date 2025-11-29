import { assert, test } from 'vitest';
import { Registration } from '~/types.js';
import { createKey } from '~/uils.js';
import { Registry } from '../src/registry.js';

test('can create class', () => {
	const registry = new Registry();
	assert.instanceOf(registry, Registry);
});

test('#add can add registration with wrapped key', () => {
	const registry = new Registry();
	const wrappedKey = createKey<string>('testKey');
	const registration: Registration = {
		id: 0,
		key: wrappedKey.key,
		lifetime: 'transient',
		factory: () => 'test',
	};

	registry.add(registration);
	const actual = registry.find(wrappedKey.key);

	assert.strictEqual(actual, registration);
});

test('#add can add registration with class key', () => {
	class Foobar {
		print() {
			return 'foobar';
		}
	}

	const registry = new Registry();
	const classKey = Foobar;
	const registration: Registration = {
		id: 0,
		key: classKey,
		lifetime: 'transient',
		factory: () => new Foobar(),
	};

	registry.add(registration);
	const actual = registry.find(classKey);

	assert.strictEqual(actual, registration);
});

test('#has returns true if registration key exists', () => {
	const registry = new Registry();
	const wrappedKey = createKey<string>('mykey');
	const registration: Registration = {
		id: 0,
		key: wrappedKey.key,
		lifetime: 'transient',
		factory: () => 'value',
	};

	registry.add(registration);

	assert.isTrue(registry.has(wrappedKey.key));
});

test('#find returns undefined if item has not been added', () => {
	const registry = new Registry();
	const wrappedKey = createKey<string>('nonExistentKey');
	const found = registry.find(wrappedKey.key);

	assert.isUndefined(found);
});

test('#find returns last registration when multiple registrations with same key are added', () => {
	const registry = new Registry();
	const wrappedKey = createKey<string>('duplicateKey');
	const registration1: Registration = {
		id: 0,
		key: wrappedKey.key,
		lifetime: 'transient',
		factory: () => 'first',
	};
	const registration2: Registration = {
		id: 1,
		key: wrappedKey.key,
		lifetime: 'transient',
		factory: () => 'second',
	};

	registry.add(registration1);
	registry.add(registration2);

	const actual = registry.find(wrappedKey.key);
	assert.strictEqual(actual, registration2);
});

test('#getAll returns all registrations for the same key', () => {
	const registry = new Registry();
	const wrappedKey = createKey<string>('multiKey');
	const registration1: Registration = {
		id: 0,
		key: wrappedKey.key,
		lifetime: 'transient',
		factory: () => 'first',
	};
	const registration2: Registration = {
		id: 1,
		key: wrappedKey.key,
		lifetime: 'transient',
		factory: () => 'second',
	};

	registry.add(registration1);
	registry.add(registration2);

	const allRegistrations = registry.getAll(wrappedKey.key);

	assert.deepEqual(allRegistrations, [registration1, registration2]);
});

test('#getAll return undefined if no registrations exist for the key', () => {
	const registry = new Registry();
	const wrappedKey = createKey<string>('emptyKey');
	const allRegistrations = registry.getAll(wrappedKey.key);

	assert.isUndefined(allRegistrations);
});
