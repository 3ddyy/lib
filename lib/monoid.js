const ArrMonoid = x => ({
	val: x,
	concat: y => ArrMonoid(x.concat(y.val)),
	toStr: _ => `ArrMonoid(${toStr(x)})`
});
ArrMonoid.empty = _ => ArrMonoid([]);

const StrMonoid = x => ({
	val: x,
	concat: y => StrMonoid(x.concat(y.val)),
	toStr: _ => `StrMonoid(${toStr(x)})`
});
StrMonoid.empty = _ => StrMonoid("");

const FuncMonoid = f => ({
	val: f,
	concat: y => FuncMonoid(x => y.val(f(x))),
	toStr: _ => `FuncMonoid(${toStr(f)})`
});
FuncMonoid.empty = _ => FuncMonoid(x => x);

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

const MonoidGroup = Ms => {
	const MG = vals => ({
		val: vals,
		concat: y => MG(mergeF(concatL)(vals)(y.val)),
		toStr: _ => toStr(vals)
	});
	MG.empty = _ => MG(map(empty)(Ms));
	return MG;
};

const fold = M => ms => ms.reduce((acc, m) => acc.concat(m), M.empty());
const foldMap = M => xs => xs.reduce((acc, x) => acc.concat(M(x)), M.empty());