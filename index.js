const needF = () => new TypeError("A function argument is required");

const state = f => ds => {

  if (typeof f !== 'function') {
    throw needF();
  }

  return {
    map: g => gdeps => state(g(f.apply(null, ds), gdeps)),

    propagate: () => return [this.force()].concat(ds.map(d => d.force())),

    force: () => f.apply(null, ds)
  };

};

state.of = x => state(() => x)([]);
state.empty = () => state(x => x)([]),


module.exports = state
