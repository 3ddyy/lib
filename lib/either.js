import { map, of, concatL } from "./category_theory.js";
import { toStr } from "./string.js";

export {
	Right, Left, Either,
	fromPossibleError,
	eCatch, catchExit,
	fromLeft, fromRight, isLeft, isRight
};

const Left = x => ({
	map: _ => Left(x),
	ap: mf => mf.chain(_ => Left(x)),
	chain: _ => Left(x),
	extend: f => Right(f(Left(x))),
	bimap: (f, _) => Left(f(x)),
	lmap: f => Left(f(x)),
	reduce: (_, z) => z,
	filter: _ => Left(x),
	filterM: (M, _) => of(M)(Left(x)),
	concat: y => y.isRight() ? y : Left(x),
	alt: y => y.isRight() ? y : Left(x),
	catch: f => Right(f(x)),
	catchExit: f => f(x),
	fromLeft: _ => x,
	fromRight: d => d,
	isLeft: _ => true,
	isRight: _ => false,
	toStr: _ => `Left(${toStr(x)})`
});

const Right = x => ({
	map: f => Right(f(x)),
	ap: mf => mf.chain(f => Right(f(x))),
	chain: f => f(x),
	extend: f => Right(f(Right(x))),
	bimap: (_, f) => Right(f(x)),
	lmap: _ => Right(x),
	reduce: (f, z) => f(z, x),
	filter: p => p(x) ? Right(x) : Left("Filter failed"),
	filterM: (_, p) => map( mb => mb ? Right(x) : Left("Filter failed") )(p(x)),
	concat: y => y.isRight() ? Right(concatL(x)(y.catchExit())) : Right(x),
	alt: _ => Right(x),
	catch: _ => Right(x),
	catchExit: _ => x,
	fromLeft: d => d,
	fromRight: _ => x,
	isLeft: _ => false,
	isRight: _ => true,
	toStr: _ => `Right(${toStr(x)})`
});

const Either = x => Right(x);
Either.Right = Right;
Either.Left = Left;
Either.of = x => Right(x);
Either.fromPossibleError = x => x instanceof Error ? Left(x) : Right(x);

const fromPossibleError = x => Either.fromPossibleError(x);
const eCatch = f => either => either.catch(f);
const catchExit = f => either => either.catchExit(f);
const fromLeft = d => m => m.fromLeft(d);
const fromRight = d => m => m.fromRight(d);
const isLeft = m => m.isLeft();
const isRight = m => m.isRight();