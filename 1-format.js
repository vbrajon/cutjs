import { CURRENCIES, TIMES, Date_getTimezone, Date_getWeek, Date_getQuarter, access } from "./0-base.js"
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
export function Number_format(num, str = "", options = { locale: "en" }) {
  if (typeof num === "bigint") num = Number(num)
  if (isNaN(num)) return "-"
  if (typeof str === "number") return num.toExponential(str === 0 ? 0 : str - 1).replace(/([+-\d.]+)e([+-\d]+)/, (m, n, e) => +`${n}e${e - Math.floor(e / 3) * 3}` + (["mµnpfazyrq", "kMGTPEZYRQ"][+(e > 0)].split("")[Math.abs(Math.floor(e / 3)) - 1] || ""))
  str = str.replace(/[e](\+?)(0*)$/gi, (m, p, z) => (((options.notation = "scientific"), (options.notationPlus = p), (options.notationZero = z?.length ?? 0)), ""))
  str = str.replace(/[+]/g, () => ((options.signDisplay = "always"), "")) // exceptZero
  str = str.replace(/[%]/g, () => ((options.style = "percent"), ""))
  str = str.replace(RegExp(`(${Object.keys(CURRENCIES).join("|").replace(/\$/g, "\\$")})`), (m) => ((options.style = "currency"), (options.currency = CURRENCIES[m]), ""))
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
  return TIMES.reduce((str, [unit, ms, letter, fn, zeros = 2]) => {
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
