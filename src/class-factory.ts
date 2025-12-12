import { ClassArgsNotFoundError } from './errors.js';
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

		const className = this.classType.name ?? '[unknown]';
		throw new ClassArgsNotFoundError(`Class "${className}" constructor arguments not found.`)
			.setProperties({ key: this.classType, class: className });
	}
}
