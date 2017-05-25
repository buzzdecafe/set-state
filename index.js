const needF = () => new TypeError("A function argument is required");

const state = f => ds => {

  if (typeof f !== 'function') {
    throw needF();
  }

  return {
    map: g => gdeps => state(g(f.apply(null, ds.map(d => d.force()))))(gdeps),

    propagate: () => [this.force()].concat(ds.map(d => d.force())),

    force: () => f.apply(null, ds.map(d => d.force()))
  };

};

state.of = x => state(() => x)([]);
state.empty = () => state(x => x)([]),


module.exports = state
