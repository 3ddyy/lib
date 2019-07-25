import { _dispatch } from "./internal.js";
import { prop, vals, mapk, filterk } from "./object.js";
import { eq, isObj, isF, isArr, complement } from "./logic.js";
import { tail, drop, arrayFilterM, len } from "./array.js";
import {
	pipe, pipe0, pipeWith, unCurry, nAry, mapf, apf, chainf, k, t, id, flip
} from "./function.js";

export {
	map, constmap, bimap, pluck, juxt,
	ap, liftN, lift, liftArray, of,
	reduce, reduceRight, reduceM,
	chain, constchain, join,
	guard,
	extend, extract,
	traverse, sequence,
	contramap,
	filter, reject, filterM, rejectM,
	concat, concatL, empty,
	alt, zero,
	composeS, idC,
	pipeC, pipeK, pipeK0, pipeconstK,
	monadDo
};

const map = (...fns) => _dispatch("map")(pipe(...fns))(
	[isF,   mapf(1)(...fns)],
	[isObj, mapk(x => _ => pipe(...fns)(x))]
);
const constmap = x => map(k(x));
const bimap = f => g => _dispatch("bimap")(f, g)();
const pluck = k => map(prop(k));
const juxt = mf => (...x) => map(t(...x))(mf);
const ap = mf => _dispatch("ap")(mf)(
	[isArr, mx => reduce(a => f => concatL(a)(map(f)(mx)))([])(mf)],
	[isF,   apf(1)(mf)]
);
const liftN = n => f => nAry(n)
	(args => reduce(ap)(map(f)(args[0]))(tail(args)));
const lift = liftN(2);
const liftArray = f => ms => {
	const arity = len(ms);
	return unCurry( liftN(arity)(nAry(arity)(f)) )(...ms);
};
const of = C => v => _dispatch("of")(v)(
	[eq(Function), k(k(v))]
)(C);
const reduce = f => z => _dispatch("reduce")((acc, x) => f(acc)(x), z)(
	[isObj, o => reduce(f)(z)(vals(o))]
);
const reduceRight = f => z => _dispatch("reduceRight")(
	(acc, x) => f(acc)(x), z
)([isObj, o => reduce(f)(z)(pipe(vals, reverse)(o))]);
const reduceM = M => f => z => reduce(
	acc => x => chain(acc => f(acc)(x))(acc)
)(of(M)(z));
const chain = f => _dispatch("chain")(f)(
	[isArr, xs => xs.flatMap(f)],
	[isF,   chainf(1)(f)]
);
const constchain = mb => chain(k(mb));
const join = m => chain(id)(m);
const guard = M => bool => bool ? of(M)(undefined) : zero(M);
const extend = f => _dispatch("extend")(f)(
	[isArr, xs => mapi(_ => i => f(drop(i)(xs)))(xs)]
);
const extract = _dispatch("extract")()();
const traverse = A => f => _dispatch("traverse")(A, f)(
	[isArr, reduce( acc => x => lift(flip(append))(acc)(f(x)) )(A.of([]))],
);
const sequence = A => traverse(A)(id);
const contramap = f => _dispatch("contramap")(f)(
	[isF,  contramapf(1)(f)]
);
const filter = p => _dispatch("filter")(p)(
	[isObj, o => filterk(x => _ => p(x))(o)]
);
const reject = f => filter(complement(f));
const filterM = M => p => _dispatch("filterM")(M, p)(
	[isArr, arrayFilterM(M)(p)]
);
const rejectM = M => p => filterM(M)(x => map(not)(p(x)));
const concat = y => _dispatch("concat")(y)();
const concatL = x => y => concat(y)(x);
const empty = _dispatch("empty")()(
	[eq(Array),    _ => []],
	[eq(String),   _ => ""]
);
const alt = y => _dispatch("alt")(y)(
	[isArr, concatL]
);
const zero = _dispatch("zero")()(
	[eq(Array), _ => []]
);
const composeS = g => _dispatch("compose")(g)(
	[isF, map(g)]
);
const idC = _dispatch("id")()(
	[eq(Function), _ => id]
);
const pipeC = (...fs) => pipeWith(chain)(...fs);
const pipeK = (...fs) => pipe(fs[0], pipeC(...tail(fs)));
const pipeK0 = (...m_fs) => pipe0(m_fs[0], pipeC(...tail(m_fs)));
const pipeconstK = (...ms) => pipe0(
	ms[0],
	pipeWith(constchain)(...tail(ms))
);
const monadDo = Monad => t({
	doKeep: flip(chain),
	doVoid: flip(constchain),
	set: t,
	pure: of(Monad),
	guard: guard(Monad)
});