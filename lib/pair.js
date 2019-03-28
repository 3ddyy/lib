const Pair = (a, b) => ({
	a, b,
	map: f => Pair(f(a), f(b)),
	ap: mf => Pair(mf.a(a), mf.b(b)),
	lmap: f => Pair(f(a), b),
	rmap: f => Pair(a, f(b)),
	bimap: (f, g) => Pair(f(a), g(b))
});

const MonoidPair = M => {
	const MPair = (a, b) => ({
		a, b,
		map: f => MPair(a, f(b)),
		ap: mf => MPair(a.concat(mf.a), mf.b(b)),
		chain: f => MPair(
			a.concat(f(b).a),
			f(b).b
		),
		extend: f => MPair(a, f(MPair(a, b))),
		extract: _ => b,
		bimap: (f, g) => MPair(f(a), g(b))
	});
	MPair.of = b => MPair(M.empty(), b);
	return MPair;
};