const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
export default [
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
