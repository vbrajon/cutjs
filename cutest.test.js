// TEST RUNNER
import { test, expect } from "bun:test"
process.env.TZ =
  process.env.TZ ||
  [
    "America/Santiago", // UTC-3
    "Atlantic/Azores", // UTC-1 with DST to UTC+0
    "Europe/Paris", // UTC+1 with DST to UTC+2
    "Asia/Karachi", // UTC+5
  ][Math.floor(Math.random() * 4)]
const { packages, tests } = await import("./cutest.js")

let name
let i = 0
// for (const file of files) {
//   const { packages, default: tests } = await import("./" + file)
for (const pkg of packages) {
  for (const version of pkg.versions) {
    const module = await pkg.import(version)
    for (const t of tests) {
      if (t instanceof Array) {
        i = name !== t[0] ? 1 : i + 1
        name = t[0].split(" - ")[0]
        const fn = module[name]
        if (!fn) continue // test.skip
        test(`${pkg.name} ${t[0]} #${i}`, async () => {
          const args = t.slice(1, -1)
          const result = await fn(...args)
          expect(result, stringify(t)).toEqual(t.at(-1))
        })
      } else {
        i = name !== t.name ? 1 : i + 1
        name = t.name.split(" - ")[0]
        const fn = module[name]
        if (!fn) continue // test.skip
        test(`${pkg.name} ${t.name} #${i}`, async () => {
          const result = await t.fn(module)
          expect(result, t.fn).toEqual(t.output)
        })
      }
    }
  }
}
function stringify(v) {
  if (Object.is(v, -0)) return "-0"
  if (v == null || typeof v === "number" || typeof v === "boolean") return String(v)
  if (typeof v === "bigint") return String(v) + "n"
  if (typeof v === "string") return JSON.stringify(v)
  if (v instanceof Date) return `new Date(${+v})`
  if (v instanceof RegExp) return v.toString()
  for (const constructor of [Array, BigInt, Boolean, Date, Error, Function, Number, Object, RegExp, String, Symbol]) {
    if (v === constructor) return `${constructor.name}`
  }
  for (const constructor of [ArrayBuffer, Date, Error, Map, Set, WeakMap, WeakSet]) {
    if (v instanceof constructor) return `new ${constructor.name}()`
    if (v === constructor) return `${constructor.name}`
  }
  const trim = code => code.split("\n").map((l, i, a) => i ? l.slice(Math.min(...a.slice(1).filter(l => l.trim()).map(l => l.match(/^\s*/)[0].length))) : l).join("\n") // prettier-ignore
  if (v instanceof Function) return trim(v.toString())
  if (v instanceof Array) return `[${v.map(stringify).join(",")}]`
  if (v[Symbol.iterator]) return "{ [Symbol.iterator]() {} }"
  if (v instanceof Object) return `{${Object.entries(v).map(([k, v]) => `${JSON.stringify(k)}:${stringify(v)}`).join(",")}}` // prettier-ignore
  return String(v)
}
// }

// PROPERTY TESTS
// import { test, expect } from "bun:test"
import fc from "fast-check"
import cut from "./cut.js"
import lodash from "lodash-es"

// fc.configureGlobal({ numRuns: 5000 })

const any = fc.anything({
  withBigInt: true,
  withBoxedValues: true,
  withDate: true,
  withMap: true,
  withNullPrototype: true,
  withObjectString: true,
  withSet: true,
  withTypedArray: true,
  withSparseArray: true,
  withUnicodeString: true,
})

// Throw only if the property fails
function assert(...args) {
  const fn = args.at(-1)
  const property = fc.property(...args.slice(0, -1), (...inner) => (fn(...inner), true))
  fc.assert(property)
}
// Throw if the property fails or returns falsy
function assertTrue(...args) {
  fc.assert(fc.property(...args))
}
function assertAsync(...args) {
  fc.assert(fc.asyncProperty(...args))
}
function assertThrows(...args) {
  const fn = args.at(-1)
  const property = fc.property(...args.slice(0, -1), (...inner) => {
    let threw = false
    try {
      fn(...inner)
    } catch (e) {
      threw = true
    }
    if (!threw) throw new Error("Did not throw")
  })
  fc.assert(property)
}

// --- access ---

test("access do not throw", () => {
  cut.access({}, { toString: null })
  cut.access({}, [{ toString: null }])
  assert(any, any, (a, b) => cut.access(a, b))
})

