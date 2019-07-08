import { ifelse, unless } from "./logic.js";
import { k, pipe } from "./function.js";
import { percents } from "./array.js";
import { chain } from "./category_theory.js"

export {
	add, sub, mul, div, pow, inc, dec, sqrt, fact,
	gt, lt, gte, lte,
	max, min, inIncl, inExcl, clamp,
	mod, modSym,
	fl, round, magnitude, floorAt, roundAt,
	parseBase, toBase, parseHex, toHex,
	toPercent, rndInt, rnd0Int,
	iToRatio, numToRatio, lerp, scale,
	interpolate, interpolateL, interpolateI, interpolateLI,
	frameTime
};

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
const inIncl = min => max => lift(and)(gte(min))(lte(max));
const inExcl = min => max => lift(and)(gt(min))(lt(max));
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
const parseBase = b => n => parseInt(n, b);
const toBase = b => n => n.toString(b);
const parseHex = parseBase(16);
const toHex = toBase(16);
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
const frameTime = fps => fps && 1/fps;