import { ClassParametersNotFoundError } from './errors.js';
import { ClassType, ResolveKey, TinyContext } from './types.js';

/**
 * Creates class instances by resolving constructor dependencies from a container.
 */
export class ClassFactory {
	private classType: ClassType<any>;
	private params: ResolveKey[];

	constructor(classType: ClassType<any>, params: ResolveKey[]) {
		this.classType = classType;
		this.params = params;
	}

	/**
	 * Creates a class instance using the registered parameters, or throws when parameters are not found.
	 */
	create(t: TinyContext): any {
		if (this.classType.length === 0) {
			return new this.classType();
		}

		const hasParams = this.params.length === this.classType.length;
		if (hasParams) {
			const components = this.params.map(param => t.get(param));
			return new this.classType(...components);
		}

		const className = this.classType.name;
		throw new ClassParametersNotFoundError(`Class "${className}" constructor parameters not found.`)
			.setDetail({ key: this.classType, class: className });
	}
}
