// SYNC TESTS
const users = [
  { name: "John Doe", age: 29 },
  { name: "Jane Doe", age: 22 },
  { name: "Janette Doe", age: 22 },
  { name: "Johnny Doe", age: 71, birthdate: new Date("Feb 26, 1932") },
]
const user = users[0]
const str = "i_am:The\n1\tAND , Only."
const date = new Date("2019-01-20T10:09:08")
const offset = ((offset = new Date().getTimezoneOffset()) => `${offset > 0 ? "-" : "+"}${("0" + ~~Math.abs(offset / 60)).slice(-2)}:${("0" + Math.abs(offset % 60)).slice(-2)}`)()
const mixed = [false, true, (x) => x, -1, 0, Infinity, [], { a: [{ b: 1 }] }, /a/gi, null, new Date("2020"), "a", undefined]
const mixedClone = [false, true, (x) => x, -1, 0, Infinity, [], { a: [{ b: 1 }] }, /a/gi, null, new Date("2020"), "a", undefined]
const testsSync = [
  //? Lodash _.is
  ["Generic.is", Array, [1], true],
  ["Generic.is", ArrayBuffer, new ArrayBuffer(1), true],
  ["Generic.is", Boolean, true, true],
  // ["Generic.is", Buffer, new Buffer(1), true],
  ["Generic.is", Date, new Date(), true],
  ["Generic.is", Error, new Error(), true],
  ["Generic.is", Function, () => 1, true],
  // ["Generic.is", Iterator, { [Symbol.iterator]() {} }, true], // TODO: fix
  ["Generic.is", Map, new Map(), true],
  ["Generic.is", NaN, NaN, true],
  ["Generic.is", null, null, true],
  ["Generic.is", Number, 1, true],
  ["Generic.is", 0n, BigInt, true], // TODO: the reverse is(0n, BigInt) works and is(BigInt, 1n) works
  ["Generic.is", {}, Object, true], // TODO: the reverse is({}, Object) works and is(Object, {}) works in chrome and safari
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
  ["Generic.is", 0n, "BigInt"],
  ["Generic.is", Infinity, "Number"],
  ["Generic.is", () => 1, "Function"],
  ["Generic.is", { [Symbol.iterator]() {} }, "Iterator"],
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
  ["Generic.access", { a: 1 }, (obj) => obj.a, 1], //* function path
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
  ["Array.fromEntries", Object.entries(user), user],
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
  ["Array.sort", users.slice(), "-age", [3, 0, 1, 2].map((i) => users[i])], //* desc string sort
  [
    "Array.sort",
    users.slice(),
    ["age", "-name"],
    [
      { name: "Janette Doe", age: 22 },
      { name: "Jane Doe", age: 22 },
      { name: "John Doe", age: 29 },
      { name: "Johnny Doe", age: 71, birthdate: new Date("Feb 26, 1932") },
    ],
  ], //* multi-sort with desc
  ["Array.sort", users.slice(), (v) => v.age, [1, 2, 0, 3].map((i) => users[i])],
  ["Array.sort", users.slice(), (a, b) => (a.age === b.age ? 0 : a.age > b.age ? 1 : -1), [1, 2, 0, 3].map((i) => users[i])],
  ["Array.sort", users.slice(), function() { return arguments[0].age === arguments[1].age ? 0 : arguments[0].age > arguments[1].age ? 1 : -1 }, [1, 2, 0, 3].map((i) => users[i])], // prettier-ignore
  ["Array.sort", [[null, 1], [1, 2], [null, 3]], [0, -1], [[1, 2], [null, 3], [null, 1]]], // prettier-ignore
  ["Array.sort", [[null, 1], [1, 2], [null, 3]], [v => v[0], -1], [[1, 2], [null, 3], [null, 1]]], // prettier-ignore
  ["Array.sort", [[null, 1], [1, 2], [null, 3]], [4, 5], [[null, 1], [1, 2], [null, 3]]], // prettier-ignore
  ["Array.sort", ["10 arbres", "3 arbres", "cafetière", "Café", "café", "Adieu"], ["3 arbres", "10 arbres", "Adieu", "café", "Café", "cafetière"]],
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
  ["Array.mean", [1, 2, 9], 4],
  ["Array.median", [1, 2, 9], 2],
  // NOTE: returning the initial object when using shortcut
  ["Array.unique", users, (v) => v.age, [users[0], users[1], users[3]]],
  ["Array.unique", users, "age", [users[0], users[1], users[3]]],
  ["Array.sum", users, "age", 144],
  ["Array.min", users, "age", users[1]],
  ["Array.max", users, "age", users[3]],
  ["Array.mean", users, "age", 36],
  ["Array.median", users, "age", 25.5],
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
  ["String.words", "Title Case kebab-case snake_case camelCase PascalCase 12NUM34ber56 lowerUPPERlower", ["Title", "Case", "kebab", "case", "snake", "case", "camel", "Case", "Pascal", "Case", "12", "NUM", "34", "ber", "56", "lower", "UPPERlower"]],
  ["String.format", "A.B", "lower", "a.b"],
  ["String.format", "A.B", "lowercase", "a.b"], //* alias
  ["String.format", "a.b", "upper", "A.B"],
  ["String.format", "a.b", "uppercase", "A.B"], //* alias
  ["String.format", "A.B", "capitalize", "A.b"],
  ["String.format", "hello world", "cap", "Hello world"], //* alias
  ["String.format", str, "kebab", "i-am-the-1-and-only"], //* alias
  ["String.format", str, "snake", "i_am_the_1_and_only"], //* alias
  ["String.format", "Title Case kebab-case snake_case camelCase PascalCase 12NUM34ber56 lowerUPPERlower", "-", "title-case-kebab-case-snake-case-camel-case-pascal-case-12-num-34-ber-56-lower-upperlower"],
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
  ["String.format", "{}{}{}{}", new Date("Invalid"), NaN, null, undefined, ""],
  ["Number.format", 0.1 * 3, "0.3"],
  ["Number.format", 0.1 * 3 * 1000, "300"],
  ["Number.format", 0.1 * 3 * 1000, 0, "300"],
  ["Number.format", 0.1 * 3 * 1000, "", "300"],
  ["Number.format", 1e308, "100" + ",000".repeat(306 / 3)],
  ["Number.format", 1e309, "∞"],
  ["Number.format", -0.000123456789, 1, "-100µ"],
  ["Number.format", 987654321000, 2, "990G"],
  ["Number.format", 0.1, "0.00", "0.10"],
  ["Number.format", 0.1, "00", "0.10"],
  ["Number.format", 0.1, ".", "0"],
  ["Number.format", 0.1, "+", "+0.1"],
  ["Number.format", 0.1, "%", "10%"],
  ["Number.format", 0.1, "E", "1E-1"],
  ["Number.format", 0.1, "$", "$0.10"],
  ["Number.format", 0.1, "USD", "$0.10"],
  ["Number.format", 0.1, "JPY", "¥0"],
  ["Number.format", 0.1, "CNY", "CN¥0.10"],
  ["Number.format", 0.1, "fr", "0,1"],
  ["Number.format", 0.1, "fr +0.00%", "+10,00 %"],
  ["Number.format", 0.1, "fr-CA +.CNY", "+0 CN¥"],
  ["Number.format", 0.1, "0.", "0"],
  ["Number.format", 0.1, ".0", "0.1"],
  ["Number.format", 1010.101, "1,010.101"],
  ["Number.format", 1010.101, ".E00", "1E03"],
  ["Number.format", 1010.101, "+00E+00", "+1.01E+03"],
  ["Number.format", 1010.101, "$", "$1,010.10"],
  ["Number.format", 1010.101, "USD", "$1,010.10"],
  ["Number.format", 1010.101, "en", "1,010.101"],
  ["Number.format", 1010.101, "fr-CA", "1 010,101"],
  ["Number.format", +1010.101, "+0,000,000.00", "+0,001,010.10"],
  ["Number.format", -1010.101, "+#,###,###.##", "-1,010.1"],
  ["Number.format", 1010, "$#,##0.00", "$1,010.00"],
  ["Number.format", 1010, "fr €", "1 010,00 €"],
  ["Number.format", 1010, "fr", { style: "currency", currency: "EUR" }, "1 010,00 €"],
  ["Number.format", 1010, "zh-TW", { style: "unit", unit: "kilometer-per-hour", unitDisplay: "narrow" }, "1,010公里/小時"],
  ["Number.format", 1010, "$.", "$1,010"],
  ["Number.format", 1010, "€ fr 000,000.##", "001 010,00 €"], // NOTE: in currency, at least 2 digit are expected so it takes precedence
  // ["Number.format", 1010.101, "# ###,00", "1 010,01"], // NOTE: previous syntax for custom separators
  // ["Number.format", -1, "000000.0000##", "-000001.0000"], // NOTE: previous syntax with no thousand separator
  // ["Number.format", 123456.789, "_", "123_457"],
  // ["Number.format", 0.1, "xx-invalid", "0.3"], // NOTE: returns 0
  ["Number.format", 123456.789, "00", "123,456.79"],
  ["Number.format", -Infinity, "00", "-∞"],
  ["Number.format", 1010n, "$", "$1,010.00"],
  ["Number.format", NaN, "-"],
  ["Number.format", NaN, 2, "-"],
  ["Number.format", NaN, "$", "-"],
  ["Number.duration", -36666666, "-10 hours"],
  ["Number.duration", 1, "1 millisecond"],
  ["Number.duration", 1000, "1 second"],
  ["Number.duration", 2000, "2 seconds"],
  ["Number.duration", 60000, "1 minute"],
  ["Number.duration", 3600000, "1 hour"],
  ["Number.duration", 86400000, "1 day"],
  ["Number.duration", 86400000 * 8, "1 week"],
  ["Number.duration", 86400000 * 33, "1 month"],
  ["Number.duration", 86400000 * 400, "1 year"],
  ["Number.duration", 0, ""],
  // short format
  ["Number.duration", 500, "short", "500ms"],
  ["Number.duration", -500, "short", "-500ms"],
  ["Number.duration", 1000, "short", "1s"],
  ["Number.duration", 10000, "short", "10s"],
  ["Number.duration", 60000, "short", "1m"],
  ["Number.duration", 3600000, "short", "1h"],
  ["Number.duration", 86400000, "short", "1d"],
  ["Number.duration", 604800000, "short", "1w"],
  ["Number.duration", 86400000 * 33, "short", "1mo"],
  ["Number.duration", 86400000 * 400, "short", "1y"],
  ["Number.duration", 0, "short", ""],
  // parse duration strings
  ["String.duration", "100", 100],
  ["String.duration", "1s", 1000],
  ["String.duration", "1 second", 1000],
  ["String.duration", "1 sec", 1000],
  ["String.duration", "1m", 60000],
  ["String.duration", "1 minute", 60000],
  ["String.duration", "1 min", 60000],
  ["String.duration", "1h", 3600000],
  ["String.duration", "1 hour", 3600000],
  ["String.duration", "1 hr", 3600000],
  ["String.duration", "2d", 172800000],
  ["String.duration", "2 days", 172800000],
  ["String.duration", "3w", 1814400000],
  ["String.duration", "1 week", 604800000],
  ["String.duration", "1mo", 2592000000],
  ["String.duration", "1 month", 2592000000],
  ["String.duration", "1y", 31536000000],
  ["String.duration", "1 year", 31536000000],
  ["String.duration", "1 yr", 31536000000],
  ["String.duration", "1.5h", 5400000],
  ["String.duration", ".5h", 1800000],
  ["String.duration", "-1h", -3600000],
  ["String.duration", "-1.5h", -5400000],
  ["String.duration", "-.5h", -1800000],
  ["String.duration", "1   s", 1000],
  ["String.duration", "1.5H", 5400000], //* case-insensitive
  ["String.duration", "100ms", 100],
  ["String.duration", "53 milliseconds", 53],
  ["String.duration", "17 msecs", 17],
  ["Date.format", date, "2019-01-20T10:09:08" + offset],
  ["Date.format", date, undefined, "2019-01-20T10:09:08" + offset],
  ["Date.format", date, "", "2019-01-20T10:09:08" + offset],
  ["Date.format", date, "YYYY/MM/DD hhhmmmsssSSSZ", "2019/01/20 10h09m08s000" + offset],
  ["Date.format", date, "QQ WW", "Q1 W3"],
  // NOTE: syntax alternative could be { date: "medium", time: "medium", locale: "zh" }.
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
  // ["Date.format", new Date("100000-01-01"), "YYYY-MM-DD hh:mm:ss Z", `100000-01-01 00:00 ${offset}`],
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
  // ["Date.parse", new Date(), "2020-Q2-02", new Date("2020-04-02T00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "now", new Date("2000-01-01T00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "today", new Date("2000-01-01T00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "yesterday", new Date("1999-12-31T00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "tomorrow", new Date("2000-01-02T00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "1 hour ago", new Date("1999-12-31T23:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "1 hour from now", new Date("2000-01-01T01:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "in one hour, two minutes and thirty-four seconds", new Date("2000-01-01T01:02:34")],
  ["Date.parse", new Date("2000-01-01T00:00"), "in two hours", new Date("2000-01-01T02:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "next hour", new Date("2000-01-01T01:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "last hour", new Date("1999-12-31T23:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "today 3pm", new Date("2000-01-01T15:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "yesterday at 3pm", new Date("1999-12-31T15:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "at 3pm", new Date("2000-01-01T15:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "4:45", new Date("2000-01-01T04:45:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "6:30:15pm in three days", new Date("2000-01-04T18:30:15")],
  ["Date.parse", new Date("2000-01-01T00:00"), "the 15th at 3pm", new Date("2000-01-15T15:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "next Tuesday", new Date("2000-01-04T00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "last Sunday", new Date("1999-12-26T00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "december 2nd", new Date("2000-12-02T00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "the 4th of July", new Date("2000-07-04T00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "last 7th of July at 4pm", new Date("1999-07-07T16:00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "first Monday of July", new Date("2000-07-03T00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "15th Monday of July", new Date("2000-07-17T00:00")], // NOTE: error would be better than this illogic result for this illogical input
  // ["Date.parse", new Date("2000-01-01T00:00"), "half an hour ago", new Date("1999-12-31T23:30:00")],
  // ["Date.parse", new Date("2000-01-01T00:00"), "end of February", new Date("2000-02-29T00:00")],
  // ["Date.parse", new Date("2000-01-01T00:00"), "8am PST", new Date("2000-01-01T" + offset)], // NOTE: UTC-7
  // ["Date.parse", new Date("2000-01-01T00:00"), "8am CST", new Date("2000-01-01T" + offset)], // NOTE: UTC+8
  // ["Date.parse", new Date("2000-01-01T00:00"), "18 Mar 2016", new Date("2016-03-18T00:00")],
  ["Date.parse", new Date("2000-01-01T00:00"), "should throw an error at random string §@, but does nothing instead", new Date("2000-01-01T00:00")],
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
  ["Date.getLastDate", new Date("2001-02-01T00:00"), 28], //* non-leap year
  ["Date.getLastDate", new Date("2000-02-01T00:00"), 29], //* leap year
  ["Date.getLastDate", new Date("2000-04-01T00:00"), 30], //* 30-day month
  ["Date.getLastDate", new Date("2000-01-01T00:00"), 31], //* 31-day month
  ["Date.getQuarter", new Date("2018-01-01T00:00"), 1],
  ["Date.getQuarter", new Date("2018-04-01T00:00"), 2],
  ["Date.getQuarter", new Date("2018-09-01T00:00"), 3],
  ["Date.getQuarter", new Date("2018-12-01T00:00"), 4],
  ["Date.getTimezone", date, offset],
  ["Date.getTimezone", date, -540, "+09:00"],
  ["Date.setTimezone", date, offset, date],
  ["Date.setTimezone", new Date("2000-01-01T00:00" + offset.replace(/./, (m) => (m === "+" ? "-" : "+"))), "+05:00", new Date("2000-01-01T05:00:00Z")],
  ["Date.setTimezone", new Date("2000-01-02T00:00" + offset.replace(/./, (m) => (m === "+" ? "-" : "+"))), "-05:00", new Date("2000-01-01T19:00:00Z")],
  // ["Date.setTimezone", new Date("2000-01-01T00:00"), "Europe/Paris", new Date("2000-01-01T00:00")],
  // new Date("2000").plus("3 millisecond") //= new Date("2000-01-01T00:00:01.003Z")
  ["Date.plus", new Date("2000-01-01T00:00"), { milliseconds: 3 }, new Date("2000-01-01T00:00:00.003")],
  ["Date.plus", new Date("2000-01-01T00:00"), { days: 1 }, new Date("2000-01-02T00:00")],
  ["Date.plus", new Date("2000-01-01T00:00"), { weeks: 1 }, new Date("2000-01-08T00:00")],
  ["Date.plus", new Date("2000-01-01T00:00"), { quarters: 1 }, new Date("2000-04-01T00:00")],
  ["Date.plus", new Date("2000-01-01T00:00"), { months: 3 }, new Date("2000-04-01T00:00")],
  ["Date.plus", new Date("2000-01-01T00:00"), { months: 300 }, new Date("2025-01-01T00:00")],
  ["Date.plus", new Date("2020-01-01T00:00"), { years: 1, months: 1, hours: 1, minutes: 2, seconds: 3 }, new Date("2021-02-01T01:02:03")],
  ["Date.plus", new Date("2020-01-01T00:00"), "+1 year +1 month +1 hour +2 minute -3 seconds", new Date("2021-02-01T01:01:57")], //! DEPRECATED syntax
  ["Date.plus", new Date("2018-11-30T00:00"), { months: 3 }, new Date("2019-02-28T00:00")],
  ["Date.plus", new Date("2018-12-31T00:00"), { months: 1 }, new Date("2019-01-31T00:00")],
  ["Date.plus", new Date("2020-01-01T00:00"), { months: 1 }, new Date("2020-02-01T00:00")],
  ["Date.plus", new Date("2020-01-31T00:00"), { months: 1 }, new Date("2020-02-29T00:00")],
  ["Date.plus", new Date("2020-01-31T00:00"), "month", new Date("2020-02-29T00:00")],
  ["Date.plus", new Date("2020-02-29T00:00"), { months: 1 }, new Date("2020-03-29T00:00")], // NOTE: daylight saving time change
  ["Date.plus", new Date("2020-03-31T00:00"), { months: -1 }, new Date("2020-02-29T00:00")], // NOTE: daylight saving time change
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
  ["Date.minus", new Date("2020-01-01T00:00"), { days: 1 }, new Date("2019-12-31T00:00")],
  ["Date.minus", new Date("2020-01-01T00:00"), { hours: 1 }, new Date("2019-12-31T23:00")],
  ["Date.minus", new Date("2020-01-01T00:00"), { years: 1, months: 1 }, new Date("2018-12-01T00:00")],
  ["Date.minus", new Date("2020-01-01T00:00"), null, new Date("2020-01-01T00:00")], //* no-op
  ["Date.minus", new Date("2018-11-30T00:00"), "-3 month", new Date("2019-02-28T00:00")], //* Subtract negative number
  ["Date.start", new Date("2018-02-28T04:05:00Z"), "month", new Date("2018-02-01T00:00")],
  ["Date.start", new Date("2020-03-31T12:00"), "month", new Date("2020-03-01T00:00")], // NOTE: daylight saving time change
  ["Date.start", new Date("2020-06-15T14:30:00"), "year", new Date("2020-01-01T00:00")],
  ["Date.start", new Date("2020-06-15T14:30:45"), "day", new Date("2020-06-15T00:00")],
  ["Date.start", new Date("2020-06-15T14:30:45"), "hour", new Date("2020-06-15T14:00:00")],
  ["Date.start", new Date("2020-06-15T14:30:45"), "minute", new Date("2020-06-15T14:30:00")],
  ["Date.start", new Date("2020-06-15T14:30:45.123"), "second", new Date("2020-06-15T14:30:45.000")],
  // ["Date.start", new Date("2018-02-28T04:05:00"), "week", new Date("2018-02-25T00:00")], // NOTE: start on sunday or monday
  ["Date.end", new Date("2016-02-29T10:11:12Z"), "year", new Date("2016-12-31T23:59:59.999")],
  ["Date.end", new Date("2020-06-15T10:00:00"), "month", new Date("2020-06-30T23:59:59.999")],
  ["Date.end", new Date("2020-06-15T14:30:00"), "day", new Date("2020-06-15T23:59:59.999")],
  ["Date.end", new Date("2020-06-15T14:30:00"), "hour", new Date("2020-06-15T14:59:59.999")],
  ["Date.end", new Date("2020-06-15T14:30:00"), "minute", new Date("2020-06-15T14:30:59.999")],
  ["Date.relative", date, date, ""],
  ["Date.relative", new Date(+date - 1000), date, "1 second ago"], //* 1 second before
  ["Date.relative", new Date(+date + 2 * 60 * 60 * 1000), date, "2 hours from now"], //* 2 hours after
  ["Date.relative", new Date(+date - 60000), date, "1 minute ago"],
  ["Date.relative", new Date(+date - 86400000 * 3), date, "3 days ago"],
  ["Date.relative", new Date(+date + 86400000 * 400), date, "1 year from now"],
  ["RegExp.escape", /john@gmail.com/, /john@gmail\.com/],
  ["RegExp.escape", /a$b(c)+d?e/, /a\$b\(c\)\+d\?e/],
  ["RegExp.replace", /john@gmail.com/, "@", "|", /john|gmail.com/],
  ["RegExp.plus", /QwErTy/msvy, "gim", /QwErTy/gimsvy],
  ["RegExp.plus", /abc/, "gi", /abc/gi],
  ["RegExp.plus", /abc/g, "g", /abc/g], //* duplicate flag is no-op
  ["RegExp.minus", /QwErTy/i, "gi", /QwErTy/],
  ["RegExp.minus", /abc/, "g", /abc/], //* removing non-existent flag is no-op
  ["RegExp.minus", /abc/gim, "gim", /abc/],
]
// ASYNC TESTS
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const testsAsync = [
  {
    name: "Function.wait",
    fn: async ({ wait }) => {
      const start = Date.now()
      const n = await wait(() => 1, 100)
      if (Date.now() - start < 100) throw new Error("Function.wait should wait 100ms")
      if (n !== 1) throw new Error("Function.wait should resolve the function and return 1")
    },
  },
  {
    name: "Function.every - limit",
    fn: async ({ every }) => {
      let n = 0
      const loop = every(() => n++, 100, 3) // immediate + runs every 100ms + stops after 3 times
      if (n !== 1) throw new Error(`Function.every should have been called immediately, n = ${n}`)
      await loop
      // if (n !== 2) throw new Error(`Function.every should yield next result and be called 2 times, n = ${n}`)
      // await loop
      // if (n !== 3) throw new Error(`Function.every should have been called 3 times, n = ${n}`)
      // await loop // should not hang
      // if (n !== 3) throw new Error(`Function.every should have been called 3 times, n = ${n}`)
    },
  },
  {
    name: "Function.every - stop",
    fn: async ({ every }) => {
      let n = 0
      const loop = every(() => n++, 100)
      await sleep(280) // immediate + runs every 100ms + stops after 280ms
      loop.stop()
      if (n !== 3) throw new Error(`Function.every should have been called 3 times, n = ${n}`)
    },
  },
  {
    name: "Function.debounce",
    fn: async ({ debounce }) => {
      let n = 0
      const inc = debounce((x) => (n += x), 100)
      inc(1) // skipped
      inc(2) // skipped
      inc(3) // delayed
      if (n !== 0) throw new Error(`Function.debounce should wait before calling the fn, n = ${n}`)
      await sleep(100)
      if (n !== 3) throw new Error(`Function.debounce should call the fn after 100ms, n = ${n}`)
    },
  },
  {
    name: "Function.throttle",
    fn: async ({ throttle }) => {
      let n = 0
      const inc = throttle((x) => (n += x), 100)
      inc(1) // immediate
      inc(2) // skipped
      inc(3) // planned
      if (n !== 1) throw new Error(`Function.throttle should call immediatly the fn, n = ${n}`)
      await sleep(100)
      if (n !== 4) throw new Error(`Function.throttle should have called the next fn after 100ms, n = ${n}`)
    },
  },
  // {
  //   name: "Promise.map",
  //   fn: async (fn) => {
  //     let n = 0
  //     const inc = (x) => new Promise((resolve) => setTimeout(() => resolve((n += x)), 100))

  //     const all = await Promise.all([1, 2].map(inc))
  //     if (n !== 3) throw new Error(`Promise.all should be awaitable, n = ${n}`)
  //     if (all.length !== 2) throw new Error(`Promise.all should return 2 elements`)
  //     n = 0

  //     const map = await fn([1, 2], inc)
  //     if (n !== 3) throw new Error(`Promise.map should be awaitable, n = ${n}`)
  //     if (map.length !== 2) throw new Error(`Promise.map should return 2 elements`)
  //     n = 0

  //     fn([1, 2], inc)
  //     if (n !== 0) throw new Error(`Promise.map should start the first promise, n = ${n}`)
  //     await sleep(120)
  //     if (n !== 1) throw new Error(`Promise.map should start the second promise, n = ${n}`)
  //     await sleep(120)
  //     if (n !== 3) throw new Error(`Promise.map should be done, n = ${n}`)
  //   },
  // },
]
// CORE TESTS
const cutNormal = {
  name: "cut",
  versions: ["latest"],
  import: async (version) => {
    const module = await import("./cut")
    const cut = module.default
    const fns = {}
    for (const cname in cut.by.constructor) {
      if (cname === "shortcut") continue
      for (const fname in cut.by.constructor[cname]) {
        if (cut[fname] instanceof Function) fns[`${cname}.${fname}`] = fns[fname] = cut[fname][cname] || cut[fname]
      }
    }
    return fns
  },
}
const cutProto = {
  name: "cut-proto",
  versions: ["latest"],
  import: async (version) => {
    await import("./cut?proto")
    const fns = {}
    for (const fname in cut) {
      for (const cname in cut[fname]) {
        const fn = (x, ...args) => {
          if (x && x[fname]) return x[fname](...args)
          return cut[fname](x, ...args)
        }
        fns[fname] = fns[`Generic.${fname}`] = fns[`${cname}.${fname}`] = fn
      }
    }
    fns.proto = {}
    return fns
  },
}
const vanilla = {
  name: "vanilla",
  versions: ["es2022"],
  import: async (version) => {
    const { Temporal } = await import("@js-temporal/polyfill")
    return {
      "Object.map": (obj, fn) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, fn(v, k, obj)])),
      "Object.filter": (obj, fn) => Object.fromEntries(Object.entries(obj).filter(([k, v]) => fn(v, k, obj))),
      "Object.find": (obj, fn) => obj[Object.keys(obj).find((k, i, ks) => fn(obj[k], k, obj, i, ks))],
      "Object.findIndex": (obj, fn) => Object.keys(obj).find((k, i, ks) => fn(obj[k], k, obj, i, ks)),
      "Date.getWeek": (date) => Temporal.PlainDate.from({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }).weekOfYear,
    }
  },
}
const lodash = {
  name: "lodash-es",
  // versions: (await versionList("lodash-es"))
  //   .filter((v) => v.startsWith("4"))
  //   .reverse()
  //   .slice(-1)
  //   .reverse(),
  versions: ["4.17.21"],
  import: async (version) => {
    const module = await import("lodash-es")
    const fns = {
      // "Generic.is": (...args) => module[`is${args[1]?.name.replace(/./, (c) => c.toUpperCase())}`](...args),
      // "Generic.access": module.get,
      // "Generic.equal": module.isEqual, // NOTE: Functions and DOM are not supported
      // "Generic.transform": module.transform,
      "Object.keys": module.keys,
      "Object.values": module.values,
      "Object.entries": module.toPairs,
      "Object.fromEntries": module.fromPairs,
      "Object.map": (...args) => (args[0].constructor === Object ? module.mapValues(...args) : module.map(...args)),
      "Object.filter": (...args) => (args[0].constructor === Object ? module.pickBy(...args) : module.filter(...args)),
      "Object.find": module.find,
      "Object.findIndex": module.findKey,
      "Object.reduce": module.reduce,
      // "Array.map": module.map,
      // "Array.filter": module.filter,
      // "Array.find": module.find,
      // "Array.findIndex": module.findIndex,
      // "Array.reduce": module.reduce,
      // "Array.group": module.groupBy,
      // "Array.sort": module.sortBy,
      "Array.reverse": module.reverse,
      "Array.unique": module.uniqBy,
      "Array.sum": module.sumBy,
      "Array.min": module.minBy,
      "Array.max": module.maxBy,
      "Array.mean": module.meanBy,
      "Array.median": module.medianBy,
      // "Function.decorate": module.flow,
      // "Function.promisify": module.bind,
      // "Function.partial": module.partial,
      // "Function.memoize": module.memoize,
      // "String.words": module.words,
      "RegExp.escape": (...args) => RegExp(module.escapeRegExp(...args).slice(1, -1)),
    }
    for (const name in fns) {
      const [cname, fname] = name.split(".")
      fns[fname] = fns[name]
    }
    return fns
  },
}
const testNormal = {
  name: "proto - noMutation",
  fn: (cut) => {
    // DEFAULT BEHAVIOR
    const a = [3, 1, 2]
    a.reverse()
    if (a[0] === 3) throw new Error("Array.reverse should mutate the array")
    a.reverse()

    // SETUP
    cut.reverse = { Array: [].reverse, shortcut: (fn, arr) => fn(arr.slice()) }

    // UPDATED BEHAVIOR
    a.reverse()
    if (a[0] !== 3) throw new Error("Array.reverse should not mutate the array")

    // CLEANUP
    delete cut.reverse
    if (cut.reverse) throw new Error("cut.reverse still exists")
    if (cut.Array.reverse) throw new Error("cut.Array.reverse still exists")
    if (cut.shortcuts.reverse) throw new Error("cut.shortcuts.reverse still exists")

    // DEFAULT BEHAVIOR
    a.reverse()
    if (a[0] === 3) throw new Error("Array.reverse should mutate the array")
    a.reverse()
  },
}
const testWrap = {
  name: "proto - wrap",
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
}
const testSetup = {
  name: "proto - setup",
  fn: () => {
    // cut.Object.fake = 1 / 3
    // cut.shortcuts.fake = (x) => Math.round(x * 100)
    if (cut.mode !== "proto") throw new Error("cut.mode is not proto")
    cut("shortcut", "fake", (x) => Math.round(x * 100))
    cut(Number, "fake", 1 / 3)
    if ((0.1).fake() !== 33) throw new Error("Number.fake result is not 33 " + (0.1).fake())
    cut(Number, "fake", undefined)
    cut("shortcut", "fake", undefined)
    if (Number.fake) throw new Error("Number.fake still exists")
    if (Number.prototype.fake) throw new Error("Number.prototype.fake still exists")
    if (cut.fake) throw new Error("cut.fake still exists")
    if (cut.Number.fake) throw new Error("cut.Number.fake still exists")
    if (cut.shortcuts.fake) throw new Error("cut.shortcuts.fake still exists")

    cut(Array, "transpose", (arr) => arr[0].map((_, i) => arr.map((row) => row[i])))
    cut("shortcut", "transpose", (fn, arr) => {
      if (arr.some((row) => row.length !== arr[0].length)) throw new Error("Not a matrix")
      return fn(arr)
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
}
const testCleanup = {
  name: "proto - cleanup",
  fn: () => {
    for (let property in { a: 1 }) if (property !== "a") throw new Error(`Enumerable property ${property} still exists`)
    // if (Number.abs !== Math.abs) throw new Error("Number.abs !== Math.abs")
    cut("mode", "normal")
    if (Object.prototype.keys) throw new Error("Object.prototype.keys still exists")
    if (Object.prototype.map) throw new Error("Object.prototype.map still exists")
    if (Array.prototype._map) throw new Error("Array.prototype._map still exists")
    if (Array.map) throw new Error("Array.map still exists")
    if (Number.abs) throw new Error("Number.abs still exists")
    let error
    try {
      cut.format(1.23456789)
      cut.format("hello world")
      cut.format(new Date())
      cut.format(/1/)
    } catch (e) {
      error = e
    }
    if (!error || error.message !== "format does not exist on RegExp") throw new Error("cut.format does not throw on RegExp")
    const a = [3, 1, 2]
    cut("shortcut", "reverse", (fn, arr) => fn(arr.slice()))
    cut(Array, "reverse", [].reverse)
    cut.reverse(a)
    if (a[0] !== 3) throw new Error("cut.reverse should not mutate the array")
    a.reverse()
    if (a[0] === 3) throw new Error("Array.reverse should mutate the array")
  },
}
const testsProto = [testNormal, testSetup, testCleanup, testWrap]

// const registry = "https://registry.npmjs.org/"
// const versionList = async (pkg) => Object.keys((await (await fetch(registry + pkg)).json()).versions).reverse()

// NORMAL
export const packages = [cutNormal, lodash, vanilla]
export const tests = [...testsSync, ...testsAsync]

// // PROTO
// const packages = [cutProto, lodash, vanilla]
// const tests = [...testsSync, ...testsAsync, ...testsProto]
