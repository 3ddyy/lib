import { pipe } from "./function.js";
import { cond, TRUE, UNDEF } from "./logic.js";

export { _dispatch, _ap, _chain, _lift };

const _dispatch = method => (...args) => (...options) => obj => {
	if (obj == null) return obj;
	if (obj[method]) return obj[method](...args);
	return cond([...options, [TRUE, UNDEF]])(obj);
};
const _ap = f => (...g) => (...x) => f(...x)(pipe(...g)(...x));
const _chain = f => (...g) => (...x) => f(pipe(...g)(...x))(...x);
const _lift = f => (...fns1) => (...fns2) => _ap(pipe(...fns1, f))(...fns2);