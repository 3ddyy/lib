const Right = x => ({
	val: x,
	map: f => Right(f(x)),
	ap: mf => mf.chain(f => Right(f(x))),
	chain: f => f(x),
	extend: f => Right(f(Right(x))),
	reduce: (f, z) => f(z, x),
	filter: p => p(x) ? Right(x) : Left("No value"),
	catch: _ => Right(x),
	isRight: _ => true,
	isLeft: _ => false,
	toStr: _ => `Right(${toStr(x)})`
});

const Left = e => ({
	val: e,
	map: _ => Left(e),
	ap: _ => Left(e),
	chain: _ => Left(e),
	extend: f => Right(f(Left(e))),
	reduce: (_, z) => z,
	filter: _ => Left(e),
	catch: f => Right(f(e)),
	isRight: _ => false,
	isLeft: _ => true,
	toStr: _ => `Left(${toStr(e)})`
});

const Either = x => Right(x);
Either.Right = Right;
Either.Left = Left;
Either.of = x => Right(x);
Either.fromPossibleError = x => x instanceof Error ? Left(x) : Right(x);

const fromPossibleError = x => Either.fromPossibleError(x);
const eCatch = f => either => either.catch(f);
const isRight = m => m.isRight();
const isLeft = m => m.isLeft();