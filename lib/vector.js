const Pos = (x, y) => ({
	x, y, isPos: true,
	concat: b => Pos(x + b.x, y + b.y),
	toStr: _ => `Pos(${toStr(x)}, ${toStr(y)})`,
	map: f => Pos(f(x), f(y)),
	ap: mf => Pos(mf.x(x), mf.y(y)),
	length: _ => Math.sqrt(x ** 2 + y ** 2),
	outside: ({x: rx = 0, y: ry = 0, w: rw, h: rh}) =>
		x < rx || x >= rw + rx || y < ry || y >= rh + ry,
	inside: rect => !Pos(x, y).outside(rect),
	putInside: (option, {x: rx = 0, y: ry = 0, w: rw, h: rh}) => {
		if (option == "mod") return Pos(
			mod(rw)(x - rx),
			mod(rh)(y - ry)
		);
		if (option == "nearest_edge") return Pos(
			clamp(rx)(rx + rw)(x),
			clamp(ry)(ry + rh)(y)
		);
	},
	equals: v => v.isPos && v.x === x && v.y === y,
	toSize: _ => Size(x, y),
	toRect: _ => Rect(x, y, 0, 0)
});
Pos.empty = _ => Pos(0, 0);
Pos.RIGHT     = _ => Pos( 1, 0);
Pos.UPRIGHT   = _ => Pos( 1,-1);
Pos.UP        = _ => Pos( 0,-1);
Pos.UPLEFT    = _ => Pos(-1,-1);
Pos.LEFT      = _ => Pos(-1, 0);
Pos.DOWNLEFT  = _ => Pos(-1, 1);
Pos.DOWN      = _ => Pos( 0, 1);
Pos.DOWNRIGHT = _ => Pos( 1, 1);
Pos.NONE      = _ => Pos( 0, 0);
Pos.ALL = _ => [
	Pos.RIGHT(),
	Pos.UPRIGHT(),
	Pos.UP(),
	Pos.UPLEFT(),
	Pos.LEFT(),
	Pos.DOWNLEFT(),
	Pos.DOWN(),
	Pos.DOWNRIGHT(),
	Pos.NONE()
];
const {RIGHT, UPRIGHT, UP, UPLEFT, LEFT, DOWNLEFT, DOWN, DOWNRIGHT, NONE} = Pos;
const ALL_DIRECTIONS = Pos.ALL;

const Size = (w, h) => ({
	w, h, isSize: true,
	concat: b => Size(w + b.w, h + b.h),
	toStr: _ => `Size(${toStr(w)}, ${toStr(h)})`,
	map: f => Size(f(w), f(h)),
	ap: mf => Size(mf.w(w), mf.h(h)),
	area: _ => w * h,
	ratio: _ => w / h,
	diagonal: _ => Math.sqrt(w ** 2 + h ** 2),
	equals: v => v.isSize && w === v.w && h === v.h,
	toPos: _ => Pos(w, h),
	toRect: _ => Rect(0, 0, w, h),
	rndIntPos: _ => Pos(rnd0Int(w), rnd0Int(h)),
	rndIntPosExcept: avoid_pos => {
		const size = Size(w, h);
		const pos = size.rndIntPos();
		const avoid_pos_valid = pipe(uniq, reject(outside(size)))(avoid_pos);
		if (len(avoid_pos_valid) >= size.area()) return Nothing();
		if (incl(pos)(avoid_pos_valid))
			return size.rndIntPosExcept(avoid_pos_valid);
		return Just(pos);
	},
	midPos: _ => Pos(w / 2, h / 2),
	/* Size().toRatio:
	minimize == false -> bigger Size, with ratio of newRatio
	minimize == true -> smaller Size, with ratio of newRatio */
	toRatio: (minimize, newRatio) => {
		if (w / h == newRatio) return Size(w, h);
		return xor(w / h < newRatio)(minimize)
			? Size(h * newRatio, h)
			: Size(w, w / newRatio);
	},
	toSquare: minimize => Size(w, h).toRatio(minimize, 1)
});
Size.empty = _ => Size(0, 0);
Size.matrixSize = matrix => Size(len(matrix[0]), len(matrix));

