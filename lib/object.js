import { flip, pipe, pipeN, mapf } from "./function.js";
import { map, reduce } from "./category_theory.js";
import { zipWith } from "./array.js";
import { complementf, eq } from "./logic.js";

export {
	merge, mergeR, mergeF,
	objOf, assoc, dissoc, zip,
	reducek, filterk, rejectk,
	prop, props, eqProp,
	pick,
	keys, vals, entries,
	objLen,
	mapk, adjusto
};

const merge = x => y => Object.assign({}, x, y);
const mergeR = x => y => merge(y)(x);
const mergeF = f => x => y => {
	const dupes = reducek(acc => _ => k =>
		k in x && k in y ? {...acc, [k]: y[k]} : acc
	)({})({...y, ...x});
	return {...y, ...x, ...mapk(v => k => f(x[k])(v))(dupes)}
}
const objOf = (...ks) => (...vs) => ks.reduce(
	(acc, k, i) => ({...acc, [k]: vs[i]}), {}
);
const assoc = (...ks) => mapf(2)(mergeR)(objOf)(...ks);
const dissoc = (...ks) => rejectk(_ => eqAny(ks));
const zip = xs => ys => pipeN(2)(zipWith(objOf), reduce(merge)({}))(xs)(ys);
const reducek = f => z => o => reduce(acc => k => f(acc)(o[k])(k))(z)(keys(o));
const filterk = f => reducek( acc => v => k =>
	f(v)(k) ? assoc(k)(v)(acc) : acc )({});
const rejectk = f => filterk(complementf(2)(f));
const prop = k => obj => obj[k];
const props = ks => obj => map(flip(prop)(obj))(ks);
const eqProp = k => v => obj => eq(obj[k])(v)
const pick = ks => obj => ks.reduce((acc, k) => ({...acc, [k]: obj[k]}), {});
const keys = Object.keys;
const vals = Object.values;
const entries = Object.entries;
const objLen = obj => pipe(keys, len)(obj);
const mapk = f => obj => keys(obj).reduce(
	(acc, k) => ({ ...acc, [k]: f(obj[k])(k) }), {}
);
const adjusto = k => f => obj => ({...obj, [k]: f(obj[k])});