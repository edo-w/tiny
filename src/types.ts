/**
 * Represents a class constructor that creates instances of `T`.
 */
export interface ClassType<T> {
	new (...args: any[]): T;
}

/**
 * Maps a class constructor parameter list to DI resolution keys.
 *
 * Use this when registering class dependencies in constructor order.
 */
export type ClassParameters<TClass extends ClassType<any>> =
	ConstructorParameters<TClass> extends [...infer Params]
		? { [K in keyof Params]: ResolveKey<Params[K]> }
		: never;

/**
 * Tiny context passed to factories and helper utilities.
 */
export interface TinyContext {
	has<TComponent>(key: ResolveKey<TComponent>): boolean;
	getSafe<TComponent>(key: ResolveKey<TComponent>): TComponent | undefined;
	get<TComponent>(key: ResolveKey<TComponent>): TComponent;
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
export type RegisterKey = symbol | ClassType<any>;

/**
 * Runtime registration entry stored in the container registry.
 */
export interface Registration {
	id: number;
	key: RegisterKey;
	lifetime: Lifetime;
	factory: FactoryFn<any>;
}

/**
 * Marker symbol that identifies wrapped typed keys created with `createKey`.
 */
export const WrappedKey = Symbol('tiny:WrappedKey');

/**
 * Strongly-typed key wrapper for non-class registrations.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface WrappedKey<TComponent> {
	kind: typeof WrappedKey;
	name: string;
	key: symbol;
}

/**
 * Key used to resolve a component from the container.
 *
 * Can be either a wrapped typed key or a class constructor.
 */
export type ResolveKey<TComponent = any> = WrappedKey<TComponent> | ClassType<TComponent>;

/**
 * Controls caching behavior for a registration.
 */
export type Lifetime =
	| 'singleton'
	| 'scoped'
	| 'transient';

/**
 * Contract implemented by registration builders to produce registry entries.
 */
export interface RegistrationBuilder {
	build(): Registration[];
}
