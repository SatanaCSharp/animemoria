---
title: 'Assertion functions in TypeScript'
source: 'https://blog.logrocket.com/assertion-functions-typescript/'
author:
  - '[[Matteo Di Pirro]]'
published: 2022-10-03
created: 2026-04-27
description: "Let's explore assertion functions in TypeScript and see how they can be used to express invariants on our variables."
tags:
  - 'clippings'
---

Assertion functions in TypeScript are a very expressive type of function whose signature states that a given condition is verified if the function itself returns.

In its basic form, a typical `assert` function just checks a given predicate and throws an error if such a predicate is false. For example, Node.js’s assert throws an `AssertionError` if the predicate is false.

TypeScript, since its version 3.7, has gone a little beyond that by implementing the support of assertions at the type system level.

In this article, we’re going to explore assertion functions in TypeScript and see how they can be used to express invariants on our variables.

## JavaScript-like assertions

Node.js comes with a predefined assert function. As we mentioned in the introduction, it throws an `AssertionError` if a given predicate is false:

```typescript
const aValue = 10;
assert(aValue === 20);
```

In JavaScript, this was useful to guard against improper types in a function:

```typescript
function sumNumbers(x, y) {
  assert(typeof x === 'number');
  assert(typeof y === 'number');
  return x + y;
}
```

Unfortunately, the code flow analysis does not take into account those assertions. In fact, they are simply evaluated at runtime and then forgotten.

With its assertion functions, TypeScript’s code flow analysis will be able to use the type of a function (in brief, its signature) to infer some properties of our code. We can use this new feature to make guarantees of our types throughout our code.

## TypeScript-like assertion

An assertion function specifies, in its signature, the type predicate to evaluate. For instance, the following function ensures a given value be a `string`:

```typescript
function isString(value: unknown): asserts value is string {
  if (typeof value !== 'string') throw new Error('Not a string');
}
```

If we invoke the function above with a given parameter, and it returns correctly, TypeScript knows that value has type `string`. Hence, it will narrow down its type to `string`:

```typescript
const aValue: string | number = 'Hello';
isString(aValue);
// The type of aValue is narrowed to string here
```

Of course, nothing prevents us from messing up the assertion. For example, we could have written a (wrong) function as follows:

```typescript
function isString(value: unknown): asserts value is string {
  if (typeof value !== 'number') throw new Error('Not a string');
}
```

Note that we’re now checking whether `value's` type is not `number`, instead of `string`. In this case, TypeScript’s code flow analysis will see a `Value` of type `never`, instead of `string` as above.

