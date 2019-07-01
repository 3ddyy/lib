import { all, isNum } from "./logic.js";
import { toStr } from "./string.js";
import { inIncl, interpolate, parseHex, iToRatio } from "./number.js";
import { tail, take, slice, takeEnd, percents } from "./array.js";
import { map, juxt, liftArray } from "./category_theory.js";
import { pipe } from "./function.js";
import { Triple } from "./pair.js";

export {
	Color, toColorStr,
	interpolateC, interpolateCL, interpolateCI, interpolateCLI
};

const Color = (r, g, b) => ({
	r, g, b,
	map: f => Color(f(r), f(g), f(b)),
	ap: mf => Color(mf.r(r), mf.g(g), mf.b(b)),
	isValid: _ => all(isNum)([r, g, b]) && all(inIncl(0)(255))([r, g, b]),
	toColorStr: _ => {
		if (!Color(r, g, b).isValid()) return undefined;
		const [r_, g_, b_] = [r, g, b].map(round);
		return `rgb(${r_}, ${g_}, ${b_})`;
	},
	toArray: _ => [r, g, b],
	toObj: _ => {r, g, b},
	toStr: _ => `Color(${toStr(r)}, ${toStr(g)}, ${toStr(b)})`
});
Color.of = x => Color(x, x, x);
Color.gray = v => Color(v, v, v);
Color.black = _ => Color.gray(0);
Color.fromArray = xs => Color(...xs);
Color.fromObj = ({r, g, b}) => Color(r, g, b);
Color.fromTriple = ({a, b, c}) => Color(a, b, c);
Color.fromHex = pipe(
	tail,
	juxt( Triple(take(2), slice(2)(4), takeEnd(2)) ),
	map(parseHex),
	Color.fromTriple
);
Color.interpolate = (cols, ps, t) =>
	liftArray(vs => interpolate(vs)(ps)(t))(cols);
Color.interpolateL = (cols, t) =>
	Color.interpolate(cols, percents(cols.length), t);
Color.interpolateI = (cols, ps, len, i) =>
	Color.interpolate(cols, ps, iToRatio(len)(i));
Color.interpolateLI = (cols, len, i) =>
	Color.interpolateL(cols, iToRatio(len)(i));

const toColorStr = col => col.toColorStr();
const interpolateC = cols => ps => t => Color.interpolate(cols, ps, t);
const interpolateCL = cols => t => Color.interpolateL(cols, t);
const interpolateCI = cols => ps => len => i =>
	Color.interpolateI(cols, ps, len, i);
const interpolateCLI = cols => len => i => Color.interpolateLI(cols, len, i);