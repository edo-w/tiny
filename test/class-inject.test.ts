import { assert, test } from 'vitest';
import {
	getCurrentTiny,
	peekTinyStack,
	popTinyStack,
	pushTinyStack,
	resetStack,
} from '#src/class-inject.js';
import { Tiny } from '#src/tiny.js';

test('can push tiny stack', () => {
	try {
		const tiny = new Tiny();

		pushTinyStack(tiny);
		const current = getCurrentTiny();

		assert.strictEqual(current, tiny);
	}
	finally {
		resetStack();
	}
});

test('can pop tiny stack', () => {
	try {
		const tiny = new Tiny();

		pushTinyStack(tiny);
		const current = getCurrentTiny();

		assert.strictEqual(current, tiny);

		popTinyStack();
		const peek = peekTinyStack();
		assert.isUndefined(peek);
	}
	finally {
		resetStack();
	}
});

test('getCurrentTiny throws if no current tiny', () => {
	resetStack();
	assert.throws(() => getCurrentTiny());
});

test('peekTinyStack returns undefined if stack is empty', () => {
	resetStack();
	const peek = peekTinyStack();
	assert.isUndefined(peek);
});