Assertion functions can be very useful with [enums](https://blog.logrocket.com/writing-readable-code-with-typescript-enums-a84864f340e9/):

```typescript
type AccessLevel = 'r' | 'w' | 'rw';

const writeOnly = 'w';

function allowsReadAccess(level: AccessLevel): asserts level is 'r' | 'rw' {
  if (!level.includes('r')) throw new Error('Read not allowed');
}

allowsReadAccess(writeOnly);
```

In the example above, we first defined a type whose value can only be either `"r"`, `"w"`, or `"rw"`. Let’s assume such a type simply defines the three types of access to a given resource. We then declare an assertion function throwing if its actual parameter does not allow a read operation.

As you can see, we’re narrowing down the type explicitly, stating that, if the function returns, the value must be either `"r"` or `"rw"`. If we call `allowsReadAccess` with `writeOnly` as the actual parameter, we’ll get an error as expected, stating that `"Read access is not allowed"`.

Another common use of assertion functions is expressing non-nullability. The following snippet of code shows a way to make sure a value is defined, that is it’s not either `null` or `undefined`:

```typescript
function assertIsDefined<T>(value: T): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(\`${value} is not defined\`)
  }
}
```

Where `NonNullable<T>` is a TypeScript type that excludes `null` and `undefined` from the legit values of the type T.

---

![](https://blog.logrocket.com/wp-content/uploads/2023/07/Screen-Shot-2023-07-06-at-7.43.53-AM.png)

## [Over 200k developers use LogRocket to create better digital experiences](https://lp.logrocket.com/blg/learn-more)

---

### Function declarations and expressions

At the time of writing, assertion functions may not be defined as plain function expressions. Generally speaking, function expressions can be seen as anonymous functions; that is, functions without a name:

```typescript
// Function declaration
function fun() { ... }

// Function expression
const fun = function() { ... }
```

The main advantage of function declarations is hoisting, which is the possibility of using the function anywhere in the file where it’s defined. On the other hand, function expressions can only be used after they are created.

There is actually a workaround to write assertion functions as function expressions. Instead of defining the function along with its implementation, we’ll have to define its signature as an isolated type:

```typescript
// Wrong
// Error: A type predicate is only allowed in return type position for functions and methods.
// Error: Type '(value: any) => void' is not assignable to type 'void'.
const assertIsNumber: asserts value is number = (value) => {
  if (typeof value !== 'number') throw Error('Not a number');
};

// Correct
type AssertIsNumber = (value: unknown) => asserts value is number;
const assertIsNumber: AssertIsNumber = (value) => {
  if (typeof value !== 'number') throw Error('Not a number');
};
```

### Assertion functions and type guards

Assertion functions in TypeScript are somewhat similar to type guards. Type guards were originally introduced to perform runtime checks to guarantee the type of a value in a given scope.

In particular, a type guard is a function that simply evaluates a type predicate, returning either `true` or `false`. This is slightly different from assertion functions, which, as we saw above, are supposed to throw an error instead of returning `false` if the predicate is not verified.

```typescript
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// Type guards can also be declared as function expression
const isStringExp = (value: unknown): value is string =>
  typeof value === 'string';
```

There is another big difference though. Assertion functions can also be used without a type predicate, as we’ll see in the following section.

### Assertion functions without a type predicate

The assertion functions we’ve seen so far were all checking whether a given value had a given type. Hence, they were all fairly tailored for the target type. Nonetheless, assertion functions give us much more power. In particular, we can write a completely general function asserting a condition that gets input as a parameter:

```typescript
function assert(condition: unknown, msg?: string): asserts condition {
  if (condition === false) throw new Error(msg);
}
```

The `assert` function now inputs a `condition`, whose type is `unknown`, and, possibly, a `message`. Its body simply evaluates such a condition. If it is `false`, then `assert` throws an error, as expected.

Note, however, that the signature makes use of the `condition` parameter after `asserts`. This way, we’re telling TypeScript code flow analysis that, if the function returns correctly, it can assume that _whatever_ predicate we passed in was, in fact, verified.

TypeScript’s Playground gives us a pretty good visual representation of what the code flow analysis does. Let’s consider the following snippet of code, where we generate a random number and then call `assert` to make sure the generated number is `10`:

```typescript
const randomNumber = Math.random();
assert(randomNumber == 10, 'The number must be equal to 10');
randomNumber;
```

If we inspect the inferred properties of `randomValue` before the call to `assert`, TypeScript just tells us the type (Figure 1).

![RandomNumber](https://blog.logrocket.com/wp-content/uploads/2022/10/randomnumber.png)

Figure 1. TypeScript is only able to infer the type of randomNumber before the call to assert.

Then, as soon as we call `assert`, with the condition `randomNumber == 10`, TypeScript knows that the value will be `10` for the rest of the execution (Figure 2).

![RandomNumber set to 10](https://blog.logrocket.com/wp-content/uploads/2022/10/randomnumber-set-10.png)

Figure 2. TypeScript now tells us that randomNumber is set to 10.

Lastly, if we attempt to check the equality of `randomNumber` and another number, TypeScript will be able to evaluate the property without even running the program. For example, the code flow analysis will complain about the following assignment, saying, “This condition will always return ‘false’ since the types ’10’ and ’20’ have no overlap.”:

```typescript
const pred = randomNumber === 20;
```

## Conclusion

In this article, we dove into what TypeScript assertion functions are and how we can use them to have the code flow analysis infer a set of properties about our values. They are a very nice feature that makes sense considering that TypeScript is transpiled to JavaScript, which gives programmers a lot more flexibility.

In particular, we took a look at a handful of usages, including narrowing types down and expressing conditions on the actual value of our variables. Lastly, we briefly mentioned the differences and similarities with type guards and grasped the syntactic limitations of assertions functions.

## LogRocket understands everything users do in your web and mobile apps.

[![LogRocket Dashboard Free Trial Banner](https://blog.logrocket.com/wp-content/uploads/2017/03/1d0cd-1s_rmyo6nbrasp-xtvbaxfg.png)](https://lp.logrocket.com/blg/typescript-signup)

[LogRocket](https://lp.logrocket.com/blg/typescript-signup) lets you replay user sessions, eliminating guesswork by showing exactly what users experienced. It captures console logs, errors, network requests, and pixel-perfect DOM recordings — compatible with all frameworks, and with plugins to log additional context from Redux, Vuex, and @ngrx/store.

With Galileo AI, you can instantly identify and explain user struggles with automated monitoring of your entire product experience.

Modernize how you understand your web and mobile apps — [start monitoring for free](https://lp.logrocket.com/blg/typescript-signup).

[View all posts](https://blog.logrocket.com/)

Hey there, want to help make our blog better?

Join LogRocket’s Content Advisory Board. You’ll help inform the type of content we create and get access to exclusive meetups, social accreditation, and swag.

[Sign up now](https://lp.logrocket.com/blg/content-advisory-board-signup)
