// FUNCTION
const id = x => x;
const k = x => _ => x;
const t = (...x) => f => f(...x);
const tap = (...f) => (...x) => pipe(...f)(...x) ? x[0] : x[0];
const pipe = (...fns) => (...x) => fns.length == 1
	? fns[0](...x)
	: dropFst(fns).reduce((acc, f) => f(acc), fns[0](...x));
const pipeN = n => (...fns) => curryAdv(n)(pipe(
	unCurryAdv(fst(fns)),
	...dropFst(fns)
));
const pipeWith = (...pfns) => (...fns) =>
	pipe(...fns.map(f => pipe(...pfns)(f)));
const pipe0 = (...x_fs) => pipe(...dropFst(x_fs), id)(fst(x_fs));
const spread = f => xs => f(...xs);
const collect = f => (...args) => f(args);
const flip = f => (...x) => (...y) => f(...y)(...x);
const repF = n => f => spread(pipe)(rep(n)(f));
const repA = n => f => (...x) => reduce(spread)(f)(rep(n)(x));
const double = repA(2);
const mapf = a => (...f) => wx => pipeN(a)(wx, ...f);
const apf = a => wf => (...wx) => nAryAdv(a)(
	args => unCurryAdv(wf)(...args)(unCurryAdv(pipeN(a)(...wx))(...args)) );
const chainf = a => wf => (...wx) => nAryAdv(a)(
	args => unCurryAdv(wf(unCurryAdv(pipeN(a)(...wx))(...args)))(...args) );
const liftf = a => n => f =>
	nAry(n)(args => reduce( apf(a) )( mapf(a)(f)(args[0]) )(dropFst(args)));
const contramapf = a => (...f) => wx => nAryAdv(a)(
	reduce(acc => args => acc(...map(pipe(...f))(args)))(wx)
);
const curryN = n => (...f) => x => n > 1
	? curryN(n - 1)(pipe(...f).bind(undefined, x))
	: pipe(...f)(x);
const unCurry = f => collect(reduce(id)(f));
const uc = unCurry;
const nAry = n => (...f) => curryN(n)(collect(pipe(...f)));
const curryAdv = n => (...f) => (...x) => n > 1
	? curryAdv(n - 1)(pipe(...f).bind(undefined, x))
	: pipe(...f)(x);
	const unCurryAdv = f => (...argss) => argss.reduce(
		(accF, args) => accF(...args),
		f
	);
const nAryAdv = n => (...f) => curryAdv(n)(collect(pipe(...f)));
const dispatch = method => (...args) => (...options) => obj => {
	if (obj == null) return obj;
	if (obj[method]) return obj[method](...args);
	return cond([...options, [TRUE, UNDEF]])(obj);
};

const _ap = f => (...g) => (...x) => f(...x)(pipe(...g)(...x));
const _chain = f => (...g) => (...x) => f(pipe(...g)(...x))(...x);
const _lift = f => (...fns1) => (...fns2) => _ap(pipe(...fns1, f))(...fns2);

// LOGIC
const UNDEF = k(undefined);
const TRUE = k(true);
const FALSE = k(false);
const getType = x => typeof x;
const isType = t => x => getType(x) === t;
const isArr = Array.isArray;
const isNum = isType("number");
const isF = isType("function");
const isObj = o => {
	if (o != undefined) return o.constructor == Object;
	return false; };
