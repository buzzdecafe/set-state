const capturing = new Set()
const updating = new Set()
let isCapturing = false
const isPrimitive = x => Object(x) !== x
const toJSON = x => (x.toJSON === undefined ? x : x.toJSON())
const update = node => {
  if (updating.has(node)) updating.delete(node)
  updating.add(node)
  node.dependents.forEach(update)
}

const state = (compute, ds) => {
  var deps = ds.concat();
  if (typeof compute !== 'function') {
    throw new Error('state requires a function argument. Use state.of for other values');
  }

  const recompute = node => {
    node.value = node.compute.apply(null, ds);
    node.listeners.forEach(fn => fn(node.value))
  }
  const node = x => {
    if (isCapturing) capturing.add(node)
    if (x === undefined) {
      throw new Error('Argument required, none given');
    }
    node.compute = () => x
    if (typeof x === 'function') {
      node.compute = x
      isCapturing = true
      capturing.clear()
      recompute(node)
      isCapturing = false
    } else {
      recompute(node)
    }
    updating.clear()
    node.dependents.forEach(update)
    updating.forEach(recompute)

    return node.value
  }

  node.listeners = new Set()
  node.dependents = new Set()
  deps.forEach(dep => dep.dependents.add(node));

  node.on = fn => {
    node.listeners.add(fn)
    return () => node.listeners.delete(fn)
  }
  node.toJSON = () =>
    (isPrimitive(node.value) ? node.value : toJSON(node.value))
  node(compute)
  
  return node
}
state.of = x => state(() => x, []);

module.exports = state
