import { type ComponentKey, LazyKey, type RegistrationKey, type ResolveKey, WrappedKey } from './types.js';

/**
 * Creates a strongly-typed wrapped key for non-class registrations.
 */
export function createKey<TComponent>(name: string): WrappedKey<TComponent> {
	return {
		kind: WrappedKey,
		name,
		key: Symbol(name),
	};
}

/**
 * Creates a lazy key that defers resolution of another key.
 */
export function createLazyKey<TComponent>(innerKey: ComponentKey<TComponent>): LazyKey<TComponent> {
	return {
		kind: LazyKey,
		name: `lazy:${innerKey.name}`,
		innerKey,
	};
}

/**
 * Checks whether a resolve key is a wrapped key.
 */
export function isWrappedKey<TComponent>(key: ResolveKey<TComponent>): key is WrappedKey<TComponent> {
	return typeof key === 'object' && key.kind === WrappedKey;
}

/**
 * Checks whether a resolve key is a lazy key.
 */
export function isLazyKey<TComponent>(key: ResolveKey<TComponent>): key is LazyKey<TComponent> {
	return typeof key === 'object' && key.kind === LazyKey;
}

/**
 * Converts a resolve key into a registry key.
 */
export function unwrapKey<TComponent>(key: ResolveKey<TComponent>): RegistrationKey {
	if (isWrappedKey(key)) {
		return key.key;
	}

	if (isLazyKey(key)) {
		return unwrapKey(key.innerKey);
	}

	return key;
}

let lastRegistrationId = 0;

/**
 * Returns the next registration id.
 */
export function getNextRegistrationId(): number {
	lastRegistrationId += 1;
	return lastRegistrationId;
}

/**
 * Resets registration IDs.
 */
export function resetRegistrationId(): void {
	lastRegistrationId = 0;
}
