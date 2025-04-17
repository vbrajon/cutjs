import { test, expect } from "bun:test"
const files = ["cut-core-test.js"]

globalThis.window = globalThis
process.env.TZ = "Europe/Paris"
let name
let i = 0
for (const file of files) {
  const { packages, default: tests } = await import("./" + file)
  for (const pkg of packages) {
    for (const version of pkg.versions) {
      const module = await pkg.import(version)
      for (const t of tests) {
        if (t instanceof Array) {
          i = name !== t[0] ? 1 : i + 1
          name = t[0].split(" - ")[0]
          const fn = module[name]
          if (!fn) continue // test.skip
          test(`${file.slice(0, -8)} ${pkg.name} ${t[0]} #${i}`, async () => {
            const result = await fn(...t.slice(1, -1))
            expect(result).toEqual(t.at(-1))
          })
        } else {
          i = name !== t.name ? 1 : i + 1
          name = t.name.split(" - ")[0]
          const fn = module[name]
          if (!fn) continue // test.skip
          test(`${file.slice(0, -8)} ${pkg.name} ${t.name} #${i}`, async () => {
            const result = await t.fn(module)
            expect(result).toEqual(t.output)
          })
        }
      }
    }
  }
}
