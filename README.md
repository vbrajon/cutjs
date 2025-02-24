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
import "cut?window+prototype"
const users = [
  { name: "John", age: 25, city: "Paris" },
  { name: "Jane", age: 30, city: "London" },
  { name: "Jack", age: 14, city: "New York" },
]
users //
  .group("city") // {"Paris":[{name:"John",age:25,city:"Paris"}],...}
  .map(g => g.sum("age")) //= {"Paris":25,"London":30,"New York":14}
  .values() //= [25,30,14]
  .mean() //= 23
  .transform(v => v * 100 + 0.01234) //= 2300.01234
  .format("en") //= "2,300.012"
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
- [ ] Blog Post / Hacker News / Product Hunt
- [ ] Every Array Fn
- [ ] Async/Iterator/Generator
