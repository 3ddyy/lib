import { toStr } from "./string.js";
import { empty, concatL } from "./category_theory.js";

export {
	Pair, Triple, MonoidPair,
	around
};

const Pair = (a, b) => ({
	a, b,
	map: f => Pair(f(a), f(b)),
	ap: mf => Pair(mf.a(a), mf.b(b)),
	lmap: f => Pair(f(a), b),
	rmap: f => Pair(a, f(b)),
	bimap: (f, g) => Pair(f(a), g(b)),
	concat: y => Pair(concatL(a)(y.a), concatL(b)(y.b)),
	toStr: _ => `Pair(${toStr(a)}, ${toStr(b)})`
});
Pair.of = x => Pair(x, x);
Pair.fromArray = ([a, b]) => Pair(a, b);

const Triple = (a, b, c) => ({
	a, b, c,
	map: f => Triple(f(a), f(b), f(c)),
	ap: mf => Triple(mf.a(a), mf.b(b), mf.c(c)),
	lmap: f => Triple(f(a), b, c),
	mmap: f => Triple(a, f(b), c),
	rmap: f => Triple(a, b, f(c)),
	trimap: (f, g, h) => Triple(f(a), g(b), h(c)),
	concat: y => Triple(concatL(a)(y.a), concatL(b)(y.b), concatL(c)(y.c)),
	toStr: _ => `Triple(${toStr(a)}, ${toStr(b)}, ${toStr(c)})`
});
Triple.of = x => Triple(x, x, x);
Triple.fromArray = ([a, b, c]) => Triple(a, b, c);

const MonoidPair = M => {
	const MPair = (a, b) => ({
		a, b,
		map: f => MPair(a, f(b)),
		ap: mf => MPair(concatL(mf.a)(a), mf.b(b)),
		chain: f => MPair(
			concatL(a)(f(b).a),
			f(b).b
		),
		extend: f => MPair(a, f(MPair(a, b))),
		extract: _ => b,
		bimap: (f, g) => MPair(f(a), g(b)),
		toStr: _ => `Pair(${toStr(a)}, ${toStr(b)})`
	});
	MPair.of = b => MPair(empty(M), b);
	return MPair;
};

const around = i => lift(a => b => Pair(a, b))(idx(i - 1))(idx(i + 1));