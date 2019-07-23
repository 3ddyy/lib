import { flip, pipe, nAry, id, k } from "./function.js";
import { map, reduce, reduceRight, lift, of } from "./category_theory.js";
import { _lift, _chain } from "./internal.js";
import { add, sub, div, dec, rnd0Int } from "./number.js";
import { eq, any, complementf } from "./logic.js";
import { getOrElse, fromNullable, fromIsValid } from "./maybe.js";

export {
	mapi, reducei,
	find, findIndex,
	filteri, rejecti,
	len, idx, idxs,
	slice, drop, dropEnd, take, takeEnd,
	tail, init, head, last,
	prepend, append,
	incl, eqAny,
	indexOf, uniq, rndElem,
	sum, sumCurried,
	reverse,
	adjust, swap,
	zipWith, fillArray,
	rep, range, percents,
	transpose,
	arrayFilterM
};

// mapi :: (a -> Number -> b) -> [a] -> [b]
const mapi = f => xs => xs.map((x, i) => f(x)(i));
// reducei :: (a -> b -> Number -> c) -> a -> [b] -> c
const reducei = f => z => xs => xs.reduce((acc, x, i) => f(acc)(x)(i), z);
// find :: (a -> Bool) -> [a] -> Maybe a
const find = p => xs => fromNullable(xs.find(x => p(x)));
// findIndex :: (a -> Bool) -> [a] -> Maybe Number
const findIndex = p => xs => fromIsValid(x => x != -1)(xs.findIndex(x => p(x)));
// filteri :: (a -> Bool) -> [a] -> [a]
const filteri = p => xs => xs.filter((x, i) => p(x)(i));
// rejecti :: (a -> Bool) -> [a] -> [a]
const rejecti = f => filteri(complementf(2)(f));
// len :: [a] -> Number
const len = xs => xs.length;
// idx :: Number -> [a] -> a
const idx = i => xs => xs[i];
// idxs :: Functor f => f Number -> [a] -> f a
const idxs = is => xs => map(flip(idx)(xs))(is);
// slice :: Number -> Number -> [a] -> [a]
const slice = f => t => xs => xs.slice(f, t);
// drop :: Number -> [a] -> [a]
const drop = n => slice(n)(Infinity);
// dropEnd :: Number -> [a] -> [a]
const dropEnd = n => _lift(slice(0))(len, sub(n))(id);
// take :: Number -> [a] -> [a]
const take = n => _chain(dropEnd)(len, sub(n));
// takeEnd :: Number -> [a] -> [a]
const takeEnd = n => _chain(drop)(len, sub(n));
// tail :: [a] -> [a]
const tail = drop(1);
// init :: [a] -> [a]
const init = dropEnd(1);
// head :: [a] -> a
const head = idx(0);
// tail :: [a] -> a
const last = _chain(idx)(len, dec);
// prepend :: a -> [a] -> [a]
const prepend = x => xs => [x, ...xs];
// apppend :: a -> [a] -> [a]
const append = x => xs => [...xs, x];
// incl :: a -> [a] -> Bool
const incl = pipe(eq, any);
// eqAny :: [a] -> a -> Bool
const eqAny = flip(incl);
// indexOf :: a -> [a] -> Maybe Number
const indexOf = x => xs => fromIsValid(x => x != -1)(xs.indexOf(x));
// uniq :: [a] -> [a]
const uniq = _chain(filteri)(xs => pipe(
	flip(indexOf)(xs),
	getOrElse(), // can never fail
	eq
));
// rndElem :: [a] -> a
const rndElem = xs => xs[rnd0Int(xs.length - 1)];
// sum :: [Number] -> Number
const sum = reduce(add)(0);
// sumCurried :: Number -> Number -> Number -> ... -> Number -> Number
const sumCurried = n => nAry(n)(sum);
// reverse :: [a] -> [a]
const reverse = xs => [...xs].reverse();
// adjust :: Number -> (a -> a) -> [a] -> [a]
const adjust = n => f => mapi(x => i => i === n ? f(x) : x);
// swap :: Number -> Number -> [a] -> [a]
const swap = i1 => i2 => xs => fillArray(xs.length)(cond([
	[eq(i1), k(xs[i2])],
	[eq(i2), k(xs[i1])],
	[TRUE,   flip(idx)(xs)]
]));
// fillArray :: Number -> (Number -> a) -> [a]
const fillArray = length => f => Array.from({length}).map((_, i) => f(i));
// zipWith :: (a -> b -> c) -> [a] -> [b] -> [c]
const zipWith = f => xs => ys => fillArray(
	min(len(xs))(len(ys))
)(i => f(xs[i])(ys[i]));
// rep :: Number -> a -> [a]
const rep = n => x => fillArray(n)(k(x));
// range :: Number -> Number -> [Number]
const range = min => max => fillArray(max + 1 - min)(add(min));
// percents :: Number -> [Number]
const percents = length => length > 1
	? fillArray(length)(div(length - 1)) : [0];
// transpose :: [[a]] -> [[a]]
const transpose = xss => xss[0].map((_, i) => xss.map(xs => xs[i]));
// arrayFilterM :: Monad m => TypeRep m -> (a -> m Bool) -> [a] -> m [a]
const arrayFilterM = M => p => reduceRight(
	acc => x => lift(mb => mb ? prepend(x) : id)(p(x))(acc)
)(of(M)([]));