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

## Example

```js
import { map, sum, group } from "cut"
const users = [
  { name: "John", age: 25, city: "Paris" },
  { name: "Jane", age: 30, city: "London" },
  { name: "Jack", age: 20, city: "New York" },
]
const names = map(users, "name") // ["John", "Jane", "Jack"]
const ageSum = sum(users, "age") // 75
const byCity = group(users, "city") // { Paris: [John], London: [Jane], New York: [Jack] }
const populationByCity = map(byCity, "length") // { Paris: 1, London: 1, New York: 1 }
```

and extend with your own functions or shortcuts:

```js
// Extending Function as follow
cut(Array, "transpose", (arr) => arr[0].map((_, i) => arr.map((row) => row[i])))
// Add a shortcut with:
cut("shortcut", "transpose", {
  before(args) {
    if (args[0].some((row) => row.length !== args[0][0].length)) throw new Error("Not a matrix")
    return args
  },
})
// Add an alias with:
cut(Array, "swap", cut.Array.transpose)
// Then use it with:
const matrix = [
  [1, 2, 3],
  [4, 5, 6],
]
cut.swap(matrix)
// or
cut(matrix).swap()
// or
cut("mode", "prototype")
matrix.swap()
```

## Functions

| Object        | Array       | Function  | String     | Number   | Date        | RegExp |
| ------------- | ----------- | --------- | ---------- | -------- | ----------- | ------ |
| _keys_        | _map_       | decorate  | lower      | duration | relative    | escape |
| _values_      | _reduce_    | promisify | upper      | format   | getWeek     | plus   |
| _entries_     | _filter_    | partial   | capitalize | abs      | getQuarter  | minus  |
| _fromEntries_ | _find_      | memoize   | words      | acos     | getLastDate |        |
| map           | _findIndex_ | every     | format     | asin     | getTimezone |        |
| reduce        | _sort_      | wait      |            | atan     | format      |        |
| filter        | _reverse_   | debounce  |            | acosh    | modify      |        |
| find          | group       | throttle  |            | asinh    | plus        |        |
| findIndex     | unique      |           |            | atanh    | minus       |        |
| access        | min         |           |            | atan2    | start       |        |
| equal         | max         |           |            | cbrt     | end         |        |
| traverse      | sum         |           |            | ceil     |             |        |
|               | mean        |           |            | clz32    |             |        |
|               | median      |           |            | cos      |             |        |
|               |             |           |            | …        |             |        |

## Development

```bash
bun --watch cut.test.js
```

## Roadmap

- [x] Docs interactive: https://raw.githack.com/vbrajon/rawjs/cut/index.html
- [x] Test interactive: https://raw.githack.com/vbrajon/rawjs/cut/cutest.html
- [ ] Typescript
- [ ] Blog Post
- [ ] Hacker News / Product Hunt
- [ ] Every Array Fn
- [ ] Async/Iterator/Generator
