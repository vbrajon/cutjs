<p align="center">
  <a href="https://cutjs.com" target="_blank">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://cutjs.com/logo-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://cutjs.com/logo-light.svg">
      <img alt="Cut JS Logo" src="https://cutjs.com/logo-light.svg" width="350" height="70" style="max-width: 100%;">
    </picture>
  </a>
</p>

<p align="center">
  JS utilities, extensible, dependency-free, to format and manipulate anything.
</p>

<!-- prettier-ignore -->
```js
/**

Cut JS - https://cutjs.com

JS utilities, extensible, dependency-free, to format and manipulate anything.

Play with it here or in the TS Playground https://tsplay.dev/cutjs

*/

// Normal use
import { map } from "cutjs"
map({ a: 1 }, (v) => v + 1) //= {"a":2}

// Proxy use, access .data or .error
import cut from "cutjs"
cut({ a: 1 }).map((v) => v + 1).data //= {"a":2}
cut({ a: 1 }).x.y.error //= new Error()

// Prototype use, call directly on the object
import "cutjs?window+prototype"
({ a: 1 }).map((v) => v + 1) //= {"a":2}

// Format a Date
new Date("2000").format("YYYY-QQ") //= "2000-Q1"
new Date("2000").format("day, month, year", "en") //= "January 1, 2000"
new Date("2000T00:00").format("long, short", "ja") //= "2000年1月1日 0:00"

// Format a String
"hello_world".format() //= "Hello World"
"hello_world".format("camel") //= "helloWorld"
"{}_{}".format(["hello", "world"]) //= "hello_world"

// Format a Number
0.30000000000000004.format() //= "0.3"
0.111.format("+0.##%") //= "+11.1%"
123456.789.format(2) //= "120k"
123456.789.format(".") //= "123,457"
123456.789.format("CN¥") //= "CN¥123,456.79"

// Parse a Date Expression
new Date("2000T00:00").parse("tomorrow") //= new Date("2000-01-02T00:00:00+01:00")
new Date("2000T00:00").parse("yesterday at 3pm") //= new Date("1999-12-31T15:00:00+01:00")
new Date("2000T00:00").parse("in one hour, two minutes and thirty-four seconds") //= new Date("2000-01-01T01:02:34+01:00")
new Date("2000T00:00").parse("6:30pm in three days") //= new Date("2000-01-04T18:30:00+01:00")

// Manipulate a Date
new Date("2000T00:00").plus("1 month").end("month").format("YYYY-MM-DD hh:mm") //= "2000-02-29 23:59"
new Date("2000T00:00").minus({ years: 1, months: 2 }).plus("1 year, 2 months").format("YYYY-MM-DD hh:mm") //= "2000-01-01 00:00"

// Manipulate an Object or Array
const users = [
  { name: "John", age: 30, city: "London" },
  { name: "Jane", age: 14, city: "New York" },
  { name: "Jean", age: 35, city: "Paris" },
]
const usersByCity = users.sort("-age").group("city") //~ {"Paris":[{"name":"Jean","age":35...}
const avgAgeByCity = usersByCity.map((g) => g.mean("age")) //~ {"Paris":35...}

// Manipulate a Function
const event = onEvent.throttle(1000).debounce(500)
const cache = expensiveFn.memoize()
const _fetch = fetch.decorate((fn, url, options) => {
  const timeout = options?.timeout || 5000
  const timer = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeout))
  return Promise.race([fn(url, options), timer])
})

// Add a Function
cut(Array, "transpose", (arr) => arr[0].map((_, i) => arr.map((row) => row[i])))

// Add a shortcut
cut("shortcut", "transpose", (fn, arr) => {
  if (arr.some((row) => row.length !== arr[0].length)) throw new Error("Not a matrix")
  return fn(arr)
})

// Add an alias
cut(Array, "swap", cut.Array.transpose)

// And use it
const matrix = [[1, 2, 3], [4, 5, 6]]
matrix.swap() //= [[1,4],[2,5],[3,6]]
const invalid = [[1], [2, 3]]
invalid.transpose() //! Error: Not a matrix
```

## Functions

<!-- Object.keys(cut.constructors).map(c => `- ${c}: ${Object.keys(cut[c]).map(k => k).join(", ")}`).join("\n") -->