const not = x => !x;
const and = x => y => x && y;
const or = x => y => x || y;
const xor = x => y => or(x)(y) && !and(x)(y)
const eq = x => dispatch("equals")(x)(
	[y => !isType(typeof x)(y), FALSE],
	[y => x === y, TRUE],
	[y => Number.isNaN(x) && Number.isNaN(y), TRUE],
	[y => isArr(y) && isArr(x),
		y => both( alli(_y => i => eq(_y)(x[i])) )( eqBy(len)(x) )(y)],
	[y => isObj(y) && isObj(x),
		y => bothf(2)( eqBy(vals) )( eqBy(keys) )(x)(y)],
	[y => isF(y) && isF(x), y => (...args) => eq(y(...args))(x(...args))],
	[TRUE, FALSE]
);
const equals = x => y => x.equals(y);
const eqBy = (...f) => contramapf(2)(...f)(eq);
const ineq = x => complementf(2)(eq)(x);
const complementf = a => mapf(a)(not);
const complement = m => map(not)(m);
const bothf = a => liftf(a)(2)(and);
const both = m1 => lift(and)(m1);
const eitherf = a => liftf(a)(2)(or);
const either = m1 => lift(or)(m1);
const all = p => pipe(map(p), reduce(and)(true));
const any = p => pipe(map(p), reduce(or)(false));
const alli = p => pipe(mapi(p), reduce(and)(true));
const anyi = p => pipe(mapi(p), reduce(or)(false));
const ifelse = (...c) => (...t) => (...f) => x =>
	pipe(...c)(x) ? pipe(...t)(x) : pipe(...f)(x);
const when = (...c) => (...t) => ifelse(...c)(...t)(id);
const unless = (...c) => ifelse(...c)(id);
const cond2 = pairs => (...x) => pipe(
	append([TRUE, UNDEF]),
	transpose,
	_lift(idx)( fst, findIndex(t(...x)) )(lst)
)(pairs);
const cond = pairs => double(cond2(pairs));

// STRING
const arrayToString = arr => "[ " + arr.map(toStr).join(", ") + " ]";
const objToString = obj =>
	"{ " + vals(mapk(v => k => `${k}: ${toStr(v)}`)(obj)).join(", ") + " }";
const toString = x => x.toString();
const toStr = dispatch("toStr")()(
	[isArr,           arrayToString],
	[isObj,           objToString],
	[x => x.toString, x => x.toString()]
);
const toLower = str => str.toLowerCase();
const toUpper = str => str.toUpperCase();
const splitStr = spl => str => str.split(spl);
const joinStr = jn => xs => xs.join(jn);
const forStr = f => pipe( splitStr(""), f, joinStr("") );
const decoText = d1 => (d2 = forStr(reverse)(d1)) => t => d1 + t + d2;

// NUMBER
const add = y => x => x + y;
const sub = y => x => x - y;
const mul = y => x => x * y;
const div = y => x => x / y;
const pow = y => x => x ** y;
const inc = add(1);
const dec = sub(1);
const sqrt = Math.sqrt;
const fact = (n, acc = 1) => {
	if (n <= 1) return acc;
	return fact(n - 1, n * acc); };
const gt = y => x => x > y;
const lt = y => x => x < y;
const gte = y => x => x >= y;
const lte = y => x => x <= y;
const max = x => y => Math.max(x, y);
const min = x => y => Math.min(x, y);
const inIncl = min => max => both(gte(min))(lte(max));
const inExcl = min => max => both(gt(min))(lt(max));
const clamp = min => max => unless( inIncl(min)(max) )(
	ifelse( gt(max) )( k(max) )( k(min) )
);
const mod = y => x => ((x % y) + y) % y;
const modSym = y => x => x % y;
const fl = Math.floor;
const round = Math.round;
const magnitude = m => f => n => f((10 ** (m)) * n) / (10 ** (m));
const floorAt = m => magnitude(m)(fl);
const roundAt = m => magnitude(m)(round);
const toPercent = m => pipe( mul(100), roundAt(m), n => `${n}%` );
const rndInt = min => max => fl( lerp(min)(max)(Math.random()) );
const rnd0Int = rndInt(0);
const iToRatio = len => i => i / (len - 1) || 0;
const numToRatio = min => max => n => (n - min) / (max - min) || 0;
const lerp = min => max => n => min + n * (max - min);
const scale = toMin => toMax => fromMin => fromMax => pipe(
	numToRatio(fromMin)(fromMax),
	lerp(toMin)(toMax) );
