import { rndInt, rnd0Int } from "./number.js";
import { rndElem } from "./array.js";
import { rndIntPos, rndIntPosExcept } from "./vector.js";
import { monadDo } from "./category_theory.js";

export { IO };

const IO = io => ({
	run: _ => io(),
	map: f => IO(_ => f(io())),
	ap: mf => IO(_ => mf.run()(io())),
	chain: f => IO(_ => f(io()).run())
});
IO.of = x => IO(_ => x);
IO.void = _ => IO(_ => undefined);
IO.run = io => io.run();
IO.log = t => IO(_ => console.log(t));
IO.alert = message => IO(_ => window.alert(message));
IO.prompt = message => IO(_ => window.prompt(message));
IO.confirm = message => IO(_ => window.confirm(message));
IO.update = read => write => f => monadDo(IO)(({doKeep, doVoid, set, of}) =>
	doKeep( read )(x =>
	set( f(x) )(x_ =>
	doVoid( write(x_) )(
	of(x_)
	)))
);
IO.writeProp = prop => x => obj => IO(_ => void (obj[prop] = x));
IO.readProp = prop => obj => IO(_ => obj[prop]);
IO.updateProp = prop => f => obj =>
	IO.update(IO.readProp(prop)(obj))(x => IO.writeProp(prop)(x)(obj))(f);
IO.writeInnerHTML = IO.writeProp("innerHTML");
IO.writeInnerText = IO.writeProp("innerText");
IO.writeTextContent = IO.writeProp("textContent")
IO.writeValue = IO.writeProp("value");
IO.writeValueAsNum = IO.writeProp("valueAsNumber");
IO.writeDocument = t => IO(_ => document.write(t));
IO.writeStyle = prop => s => elem => IO.writeProp(prop)(s)(elem.style);
IO.writeCssText = IO.writeStyle("cssText");
IO.readInnerHTML = IO.readProp("innerHTML");
IO.readInnerText = IO.readProp("innerText");
IO.readTextContent = IO.readProp("textContent");
IO.readValue = IO.readProp("value");
IO.readValueAsNum = IO.readProp("valueAsNumber");
IO.readStyle = prop => elem => IO.readProp(prop)(elem.style);
IO.readCssText = IO.readStyle("cssText");
IO.updateInnerHTML = IO.updateProp("innerHTML");
IO.updateInnerText = IO.updateProp("innerText");
IO.updateTextContent = IO.updateProp("textContent");
IO.updateValue = IO.updateProp("value");
IO.updateValueAsNum = IO.updateProp("valueAsNumber");
IO.updateStyle = prop => f => elem => IO.updateProp(prop)(f)(elem.style);
IO.updateCssText = IO.updateStyle("cssText");
IO.random = IO(_ => Math.random());
IO.rndInt = min => max => IO(_ => rndInt(min)(max));
IO.rnd0Int = max => IO(_ => rnd0Int(max));
IO.rndElem = xs => IO(_ => rndElem(xs));
IO.rndIntPos = size => IO(_ => rndIntPos(size));
IO.rndIntPosExcept = avoid_pos => size => IO(
	_ => rndIntPosExcept(avoid_pos)(size)
);
IO.now = IO(_ => Date.now());
IO.performanceNow = IO(_ => performance.now());
IO.requestAnimationFrame = io => IO(_ =>
	requestAnimationFrame(t => io(t).run())
);
IO.cancelAnimationFrame = id => IO(_ => cancelAnimationFrame(id));