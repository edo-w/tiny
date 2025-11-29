import { assert, suite, test } from 'vitest';
import { createKey, inject, Tiny } from '~/index.js';

suite('tiny', () => {
	test('can create instance', () => {
		const tiny = new Tiny();
		assert.ok(tiny);
	});

	test('#findRegistration returns undefined for unregistered key', () => {
		const tiny = new Tiny();
		const key = createKey<string>('string');

		const registration = tiny.findRegistration(key);
		assert.isUndefined(registration);
	});

	test('#findRegistration returns registration for registered key', () => {
		const tiny = new Tiny();
		const wrappedKey = createKey<string>('string');

		tiny.addInstance(wrappedKey, 'value');

		const registration = tiny.findRegistration(wrappedKey);
		assert.ok(registration);
		assert.strictEqual(registration.key, wrappedKey.key);
	});

	test('#findRegistration can find registration in parent container', () => {
		const tiny = new Tiny();
		const wrappedKey = createKey<string>('string');

		tiny.addInstance(wrappedKey, 'value');

		const scope = tiny.createScope();

		const registration = scope.findRegistration(wrappedKey);
		assert.ok(registration);
		assert.strictEqual(registration.key, wrappedKey.key);
	});

	test('#has returns true for registered key', () => {
		const tiny = new Tiny();
		const wrappedKey = createKey<string>('string');

		tiny.addInstance(wrappedKey, 'value');

		const has = tiny.has(wrappedKey);
		assert.isTrue(has);
	});

	test('#has returns false for unregistered key', () => {
		const tiny = new Tiny();
		const wrappedKey = createKey<string>('string');

		const has = tiny.has(wrappedKey);
		assert.isFalse(has);
	});

	test('#get resolves component', () => {
		const tiny = new Tiny();
		const wrappedKey = createKey<string>('string');
		const value = 'value';

		tiny.addInstance(wrappedKey, value);

		const actual = tiny.get(wrappedKey);
		assert.strictEqual(actual, value);
	});

	test('#get throws error for unregistered key', () => {
		const tiny = new Tiny();
		const wrappedKey = createKey<string>('string');

		assert.throws(() => tiny.get(wrappedKey));
	});

	test('#safeGet returns undefined for unregistered key', () => {
		const tiny = new Tiny();
		const wrappedKey = createKey<string>('string');

		const actual = tiny.safeGet(wrappedKey);
		assert.isUndefined(actual);
	});

	test('#createScope creates new scope', () => {
		const tiny = new Tiny();
		const scope = tiny.createScope();

		assert.ok(scope);
		assert.notStrictEqual(tiny, scope);
	});
});

suite('#addInstance', () => {
	test('can add and get instance', () => {
		const key = createKey<string>('name');
		const name = 'foobar';

		const tiny = new Tiny();
		tiny.addInstance(key, name);

		const actual = tiny.get(key);
		assert.strictEqual(actual, name);
	});

	test('always returns the same instance', () => {
		class Logger {}
		const log = new Logger();

		const tiny = new Tiny();

		tiny.addInstance(Logger, log);

		const log1 = tiny.get(Logger);
		const log2 = tiny.get(Logger);

		assert.strictEqual(log1, log2);
	});
});

