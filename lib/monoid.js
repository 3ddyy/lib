import { toStr } from "./string.js";
import { mergeF } from "./object.js";
import { map, empty, concatL } from "./category_theory.js";

export {
	Sum, Product, Max, Min, Average,
	Any, All,
	MonoidGroup,
	fold, foldMap, mapFold
};

const Sum = x => ({
	val: x,
	concat: y => Sum(x + y.val),
	toStr: _ => `Sum(${toStr(x)})`
});
Sum.empty = _ => Sum(0);

const Product = x => ({
	val: x,
	concat: y => Product(x * y.val),
	toStr: _ => `Product(${toStr(x)})`
});
Product.empty = _ => Product(1);

const Max = x => ({
	val: x,
	concat: y => Max(Math.max(x, y.val)),
	toStr: _ => `Max(${toStr(x)})`
});
Max.empty = _ => Max(-Infinity);

const Min = x => ({
	val: x,
	concat: y => Min(Math.min(x, y.val)),
	toStr: _ => `Min(${toStr(x)})`
});
Min.empty = _ => Min(Infinity);

const Average = (sum, length = 1) => ({
	sum, length,
	val: length && sum / length,
	concat: y => Average(sum + y.sum, length + y.length),
	toStr: _ => `Average(${toStr(Average(sum, length).val)})`
});
Average.empty = _ => Average(0, 0);

const Any = bool => ({
	val: bool,
	concat: y => Any(y.val || bool),
	toStr: _ => `Any(${bool})`
});
Any.empty = _ => Any(false);

const All = bool => ({
	val: bool,
	concat: y => All(y.val && bool),
	toStr: _ => `All(${bool})`
});
All.empty = _ => All(true);

const MonoidGroup = Ms => {
	const MG = vals => ({
		val: vals,
		concat: y => MG(mergeF(concatL)(vals)(y.val)),
		toStr: _ => toStr(vals)
	});
	MG.empty = _ => MG(map(empty)(Ms));
	return MG;
};

const fold = M => ms => ms.reduce((acc, m) => concatL(acc)(m), empty(M));
const foldMap = M => pipe( map(M), fold(M) );
const mapFold = M => f => pipe( map(f), fold(M) );