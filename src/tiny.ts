import { ClassBuilder, FactoryBuilder, InstanceBuilder } from './builders.js';
import { popTinyStack, pushTinyStack } from './class-inject.js';
import { ComponentNotFoundError, InvalidComponentError, ResolveFailedError } from './errors.js';
import { TinyModule } from './module.js';
import { Registry } from './registry.js';
import {
	ClassArgs,
	ClassType,
	FactoryFn,
	Registration,
	RegistrationBuilder,
	ResolveKey,
} from './types.js';
import { unwrapKey } from './uils.js';

export class Tiny {
	private root: Tiny;
	private parent?: Tiny;
	private registry?: Registry;
	private builders?: RegistrationBuilder[];
	private cache?: Map<number, any>;

	constructor(parent?: Tiny) {
		this.parent = parent;
		this.root = this.findRoot(this);
	}

	private ensureBuilders(): RegistrationBuilder[] {
		if (!this.builders) {
			this.builders = [];
		}

		return this.builders;
	}

	private ensureRegistry(): Registry {
		/* v8 ignore next -- @preserve */
		if (!this.registry) {
			this.registry = new Registry();
		}

		return this.registry;
	}

	private findRoot(instance: Tiny): Tiny {
		let current: Tiny | undefined = instance;
		while (current.parent) {
			current = current.parent;
		}

		return current;
	}

	private addBuilder(builder: RegistrationBuilder): void {
		const builders = this.ensureBuilders();
		builders.push(builder);
	}

	private build(): void {
		if (!this.builders) {
			return;
		}

		/* v8 ignore next -- @preserve */
		if (this.builders.length === 0) {
			return;
		}

		const registry = this.ensureRegistry();
		for (const builder of this.builders) {
			const registrations = builder.build();
			for (const registration of registrations) {
				registry.add(registration);
			}
		}

		this.builders = undefined;
	}

	private getCache(id: number): any | undefined {
		if (!this.cache) {
			return undefined;
		}

		return this.cache.get(id);
	}

	private setCache(id: number, component: any): void {
		/* v8 ignore next -- @preserve */
		if (!this.cache) {
			this.cache = new Map();
		}

		this.cache.set(id, component);
	}

	findRegistration(key: ResolveKey): Registration | undefined {
		this.build();

		let registration: Registration | undefined;
		const registerKey = unwrapKey(key);

		if (this.registry) {
			registration = this.registry.find(registerKey);
		}

		if (!registration && this.parent) {
			registration = this.parent.findRegistration(key);
		}

		return registration;
	}

	addInstance<TComponent>(key: ResolveKey<TComponent>, component: TComponent): InstanceBuilder<TComponent> {
		const builder = new InstanceBuilder(key, component);

		this.addBuilder(builder);
		return builder;
	}

	addClass<TComponent extends ClassType<any>>(classType: TComponent, args?: ClassArgs<TComponent>): ClassBuilder<TComponent> {
		const builder = new ClassBuilder(classType, args);

		this.addBuilder(builder);
		return builder;
	}

	addFactory<TComponent>(key: ResolveKey<TComponent>, fn: FactoryFn<TComponent>): FactoryBuilder<TComponent> {
		const builder = new FactoryBuilder(fn).as(key);

		this.addBuilder(builder);
		return builder;
	}

	addModule(module: TinyModule): void {
		this.ensureBuilders();

		const builders = this.ensureBuilders();
		const moduleBuilders = module.getBuilders();
		builders.push(...moduleBuilders);
	}

	has<TComponent>(key: ResolveKey<TComponent>): boolean {
		const registration = this.findRegistration(key);
		return !!registration;
	}

	safeGet<TComponent>(key: ResolveKey<TComponent>): TComponent | undefined {
		const registration = this.findRegistration(key);
		if (!registration) {
			return undefined;
		}

		let pushed = false;
		let component: TComponent | undefined = undefined;
		try {
			pushed = pushTinyStack(this);

			switch (registration.lifetime) {
				case 'singleton': {
					component = this.root.getCache(registration.id);
					if (!component) {
						component = registration.factory(this);
						this.root.setCache(registration.id, component);
					}

					break;
				}

				case 'scoped': {
					component = this.getCache(registration.id);
					if (!component) {
						component = registration.factory(this);
						this.setCache(registration.id, component);
					}

					break;
				}

				case 'transient': {
					component = registration.factory(this);
					break;
				}

				/* v8 ignore next -- @preserve */
				default: {
					throw new Error(`Unknown lifetime: ${registration.lifetime}`);
				}
			}

			if (component === undefined) {
				throw new InvalidComponentError('Invalid component returned from factory. Component is undefined.')
					.setProperties({ key, registrationId: registration.id });
			}

			return component;
		}
		catch (error) {
			throw new ResolveFailedError('Resolve component failed.')
				.setProperties({ key })
				.setCause(error);
		}
		finally {
			if (pushed) {
				popTinyStack();
			}
		}
	}

	get<TComponent>(key: ResolveKey<TComponent>): TComponent {
		const component = this.safeGet<TComponent>(key);
		if (!component) {
			throw new ComponentNotFoundError(`Component key "${key}" not found.`)
				.setProperties({ key });
		}

		return component;
	}

	createScope(): Tiny {
		const scope = new Tiny(this);
		return scope;
	}
}
