const IO = {
	of: x => k(x),
	log: t => _ => { console.log(t); },
	alert: message => _ => { alert(message); },
	prompt: message => _ => prompt(message),
	writeElem: t => elem => _ => { elem.innerHTML = t; },
	writeDocument: t => _ => { document.write(t); }
};