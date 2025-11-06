import * as f0 from "./0-base.js"
import * as f1 from "./1-format.js"
import * as f2 from "./2-parse.js"
import * as f3 from "./3-sort-group.js"
import * as f4 from "./4-map-reduce.js"
import * as f5 from "./5-additional.js"
const cut = { by: { name: { ...f0, ...f1, ...f2, ...f3, ...f4, ...f5 }, group: {}, constructor: {} } }
const proto = import.meta.url.includes("proto")
if (!globalThis.window) globalThis.window = globalThis
Object.entries(cut.by.name).forEach(([k, fn]) => {
  const parts = k.split("_")
  if (window[parts[0]] || parts[0] === "shortcut")
    return parts.slice(1).forEach((part) => {
      cut.by.group[part] ||= {}
      cut.by.group[part][parts[0]] = fn
      cut.by.constructor[parts[0]] ||= {}
      cut.by.constructor[parts[0]][part] = fn
    })
  cut[k] = fn
  cut.by.constructor.Generic ||= {}
  cut.by.constructor.Generic[k] = fn
  if (proto) window[k] = fn
})
Object.entries(cut.by.group).forEach(([k, fns]) => {
  const keys = Object.keys(fns).filter((k) => k !== "shortcut")
  if (!keys.length) throw new Error(`Dispatch: no implementations provided`)
  keys.forEach((k) => {
    const fn = fns[k]
    if (typeof fn !== "function") throw new Error(`Dispatch: implementation for ${k} is not a function`)
    if (!window[k]) throw new Error(`Dispatch: constructor ${k} does not exist`)
    // fn.toString()?.includes("[native code]")
    if (window[k].prototype[fn.name] === fn) {
      fns.native = fn
      fns[k] = fn.call.bind(fn)
    }
  })
  if (fns.shortcut) keys.forEach((k) => (fns[k] = cut.by.name.Function_decorate(fns[k], fns.shortcut)))
  if (fns.Number) fns.BigInt = fns.Number
  const fn = function dispatch(...args) {
    const constructor = args[0]?.constructor?.name
    const fn = fns[constructor]
    if (!fn) throw new Error(`Dispatch: Unsupported constructor ${constructor}`)
    return fn(...args)
  }
  Object.assign(fn, fns)
  if (proto) {
    window.cut = cut
    window[k] = fn
    for (const cname of keys) {
      const constructor = window[cname]
      const fn = fns[cname]
      Object.defineProperty(constructor.prototype, k, {
        writable: true,
        configurable: true,
        value: function (...args) {
          return fn(this, ...args)
        },
      })
      if (fns.native) constructor.prototype[k].native = fn.native
    }
  }
  cut[k] = fn
})
export default cut
const { is, equal, access, transform, keys, values, entries, fromEntries, map, reduce, filter, find, findIndex, sort, group, unique, min, max, sum, mean, median, decorate, promisify, partial, memoize, every, wait, debounce, throttle, words, format, duration, relative, getWeek, getQuarter, getLastDate, getTimezone, setTimezone, parse, modify, plus, minus, start, end, escape, replace } = cut
export { is, equal, access, transform, keys, values, entries, fromEntries, map, reduce, filter, find, findIndex, sort, group, unique, min, max, sum, mean, median, decorate, promisify, partial, memoize, every, wait, debounce, throttle, words, format, duration, relative, getWeek, getQuarter, getLastDate, getTimezone, setTimezone, parse, modify, plus, minus, start, end, escape, replace }
