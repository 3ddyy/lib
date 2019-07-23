import { map, of, concatL } from "./category_theory.js";
import { toStr } from "./string.js";

export {
	Right, Left, Either,
	fromPossibleError,
	getLeft, getRight, isLeft, isRight,
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
	getRight: f => f(x),
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
	getLeft: f => f(x),
	getRight: _ => x,
	isLeft: _ => false,
	isRight: _ => true,
	flip: _ => Left(x),
	toStr: _ => `Right(${toStr(x)})`
});

const Either = {};
Either.Right = Right;
Either.Left = Left;
Either.of = x => Right(x);

// fromPossibleError :: a | Error -> Either Error a
const fromPossibleError = x => x instanceof Error ? Left(x) : Right(x);
// getLeft :: (a -> b) -> Either b a -> b
const getLeft = f => e => e.getLeft(f);
// getRight :: (a -> b) -> Either a b -> b
const getRight = f => e => e.getRight(f);
// isLeft :: Either a b -> Bool
const isLeft = e => e.isLeft();
// isRight :: Either a b -> Bool
const isRight = e => e.isRight();
// flipE :: Either a b -> Either b a
const flipE = e => e.flip();
// either :: (a -> c) -> (b -> c) -> Either a b -> c
const either = f => g => pipe(map(g), getRight(f));