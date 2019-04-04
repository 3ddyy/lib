const State = comp => ({
	runState: comp,
	map: f => State(s => adjust(0)(f)(comp(s))),
	ap: mf => mf.chain(f => State(comp).map(f)),
	chain: f => State(s => {
		const [a, newState] = comp(s);
		return f(a).runState(newState);
	})
});
State.of = x => State(s => [x, s]);
State.get = State(s => [s, s]);
State.put = state => State(_ => [[], state]);
State.modify = f => State(s => [[], f(s)]);