import * as cutfn from "./cut-fn.js"
function cut(...args) {
  if (args.length === 1) return wrap(...args)
  if (args[0] === "init") return init(...args)
  if (args[0] === "mode") return mode(...args)
  if (args[0] === "shortcut") return shortcut(...args)
  return fn(...args)
  function init(_, fns) {
    if (!globalThis.window) globalThis.window = globalThis
    cut.constructors = {}
    cut.shortcuts = {}
    Object.entries(fns).forEach(([k, fn]) => {
      const parts = k.split("_")
      if (parts.length === 1) return cut(null, parts[0], fn)
      if (parts[0] === "shortcut") return cut("shortcut", parts.slice(1), fn)
      cut(window[parts[0]], parts[1], fn)
    })
  }
  function wrap(initial) {
    let result
    const path = [initial]
    const proxy = new Proxy(() => null, {
      get(target, prop) {
        if (result) return result[prop]
        if (prop === "then") return (resolve) => resolve(path)
        if (prop === "path") return path
        if (prop === "data" || prop === "error") {
          try {
            let data = initial
            for (const p of path.slice(1)) {
              if (p instanceof Array) {
                if (data?.[p[0]]) data = data[p[0]](...p[1])
                else data = cut[p[0]](data, ...p[1])
              } else data = data[p]
            }
            result = { data, path }
            return result[prop]
          } catch (error) {
            result = { error, path }
            return result[prop]
          }
        }
        path.push(prop)
        return proxy
      },
      apply(target, that, args) {
        path.push([path.pop(), args])
        return proxy
      },
    })
    return proxy
  }
  function mode(_, mode) {
    if (!mode) return
    cut.mode = mode
    Object.entries(cut.constructors).forEach(([cname, constructor]) => {
      Object.entries(cut[cname]).forEach(([fname, f]) => {
        fn(constructor, fname, f)
      })
    })
  }
  function shortcut(_, key, value) {
    if (key instanceof Array) return key.map((k) => shortcut(_, k, value))
    cut.shortcuts[key] = value
    mode(_, cut.mode)
  }
  function fn(constructor, key, value) {
    if (!constructor) constructor = { name: "Generic", prototype: Object.prototype }
    if (constructor.prototype[key]?.native) constructor.prototype[key] = constructor.prototype[key].native
    if (constructor.prototype[key] && !constructor.prototype[key].toString()?.includes("[native code]")) delete constructor.prototype[key]
    if (!value && Object.values(cut.constructors).every((v) => !v[key])) delete cut[key]
    if (!value) return delete cut[constructor.name][key]
    if (value.fn) value = value.fn
    if (value === constructor.prototype[key]) {
      const native = constructor.prototype[key]
      value = native.call.bind(native)
      value.native = native
    }
    const shortcut = Object.hasOwn(cut.shortcuts, key) && cut.shortcuts[key]
    const fn = cutfn.Function_decorate(value, shortcut)
    cut.constructors[constructor.name] = constructor
    cut[constructor.name] = cut[constructor.name] || {}
    cut[constructor.name][key] = fn
    cut[key] = (...args) => {
      if (value?.toString()?.includes("[native code]") || constructor.name === "Generic") return cut[constructor.name][key](...args)
      if (!cut[args[0]?.constructor.name]?.[key]) throw new Error(`${key} does not exist on ${args[0]?.constructor.name}`)
      return cut[args[0].constructor.name][key](...args)
    }
    if (cut.mode?.includes("window")) {
      window.cut = cut
      window[key] = cut[key]
    }
    if (cut.mode?.includes("prototype")) {
      let f = { [key](...args) { return fn(this, ...args) } } // prettier-ignore
      if (constructor.name === "Generic") f = { [key](...args) { return this === cut[args[0]?.constructor.name] ? fn(...args) : fn(this, ...args)} } // prettier-ignore
      Object.defineProperty(constructor.prototype, key, { writable: true, configurable: true, value: f[key] }) // enumerable: false
      if (value.native) constructor.prototype[key].native = value.native
    }
  }
}
cut("init", cutfn)
cut("mode", import.meta.url.split("?")[1] || "default")
export default cut
const { is, equal, access, transform, keys, values, entries, fromEntries, map, reduce, filter, find, findIndex, sort, group, unique, min, max, sum, mean, median, decorate, promisify, partial, memoize, every, wait, debounce, throttle, words, format, duration, relative, getWeek, getQuarter, getLastDate, getTimezone, setTimezone, parse, modify, plus, minus, start, end, escape, replace } = cut
export { is, equal, access, transform, keys, values, entries, fromEntries, map, reduce, filter, find, findIndex, sort, group, unique, min, max, sum, mean, median, decorate, promisify, partial, memoize, every, wait, debounce, throttle, words, format, duration, relative, getWeek, getQuarter, getLastDate, getTimezone, setTimezone, parse, modify, plus, minus, start, end, escape, replace }
