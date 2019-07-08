import { map, of, concatL } from "./category_theory.js";
import { toStr } from "./string.js";

export {
	Right, Left, Either,
	fromPossibleError,
	getLeft, getRight, toLeft, toRight,
	isLeft, isRight,
	flipE, either
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
	getLeft: _ => x,
	getRight: d => d,
	toLeft: _ => Left(x),
	toRight: f => Right(f(x)),
	isLeft: _ => true,
	isRight: _ => false,
	flip: _ => Right(x),
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
	concat: y => y.isRight() ? Right(concatL(x)(y.getRight())) : Right(x),
	alt: _ => Right(x),
	getLeft: d => d,
	getRight: _ => x,
	toLeft: f => Left(f(x)),
	toRight: _ => Right(x),
	isLeft: _ => false,
	isRight: _ => true,
	flip: _ => Left(x),
	toStr: _ => `Right(${toStr(x)})`
});

const Either = x => Right(x);
Either.Right = Right;
Either.Left = Left;
Either.of = x => Right(x);
Either.fromPossibleError = x => x instanceof Error ? Left(x) : Right(x);

const fromPossibleError = x => Either.fromPossibleError(x);
const getLeft = d => e => e.getLeft(d);
const getRight = d => e => e.getRight(d);
const toLeft = f => e => e.toLeft(f);
const toRight = f => e => e.toRight(f);
const isLeft = e => e.isLeft();
const isRight = e => e.isRight();
const flipE = e => e.flip();
const either = f => g => e => e.isLeft() ? f(e.getLeft()) : g(e.getRight());