export interface ClassType<T> {
	new (...args: any[]): T;
}

export type ClassArgs<TClass extends ClassType<any>> =
	ConstructorParameters<TClass> extends [...infer Params]
		? { [K in keyof Params]: ResolveKey<Params[K]> }
		: never;

export interface TinyContext {
	has<TComponent>(key: ResolveKey<TComponent>): boolean;
	safeGet<TComponent>(key: ResolveKey<TComponent>): TComponent | undefined;
	get<TComponent>(key: ResolveKey<TComponent>): TComponent;
}

export type FactoryFn<TComponent> = (t: TinyContext) => TComponent;

export type RegisterKey = symbol | ClassType<any>;

export interface Registration {
	id: number;
	key: RegisterKey;
	lifetime: Lifetime;
	factory: FactoryFn<any>;
}

export const WrappedKey = Symbol('tiny:WrappedKey');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface WrappedKey<TComponent> {
	kind: typeof WrappedKey;
	name: string;
	key: symbol;
}

export type ResolveKey<TComponent = any> = WrappedKey<TComponent> | ClassType<TComponent>;

export type Lifetime =
	| 'singleton'
	| 'scoped'
	| 'transient';

export interface RegistrationBuilder {
	build(): Registration[];
}
