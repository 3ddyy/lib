const Color = (r, g, b) => ({
	r, g, b,
	map: f => Color(f(r), f(g), f(b)),
	ap: mf => Color(mf.r(r), mf.g(g), mf.b(b)),
	isValid: _ => all(isNum)([r, g, b]) && all(inIncl(0)(255))([r, g, b]),
	toStr: _ => {
		if (!Color(r, g, b).isValid()) return undefined;
		const [r_, g_, b_] = [r, g, b].map(round);
		return `rgb(${r_}, ${g_}, ${b_})`;
	},
	toArray: _ => [r, g, b],
	toObj: _ => {r, g, b}
});
Color.gray = v => Color(v, v, v);
Color.black = _ => Color.gray(0);
Color.fromArray = xs => Color(...xs);
Color.fromObj = ({r, g, b}) => Color(r, g, b);
Color.interpolate = (cols, ps, t) =>
	liftArray(vs => interpolate(vs)(ps)(t))(cols);
Color.interpolateL = (cols, t) =>
	Color.interpolate(cols, percents(cols.length), t);
Color.interpolateI = (cols, ps, len, i) =>
	Color.interpolate(cols, ps, iToRatio(len)(i));
Color.interpolateLI = (cols, len, i) =>
	Color.interpolateL(cols, iToRatio(len)(i));

const interpolateC = cols => ps => t => Color.interpolate(cols, ps, t);
const interpolateCL = cols => t => Color.interpolateL(cols, t);
const interpolateCI = cols => ps => len => i =>
	Color.interpolateI(cols, ps, len, i);
const interpolateCLI = cols => len => i => Color.interpolateLI(cols, len, i);