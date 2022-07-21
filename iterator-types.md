Some iterator helpers already limit the reversibility. eg. `take(n)`, actually it means take the first n elements, so it already one-direction and no way to reverse.

Or we could make iterators always reversible (means u could always `reverse()` it, `reverse()` just reverse the invoking of `next()` and `nextLast()`), because it just change the end which could be iterated.

There are three type of iterables as double-ended iteration:

1. double-ended, which its iterator support both `next()` and `nextLast()`
2. forward-only, which its iterator only support `next()`, `reverse()` it will transform it to backward-only
3. backward-only, which its iterator only support `nextLast()`,  `reverse()` it will transform it to forward-only

Here are the simple result table for iterator helpers (note, most aggregator methods like `toArray`, `every`, etc. are direction-neutral so not listed here) :

method  \  upstream | double-ended | forward-only | backward-only
-|-|-|-
`forEach` | ✅ double-ended | ✅ forward-only | ✅ backward-only
`map` | ✅ double-ended | ✅ forward-only | ✅ backward-only
`filter` | ✅ double-ended | ✅ forward-only | ✅ backward-only
`flatMap` | ✅ double-ended | ✅ forward-only | ✅ backward-only
`reverse` | ✅ double-ended | ✅ backward-only | ✅ forward-only
`indexed` |  ✅ front-only | ✅ forward-only | ❌
`take` | ✅ forward-only | ✅ forward-only | ❌
`drop` | ✅ double-ended | ✅ forward-only | ❌
`find` | ✅ | ✅ | ❌
`reduce` | ✅ | ✅  | ❌
`takeLast` | ✅ back-only | ❌ | ✅ backward-only
`dropLast` | ✅ double-ended | ❌ | ✅ backward-only
`findLast` | ✅ | ❌ | ✅
`reduceRight` | ✅ | ❌ | ✅

Note: How to read the table: `upstream.method() => tablecell`, for example, `doubleEnded.map() => doubleEnded`, `forwardOnly.reverse() => backwardOnly`, `forwardOnly.takeLast() => ❌` (❌  means throw TypeError)

Maybe `take`, `takeLast` could keep double-ended, see https://github.com/tc39/proposal-deiter/issues/13

About `flatMap`: need more investigation.

