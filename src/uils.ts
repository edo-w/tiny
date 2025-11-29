import { RegisterKey, ResolveKey, WrappedKey } from './types.js';

export function createKey<TComponent>(name: string): WrappedKey<TComponent> {
	return {
		kind: WrappedKey,
		name,
		key: Symbol(name),
	};
}

export function isWrappedKey<TComponent>(key: ResolveKey<TComponent>): key is WrappedKey<TComponent> {
	return typeof key === 'object' && key.kind === WrappedKey;
}

export function unwrapKey<TComponent>(resolveKey: ResolveKey<TComponent>): RegisterKey {
	if (isWrappedKey(resolveKey)) {
		return resolveKey.key;
	}

	return resolveKey;
}

let lastRegistrationId = 0;

export function getNextRegistrationId(): number {
	lastRegistrationId += 1;
	return lastRegistrationId;
}

export function resetRegistrationId(): void {
	lastRegistrationId = 0;
}
