import { test, expect } from "bun:test"
import fc from "fast-check"
import { access, equal } from "./cut.js"
import { isEqual } from "lodash-es"

// fc.configureGlobal({ numRuns: 50000 })

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

test("access does not throw for any properties", () => {
  access({}, { toString: null })
  access({}, [{ toString: null }])
  fc.assert(
    fc.property(any, any, (a, b) => {
      access(a, b)
    })
  )
})

test("equal is always true for clones", () => {
  fc.assert(
    fc.property(fc.clone(any, 2), ([a, b]) => {
      if (!equal(a, b)) throw new Error("Not equal")
    })
  )
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
  fc.assert(
    fc.property(_any, _any, (a, b) => {
      if (equal(a, b) !== isEqual(a, b)) throw new Error("Not similar to lodash isEqual")
    })
  )
})
