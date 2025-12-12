import { CurrentContainerNotFoundError } from './errors.js';
import { Tiny } from './tiny.js';
import { ResolveKey } from './types.js';

const tinyStack: Tiny[] = [];

export function resetStack(): void {
	tinyStack.length = 0;
}

export function peekTinyStack(): Tiny | undefined {
	return tinyStack[tinyStack.length - 1];
}

export function pushTinyStack(tiny: Tiny): boolean {
	const current = peekTinyStack();
	if (current === tiny) {
		return false;
	}

	tinyStack.push(tiny);
	return true;
}

export function popTinyStack(): void {
	tinyStack.pop();
}

export function getCurrentTiny(): Tiny {
	const current = peekTinyStack();
	if (!current) {
		throw new CurrentContainerNotFoundError('Current container not found. Please ensure you are creating a class instance from a tiny container and not directly with "new".');
	}

	return current;
}

export function inject<TComponent>(key: ResolveKey<TComponent>): TComponent {
	const current = getCurrentTiny();
	return current.get(key);
}
