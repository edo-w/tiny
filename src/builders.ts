import { ClassFactory } from './class-factory.js';
import {
	ClassArgs,
	ClassType,
	FactoryFn,
	Lifetime,
	Registration,
	RegistrationBuilder,
	ResolveKey,
} from './types.js';
import { getNextRegistrationId, unwrapKey } from './uils.js';

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
		const lifetime = 'singleton';
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

export class ClassBuilder<TComponent extends ClassType<any>> implements RegistrationBuilder {
	private classType: ClassType<TComponent>;
	private keys: ResolveKey[];
	private _lifetime: Lifetime;
	private _args?: ResolveKey[];

	constructor(classType: ClassType<TComponent>, args?: ResolveKey[]) {
		this.classType = classType;
		this.keys = [classType];
		this._lifetime = 'transient';
		this._args = args;
	}

	build(): Registration[] {
		const registrations: Registration[] = [];
		const classFactory = new ClassFactory(this.classType, this._args);
		const factory = classFactory.get.bind(classFactory);

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

	args(list: ClassArgs<TComponent>): this {
		this._args = list;
		return this;
	}

	lifetime(lifetime: Lifetime): this {
		this._lifetime = lifetime;
		return this;
	}

	singleton(): this {
		return this.lifetime('singleton');
	}

	scoped(): this {
		return this.lifetime('scoped');
	}

	transient(): this {
		return this.lifetime('transient');
	}

	as(key: ResolveKey): this {
		this.keys.push(key);
		return this;
	}
}

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

	lifetime(lifetime: Lifetime): this {
		this._lifetime = lifetime;
		return this;
	}

	singleton(): this {
		return this.lifetime('singleton');
	}

	scoped(): this {
		return this.lifetime('scoped');
	}

	transient(): this {
		return this.lifetime('transient');
	}

	as(key: ResolveKey): this {
		this.keys.push(key);
		return this;
	}
}
