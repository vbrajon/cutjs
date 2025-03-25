import { test, expect } from "bun:test"
import tests, { packages } from "./cut-core-test"

globalThis.window = globalThis
process.env.TZ = "Europe/Paris"
let name
let i = 0
for (const pkg of packages) {
  for (const version of pkg.versions) {
    const module = await pkg.import(version)
    for (const t of tests) {
      if (t instanceof Array) {
        i = name !== t[0] ? 1 : i + 1
        name = t[0].split(" - ")[0]
        const fn = await pkg.fn(module, name)
        const testfn = fn ? test : test.skip
        testfn(`${pkg.name}@${version} ${t[0]} #${i}`, async () => {
          const result = await fn(...t.slice(1, -1))
          expect(result).toEqual(t.at(-1))
        })
      } else {
        i = name !== t.name ? 1 : i + 1
        name = t.name.split(" - ")[0]
        const fn = await pkg.fn(module, name)
        const testfn = fn ? test : test.skip
        testfn(`${pkg.name}@${version} ${t.name} #${i}`, async () => {
          const result = await t.fn(fn, module)
          if (t.hasOwnProperty("output")) expect(result).toEqual(t.output)
        })
      }
    }
  }
}