suite('#addClass', () => {
	class MyRepo {
		print(): string {
			return 'hello';
		}
	}

	class MyLogger {
		log(message: string): string {
			return `LOG: ${message}`;
		}
	}

	class UserService {
		constructor(
			public repo: MyRepo,
			public logger: MyLogger,
		) {}

		save(message: string): string {
			this.logger.log(message);
			return this.repo.print();
		}

		log(message: string): string {
			return this.logger.log(message);
		}
	}

	class UserServiceInject {
		repo = inject(MyRepo);
		logger = inject(MyLogger);
	}

	test('can add and get class', () => {
		const tiny = new Tiny();
		tiny.addClass(MyRepo);

		const instance = tiny.get(MyRepo);
		assert.isTrue(instance instanceof MyRepo);
	});

	test('can get class with constructor args', () => {
		const tiny = new Tiny();
		tiny.addClass(MyRepo);
		tiny.addClass(MyLogger);
		tiny.addClass(UserService, [MyRepo, MyLogger]);

		const service = tiny.get(UserService);
		assert.isTrue(service instanceof UserService);
		assert.isTrue(service.repo instanceof MyRepo);
		assert.isTrue(service.logger instanceof MyLogger);
	});

	test('can get class with constructor args from builder', () => {
		const tiny = new Tiny();
		tiny.addClass(MyRepo);
		tiny.addClass(MyLogger);
		tiny.addClass(UserService).args([MyRepo, MyLogger]);

		const service = tiny.get(UserService);
		assert.isTrue(service instanceof UserService);
		assert.isTrue(service.repo instanceof MyRepo);
		assert.isTrue(service.logger instanceof MyLogger);
	});

	test('throws error when class args are not set', () => {
		const tiny = new Tiny();
		tiny.addClass(MyRepo);
		tiny.addClass(MyLogger);
		tiny.addClass(UserService);

		assert.throws(() => tiny.get(UserService));
	});

	test('can get class from alternate keys', () => {
		const tiny = new Tiny();
		const LoggerKey = createKey<{ log(message: string): string }>('Logger');
		const SaverKey = createKey<{ save(message: string): string }>('Saver');

		tiny.addClass(MyLogger).as(LoggerKey);
		tiny.addClass(MyRepo);
		tiny.addClass(UserService, [MyRepo, MyLogger])
			.as(LoggerKey)
			.as(SaverKey);

		const logger = tiny.get(LoggerKey);
		const saver = tiny.get(SaverKey);

		assert.isTrue(logger instanceof UserService);
		assert.isTrue(saver instanceof UserService);
	});

	test('can get class with property injection', () => {
		const tiny = new Tiny();
		tiny.addClass(MyRepo);
		tiny.addClass(MyLogger);
		tiny.addClass(UserServiceInject);

		const service = tiny.get(UserServiceInject);
		assert.isTrue(service instanceof UserServiceInject);
		assert.isTrue(service.repo instanceof MyRepo);
		assert.isTrue(service.logger instanceof MyLogger);
	});

	test('can get class with mixed constructor and property injection', () => {
		class MixedService {
			repo = inject(MyRepo);

			constructor(public logger: MyLogger) {}
		}

		const tiny = new Tiny();
		tiny.addClass(MyRepo);
		tiny.addClass(MyLogger);
		tiny.addClass(MixedService, [MyLogger]);

		const service = tiny.get(MixedService);
		assert.isTrue(service instanceof MixedService);
		assert.isTrue(service.repo instanceof MyRepo);
		assert.isTrue(service.logger instanceof MyLogger);
	});
});

