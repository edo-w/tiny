/**
 * Represents a class constructor that creates instances of `T`.
 */
export interface ClassType<T> {
	new (...args: any[]): T;
}

/**
 * Delays component resolution until `get()` is called.
 */
export interface Lazy<TComponent> {
	get(): TComponent;
}

/**
 * Maps a class constructor parameter list to DI resolution keys.
 */
// biome-ignore format: readable
export type ClassDeps<TClass extends ClassType<any>> = ConstructorParameters<TClass> extends [...infer Params]
	? { [K in keyof Params]: ResolveKey<Params[K]> }
	: never;

/**
 * Tiny context passed to factories and helper utilities.
 */
export interface TinyContext {
	has<TComponent>(key: ResolveKey<TComponent>): boolean;
	getSafe<TKey extends ResolveKey>(key: TKey): ResolveResult<TKey> | undefined;
	get<TKey extends ResolveKey>(key: TKey): ResolveResult<TKey>;
}

/**
 * Factory callback used to build a component from the current container.
 */
export type FactoryFn<TComponent> = (t: TinyContext) => TComponent;

/**
 * Internal key type used by the registry.
 *
 * Wrapped keys are unwrapped into `symbol` or class values before registration.
 */
export type RegistrationKey = symbol | ClassType<any>;

/**
 * Runtime registration entry stored in the container registry.
 */
export interface Registration {
	id: number;
	key: RegistrationKey;
	lifetime: Lifetime;
	factory: FactoryFn<any>;
}

/**
 * Marker symbol that identifies wrapped typed keys created with `createKey`.
 */
export const WrappedKey = Symbol('tiny:WrappedKey');

/**
 * Marker symbol that identifies lazy keys created with `createLazyKey`.
 */
export const LazyKey = Symbol('tiny:LazyKey');

/**
 * Strongly-typed key wrapper for non-class registrations.
 */
// biome-ignore lint/correctness/noUnusedVariables: generic type used for type safety, not runtime values
export interface WrappedKey<TComponent> {
	kind: typeof WrappedKey;
	name: string;
	key: symbol;
}

/**
 * Resolve key that defers resolution of another key until `get()` is called.
 */
export interface LazyKey<TComponent> {
	kind: typeof LazyKey;
	name: string;
	innerKey: ComponentKey<TComponent>;
}

/**
 * Key used to resolve a component from the container.
 *
 * Can be a wrapped typed key, a class constructor, or a lazy wrapper around another resolve key.
 */
export type ResolveKey<TComponent = any> = WrappedKey<TComponent> | ClassType<TComponent> | LazyKey<TComponent>;

/**
 * Key used to register a component in the container.
 */
export type ComponentKey<TComponent = any> = WrappedKey<TComponent> | ClassType<TComponent>;

export type ResolveResult<TKey> =
	TKey extends WrappedKey<infer TComponent>
		? TComponent
		: TKey extends ClassType<infer TComponent>
			? TComponent
			: TKey extends LazyKey<infer TComponent>
				? Lazy<TComponent>
				: never;

/**
 * Controls caching behavior for a registration.
 */
export type Lifetime = 'singleton' | 'scoped' | 'transient';

/**
 * Contract implemented by registration builders to produce registry entries.
 */
export interface RegistrationBuilder {
	build(): Registration[];
}