const interpolate = ns => ps => chain(
	end => end >= 1 && ns.length > 1
		? scale(ns[end - 1])(ns[end])(ps[end - 1])(ps[end])
		: k(ns[0])
)(pipe(gte, f => ps.findIndex(f)));
const interpolateL = ns => interpolate(ns)(percents(ns.length));
const interpolateI = ns => ps => len => i =>
	interpolate(ns)(ps)(iToRatio(len)(i));
const interpolateLI = ns => len => i => interpolateL(ns)(iToRatio(len)(i));
const frameTime = fps => fps && 1000/fps;

// FANTASYLAND
const map = (...fns) => dispatch("map")(pipe(...fns))(
	[isF,   mapf(1)(...fns)],
	[isObj, mapk(x => _ => pipe(...fns)(x))]
);
const constmap = x => map(k(x));
const bimap = f => g => dispatch("bimap")(f, g)();
const pluck = k => map(prop(k));
const ap = mf => dispatch("ap")(mf)(
	[isArr, mx => reduce(a => f => concatL(a)(map(f)(mx)))([])(mf)],
	[isF,   apf(1)(mf)]
);
const liftN = n => f => nAry(n)
	(args => reduce(ap)(map(f)(args[0]))(dropFst(args)));
const lift = liftN(2);
const liftArray = f => ms => {
	const arity = len(ms);
	return unCurry(liftN(arity)(nAry(arity)(f)))(...ms);
};
const juxt = mf => (...x) => map(t(...x))(mf);
const reduce = f => z => dispatch("reduce")((acc, x) => f(acc)(x), z)(
	[isObj, o => reduce(f)(z)(vals(o))]
);
const reduceRight = f => z => dispatch("reduceRight")((acc, x) => f(acc)(x), z)(
	[isObj, o => reduce(f)(z)(pipe(vals, reverse)(o))]
);
const reduceM = M => f => z => reduce(
	acc => x => chain(acc => f(acc)(x))(acc)
)(of(M)(z));
const chain = f => dispatch("chain")(f)(
	[isArr, xs => xs.flatMap(f)],
	[isF,   chainf(1)(f)]
);
const constchain = mb => chain(k(mb));
const join = chain(id);
const extend = f => dispatch("extend")(f)(
	[isArr, xs => mapi(_ => i => f(drop(i)(xs)))(xs)]
);
const traverse = A => (...f) => dispatch("traverse")(A, pipe(...f))(
	[isArr, reduce( acc => x => lift(append)(pipe(...f)(x))(acc) )(A.of([]))],
);
const sequence = A => traverse(A)(id);
const of = C => v => dispatch("of")(v)(
	[eq(Function), k(k(v))]
)(C);
const contramap = (...fns) => dispatch("contramap")(pipe(...fns))(
	[isF,  contramapf(1)(...fns)]
);
const filter = p => dispatch("filter")(p)(
	[isObj, o => filterk(x => _ => p(x))(o)]
);
const reject = f => filter(complement(f));
const filterM = M => p => dispatch("filterM")(M, p)(
	[isArr, arrayFilterM(M)(p)]
);
const rejectM = M => p => filterM(M)(x => map(not)(p(x)));
const concat = y => dispatch("concat")(y)();
const concatL = flip(concat);
const empty = dispatch("empty")()();
const zero = dispatch("zero")()();
const pipeC = pipeWith(chain);
const pipeK = (...fns) => pipe(fns[0], pipeC(...dropFst(fns)));

