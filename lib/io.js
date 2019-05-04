const IO = io => ({
	run: _ => io(),
	map: f => IO(_ => f(io())),
	ap: mf => IO(_ => mf()(io())),
	chain: f => IO(_ => f(io())())
})
IO.of = x => k(x);
IO.run = io => io.run();
IO.log = t => IO(_ => console.log(t));
IO.alert = message => IO(_ => window.alert(message));
IO.prompt = message => IO(_ => window.prompt(message));
IO.confirm = message => IO(_ => window.confirm(message));
IO.writeElem = t => elem => IO(_ => void (elem.innerHTML = t));
IO.writeDocument = t => IO(_ => document.write(t));
IO.random = IO(_ => Math.random());
IO.rndInt = min => max => IO(_ => rndInt(min)(max));
IO.rnd0Int = max => IO(_ => rndInt(max));
IO.rndElem = xs => IO(_ => rndElem(xs));
IO.rndIntPos = size => IO(_ => rndIntPos(size));
IO.rndIntPosExcept = avoid_pos => size => IO(
	_ => rndIntPosExcept(avoid_pos)(size)
);