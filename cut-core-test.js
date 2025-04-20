import testsSync from "./cut-sync-test.js"
import testsAsync from "./cut-async-test.js"
// const registry = "https://registry.npmjs.org/"
// const versionList = async (pkg) => Object.keys((await (await fetch(registry + pkg)).json()).versions).reverse()
export const packages = [
  // {
  //   name: "cut",
  //   versions: ["latest"],
  //   import: async (version) => {
  //     const module = await import("./cut")
  //     const cut = module.default
  //     const fns = {}
  //     for (const cname in cut.constructors) {
  //       for (const fname in cut[cname]) {
  //         fns[fname] = module[fname]
  //         fns[`${cname}.${fname}`] = cut[cname][fname]
  //       }
  //     }
  //     return fns
  //   },
  // },
  // {
  //   name: "cut-wrap",
  //   versions: ["latest"],
  //   import: async (version) => {
  //     const module = await import("./cut")
  //     const cut = module.default
  //     const fns = {}
  //     for (const cname in cut.constructors) {
  //       for (const fname in cut[cname]) {
  //         fns[fname] = fns[`${cname}.${fname}`] = (x, ...args) => cut(x)[fname](...args).data
  //       }
  //     }
  //     return fns
  //   },
  // },
  {
    name: "cut-proto",
    versions: ["latest"],
    import: async (version) => {
      await import("./cut?window+prototype")
      const fns = {}
      for (const cname in cut.constructors) {
        for (const fname in cut[cname]) {
          fns[fname] = (x, ...args) => {
            if (x && x[fname]) return x[fname](...args)
            return cut[fname](x, ...args)
          }
          fns[`${cname}.${fname}`] = (x, ...args) => {
            if (x && x[fname]) return x[fname](...args)
            return cut[cname][fname](x, ...args)
          }
        }
      }
      fns.core = () => {}
      return fns
    },
  },
  // {
  //   name: "vanilla",
  //   versions: ["es2022"],
  //   import: async (version) => {
  //     const { Temporal } = await import("@js-temporal/polyfill")
  //     return {
  //       "Object.map": (obj, fn) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v, k, obj)])),
  //       "Object.filter": (obj, fn) => Object.fromEntries(Object.entries(obj).filter(([k, v]) => fn(v, k, obj))),
  //       "Object.find": (obj, fn) => obj[Object.keys(obj).find((k, i, ks) => fn(obj[k], k, obj, i, ks))],
  //       "Object.findIndex": (obj, fn) => Object.keys(obj).find((k, i, ks) => fn(obj[k], k, obj, i, ks)),
  //       "Date.getWeek": (date) => Temporal.PlainDate.from({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }).weekOfYear,
  //     }
  //   },
  // },
  // {
  //   name: "lodash-es",
  //   // versions: (await versionList("lodash-es"))
  //   //   .filter((v) => v.startsWith("4"))
  //   //   .reverse()
  //   //   .slice(-1)
  //   //   .reverse(),
  //   versions: ["4.17.21"],
  //   import: async (version) => {
  //     const module = await import("lodash-es")
  //     const fns = {
  //       // "Generic.is": (...args) => module[`is${args[1]?.name.replace(/./, (c) => c.toUpperCase())}`](...args),
  //       // "Generic.access": module.get,
  //       "Generic.equal": (...args) => (args[0] instanceof Function ? args[0].toString() === args[1].toString() : module.isEqual(...args)),
  //       // "Generic.transform": module.transform,
  //       "Object.keys": module.keys,
  //       "Object.values": module.values,
  //       "Object.entries": module.toPairs,
  //       "Object.fromEntries": module.fromPairs,
  //       "Object.map": (...args) => (args[0].constructor === Object ? module.mapValues(...args) : module.map(...args)),
  //       "Object.filter": (...args) => (args[0].constructor === Object ? module.pickBy(...args) : module.filter(...args)),
  //       "Object.find": module.find,
  //       "Object.findIndex": module.findKey,
  //       "Object.reduce": module.reduce,
  //       "Array.map": module.map,
  //       "Array.filter": module.filter,
  //       "Array.find": module.find,
  //       "Array.findIndex": module.findIndex,
  //       "Array.reduce": module.reduce,
  //       "Array.group": module.groupBy,
  //       "Array.sort": module.sortBy,
  //       "Array.reverse": module.reverse,
  //       "Array.unique": module.uniq,
  //       "Array.sum": module.sum,
  //       "Array.min": module.min,
  //       "Array.max": module.max,
  //       "Array.mean": module.mean,
  //       "Array.median": module.median,
  //       // "Function.decorate": module.flow,
  //       // "Function.promisify": module.bind,
  //       // "Function.partial": module.partial,
  //       // "Function.memoize": module.memoize,
  //       "String.lower": module.toLower,
  //       "String.upper": module.toUpper,
  //       "String.capitalize": module.capitalize,
  //       "String.words": module.words,
  //       "RegExp.escape": (...args) => RegExp(module.escapeRegExp(...args).slice(1, -1)),
  //     }
  //     for (const name in fns) {
  //       const [cname, fname] = name.split(".")
  //       fns[fname] = fns[name]
  //     }
  //     return fns
  //   },
  // },
]
export default [
  ...testsSync,
  ...testsAsync,
  {
    name: "core - noMutation",
    fn: () => {
      const a = [3, 1, 2]
      a.reverse()
      if (a[0] !== 3) throw new Error("Array.reverse mutates the array")
      const reverse = cut.shortcuts.reverse
      cut("shortcut", "reverse", null)
      if (cut.shortcuts.reverse) throw new Error("cut.shortcuts.reverse still exists")
      a.reverse()
      if (a[0] === 3) throw new Error("Array.reverse does not mutate the array")
      a.reverse()
      cut("shortcut", "reverse", reverse)
      a.reverse()
      if (a[0] !== 3) throw new Error("Array.reverse mutates the array")
    },
  },
  {
    name: "core - setup",
    fn: () => {
      // cut.Object.fake = () => 1 / 3
      // cut.shortcuts.fake = { after: (v) => Math.round(v * 100) }
      if (cut.mode !== "window+prototype") throw new Error("cut.mode is not window+prototype")
      cut("shortcut", "fake", { after: (v) => Math.round(v * 100) })
      cut(Object, "fake", () => 1 / 3)
      if (Object.fake() !== 33) throw new Error("Object.fake result is not 33 " + Object.fake())
      cut(Object, "fake", null)
      cut("shortcut", "fake", null)
      if (Object.fake) throw new Error("Object.fake still exists")
      if (Object.prototype.fake) throw new Error("Object.prototype.fake still exists")
      if (cut.fake) throw new Error("cut.fake still exists")
      if (cut.Object.fake) throw new Error("cut.Object.fake still exists")
      if (cut.shortcuts.fake) throw new Error("cut.shortcuts.fake still exists")

      cut(Array, "transpose", (arr) => arr[0].map((_, i) => arr.map((row) => row[i])))
      cut("shortcut", "transpose", {
        before(args) {
          if (args[0].some((row) => row.length !== args[0][0].length)) throw new Error("Not a matrix")
          return args
        },
      })
      // Alias swap <> transpose
      cut(Array, "swap", cut.Array.transpose)
      const matrix = [
        [1, 2, 3],
        [4, 5, 6],
      ]
      let error
      try {
        cut.transpose(matrix.concat([[7, 2]]))
      } catch (e) {
        error = e
      }
      if (!error || error.message !== "Not a matrix") throw new Error("Matrix error not thrown") // "Not a matrix"
      if (cut.swap(matrix).length !== 3) throw new Error("Matrix not transposed") // [[1, 4], [2, 5], [3, 6]]
    },
  },
  {
    name: "core - cleanup",
    fn: () => {
      for (let property in { a: 1 }) if (property !== "a") throw new Error(`Enumerable property ${property} still exists`)
      // if (Number.abs !== Math.abs) throw new Error("Number.abs !== Math.abs")
      cut("mode", "normal")
      if (Object.prototype.keys) throw new Error("Object.prototype.keys still exists")
      if (Object.prototype.map) throw new Error("Object.prototype.map still exists")
      if (Array.prototype._map) throw new Error("Array.prototype._map still exists")
      if (Array.map) throw new Error("Array.map still exists")
      if (Number.abs) throw new Error("Number.abs still exists")
      const a = [3, 1, 2]
      cut.reverse(a)
      if (a[0] !== 3) throw new Error("cut.reverse mutates the array")
      a.reverse()
      if (a[0] === 3) throw new Error("Array.reverse does not mutate the array")
    },
  },
  {
    name: "core - wrap",
    fn: () => {
      const initial = { a: 1 }
      // 1. Wrap
      {
        const { data, error } = cut(initial).map((v) => v + 1).a
        if (data !== 2) throw new Error("Data not 2")
        if (error) throw new Error("Error thrown")
      }

      // 2. Wrap with error
      {
        const { data, error } = cut(initial).a.b.c
        if (data) throw new Error("Data with error")
        if (!error) throw new Error("Error not thrown")
      }

      // 3. Wrap and access path
      const wrap = cut(initial)
      if (wrap.path[0] !== initial) throw new Error("Path not valid")
      wrap.map((v) => v + 1)
      if (wrap.path.length !== 2) throw new Error("Path not valid")
      wrap.a.b.c
      if (wrap.path.length !== 5) throw new Error("Path not valid")
      const { data, error } = wrap
      if (wrap.path.length !== 5) throw new Error("Path not valid")
      if (!error) throw new Error("Error not thrown") // undefined is not an object (evaluating 'data[p]')
      if (data) throw new Error("Data with error")

      // 4. Careful, it throws once .data or .error are accessed
      let err
      try {
        wrap.a.b // throws
      } catch (e) {
        err = e
      }
      if (!err) throw new Error("Throws once .data or .error are accessed")
    },
  },
]
