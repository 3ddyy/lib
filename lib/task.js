export {
	Task, ResTask,
	CTask, CResTask
};

const Task = comp => ({
	fork: comp,
	map: f => Task((rej, res) => comp(rej, x => void res(f(x)))),
	ap: mf => mf.chain(f => Task(comp).map(f)),
	chain: f => Task((rej, res) => comp(rej, x => f(x).fork(rej, res))),
	bimap: (f, g) => Task((rej, res) => comp(
		e => void rej(f(e)), x => void res(g(x))
	))
});
Task.of = x => Task((_, res) => void res(x));
Task.reject = e => Task((rej, _) => void rej(e));
Task.after = (x, t) => Task((_, res) => {
	const tID = setTimeout(_ => res(x), t);
	return { cancel: _ => clearTimeout(tID) };
});
Task.rejectAfter = (e, t) => Task((rej, _) => {
	const tID = setTimeout(_ => rej(e), t);
	return { cancel: _ => clearTimeout(tID) };
})

const ResTask = comp => ({
	fork: comp,
	map: f => ResTask(res => comp(x => void res(f(x)))),
	ap: mf => mf.chain(f => ResTask(comp).map(f)),
	chain: f => ResTask(res => comp(x => f(x).fork(res)))
});
ResTask.of = x => ResTask(res => { res(x) });
ResTask.after = (x, t) => ResTask(res => {
	const tID = setTimeout(_ => res(x), t);
	return { cancel: _ => clearTimeout(tID) };
});

const CTask = comp => ({
	fork: comp,
	map: f => CTask((rej, res) => comp(rej, x => void res(f(x)))),
	ap: mf => CTask((rej, res) => {
		const resd = {};
		const rejd = {};
		const t1 = mf.fork(e => {
			rej(e);
			rejd.f = e;
		}, f => void (!("x" in rejd)
			? "x" in resd
				? res(f(resd.x))
				: resd.f = f
			: null)
		);
		const t2 = comp(e => {
			rej(e);
			rejd.x = e;
		}, x => void (!("f" in rejd)
			? "f" in resd
				? res(resd.f(x))
				: resd.x = x
			: null)
		);
		return {cancel: _ => {
			t1.cancel();
			t2.cancel();
		}}
	}),
	bimap: (f, g) => CTask((rej, res) => comp(
		e => void rej(f(e)), x => void res(g(x))
	))
});
CTask.of = x => CTask((_, res) => void res(x));
CTask.reject = e => CTask((rej, _) => void rej(e));
CTask.after = (x, t) => CTask((_, res) => {
	const tID = setTimeout(_ => res(x), t);
	return { cancel: _ => clearTimeout(tID) };
});
CTask.rejectAfter = (e, t) => CTask((rej, _) => {
	const tID = setTimeout(_ => rej(e), t);
	return { cancel: _ => clearTimeout(tID) };
})

const CResTask = comp => ({
	fork: comp,
	map: f => CResTask(res => comp(x => void res(f(x)))),
	ap: mf => CResTask(res => {
		const resd = {};
		const t1 = mf.fork(f => void ("x" in resd
			? res(f(resd.x))
			: resd.f = f));
		const t2 = comp(x => void ("f" in resd
			? res(resd.f(x))
			: resd.x = x));
		return {cancel: _ => {
			t1.cancel();
			t2.cancel();
		}};
	})
});
CResTask.of = x => CResTask(res => { res(x) });
CResTask.after = (x, t) => CResTask(res => {
	const tID = setTimeout(_ => res(x), t);
	return { cancel: _ => clearTimeout(tID) };
});