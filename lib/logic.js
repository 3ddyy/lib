import { _dispatch, _lift } from "./internal.js";
import { contramapf, mapf, liftf, pipe, t, id } from "./function.js";
import { map, reduce, lift } from "./category_theory.js";
import { mapi } from "./array.js";

export {
	UNDEF, TRUE, FALSE,
	getType, isType, isArr, isNum, isF, isStr, isObj,
	not, and, or, xor,
	eq, equals, eqBy, ineq,
	complementf, complement,
	alli, anyi, all, any,
	ifelse, when, unless,
	cond2, cond
};

// UNDEF :: a -> ()
const UNDEF = _ => undefined;
// TRUE :: a -> Boolean
const TRUE = _ => true;
// FALSE :: a -> Boolean
const FALSE = _ => false;
// getType :: a -> String
const getType = x => typeof x;
// isType :: String -> a -> Boolean
const isType = t => x => getType(x) === t;
// isArr :: a -> Boolean
const isArr = Array.isArray;
// isNum :: a -> Boolean
const isNum = isType("number");
// isF :: a -> Boolean
const isF = isType("function");
// isStr :: a -> Boolean
const isStr = isType("string");
// isObj :: a -> Boolean
const isObj = o => {
	if (o != undefined) return o.constructor == Object;
	return false; };
// not :: Boolean -> Boolean
const not = x => !x;
// and :: Boolean -> Boolean -> Boolean
const and = x => y => x && y;
// or :: Boolean -> Boolean -> Boolean
const or = x => y => x || y;
// xor :: Boolean -> Boolean -> Boolean
const xor = x => y => or(x)(y) && !and(x)(y)
// eq :: a -> b -> Boolean
const eq = x => _dispatch("equals")(x)(
	[y => !isType(typeof x)(y), FALSE],
	[y => x === y, TRUE],
	[y => Number.isNaN(x) && Number.isNaN(y), TRUE],
	[y => isArr(y) && isArr(x),
		y => lift(and)( alli(_y => i => eq(_y)(x[i])) )( eqBy(len)(x) )(y)],
	[y => isObj(y) && isObj(x),
		y => liftf(2)(2)(and)( eqBy(vals) )( eqBy(keys) )(x)(y)],
	[TRUE, FALSE]
);
// equals :: Eq a => a -> a -> Boolean
const equals = x => y => x.equals(y);
// eqBy :: (a -> b) -> a -> a -> Boolean
const eqBy = f => contramapf(2)(f)(eq);
// ineq :: a -> b -> Boolean
const ineq = x => complementf(2)(eq)(x);
// complementf :: Number -> (a -> ... -> z -> Boolean) -> (a -> ... -> z -> Boolean)
const complementf = a => mapf(a)(not);
// complement :: Functor f => f Boolean -> f Boolean
const complement = m => map(not)(m);
// alli :: (a -> Number -> Bool) -> [a] -> Bool
const alli = p => pipe(mapi(p), reduce(and)(true));
// anyi :: (a -> Number -> Bool) -> [a] -> Bool
const anyi = p => pipe(mapi(p), reduce(or)(false));
// all :: Functor f, Foldable f => (a -> Bool) -> f a -> Bool
const all = p => pipe(map(p), reduce(and)(true));
// any :: Functor f, Foldable f => (a -> Bool) -> f a -> Bool
const any = p => pipe(map(p), reduce(or)(false));
// ifelse :: ...(a -> Bool) -> ...(a -> b) -> ...(a -> b) -> a -> b
const ifelse = (...c) => (...t) => (...f) => x =>
	pipe(...c)(x) ? pipe(...t)(x) : pipe(...f)(x);
// when :: ...(a -> Bool) -> (a -> a) -> a -> a
const when = (...c) => (...t) => ifelse(...c)(...t)(id);
// unless :: ...(a -> Bool) -> (a -> a) -> a -> a
const unless = (...c) => ifelse(...c)(id);
// cond2 :: [ P[(a, b, c...) -> Bool, (d, e, f...) -> g] ] -> a -> b -> g
const cond2 = pairs => (...x) => (...y) => pairs.reduce(
	(acc, pair) => acc == undefined
		? pair[0](...x) ? pair[1](...y) : undefined
		: acc,
	undefined);
// cond :: [ P[(a, b, c...) -> Bool, (a, b, c...) -> d] ] -> a -> d
const cond = pairs => x => cond2(pairs)(x)(x);