// ARRAY
const mapi = f => xs => xs.map((x, i) => f(x)(i));
const reducei = f => xs => xs.reduce((acc, x, i) => f(acc)(x)(i));
const find = f => xs => xs.find(f);
const findIndex = f => xs => xs.findIndex(x => f(x));
const filteri = f => xs => xs.filter((p, i) => f(p)(i));
const rejecti = f => filteri(complementf(2)(f));
const slice = (f = 0) => (t = Infinity) => xs => xs.slice(f, t);
const len = xs => xs.length;
const idx = i => xs => xs[i];
const idxs = is => xs => map(flip(idx)(xs))(is);
const drop = n => slice(n)();
const dropEnd = n => _lift(slice(0))(len, sub(n))(id);
const dropFst = drop(1);
const dropLst = dropEnd(1);
const take = n => chain(dropEnd)(len, sub(n));
const takeEnd = n => chain(drop)(len, sub(n));
const fst = idx(0);
const lst = _chain(idx)(len, dec);
const prepend = x => xs => [x, ...xs];
const append = x => xs => [...xs, x];
const incl = pipe(eq, any);
const eqAny = flip(incl);
const indexOf = e => xs => xs.indexOf(e);
//uniq: gets unique items from an array
const uniq = _chain(filteri)(xs => pipe(flip(indexOf)(xs), eq));
const sum = reduce(add)(0);
const sumCurried = n => nAry(n)(sum);
const reverse = xs => [...xs].reverse();
const flatten = reduce(concatL)([]);
const adjust = n => f => mapi(x => i => i === n ? f(x) : x);
const swap = i1 => i2 => lift(adjust(i2))( idx(i1), k )(
	lift(idx(i2), k)(id)(adjust(i1))
);
const zipWith = f => xs => ys =>
	rep(min(len(xs))(len(ys)))(null).map((_, i) => f(xs[i])(ys[i]));
const around = i => lift(a => b => [a, b])(idx(i - 1))(idx(i + 1));
const newxs = length => Array.from({length});
const fillNewxs = len => f => newxs(len).map((_, i) => f(i));
const rep = n => x => fillNewxs(n)(k(x));
const range = min => max => fillNewxs(max - min)(add(min));
const percents = length => length > 1
	? newxs(length).map((_, i) => i / (length - 1)) : [0];
const transpose = xss => xss[0].map((_, i) => xss.map(xs => xs[i]));
const arrayFilterM = M => p => reduceRight(
	acc => x => lift(mb => mb ? prepend(x) : id)(p(x))(acc)
)(of(M)([]));

// OBJECT
const merge = x => y => Object.assign({}, x, y);
const mergeR = flip(merge);
const objOf = (...ks) => (...vs) => ks.reduce(
	(acc, k, i) => ({...acc, [k]: vs[i]}), {}
);
const mergeF = f => x => y => {
	const dupes = reducek(acc => _ => k =>
		x[k] && y[k] ? {...acc, [k]: y[k]} : acc
	)({})({...y, ...x});
	return {...y, ...x, ...mapk(v => k => f(x[k])(v))(dupes)}
}
const zip = pipeN(2)(zipWith(objOf), reduce(merge)({}));
const reducek = f => z => o => reduce(acc => k => f(acc)(o[k])(k))(z)(keys(o));
const filterk = f => reducek( acc => v => k =>
	f(v)(k) ? assoc(k)(v)(acc) : acc )({});
const rejectk = f => filterk(complementf(2)(f));
const assoc = mapf(2)(mergeR)(objOf);
const dissoc = (...ks) => rejectk(_ => eqAny(ks));
const prop = k => obj => obj[k];
const props = ks => obj => map(flip(prop)(obj))(ks);
const eqProp = k => v => obj => eq(obj[k])(v)
const pick = ks => obj => ks.reduce((acc, k) => ({...acc, [k]: obj[k]}), {});
const keys = Object.keys;
const vals = Object.values;
const entries = Object.entries;
const objLen = pipe(keys, len);
const mapk = f => obj => keys(obj).reduce(
	(acc, k) => ({ ...acc, [k]: f(obj[k])(k) }), {}
);
const adjusto = k => f => obj => ({...obj, [k]: f(obj[k])});

// DOM
const getElem = id => document.getElementById(id);
const qSel = q => document.querySelector(q);
const qSelAll = q => document.querySelectorAll(q);
const children = elem => elem.children;