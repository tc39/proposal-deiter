// May be standardized to Iterator.doubleEnded() in the future
// See https://github.com/tc39/proposal-deiter#generator for usage
function doubleEnded(g) {
  return function (...args) {
    const context = {}
    args.push(context)
    const iter = Reflect.apply(g, this, args)
    return {
      __proto__: IteratorPrototype,
      next() {
        context.method = "next"
        return iter.next()
      },
      nextLast() {
        context.method = "nextLast"
        return iter.next()
      },
      return(v) { return iter.return(v) },
    }
  }
}
const IteratorPrototype = function *() {}.prototype.__proto__.__proto__
