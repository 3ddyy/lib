const IO = f => f;
IO.of = x => k(x);
IO.log = t => _ => console.log(t);
IO.alert = message => _ => window.alert(message);
IO.prompt = message => _ => window.prompt(message);
IO.confirm = message => _ => window.confirm(message);
IO.writeElem = t => elem => _ => void (elem.innerHTML = t);
IO.writeDocument = t => _ => document.write(t);