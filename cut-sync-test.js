const users = [
  { name: "John Doe", age: 29 },
  { name: "Jane Doe", age: 22 },
  { name: "Janette Doe", age: 22 },
  { name: "Johnny Doe", age: 71, birthdate: new Date("Feb 26, 1932") },
]
const user = users[0]
const str = "i_am:The\n1\tAND , Only."
const date = new Date("2019-01-20T10:09:08")
const offset = ((offset = date.getTimezoneOffset()) => `${offset > 0 ? "-" : "+"}${("0" + ~~Math.abs(offset / 60)).slice(-2)}:${("0" + Math.abs(offset % 60)).slice(-2)}`)()
const mixed = [false, true, (x) => x, -1, 0, Infinity, [], { a: [{ b: 1 }] }, /a/gi, null, new Date("2020"), "a", undefined]
const mixedClone = [false, true, (x) => x, -1, 0, Infinity, [], { a: [{ b: 1 }] }, /a/gi, null, new Date("2020"), "a", undefined]

export default [
  //? Lodash _.is
  ["Generic.is", Array, [1], true],
  ["Generic.is", ArrayBuffer, new ArrayBuffer(1), true],
  ["Generic.is", Boolean, true, true],
  // ["Generic.is", Buffer, new Buffer(1), true],
  ["Generic.is", Date, new Date(), true],
  ["Generic.is", Error, new Error(), true],
  ["Generic.is", Function, () => 1, true],
  ["Generic.is", Map, new Map(), true],
  ["Generic.is", NaN, NaN, true],
  ["Generic.is", null, null, true],
  ["Generic.is", Number, 1, true],
  ["Generic.is", {}, Object, true], // TODO: determine why bun test errors when swapping {} and Object
  ["Generic.is", RegExp, /1/, true],
  ["Generic.is", Set, new Set(), true],
  ["Generic.is", String, "str", true],
  ["Generic.is", Symbol, Symbol(1), true],
  ["Generic.is", undefined, undefined, true],
  ["Generic.is", WeakMap, new WeakMap(), true],
  ["Generic.is", WeakSet, new WeakSet(), true],
  //? Lodash _.is ignored: Arguments / ArrayLike / ArrayLikeObject / Element / Empty / Equal / EqualWith / Finite / Integer / Length / Match / MatchWith / Native / Nil / ObjectLike / PlainObject / SafeInteger / TypedArray
  ["Generic.is", null, "Null"],
  ["Generic.is", void 0, "Undefined"],
  ["Generic.is", undefined, "Undefined"],
  ["Generic.is", NaN, "NaN"],
  ["Generic.is", Infinity, "Number"],
  ["Generic.is", () => 1, "Function"],
  // { name: "Generic.is", fuzz: true, errors: [] },
  ["Generic.is", void 0, undefined, true],
  ["Generic.is", NaN, NaN, true],
  ["Generic.is", NaN, Number, true], //! NaN is also a Number
  ["Generic.is", 1, NaN, false],
  //? Lodash _.isEqual
  ["Generic.equal", [null, null], [null, undefined], false],
  ["Generic.equal", { a: 1 }, { a: 1 }, true],
  ["Generic.equal", { a: 1 }, { a: 1, b: 2 }, false],
  ["Generic.equal", mixed, mixedClone, true],
  ["Generic.equal", (x) => x, (x) => x, true], // != lodash
  ["Generic.equal", null, null, true],
  ["Generic.equal", true],
  ["Generic.access", { a: { b: [1, 2, 3] } }, ["a", "b", "length"], 3],
  ["Generic.access", { a: { b: [1, 2, 3] } }, "a.b.length", 3],
  ["Generic.access", { a: { b: [1, 2, 3] } }, ".a.b.length", 3], // != lodash
  ["Generic.access", { a: { b: [1, 2, 3] } }, '["a"]["b"].length', 3],
  ["Generic.access", { a: { b: [1, 2, 3] } }, { a: "a.b", b: "a.b.length" }, { a: [1, 2, 3], b: 3 }], // != lodash
  ["Generic.access", { a: { b: [1, 2, 3] } }, { a: ["a", "b"], b: "a.b.length" }, { a: [1, 2, 3], b: 3 }], // != lodash
  ["Generic.access", [{ a: { b: [1, 2, 3] } }], "0.a.b.length", 3],
  ["Generic.access", { a: { "b.c": 1 } }, 'a["b.c"]', 1],
  ["Generic.access", { a: { b: 1 } }, "a.b", 1],
  ["Generic.access", { a: { b: 1 } }, ["a", "b"], 1],
  ["Generic.access", { "a.b": 1 }, "a.b", 1],
  ["Generic.access", { "a.b": 1 }, ["a", "b"], undefined],
  ["Generic.access", { "a.b": 1 }, { "a.b": 1 }], // != lodash
  ["Generic.access", { "a.b": 1 }, null, { "a.b": 1 }], // != lodash
  ["Generic.access", { "a.b": 1 }, undefined, { "a.b": 1 }], // != lodash
  ["Generic.access", { "a.b": 1 }, [], { "a.b": 1 }],
  ["Generic.access", 1, 1, undefined],
  ["Generic.access", undefined],
  ["Generic.transform", 1, (v) => v * 2, 2], //* works also with primitives
  ["Generic.transform", [1], (v) => v * 2, [2]], //* equivalent to map when depth = 1
  ["Generic.transform", { a: 1 }, (v) => v * 2, { a: 2 }], //* equivalent to map when depth = 1
  ["Generic.transform", { a: 1, b: { c: 2, d: [3] } }, (v) => v * 2, { a: 2, b: { c: 4, d: [6] } }],
  ["Generic.transform", { a: 1, b: { c: 2, d: [3] } }, (v, path) => `${path.join(".")}=${v}`, { a: "a=1", b: { c: "b.c=2", d: ["b.d.0=3"] } }],
  {
    name: "Generic.transform",
    fn: ({ transform, equal, access, unique }) => {
      // Object.difference
      const o1 = { a: { b: [1, 2, 3] } }
      const o2 = { a: { b: [1, 2, 4, 5] } }
      const diff = []
      transform(o1, (v, path) => equal(v, access(o2, path)) || diff.push(path.join(".")))
      transform(o2, (v, path) => equal(v, access(o1, path)) || diff.push(path.join(".")))
      return unique(diff).length === 2
    },
    output: true,
  },
  ["Object.keys", user, ["name", "age"]],
  ["Object.values", user, ["John Doe", 29]],
  ["Object.entries", user, [["name", "John Doe"], ["age", 29]]], // prettier-ignore
  ["Object.fromEntries", Object.entries(user), user],
  ["Object.map", user, (v) => v * 2 || v, { name: "John Doe", age: 58 }],
  ["Object.filter", user, Number, { age: 29 }],
  ["Object.find", user, (v) => v > 10, 29],
  ["Object.findIndex", user, (v) => v === 29, "age"],
  ["Object.reduce", user, (acc, v, k) => ((acc[v] = k), acc), {}, { "John Doe": "name", 29: "age" }],
  ["Object.reduce", user, (acc, v, k) => Object.assign(acc, { [v]: k }), {}, { "John Doe": "name", 29: "age" }], //* compare performance
  ["Array.map", [null, "a", undefined, /a/], [null, "a", undefined, /a/]],
  ["Array.map", [{ a: 1, b: 2 }, { a: 3, b: 4 }], "a", [1, 3]], // prettier-ignore
  ["Array.map", [{ a: 1, b: 2 }, { a: 3, b: 4 }], ["a", "b"], [[1, 2], [3, 4]]], // prettier-ignore
  ["Array.map", [{ a: 1, b: 2 }, { a: 3, b: 4 }], { a: "b" }, [{ a: 2 }, { a: 4 }]], // prettier-ignore
  ["Array.map", [{ a: { b: 2 } }, { a: { b: 4 } }], "a.b", [2, 4]], // prettier-ignore
  ["Array.map", [{ a: { b: 2 } }, { "a.b": 4 }], "a.b", [2, 4]], // prettier-ignore
  ["Array.filter", [null, "a", undefined, /a/], ["a", /a/]],
  ["Array.filter", users, { name: /Ja/ }, [{ name: "Jane Doe", age: 22 }, { name: "Janette Doe", age: 22 }]], // prettier-ignore
  ["Array.filter", users, "name", users],
  ["Array.filter", [{ a: 1 }, { a: 2 }, { a: 3, b: 3 }], [{ a: (x) => x > 2 }, { b: 3 }, { a: 2 }], [{ a: 2 }, { a: 3, b: 3 }]],
  ["Array.find", users, { name: /Ja/ }, { name: "Jane Doe", age: 22 }],
  ["Array.find", [{ a: 1 }], { a: 1 }, { a: 1 }],
  ["Array.find", [{ a: 1 }, { a: 2 }], { a: [2, 3] }, { a: 2 }],
  ["Array.findIndex", [{ a: 1 }], { a: 1 }, 0],
  ["Array.reduce", users, (acc, v, i) => acc.concat(i), [], [0, 1, 2, 3]],
  ["Array.reduce", users, (acc, v, i) => ((acc[i] = v), acc), [], users],
  ["Array.group", users, (v) => "x", { x: users }],
  ["Array.group", [{ a: 1 }], "a", { 1: [{ a: 1 }] }],
  ["Array.group", [{ a: 1 }], "b", { undefined: [{ a: 1 }] }],
  ["Array.group", [{ a: 1, b: 2 }, { a: 1, b: 2 }], ["a", "b"], { 1: { 2: [{ a: 1, b: 2 }, { a: 1, b: 2 }] } }], // prettier-ignore
  ["Array.sort", users.map((v) => v.age), [1, 2, 0, 3].map((i) => users[i].age)],
  ["Array.sort", users.slice(), "age", [1, 2, 0, 3].map((i) => users[i])],
  ["Array.sort", users.slice(), (v) => v.age, [1, 2, 0, 3].map((i) => users[i])],
  ["Array.sort", users.slice(), (a, b) => (a.age === b.age ? 0 : a.age > b.age ? 1 : -1), [1, 2, 0, 3].map((i) => users[i])],
  ["Array.sort", users.slice(), function() { return arguments[0].age === arguments[1].age ? 0 : arguments[0].age > arguments[1].age ? 1 : -1 }, [1, 2, 0, 3].map((i) => users[i])], // prettier-ignore
  ["Array.sort", [[null, 1], [1, 2], [null, 3]], [0, -1], [[1, 2], [null, 3], [null, 1]]], // prettier-ignore
  ["Array.sort", [[null, 1], [1, 2], [null, 3]], [v => v[0], -1], [[1, 2], [null, 3], [null, 1]]], // prettier-ignore
  ["Array.sort", [[null, 1], [1, 2], [null, 3]], [4, 5], [[null, 1], [1, 2], [null, 3]]], // prettier-ignore
  ["Array.sort", ["10 arbres", "3 arbres", "cafetière", "Café", "café", "Adieu"], ["3 arbres", "10 arbres", "Adieu", "café", "Café", "cafetière"]],
  ["Array.sort", ["10 arbres", "3 arbres", "cafetière", "Café", "café", "Adieu"], { locale: "fr" }, ["3 arbres", "10 arbres", "Adieu", "café", "Café", "cafetière"]],
  ["Array.sort", mixed.slice().sort(() => Math.random() - 0.5), mixed],
  {
    name: "Array.sort",
    fn: ({ sort }) => {
      const arr = Array.from({ length: 1e5 }, (v, i) => Math.random())
      performance.mark("A")
      sort(arr)
      performance.mark("B")
      return performance.measure("sort", "A", "B").duration < 100
    },
    output: true,
  },
  ["Array.unique", users.map((v) => v.age), [29, 22, 71]],
  ["Array.sum", users.map((v) => v.age), 144],
  ["Array.min", users.map((v) => v.age), 22],
  ["Array.max", users.map((v) => v.age), 71],
  ["Array.mean", users.map((v) => v.age), 36],
  ["Array.median", users.map((v) => v.age), 25.5],
  ["Array.median", [1, 2, 3], 2],
  {
    name: "Function.decorate",
    fn: ({ decorate }) => decorate((x) => x)(1),
    output: 1,
  },
  {
    name: "Function.decorate",
    fn: ({ decorate }) => decorate((x) => x, () => 2)(1), // prettier-ignore
    output: 2,
  },
  {
    name: "Function.decorate",
    fn: ({ decorate }) => decorate((x) => x, (fn, x) => fn(x * 2) * 2)(1), // prettier-ignore
    output: 4,
  },
  {
    name: "Function.decorate",
    fn: ({ decorate }) => decorate((x) => x, (fn, x) => fn(x * 2))(1), // prettier-ignore
    output: 2,
  },
  {
    name: "Function.decorate",
    fn: ({ decorate }) => decorate((x) => x, (fn, x) => fn(x) * 2)(1), // prettier-ignore
    output: 2,
  },
  {
    name: "Function.decorate",
    fn: ({ decorate }) => {
      const decorated = decorate((x) => x, () => 1) // prettier-ignore
      decorated.fn = (x) => 2
      decorated.wrapper = (fn, x) => fn(x) * 5
      return decorated()
    },
    output: 10,
  },
  {
    name: "Function.promisify",
    fn: async ({ promisify }) => {
      const expect1callback = (v, cb) => (v === 1 ? cb(null, "OK") : cb("KO", null))
      const promisified = promisify(expect1callback)
      if ((await promisified(1)) !== "OK") throw new Error("Function.promisify should resolve the callback with the first argument")
      if ((await promisified(2).catch((e) => e)) !== "KO") throw new Error("Function.promisify should reject the callback with the second argument")
    },
  },
  {
    name: "Function.partial",
    fn: ({ partial }) => partial((a, b) => [a, b], null, 2)(1),
    output: [1, 2],
  },
  // {
  //   name: "Function.partial",
  //   fn: ({ partial }) => {
  //     function yolo() {
  //       console.log("You only live once !")
  //     }
  //     return partial(yolo).name
  //   },
  //   output: "partial_yolo",
  // },
  {
    name: "Function.memoize",
    fn: ({ memoize }) => {
      const memory = memoize((x) => x / 2)
      memory(2)
      memory(2)
      return memory.cache["[2]"]
    },
    output: 1,
  },
  ["String.lower", "A.B", "a.b"],
  ["String.upper", "a.b", "A.B"],
  ["String.capitalize", "A.B", "A.b"],
  [
    "String.words",
    "Title Case kebab-case snake_case camelCase PascalCase 12NUM34ber56 lowerUPPERlower",
    ["Title", "Case", "kebab", "case", "snake", "case", "camel", "Case", "Pascal", "Case", "12", "NUM", "34", "ber", "56", "lower", "UPPERlower"],
  ],
  [
    "String.format",
    "Title Case kebab-case snake_case camelCase PascalCase 12NUM34ber56 lowerUPPERlower",
    "-",
    "title-case-kebab-case-snake-case-camel-case-pascal-case-12-num-34-ber-56-lower-upperlower",
  ],
  ["String.format", str, "I Am The 1 And Only"], // "title" by default
  ["String.format", str, "-", "i-am-the-1-and-only"], // "dash"
  ["String.format", str, "_", "i_am_the_1_and_only"], // "underscore"
  ["String.format", str, "title", "I Am The 1 And Only"],
  ["String.format", str, "dash", "i-am-the-1-and-only"],
  ["String.format", str, "underscore", "i_am_the_1_and_only"],
  ["String.format", str, "camel", "iAmThe1AndOnly"],
  ["String.format", str, "pascal", "IAmThe1AndOnly"],
  ["String.format", "{}{}{}", 0, 1, 2, "012"],
  ["String.format", "{}{}{}", "a", "b", "ab"],
  ["String.format", "{}{}{}", ["a", "b"], "ab"],
  ["String.format", "{1}{1}{1}{0}{0}", "a", "b", "bbbaa"],
  ["String.format", "{2}{2}{2}{1}{1}", ["a", "b", ""], "bb"],
  ["String.format", "{}{}{}{1}{1}{1}{0}{0}", "a", "b", "abbbbaa"],
  ["String.format", "{user.name} is <strong>{{user.age}}</strong>", { user }, "John Doe is <strong>{29}</strong>"],
  ["String.format", "{.length} users starting with {0.name} & {1.name}", users, "4 users starting with John Doe & Jane Doe"],
  ["String.format", "{k2}{k2}{k3}", { k1: "a", k2: "b" }, "bb"],
  ["String.format", "{66} pears x {3} apples", (x, i) => +x + i, "66 pears x 4 apples"],
  // 1230000000000000.1 === 1230000000000000
  // 1230000000000000.2 === 1230000000000000.2
  // 1230000000000000.3 === 1230000000000000.2
  // 1230000000000000.4 === 1230000000000000.5
  // 1230000000000000.5 === 1230000000000000.5
  // 1230000000000000.6 === 1230000000000000.5
  // 1230000000000000.7 === 1230000000000000.8
  // 1230000000000000.8 === 1230000000000000.8
  // 1230000000000000.9 === 1230000000000001
  ["Number.format", 0.1 * 3 - 0.3, 0],
  ["Number.format", 1.23e13 + 0.1 + 0.2, 12300000000000.3],
  ["Number.format", 1.23e14 + 0.1 + 0.2, 123000000000000],
  ["Number.format", 1.23e15 + 0.1 + 0.2, 1230000000000000],
  ["Number.format", 0.1 * 3 * 1000, 300],
  ["Number.format", 0.1 * 3 * 1000, 0, 300],
  ["Number.format", 0.1 * 3 * 1000, "", 300],
  ["Number.format", 0.1 * 3 * 1000, 1, "300"],
  ["Number.format", 0.1 * 3 * 1000, "xx-invalid", "+300"],
  ["Number.format", -0.000123456789, 1, "-100µ"],
  ["Number.format", 123456789000, 2, "120G"],
  ["Number.format", 1, 10, "1"],
  ["Number.format", 0.1, "0.00%", "10.00%"],
  ["Number.format", 1010.0101, "en", "1,010.01"],
  ["Number.format", 1010.0101, "en-US", "1,010.01"],
  ["Number.format", 1010.0101, "fr", "1 010,01"],
  ["Number.format", 1010, "USD", "$1,010"],
  ["Number.format", 1010, "$", "$1,010"],
  ["Number.format", 1010, "€ ,00", "€1 010,00"],
  ["Number.format", 1010, "fr", { style: "currency", currency: "EUR" }, "1 010,00 €"],
  ["Number.format", -1, "+0,000.00", "-0,001.00"],
  ["Number.format", +1, "+0,000.00", "+0,001.00"],
  ["Number.format", 1, "-000,000,000.00", "+000,000,001.00"],
  ["Number.format", -1, "000000.0000##", "-000001.0000"],
  ["Number.format", 2, "#,#00.00#", "02.00"],
  ["Number.format", 2, "0.00", "2.00"],
  ["Number.format", 123456.789, "_", "123_457"],
  ["Number.format", 123456.789, "_.", "123_456.789"],
  ["Number.format", 123456.789, ".00", "123456.79"],
  ["Number.format", 123456.789, "$_0.00", "$123_456.79"],
  ["Number.format", -Infinity, "0.00", "-∞"],
  ["Number.format", 1e308, 1e308],
  ["Number.format", 1e309, Infinity],
  ["Number.format", 1010n, "$", "$1,010"],
  ["Number.duration", -36666666, "-10 hours"],
  ["Number.duration", 1, "1 millisecond"],
  ["Number.duration", 0, ""],
  ["Date.format", date, "2019-01-20T10:09:08" + offset],
  ["Date.format", date, undefined, "2019-01-20T10:09:08" + offset],
  ["Date.format", date, "", ""], // NOTE: this should return the default format
  ["Date.format", date, "YYYY/MM/DD hhhmmmsssSSSZ", "2019/01/20 10h09m08s000" + offset],
  ["Date.format", date, "QQ WW", "Q1 W3"],
  ["Date.format", date, "full", "Sunday, January 20, 2019"],
  ["Date.format", date, "long", "zh", "2019年1月20日"],
  ["Date.format", date, "medium", "Jan 20, 2019"],
  ["Date.format", date, "short", "1/20/19"],
  ["Date.format", date, "long, short", "January 20, 2019 at 10:09 AM"],
  ["Date.format", date, ", short", "10:09 AM"],
  ["Date.format", date, "year, month, day", "fr", "20 janvier 2019"],
  ["Date.format", date, "month, weekday, day, hour, minute, second", "Sunday, January 20 at 10:09:08 AM"],
  ["Date.format", date, "month, weekday, hour", "January Sunday at 10 AM"],
  ["Date.format", date, "hour, minute, second", "10:09:08 AM"],
  ["Date.format", date, "hour, minute", "10:09 AM"],
  ["Date.format", date, "hour", "10 AM"],
  ["Date.format", date, "minute", "9"],
  ["Date.format", date, "second", "8"],
  // ["Date.format", new Date("100000-01-01"), "YYYY-MM-DD hh:mm:ss Z", `100000-01-01 00:00:00 ${offset}`],
  // ["Date.format", new Date("0000-01-01"), "YYYY-MM-DD hh:mm:ss Z", "0000-01-01 04:28:12 +04:28"], // historical calendar adjustments
  // ["Date.format", new Date("-100000-01-01"), "YYYY-MM-DD hh:mm:ss Z", `-100000-01-01 04:28:12 +04:28`],
  // ["Date.format", new Date("100000-01-01"), "YYYY-MM-DD", `100000-01-01`],
  // ["Date.format", new Date("0000-01-01"), "YYYY-MM-DD", "0000-01-01"],
  // ["Date.format", new Date("-100000-01-01"), "YYYY-MM-DD", `-100000-01-01`],
  // ["Date.format", new Date(8640000000000000), "YYYY-MM-DD", `275760-09-13`],
  // ["Date.format", new Date(-8639977968000000), "YYYY-MM-DD", "-271821-12-31"],
  ["Date.format", new Date("Invalid"), "long", "-"],
  ["Date.format", new Date("Invalid"), "mon, hour, minute", "-"],
  ["Date.format", new Date("Invalid"), "YYYY/MM/DD", "-"],
  // https://sugarjs.com/dates/
  // https://github.com/tj/go-naturaldate/blob/master/naturaldate_test.go
  ["Date.parse", new Date("2000-01-01T00:00:00"), "now", new Date("2000-01-01T00:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "today", new Date("2000-01-01T00:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "yesterday", new Date("1999-12-31T00:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "tomorrow", new Date("2000-01-02T00:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "1 hour ago", new Date("1999-12-31T23:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "1 hour from now", new Date("2000-01-01T01:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "in one hour, two minutes and thirty-four seconds", new Date("2000-01-01T01:02:34")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "in two hours", new Date("2000-01-01T02:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "next hour", new Date("2000-01-01T01:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "last hour", new Date("1999-12-31T23:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "today 3pm", new Date("2000-01-01T15:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "yesterday at 3pm", new Date("1999-12-31T15:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "at 3pm", new Date("2000-01-01T15:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "4:45", new Date("2000-01-01T04:45:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "6:30:15pm in three days", new Date("2000-01-04T18:30:15")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "the 15th at 3pm", new Date("2000-01-15T15:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "next Tuesday", new Date("2000-01-04T00:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "last Sunday", new Date("1999-12-26T00:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "december 2nd", new Date("2000-12-02T00:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "the 4th of July", new Date("2000-07-04T00:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "last 7th of July at 4pm", new Date("1999-07-07T16:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "first Monday of July", new Date("2000-07-03T00:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "15th Monday of July", new Date("2000-07-17T00:00:00")], // NOTE: error would be better than this illogic result for this illogical input
  // ["Date.parse", new Date("2000-01-01T00:00:00"), "half an hour ago", new Date("1999-12-31T23:30:00")],
  // ["Date.parse", new Date("2000-01-01T00:00:00"), "end of February", new Date("2000-02-29T00:00:00")],
  // ["Date.parse", new Date("2000-01-01T00:00:00"), "8am PST", new Date("2000-01-01T" + offset)], // NOTE: UTC-7
  // ["Date.parse", new Date("2000-01-01T00:00:00"), "8am CST", new Date("2000-01-01T" + offset)], // NOTE: UTC+8
  // ["Date.parse", new Date("2000-01-01T00:00:00"), "18 Mar 2016", new Date("2016-03-18T00:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00:00"), "should throw an error at random string §@, but does nothing instead", new Date("2000-01-01T00:00:00")],
  ["Date.getWeek", new Date("2016-11-05T00:00"), 44], // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_the_week_number_from_a_month_and_day_of_the_month
  ["Date.getWeek", new Date("2000-01-01T00:00"), 52], // Saturday, Leep year
  ["Date.getWeek", new Date("2000-01-02T00:00"), 52],
  ["Date.getWeek", new Date("2000-01-03T00:00"), 1],
  ["Date.getWeek", new Date("2000-01-04T00:00"), 1],
  ["Date.getWeek", new Date("2000-01-11T00:00"), 2],
  ["Date.getWeek", new Date("2000-01-19T00:00"), 3],
  ["Date.getWeek", new Date("2000-01-27T00:00"), 4],
  ["Date.getWeek", new Date("2000-02-04T00:00"), 5],
  ["Date.getWeek", new Date("2000-02-12T00:00"), 6],
  ["Date.getWeek", new Date("2000-09-17T00:00"), 37],
  ["Date.getWeek", new Date("2000-12-17T00:00"), 50],
  ["Date.getWeek", new Date("2000-12-24T00:00"), 51],
  ["Date.getWeek", new Date("2000-12-31T00:00"), 52],
  ["Date.getWeek", new Date("2001-01-01T00:00"), 1], // Monday
  ["Date.getWeek", new Date("2002-01-01T00:00"), 1], // Tuesday
  ["Date.getWeek", new Date("2003-01-01T00:00"), 1], // Wednesday
  ["Date.getWeek", new Date("2004-01-01T00:00"), 1], // Thursday, Leep year
  ["Date.getWeek", new Date("2004-12-31T00:00"), 53], // Friday, Leep year
  ["Date.getWeek", new Date("2005-01-01T00:00"), 53], // Saturday
  ["Date.getWeek", new Date("2006-01-01T00:00"), 52], // Sunday
  ["Date.getLastDate", new Date("2000-02-01T00:00"), 29],
  ["Date.getQuarter", new Date("2018-04-01T00:00"), 2],
  ["Date.getTimezone", date, offset],
  ["Date.getTimezone", date, -540, "+09:00"],
  ["Date.setTimezone", date, offset, date],
  ["Date.setTimezone", new Date("2000-01-01T00:00" + offset.replace(/./, (m) => (m === "+" ? "-" : "+"))), "+05:00", new Date("2000-01-01T05:00:00Z")],
  ["Date.setTimezone", new Date("2000-01-02T00:00" + offset.replace(/./, (m) => (m === "+" ? "-" : "+"))), "-05:00", new Date("2000-01-01T19:00:00Z")],
  // ["Date.setTimezone", new Date("2000-01-01T00:00"), "Europe/Paris", new Date("2000-01-01T00:00")],
  // new Date("2000").plus("3 millisecond") //= new Date("2000-01-01T00:00:01.003Z")
  ["Date.plus", new Date("2000-01-01"), { milliseconds: 3 }, new Date("2000-01-01T00:00:00.003Z")],
  ["Date.plus", new Date("2000-01-01"), { days: 1 }, new Date("2000-01-02T00:00:00Z")],
  ["Date.plus", new Date("2000-01-01"), { weeks: 1 }, new Date("2000-01-08T00:00:00Z")],
  ["Date.plus", new Date("2000-01-01"), { quarters: 1 }, new Date("2000-04-01T00:00:00Z")],
  ["Date.plus", new Date("2000-01-01"), { months: 3 }, new Date("2000-04-01T00:00:00Z")],
  ["Date.plus", new Date("2000-01-01"), { months: 300 }, new Date("2025-01-01T00:00:00Z")],
  ["Date.plus", new Date("2020-01-01"), { years: 1, months: 1, hours: 1, minutes: 2, seconds: 3 }, new Date("2021-02-01T01:02:03Z")],
  ["Date.plus", new Date("2020-01-01"), "+1 year +1 month +1 hour +2 minute -3 seconds", new Date("2021-02-01T01:01:57Z")], //! DEPRECATED syntax
  ["Date.plus", new Date("2018-11-30T00:00"), { months: 3 }, new Date("2019-02-28T00:00")],
  ["Date.plus", new Date("2018-12-31T00:00"), { months: 1 }, new Date("2019-01-31T00:00")],
  ["Date.plus", new Date("2020-01-01T00:00"), { months: 1 }, new Date("2020-02-01T00:00")],
  ["Date.plus", new Date("2020-01-31T00:00"), { months: 1 }, new Date("2020-02-29T00:00")],
  ["Date.plus", new Date("2020-01-31T00:00"), "month", new Date("2020-02-29T00:00")],
  ["Date.plus", new Date("2020-02-29"), { months: 1 }, new Date("2020-03-29")], // NOTE: daylight saving time change
  ["Date.plus", new Date("2020-03-31"), { months: -1 }, new Date("2020-02-29")], // NOTE: daylight saving time change
  ["Date.plus", new Date("2016-02-29T00:00"), { years: 1.2 }, new Date("2017-02-28T00:00")],
  ["Date.plus", new Date("2016-02-29T00:00"), { years: "1.2" }, new Date("2017-02-28T00:00")],
  ["Date.plus", new Date("2016-02-29T00:00"), null, new Date("2016-02-29T00:00")],
  ["Date.plus", new Date("2016-02-29T00:00"), new Date("2016-02-29T00:00")],
  ["Date.plus", new Date("2016-02-29T00:00"), { year: 10 }, new Date("2016-02-29T00:00")], //* ignored options without plural
  ["Date.plus", new Date("2016-02-29T00:00"), { years: null }, new Date("2016-02-29T00:00")], //* ignored
  ["Date.plus", new Date("2016-02-29T00:00"), { years: 0 }, new Date("2016-02-29T00:00")], //* ignored
  ["Date.plus", new Date("2016-02-29T00:00"), { ignored: 1 }, new Date("2016-02-29T00:00")], //* ignored additional properties
  ["Date.plus", new Date("2020-01-01T00:00"), { months: 1.2 }, new Date("2020-02-01T00:00")], //* Expected behavior
  ["Date.plus", new Date("2020-01-31T00:00"), "1.2 month", new Date("2020-02-29T00:00")], //* Expected behavior //! DEPRECATED syntax
  ["Date.minus", new Date("2020-01-01T00:00"), "1 month", new Date("2019-12-01T00:00")],
  ["Date.minus", new Date("2020-02-29T00:00"), "1 year", new Date("2019-02-28T00:00")],
  ["Date.minus", new Date("2018-11-30T00:00"), "-3 month", new Date("2019-02-28T00:00")], //* Subtract negative number
  ["Date.start", new Date("2018-02-28T04:05:00Z"), "month", new Date("2018-02-01T00:00")],
  ["Date.start", new Date("2020-03-31T12:00"), "month", new Date("2020-03-01T00:00")], // NOTE: daylight saving time change
  // ["Date.start", new Date("2018-02-28T04:05:00"), "week", new Date("2018-02-25T00:00")], // NOTE: start on sunday or monday
  ["Date.end", new Date("2016-02-29T10:11:12Z"), "year", new Date("2016-12-31T23:59:59.999")],
  ["Date.relative", date, date, ""],
  ["Date.relative", new Date(+date - 1000), date, "1 second ago"], //* 1 second before
  ["Date.relative", new Date(+date + 2 * 60 * 60 * 1000), date, "2 hours from now"], //* 2 hours after
  ["RegExp.escape", /john@gmail.com/, /john@gmail\.com/],
  ["RegExp.replace", /john@gmail.com/, "@", "|", /john|gmail.com/],
  ["RegExp.plus", /QwErTy/msvy, "gim", /QwErTy/gimsvy],
  ["RegExp.minus", /QwErTy/i, "gi", /QwErTy/],
]
