import { XError } from '@edo-w/xer';
import { ResolveKey } from './types.js';

/**
 * Metadata for `ComponentNotFoundError`.
 */
export interface ComponentNotFoundDetail {
	key: ResolveKey;
}

/**
 * Thrown when a requested component key has no registration.
 */
export class ComponentNotFoundError extends XError<ComponentNotFoundDetail> {
	constructor(message?: string) {
		super(message);
		this.name = 'ComponentNotFoundError';
	}
}

/**
 * Metadata for `ResolveError`.
 */
export interface ResolveFailedDetail {
	key: ResolveKey;
}

/**
 * Thrown when resolving a registered component fails.
 */
export class ResolveError extends XError<ResolveFailedDetail> {
	constructor(message?: string) {
		super(message);
		this.name = 'ResolveFailedError';
	}
}

/**
 * Metadata for `ClassParametersNotFoundError`.
 */
export interface ClassParametersNotFoundDetail {
	key: ResolveKey;
	class: string;
}

/**
 * Thrown when constructor dependencies are required but were not configured.
 */
export class ClassParametersNotFoundError extends XError<ClassParametersNotFoundDetail> {
	constructor(message?: string) {
		super(message);
		this.name = 'ClassArgsNotFoundError';
	}
}

/**
 * Thrown when property injection runs outside an active `Tiny` resolution context.
 */
export class CurrentContainerNotFoundError extends XError {
	constructor(message?: string) {
		super(message);
		this.name = 'CurrentContainerNotFoundError';
	}
}

/**
 * Metadata for `InvalidComponentError`.
 */
export interface InvalidComponentDetail {
	key: ResolveKey;
	registrationId: number;
}

/**
 * Thrown when a factory resolves to an invalid component value.
 */
export class InvalidComponentError extends XError<InvalidComponentDetail> {
	constructor(message?: string) {
		super(message);
		this.name = 'InvalidComponentError';
	}
}
