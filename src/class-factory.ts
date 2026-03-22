import { ClassDepsNotFoundError } from './errors.js';
import type { ClassType, ResolveKey, TinyContext } from './types.js';

/**
 * Creates class instances by resolving constructor dependencies from a container.
 */
export class ClassFactory {
	private classType: ClassType<any>;
	private deps: ResolveKey[];

	constructor(classType: ClassType<any>, deps: ResolveKey[]) {
		this.classType = classType;
		this.deps = deps;
	}

	/**
	 * Creates a class instance using the registered parameters, or throws when parameters are not found.
	 */
	create(t: TinyContext): any {
		if (this.classType.length === 0) {
			return new this.classType();
		}

		const hasDeps = this.deps.length === this.classType.length;
		if (hasDeps) {
			const components = this.deps.map((dep) => t.get(dep));
			return new this.classType(...components);
		}

		const className = this.classType.name;
		throw new ClassDepsNotFoundError(`Class "${className}" constructor parameters not found.`).setDetail({
			key: this.classType,
			class: className,
		});
	}
}