test("access with null/undefined/[] is identity", () => {
  const obj = fc.oneof(fc.record({ a: fc.integer() }), fc.array(fc.integer()), fc.string())
  assert(obj, (a) => {
    if (!cut.equal(cut.access(a, null), a)) throw new Error("access(a, null) !== a")
    if (!cut.equal(cut.access(a, undefined), a)) throw new Error("access(a, undefined) !== a")
    if (!cut.equal(cut.access(a, []), a)) throw new Error("access(a, []) !== a")
  })
})

// --- equal ---

test("equal is always true for clones", () => {
  assertTrue(fc.clone(any, 2), ([a, b]) => cut.equal(a, b) && cut.equal(b, a))
})

test("equal is similar to lodash.isEqual", () => {
  if (!cut.equal([{ __proto__: null }], [{ __proto__: null }])) throw "x"
  if (cut.equal({ __proto__: null }, {})) throw "x" // != lodash
  assert(any, any, (a, b) => {
    if (cut.equal(a, b) !== lodash.isEqual(a, b)) throw new Error("Not similar to lodash isEqual")
  })
})

test("equal is reflexive", () => {
  assertTrue(any, (a) => cut.equal(a, a))
})

test("equal is symmetric", () => {
  assert(any, any, (a, b) => {
    if (cut.equal(a, b) !== cut.equal(b, a)) throw new Error("equal(a, b) !== equal(b, a)")
  })
})

// --- is ---

test("is does not throw for any input", () => {
  cut.is(0n, null)
  cut.is({ __proto__: null }, null)
  cut.is(undefined, { __proto__: null })
  assert(any, any, (a, b) => {
    if ((cut.is(a) === cut.is(b)) !== cut.is(a, b)) throw new Error("(is(a) === is(b)) !== is(a, b)")
    if (cut.is(a, b) !== cut.is(b, a)) throw new Error("is(a, b) !== is(b, a)")
  })
})

test("is is always true for clones", () => {
  assertTrue(fc.clone(any, 2), ([a, b]) => cut.is(a) === cut.is(b))
})

test("is returns the correct type", () => {
  if (!cut.is(BigInt, 0n)) throw "x"
  assert(fc.bigInt(), (a) => cut.is(BigInt, a))
  assert(fc.boolean(), (a) => cut.is(Boolean, a))
  assert(fc.date(), (a) => cut.is(Date, a))
  assert(fc.float(), (a) => cut.is(Number, a))
  assert(fc.string(), (a) => cut.is(String, a))
  assert(fc.tuple(), (a) => cut.is(Array, a))
  assert(fc.func(fc.nat()), (a) => cut.is(Function, a)) // NOTE: does not work with fc.func()
  assert(fc.infiniteStream(), (a) => cut.is(Iterator, a))
  assertAsync(fc.infiniteStream(), async (a) => cut.is(Iterator, a))
  assert(fc.object(), (a) => cut.is(Object, a))
  assert(fc.int8Array(), (a) => cut.is(Int8Array, a))
})

// --- transform ---

const validDate = fc.date({ min: new Date("1970-01-02"), max: new Date("2100-01-01") }).filter((d) => !isNaN(d.getTime()))
const identity = (x) => x

test("transform with identity preserves structure", () => {
  const obj = fc.oneof(
    fc.integer(),
    fc.string(),
    fc.boolean(),
    fc.constant(null),
    fc.tuple(fc.integer(), fc.string()).map(([a, b]) => ({ a, b })),
    fc.array(fc.integer()),
    fc.tuple(fc.integer()).map(([b]) => ({ a: { b } })),
    fc.tuple(fc.array(fc.integer())).map(([a]) => ({ a })),
  )
  assertTrue(obj, (a) => cut.equal(cut.transform(a, identity), a))
})

test("transform does not throw for objects and arrays", () => {
  const obj = fc.oneof(
    fc.integer(),
    fc.string(),
    fc.boolean(),
    fc.constant(null),
    fc.tuple(fc.integer()).map(([a]) => ({ a })),
    fc.array(fc.integer()),
  )
  assert(obj, (a) => cut.transform(a, identity))
})

// --- sort ---

