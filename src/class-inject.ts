import { ContainerNotFoundError } from './errors.js';
import type { Tiny } from './tiny.js';
import type { ResolveKey, ResolveResult } from './types.js';

const tinyStack: Tiny[] = [];

/**
 * Clears the container stack used by property injection helpers.
 */
export function resetStack(): void {
	tinyStack.length = 0;
}

/**
 * Returns the current container from the top of the stack.
 */
export function peekTinyStack(): Tiny | undefined {
	return tinyStack[tinyStack.length - 1];
}

/**
 * Pushes a container to the stack.
 *
 * Returns `false` when the same container is already on top.
 */
export function pushTinyStack(tiny: Tiny): boolean {
	const current = peekTinyStack();
	if (current === tiny) {
		return false;
	}

	tinyStack.push(tiny);
	return true;
}

/**
 * Pops the current container from the stack.
 */
export function popTinyStack(): void {
	tinyStack.pop();
}

/**
 * Gets the current container or throws when no container is active.
 */
export function getCurrentTiny(): Tiny {
	const current = peekTinyStack();
	if (!current) {
		throw new ContainerNotFoundError(
			'Current container not found. Please ensure you are creating a class instance from a tiny container and not directly with "new".',
		);
	}

	return current;
}

/**
 * Resolves a component from the current container during class initialization.
 */
export function inject<TKey extends ResolveKey>(key: TKey): ResolveResult<TKey> {
	const current = getCurrentTiny();
	return current.get(key);
}
