import { vals, mapk } from "./object.js";
import { isArr, isObj } from "./logic.js";
import { pipe } from "./function.js";
import { _dispatch } from "./internal.js";

export {
	arrayToString, objToString, toString, toStr,
	toLower, toUpper,
	splitStr, joinStr, forStr
};

const arrayToString = arr => "[ " + arr.map(toStr).join(", ") + " ]";
const objToString = obj =>
	"{ " + vals(mapk(v => k => `${k}: ${toStr(v)}`)(obj)).join(", ") + " }";
const toString = x => x.toString();
const toStr = _dispatch("toStr")()(
	[isArr,           arrayToString],
	[isObj,           objToString],
	[x => x.toString, x => x.toString()]
);
const toLower = str => str.toLowerCase();
const toUpper = str => str.toUpperCase();
const splitStr = spl => str => str.split(spl);
const joinStr = jn => xs => xs.join(jn);
const forStr = f => pipe( splitStr(""), f, joinStr("") );