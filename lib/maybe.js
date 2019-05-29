const Just = x => ({
	map: f => Just(f(x)),
	ap: mf => mf.chain(f => Just(f(x))),
	chain: f => f(x),
	extend: f => Just(f(Just(x))),
	reduce: (f, z) => f(z, x),
	filter: p => p(x) ? Just(x) : Nothing(),
	filterM: (_, p) => map( mb => mb ? Just(x) : Nothing() )(p(x)),
	concat: y => y.isJust() ? Just(x.concat(y.getOrElse())) : Just(x),
	alt: _ => Just(x),
	isJust: _ => true,
	isNothing: _ => false,
	getOrElse: _ => x,
	toStr: _ => `Just(${toStr(x)})`
});

const Nothing = _ => ({
	map: _ => Nothing(),
	ap: _ => Nothing(),
	chain: _ => Nothing(),
	extend: f => Just(f(Nothing())),
	reduce: (_, z) => z,
	filter: _ => Nothing(),
	filterM: (M, _) => of(M)(Nothing()),
	concat: y => y,
	alt: y => y,
	isJust: _ => false,
	isNothing: _ => true,
	getOrElse: d => d,
	toStr: _ => "Nothing()"
});

const Maybe = x => Just(x);
Maybe.Just = Just;
Maybe.Nothing = Nothing;
Maybe.of = x => Just(x);
Maybe.empty = _ => Nothing();
Maybe.zero = _ => Nothing();
Maybe.fromNullable = x => x != null ? Just(x) : Nothing();
Maybe.fromIsValid = (f, x) => f(x) ? Just(x) : Nothing();

const fromNullable = x => Maybe.fromNullable(x);
const fromIsValid = f => x => Maybe.fromIsValid(f, x);
const isJust = m => m.isJust();
const isNothing = m => m.isNothing();

const First = x => ({
	val: x,
	concat: y => isJust(x) ? First(x) : y,
	toStr: _ => `First(${toStr(x)})`
});
First.empty = _ => First(Nothing());

const Last = x => ({
	val: x,
	concat: y => isJust(y.val) ? y : Last(x),
	toStr: _ => `Last(${toStr(x)})`
});
Last.empty = _ => Last(Nothing());

const safeDiv = y => x => y == 0 ? Nothing() : Just(x / y);
const path = path => pipeK(
	...path.map(prop => obj => fromNullable(obj[prop]))
);
const maybe = fallback => f => m => m.reduce((_, x) => f(x), fallback);