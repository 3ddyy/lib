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
IO.writeInnerHTML = t => elem => IO(_ => void (elem.innerHTML = t));
IO.writeInnerText = t => elem => IO(_ => void (elem.innerText = t));
IO.writeTextContent = t => elem => IO(_ => void (elem.textContent = t));
IO.writeValue = v => elem => IO(_ => void (elem.value = v));
IO.writeValueAsNum = n => elem => IO(_ => void (elem.valueAsNumber = n));
IO.writeDocument = t => IO(_ => document.write(t));
IO.writeStyle = prop => s => elem => IO(_ => void (elem.style[prop] = s));
IO.writeCssText = IO.writeStyle("cssText");
IO.readInnerHTML = elem => IO(_ => elem.innerHTML);
IO.readInnerText = elem => IO(_ => elem.innerText);
IO.readTextContent = elem => IO(_ => elem.textContent);
IO.readValue = elem => IO(_ => elem.value);
IO.readValueAsNum = elem => IO(_ => elem.valueAsNumber);
IO.readStyle = prop => elem => IO(_ => elem.style[prop]);
IO.readCssText = IO.readStyle("cssText");
IO.updateInnerHTML = f => elem => pipeK0( IO.readInnerHTML(elem), t => IO(_ => {
	const newT = f(t);
	IO.writeInnerHTML(newT)(elem).run();
	return newT;
}) );
IO.updateInnerText = f => elem => pipeK0( IO.readInnerText(elem), t => IO(_ => {
	const newT = f(t);
	IO.writeInnerText(newT)(elem).run();
	return newT;
}) );
IO.updateTextContent = f => elem => pipeK0(
	IO.readTextContent(elem),
	t => IO(_ => {
		const newT = f(t);
		IO.writeInnerText(newT)(elem).run();
		return newT;
	})
);
IO.updateValue = elem => f => pipeK0( IO.readValue(elem), v => IO(_ => {
	const newV = f(v)
	IO.writeValue(newV)(elem).run();
	return newV;
}) );
IO.updateValueAsNum = elem => f => pipeK0( IO.readValueAsNum(elem), n => IO(_ => {
	const newN = f(n)
	IO.writeValueAsNum(newN)(elem).run();
	return newN;
}) );
IO.updateStyle = prop => elem => f => pipeK0( IO.readStyle(prop)(elem), s => IO(_ => {
	const newS = f(s)
	IO.writeStyle(prop)(newS)(elem).run();
	return newS;
}) );
IO.updateCssText = elem => f => pipeK0( IO.readCssText(elem), t => IO(_ => {
	const newT = f(t)
	IO.writeCssText(newT)(elem).run();
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