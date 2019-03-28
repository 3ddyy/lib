const Just = x => ({
	map: f => Just(f(x)),
	ap: mf => mf.chain(f => Just(f(x))),
	chain: f => f(x),
	extend: f => Just(f(Just(x))),
	reduce: (f, z) => f(z, x),
	getOrElse: _ => x,
	concat: y => y.isJust() ? Just(x.concat(y.getOrElse())) : Just(x),
	toStr: _ => `Just(${toStr(x)})`,
	isJust: _ => true,
	isNothing: _ => false
});

const Nothing = _ => ({
	map: _ => Nothing(),
	ap: _ => Nothing(),
	chain: _ => Nothing(),
	extend: f => Just(f(Nothing())),
	reduce: (_, z) => z,
	getOrElse: d => d,
	concat: y => y,
	toStr: _ => "Nothing()",
	isJust: _ => false,
	isNothing: _ => true
});

const Maybe = x => Just(x);
Maybe.Just = Just;
Maybe.Nothing = Nothing;
Maybe.of = x => Just(x);
Maybe.empty = _ => Nothing();
Maybe.fromNullable = x => x != null ? Just(x) : Nothing();
Maybe.fromIsValid = (f, x) => f(x) ? Just(x) : Nothing();

const fromNullable = x => Maybe.fromNullable(x);
const fromIsValid = f => x => Maybe.fromIsValid(f, x);
const isJust = m => m.isJust();
const isNothing = m => m.isNothing();

const safeDiv = y => x => y == 0 ? Nothing() : Just(x / y);
const path = path => pipeK(
	...path.map(prop => obj => fromNullable(obj[prop]))
);