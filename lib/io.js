const IO = io => ({
	run: _ => io(),
	map: f => IO(_ => f(io())),
	ap: mf => IO(_ => mf.run()(io())),
	chain: f => IO(_ => f(io()).run())
})
IO.of = x => IO(_ => x);
IO.run = io => io.run();
IO.log = t => IO(_ => console.log(t));
IO.alert = message => IO(_ => window.alert(message));
IO.prompt = message => IO(_ => window.prompt(message));
IO.confirm = message => IO(_ => window.confirm(message));
IO.writeElem = t => elem => IO(_ => void (elem.innerHTML = t));
IO.writeValue = v => elem => IO(_ => void (elem.value = v));
IO.writeValueAsNum = n => elem => IO(_ => void (elem.valueAsNumber = n));
IO.writeDocument = t => IO(_ => document.write(t));
IO.writeStyle = prop => t => elem => IO(_ => elem.style[prop] = t);
IO.writeCssText = IO.writeStyle("cssText");
IO.readElem = elem => IO(_ => elem.innerHTML);
IO.readValue = elem => IO(_ => elem.value);
IO.readValueAsNum = elem => IO(_ => elem.valueAsNumber);
IO.readStyle = prop => elem => IO(_ => elem.style[prop]);
IO.readCssText = IO.readStyle("cssText");
IO.updateElem = f => elem => pipeK0(
	IO.readElem(elem),
	t => IO.writeElem(f(t))(elem)
);
IO.updateValue = f => elem => pipeK0(
	IO.readValue(elem),
	v => IO.writeValue(f(v))(elem)
);
IO.updateValueAsNum = f => elem => pipeK0(
	IO.readValueAsNum(elem),
	n => IO.writeValueAsNum(f(n))(elem)
);
IO.updateStyle = prop => f => elem => pipeK0(
	IO.readStyle(prop)(elem),
	s => IO.writeStyle(prop)(f(s))(elem)
);
IO.updateCssText = f => elem => pipeK0(
	IO.readCssText(elem),
	t => IO.writeCssText(f(t))(elem)
);
IO.random = IO(_ => Math.random());
IO.rndInt = min => max => IO(_ => rndInt(min)(max));
IO.rnd0Int = max => IO(_ => rndInt(max));
IO.rndElem = xs => IO(_ => rndElem(xs));
IO.rndIntPos = size => IO(_ => rndIntPos(size));
IO.rndIntPosExcept = avoid_pos => size => IO(
	_ => rndIntPosExcept(avoid_pos)(size)
);