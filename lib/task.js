const Task = comp => ({
	fork: comp,
	map: f => Task((rej, res) => comp(rej, x => { res(f(x)) })),
	ap: mf => mf.chain(f => Task(comp).map(f)),
	chain: f => Task((rej, res) => comp(rej, x => f(x).fork(rej, res)))
});
Task.of = x => Task((_, res) => { res(x) });
Task.after = (x, t) => Task((_, res) => {
	const id = setTimeout(_ => res(x), t);
	return { cancel: _ => clearTimeout(id) };
});

const ResTask = comp => ({
	fork: comp,
	map: f => ResTask(res => comp(x => { res(f(x)) })),
	ap: mf => mf.chain(f => ResTask(comp).map(f)),
	chain: f => ResTask(res => comp(x => f(x).fork(res)))
});
ResTask.of = x => ResTask(res => { res(x) });
ResTask.after = (x, t) => ResTask(res => {
	const id = setTimeout(_ => res(x), t);
	return { cancel: _ => clearTimeout(id) };
});