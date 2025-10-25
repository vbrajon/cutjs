// Generic
export function is(a, b) {
  if (arguments.length === 1) {
    if (Number.isNaN(a)) return "NaN"
    if (!a || !a.constructor) return Object.prototype.toString.call(a).slice(8, -1)
    return a.constructor.name
  }
  if (!b) return a === b || isNaN(a) === isNaN(b)
  return a?.constructor === b || b?.constructor === a
}
export function equal(a, b) {
  if (a === b) return true
  if (a == null || b == null) return false
  if (a.constructor !== b.constructor) return false
  if (![Object, Array].includes(a.constructor)) return a.toString() === b.toString()
  if (Object.keys(a).length !== Object.keys(b).length) return false
  return Object.keys(a).every((k) => equal(a[k], b[k]))
}
export function access(obj, path) {
  if (obj == null || path == null) return obj
  if (Object.hasOwn(obj, path)) return obj[path]
  if (typeof path === "string") return access(obj, access.dotpath(path))
  if (path instanceof Function) return path(obj)
  if (path instanceof Array) return path.reduce((a, p) => (a && a[p] != null ? a[p] : undefined), obj)
  if (path instanceof Object) return Object.entries(path).reduce((a, [k, v]) => ((a[k] = access(obj, v)), a), {})
}
access.dotpath = Function_memoize((str) => str.split(/(?:\.|\[["']?([^\]"']*)["']?\])/).filter((x) => x))
export function transform(obj, fn) {
  function inner(o, path) {
    if (!o || typeof o !== "object") return fn(o, path)
    const acc = Array.isArray(o) ? [] : {}
    for (const k in o) acc[k] = inner(o[k], path.concat(k))
    return acc
  }
  return inner(obj, [])
}
// Object
export const Object_keys = Object.keys
export const Object_values = Object.values
export const Object_entries = Object.entries
export const Object_fromEntries = Object.fromEntries
export function Object_map(obj, fn) {
  return Object.keys(obj).reduce((acc, k, i) => {
    acc[k] = fn(obj[k], k, i, obj)
    return acc
  }, {})
}
export function Object_reduce(obj, fn, base) {
  return Object.keys(obj).reduce((acc, k, i) => fn(acc, obj[k], k, i, obj), base)
}
export function Object_filter(obj, fn) {
  return Object.keys(obj).reduce((acc, k, i) => {
    if (fn(obj[k], k, i, obj)) acc[k] = obj[k]
    return acc
  }, {})
}
export function Object_find(obj, fn) {
  return obj[Object.keys(obj).find((k, i) => fn(obj[k], k, i, obj))]
}
// NOTE: This will return the "key" of the object and not an "index" number
export function Object_findIndex(obj, fn) {
  return Object.keys(obj).find((k, i) => fn(obj[k], k, i, obj))
}
// Array
export const Array_map = [].map
export const Array_reduce = [].reduce
export const Array_filter = [].filter
export const Array_find = [].find
export const Array_findIndex = [].findIndex
export const Array_sort = [].sort
export function Array_group(arr, keys) {
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
// Function
export function Function_decorate(fn, wrapper) {
  if (!wrapper || fn.wrapper === wrapper) return fn
  function decorated(...args) {
    return decorated.wrapper(decorated.fn, ...args)
  }
  decorated.fn = fn
  decorated.wrapper = wrapper
  return decorated
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
export function Function_memoize(fn, hash = JSON.stringify) {
  function memoized(...args) {
    const key = hash(args)
    if (!Object.hasOwn(memoized.cache, key)) memoized.cache[key] = fn(...args)
    return memoized.cache[key]
  }
  memoized.cache = {}
  return memoized
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
// String
export function String_words(str) {
  return str
    .replace(/[^\p{L}\d]/gu, " ")
    .replace(/(\p{Ll})(\p{Lu})/gu, "$1 $2")
    .replace(/(\p{L})(\d)/gu, "$1 $2")
    .replace(/(\d)(\p{L})/gu, "$1 $2")
    .split(" ")
    .filter((x) => x)
}
export function String_format(str, ...args) {
  if (!args.length) args[0] = "title"
  if (["lower", "lowercase"].includes(args[0])) return str.toLowerCase()
  if (["upper", "uppercase"].includes(args[0])) return str.toUpperCase()
  if (["cap", "capitalize"].includes(args[0])) return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  if (["-", "dash"].includes(args[0])) args[0] = "kebab"
  if (["_", "underscore"].includes(args[0])) args[0] = "snake"
  if (["title", "pascal", "camel", "kebab", "snake"].includes(args[0])) {
    let words = String_words(str).map((v) => v.toLowerCase())
    if (args[0] === "camel") return String_format(str, "pascal").replace(/./, (c) => c.toLowerCase())
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
export function Number_duration(num) {
  if (!num) return ""
  const units = DATE.slice().reverse()
  const [k, v] = units.find(([k, v]) => v && v <= Math.abs(num) * 1.1)
  return `${Math.round(+num / +v)} ${k}${Math.abs(Math.round(+num / +v)) > 1 ? "s" : ""}`
}
const CURRENCY = Intl.supportedValuesOf("currency").reduce((acc, k) => ((acc[new Intl.NumberFormat("en", { style: "currency", currency: k }).format(0).split(/\s?0/)[0]] = acc[k] = k), acc), {})
export function Number_format(num, str = "", options = { locale: "en" }) {
  if (typeof num === "bigint") num = Number(num)
  if (typeof str === "number") return num.toExponential(str === 0 ? 0 : str - 1).replace(/([+-\d.]+)e([+-\d]+)/, (m, n, e) => +`${n}e${e - Math.floor(e / 3) * 3}` + (["mµnpfazyrq", "kMGTPEZYRQ"][+(e > 0)].split("")[Math.abs(Math.floor(e / 3)) - 1] || ""))
  str = str.replace(/[e](\+?)(0*)$/gi, (m, p, z) => (((options.notation = "scientific"), (options.notationPlus = p), (options.notationZero = z?.length ?? 0)), ""))
  str = str.replace(/[+]/g, () => ((options.signDisplay = "always"), "")) // exceptZero
  str = str.replace(/[%]/g, () => ((options.style = "percent"), ""))
  str = str.replace(RegExp(`(${Object.keys(CURRENCY).join("|").replace(/\$/g, "\\$")})`), (m) => ((options.style = "currency"), (options.currency = CURRENCY[m]), ""))
  str = str.replace(/[a-z]{2,3}(-[a-z]{2,4})?(-[a-z0-9]{2,3})?/i, (m) => (Intl.NumberFormat.supportedLocalesOf(m).length ? ((options.locale = m), "") : m))
  str = str.replace(/\s/g, "")
  const separators = str.match(/[^0#]/g)
  const [thousandPart, decimalPart = ""] = separators ? str.split(separators.at(-1)) : ["", str]
  options.minimumIntegerDigits = thousandPart.match(/0/g)?.length
  options.minimumFractionDigits = str.endsWith(".") ? 0 : decimalPart.match(/0/g)?.length
  options.maximumFractionDigits = str.endsWith(".") ? 0 : decimalPart.match(/[0#]/g)?.length
  return new Intl.NumberFormat(options.locale, options).format(num).replace(/E(-?)(\d)$/i, (m, s, n) => `E${s || options.notationPlus}${`0`.repeat(Math.max(0, options.notationZero - n.length))}${n}`)
  // .replace(/[,.]/g, (m) => (m === "," ? separators[0] : separators.at(-1)))
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
export function Date_parse(from, str) {
  if (/now/i.test(str) && !/from\s+now/.test(str)) return from
  str = str.replace(/today/i, () => ((from = Date_start(from, "day")), ""))
  str = str.replace(/tomorrow/i, "next day").replace(/yesterday/i, "last day")
  str = str.replace(NUMBER_REGEX, (match, tens, ones) => NUMBER[match.toLowerCase()] || NUMBER[tens.toLowerCase()] + (ones ? NUMBER[ones.toLowerCase()] : 0))
  str = str.replace(RegExp(`(${MONTH.join("|")})`, "i"), (m) => ((from = Date_plus(Date_start(from, "year"), { months: MONTH.indexOf(m.toLowerCase()) - (/last/.test(str) ? 12 : 0) })), ""))
  str = str.replace(RegExp(`(${DAY.join("|")})`, "i"), (m) => ((from = Date_plus(Date_start(from, "week"), { days: 1 + DAY.indexOf(m.toLowerCase()) - (/last/.test(str) ? 7 : 0) })), ""))
  str = str.replace(/(\d+)(st|nd|rd|th)/i, (_, num) => ((from = Date_plus(Date_start(from, "day"), { days: num - 1 })), ""))
  str = str.replace(/(\d+):?(\d+)?:?(\d+)?(am|pm)?/i, (_, hours = 0, minutes = 0, seconds = 0, ampm) => ((hours && minutes) || ampm ? ((from = Date_plus(Date_start(from, "day"), { hours: +hours + (ampm === "pm" ? 12 : 0), minutes, seconds })), "") : _))
  return Date_modify(from, str, /(last|ago)/.test(str) ? "-" : "+")
}
export function Date_relative(from, to = new Date()) {
  return Number_duration(+from - +to).replace(/^-?(.+)/, (m, d) => d + (m[0] === "-" ? " ago" : " from now"))
}
export function Date_getWeek(date) {
  const soy = new Date(date.getFullYear(), 0, 1)
  const doy = Math.floor((+date - +soy) / DATE.DAY) + 1
  const dow = date.getDay() || 7
  return Math.floor((10 + doy - dow) / 7) || Date_getWeek(new Date(date.getFullYear(), 0, 0))
}
export function Date_getQuarter(date) {
  return Math.ceil((date.getMonth() + 1) / 3)
}
export function Date_getLastDate(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}
export function Date_getTimezone(date, offset = date.getTimezoneOffset()) {
  return `${offset > 0 ? "-" : "+"}${`0${~~Math.abs(offset / 60)}`.slice(-2)}:${`0${Math.abs(offset % 60)}`.slice(-2)}`
}
export function Date_setTimezone(date, timezone = "+00:00") {
  const offset = +timezone.slice(0, 3) * 60 + +timezone.slice(4)
  return new Date(+date + (offset + date.getTimezoneOffset()) * 60 * 1000)
}
export function Date_format(date, format, locale = "en") {
  if (!format) format = "YYYY-MM-DDThh:mm:ssZ"
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
      if (letter === "Z") return Date_getTimezone(date)
      if (letter === "W") return `W${Date_getWeek(date)}`
      if (letter === "Q") return `Q${Date_getQuarter(date)}`
      let int = date[`get${fn}`]()
      if (letter === "M") int = int + 1
      if (m.length > zeros) return ("0".repeat(zeros) + int).slice(-zeros) + letter
      if (m.length < `${int}`.length) return int
      return ("0".repeat(zeros) + int).slice(-m.length)
    })
  }, format)
}
export function Date_modify(date, options, sign) {
  if (!options || !sign) return date
  if (typeof options === "string") {
    options = { str: options }
    options.str.replace(/([+-.\d]*)\s*(millisecond|second|minute|hour|day|week|month|quarter|year)/gi, (m, n, u) => (options[`${u}s`] = +n || 1 - +(n === "0")))
  }
  if (options.weeks) options.days = options.days || 0 + options.weeks * 7
  if (options.quarters) options.months = options.months || 0 + options.quarters * 3
  Object.keys(options).forEach((k) => (options[k] = Math.round(+options[k]) || options[k]))
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
        .map((unit) => d[`set${unit[3]}`]({ Month: 11, Date: Date_getLastDate(d), Hours: 23, Minutes: 59, Seconds: 59, Milliseconds: 999 }[unit[3]]))
    },
  }[sign]
  units.forEach((unit) => options[`${unit[0]}s`] && fn(unit, options[`${unit[0]}s`]))
  if (["-", "+"].includes(sign) && date.getDate() !== d.getDate() && ["year", "month"].some((k) => options[`${k}s`]) && !["day", "hour", "minute", "second", "millisecond"].some((k) => options[`${k}s`])) d.setDate(0)
  if (["-", "+"].includes(sign) && date.getTimezoneOffset() !== d.getTimezoneOffset()) d.setTime(+d + (date.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000)
  return d
}
export function Date_plus(date, options) {
  return Date_modify(date, options, "+")
}
export function Date_minus(date, options) {
  return Date_modify(date, options, "-")
}
export function Date_start(date, options) {
  return Date_modify(date, options, "<")
}
export function Date_end(date, options) {
  return Date_modify(date, options, ">")
}
// RegExp
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
// Shortcut
export function shortcut_map(fn, ...args) {
  const f = (fn) => {
    if (fn == null) return (x) => x
    if (typeof fn === "function") return fn
    if (fn instanceof Array) return (x) => fn.map((b) => access(x, b))
    return (x) => access(x, fn)
  }
  args[1] = f(args[1])
  return fn(...args)
}
export function shortcut_filter_find_findIndex(fn, ...args) {
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
export function shortcut_group(fn, ...args) {
  args[1] = [].concat(args[1])
  return fn(...args)
}
export function shortcut_format(fn, ...args) {
  const v = fn(...args)
  return /^(Invalid Date|NaN|null|undefined)/.test(v) ? "-" : v
}
export function shortcut_sum_min_max_mean_median(fn, ...args) {
  if (args[1]) return fn(cut.Array.map(...args))
  return fn(...args)
}
