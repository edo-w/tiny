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

### Resolve services from the container

```ts
const service = tiny.get(UserService);
const config = tiny.get(ConfigKey);

console.log(service.getDisplayName());
console.log(config.env);
```

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

[!NOTE]
`inject` resolves from the current container resolution context, so create instances through `tiny.get(...)` instead of `new`.

### Lifetime Helper Methods

Tiny provides direct helper methods for common lifetimes:

```ts
tiny.addSingletonClass(Logger, []);
tiny.addScopedClass(UserRepository, []);
tiny.addSingletonFactory(ConfigKey, () => ({ env: 'prod' }));
tiny.addScopedFactory(UserService, (t) => {
	return new UserService(
		t.get(UserRepository), 
		t.get(Logger)
	);
});
```

`TinyModule` supports the same helper methods:

```ts
import { Tiny, TinyModule } from '@edo-w/tiny';

const tm = new TinyModule();
tm.addSingletonClass(Logger, []);
tm.addScopedClass(UserRepository, []);
tm.addSingletonFactory(ConfigKey, () => ({ env: 'prod' }));
tm.addScopedFactory(UserService, (t) => {
	return new UserService(
		t.get(UserRepository), 
		t.get(Logger)
	);
});

const tiny = new Tiny();
tiny.addModule(tm);
```
