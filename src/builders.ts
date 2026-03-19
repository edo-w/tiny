import { ClassFactory } from './class-factory.js';
import type { ClassType, FactoryFn, Lifetime, Registration, RegistrationBuilder, ResolveKey } from './types.js';
import { getNextRegistrationId, unwrapKey } from './uils.js';

/**
 * Builder for instance registrations.
 */
export class InstanceBuilder<TComponent> implements RegistrationBuilder {
	private key: ResolveKey<TComponent>;
	private instance: TComponent;

	constructor(key: ResolveKey<TComponent>, instance: TComponent) {
		this.key = key;
		this.instance = instance;
	}

	build(): Registration[] {
		const id = getNextRegistrationId();
		const registerKey = unwrapKey(this.key);
		const lifetime: Lifetime = 'transient';
		const instance = this.instance;
		const factory: FactoryFn<TComponent> = () => {
			return instance;
		};

		const registration: Registration = {
			id,
			key: registerKey,
			lifetime,
			factory,
		};

		return [registration];
	}
}

/**
 * Builder for class registrations.
 */
export class ClassBuilder<TComponent extends ClassType<any>> implements RegistrationBuilder {
	private classType: ClassType<TComponent>;
	private keys: ResolveKey[];
	private _lifetime: Lifetime;
	private _deps: ResolveKey[];

	constructor(classType: ClassType<TComponent>, deps: ResolveKey[]) {
		this.classType = classType;
		this.keys = [classType];
		this._lifetime = 'transient';
		this._deps = deps;
	}

	build(): Registration[] {
		const registrations: Registration[] = [];
		const classFactory = new ClassFactory(this.classType, this._deps);
		const factory = classFactory.create.bind(classFactory);

		for (const key of this.keys) {
			const id = getNextRegistrationId();
			const registerKey = unwrapKey(key);
			const lifetime = this._lifetime;
			const registration: Registration = {
				id,
				key: registerKey,
				lifetime,
				factory,
			};

			registrations.push(registration);
		}

		return registrations;
	}

	/**
	 * Sets registration lifetime.
	 */
	lifetime(lifetime: Lifetime): this {
		this._lifetime = lifetime;
		return this;
	}

	/**
	 * Sets singleton lifetime.
	 */
	singleton(): this {
		return this.lifetime('singleton');
	}

	/**
	 * Sets scoped lifetime.
	 */
	scoped(): this {
		return this.lifetime('scoped');
	}

	/**
	 * Sets transient lifetime.
	 */
	transient(): this {
		return this.lifetime('transient');
	}

	/**
	 * Adds an additional key for resolving the same class registration.
	 */
	as(key: ResolveKey): this {
		this.keys.push(key);
		return this;
	}
}

/**
 * Builder for factory registrations.
 */
export class FactoryBuilder<TComponent> implements RegistrationBuilder {
	private factory: FactoryFn<TComponent>;
	private keys: ResolveKey[];
	private _lifetime: Lifetime;

	constructor(factory: FactoryFn<TComponent>) {
		this.factory = factory;
		this._lifetime = 'transient';
		this.keys = [];
	}

	build(): Registration[] {
		const registrations: Registration[] = [];

		for (const key of this.keys) {
			const id = getNextRegistrationId();
			const registerKey = unwrapKey(key);
			const lifetime = this._lifetime;
			const registration: Registration = {
				id,
				key: registerKey,
				lifetime,
				factory: this.factory,
			};

			registrations.push(registration);
		}

		return registrations;
	}

	/**
	 * Sets registration lifetime.
	 */
	lifetime(lifetime: Lifetime): this {
		this._lifetime = lifetime;
		return this;
	}

	/**
	 * Sets singleton lifetime.
	 */
	singleton(): this {
		return this.lifetime('singleton');
	}

	/**
	 * Sets scoped lifetime.
	 */
	scoped(): this {
		return this.lifetime('scoped');
	}

	/**
	 * Sets transient lifetime.
	 */
	transient(): this {
		return this.lifetime('transient');
	}

	/**
	 * Adds an additional key for resolving the same factory registration.
	 */
	as(key: ResolveKey): this {
		this.keys.push(key);
		return this;
	}
}
