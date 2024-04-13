if (!globalThis.window) globalThis.window = globalThis
window.process = window.process || {}
async function run(file, options) {
  const {
    times = 1,
    parallel = false,
    assertEquals = (a, b) => {
      const sa = JSON.stringify(a)
      const sb = JSON.stringify(b)
      if (sa === sb) return
      const error = new Error(`${sa} !== ${sb}`)
      error.name = "AssertError"
      error.actual = a
      error.expected = b
      throw error
    },
  } = options || {}
  const { packages, default: tests } = await import("./" + file)
  const results = {}
  for (const pkg of packages || options.packages) {
    for (const version of pkg.versions) {
      const name = `${pkg.name}@${version}`
      pkg.module = await pkg.import(version)
      const functions = prepare(tests, pkg)
      const start = performance.now()
      results[name] = parallel ? await Promise.all(functions.map(({ fn_run }) => fn_run(times))) : await functions.reduce(async (acc, { fn_run }) => [...(await acc), await fn_run(times)], [])
      const duration = performance.now() - start
      const passed = results[name].filter(({ status }) => status === "ok")
      const errored = results[name].filter(({ status }) => status === "ko")
      const skipped = tests.length - results[name].length
      const [clear, red, green, yellow, blue] = [0, 31, 32, 33, 34].map((n) => `\x1b[${n}m`)
      if (errored.length) {
        const assertErrors = errored.filter((v) => v.error.name === "AssertError").map((v) => ({ run: v.run, actual: v.error.actual, expected: v.error.expected }))
        const throwErrors = errored.filter((v) => v.error.name !== "AssertError").map((v) => v.error)
        if (assertErrors.length) console.table(assertErrors)
        if (throwErrors.length) throwErrors.map((e) => console.error(e))
      }
      console[errored.length ? "error" : "log"](`${file} ${blue}${name}${clear} | ${yellow}${duration > 1000 ? +(duration / 1000).toPrecision(2) + "s" : +duration.toFixed(0) + "ms"}${times > 1 ? ` x${times}` : ""}${parallel ? ` parallel` : ""}${clear}: ${green}${passed.length} passed${clear}, ${red}${errored.length} errored${skipped ? `, ${yellow}${skipped} skipped${clear}` : ""}${clear}`)
    }
  }
  return results
  function prepare(tests, pkg) {
    const c = {}
    const functions = []
    for (let test of tests) {
      if (test instanceof Array)
        test = {
          name: test[0],
          input: test.slice(1, -1),
          output: test.at(-1),
        }
      const { name, input, output } = test
      const [key, description] = name.split(" - ")
      c[key] = (c[key] || 0) + 1
      const f = pkg.fn(pkg.module, key)
      if (!f) continue
      const run = `${key} #${c[key]} #${pkg.name}`
      const fn = test.fn ? () => test.fn(f) : () => f(...input)
      const fn_test = async () => assertEquals(await fn(), output)
      const fn_bench = async () => { try { await fn() } catch (e) {} } // prettier-ignore
      const fn_run = async (times = 1) => {
        try {
          await fn_test()
          const start = performance.now()
          for (let i = 0; i < times; i++) await fn_bench()
          const duration = performance.now() - start
          return { status: "ok", run, duration: duration / times }
        } catch (error) {
          return { error, status: "ko", run, input, output }
        }
      }
      functions.push({ run, fn_run })
    }
    return functions
  }
}

export default run
