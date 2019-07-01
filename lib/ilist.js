import { fillArray } from "./array.js";

export { IList };

const IList = listF => ({
	f: listF,
	take: n => fillArray(n)(listF),
	map: f => IList(i => f(listF(i))),
	ap: mf => IList(i => mf.f(i)(listF(i))),
});
IList.of = x => IList(k(x));
IList.cycle = xs => IList(i => xs[i % xs.length]);