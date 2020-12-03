# Optional Mechanisms for Double-ended Destructructing

## Recap

```javascript
let [first, ...rest, last] = [1, 2, 3, 4]
first // 1
last // 4
rest // [2, 3]

// rest can be omitted if not needed
let [first, ..., last] = [1, 2, 3, 4]
```

In the [TC39 meeting in Sept 2020](https://github.com/tc39/notes/blob/master/meetings/2020-09/sept-24.md#double-ended-iterator-and-destructuring-for-stage-1), double-ended iterator and destructuring entered stage 1. Delegates agreed to extend the syntax of destructuring to support double-ended destructuring, but some delegates questioned whether double-ended iterator is needed as the underlying mechanism of double-ended destructuring.

In order to better explore this issue, I will elaborate and analyze possible underlying mechanisms below.

## index-based (only supports array)

The destructuring in Ruby and Rust only supports arrays, and the underlying mechanism is based on index access. To destructure iterable, you must first convert iterable to an array.

Since the destructuring in JS is designed to be based on the Iterable protocol, not based on index access, and I believe the committee will not be willing to change this, this option is almost impossible to apply to JS.

## Mechanism A: Based on Array

Under this mechanism, the semantics of the code `let [first, ...rest, last] = iterable` is basically:

```javascript
let [first, ...rest] = iterable
let [last] = rest.splice(-1, 1)
```

The advantage of this mechanism is simplicity. But there is a scale problem.

The scale problem is that `iterable` may be a very long list, and a common use case is to take only the last few elements:

```javascript
let iterable = BigInt.range(1n, 1_000_000n)

let [a, b, ..., c, d] = iterable
```

In this case, we waste a lot of cpu power and memory, and the performance is poor by default.

The engine can optimize the built-in collection types to alleviate it. However, this optimization only applies to the built-in iterators, the user-land iterators/generators still suffer it.

From an engineering point of view, such optimization will eventually encourage some developers to write non-scale code, making the relevant code unable to have a definite performance expectation.

For situations where performance is sensitive and deterministic performance expectations are required, developers must abandon the iterable protocol and destructuring syntax, use index access, or implement APIs like index access or similar double-ended iterator protocols by themselves.

```javascript
// Assume range have API similar to index access
let [a, b] = iterable
let c = iterable.getItem(range.length - 2)
let d = iterable.getItem(range.length - 1)
```

```javascript
// Assume range have API similar to double-ended iterator
let [a, b] = iterable
let [c, d] = iterable.lastItems(2)
```

Note: The above code does not handle the situation where the actual length of `iterable` is less than 4. If you need to ensure consistency with iterable/destructuring semantics (to avoid getting duplicate elements from both sides), the code will become quite complicated.

> Mark Miller: ...the destructuring patterns and parameter patterns are not used at the scale where scaling is relevant.

MM's comment at the last meeting was that if scale is needed, destructuring are not used.

I think this is a "should be" or "as it is" problem. Regarding mechanism A, I agree that when scale is needed, destructuring should not be used. But did the engineer actually do this?

In particular, code `let [first] = iterable` naturally has no scale problem (because it does not consume the entire iteration), but its corresponding `let [..., last] = iterable` has a scale problem.

In this way, although the introduction of double-ended destructuring increases the ergonomics , it also introduces an additional mental burden.

Developers at least need to determine their performance requirements before using double-ended destructuring (even according to Mark Miller's opinion, this must be the case). However, in many cases, we are not clear on performance requirements at the beginning (junior engineers often lack this ability), or as the project involve, performance requirements will change. Many experienced engineers tend to ensure that the code always has deterministic performance expectations, even if there is no clear performance requirement at the beginning.

From my engineering experience, I think this will make the double-ended deconstruction into a [鸡肋 (chicken rib, things of little value or interest, yet pitiable if given up or thrown away)](https://en.wiktionary.org/wiki/%E9%B8%A1%E8%82%8B).

## Mechanism B: Based on double-ended iterator

Under this mechanism, the semantics of the code `let [first, ...rest, last] = iterable` is basically:

```javascript
let iterator = Iterator.from(iterable)
let first = iterator.next().value
let last = iterator.next('back').value
let rest = iterator.toArray()
// iterator.return?.() // if rest is omitted
```

It seems more complicated than mechanism A, but this is because when explaining mechanism A, the underlying iterator semantics is not expanded. If expanded, it is basically:

```javascript
let iterator = Iterator.from(iterable)
let first = iterator.next().value
let rest = iterator.toArray()
let last = rest.splice(-1, 1)[0]
```

As this version, the semantic complexity of the two is similar.

Considering the possible optimization of built-in iterable types by the JS engines under mechanism A, it is essentially an abstraction similar to double-ended iteration (especially for types without index access such as `Set` and `Map` ). From the point of view of the object protocols, the interface capability of an object increases from normal iterable to double-ended iterable to indexable. Therefore, instead of confining this mechanism to the engine, it is better to generalize the protocol at the language level, so that engineers (especially the authors of the libraries) can implement the protocol by themselves, provide a performance-friendly implementation, and give full power to the double-ended destructuring syntax.

If the object does not implement double-ended iterable protocol, using double-ended destructuring will throw a TypeError, which ensures the deterministic performance expectations of using double-ended iterators and double-ended destructuring. Note that for performance-insensitive cases, developers can always first convert an iterable to an array to use double-ended destructuring. Even if there is a possibility of abusing, because of the explicit conversion code, it's easy for tools and code review to discover them.

Note: Further, `iterator.toArray()` in iterator helpers proposal can also be extended to allow implementers of iterators to provide a performance-friendly version.

```javascript
Iterator.prototype.toArray = function toArray() {
  let {done, value} = this.next('rest')
  if (done) {
    if (value === undefined) return []
    if (Array.isArray(value)) return value
    throw new TypeError()
  }
  
  let a = [value]
  for (;;) {
    let {done, value} = this.next()
    if (done) return a
    a.push(value)
  }
}
```

The possible cost of introducing double-ended iterator is the addition of the concept of "double-ended iterable/iterator" and the need to update the implementation of built-in iterators (most built-in iterators should support double-ended iteration).

We can compare it to the [reverse iterator](https://github.com/tc39/proposal-reverseIterator) proposal, which adds the concept of "reverse iterator" and also needs to add reverse iteration capabilities to the built-in collection (most built-in collections should support reverse iteration).

Double-ended iterator actually covers all use cases of reverse iterators and related discussions, and is a more general mechanism. So in terms of the total cost of the two proposals, the cost of double-ended iterator may be smaller.

## Summary

Mechanism A (based on arrays) and mechanism B (based on double-ended iterator) have similar semantic complexity.

Mechanism A does not need to introduce new concept; mechanism B introduces the concept of "whether the double-ended iterator protocol is implemented".

Mechanism A does not need to update the implementation of the built-in iterators; mechanism B needs to update the built-in iterators to implement the double-ended iterator protocol. But under mechanism A, if the engine optimizes its performance, it is actually very similar to implementing a double-ended iterators.

Mechanism A has a scale problem; Mechanism B is performance-friendly and does not have the scale problem.

Mechanism A is only limited to destructuring; mechanism B is a more general mechanism that can solve both destructuring and reverse iterator use cases together.
