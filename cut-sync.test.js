const users = [
  { name: "John Doe", age: 29 },
  { name: "Jane Doe", age: 22 },
  { name: "Janette Doe", age: 22 },
  { name: "Johnny Doe", age: 71, birthdate: new Date("Feb 26, 1932") },
]
const user = users[0]
const userAges = users.map((v) => v.age)
const userAgesAsc = [users[1], users[2], users[0], users[3]]
const str = "i_am:\nThe1\tAND, Only."
const date = new Date("2019-01-20T10:09:08")
const mixed = [[], -1, /a/gi, 0, Infinity, NaN, new Date("2020"), { a: [{ b: 1 }] }, "a", false, null, true, undefined]
const mixedClone = [[], -1, /a/gi, 0, Infinity, NaN, new Date("2020"), { a: [{ b: 1 }] }, "a", false, null, true, undefined]
// const shuffle = (arr, r) => (arr.forEach((v, i) => ((r = Math.floor(Math.random() * i)), ([arr[i], arr[r]] = [arr[r], arr[i]]))), arr)
// const mixedNative = [[], -1, /a/gi, 0, Infinity, NaN, new Date('2020'), { a: [{ b: 1 }] }, 'a', false, null, true, x => x, undefined]
// const mixedShuffled = shuffle([[], -1, /a/gi, 0, Infinity, NaN, new Date('2020'), { a: [{ b: 1 }] }, 'a', false, null, true, x => x, undefined])

