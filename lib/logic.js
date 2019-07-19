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

const UNDEF = _ => undefined;
const TRUE = _ => true;
const FALSE = _ => false;
const getType = x => typeof x;
const isType = t => x => getType(x) === t;
const isArr = Array.isArray;
const isNum = isType("number");
const isF = isType("function");
const isStr = isType("string");
const isObj = o => {
	if (o != undefined) return o.constructor == Object;
	return false; };
const not = x => !x;
const and = x => y => x && y;
const or = x => y => x || y;
const xor = x => y => or(x)(y) && !and(x)(y)
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
const equals = x => y => x.equals(y);
const eqBy = f => contramapf(2)(f)(eq);
const ineq = x => complementf(2)(eq)(x);
const complementf = a => mapf(a)(not);
const complement = m => map(not)(m);
const alli = p => pipe(mapi(p), reduce(and)(true));
const anyi = p => pipe(mapi(p), reduce(or)(false));
const all = p => alli(x => _ => p(x));
const any = p => anyi(x => _ => p(x));
const ifelse = (...c) => (...t) => (...f) => x =>
	pipe(...c)(x) ? pipe(...t)(x) : pipe(...f)(x);
const when = (...c) => (...t) => ifelse(...c)(...t)(id);
const unless = (...c) => ifelse(...c)(id);
const cond2 = pairs => (...x) => (...y) => pairs.reduce(
	(acc, pair) => acc == undefined
		? pair[0](...x) ? pair[1](...y) : undefined
		: acc,
	undefined);
const cond = pairs => x => cond2(pairs)(x)(x);