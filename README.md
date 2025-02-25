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

---

## Examples

```js
// Import cut, and optionally expose window.cut and extend all prototypes
import "cut?window+prototype"

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

// Manipulate a Date
new Date("2000").plus("3 millisecond") //= new Date("2000-01-01T00:00:01.000Z")
new Date("2000").minus("1 year, 2 month") //= new Date("1998-11-01T00:00:00.000Z")
new Date("2000").start("year") //= new Date("1999-12-31T23:00:00.000Z")
new Date("2000").end("year") //= new Date("2000-12-31T22:59:59.000Z")

// Manipulate an Object or Array
const users = [
  { name: "John", age: 25, city: "Paris" },
  { name: "Jane", age: 30, city: "London" },
  { name: "Jack", age: 14, city: "New York" },
] //
const usersByCity = users.group("city")
const avgAgeByCity = usersByCity.map((g) => g.mean("age")) //= {"Paris":25,"London":30,"New York":14}

// Add a Function
cut(Array, "transpose", (arr) => arr[0].map((_, i) => arr.map((row) => row[i])))

// Add a shortcut
cut("shortcut", "transpose", {
  before(args) {
    if (args[0].some((row) => row.length !== args[0][0].length)) throw new Error("Not a matrix")
    return args
  },
})

// Add an alias
cut(Array, "swap", cut.Array.transpose)

// And use it
const matrix = [
  [1, 2, 3],
  [4, 5, 6],
]
matrix.swap() //= [[1,4],[2,5],[3,6]]
const invalid = [[1], [2, 3]]
invalid.transpose() //! Not a matrix
```

## Functions

| Object        | Array       | Function  | String     | Number   | Date        | RegExp |
| ------------- | ----------- | --------- | ---------- | -------- | ----------- | ------ |
| _keys_        | _map_       | decorate  | lower      | duration | relative    | escape |
| _values_      | _reduce_    | promisify | upper      | format   | getWeek     | plus   |
| _entries_     | _filter_    | partial   | capitalize |          | getQuarter  | minus  |
| _fromEntries_ | _find_      | memoize   | words      |          | getLastDate |        |
| map           | _findIndex_ | every     | format     |          | getTimezone |        |
| reduce        | _sort_      | wait      |            |          | format      |        |
| filter        | _reverse_   | debounce  |            |          | modify      |        |
| find          | group       | throttle  |            |          | plus        |        |
| findIndex     | unique      |           |            |          | minus       |        |
| access        | min         |           |            |          | start       |        |
| equal         | max         |           |            |          | end         |        |
| transform     | sum         |           |            |          |             |        |
|               | mean        |           |            |          |             |        |
|               | median      |           |            |          |             |        |

## Development

```bash
bun --watch cut.test.js
```

## Roadmap

- [x] Docs interactive: https://raw.githack.com/vbrajon/rawjs/cut/index.html
- [x] Test interactive: https://raw.githack.com/vbrajon/rawjs/cut/cutest.html
- [ ] Typescript
- [ ] Monaco Editor
- [ ] Blog Post / Hacker News / Product Hunt
- [ ] Every Array Fn
- [ ] Async/Iterator/Generator
