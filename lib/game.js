const Game = ({
	events = {}, // :: {String: Event -> World -> IO World}
	manualEvent = e => w => IO.of(e(w)), // :: a -> World -> IO World
	initialWorld, // :: IO World
	update, // :: Number -> World -> IO World -- Number is deltatime in seconds
	display, // :: World -> IO ()
	shouldReject = _ => Nothing(), // :: World -> Maybe * -- if Just, reject with value
	shouldResolve = _ => Nothing(), // :: World -> Maybe * -- if Just, resolve with value
}) => Task((rej, res) => {
	const eventFunctions = map(f => (
		e => void (world = f(e)(world).run())
	))(events);
	mapk(v => k => document.addEventListener(k, v))(eventFunctions);

	let loop;
	let world = initialWorld.run();

	const cancel = IO(_ => {
		window.cancelAnimationFrame(loop);
		mapk(v => k => document.removeEventListener(k, v))(eventFunctions);
	});
	const sendManual = e => IO(_ => world = manualEvent(e)(world).run());
	const reset = IO(_ => world = initialWorld.run());
	const getWorld = IO(_ => world);
	const setWorld = w => IO(_ => void (world = w));
	const updateWorld = f => IO(_ => world = f(world));

	const tick = t0 => t => {
		const dt = (t - t0) / 1000;
		world = update(dt)(world).run();
		display(world).run();

		if (map(res)(shouldResolve(world)).isJust()) {
			cancel.run();
			return;
		};

		if (map(rej)(shouldReject(world)).isJust()) {
			cancel.run();
			return;
		};

		loop = window.requestAnimationFrame(tick(t));
	};
	loop = window.requestAnimationFrame(tick(performance.now()));

	return {cancel, sendManual, reset, getWorld, setWorld, updateWorld};
});