suite('#addFactory', () => {
	class MyRepo {
		constructor(public name: string) {}

		print(): string {
			return 'hello';
		}

		calc(x: number, y: number): number {
			return x + y;
		}
	}

	class MyLogger {
		log(message: string): string {
			return `LOG: ${message}`;
		}
	}

	class UserService {
		constructor(
			public repo: MyRepo,
			public logger: MyLogger,
		) {}
	}

	test('can add and get component from factory', () => {
		const tiny = new Tiny();

		const name = 'foobar2';
		tiny.addFactory(MyRepo, () => new MyRepo(name));

		const service = tiny.get(MyRepo);
		assert.isTrue(service instanceof MyRepo);
		assert.strictEqual(service.name, name);
	});

	test('can get component from factory with dependencies', () => {
		const tiny = new Tiny();

		tiny.addFactory(MyRepo, () => new MyRepo('repo1'));
		tiny.addClass(MyLogger);
		tiny.addFactory(UserService, (t) => {
			const logger = t.get(MyLogger);
			const repo = t.get(MyRepo);
			return new UserService(repo, logger);
		});

		const service = tiny.get(UserService);
		assert.isTrue(service instanceof UserService);
		assert.isTrue(service.repo instanceof MyRepo);
		assert.isTrue(service.logger instanceof MyLogger);
	});

	test('can add factory component with transient lifetime', () => {
		const tiny = new Tiny();

		let counter = 0;
		tiny.addFactory(MyRepo, () => {
			counter += 1;
			return new MyRepo(`repo${counter}`);
		}).transient();

		const repo1 = tiny.get(MyRepo);
		const repo2 = tiny.get(MyRepo);

		assert.notStrictEqual(repo1, repo2);
		assert.strictEqual(repo1.name, 'repo1');
		assert.strictEqual(repo2.name, 'repo2');
	});

	test('can add factory component with singleton lifetime', () => {
		const tiny = new Tiny();

		let counter = 0;
		tiny.addFactory(MyRepo, () => {
			counter += 1;
			return new MyRepo(`repo${counter}`);
		}).singleton();

		const repo1 = tiny.get(MyRepo);
		const repo2 = tiny.get(MyRepo);

		assert.strictEqual(repo1, repo2);
		assert.strictEqual(repo1.name, 'repo1');
		assert.strictEqual(repo2.name, 'repo1');
	});

	test('can add factory component with scoped lifetime', () => {
		const tiny = new Tiny();

		let counter = 0;
		tiny.addFactory(MyRepo, () => {
			counter += 1;
			return new MyRepo(`repo${counter}`);
		}).scoped();

		const repo1 = tiny.get(MyRepo);
		const repo2 = tiny.get(MyRepo);

		const scope = tiny.createScope();
		const repo3 = scope.get(MyRepo);
		const repo4 = scope.get(MyRepo);

		assert.strictEqual(repo1, repo2);
		assert.notStrictEqual(repo1, repo3);
		assert.strictEqual(repo3, repo4);

		assert.strictEqual(repo1.name, 'repo1');
		assert.strictEqual(repo3.name, 'repo2');
	});
});

suite('lifetime', () => {
	class MyService {
		print(): string {
			return 'hello';
		}
	}

	test('always creates new instance for transient lifetime', () => {
		const tiny = new Tiny();

		tiny.addClass(MyService).transient();

		const instance1 = tiny.get(MyService);
		const instance2 = tiny.get(MyService);

		assert.notStrictEqual(instance1, instance2);
	});

	test('returns same instance by scoped lifetime', () => {
		const tiny = new Tiny();

		tiny.addClass(MyService).scoped();

		const rootInstance1 = tiny.get(MyService);
		const rootInstance2 = tiny.get(MyService);

		const scope = tiny.createScope();

		const scopeInstance1 = scope.get(MyService);
		const scopeInstance2 = scope.get(MyService);

		// root instances should be the same
		assert.strictEqual(rootInstance1, rootInstance2);

		// scope instances should be the same
		assert.strictEqual(scopeInstance1, scopeInstance2);

		// scope instances should not be the same as root instances
		assert.notStrictEqual(rootInstance1, scopeInstance1);
		assert.notStrictEqual(rootInstance1, scopeInstance2);
		assert.notStrictEqual(rootInstance2, scopeInstance1);
		assert.notStrictEqual(rootInstance2, scopeInstance2);
	});

	test('returns same instance from root for singleton lifetime', () => {
		const tiny = new Tiny();

		tiny.addClass(MyService).singleton();

		const rootInstance1 = tiny.get(MyService);
		const rootInstance2 = tiny.get(MyService);

		const scope = tiny.createScope();

		const scopeInstance1 = scope.get(MyService);
		const scopeInstance2 = scope.get(MyService);

		// all instances should be the same
		assert.strictEqual(rootInstance1, rootInstance2);
		assert.strictEqual(rootInstance1, scopeInstance1);
		assert.strictEqual(rootInstance1, scopeInstance2);
		assert.strictEqual(rootInstance2, scopeInstance1);
		assert.strictEqual(rootInstance2, scopeInstance2);
	});
});
