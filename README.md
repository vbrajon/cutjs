<p align="center">
  <a href="https://raw.githack.com/vbrajon/rawjs/cut/index.html" target="_blank">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/vbrajon/rawjs/cut/logo-dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/vbrajon/rawjs/cut/logo-light.svg">
      <img alt="Cut JS" src="https://raw.githubusercontent.com/vbrajon/rawjs/cut/logo-light.svg" width="350" height="70" style="max-width: 100%;">
    </picture>
  </a>
</p>

<p align="center">
  A shortcut utility JS library for rapidly interacting with objects, dates, and functions.
</p>

<!-- prettier-ignore -->
```js
// Normal use
import { map } from "cut"
map({ a: 1 }, (v) => v + 1) //= {"a":2}

// Proxy use, access .data or .error
import cut from "cut"
cut({ a: 1 }).map((v) => v + 1).data //= {"a":2}
cut({ a: 1 }).x.y.error //= new Error()

// Prototype use, call directly on the object
import "cut?window+prototype"
({ a: 1 }).map((v) => v + 1) //= {"a":2}

// Format a Date
new Date("2000").format() //= "2000-01-01T01:00:00+01:00"
new Date("2000").format("YYYY-QQ") //= "2000-Q1"
new Date("2000").format("day, month, year", "en") //= "January 1, 2000"

// Format a String
"hello_world".format() //= "Hello World"
"hello_world".format("camel") //= "helloWorld"
"{}_{}".format(["hello", "world"]) //= "hello_world"

// Format a Number
0.30000000000000004.format() //= 0.3
123456.789.format(2) //= "120k"
123456.789.format("en") //= "123,456.789"
123456.789.format("$") //= "$123,456.79"
123456.789.format("_", ".") //= "123_456.789"

// Manipulate a Date
new Date("2000").plus("1 month").end("month").format() //= "2000-02-29T23:59:59+01:00"
new Date("2000").minus({ years: 1, months: 2 }).plus("1 year, 2 months") //= new Date("2000-01-01T00:00:00.000Z")

// Manipulate an Object or Array
const users = [
  { name: "John", age: 30, city: "London" },
  { name: "Jane", age: 14, city: "New York" },
  { name: "Jean", age: 35, city: "Paris" },
]
const usersByCity = users.sort("-age").group("city") //~ {"Paris":[{"name":"Jean","age":35...}
const avgAgeByCity = usersByCity.map((g) => g.mean("age")) //~ {"Paris":35...}

// Add a Function
cut(Array, "transpose", (arr) => arr[0].map((_, i) => arr.map((row) => row[i])))

// Add a shortcut
cut("shortcut", "transpose", {
  before(args) {
    const arr = args[0]
    if (arr.some((row) => row.length !== arr[0].length)) throw new Error("Not a matrix")
    return args
  },
})

// Add an alias
cut(Array, "swap", cut.Array.transpose)

// And use it
const matrix = [[1, 2, 3], [4, 5, 6]]
matrix.swap() //= [[1,4],[2,5],[3,6]]
const invalid = [[1], [2, 3]]
invalid.transpose() //! Not a matrix
```

## Functions

| Generic   | Object        | Array       | Function  | String     | Number   | Date        | RegExp |
| --------- | ------------- | ----------- | --------- | ---------- | -------- | ----------- | ------ |
| is        | _keys_        | _map_       | decorate  | lower      | duration | relative    | escape |
| equal     | _values_      | _reduce_    | promisify | upper      | format   | getWeek     | plus   |
| access    | _entries_     | _filter_    | partial   | capitalize |          | getQuarter  | minus  |
| transform | _fromEntries_ | _find_      | memoize   | words      |          | getLastDate |        |
|           | map           | _findIndex_ | every     | format     |          | getTimezone |        |
|           | reduce        | _sort_      | wait      |            |          | format      |        |
|           | filter        | _reverse_   | debounce  |            |          | modify      |        |
|           | find          | group       | throttle  |            |          | plus        |        |
|           | findIndex     | unique      |           |            |          | minus       |        |
|           |               | min         |           |            |          | start       |        |
|           |               | max         |           |            |          | end         |        |
|           |               | sum         |           |            |          |             |        |
|           |               | mean        |           |            |          |             |        |
|           |               | median      |           |            |          |             |        |

## Development

```bash
bun --watch cutest.run.js
```

## Roadmap

- [x] Interactive Docs & Tests: https://raw.githack.com/vbrajon/rawjs/cut/index.html
- [ ] Replace cutest by bun test
- [ ] Iterator or AsyncIterator
- [ ] Additional Fn (forEach, findIndex, findLastIndex, some, every, flat, flatMap, reduceRight, concat, slice)
- [ ] Fuzzy tests
- [ ] Typescript / TSDoc
- [ ] Monaco Editor
- [ ] Collaboration / Multiplayer / CTRL-S to PR
- [ ] Blog Post / Hacker News / Product Hunt

---

- [lodash](https://lodash.com/) or [underscore](https://underscorejs.org/) or [just](https://anguscroll.com/just/) or [sugar](https://sugarjs.com/)
- [date-fns](https://date-fns.org/) or [moment](https://momentjs.com/) or [dayjs](https://day.js.org/) or [tempo](https://tempo.formkit.com/)
- [ixjs](https://github.com/ReactiveX/IxJS) or [rxjs](https://rxjs.dev/)
- [mathjs](https://mathjs.org/)
- [xstate](https://xstate.js.org/)
- [motion](https://motion.dev/)
- [microdiff](https://github.com/AsyncBanana/microdiff)
