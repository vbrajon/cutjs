import testsAsync from "./cut-async.test.js"
import testsSync from "./cut-sync.test.js"
import cut from "./cut.js"
export const packages = [
  {
    name: "cut",
    versions: ["latest"],
    import: async (version) => {
      window.cut = (await import("./cut.js")).default
      cut("mode", "prototype")
      return cut
    },
    fn: (module, name) => {
      const [cname, fname] = name.split(".")
      return (x, ...args) => (x == null ? cut[cname][fname](x, ...args) : x[fname](...args))
      // return window[cname]?.[fname]
    },
  },
]
export default testsAsync.concat(testsSync).concat([
  {
    name: "core.noMutation",
    fn() {
      const a = [3, 1, 2]
      a.reverse()
      if (a[0] !== 3) throw new Error("Array.reverse mutates the array")
      const reverse = cut.shortcuts.reverse
      cut("shortcut", "reverse", null)
      if (cut.shortcuts.reverse) throw new Error("cut.shortcuts.reverse still exists")
      a.reverse()
      if (a[0] !== 2) throw new Error("Array.reverse does not mutate the array")
      cut("shortcut", "reverse", reverse)
    },
  },
  {
    name: "core.setup",
    fn() {
      // cut.Object.fake = () => 1 / 3
      // cut.shortcuts.fake = { after: (v) => Math.round(v * 100) }
      if (cut.mode !== "prototype") throw new Error("cut.mode is not prototype")
      cut("shortcut", "fake", { after: (v) => Math.round(v * 100) })
      cut(Object, "fake", () => 1 / 3)
      if (Object.fake() !== 33) throw new Error("Object.fake result is not 33 " + Object.fake())
      cut(Object, "fake", null)
      cut("shortcut", "fake", null)
      if (Object.fake) throw new Error("Object.fake still exists")
      if (Object.prototype.fake) throw new Error("Object.prototype.fake still exists")
      if (cut.shortcuts.fake) throw new Error("shortcut.fake still exists")

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
        cut(matrix.concat([[7, 2]])).transpose()
      } catch (e) {
        error = e
      }
      if (!error || error.message !== "Not a matrix") throw new Error("Matrix error not thrown") // "Not a matrix"
      if (cut(matrix).swap().length !== 3) throw new Error("Matrix not transposed") // [[1, 4], [2, 5], [3, 6]]
    },
  },
  {
    name: "core.cleanup",
    fn() {
      for (let property in { a: 1 }) if (property !== "a") throw new Error(`Enumerable property ${property} still exists`)
      // if (Number.abs !== Math.abs) throw new Error("Number.abs !== Math.abs")
      cut("mode", "normal")
      if (Object.prototype.keys) throw new Error("Object.prototype.keys still exists")
      if (Object.prototype.map) throw new Error("Object.prototype.map still exists")
      if (Array.prototype._map) throw new Error("Array.prototype._map still exists")
      if (Array.map) throw new Error("Array.map still exists")
      if (Number.abs) throw new Error("Number.abs still exists")
      const a = [3, 1, 2]
      a.reverse()
      if (a[0] !== 3) throw new Error("Array.reverse mutates the array")
    },
  },
])
