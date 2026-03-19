import { XError } from '@edo-w/xer';
import type { ResolveKey } from './types.js';

/**
 * Metadata for `ComponentNotFoundError`.
 */
export interface ComponentNotFoundErrorDetail {
	key: ResolveKey;
}

/**
 * Thrown when a requested component key has no registration.
 */
export class ComponentNotFoundError extends XError<ComponentNotFoundErrorDetail> {
	constructor(message?: string) {
		super(message);
		this.name = 'ComponentNotFoundError';
	}
}

/**
 * Metadata for `ResolveError`.
 */
export interface ResolveErrorDetail {
	key: ResolveKey;
}

/**
 * Thrown when resolving a registered component fails.
 */
export class ResolveError extends XError<ResolveErrorDetail> {
	constructor(message?: string) {
		super(message);
		this.name = 'ResolveFailedError';
	}
}

/**
 * Metadata for `ClassDepsNotFoundError`.
 */
export interface ClassDepsNotFoundErrorDetail {
	key: ResolveKey;
	class: string;
}

/**
 * Thrown when constructor dependencies are required but were not configured.
 */
export class ClassDepsNotFoundError extends XError<ClassDepsNotFoundErrorDetail> {
	constructor(message?: string) {
		super(message);
		this.name = 'ClassDepsNotFoundError';
	}
}

/**
 * Thrown when property injection runs outside an active `Tiny` resolution context.
 */
export class ContainerNotFoundError extends XError {
	constructor(message?: string) {
		super(message);
		this.name = 'ContainerNotFoundError';
	}
}

/**
 * Metadata for `InvalidComponentError`.
 */
export interface InvalidComponentErrorDetail {
	key: ResolveKey;
	registrationId: number;
}

/**
 * Thrown when a factory resolves to an invalid component value.
 */
export class InvalidComponentError extends XError<InvalidComponentErrorDetail> {
	constructor(message?: string) {
		super(message);
		this.name = 'InvalidComponentError';
	}
}
