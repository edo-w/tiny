import { assert, test } from 'vitest';
import { LazyKey, WrappedKey } from '#src/types.js';
import {
	createKey,
	createLazyKey,
	getNextRegistrationId,
	isLazyKey,
	isWrappedKey,
	resetRegistrationId,
	unwrapKey,
} from '#src/uils.js';

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

test('#createLazyKey creates a lazy key', () => {
	const innerKey = createKey<string>('lazy-string');
	const lazyKey = createLazyKey(innerKey);

	assert.strictEqual(lazyKey.kind, LazyKey);
	assert.strictEqual(lazyKey.innerKey, innerKey);
});

test('#isLazyKey identifies lazy keys', () => {
	const lazyKey = createLazyKey(createKey<number>('lazy-number'));

	assert.strictEqual(isLazyKey(lazyKey), true);
	assert.strictEqual(isLazyKey({} as LazyKey<any>), false);
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