test("sort is idempotent", () => {
  assertTrue(fc.array(fc.integer()), (arr) => {
    const sorted1 = cut.sort(arr.slice())
    const sorted2 = cut.sort(sorted1.slice())
    return cut.equal(sorted1, sorted2)
  })
})

test("sort preserves length", () => {
  assertTrue(fc.array(fc.integer()), (arr) => cut.sort(arr.slice()).length === arr.length)
})

test("sort result is ordered", () => {
  assert(fc.array(fc.integer()), (arr) => {
    const sorted = cut.sort(arr.slice())
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i - 1] > sorted[i]) throw new Error(`Not sorted: ${sorted[i - 1]} > ${sorted[i]}`)
    }
  })
})

// --- unique ---

test("unique is idempotent", () => {
  assertTrue(fc.array(fc.integer()), (arr) => {
    const u1 = cut.unique(arr)
    const u2 = cut.unique(u1)
    return cut.equal(u1, u2)
  })
})

test("unique length <= original length", () => {
  assertTrue(fc.array(fc.integer()), (arr) => cut.unique(arr).length <= arr.length)
})

test("unique elements are subset of original", () => {
  assert(fc.array(fc.integer()), (arr) => {
    for (const v of cut.unique(arr)) {
      if (!arr.includes(v)) throw new Error(`unique element ${v} not in original`)
    }
  })
})

test("unique removes all duplicates", () => {
  assertTrue(fc.array(fc.integer()), (arr) => {
    const u = cut.unique(arr)
    return new Set(u).size === u.length
  })
})

// --- map ---

test("map with identity preserves array", () => {
  assertTrue(fc.array(fc.integer()), (arr) =>
    cut.equal(
      cut.map(arr, (x) => x),
      arr,
    ),
  )
})

test("map preserves length", () => {
  assertTrue(fc.array(fc.integer()), (arr) => cut.map(arr, (x) => x * 2).length === arr.length)
})

// --- filter ---

test("filter length <= original length", () => {
  assertTrue(fc.array(fc.integer()), (arr) => cut.filter(arr, () => true).length <= arr.length)
})

test("filter with true keeps all elements", () => {
  assertTrue(fc.array(fc.integer()), (arr) =>
    cut.equal(
      cut.filter(arr, () => true),
      arr,
    ),
  )
})

test("filter with false returns empty", () => {
  assertTrue(fc.array(fc.integer()), (arr) => cut.filter(arr, () => false).length === 0)
})

// --- min / max ---

test("min <= max for non-empty arrays", () => {
  assertTrue(fc.array(fc.integer(), { minLength: 1 }), (arr) => cut.min(arr) <= cut.max(arr))
})

test("min is in the array", () => {
  assertTrue(fc.array(fc.integer(), { minLength: 1 }), (arr) => arr.includes(cut.min(arr)))
})

test("max is in the array", () => {
  assertTrue(fc.array(fc.integer(), { minLength: 1 }), (arr) => arr.includes(cut.max(arr)))
})

// --- words ---

test("words always returns array of strings", () => {
  assertTrue(fc.string(), (str) => {
    const w = cut.words(str)
    return Array.isArray(w) && w.every((x) => typeof x === "string")
  })
})

test("words returns no empty strings", () => {
  assertTrue(fc.string(), (str) => cut.words(str).every((x) => x.length > 0))
})

// --- memoize ---

test("memoize returns same result as original", () => {
  assert(fc.integer(), (n) => {
    const fn = (x) => x * 2 + 1
    const memoized = cut.memoize(fn)
    if (memoized(n) !== fn(n)) throw new Error("memoized(n) !== fn(n)")
  })
})

test("memoize caches results", () => {
  assert(fc.integer(), (n) => {
    let calls = 0
    const fn = (x) => (calls++, x)
    const memoized = cut.memoize(fn)
    memoized(n)
    memoized(n)
    if (calls !== 1) throw new Error(`Expected 1 call, got ${calls}`)
  })
})

// --- Date_start / Date_end ---

test("Date_start <= original date", () => {
  const unit = fc.constantFrom("year", "month", "day", "hour", "minute", "second")
  assertTrue(validDate, unit, (d, u) => {
    return +cut.start(d, u) <= +d
  })
})

test("Date_end >= original date", () => {
  const unit = fc.constantFrom("year", "month", "day", "hour", "minute", "second")
  assertTrue(validDate, unit, (d, u) => {
    return +cut.end(d, u) >= +d
  })
})

