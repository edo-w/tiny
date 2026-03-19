import { type RegisterKey, type ResolveKey, WrappedKey } from './types.js';

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
 * Checks whether a resolve key is a wrapped key.
 */
export function isWrappedKey<TComponent>(key: ResolveKey<TComponent>): key is WrappedKey<TComponent> {
	return typeof key === 'object' && key.kind === WrappedKey;
}

/**
 * Converts a resolve key into a registry key.
 */
export function unwrapKey<TComponent>(resolveKey: ResolveKey<TComponent>): RegisterKey {
	if (isWrappedKey(resolveKey)) {
		return resolveKey.key;
	}

	return resolveKey;
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
