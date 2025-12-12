import { XError } from '@edo-w/xer';
import { ResolveKey } from './types.js';

export interface ComponentNotFoundProps {
	key: ResolveKey;
}

export class ComponentNotFoundError extends XError<ComponentNotFoundProps> {
	constructor(message?: string) {
		super(message);
		this.name = 'ComponentNotFoundError';
	}
}

export interface ResolveFailedProps {
	key: ResolveKey;
}

export class ResolveFailedError extends XError<ResolveFailedProps> {
	constructor(message?: string) {
		super(message);
		this.name = 'ResolveFailedError';
	}
}

export interface ClassArgsNotFoundProps {
	key: ResolveKey;
	class: string;
}

export class ClassArgsNotFoundError extends XError<ClassArgsNotFoundProps> {
	constructor(message?: string) {
		super(message);
		this.name = 'ClassArgsNotFoundError';
	}
}

export class CurrentContainerNotFoundError extends XError {
	constructor(message?: string) {
		super(message);
		this.name = 'CurrentContainerNotFoundError';
	}
}

export interface InvalidComponentProps {
	key: ResolveKey;
	registrationId: number;
}

export class InvalidComponentError extends XError<InvalidComponentProps> {
	constructor(message?: string) {
		super(message);
		this.name = 'InvalidComponentError';
	}
}