test("Date_start <= Date_end for same date and unit", () => {
  const unit = fc.constantFrom("year", "month", "day", "hour", "minute", "second")
  assertTrue(validDate, unit, (d, u) => {
    return +cut.start(d, u) <= +cut.end(d, u)
  })
})

// --- Date_plus / Date_minus ---

test("Date_plus and Date_minus are inverses for days", () => {
  const days = fc.integer({ min: 0, max: 1000 })
  assertTrue(validDate, days, (d, n) => {
    const result = cut.plus(cut.minus(d, { days: n }), { days: n })
    return Math.abs(+result - +d) < 1000 // within 1 second (DST)
  })
})

test("Date_plus with 0 is identity", () => {
  assertTrue(validDate, (d) => {
    return +cut.plus(d, { days: 0 }) === +d
  })
})

// --- RegExp_plus / RegExp_minus ---

test("RegExp_plus then RegExp_minus roundtrips", () => {
  const flag = fc.constantFrom("g", "i", "m", "s")
  assert(flag, (f) => {
    const re = /abc/
    const added = cut.replace.plus ? cut.by.name.RegExp_plus(re, f) : cut.by.name.RegExp_plus(re, f)
    const removed = cut.by.name.RegExp_minus(added, f)
    if (removed.source !== re.source) throw new Error("source changed")
    if (removed.flags !== re.flags) throw new Error(`flags not restored: ${removed.flags} !== ${re.flags}`)
  })
})

test("RegExp_plus is idempotent", () => {
  const flag = fc.constantFrom("g", "i", "m", "s")
  assert(flag, (f) => {
    const re = /abc/
    const once = cut.by.name.RegExp_plus(re, f)
    const twice = cut.by.name.RegExp_plus(once, f)
    if (once.flags !== twice.flags) throw new Error(`Not idempotent: ${once.flags} !== ${twice.flags}`)
  })
})

// --- compare ---

test("compare is antisymmetric", () => {
  const { compare: cmp } = cut.by.name
  assert(fc.oneof(fc.integer(), fc.string()), fc.oneof(fc.integer(), fc.string()), (a, b) => {
    const ab = cmp(a, b)
    const ba = cmp(b, a)
    if (ab === 0 && ba !== 0) throw new Error(`compare(${a},${b})=0 but compare(${b},${a})=${ba}`)
    if (ab > 0 && ba >= 0) throw new Error(`compare(${a},${b})=${ab} but compare(${b},${a})=${ba}`)
    if (ab < 0 && ba <= 0) throw new Error(`compare(${a},${b})=${ab} but compare(${b},${a})=${ba}`)
  })
})

test("compare is reflexive", () => {
  const { compare: cmp } = cut.by.name
  assert(fc.oneof(fc.integer(), fc.string()), (a) => {
    if (cmp(a, a) !== 0) throw new Error(`compare(${a},${a}) !== 0`)
  })
})

// --- format ---

test("format does not throw for any String, Number or Date", () => {
  const strnumdate = fc.oneof(fc.string(), fc.float(), fc.date(), fc.bigInt())
  assert(strnumdate, (a) => cut.format(a))
})

test("format throws for anything else than String, Number or Date", () => {
  const notstrnumdate = any.filter((a) => ![String, Number, BigInt, Date].includes(a?.constructor))
  assertThrows(notstrnumdate, (a) => cut.format(a))
})

test("format always returns a string", () => {
  const strnumdate = fc.oneof(fc.string(), fc.float(), fc.date(), fc.bigInt())
  assertTrue(strnumdate, (a) => typeof cut.format(a) === "string")
})

test("format of NaN is always '-'", () => {
  assertTrue(fc.constantFrom("", "0.00", "$", "%", "E"), (fmt) => cut.format(NaN, fmt) === "-")
})

// --- parse ---

test("parse does not throw for any String", () => {
  const d = new Date()
  assert(fc.string(), (a) => cut.parse(d, a))
})

// --- duration ---

test("String_duration parses Number_duration output", () => {
  const ms = fc.constantFrom(500, 1000, 60000, 3600000, 86400000)
  assert(ms, (n) => {
    const formatted = cut.duration(n)
    const parsed = cut.duration(formatted)
    if (typeof parsed !== "number" || isNaN(parsed)) throw new Error(`Could not parse "${formatted}" back`)
  })
})
