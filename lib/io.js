const IO = io => ({
	run: _ => io(),
	map: f => IO(_ => f(io())),
	ap: mf => IO(_ => mf.run()(io())),
	chain: f => IO(_ => f(io()).run())
})
IO.of = x => IO(_ => x);
IO.void = _ => IO(_ => undefined);
IO.run = io => io.run();
IO.log = t => IO(_ => console.log(t));
IO.alert = message => IO(_ => window.alert(message));
IO.prompt = message => IO(_ => window.prompt(message));
IO.confirm = message => IO(_ => window.confirm(message));
IO.writeElem = t => elem => IO(_ => void (elem.innerHTML = t));
IO.writeValue = v => elem => IO(_ => void (elem.value = v));
IO.writeValueAsNum = n => elem => IO(_ => void (elem.valueAsNumber = n));
IO.writeDocument = t => IO(_ => document.write(t));
IO.writeStyle = prop => s => elem => IO(_ => void (elem.style[prop] = s));
IO.writeCssText = IO.writeStyle("cssText");
IO.readElem = elem => IO(_ => elem.innerHTML);
IO.readValue = elem => IO(_ => elem.value);
IO.readValueAsNum = elem => IO(_ => elem.valueAsNumber);
IO.readStyle = prop => elem => IO(_ => elem.style[prop]);
IO.readCssText = IO.readStyle("cssText");
IO.updateElem = f => elem => pipeK0( IO.readElem(elem), t => IO(_ => {
	const newT = f(t);
	IO.writeElem(elem)(newT).run();
	return newT;
}) );
IO.updateValue = elem => f => pipeK0( IO.readValue(elem), v => IO(_ => {
	const newV = f(v)
	IO.writeValue(elem)(newV).run();
	return newV;
}) );
IO.updateValueAsNum = elem => f => pipeK0( IO.readValueAsNum(elem), n => IO(_ => {
	const newN = f(n)
	IO.writeValueAsNum(elem)(newN).run();
	return newN;
}) );
IO.updateStyle = prop => elem => f => pipeK0( IO.readStyle(prop)(elem), s => IO(_ => {
	const newS = f(s)
	IO.writeStyle(prop)(elem)(newS).run();
	return newS;
}) );
IO.updateCssText = elem => f => pipeK0( IO.readCssText(elem), t => IO(_ => {
	const newT = f(t)
	IO.writeCssText(elem)(newT).run();
	return newT;
}) );
IO.random = IO(_ => Math.random());
IO.rndInt = min => max => IO(_ => rndInt(min)(max));
IO.rnd0Int = max => IO(_ => rndInt(max));
IO.rndElem = xs => IO(_ => rndElem(xs));
IO.rndIntPos = size => IO(_ => rndIntPos(size));
IO.rndIntPosExcept = avoid_pos => size => IO(
	_ => rndIntPosExcept(avoid_pos)(size)
);