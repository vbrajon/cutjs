import cut from "./cut.js"
export function transform(obj, fn) {
  function inner(o, path) {
    if (!o || typeof o !== "object") return fn(o, path)
    const acc = Array.isArray(o) ? [] : {}
    for (const k in o) acc[k] = inner(o[k], path.concat(k))
    return acc
  }
  return inner(obj, [])
}
export function Array_unique(arr) {
  return [...new Set(arr)]
}
export function Array_min(arr) {
  return Math.min(...arr)
}
export function Array_max(arr) {
  return Math.max(...arr)
}
export function Array_sum(arr) {
  return arr.reduce((acc, v) => acc + v, 0)
}
export function Array_mean(arr) {
  return arr.reduce((acc, v) => acc + v, 0) / arr.length
}
export function Array_median(arr) {
  const mid = Math.floor(arr.length / 2)
  const nums = arr.slice().sort((a, b) => a - b)
  return arr.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
}
export function Function_promisify(fn) {
  return function promisified(...args) {
    return new Promise((resolve, reject) => fn(...args, (err, val) => (err ? reject(err) : resolve(val))))
  }
}
export function Function_partial(fn, ...outer) {
  function partial(...inner) {
    const args = outer.map((a) => (a === null ? inner.shift() : a)).concat(inner)
    return fn(...args)
  }
  partial.fn = fn
  return partial
}
export function Function_every(fn, ms = 0, repeat = Infinity, immediate = true) {
  if (immediate) fn()
  fn.id = setInterval(() => {
    if (--repeat > +immediate) return fn()
    fn.resolve(fn())
    fn.stop()
  }, ms)
  fn.start = Date.now()
  fn.stop = function stop() {
    clearInterval(fn.id)
    delete fn.id
  }
  fn.then = (resolve) => (fn.resolve = resolve)
  return fn
}
export function Function_wait(fn, ms) {
  return Function_every(fn, ms, 1, false)
}
export function Function_debounce(fn, ms = 0) {
  return function debounced(...args) {
    clearTimeout(fn.id)
    fn.id = setTimeout(() => fn(...args), ms)
  }
}
export function Function_throttle(fn, ms = 0) {
  return function throttled(...args) {
    fn.next = function next() {
      delete fn.next
      fn.id = setTimeout(() => {
        delete fn.id
        if (fn.next) fn.next()
      }, ms)
      fn(...args)
    }
    if (fn.id) return
    fn.next()
  }
}
export function RegExp_escape(re) {
  return new RegExp(re.source.replace(/([\\/'*+?|()[\]{}.^$-])/g, "\\$1"), re.flags)
}
export function RegExp_replace(re, a, b) {
  return new RegExp(re.source.replace(a, b), re.flags)
}
export function RegExp_plus(re, flags) {
  return new RegExp(re.source, [...new Set(re.flags + flags)].sort().join(""))
}
export function RegExp_minus(re, flags) {
  return new RegExp(re.source, [...new Set(re.flags.replace(new RegExp(`[${flags}]`, "g"), ""))].sort().join(""))
}
export function shortcut_unique_min_max(fn, ...args) {
  if (args[1]) {
    const mapped = cut.map(...args)
    const result = fn(mapped)
    if (result instanceof Array) return result.map((v) => args[0][mapped.indexOf(v)])
    return args[0][mapped.indexOf(result)]
  }
  return fn(...args)
}
export function shortcut_sum_mean_median(fn, ...args) {
  if (args[1]) return fn(cut.map(...args))
  return fn(...args)
}
