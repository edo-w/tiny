import { ClassType, ResolveKey, TinyContext } from './types.js';

export class ClassFactory {
	private classType: ClassType<any>;
	private args?: ResolveKey[];

	constructor(classType: ClassType<any>, args?: ResolveKey[]) {
		this.classType = classType;
		this.args = args;
	}

	get(t: TinyContext): any {
		if (this.classType.length === 0) {
			return new this.classType();
		}

		if (this.args) {
			const components = this.args.map(arg => t.get(arg));
			return new this.classType(...components);
		}

		// TODO: create propert error
		throw new Error(`Cannot resolve dependencies for class ${this.classType.name}. Arguments are required.`);
	}
}
