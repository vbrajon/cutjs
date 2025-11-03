import { test, expect } from "bun:test"
import fc from "fast-check"
import { access, equal, is, format, parse } from "./cut.js"
import { isEqual } from "lodash-es"

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

test("access does not throw for any properties", () => {
  access({}, { toString: null })
  access({}, [{ toString: null }])
  assert(any, any, (a, b) => access(a, b))
})

test("equal is always true for clones", () => {
  assertTrue(fc.clone(any, 2), ([a, b]) => equal(a, b))
})

const _any = fc.anything({
  withBigInt: true,
  withBoxedValues: true,
  withDate: true,
  // withMap: true,
  // withNullPrototype: true,
  withObjectString: true,
  // withSet: true,
  withTypedArray: true,
  // withSparseArray: true,
  withUnicodeString: true,
})
test("equal is similar to lodash.isEqual", () => {
  if (!equal([{ __proto__: null }], [{ __proto__: null }])) throw "x"
  if (equal({ __proto__: null }, {})) throw "x" // != lodash
  if (equal({ "": undefined }, { a: undefined })) throw "x"
  // if (equal([], [,])) throw "x"
  // if (equal(new Map([["a", 1]]), new Map([["b", 2]]))) throw "x"
  assert(_any, _any, (a, b) => {
    if (equal(a, b) !== isEqual(a, b)) throw new Error("Not similar to lodash isEqual")
  })
})

test("is does not throw for any properties", () => {
  is(0n, null)
  is({ __proto__: null }, null)
  assert(any, any, (a, b) => {
    is(a)
    is(a, b)
  })
})

test("is is always true for clones", () => {
  assertTrue(fc.clone(any, 2), ([a, b]) => is(a) === is(b))
})

test("is returns the correct type", () => {
  // if (!is(BigInt, 0n)) throw "x" // TODO: the reverse works is(0n, BigInt)
  assert(fc.bigInt(), (a) => is(a, BigInt))
  assert(fc.boolean(), (a) => is(a, Boolean))
  assert(fc.date(), (a) => is(a, Date))
  assert(fc.float(), (a) => is(a, Number))
  assert(fc.string(), (a) => is(a, String))
  assert(fc.tuple(), (a) => is(a, Array))
  assert(fc.func(fc.nat()), (a) => is(a, Function)) // NOTE: does not work with fc.func()
  assert(fc.infiniteStream(), (a) => is(a, Iterator))
  assertAsync(fc.infiniteStream(), async (a) => is(a) === "Iterator") // TODO: fix is(a, Iterator)
  assert(fc.object(), (a) => is(a, Object))
  assert(fc.int8Array(), (a) => is(a, Int8Array))
})

test("format does not throw for any String, Number or Date", () => {
  // format(0n) // TODO: BigInt, cut.Number.format supports it but cut.format does not
  const strnumdate = fc.oneof(fc.string(), fc.float(), fc.date())
  assert(strnumdate, (a) => format(a))
})

test("format throw for anything else than String, Number or Date", () => {
  const notstrnumdate = any.filter((a) => ![String, Number, Date].includes(a?.constructor))
  assertThrows(notstrnumdate, (a) => format(a))
})

test("format always returns a string", () => {
  const strnumdate = fc.oneof(fc.string(), fc.float(), fc.date())
  assertTrue(strnumdate, (a) => typeof format(a) === "string")
})

test("parse does not throw for any String", () => {
  const d = new Date()
  assert(fc.string(), (a) => parse(d, a))
})
