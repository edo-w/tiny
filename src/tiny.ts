import { ClassBuilder, FactoryBuilder, InstanceBuilder } from './builders.js';
import { popTinyStack, pushTinyStack } from './class-inject.js';
import { ComponentNotFoundError, InvalidComponentError, ResolveError } from './errors.js';
import type { TinyModule } from './module.js';
import { Registry } from './registry.js';
import type {
	ClassDeps,
	ClassType,
	ComponentKey,
	FactoryFn,
	Lazy,
	Registration,
	RegistrationBuilder,
	ResolveKey,
	ResolveResult,
} from './types.js';
import { isLazyKey, unwrapKey } from './uils.js';

/**
 * Tiny dependency injection container.
 *
 * Supports class, instance, and factory registrations with transient, scoped,
 * and singleton lifetimes.
 */
export class Tiny {
	private root: Tiny;
	private parent?: Tiny;
	private registry?: Registry;
	private builders?: RegistrationBuilder[];
	private cache?: Map<number, any>;

	constructor(parent?: Tiny) {
		this.parent = parent;
		this.root = this.parent?.root ?? this.findRoot(this);
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
		if (isLazyKey(key)) {
			return this.findRegistration(key.innerKey);
		}

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

	/**
	 * Registers a existing instance for the provided key.
	 */
	addInstance<TComponent>(key: ComponentKey<TComponent>, component: TComponent): InstanceBuilder<TComponent> {
		const builder = new InstanceBuilder(key, component);
		this.addBuilder(builder);

		return builder;
	}

	/**
	 * Registers a class.
	 *
	 * Constructor dependencies can be provided in `params`.
	 */
	addClass<TComponent extends ClassType<any>>(
		classType: TComponent,
		deps: ClassDeps<TComponent>,
	): ClassBuilder<TComponent> {
		const builder = new ClassBuilder(classType, deps);
		this.addBuilder(builder);

		return builder;
	}

	/**
	 * Registers a factory for a key.
	 */
	addFactory<TComponent>(key: ComponentKey<TComponent>, fn: FactoryFn<TComponent>): FactoryBuilder<TComponent> {
		const builder = new FactoryBuilder(fn).as(key);
		this.addBuilder(builder);

		return builder;
	}

	/**
	 * Registers a class with singleton lifetime.
	 *
	 * The same instance is reused across the root container and all scopes.
	 */
	addSingletonClass<TComponent extends ClassType<any>>(
		classType: TComponent,
		deps: ClassDeps<TComponent>,
	): ClassBuilder<TComponent> {
		const builder = new ClassBuilder(classType, deps).singleton();
		this.addBuilder(builder);

		return builder;
	}

	/**
	 * Registers a factory with singleton lifetime.
	 *
	 * The same instance is reused across the root container and all scopes.
	 */
	addSingletonFactory<TComponent>(
		key: ComponentKey<TComponent>,
		fn: FactoryFn<TComponent>,
	): FactoryBuilder<TComponent> {
		const builder = new FactoryBuilder(fn).as(key).singleton();
		this.addBuilder(builder);

		return builder;
	}

	/**
	 * Registers a class with scoped lifetime.
	 *
	 * One instance is created per container scope.
	 */
	addScopedClass<TComponent extends ClassType<any>>(
		classType: TComponent,
		deps: ClassDeps<TComponent>,
	): ClassBuilder<TComponent> {
		const builder = new ClassBuilder(classType, deps).scoped();
		this.addBuilder(builder);

		return builder;
	}

	/**
	 * Registers a factory with scoped lifetime.
	 *
	 * One instance is created per container scope.
	 */
	addScopedFactory<TComponent>(key: ComponentKey<TComponent>, fn: FactoryFn<TComponent>): FactoryBuilder<TComponent> {
		const builder = new FactoryBuilder(fn).as(key).scoped();
		this.addBuilder(builder);

		return builder;
	}

	/**
	 * Adds all registrations from a `TinyModule`.
	 */
	addModule(module: TinyModule): void {
		this.ensureBuilders();

		const builders = this.ensureBuilders();
		const moduleBuilders = module.getBuilders();
		builders.push(...moduleBuilders);
	}

	/**
	 * Checks whether a key is registered in the current container chain.
	 */
	has<TComponent>(key: ResolveKey<TComponent>): boolean {
		const registration = this.findRegistration(key);
		return !!registration;
	}

	/**
	 * Resolves a component and returns `undefined` if not registered.
	 */
	getSafe<TKey extends ResolveKey>(key: TKey): ResolveResult<TKey> | undefined {
		const registration = this.findRegistration(key);
		if (!registration) {
			return undefined;
		}

		if (isLazyKey(key)) {
			const lazyComponent: Lazy<unknown> = {
				get: () => this.get(key.innerKey),
			};

			return lazyComponent as ResolveResult<TKey>;
		}

		let pushed = false;
		let component: unknown | undefined;
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
				throw new InvalidComponentError(
					'Invalid component returned from factory. Component is undefined.',
				).setDetail({
					key,
					registrationId: registration.id,
				});
			}

			return component as ResolveResult<TKey>;
		} catch (error) {
			if (error instanceof InvalidComponentError) {
				throw error;
			}

			// throw error;

			throw new ResolveError('Resolve component failed.').setDetail({ key }).setCause(error);
		} finally {
			if (pushed) {
				popTinyStack();
			}
		}
	}

	/**
	 * Resolves a component and throws when no registration is found.
	 */
	get<TKey extends ResolveKey>(key: TKey): ResolveResult<TKey> {
		const component = this.getSafe(key);
		if (!component) {
			throw new ComponentNotFoundError(`Component key "${key.name}" not found.`).setDetail({ key });
		}

		return component;
	}

	/**
	 * Creates a child scope that inherits registrations from this container.
	 */
	createScope(): Tiny {
		const scope = new Tiny(this);
		return scope;
	}
}
