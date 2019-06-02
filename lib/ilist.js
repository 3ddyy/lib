const IList = listF => ({
	f: listF,
	map: f => IList(i => f(listF(i))),
	ap: mf => IList(i => mf.f(i)(listF(i))),
	take: n => fillArray(n)(listF)
});
IList.of = x => IList(k(x));
IList.cycle = xs => IList(i => xs[i % xs.length]);