const Rect = (x, y, w, h) => ({
	x, y, w, h, isRect: true,
	concat: b => Rect(x + b.x, y + b.y, w + b.w, h + b.h),
	toStr: _ => `Rect(${toStr(x)}, ${toStr(y)}, ${toStr(w)}, ${toStr(h)})`,
	map: f => Rect(f(x), f(y), f(w), f(h)),
	ap: mf => Rect(mf.x(x), mf.y(y), mf.w(w), mf.h(h)),
	area: _ => w * h,
	ratio: _ => w / h,
	diagonal: _ => Math.sqrt(w ** 2 + h ** 2),
	equals: v => v.isRect && x === v.x && y === v.y && w === v.w && h === v.h,
	toPos: _ => Pos(x, y),
	toSize: _ => Size(w, h),
	sizeAsPos: _ => Pos(w, h),
	posAsSize: _ => Size(x, y),
	edgeRect: (margin, direction) => {
		const xy = liftN(3)(pos => size => dir =>
			dir < 0 ? pos :
			dir > 0 ? pos + size - margin :
				pos + margin
		);
		const wh = lift(size => dir => dir == 0 ? size - margin * 2 : margin );
		return Rect.fromPosSize(
			xy(Pos(x, y))(Pos(w, h))(direction),
			wh(Size(w, h))(direction.toSize())
		);
	},
	edgeRects: (margin, directions) =>
		directions.map(dir => Rect(x, y, w, h).edgeRect(margin, dir)),
	trim: margin => Rect(x, y, w, h).edgeRect(margin, NONE()),
	rndIntPos: _ => Pos(rndInt(x)(w), rndInt(y)(h)),
	rndIntPosExcept: avoid_pos => {
		const rect = Rect(x, y, w, h);
		const pos = rect.rndIntPos();
		const avoid_pos_valid = pipe(uniq, reject(outside(rect)))(avoid_pos);
		if (len(avoid_pos_valid) >= rect.area()) return Nothing();
		if (incl(pos)(avoid_pos_valid))
			return rect.rndIntPosExcept(avoid_pos_valid);
		return Just(pos);
	},
	midPos: _ => Pos(x + w / 2, y + h / 2),
	toRatio: (minimize, newRatio) => Rect.fromPosSize(
		Pos(x, y),
		Size(w, h).toRatio(minimize, newRatio)
	),
	toSquare: minimize => Rect(x, y, w, h).toRatio(minimize, 1)
});
Rect.empty = _ => Rect(0, 0, 0, 0);
Rect.fromPosSize = (pos, size) => Rect(pos.x, pos.y, size.w, size.h);

const wOf = obj => obj.width || obj.w;
const hOf = obj => obj.height || obj.h;
const sizeOf = lift(w => h => Size(w, h))(wOf)(hOf);
const vlen = pos => pos.length();
const vdiagonal = size => size.diagonal();
const dot = v => u => v.x * u.x + v.y * u.y;
const perpendicular = v => u => dot(v)(u) == 0;
const parallel = v => u => eqAny([v.y, u.y])(0)
	? v.y == u.y
	: v.x / v.y == u.x / u.y;
const outside = rect => pos => pos.outside(rect);
const inside = rect => pos => pos.inside(rect);
const sRatio = size => size.ratio();
const toRatio = min => newRatio => size => size.toRatio(min, newRatio);
const toSquare = min => size => size.toSquare(min);
const toPos = v => v.toPos();
const toSize = v => v.toSize();
const putInside = option => rect => pos => pos.putInside(option, rect);
const edgeRect = margin => dir => rect => rect.edgeRect(margin, dir);
const edgeRects = margin => dirs => rect => rect.edgeRects(margin, dirs);
const trim = margin => rect => rect.trim(margin);
const rndIntPos = size => size.rndIntPos();
const rndIntPosExcept = avoid_pos => size => size.rndIntPosExcept(avoid_pos);
const midPos = size => size.midPos();