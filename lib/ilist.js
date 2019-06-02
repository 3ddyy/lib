const IList = takeF => ({
	take: takeF,
	map: f => IList(n => takeF(n).map(f)),
	ap: mf => IList(n => zipWith(id)(mf.take(n))(takeF(n))),
	// filter: p => IList(n => {

	// })
});
IList.idxF = f => IList(n => fillArray(n)(f));
IList.of = x => IList.idxF(k(x));
IList.cycle = xs => IList.idxF(i => xs[i % xs.length]);