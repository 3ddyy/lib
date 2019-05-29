const Right = x => ({
	map: f => Right(f(x)),
	ap: mf => mf.chain(f => Right(f(x))),
	chain: f => f(x),
	extend: f => Right(f(Right(x))),
	bimap: (_, f) => Right(f(x)),
	reduce: (f, z) => f(z, x),
	filter: p => p(x) ? Right(x) : Left("Filter failed"),
	filterM: (_, p) => map( mb => mb ? Right(x) : Left("Filter failed") )(p(x)),
	concat: y => y.isRight() ? Right(x.concat(y.catchExit())) : Right(x),
	alt: _ => Right(x),
	catch: _ => Right(x),
	catchExit: _ => x,
	isRight: _ => true,
	isLeft: _ => false,
	toStr: _ => `Right(${toStr(x)})`
});

const Left = e => ({
	map: _ => Left(e),
	ap: mf => mf.chain(_ => Left(e)),
	chain: _ => Left(e),
	extend: f => Right(f(Left(e))),
	bimap: (f, _) => Left(f(e)),
	reduce: (_, z) => z,
	filter: _ => Left(e),
	filterM: (M, _) => of(M)(Left(e)),
	concat: y => y.isRight() ? y : Left(e),
	alt: y => y.isRight() ? y : Left(e),
	catch: f => Right(f(e)),
	catchExit: f => f(e),
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
const catchExit = f => either => either.catchExit(f);
const isRight = m => m.isRight();
const isLeft = m => m.isLeft();