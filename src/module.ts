import { ClassBuilder, FactoryBuilder, InstanceBuilder } from './builders.js';
import type { ClassDeps, ClassType, ComponentKey, FactoryFn, RegistrationBuilder } from './types.js';

/**
 * Reusable registration bundle.
 *
 * Modules collect builders that can later be applied to a `Tiny` container.
 */
export class TinyModule {
	private builders: RegistrationBuilder[];

	constructor() {
		this.builders = [];
	}

	/**
	 * Adds an existing instance registration to the module.
	 */
	addInstance<TComponent>(key: ComponentKey<TComponent>, component: TComponent): InstanceBuilder<TComponent> {
		const builder = new InstanceBuilder(key, component);
		this.builders.push(builder);

		return builder;
	}

	/**
	 * Adds a class registration to the module.
	 */
	addClass<TComponent extends ClassType<any>>(
		classType: TComponent,
		deps: ClassDeps<TComponent>,
	): ClassBuilder<TComponent> {
		const builder = new ClassBuilder(classType, deps);
		this.builders.push(builder);

		return builder;
	}

	/**
	 * Adds a factory registration to the module.
	 */
	addFactory<TComponent>(key: ComponentKey<TComponent>, fn: FactoryFn<TComponent>): FactoryBuilder<TComponent> {
		const builder = new FactoryBuilder(fn).as(key);
		this.builders.push(builder);

		return builder;
	}

	/**
	 * Adds a singleton class registration to the module.
	 */
	addSingletonClass<TComponent extends ClassType<any>>(
		classType: TComponent,
		deps: ClassDeps<TComponent>,
	): ClassBuilder<TComponent> {
		const builder = new ClassBuilder(classType, deps).singleton();
		this.builders.push(builder);

		return builder;
	}

	/**
	 * Adds a singleton factory registration to the module.
	 */
	addSingletonFactory<TComponent>(
		key: ComponentKey<TComponent>,
		fn: FactoryFn<TComponent>,
	): FactoryBuilder<TComponent> {
		const builder = new FactoryBuilder(fn).as(key).singleton();
		this.builders.push(builder);

		return builder;
	}

	/**
	 * Adds a scoped class registration to the module.
	 */
	addScopedClass<TComponent extends ClassType<any>>(
		classType: TComponent,
		deps: ClassDeps<TComponent>,
	): ClassBuilder<TComponent> {
		const builder = new ClassBuilder(classType, deps).scoped();
		this.builders.push(builder);

		return builder;
	}

	/**
	 * Adds a scoped factory registration to the module.
	 */
	addScopedFactory<TComponent>(key: ComponentKey<TComponent>, fn: FactoryFn<TComponent>): FactoryBuilder<TComponent> {
		const builder = new FactoryBuilder(fn).as(key).scoped();
		this.builders.push(builder);

		return builder;
	}

	/**
	 * Returns a copy of all collected builders.
	 */
	getBuilders(): RegistrationBuilder[] {
		return this.builders.slice();
	}
}
