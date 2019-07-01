import { flip, pipe, nAry, id, k } from "./function.js";
import { map, reduce, reduceRight, lift, of } from "./category_theory.js";
import { _lift, _chain } from "./internal.js";
import { add, sub, div, dec, rnd0Int } from "./number.js";
import { eq, any, complementf } from "./logic.js";

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

const mapi = f => xs => xs.map((x, i) => f(x)(i));
const reducei = f => xs => xs.reduce((acc, x, i) => f(acc)(x)(i));
const find = f => xs => xs.find(f);
const findIndex = f => xs => xs.findIndex(x => f(x));
const filteri = f => xs => xs.filter((p, i) => f(p)(i));
const rejecti = f => filteri(complementf(2)(f));
const len = xs => xs.length;
const idx = i => xs => xs[i];
const idxs = is => xs => map(flip(idx)(xs))(is);
const slice = f => t => xs => xs.slice(f, t);
const drop = n => slice(n)(Infinity);
const dropEnd = n => _lift(slice(0))(len, sub(n))(id);
const take = n => _chain(dropEnd)(len, sub(n));
const takeEnd = n => _chain(drop)(len, sub(n));
const tail = drop(1);
const init = dropEnd(1);
const head = idx(0);
const last = _chain(idx)(len, dec);
const prepend = x => xs => [x, ...xs];
const append = x => xs => [...xs, x];
const incl = pipe(eq, any);
const eqAny = flip(incl);
const indexOf = e => xs => xs.indexOf(e);
//uniq: gets unique items from an array
const uniq = _chain(filteri)(xs => pipe(flip(indexOf)(xs), eq));
const rndElem = xs => xs[rnd0Int(xs.length - 1)];
const sum = reduce(add)(0);
const sumCurried = n => nAry(n)(sum);
const reverse = xs => [...xs].reverse();
const adjust = n => f => mapi(x => i => i === n ? f(x) : x);
const swap = i1 => i2 => xs => fillArray(xs.length)(cond([
	[eq(i1), k(xs[i2])],
	[eq(i2), k(xs[i1])],
	[TRUE,   flip(idx)(xs)]
]))
const zipWith = f => xs => ys =>
	rep(min(len(xs))(len(ys)))(null).map((_, i) => f(xs[i])(ys[i]));
const fillArray = length => f => Array.from({length}).map((_, i) => f(i));
const rep = n => x => fillArray(n)(k(x));
const range = min => max => fillArray(max - min)(add(min));
const percents = length => length > 1
	? fillArray(length)(div(length - 1)) : [0];
const transpose = xss => xss[0].map((_, i) => xss.map(xs => xs[i]));
const arrayFilterM = M => p => reduceRight(
	acc => x => lift(mb => mb ? prepend(x) : id)(p(x))(acc)
)(of(M)([]));