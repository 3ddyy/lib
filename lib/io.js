const IO = {
	of: x => k(x),
	log: t => _ => { console.log(t); },
	alert: message => _ => window.alert(message),
	prompt: message => _ => window.prompt(message),
	confirm: message => _ => window.confirm(message),
	writeElem: t => elem => _ => { elem.innerHTML = t; },
	writeDocument: t => _ => { document.write(t); }
};