import { ClassBuilder, FactoryBuilder, InstanceBuilder } from './builders.js';
import {
	ClassArgs,
	ClassType,
	FactoryFn,
	RegistrationBuilder,
	ResolveKey,
} from './types.js';

export class TinyModule {
	private builders: RegistrationBuilder[];

	constructor() {
		this.builders = [];
	}

	addInstance<TComponent>(key: ResolveKey<TComponent>, component: TComponent): InstanceBuilder<TComponent> {
		const builder = new InstanceBuilder(key, component);
		this.builders.push(builder);
		return builder;
	}

	addClass<TComponent extends ClassType<any>>(classType: TComponent, args?: ClassArgs<TComponent>): ClassBuilder<TComponent> {
		const builder = new ClassBuilder(classType, args);
		this.builders.push(builder);
		return builder;
	}

	addFactory<TComponent>(key: ResolveKey<TComponent>, fn: FactoryFn<TComponent>): FactoryBuilder<TComponent> {
		const builder = new FactoryBuilder(fn).as(key);
		this.builders.push(builder);
		return builder;
	}

	getBuilders(): RegistrationBuilder[] {
		return this.builders.slice();
	}
}