- Generic: is, equal, access, transform
- Object: keys, values, entries, fromEntries, map, reduce, filter, find, findIndex
- Array: map, reduce, filter, find, findIndex, sort, group, unique, min, max, sum, mean, median
- Function: decorate, promisify, partial, memoize, every, wait, debounce, throttle
- String: words, format
- Number: duration, format
- Date: relative, getWeek, getQuarter, getLastDate, getTimezone, setTimezone, parse, format, modify, plus, minus, start, end
- RegExp: escape, replace, plus, minus

## Development

```bash
bun install --no-save fast-check lodash-es @js-temporal/polyfill
bun test --watch --concurrent --coverage --only-failures
bunx prettier --write .
```

## Principles

1. **Shortcuts**: Easy extension for input or error handling through decorators.
   ```js
   // The "sort" function has a shortcut to handle different input types and convert them to the proper input
   const users = await fetch("https://jsonplaceholder.typicode.com/users")
   sort(users, "name") // accepts a string to sort by the property
   sort(users, "-address.city") // accepts a string with "-" to sort in descending order and "." to access nested properties
   sort(users, (v) => v.name) // accepts a function of length 1
   sort(users, ["-address.city", (v) => v.name]) // accepts an array for multi-sorting
   ```
2. **Simplicity**: Few core functions, easy to use and understand.
   ```js
   // Object: map, reduce, filter, find (and other equivalent Array functions)
   // Array: sort, group, unique, min, max, sum, mean, median
   // String: format
   // Number: format
   // Date: format, parse, plus, minus, start, end
   ```
3. **Union**: Functions with the same name are combined into a single function that handles multiple types.
   ```js
   // The "format" function is defined for String, Number, and Date
   format("hello world", "capitalize") //= "Hello world"
   format(123456.789, "$") //= "$123,456.79"
   format(new Date("2000"), "YYYY") //= "2000"
   ```
4. **Powerful**: Few core functions that cover most use cases, removing the need for additional libraries like lodash, date-fns, or numfmt.

## Roadmap

- [ ] BLOG: Post / X / Hacker News / Product Hunt
- [ ] CODE: Typescript / TSDoc or JSDoc
- [ ] CODE: Versionning per function v1 2025-10 (1.2025.10), add tests per version
- [ ] DOC: comparison / benchmark with vanilla, lodash, date-fns, numfmt visible on the editor
- [ ] DOC: per function, from Markdown or TSDoc, like motion.dev or sugarjs.com
- [ ] PLAY: Button for Source Code + size / Gzip size
- [ ] PLAY: Collaboration / Multiplayer / CTRL-S to Share Link or Submit PR
- [ ] PLAY: AI Copilot
- [ ] PLAY: Monaco Editor or Github.dev like
- [ ] CODE: Additional Fn (forEach, findIndex, findLastIndex, some, every, flat, flatMap, reduceRight, concat, slice)
- [ ] EXPERIMENT: Iterator or AsyncIterator
- [x] EXPERIMENT: Fuzzy tests
- [ ] EXPERIMENT: Security tests
- [ ] EXPERIMENT: LSP for test runner
- [ ] EXPERIMENT: Registry / Composition / Distribution with AI as a Shadcn or v0 registry

## Inspiration

- utils [lodash](https://lodash.com/)
- utils [underscore](https://underscorejs.org/)
- utils [sugar](https://sugarjs.com/)
- utils [just](https://anguscroll.com/just/)
- date [date-fns](https://date-fns.org/)
- date [moment](https://momentjs.com/)
- date [dayjs](https://day.js.org/)
- date [tempo](https://tempo.formkit.com/)
- [d3](https://d3js.org/)
- [jquery](https://jquery.com/)
- [ixjs](https://github.com/ReactiveX/IxJS)
- [rxjs](https://rxjs.dev/)
- [most](https://mostcore.rtfd.io/)
- [ramda](https://ramdajs.com/)
- [mathjs](https://mathjs.org/)
- [xstate](https://xstate.js.org/)
- [motion](https://motion.dev/)
- [microdiff](https://github.com/AsyncBanana/microdiff)
- [numfmt](https://npmjs.com/package/numfmt)
- [sheetjs](https://sheetjs.com/)
- [o-spreadsheet](https://github.com/odoo/o-spreadsheet)