export default [
  //? Lodash _.is
  ["Generic.is", [1], Array, true],
  ["Generic.is", new ArrayBuffer(1), ArrayBuffer, true],
  ["Generic.is", true, Boolean, true],
  // ["Generic.is", new Buffer(1), Buffer, true],
  ["Generic.is", new Date(), Date, true],
  ["Generic.is", new Error(), Error, true],
  ["Generic.is", () => 1, Function, true],
  ["Generic.is", new Map(), Map, true],
  ["Generic.is", NaN, NaN, true],
  ["Generic.is", null, null, true],
  ["Generic.is", 1, Number, true],
  ["Generic.is", {}, Object, true],
  ["Generic.is", /1/, RegExp, true],
  ["Generic.is", new Set(), Set, true],
  ["Generic.is", "str", String, true],
  ["Generic.is", Symbol(1), Symbol, true],
  ["Generic.is", undefined, undefined, true],
  ["Generic.is", new WeakMap(), WeakMap, true],
  ["Generic.is", new WeakSet(), WeakSet, true],
  //? Lodash _.is ignored: Arguments / ArrayLike / ArrayLikeObject / Element / Empty / Equal / EqualWith / Finite / Integer / Length / Match / MatchWith / Native / Nil / ObjectLike / PlainObject / SafeInteger / TypedArray
  ["Generic.is", null, "Null"],
  ["Generic.is", void 0, "Undefined"],
  ["Generic.is", undefined, "Undefined"],
  ["Generic.is", NaN, "NaN"],
  ["Generic.is", () => 1, "Function"],
  // { name: "Generic.is", fuzz: true, errors: [] },
  ["Generic.is", void 0, undefined, true],
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
  ["Generic.access", [{ a: { b: [1, 2, 3] } }], "0.a.b.length", 3],
  ["Generic.access", { a: { "b.c": 1 } }, 'a["b.c"]', 1],
  ["Generic.access", { a: { b: 1 } }, "a.b", 1],
  ["Generic.access", { a: { b: 1 } }, ["a", "b"], 1],
  ["Generic.access", { "a.b": 1 }, "a.b", 1],
  ["Generic.access", { "a.b": 1 }, ["a", "b"], undefined],
  ["Generic.access", { "a.b": 1 }, { "a.b": 1 }], // != lodash
  ["Generic.access", { "a.b": 1 }, null, { "a.b": 1 }], // != lodash
  ["Generic.access", { "a.b": 1 }, undefined, { "a.b": 1 }], // != lodash
  ["Generic.access", 1, 1, undefined],
  ["Generic.access", undefined],
  ["Generic.transform", 1, (v) => v * 2, 2], //* works also with primitives
  ["Generic.transform", [1], (v) => v * 2, [2]], //* equivalent to map when depth = 1
  ["Generic.transform", { a: 1 }, (v) => v * 2, { a: 2 }], //* equivalent to map when depth = 1
  ["Generic.transform", { a: 1, b: { c: 2, d: [3] } }, (v) => v * 2, { a: 2, b: { c: 4, d: [6] } }],
  ["Generic.transform", { a: 1, b: { c: 2, d: [3] } }, (v, path) => `${path.join(".")}=${v}`, { a: "a=1", b: { c: "b.c=2", d: ["b.d.0=3"] } }],
  // Object.difference

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
  ["Array.reduce", users, (acc, v, i) => acc.concat(i), [], [0, 1, 2, 3]],
  ["Array.reduce", users, (acc, v, i) => ((acc[i] = v), acc), [], users],
  ["Array.filter", [null, "a", undefined, /a/], ["a", /a/]],
  ["Array.filter", users, { name: /Ja/ }, [{ name: "Jane Doe", age: 22 }, { name: "Janette Doe", age: 22 }]], // prettier-ignore
  ["Array.filter", users, "name", users],
  ["Array.filter", [{ a: 1 }, { a: 2 }, { a: 3, b: 3 }], [{ a: (x) => x > 2 }, { b: 3 }, { a: 2 }], [{ a: 2 }, { a: 3, b: 3 }]],
  ["Array.find", users, { name: /Ja/ }, { name: "Jane Doe", age: 22 }],
  ["Array.find", [{ a: 1 }], { a: 1 }, { a: 1 }],
  ["Array.find", [{ a: 1 }, { a: 2 }], { a: [2, 3] }, { a: 2 }],
  ["Array.findIndex", [{ a: 1 }], { a: 1 }, 0],
  ["Array.group", users, (v) => "x", { x: users }],
  ["Array.group", [{ a: 1 }], "a", { 1: [{ a: 1 }] }],
  ["Array.group", [{ a: 1 }], "b", { undefined: [{ a: 1 }] }],
  ["Array.group", [{ a: 1, b: 2 }, { a: 1, b: 2 }], ["a", "b"], { 1: { 2: [{ a: 1, b: 2 }, { a: 1, b: 2 }] } }], // prettier-ignore
  ["Array.reverse", [1, 2, 3], [3, 2, 1]],
  ["Array.sort", userAges, [22, 22, 29, 71]],
  ["Array.sort", users, "age", userAgesAsc],
  ["Array.sort", users, (v) => v.age, userAgesAsc],
  ["Array.sort", users, (a, b) => (a.age === b.age ? 0 : a.age > b.age ? 1 : -1), userAgesAsc],
  ["Array.sort", users, function() { return arguments[0].age === arguments[1].age ? 0 : arguments[0].age > arguments[1].age ? 1 : -1 }, userAgesAsc], // prettier-ignore
  ["Array.sort", [[null, 1], [1, 2], [null, 3]], [0, -1], [[1, 2], [null, 3], [null, 1]]], // prettier-ignore
  ["Array.sort", [[null, 1], [1, 2], [null, 3]], [v => v[0], -1], [[1, 2], [null, 3], [null, 1]]], // prettier-ignore
  ["Array.sort", [[null, 1], [1, 2], [null, 3]], [4, 5], [[null, 1], [1, 2], [null, 3]]], // prettier-ignore
  ["Array.sort", ["10 arbres", "3 arbres", "réservé", "Cliché", "Premier", "communiqué", "café", "Adieu"], "fr", { numeric: true }, ["3 arbres", "10 arbres", "Adieu", "café", "Cliché", "communiqué", "Premier", "réservé"]], // prettier-ignore
  ["Array.unique", userAges, [29, 22, 71]],
  ["Array.sum", userAges, 144],
  ["Array.min", userAges, 22],
  ["Array.max", userAges, 71],
  ["Array.mean", userAges, 36],
  ["Array.median", userAges, 25.5],
  ["Array.median", [1, 2, 3], 2],
  {
    name: "Function.decorate",
    fn: (fn) => fn((x) => x)(1),
    output: 1,
  },
  {
    name: "Function.decorate",
    fn: (fn) => fn((x) => x, () => 2)(1), // prettier-ignore
    output: 2,
  },
  {
    name: "Function.decorate",
    fn: (fn) => fn((x) => x, { around: (fn, x) => fn(x * 2) * 2 })(1),
    output: 4,
  },
  {
    name: "Function.decorate",
    fn: (fn) => fn((x) => x, { before: (x) => x * 2 })(1),
    output: 2,
  },
  {
    name: "Function.decorate",
    fn: (fn) => fn((x) => x, { after: (x) => x * 2 })(1),
    output: 2,
  },
  {
    name: "Function.decorate",
    fn: (fn) => {
      const decorated = fn((x) => x, {})
      decorated.around = (fn, x) => 10
      return decorated()
    },
    output: 10,
  },
  {
    name: "Function.promisify",
    fn: async (fn) => {
      const expect1callback = (v, cb) => (v === 1 ? cb(null, "OK") : cb("KO", null))
      const promisified = fn(expect1callback)
      if ((await promisified(1)) !== "OK") throw new Error("Function.promisify should resolve the callback with the first argument")
      if ((await promisified(2).catch((e) => e)) !== "KO") throw new Error("Function.promisify should reject the callback with the second argument")
    },
  },
  {
    name: "Function.partial",
    fn: (fn) => fn((a, b) => [a, b], null, 2)(1),
    output: [1, 2],
  },
  // {
  //   name: "Function.partial",
  //   fn: (fn) => {
  //     function yolo() {
  //       console.log("You only live once !")
  //     }
  //     return fn(yolo).name
  //   },
  //   output: "partial_yolo",
  // },
  {
    name: "Function.memoize",
    fn: (fn) => {
      const memory = fn((x) => x / 2)
      memory(2)
      memory(2)
      return memory.cache["[2]"]
    },
    output: 1,
  },
  ["String.lower", "A.B", "a.b"],
  ["String.upper", "a.b", "A.B"],
  ["String.capitalize", "A.B", "A.b"],
  ["String.words", str, ["i", "am", "The", "1", "AND", "Only"]],
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
  ["Number.format", 0.1 * 3 * 1000, "invalid-lang", "300"],
  ["Number.format", -0.000123456789, 1, "-100µ"],
  ["Number.format", 123456789000, 2, "120G"],
  ["Number.format", 1, 10, "1"],
  ["Number.format", 1010.0101, "en", "1,010.01"],
  ["Number.format", 1010.0101, "fr", "1 010,01"],
  ["Number.format", 1010.0101, "de", "1.010,01"],
  ["Number.duration", -36666666, "-10 hours"],
  ["Number.duration", 1, "1 millisecond"],
  ["Number.duration", 0, ""],
  ["Date.format", date, "2019-01-20T10:09:08+01:00"],
  ["Date.format", date, "YYYY/MM/DD hhhmmmsssSSSZ", "2019/01/20 10h09m08s000+01:00"],
  ["Date.format", date, "QQ WW", "Q1 W3"],
  ["Date.format", date, "full", "Sunday, January 20, 2019"],
  ["Date.format", date, "long", "zh", "2019年1月20日"],
  ["Date.format", date, "medium", "Jan 20, 2019"],
  ["Date.format", date, "short", "1/20/19"],
  ["Date.format", date, "long, short", "January 20, 2019 at 10:09 AM"],
  ["Date.format", date, ", short", "10:09 AM"],
  ["Date.format", date, "day, month, year", "fr", "20 janvier 2019"],
  ["Date.format", date, "month, day, weekday, hour, minute, second", "Sunday, January 20 at 10:09:08 AM"],
  ["Date.format", date, "mon, wday, hour", date.toLocaleString("en", { month: "short", weekday: "short", hour: "2-digit" })],
  ["Date.format", date, "hour, minute, second", "10:09:08"],
  ["Date.format", date, "hour", "10:09:08"],
  ["Date.format", date, "minute", "09:08"],
  ["Date.format", date, "second", "08"],
  // new Date(8640000000000000).toISOString()
  // new Date("275760/09/13 02:00:00")
  ["Date.format", new Date("2019-01-01 00:00"), "YYYY-MM-DD hh:mm:ss Z", "2019-01-01 00:00:00 +01:00"],
  ["Date.format", new Date("Invalid"), "long", "-"],
  ["Date.format", new Date("Invalid"), "mon, wday, hour, minute", "-"],
  ["Date.format", new Date("Invalid"), "YYYY/MM/DD", "-"],
  ["Date.getWeek", new Date("2016-11-05"), 44], // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_the_week_number_from_a_month_and_day_of_the_month
  ["Date.getWeek", new Date("2000-01-01"), 52], // Saturday, Leep year
  ["Date.getWeek", new Date("2000-01-02"), 52],
  ["Date.getWeek", new Date("2000-01-03"), 1],
  ["Date.getWeek", new Date("2000-01-04"), 1],
  ["Date.getWeek", new Date("2000-01-11"), 2],
  ["Date.getWeek", new Date("2000-01-19"), 3],
  ["Date.getWeek", new Date("2000-01-27"), 4],
  ["Date.getWeek", new Date("2000-02-04"), 5],
  ["Date.getWeek", new Date("2000-02-12"), 6],
  ["Date.getWeek", new Date("2000-09-17"), 37],
  ["Date.getWeek", new Date("2000-12-17"), 50],
  ["Date.getWeek", new Date("2000-12-24"), 51],
  ["Date.getWeek", new Date("2000-12-31"), 52],
  ["Date.getWeek", new Date("2001-01-01"), 1], // Monday
  ["Date.getWeek", new Date("2002-01-01"), 1], // Tuesday
  ["Date.getWeek", new Date("2003-01-01"), 1], // Wednesday
  ["Date.getWeek", new Date("2004-01-01"), 1], // Thursday, Leep year
  ["Date.getWeek", new Date("2004-12-31"), 53], // Friday, Leep year
  ["Date.getWeek", new Date("2005-01-01"), 53], // Saturday
  ["Date.getWeek", new Date("2006-01-01"), 52], // Sunday
  ["Date.getLastDate", new Date("2000-02-01"), 29],
  ["Date.getQuarter", new Date("2018-04-01"), 2],
  ["Date.getTimezone", new Date(), -540, "+09:00"],
  ["Date.getTimezone", new Date(), +240, "-04:00"],
  ["Date.plus", new Date("2020-01-01T00:00:00"), { years: 1, months: 1, hours: 1, minutes: 2, seconds: 3 }, new Date("2021-02-01T01:02:03")],
  ["Date.plus", new Date("2018-11-30"), { months: 3 }, new Date("2019-02-28")],
  ["Date.plus", new Date("2018-12-31"), { months: 1 }, new Date("2019-01-31")],
  ["Date.plus", new Date("2020-01-01"), { months: 1 }, new Date("2020-02-01")],
  ["Date.plus", new Date("2020-01-31"), { months: 1 }, new Date("2020-02-29")],
  ["Date.plus", new Date("2020-01-31"), "month", new Date("2020-02-29")],
  ["Date.plus", new Date("2020-02-29"), { months: 1 }, new Date("2020-03-29")],
  ["Date.plus", new Date("2020-03-31"), { months: -1 }, new Date("2020-02-29")],
  ["Date.plus", new Date("2016-02-29"), { years: 1.2 }, new Date("2017-02-28")],
  ["Date.plus", new Date("2016-02-29"), { years: "1.2" }, new Date("2017-02-28")],
  ["Date.plus", new Date("2016-02-29"), null, new Date("2016-02-29")],
  ["Date.plus", new Date("2016-02-29"), new Date("2016-02-29")],
  ["Date.plus", new Date("2016-02-29"), { year: 10 }, new Date("2016-02-29")], //* ignored options without plural
  ["Date.plus", new Date("2016-02-29"), { years: null }, new Date("2016-02-29")], //* ignored
  ["Date.plus", new Date("2016-02-29"), { years: 0 }, new Date("2016-02-29")], //* ignored
  ["Date.plus", new Date("2016-02-29"), { ignored: 1, milliseconds: 1, and: 1, quarters: 1 }, new Date("2016-02-29")], //* ignored additional properties
  ["Date.plus", new Date("2020-01-01"), { months: 1.2 }, new Date("2020-02-01")], //* Expected behavior
  ["Date.plus", new Date("2020-01-31"), "1.2 month", new Date("2020-02-29")], //* Expected behavior //! DEPRECATED syntax
  ["Date.plus", new Date("2020-01-01T00:00:00"), "+1 year +1 month +1 hour +2 minute -3 seconds", new Date("2021-02-01T01:01:57")], //! DEPRECATED syntax
  ["Date.minus", new Date("2020-01-01"), "1 month", new Date("2019-12-01")],
  ["Date.minus", new Date("2020-02-29"), "1 year", new Date("2019-02-28")],
  ["Date.minus", new Date("2018-11-30"), "-3 month", new Date("2019-02-28")], //* Subtract negative number
  ["Date.start", new Date("2018-02-28T04:05:00"), "month", new Date("2018-02-01T00:00:00")],
  // ["Date.start", new Date("2018-02-28T04:05:00"), "week", new Date("2018-02-01T00:00:00")], // NOTE: start on sunday or monday
  ["Date.end", new Date("2016-02-29T10:11:12"), "year", new Date("2016-12-31T23:59:59")],
  ["Date.relative", date, date, ""],
  ["Date.relative", new Date(+date - 1000), date, "1 second ago"], //* 1 second before
  ["Date.relative", new Date(+date + 2 * 60 * 60 * 1000), date, "2 hours from now"], //* 2 hours after
  {
    name: "RegExp.escape",
    fn: (fn) => fn(/john@gmail.com/).source,
    output: "john@gmail\\.com",
  },
  {
    name: "RegExp.plus",
    fn: (fn) => fn(/QwErTy/, "i").flags,
    output: "i",
  },
  {
    name: "RegExp.minus",
    fn: (fn) => fn(/QwErTy/, "i").flags,
    output: "",
  },
]
