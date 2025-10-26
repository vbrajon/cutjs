import { TIMES, DAYS, MONTHS, NUMBER_REGEX, NUMBER_WORDS, Date_getLastDate } from "./0-base.js"
export function Number_duration(num) {
  if (!num) return ""
  const units = TIMES.slice().reverse()
  const [k, v] = units.find(([k, v]) => v && v <= Math.abs(num) * 1.1)
  return `${Math.round(+num / +v)} ${k}${Math.abs(Math.round(+num / +v)) > 1 ? "s" : ""}`
}
export function Date_relative(from, to = new Date()) {
  return Number_duration(+from - +to).replace(/^-?(.+)/, (m, d) => d + (m[0] === "-" ? " ago" : " from now"))
}
export function Date_parse(from, str) {
  if (/now/i.test(str) && !/from\s+now/.test(str)) return from
  str = str.replace(/today/i, () => ((from = Date_start(from, "day")), ""))
  str = str.replace(/tomorrow/i, "next day").replace(/yesterday/i, "last day")
  str = str.replace(NUMBER_REGEX, (match, tens, ones) => NUMBER_WORDS[match.toLowerCase()] || NUMBER_WORDS[tens.toLowerCase()] + (ones ? NUMBER_WORDS[ones.toLowerCase()] : 0))
  str = str.replace(RegExp(`(${MONTHS.join("|")})`, "i"), (m) => ((from = Date_plus(Date_start(from, "year"), { months: MONTHS.indexOf(m.toLowerCase()) - (/last/.test(str) ? 12 : 0) })), ""))
  str = str.replace(RegExp(`(${DAYS.join("|")})`, "i"), (m) => ((from = Date_plus(Date_start(from, "week"), { days: 1 + DAYS.indexOf(m.toLowerCase()) - (/last/.test(str) ? 7 : 0) })), ""))
  str = str.replace(/(\d+)(st|nd|rd|th)/i, (_, num) => ((from = Date_plus(Date_start(from, "day"), { days: num - 1 })), ""))
  str = str.replace(/(\d+):?(\d+)?:?(\d+)?(am|pm)?/i, (_, hours = 0, minutes = 0, seconds = 0, ampm) => ((hours && minutes) || ampm ? ((from = Date_plus(Date_start(from, "day"), { hours: +hours + (ampm === "pm" ? 12 : 0), minutes, seconds })), "") : _))
  return Date_modify(from, str, /(last|ago)/.test(str) ? "-" : "+")
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
  const units = TIMES.filter((unit) => ["millisecond", "second", "minute", "hour", "day", "month", "year"].includes(unit[0]))
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
