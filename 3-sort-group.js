export const Array_sort = [].sort
export function Array_group(arr, keys) {
  keys = [].concat(keys)
  return arr.reduce((acc, v) => {
    keys.reduce((acc, k, i) => {
      const key = access(v, k)
      const last = i === keys.length - 1
      const hasKey = Object.hasOwn(acc, key)
      if (last) return (acc[key] = hasKey ? acc[key].concat([v]) : [v])
      return (acc[key] = hasKey ? acc[key] : {})
    }, acc)
    return acc
  }, {})
}
export function shortcut_sort(fn, ...args) {
  const { compare } = new Intl.Collator(undefined, { numeric: true })
  function defaultSort(a, b) {
    if (typeof a !== typeof b) return typeof a > typeof b ? 1 : -1
    if (typeof a === "number") return a === b ? 0 : a > b ? 1 : -1
    return compare(a, b)
  }
  function directedSort(p, desc = /^-/.test(p)) {
    p = `${p}`.replace(/^[+-]/, "")
    return (a, b) => defaultSort(access(a, p), access(b, p)) * +(!desc || -1)
  }
  function multiSort(fns) {
    return (a, b) => {
      for (const fn of fns) {
        const z = fn(a, b)
        if (z) return z
      }
    }
  }
  function f(fn) {
    if (fn == null) return defaultSort
    if (fn instanceof Array) return multiSort(fn.map(f))
    if (fn instanceof Function && fn.length === 1) return (x, y) => defaultSort(fn(x), fn(y))
    if (fn instanceof Function) return fn
    return directedSort(fn)
  }
  // args[0] = args[0].slice() // NOTE: change default mutating behavior
  args[1] = f(args[1])
  return fn(...args)
}
