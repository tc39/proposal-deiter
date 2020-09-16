# Semantic details of double-ended destructuring

This is a preliminary document to define the semantic details of all edge cases

## Destructuring result if no enough item

```js
let [...a, b] = [1]
a // []
b // 1
```

---

```js
let [...a, b] = []
a // []
b // undefined
```

---

```js
let [...a, b = 10] = [1]
a // []
b // 1
```

Someone may expect `a` be `[1]` and `b === 10` at first glance, but if that way, `a` will always gather all items and `b` will always `10` so the syntax become useless.

---

```js
let [a, ...b, c] = [1]
a // 1
b // []
c // undefined
```

---

```js
let [a, b, c, ...d, e] = [1, 2]
a // 1
b // 2
c // undefined
d // []
e // undefined
```

Always first fill the left side of `...`.

---

```js
let [...a, b, c] = [1]
a // []
b // 1
c // undefined
```

Someone may expect `b === undefined && c === 1`. Both could be reasonable, currently I choose to follow Ruby and CoffeeScript, but maybe we should choose another side especially if consider execution order issue.

Note, u always could use `let [...[...a, b], c] = [1]` to get `b === undefined && c === 1`.


## Execution order

```js
let [a = console.log(1), ...[a = console.log(2)], b = console.log(3), c = console.log(4)] = []
```

Should the order be 1,4,3,2 ? or 1,2,3,4 ?

```js
let [a, ...b, c, d, e] = {
  *[Symbol.deIterator]() {
    yield 1
    yield 10
    yield 9
    throw new Error()
  }
}
```

Should the result of c,d,e be all `undefined` or `9,10,undefined`?
