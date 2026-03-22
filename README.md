```
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\///////////////////////////
///////// \///// \/// \\/// \/// \\/// \///////// \///// \/// \\///
\\\/// \\\\\/// \\///// /// \\/// /// \\\\\/// \\\\\///\\\/// \\\\\
\\\/// \\\\\/// \\///////// \\\///// \\\ \\\\\/// \\///////// \\\//
\\\/// \\\\\/// \\/// ///// \\\\/// \\\\\\\/// \\/// ///// \\\\///\
\\\/// \\\\///// \/// \\/// \\\\/// \\\\// \\\\///// \///\\///// \/
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\///////////////////////////
\\\/// \\\\\/// \\///////// \\\///// \\\ \\\\\/// \\///////// \\\//
```

# @edo-w/tiny

Tiny is a lightweight dependency injection container for TypeScript.

## Features

- Typed registration keys (`createKey<T>()`) for non-class dependencies
- Lazy component resolution with `createLazyKey(...)`
- Class, factory, and instance registrations
- Lifetimes: `transient`, `scoped`, and `singleton`
- Scoped containers with parent lookup (`createScope()`)
- Registration modules (`TinyModule`) for reusable setup
- Property injection helper (`inject`) for class initializers
- Convenience lifetime helpers in both `Tiny` and `TinyModule`

## Getting Started

### Install

```bash
pnpm add @edo-w/tiny
```

### Create the container

```ts
import { Tiny } from '@edo-w/tiny';

const tiny = new Tiny();
```

### Add registrations

```ts
import { Tiny, createKey } from '@edo-w/tiny';

class Logger {
	log(message: string): string {
		return `LOG: ${message}`;
	}
}

class UserRepository {
	findName(): string {
		return 'tiny-user';
	}
}

class UserService {
	constructor(
		public repo: UserRepository,
		public logger: Logger,
	) {}

	getDisplayName(): string {
		return this.logger.log(this.repo.findName());
	}
}

const ConfigKey = createKey<{ env: string }>('config');
const tiny = new Tiny();

tiny.addInstance(ConfigKey, { env: 'dev' });
tiny.addClass(Logger, []);
tiny.addClass(UserRepository, []);
tiny.addClass(UserService, [UserRepository, Logger]);
```

Class registrations now use a deps array.

- Use `[]` for classes with no constructor dependencies
- Use `[DepA, DepB]` in constructor order when dependencies exist
- Use a lazy key when a constructor dependency should resolve to `Lazy<T>` instead of `T`

### Resolve vs Register keys

Tiny uses two key concepts:

- `ComponentKey<T>`: keys you can register with `addInstance`, `addFactory`, and builder aliases
- `ResolveKey<T>`: keys you can resolve with `get`, `getSafe`, and `inject`

In practice:

- class constructors and `createKey<T>()` values can be registered and resolved
- `createLazyKey(...)` values are resolve-only keys that produce `Lazy<T>` wrappers on demand

### Resolve services from the container

```ts
const service = tiny.get(UserService);
const config = tiny.get(ConfigKey);

console.log(service.getDisplayName());
console.log(config.env);
```

### Resolve a lazy dependency

```ts
import { createLazyKey, Tiny, type Lazy } from '@edo-w/tiny';

class UserRepo {
	findName(): string {
		return 'tiny-user';
	}
}

class UserService {
	constructor(public repo: Lazy<UserRepo>) {}
}

const tiny = new Tiny();
const lazyRepoKey = createLazyKey(UserRepo);

tiny.addClass(UserRepo, []);
tiny.addClass(UserService, [lazyRepoKey]);

const service = tiny.get(UserService);
console.log(service.repo.get().findName());
```

`createLazyKey(...)` does not register a component. It tells Tiny to return a lightweight wrapper whose `get()` resolves the underlying component when needed.

### Use the inject helper in a property initializer

```ts
import { Tiny, inject } from '@edo-w/tiny';

class Logger {
	log(message: string): string {
		return `LOG: ${message}`;
	}
}

class Handler {
	logger = inject(Logger);

	handle(): string {
		return this.logger.log('handled');
	}
}

const tiny = new Tiny();
tiny.addClass(Logger, []);
tiny.addClass(Handler, []);

const handler = tiny.get(Handler);
console.log(handler.handle());
```

You can also inject a lazy dependency into a property:

```ts
import { createLazyKey, inject, Tiny, type Lazy } from '@edo-w/tiny';

class UserRepo {
	findName(): string {
		return 'tiny-user';
	}
}

const lazyRepoKey = createLazyKey(UserRepo);

class Handler {
	repo = inject(lazyRepoKey);

	handle(): string {
		return this.repo.get().findName();
	}
}

const tiny = new Tiny();
tiny.addClass(UserRepo, []);
tiny.addClass(Handler, []);

const handler = tiny.get(Handler);
console.log(handler.handle());
```

[!NOTE]
`inject` resolves from the current container resolution context, so create instances through `tiny.get(...)` instead of `new`.

### Lifetime Helper Methods

Tiny provides direct helper methods for common lifetimes:

```ts
tiny.addSingletonClass(Logger, []);
tiny.addScopedClass(UserRepo, []);
tiny.addSingletonFactory(ConfigKey, () => ({ env: 'prod' }));
tiny.addScopedFactory(UserService, (t) => {
	const repo = t.get(UserRepo);
	const logger = t.get(Logger);

	return new UserService(repo, logger);
});
```

`TinyModule` supports the same helper methods:

```ts
import { Tiny, TinyModule } from '@edo-w/tiny';

const tm = new TinyModule();
tm.addSingletonClass(Logger, []);
tm.addScopedClass(UserRepo, []);
tm.addSingletonFactory(ConfigKey, () => ({ env: 'prod' }));
tm.addScopedFactory(UserService, (t) => {
	const repo = t.get(UserRepo);
	const logger = t.get(Logger);
	
	return new UserService(repo, logger);
});

const tiny = new Tiny();
tiny.addModule(tm);
```
