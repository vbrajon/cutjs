// Generic
function type(a) {
  if (Number.isNaN(a)) return "NaN"
  if (!a || !a.constructor) return Object.prototype.toString.call(a).slice(8, -1)
  return a.constructor.name
}
function is(a, b) {
  if (arguments.length === 1) return type(a)
  if (!b) return a === b || isNaN(a) === isNaN(b)
  return a?.constructor === b || b?.constructor === a
}
function equal(a, b) {
  if (a === b) return true
  if (a == null || b == null) return false
  if (a.constructor !== b.constructor) return false
  if (![Object, Array].includes(a.constructor)) return a.toString() === b.toString()
  if (Object.keys(a).length !== Object.keys(b).length) return false
  return Object.keys(a).every((k) => equal(a[k], b[k]))
}
function access(obj, path) {
  if (obj == null || path == null) return obj
  if (Object.hasOwn(obj, path)) return obj[path]
  if (typeof path === "string") return access(obj, access.dotpath(path))
  if (path instanceof Function) return path(obj)
  if (path instanceof Array) return path.reduce((a, p) => (a && a[p] != null ? a[p] : undefined), obj)
  if (path instanceof Object) return Object.entries(path).reduce((a, [k, v]) => ((a[k] = access(obj, v)), a), {})
}
access.dotpath = function_memoize((str) => str.split(/(?:\.|\[["']?([^\]"']*)["']?\])/).filter((x) => x))
function transform(obj, fn) {
  function inner(o, path) {
    if (!o || typeof o !== "object") return fn(o, path)
    const acc = Array.isArray(o) ? [] : {}
    for (const k in o) acc[k] = inner(o[k], path.concat(k))
    return acc
  }
  return inner(obj, [])
}
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
// NOTE: This will return the "key" of the object and not an "index" number
function object_findIndex(obj, fn) {
  return Object.keys(obj).find((k, i) => fn(obj[k], k, i, obj))
}
// Array
function array_group(arr, keys) {
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
function array_unique(arr) {
  return [...new Set(arr)]
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
function function_decorate(fn, wrapper) {
  if (!wrapper || fn.wrapper === wrapper) return fn
  function decorated(...args) {
    return decorated.wrapper(decorated.fn, ...args)
  }
  decorated.fn = fn
  decorated.wrapper = wrapper
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
    if (!Object.hasOwn(memoized.cache, key)) memoized.cache[key] = fn(...args)
    return memoized.cache[key]
  }
  memoized.cache = {}
  return memoized
}
function function_every(fn, ms = 0, repeat = Infinity, immediate = true) {
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
function function_wait(fn, ms) {
  return function_every(fn, ms, 1, false)
}
function function_debounce(fn, ms = 0) {
  return function debounced(...args) {
    clearTimeout(fn.id)
    fn.id = setTimeout(() => fn(...args), ms)
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
function string_words(str) {
  return str
    .replace(/[^\p{L}\d]/gu, " ")
    .replace(/(\p{Ll})(\p{Lu})/gu, "$1 $2")
    .replace(/(\p{L})(\d)/gu, "$1 $2")
    .replace(/(\d)(\p{L})/gu, "$1 $2")
    .split(" ")
    .filter((x) => x)
}
function string_format(str, ...args) {
  if (!args.length) args[0] = "title"
  if (["-", "dash"].includes(args[0])) args[0] = "kebab"
  if (["_", "underscore"].includes(args[0])) args[0] = "snake"
  if (["title", "pascal", "camel", "kebab", "snake"].includes(args[0])) {
    let words = string_words(str).map((v) => v.toLowerCase())
    if (args[0] === "camel") return string_format(str, "pascal").replace(/./, (c) => c.toLowerCase())
    if (["title", "pascal"].includes(args[0])) words = words.map((v) => v.replace(/./, (c) => c.toUpperCase()))
    const sep = { kebab: "-", snake: "_", pascal: "" }[args[0]] ?? " "
    return words.join(sep)
  }
  let i = 0
  let fn = (m) => access(args, m)
  if (typeof args[0] === "object") fn = (m) => access(args[0], m)
  if (typeof args[0] === "function") fn = args.shift()
  return str.replace(/\{[^{}]*\}/g, (m) => String(fn(m.slice(1, -1) || i, i++)).replace(/^(null|undefined)$/, ""))
}
// Number
function number_duration(num) {
  if (!num) return ""
  const units = DATE.slice().reverse()
  const [k, v] = units.find(([k, v]) => v && v <= Math.abs(num) * 1.1)
  return `${Math.round(+num / +v)} ${k}${Math.abs(Math.round(+num / +v)) > 1 ? "s" : ""}`
}
const CURRENCY = Intl.supportedValuesOf("currency").reduce((acc, k) => ((acc[new Intl.NumberFormat("en", { style: "currency", currency: k }).format(0).split(/\s?0/)[0]] = acc[k] = k), acc), {})
function number_format(num, str = "", options = { locale: "en" }) {
  if (typeof num === "bigint") num = Number(num)
  if (typeof str === "number") return num.toExponential(str === 0 ? 0 : str - 1).replace(/([+-\d.]+)e([+-\d]+)/, (m, n, e) => +`${n}e${e - Math.floor(e / 3) * 3}` + (["mµnpfazyrq", "kMGTPEZYRQ"][+(e > 0)].split("")[Math.abs(Math.floor(e / 3)) - 1] || ""))
  str = str.replace(/[+]/g, () => ((options.signDisplay = "always"), "")) // exceptZero
  str = str.replace(/[%]/g, () => ((options.style = "percent"), ""))
  str = str.replace(/[e]\+?0?0?$/gi, () => ((options.notation = "scientific"), ""))
  str = str.replace(RegExp(`(${Object.keys(CURRENCY).join("|").replace(/\$/g, "\\$")})`), (m) => ((options.style = "currency"), (options.currency = CURRENCY[m]), ""))
  str = str.replace(/[a-z]{2,3}(-[a-z]{2,4})?(-[a-z0-9]{2,3})?/i, (m) => (Intl.NumberFormat.supportedLocalesOf(m).length ? ((options.locale = m), "") : m))
  str = str.replace(/\s/g, "")
  const separators = str.match(/[^0#]/g)
  const [thousandPart, decimalPart = ""] = separators ? str.split(separators.at(-1)) : ["", str]
  options.minimumIntegerDigits = thousandPart.match(/0/g)?.length
  options.minimumFractionDigits = str === "." ? 0 : decimalPart.match(/0/g)?.length
  options.maximumFractionDigits = str === "." ? 0 : decimalPart.match(/[0#]/g)?.length
  return new Intl.NumberFormat(options.locale, options).format(num) // .replace(/[,.]/g, (m) => (m === "," ? separators[0] : separators.at(-1)))
}
// Date: unit, ms, letter, fn, zeros
const DATE = [
  ["millisecond", 1, "S", "Milliseconds", 3],
  ["second", 1000, "s", "Seconds"],
  ["minute", 1000 * 60, "m", "Minutes"],
  ["hour", 1000 * 60 * 60, "h", "Hours"],
  ["day", 1000 * 60 * 60 * 24, "D", "Date"],
  ["week", 1000 * 60 * 60 * 24 * 7, "W", "Week"],
  ["month", 1000 * 60 * 60 * 24 * 30, "M", "Month"],
  ["quarter", 1000 * 60 * 60 * 24 * 30 * 3, "Q", "Quarter"],
  ["year", 1000 * 60 * 60 * 24 * 365, "Y", "FullYear", 4],
  ["timezone", null, "Z", "Timezone"],
]
DATE.forEach(([k, v]) => (DATE[k.toUpperCase()] = v))
const DAY = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
const MONTH = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
const NUMBER = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 }
const NUMBER_REGEX = /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:-?(one|two|three|four|five|six|seven|eight|nine))?\b/gi
function date_parse(from, str) {
  if (/now/i.test(str) && !/from\s+now/.test(str)) return from
  str = str.replace(/today/i, () => ((from = date_start(from, "day")), ""))
  str = str.replace(/tomorrow/i, "next day").replace(/yesterday/i, "last day")
  str = str.replace(NUMBER_REGEX, (match, tens, ones) => NUMBER[match.toLowerCase()] || NUMBER[tens.toLowerCase()] + (ones ? NUMBER[ones.toLowerCase()] : 0))
  str = str.replace(RegExp(`(${MONTH.join("|")})`, "i"), (m) => ((from = date_plus(date_start(from, "year"), { months: MONTH.indexOf(m.toLowerCase()) - (/last/.test(str) ? 12 : 0) })), ""))
  str = str.replace(RegExp(`(${DAY.join("|")})`, "i"), (m) => ((from = date_plus(date_start(from, "week"), { days: 1 + DAY.indexOf(m.toLowerCase()) - (/last/.test(str) ? 7 : 0) })), ""))
  str = str.replace(/(\d+)(st|nd|rd|th)/i, (_, num) => ((from = date_plus(date_start(from, "day"), { days: num - 1 })), ""))
  str = str.replace(/(\d+):?(\d+)?:?(\d+)?(am|pm)?/i, (_, hours = 0, minutes = 0, seconds = 0, ampm) => ((hours && minutes) || ampm ? ((from = date_plus(date_start(from, "day"), { hours: +hours + (ampm === "pm" ? 12 : 0), minutes, seconds })), "") : _))
  return date_modify(from, str, /(last|ago)/.test(str) ? "-" : "+")
}
function date_relative(from, to = new Date()) {
  return number_duration(+from - +to).replace(/^-?(.+)/, (m, d) => d + (m[0] === "-" ? " ago" : " from now"))
}
function date_getWeek(date) {
  const soy = new Date(date.getFullYear(), 0, 1)
  const doy = Math.floor((+date - +soy) / DATE.DAY) + 1
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
  return `${offset > 0 ? "-" : "+"}${`0${~~Math.abs(offset / 60)}`.slice(-2)}:${`0${Math.abs(offset % 60)}`.slice(-2)}`
}
function date_setTimezone(date, timezone = "+00:00") {
  const offset = +timezone.slice(0, 3) * 60 + +timezone.slice(4)
  return new Date(+date + (offset + date.getTimezoneOffset()) * 60 * 1000)
}
function date_format(date, format = "YYYY-MM-DDThh:mm:ssZ", locale = "en") {
  if (isNaN(date.getTime())) return "-"
  const parts = format.split(",").map((v) => v.trim())
  if (parts.some((v) => ["full", "long", "medium", "short"].includes(v))) return date.toLocaleString(locale, { dateStyle: parts[0] || undefined, timeStyle: parts[1] })
  if (parts.some((v) => ["year", "month", "weekday", "day", "hour", "minute", "second"].includes(v))) {
    const options = {}
    if (parts.includes("year")) options.year = "numeric"
    if (parts.includes("month")) options.month = "long"
    if (parts.includes("weekday")) options.weekday = "long"
    if (parts.includes("day")) options.day = "numeric"
    if (parts.includes("hour")) options.hour = "2-digit"
    if (parts.includes("minute")) options.minute = "2-digit"
    if (parts.includes("second")) options.second = "2-digit"
    return date.toLocaleString(locale, options)
  }
  return DATE.reduce((str, [unit, ms, letter, fn, zeros = 2]) => {
    return str.replace(RegExp(`${letter}+`, "g"), (m) => {
      if (letter === "Z") return date_getTimezone(date)
      if (letter === "W") return `W${date_getWeek(date)}`
      if (letter === "Q") return `Q${date_getQuarter(date)}`
      let int = date[`get${fn}`]()
      if (letter === "M") int = int + 1
      if (m.length > zeros) return ("0".repeat(zeros) + int).slice(-zeros) + letter
      if (m.length < `${int}`.length) return int
      return ("0".repeat(zeros) + int).slice(-m.length)
    })
  }, format)
}
function date_modify(date, options, sign) {
  if (!options || !sign) return date
  if (typeof options === "string") {
    options = { str: options }
    options.str.replace(/([+-.\d]*)\s*(millisecond|second|minute|hour|day|week|month|quarter|year)/gi, (m, n, u) => (options[`${u}s`] = +n || 1 - +(n === "0")))
  }
  if (options.weeks) options.days = options.days || 0 + options.weeks * 7
  if (options.quarters) options.months = options.months || 0 + options.quarters * 3
  options = Object.fromEntries(
    Object.entries(options)
      .filter(([k, v]) => ["milliseconds", "seconds", "minutes", "hours", "days", "months", "years"].includes(k))
      .map(([k, v]) => [k, Math.round(+v)])
  )
  const d = new Date(date)
  const units = DATE.filter((unit) => ["millisecond", "second", "minute", "hour", "day", "month", "year"].includes(unit[0]))
  const fn = {
    "+": (unit, n) => d[`set${unit[3]}`](d[`get${unit[3]}`]() + n),
    "-": (unit, n) => d[`set${unit[3]}`](d[`get${unit[3]}`]() - n),
    "<"(unit) {
      const index = units.findIndex((u) => u === unit)
      return units.slice(0, index).map((unit) => d[`set${unit[3]}`](unit[3] === "Date" ? 1 : 0))
    },
    ">"(unit) {
      const index = units.findIndex((u) => u === unit)
      units
        .slice(0, index)
        .reverse()
        .map((unit) => d[`set${unit[3]}`]({ Month: 11, Date: date_getLastDate(d), Hours: 23, Minutes: 59, Seconds: 59, Milliseconds: 999 }[unit[3]]))
    },
  }[sign]
  units.forEach((unit) => options[`${unit[0]}s`] && fn(unit, options[`${unit[0]}s`]))
  if (["-", "+"].includes(sign) && date.getDate() !== d.getDate() && ["year", "month"].some((k) => options[`${k}s`]) && !["day", "hour", "minute", "second", "millisecond"].some((k) => options[`${k}s`])) d.setDate(0)
  if (["-", "+"].includes(sign) && date.getTimezoneOffset() !== d.getTimezoneOffset()) d.setTime(+d + (date.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000)
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
  return new RegExp(re.source.replace(/([\\/'*+?|()[\]{}.^$-])/g, "\\$1"), re.flags)
}
function regexp_replace(re, a, b) {
  return new RegExp(re.source.replace(a, b), re.flags)
}
function regexp_plus(re, flags) {
  return new RegExp(re.source, [...new Set(re.flags + flags)].sort().join(""))
}
function regexp_minus(re, flags) {
  return new RegExp(re.source, [...new Set(re.flags.replace(new RegExp(`[${flags}]`, "g"), ""))].sort().join(""))
}
// Core
function cut(...args) {
  init()
  if (args.length === 1) return wrap(...args)
  if (args[0] === "mode") return mode(...args)
  if (args[0] === "shortcut") return shortcut(...args)
  return fn(...args)
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
    if (value === "native" && constructor[key]) value = constructor[key]
    if (value === "native" && constructor.prototype[key]) {
      const native = constructor.prototype[key]
      value = (x, ...args) => native.call(x, ...args)
      value.native = native
    }
    const shortcut = Object.hasOwn(cut.shortcuts, key) && cut.shortcuts[key]
    const fn = function_decorate(value, shortcut)
    cut.constructors[constructor.name] = constructor
    cut[constructor.name] = cut[constructor.name] || {}
    cut[constructor.name][key] = fn
    cut[key] = (...args) => {
      if (value?.toString()?.includes("[native code]")) return cut[constructor.name][key](...args)
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
  function init() {
    if (cut.constructors) return
    cut.constructors = {}
    cut.shortcuts = {}
    // cut("shortcut", ["relative", "getWeek", "getQuarter", "getLastDate", "getTimezone", "format", "modify", "plus", "minus", "start", "end"], (fn, ...args) => {
    //   if (typeof args[0] === "string") args[0] = new Date(args[0].length <= 10 ? args[0] + "T00:00:00" : args[0])
    //   return fn(...args)
    // })
    cut("shortcut", "map", (fn, ...args) => {
      const f = (fn) => {
        if (fn == null) return (x) => x
        if (typeof fn === "function") return fn
        if (fn instanceof Array) return (x) => fn.map((b) => access(x, b))
        return (x) => access(x, fn)
      }
      args[1] = f(args[1])
      return fn(...args)
    })
    cut("shortcut", ["filter", "find", "findIndex"], (fn, ...args) => {
      const f = (fn) => {
        if (fn == null) return (x) => x
        if (typeof fn === "function") return fn
        if (fn instanceof RegExp) return (x) => fn.test(x)
        if (fn instanceof Array) return (x) => fn.some((v) => f(v)(x))
        if (fn instanceof Object) return (x) => Object.keys(fn).every((k) => f(fn[k])(x[k]))
        return (x) => equal(x, fn) || access(x, fn)
      }
      args[1] = f(args[1])
      return fn(...args)
    })
    cut("shortcut", "sort", (fn, ...args) => {
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
    })
    cut("shortcut", "group", (fn, ...args) => {
      args[1] = [].concat(args[1])
      return fn(...args)
    })
    cut("shortcut", "format", (fn, ...args) => {
      const v = fn(...args)
      return /^(Invalid Date|NaN|null|undefined)/.test(v) ? "-" : v
    })
    cut("shortcut", ["sum", "min", "max", "mean", "median"], (fn, ...args) => {
      if (args[1]) return fn(cut.Array.map(...args))
      return fn(...args)
    })
    cut(null, "is", is)
    cut(null, "equal", equal)
    cut(null, "access", access)
    cut(null, "transform", transform)
    cut(Object, "keys", "native")
    cut(Object, "values", "native")
    cut(Object, "entries", "native")
    cut(Object, "fromEntries", "native")
    cut(Object, "map", object_map) // TODO: try to make this shortcut only and/or for all "Iterable"
    cut(Object, "reduce", object_reduce)
    cut(Object, "filter", object_filter)
    cut(Object, "find", object_find)
    cut(Object, "findIndex", object_findIndex)
    cut(Array, "map", "native")
    cut(Array, "reduce", "native")
    cut(Array, "filter", "native")
    cut(Array, "find", "native")
    cut(Array, "findIndex", "native")
    cut(Array, "sort", "native")
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
    // Object.getOwnPropertyNames(Math)
    //   .filter((k) => typeof Math[k] === "function")
    //   .forEach((k) => cut(Number, k, Math[k]))
    cut(Date, "relative", date_relative)
    cut(Date, "getWeek", date_getWeek)
    cut(Date, "getQuarter", date_getQuarter)
    cut(Date, "getLastDate", date_getLastDate)
    cut(Date, "getTimezone", date_getTimezone)
    cut(Date, "setTimezone", date_setTimezone)
    cut(Date, "parse", date_parse)
    cut(Date, "format", date_format)
    cut(Date, "modify", date_modify)
    cut(Date, "plus", date_plus)
    cut(Date, "minus", date_minus)
    cut(Date, "start", date_start)
    cut(Date, "end", date_end)
    cut(RegExp, "escape", regexp_escape)
    cut(RegExp, "replace", regexp_replace)
    cut(RegExp, "plus", regexp_plus)
    cut(RegExp, "minus", regexp_minus)
  }
}
cut("mode", import.meta.url.split("?")[1] || "default")
export default cut
const { keys, values, entries, fromEntries, map, reduce, filter, find, findIndex, sort, group, unique, min, max, sum, mean, median, decorate, promisify, partial, memoize, every, wait, debounce, throttle, lower, upper, capitalize, words, format, duration, relative, getWeek, getQuarter, getLastDate, getTimezone, setTimezone, parse, modify, plus, minus, start, end, escape, replace } = cut
export { is, equal, access, transform, keys, values, entries, fromEntries, map, reduce, filter, find, findIndex, sort, group, unique, min, max, sum, mean, median, decorate, promisify, partial, memoize, every, wait, debounce, throttle, lower, upper, capitalize, words, format, duration, relative, getWeek, getQuarter, getLastDate, getTimezone, setTimezone, parse, modify, plus, minus, start, end, escape, replace }
