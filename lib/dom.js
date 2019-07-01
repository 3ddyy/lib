export {
	getElem,
	qSel, qSelAll,
	children
};

const getElem = id => document.getElementById(id);
const qSel = q => document.querySelector(q);
const qSelAll = q => document.querySelectorAll(q);
const children = elem => elem.children;