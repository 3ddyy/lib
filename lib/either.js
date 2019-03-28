const Right = x => ({
	val: x,
	map: f => Right(f(x)),
	ap: mf => mf.chain(f => Right(f(x))),
	chain: f => f(x),
	extend: f => Right(f(Right(x))),
	reduce: (f, z) => f(z, x),
	catch: _ => Right(x),
	toStr: _ => `Right(${toStr(x)})`,
	isRight: _ => true,
	isLeft: _ => false
});

const Left = e => ({
	val: e,
	map: _ => Left(e),
	ap: _ => Left(e),
	chain: _ => Left(e),
	extend: f => Right(f(Left(e))),
	reduce: (_, z) => z,
	catch: f => Right(f(e)),
	toStr: _ => `Left(${toStr(e)})`,
	isRight: _ => false,
	isLeft: _ => true
});

const Either = x => Right(x);
Either.Right = Right;
Either.Left = Left;
Either.of = x => Right(x);
Either.fromPossibleError = x => x instanceof Error ? Left(x) : Right(x);

const fromPossibleError = x => Either.fromPossibleError(x);
const isRight = m => m.isRight();
const isLeft = m => m.isLeft();