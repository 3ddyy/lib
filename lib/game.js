const Game = ({
	events = {}, // :: {String: Event -> World -> IO World}
	manualEvent = id, // :: * -> World -> IO World
	initialWorld, // :: IO World
	update, // :: Number -> World -> IO World -- Number is deltatime in ms
	display, // :: World -> IO
	shouldReject = _ => Nothing(), // :: World -> Maybe * -- if Just, reject with value
	shouldResolve = _ => Nothing(), // :: World -> Maybe * -- if Just, resolve with value
}) => Task((rej, res) => {
	const eventFunctions = map(f => e => { world = f(e)(world)(); })(events);
	mapk(v => k => document.addEventListener(k, v))(eventFunctions);

	let loop;
	let world = initialWorld();

	const cancel = _ => {
		window.cancelAnimationFrame(loop);
		mapk(v => k => document.removeEventListener(k, v))(eventFunctions);
	};
	const sendManual = e => _ => { world = manualEvent(e)(world)(); };
	const reset = _ => { world = initialWorld(); };
	const getWorld = _ => world;
	const setWorld = w => _ => { world = w; };
	const updateWorld = f => _ => { world = f(world); };

	const tick = t0 => t => {
		const dt = t - t0;
		world = update(dt)(world)();
		display(world)();

		if (map(res)(shouldResolve(world)).isJust()) {
			cancel();
			return;
		};

		if (map(rej)(shouldReject(world)).isJust()) {
			cancel();
			return;
		};

		loop = window.requestAnimationFrame(tick(t));
	};
	loop = window.requestAnimationFrame(tick(performance.now()));

	return {cancel, sendManual, reset, getWorld, setWorld, updateWorld};
});