import { tail, head, rep } from "./array.js";
import { map, juxt, reduce } from "./category_theory.js";

export {
	id, k, t,
	tap,
	pipe, pipeN, pipeWith, pipe0,
	spread, collect,
	flip, repF, repA, double,
	mapf, apf, chainf, liftf, contramapf,
	curryN, curry, unCurry, uc, nAry,
	curryAdv, unCurryAdv, nAryAdv
};

const id = x => x;
const k = x => _ => x;
const t = (...x) => f => f(...x);
const tap = (...f) => (...x) => pipe(...f)(...x) ? x[0] : x[0];
const pipe = (...fns) => (...x) => fns.length == 1
	? fns[0](...x)
	: tail(fns).reduce((acc, f) => f(acc), fns[0](...x));
const pipeN = n => (...fns) => curryAdv(n)(pipe(
	unCurryAdv(head(fns)),
	...tail(fns)
));
const pipeWith = (...pfns) => (...fns) =>
	pipe(...fns.map(f => pipe(...pfns)(f)));
const pipe0 = (...x_fs) => pipe(...tail(x_fs), id)(head(x_fs));
const spread = f => xs => f(...xs);
const collect = f => (...args) => f(args);
const flip = f => (...x) => (...y) => f(...y)(...x);
const repF = n => f => spread(pipe)(rep(n)(f));
const repA = n => f => (...x) => reduce(spread)(f)(rep(n)(x));
const double = repA(2);
const mapf = a => (...f) => wx => pipeN(a)(wx, ...f);
const apf = a => wf => wx => nAryAdv(a)(pipe(
	reduce(acc => args => juxt(acc)(...args))([wf, wx]),
	([f, x]) => f(x)
));
const chainf = a => f => wx => nAryAdv(a)(argss =>
	unCurryAdv(f( unCurryAdv(wx)(...argss) ))(...argss)
);
const liftf = a => n => f =>
	nAry(n)(args => reduce( apf(a) )( mapf(a)(f)(args[0]) )(tail(args)));
const contramapf = a => f => wx => nAryAdv(a)(
	reduce(acc => args => acc(...map(f)(args)))(wx)
);
const curryN = n => f => x => n > 1
	? curryN(n - 1)(f.bind(undefined, x))
	: f(x);
const curry = f => curryN(f.length)(f);
const unCurry = f => collect(reduce(id)(f));
const uc = unCurry;
const nAry = n => f => curryN(n)((...args) => f(args));
const curryAdv = n => f => (...x) => n > 1
	? curryAdv(n - 1)(f.bind(undefined, x))
	: f(x);
const unCurryAdv = f => (...argss) => argss.reduce(
	(accF, args) => accF(...args),
	f
);
const nAryAdv = n => f => curryAdv(n)((...args) => f(args));