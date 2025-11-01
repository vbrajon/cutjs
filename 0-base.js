export const CURRENCIES = Intl.supportedValuesOf("currency").reduce((acc, k) => ((acc[new Intl.NumberFormat("en", { style: "currency", currency: k }).format(0).split(/\s?0/)[0]] = acc[k] = k), acc), {})
export const TIMES = [
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
TIMES.forEach(([k, v]) => (TIMES[k.toUpperCase()] = v))
export const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
export const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]
export const NUMBER_REGEX = /\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)(?:-?(one|two|three|four|five|six|seven|eight|nine))?\b/gi
export const NUMBER_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 }
export const { compare } = new Intl.Collator(undefined, { numeric: true })
export function access(obj, path) {
  if (obj == null || path == null) return obj
  if (typeof path !== "object" && Object.hasOwn(obj, path)) return obj[path]
  if (typeof path === "string") return access(obj, access.dotpath(path))
  if (path instanceof Function) return path(obj)
  if (path instanceof Array) return path.reduce((a, p) => (a && typeof p !== "object" && a[p] != null ? a[p] : undefined), obj)
  if (path instanceof Object) return Object.entries(path).reduce((a, [k, v]) => ((a[k] = access(obj, v)), a), {})
}
export function equal(a, b) {
  if (a === b) return true
  if (a == null || b == null) return false
  if (a.constructor !== b.constructor) return false
  if ({ Array: 1, Object: 1 }[Object.prototype.toString.call(a).slice(8, -1)]) {
    if (Object.keys(a).length !== Object.keys(b).length) return false
    return Object.keys(a).every((k) => (k || Object.hasOwn(b, k)) && equal(a[k], b[k]))
  }
  return a.toString() === b.toString()
}
export function is(a, b) {
  if (arguments.length === 1) {
    if (Number.isNaN(a)) return "NaN"
    if (!a || !a.constructor) return Object.prototype.toString.call(a).slice(8, -1)
    if (a[Symbol.iterator] || a[Symbol.asyncIterator]) return "Iterator"
    return a.constructor.name
  }
  if (!b) return a === b || is(a) === is(b)
  return a?.constructor === b || b?.constructor === a
}
access.dotpath = Function_memoize((str) => str.split(/(?:\.|\[["']?([^\]"']*)["']?\])/).filter((x) => x))
export function Function_decorate(fn, wrapper) {
  if (!wrapper || fn.wrapper === wrapper) return fn
  function decorated(...args) {
    return decorated.wrapper(decorated.fn, ...args)
  }
  decorated.fn = fn
  decorated.wrapper = wrapper
  return decorated
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
export function Date_getWeek(date) {
  const soy = new Date(date.getFullYear(), 0, 1)
  const doy = Math.floor((+date - +soy) / TIMES.DAY) + 1
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
