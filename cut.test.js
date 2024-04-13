import run from "./cutest"
const registry = "https://registry.npmjs.org/"
const unpkg = process.title === "bun" ? "" : "https://unpkg.com/"
const esm = process.title === "bun" ? "" : "https://esm.sh/"
const versionList = async (pkg) => Object.keys((await (await fetch(registry + pkg)).json()).versions).reverse()
const packages = [
  {
    name: "cut",
    versions: ["latest"],
    import: (version) => import(`./cut.js`),
    fn: (module, name) => {
      const [constructor, fname] = name.split(".")
      return module.default[constructor][fname]
    },
  },
  {
    name: "vanilla",
    versions: ["es2022"],
    import: (version) => import(`${esm}@js-temporal/polyfill`),
    fn: (module, name) => {
      const { Temporal } = module
      return {
        "Object.map": (obj, fn) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v, k, obj)])),
        "Object.filter": (obj, fn) => Object.fromEntries(Object.entries(obj).filter(([k, v]) => fn(v, k, obj))),
        "Object.find": (obj, fn) => obj[Object.keys(obj).find((k, i, ks) => fn(obj[k], k, obj, i, ks))],
        "Object.findIndex": (obj, fn) => Object.keys(obj).find((k, i, ks) => fn(obj[k], k, obj, i, ks)),
        "Date.getWeek": (date) => Temporal.PlainDate.from({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }).weekOfYear,
      }[name]
    },
  },
  {
    name: "lodash-es",
    versions: (await versionList("lodash-es"))
      .filter((v) => v.startsWith("4"))
      .reverse()
      .slice(-1),
    import: (version) => import(`${unpkg}lodash-es@${version}`),
    fn: (module, name) => {
      if (name === "Object.map") return (...args) => (args[0].constructor === Object ? module.mapValues(...args) : module.map(...args))
      if (name === "Object.filter") return (...args) => (args[0].constructor === Object ? module.pickBy(...args) : module.filter(...args))
      if (name === "Object.find") return module.find
      if (name === "Object.findIndex") return module.findKey
      if (name === "Object.reduce") return module.reduce
      // if (name === "Object.access") return module.get
      // if (name === "Object.equal") return module.isEqual
      if (name === "String.lower") return module.toLower
      if (name === "String.upper") return module.toUpper
      if (name === "String.capitalize") return module.capitalize
      if (name === "String.words") return module.words
      // if (name === "Function.decorate") return module.flow
      // if (name === "Function.promisify") return module.bind
      // if (name === "Function.partial") return module.partial
      // if (name === "Function.memoize") return module.memoize
      // if (name === "RegExp.escape") return module.escapeRegExp
    },
  },
]
// await new Promise((resolve) => setTimeout(resolve, 1000))
const results = [
  // NOTE: Safari crashes when running more test functions, more times
  await run("cut-async.test.js", { parallel: true, packages: packages.slice(0, 1) }),
  await run("cut-sync.test.js", { parallel: true, packages }),
  await run("cut-sync.test.js", { parallel: true, times: 100, packages }),
  await run("cut-core.test.js", { parallel: true }),
  await run("test/cut-date-fns.test.js", { parallel: true }),
]
  .map(Object.values)
  .flat(2)
if (results.find(({ status }) => status === "ko")) throw "KO"
