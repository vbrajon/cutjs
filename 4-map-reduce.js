import { access, equal } from "./0-base.js"
export const Object_keys = Object.keys
export const Object_values = Object.values
export const Object_entries = Object.entries
export const Object_fromEntries = Object.fromEntries
export function Object_map(obj, fn) {
  return Object.keys(obj).reduce((acc, k, i) => {
    acc[k] = fn(obj[k], k, i, obj)
    return acc
  }, {})
}
export function Object_reduce(obj, fn, base) {
  return Object.keys(obj).reduce((acc, k, i) => fn(acc, obj[k], k, i, obj), base)
}
export function Object_filter(obj, fn) {
  return Object.keys(obj).reduce((acc, k, i) => {
    if (fn(obj[k], k, i, obj)) acc[k] = obj[k]
    return acc
  }, {})
}
export function Object_find(obj, fn) {
  return obj[Object.keys(obj).find((k, i) => fn(obj[k], k, i, obj))]
}
// NOTE: This will return the "key" of the object and not an "index" number
export function Object_findIndex(obj, fn) {
  return Object.keys(obj).find((k, i) => fn(obj[k], k, i, obj))
}
export const Array_map = [].map
export const Array_reduce = [].reduce
export const Array_filter = [].filter
export const Array_find = [].find
export const Array_findIndex = [].findIndex
export function shortcut_map(fn, ...args) {
  const f = (fn) => {
    if (fn == null) return (x) => x
    if (fn instanceof Function) return fn
    if (fn instanceof Array) return (x) => fn.map((b) => access(x, b))
    return (x) => access(x, fn)
  }
  args[1] = f(args[1])
  return fn(...args)
}
export function shortcut_filter_find_findIndex(fn, ...args) {
  const f = (fn) => {
    if (fn == null) return (x) => x
    if (fn instanceof Function) return fn
    if (fn instanceof RegExp) return (x) => fn.test(x)
    if (fn instanceof Array) return (x) => fn.some((v) => f(v)(x))
    if (fn instanceof Object) return (x) => Object.keys(fn).every((k) => f(fn[k])(x[k]))
    return (x) => equal(x, fn) || access(x, fn)
  }
  args[1] = f(args[1])
  return fn(...args)
}
