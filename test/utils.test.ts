import { assert, test } from 'vitest';
import { WrappedKey } from '~/types.js';
import {
	createKey,
	getNextRegistrationId,
	isWrappedKey,
	resetRegistrationId,
	unwrapKey,
} from '~/uils.js';

test('#createKey creates a wrapped key', () => {
	const key = createKey<string>('mykey');

	assert.strictEqual(key.kind, WrappedKey);
	assert.strictEqual(key.name, 'mykey');
});

test('#isWrappedKey identifies wrapped keys', () => {
	const wrappedKey = createKey<number>('numberKey');

	assert.strictEqual(isWrappedKey(wrappedKey), true);
	assert.strictEqual(isWrappedKey({} as WrappedKey<any>), false);
});

test('#unwrapKey returns symbol for wrapped key', () => {
	const wrappedKey = createKey<boolean>('boolKey');
	const unwrapped = unwrapKey(wrappedKey);

	assert.strictEqual(unwrapped, wrappedKey.key);
});

test('#unwrapKey returns class for class key', () => {
	class Foobar {}
	const unwrapped = unwrapKey(Foobar);

	assert.strictEqual(unwrapped, Foobar);
});

test('#getNextRegistrationId returns incrementing ids', () => {
	const firstId = getNextRegistrationId();
	const secondId = getNextRegistrationId();
	resetRegistrationId();

	assert.isTrue(firstId < secondId);
});
