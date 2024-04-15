// Object
function object_map(obj, fn) {
  return Object.keys(obj).reduce((acc, k, i) => {
    acc[k] = fn(obj[k], k, i, obj)
    return acc
  }, {})
}
function object_reduce(obj, fn, base) {
  return Object.keys(obj).reduce((acc, k, i) => fn(acc, obj[k], k, i, obj), base)
}
function object_filter(obj, fn) {
  return Object.keys(obj).reduce((acc, k, i) => {
    if (fn(obj[k], k, i, obj)) acc[k] = obj[k]
    return acc
  }, {})
}
function object_find(obj, fn) {
  return obj[Object.keys(obj).find((k, i) => fn(obj[k], k, i, obj))]
}
function object_findIndex(obj, fn) {
  return Object.keys(obj).find((k, i) => fn(obj[k], k, i, obj))
}
function object_type(a) {
  if (!a) return Number.isNaN(a) ? "NaN" : Object.prototype.toString.call(a).slice(8, -1)
  return a.constructor.name
}
function object_is(a, constructor) {
  if (arguments.length === 1) return object_type(a)
  if (!constructor) return a === constructor || isNaN(a) === isNaN(constructor)
  return a?.constructor === constructor
}
function object_equal(a, b) {
  if (a === b) return true
  if (a == null || b == null) return false
  if (a.constructor !== b.constructor) return false
  if (![Object, Array].includes(a.constructor)) return a.toString() === b.toString()
  if (Object.keys(a).length !== Object.keys(b).length) return false
  return Object.keys(a).every((k) => object_equal(a[k], b[k]))
}
const dotpath = function_memoize((str) => str.split(/(?:\.|\[["']?([^\]"']*)["']?\])/).filter((x) => x))
function object_access(obj, path) {
  if (obj == null || path == null) return obj
  if (Object.prototype.hasOwnProperty.call(obj, path)) return obj[path]
  if (typeof path === "string") return object_access(obj, dotpath(path))
  if (path instanceof Array) return path.reduce((a, p) => (a && a[p] != null ? a[p] : undefined), obj)
  if (path instanceof Function) return path(obj)
  if (path instanceof Object) return object_map(path, (p) => object_access(obj, p))
}
function object_traverse(obj, fn, path = []) {
  if (obj instanceof Array) return obj.map((v, k) => object_traverse(v, fn, path.concat(k)))
  if (obj instanceof Object) return object_map(obj, (v, k) => object_traverse(v, fn, path.concat(k)))
  return fn(obj, path)
}
// Array
function array_group(arr, keys) {
  return arr.reduce((acc, v) => {
    keys.reduce((acc, k, i) => {
      const key = object_access(v, k)
      const last = i === keys.length - 1
      const hasKey = Object.prototype.hasOwnProperty.call(acc, key)
      if (last) return (acc[key] = hasKey ? acc[key].concat([v]) : [v])
      return (acc[key] = hasKey ? acc[key] : {})
    }, acc)
    return acc
  }, {})
}
function array_unique(arr) {
  return Array.from(new Set(arr))
}
function array_min(arr) {
  return Math.min(...arr)
}
function array_max(arr) {
  return Math.max(...arr)
}
function array_sum(arr) {
  return arr.reduce((acc, v) => acc + v, 0)
}
function array_mean(arr) {
  return arr.reduce((acc, v) => acc + v, 0) / arr.length
}
function array_median(arr) {
  const mid = Math.floor(arr.length / 2)
  const nums = arr.slice().sort((a, b) => a - b)
  return arr.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2
}
// Function
function function_decorate(fn, options) {
  if (!options || fn.name === "decorated") return fn
  if (options instanceof Function) options = { around: options }
  function decorated(...args) {
    args = decorated.before ? decorated.before(args) : args
    if (!args) return null
    if (!(args instanceof Array)) args = [args]
    const output = decorated.around ? decorated.around(fn, ...args) : fn(...args)
    return decorated.after ? decorated.after(output) : output
  }
  decorated.before = options.before
  decorated.after = options.after
  decorated.around = options.around
  decorated.fn = fn
  return decorated
}
function function_promisify(fn) {
  return function promisified(...args) {
    return new Promise((resolve, reject) => fn(...args, (err, val) => (err ? reject(err) : resolve(val))))
  }
}
function function_partial(fn, ...outer) {
  function partial(...inner) {
    const args = outer.map((a) => (a === null ? inner.shift() : a)).concat(inner)
    return fn(...args)
  }
  partial.fn = fn
  return partial
}
function function_memoize(fn, hash = JSON.stringify) {
  function memoized(...args) {
    const key = hash(args)
    if (!Object.prototype.hasOwnProperty.call(memoized.cache, key)) memoized.cache[key] = fn(...args)
    return memoized.cache[key]
  }
  memoized.cache = {}
  return memoized
}
function function_every(fn, ms = 0, repeat = Infinity, immediate = true) {
  if (immediate) fn()
  fn.id = setInterval(function loop() {
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
function function_wait(fn, ms) {
  return function_every(fn, ms, 1, false)
}
function function_debounce(fn, ms = 0) {
  return function debounced() {
    clearTimeout(fn.id)
    fn.id = setTimeout(() => fn(...arguments), ms)
  }
}
function function_throttle(fn, ms = 0) {
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
// String
function string_lower(str) {
  return str.toLowerCase()
}
function string_upper(str) {
  return str.toUpperCase()
}
function string_capitalize(str) {
  return str.toLowerCase().replace(/./, (c) => c.toUpperCase())
}
function string_words(str, sep = /[-_,.\s]/) {
  return str
    .normalize("NFKD")
    .replace(RegExp("[^A-z0-9" + sep.source.slice(1, -1) + "]", "g"), "")
    .replace(/([a-z])([A-Z\d])/g, "$1 $2")
    .split(sep)
    .filter((x) => x)
}
function string_format(str, ...args) {
  if (!args.length) args = ["title"]
  if (["title", "pascal", "camel", "dash", "list", "kebab", "underscore", "snake"].includes(args[0])) {
    let tokens = string_words(str.toLowerCase())
    let sep = " "
    if (args[0] === "camel") return string_format(str, "pascal").replace(/./, (c) => c.toLowerCase())
    if (["title", "pascal"].includes(args[0])) tokens = tokens.map((v) => v.replace(/./, (c) => c.toUpperCase()))
    if (["pascal"].includes(args[0])) sep = ""
    if (["dash", "list", "kebab"].includes(args[0])) sep = "-"
    if (["underscore", "snake"].includes(args[0])) sep = "_"
    return tokens.join(sep)
  }
  let i = 0
  let fn
  fn = (m) => object_access(args, m)
  if (typeof args[0] === "object") fn = (m) => object_access(args[0], m)
  if (typeof args[0] === "function") fn = args.shift()
  return str.replace(/\{[^{}]*\}/g, (m) => String(fn(m.slice(1, -1) || i, i++)).replace(/^(null|undefined)$/, ""))
}
// Number
function number_duration(num) {
  if (!num) return ""
  const units = UNITS.slice().reverse()
  const [k, v] = units.find(([k, v]) => v && v <= Math.abs(num) * 1.1)
  return Math.round(+num / +v) + " " + k + (Math.abs(Math.round(+num / +v)) > 1 ? "s" : "")
}
function number_format(num, format, options) {
  if (format && typeof format === "string") return Intl.NumberFormat(format, options).format(num)
  if (format && typeof format === "number") return num.toExponential(format - 1).replace(/([+-\d.]+)e([+-\d]+)/, (m, n, e) => +(n + "e" + (e - Math.floor(e / 3) * 3)) + (["mµnpfazy", "kMGTPEZY"][+(e > 0)].split("")[Math.abs(Math.floor(e / 3)) - 1] || ""))
  return +num.toPrecision(15)
}
// Date
const UNITS = [
  ["millisecond", 1, "S", "Milliseconds", 3],
  ["second", 1000, "s", "Seconds"],
  ["minute", 1000 * 60, "m", "Minutes"],
  ["hour", 1000 * 60 * 60, "h", "Hours"],
  ["day", 1000 * 60 * 60 * 24, "D", "Date"],
  ["week", 1000 * 60 * 60 * 24 * 7, "W", "Week"],
  ["month", 1000 * 60 * 60 * 24 * 30, "M", "Month"],
  ["quarter", 1000 * 60 * 60 * 24 * 30 * 3, "Q", "Quarter", 1],
  ["year", 1000 * 60 * 60 * 24 * 365, "Y", "FullYear", 4],
  ["timezone", null, "Z", "Timezone"],
]
UNITS.map(([k, v]) => (UNITS[k.toUpperCase()] = v))
function date_relative(from, to = new Date()) {
  return number_duration(+from - +to).replace(/^-?(.+)/, (m, d) => d + (m[0] === "-" ? " ago" : " from now"))
}
function date_getWeek(date) {
  const soy = new Date(date.getFullYear(), 0, 1)
  const doy = Math.floor((+date - +soy) / UNITS.DAY) + 1
  const dow = date.getDay() || 7
  return Math.floor((10 + doy - dow) / 7) || date_getWeek(new Date(date.getFullYear(), 0, 0))
}
function date_getQuarter(date) {
  return Math.ceil((date.getMonth() + 1) / 3)
}
function date_getLastDate(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}
function date_getTimezone(date, offset = date.getTimezoneOffset()) {
  return `${offset > 0 ? "-" : "+"}${("0" + ~~Math.abs(offset / 60)).slice(-2)}:${("0" + Math.abs(offset % 60)).slice(-2)}`
}
function date_format(date, format = "YYYY-MM-DDThh:mm:ssZ", lang = "en") {
  const parts = format.split(",").map((v) => v.trim())
  if (parts.some((v) => ["full", "long", "medium", "short"].includes(v))) return date.toLocaleString(lang, { dateStyle: parts[0] || undefined, timeStyle: parts[1] })
  if (parts.some((v) => ["year", "month", "mon", "day", "weekday", "wday", "hour", "minute", "second"].includes(v))) {
    const options = {}
    if (parts.includes("second")) options.second = "2-digit"
    if (parts.includes("minute")) options.minute = "2-digit"
    if (parts.includes("hour")) options.hour = "2-digit"
    if (parts.includes("wday")) options.weekday = "short"
    if (parts.includes("weekday")) options.weekday = "long"
    if (parts.includes("day")) options.day = "numeric"
    if (parts.includes("mon")) options.month = "short"
    if (parts.includes("month")) options.month = "long"
    if (parts.includes("year")) options.year = "numeric"
    if (!options.day && !options.month && !options.year) return date_format(date, (options.hour && "hh:mm:ss") || (options.minute && "mm:ss") || "ss")
    return date.toLocaleString(lang, options)
  }
  return UNITS.reduce((str, [k, v, letter, jsfn, zeros = 2]) => {
    return str.replace(RegExp(letter + "+", "g"), (m) => {
      if (letter === "Z") return date_getTimezone(date)
      if (letter === "W") return "W" + date_getWeek(date)
      if (letter === "Q") return "Q" + date_getQuarter(date)
      let int = date["get" + jsfn]()
      if (letter === "M") int = int + 1
      if (m.length > zeros) return ("0".repeat(zeros) + int).slice(-zeros) + letter
      return ("0".repeat(zeros) + int).slice(-m.length)
    })
  }, format)
}
function date_modify(date, options, sign) {
  if (!options || !sign) return date
  if (typeof options === "string") {
    options = { str: options }
    options.str.replace(/([+-.\d]*)\s*(second|minute|hour|day|month|year)s?/gi, (m, n, u) => (options[u + "s"] = +n || 1 - +(n === "0")))
  }
  options = Object.fromEntries(
    Object.entries(options)
      .filter(([k, v]) => ["seconds", "minutes", "hours", "days", "months", "years"].includes(k))
      .map(([k, v]) => [k, Math.round(+v)])
  )
  const d = new Date(date)
  const units = UNITS.filter((unit) => ["second", "minute", "hour", "day", "month", "year"].includes(unit[0]))
  const fn = {
    "+": (unit, n) => d["set" + unit[3]](d["get" + unit[3]]() + n),
    "-": (unit, n) => d["set" + unit[3]](d["get" + unit[3]]() - n),
    "<"(unit) {
      const index = units.findIndex((u) => u === unit)
      return units.slice(0, index).map((unit) => d["set" + unit[3]](unit[3] === "Date" ? 1 : 0))
    },
    ">"(unit) {
      const index = units.findIndex((u) => u === unit)
      units
        .slice(0, index)
        .reverse()
        .map((unit) => d["set" + unit[3]]({ Month: 11, Date: date_getLastDate(d), Hours: 23, Minutes: 59, Seconds: 59 }[unit[3]]))
    },
  }[sign]
  units.forEach((unit) => options[unit[0] + "s"] && fn(unit, options[unit[0] + "s"]))
  d.setMilliseconds(0)
  if (["-", "+"].includes(sign) && date.getDate() !== d.getDate() && ["year", "month"].some((k) => options[k + "s"]) && !["day", "hour", "minute", "second"].some((k) => options[k + "s"])) d.setDate(0)
  if (date.getTimezoneOffset() !== d.getTimezoneOffset()) return new Date(+d + (date.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000)
  return d
}
function date_plus(date, options) {
  return date_modify(date, options, "+")
}
function date_minus(date, options) {
  return date_modify(date, options, "-")
}
function date_start(date, options) {
  return date_modify(date, options, "<")
}
function date_end(date, options) {
  return date_modify(date, options, ">")
}
// RegExp
function regexp_escape(re) {
  return RegExp(re.source.replace(/([\\/'*+?|()[\]{}.^$-])/g, "\\$1"), re.flags)
}
function regexp_plus(re, f) {
  return RegExp(re.source, re.flags.replace(f, "") + f)
}
function regexp_minus(re, f) {
  return RegExp(re.source, re.flags.replace(f, ""))
}
// Core
function cut(...args) {
  if (args.length === 1) return wrap(...args)
  if (args[0] === "mode") return mode(...args)
  if (args[0] === "shortcut") return shortcut(...args)
  return fn(...args)
  function wrap(x) {
    const cname = x.constructor.name
    return new Proxy(x, {
      get(target, prop, receiver) {
        if (x.hasOwnProperty(prop)) return x[prop]
        const f = cut[cname][prop]
        if (f) return (...args) => f(x, ...args)
      },
    })
  }
  function mode(_, mode) {
    cut.mode = mode
    Object.entries(cut.constructors).forEach(([cname, constructor]) => {
      Object.entries(cut[cname]).forEach(([fname, f]) => {
        fn(constructor, fname, f)
      })
    })
  }
  function shortcut(_, key, value) {
    if (key instanceof Array) return key.map((n) => shortcut(_, n, value))
    cut.shortcuts[key] = value
    mode(_, cut.mode)
  }
  function fn(constructor, key, value) {
    if (key.startsWith("_")) return
    cut.constructors[constructor.name] = constructor
    cut[constructor.name] = cut[constructor.name] || {}
    if (constructor.prototype[key] && !constructor.prototype[key]?.toString()?.includes("[native code]") && !cut[constructor.name]["_" + key]) delete constructor.prototype[key]
    if (!value) {
      if (cut[constructor.name]["_" + key]) {
        constructor.prototype[key] = cut[constructor.name]["_" + key]
        delete cut[constructor.name]["_" + key]
      }
      return delete cut[constructor.name][key]
    }
    if (value.fn) value = value.fn
    if (value === "native" && constructor[key]) value = constructor[key]
    if (value === "native" && constructor.prototype[key]) {
      cut[constructor.name]["_" + key] = constructor.prototype[key]
      value = (x, ...args) => cut[constructor.name]["_" + key].call(x, ...args)
    }
    const shortcut = cut.shortcuts.hasOwnProperty(key) && cut.shortcuts[key]
    const fn = function_decorate(value, shortcut)
    cut[constructor.name][key] = fn
    cut[key] = (...args) => {
      if (value?.toString()?.includes("[native code]") || !cut[args[0]?.constructor.name]?.[key]) return cut[constructor.name][key](...args)
      return cut[args[0].constructor.name][key](...args)
    }
    if (cut.mode?.includes("window")) {
      window[key] = cut[key]
    }
    if (cut.mode?.includes("prototype")) {
      try {
        const f = { [key]: function() { return fn(this, ...arguments) } } // prettier-ignore
        Object.defineProperty(constructor.prototype, key, {
          writable: true,
          configurable: true,
          value: f[key],
        })
      } catch (e) {
        console.error(e)
      }
    }
  }
}
cut.constructors = {}
cut.shortcuts = {}
cut(Object, "keys", "native")
cut(Object, "values", "native")
cut(Object, "entries", "native")
cut(Object, "fromEntries", "native")
cut(Object, "map", object_map)
cut(Object, "reduce", object_reduce)
cut(Object, "filter", object_filter)
cut(Object, "find", object_find)
cut(Object, "findIndex", object_findIndex)
cut(Object, "is", object_is)
cut(Object, "equal", object_equal)
cut(Object, "access", object_access)
cut(Object, "traverse", object_traverse)
cut(Array, "map", "native")
cut(Array, "reduce", "native")
cut(Array, "filter", "native")
cut(Array, "find", "native")
cut(Array, "findIndex", "native")
cut(Array, "sort", "native")
cut(Array, "reverse", "native")
cut(Array, "group", array_group)
cut(Array, "unique", array_unique)
cut(Array, "min", array_min)
cut(Array, "max", array_max)
cut(Array, "sum", array_sum)
cut(Array, "mean", array_mean)
cut(Array, "median", array_median)
cut(Function, "decorate", function_decorate)
cut(Function, "promisify", function_promisify)
cut(Function, "partial", function_partial)
cut(Function, "memoize", function_memoize)
cut(Function, "every", function_every)
cut(Function, "wait", function_wait)
cut(Function, "debounce", function_debounce)
cut(Function, "throttle", function_throttle)
cut(String, "lower", string_lower)
cut(String, "upper", string_upper)
cut(String, "capitalize", string_capitalize)
cut(String, "words", string_words)
cut(String, "format", string_format)
cut(Number, "duration", number_duration)
cut(Number, "format", number_format)
Object.getOwnPropertyNames(Math)
  .filter((k) => typeof Math[k] === "function")
  .forEach((k) => cut(Number, k, Math[k]))
cut(Date, "relative", date_relative)
cut(Date, "getWeek", date_getWeek)
cut(Date, "getQuarter", date_getQuarter)
cut(Date, "getLastDate", date_getLastDate)
cut(Date, "getTimezone", date_getTimezone)
cut(Date, "format", date_format)
cut(Date, "modify", date_modify)
cut(Date, "plus", date_plus)
cut(Date, "minus", date_minus)
cut(Date, "start", date_start)
cut(Date, "end", date_end)
cut(RegExp, "escape", regexp_escape)
cut(RegExp, "plus", regexp_plus)
cut(RegExp, "minus", regexp_minus)
// cut("shortcut", ["relative", "getWeek", "getQuarter", "getLastDate", "getTimezone", "format", "modify", "plus", "minus", "start", "end"], {
//   before(args) {
//     if (typeof args[0] === "string") args[0] = new Date(args[0].length <= 10 ? args[0] + "T00:00:00" : args[0])
//     return args
//   },
// })
cut("shortcut", "map", {
  before(args) {
    const f = (fn) => {
      if (fn == null) return (x) => x
      if (typeof fn === "function") return fn
      if (fn instanceof Array) return (x) => fn.map((b) => object_access(x, b))
      return (x) => object_access(x, fn)
    }
    args[1] = f(args[1])
    return args
  },
})
cut("shortcut", ["filter", "find", "findIndex"], {
  before(args) {
    const f = (fn) => {
      if (fn == null) return (x) => x
      if (typeof fn === "function") return fn
      if (fn instanceof RegExp) return (x) => fn.test(x)
      if (fn instanceof Array) return (x) => fn.some((v) => f(v)(x))
      if (fn instanceof Object) return (x) => Object.keys(fn).every((k) => f(fn[k])(x[k]))
      return (x) => object_equal(x, fn) || object_access(x, fn)
    }
    args[1] = f(args[1])
    return args
  },
})
cut("shortcut", "sort", {
  before(args) {
    function defaultSort(a, b) {
      if (typeof a !== typeof b) return typeof a > typeof b ? 1 : -1
      if (a == null || a instanceof Object) return 0
      return a === b ? 0 : a > b ? 1 : -1
    }
    function directedSort(p, desc = /^-/.test(p)) {
      p = ("" + p).replace(/^[+-]/, "")
      return (a, b) => defaultSort(object_access(a, p), object_access(b, p)) * +(!desc || -1)
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
      if (typeof fn === "function" && fn.length === 1) return (x, y) => defaultSort(fn(x), fn(y))
      if (typeof fn === "function") return fn
      if (typeof fn === "string" && typeof args[0][0] === "string") return Intl.Collator(fn, { numeric: true, ...args[2] }).compare
      return directedSort(fn)
    }
    args[0] = args[0].slice()
    args[1] = f(args[1])
    return args
  },
})
cut("shortcut", "reverse", {
  before(args) {
    args[0] = args[0].slice()
    return args
  },
})
cut("shortcut", "group", {
  before(args) {
    args[1] = [].concat(args[1])
    return args
  },
})
cut("shortcut", "format", {
  after(v) {
    if (/(Invalid Date|NaN|null|undefined)/.test(v)) return "-"
    return v
  },
})
cut("shortcut", ["sum", "min", "max", "mean", "median"], (fn, arr, ...args) => {
  if (args[0]) return fn(cut.Array.map(arr, args[0]))
  return fn(arr)
})
export default cut
export const map = cut.map
export const reduce = cut.reduce
export const filter = cut.filter
export const find = cut.find
export const findIndex = cut.findIndex
export const sort = cut.sort
export const reverse = cut.reverse
export const group = cut.group
export const unique = cut.unique
export const min = cut.min
export const max = cut.max
export const sum = cut.sum
export const mean = cut.mean
export const median = cut.median
export const decorate = cut.decorate
export const promisify = cut.promisify
export const partial = cut.partial
export const memoize = cut.memoize
export const every = cut.every
export const wait = cut.wait
export const debounce = cut.debounce
export const throttle = cut.throttle
export const lower = cut.lower
export const upper = cut.upper
export const capitalize = cut.capitalize
export const words = cut.words
export const format = cut.format
export const duration = cut.duration
export const modify = cut.modify
export const plus = cut.plus
export const minus = cut.minus
export const start = cut.start
export const end = cut.end
export const escape = cut.escape
