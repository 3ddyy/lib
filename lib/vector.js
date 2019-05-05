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
			mod(rw)(x - rx) + rx,
			mod(rh)(y - ry) + ry
		);
		if (option == "nearest_edge") return Pos(
			clamp(rx)(rx + rw - 1)(x),
			clamp(ry)(ry + rh - 1)(y)
		);
	},
	equals: v => v.isPos && eq(x)(v.x) && eq(y)(v.y),
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
	perimeter: _ => 2 * (w + h),
	ratio: _ => w / h,
	diagonal: _ => Math.sqrt(w ** 2 + h ** 2),
	equals: v => v.isSize && eq(w)(v.w) && eq(h)(v.h),
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
	perimeter: _ => 2 * (w + h),
	ratio: _ => w / h,
	diagonal: _ => Math.sqrt(w ** 2 + h ** 2),
	equals: v => v.isRect && eq(x)(v.x) && eq(y)(v.y) && eq(w)(v.w) && eq(h)(v.h),
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
		const wh = lift(size => dir => dir == 0 ? size - margin * 2 : margin);
		return Rect.fromPosSize(
			xy(Pos(x, y))(Pos(w, h))(direction),
			wh(Size(w, h))(direction.toSize())
		);
	},
	edgeRects: (margin, directions) => {
		const rect = Rect(x, y, w, h);
		map(dir => rect.edgeRect(margin, dir))(directions);
	},
	trim: margin => Rect(x, y, w, h).edgeRect(margin, NONE()),
	rndIntPos: _ => Pos(rndInt(x)(x + w), rndInt(y)(y + h)),
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

const Pos3D = (x, y, z) => ({
	x, y, z, isPos3D: true,
	concat: b => Pos3D(x + b.x, y + b.y, z + b.x),
	toStr: _ => `Pos3D(${toStr(x)}, ${toStr(y)}, ${toStr(z)})`,
	map: f => Pos3D(f(x), f(y), f(z)),
	ap: mf => Pos3D(mf.x(x), mf.y(y), mf.z(z)),
	length: _ => Math.sqrt(x ** 2 + y ** 2 + z ** 2),
	outside: ({x: cx = 0, y: cy = 0, z: cz = 0, w: cw, h: ch, d: cd}) =>
		x < cx || x > cx + cw || y < cy || y > cy + ch || z < cz || z > cz + cd,
	inside: cuboid => !Pos3D(x, y, z).outside(cuboid),
	putInside: (option, {x:cx = 0, y:cy = 0, z:cz = 0, w:cw, h:ch, d:cd}) => {
		if (option == "mod") return Pos3D(
			mod(cw)(x - cx) + cx,
			mod(ch)(y - cy) + cy,
			mod(cd)(z - cz) + cz
		);
		if (option == "nearest_edge") return Pos3D(
			clamp(cx)(cx + cw - 1)(x),
			clamp(cy)(cy + ch - 1)(y),
			clamp(cz)(cz + cd - 1)(z)
		);
	},
	equals: v => v.isPos3D && eq(v.x)(x) && eq(v.y)(y) && eq(v.z)(z),
	toSize: _ => Size3D(x, y, z),
	toCuboid: _ => Cuboid(x, y, z, 0, 0, 0)
});
Pos3D.empty = _ => Pos3D(0, 0, 0);

const Size3D = (w, h, d) => ({
	w, h, d, isSize3D: true,
	concat: b => Size3D(w + b.w, h + b.h, d + b.d),
	toStr: _ => `Size3D(${toStr(w)}, ${toStr(h)}, ${toStr(d)})`,
	map: f => Size3D(f(w), f(h), f(d)),
	ap: mf => Size3D(mf.w(w), mf.h(h), mf.d(d)),
	volume: _ => w * h * d,
	surface: _ => 2 * (w * h + w * d + h * d),
	diagonal: _ => Math.sqrt(w ** 2 + h ** 2 + d ** 2),
	equals: v => v.isSize3D && eq(w)(v.w) && eq(h)(v.h) && eq(d)(v.d),
	toPos: _ => Pos3D(w, h, d),
	toCuboid: _ => Cuboid(0, 0, 0, w, d, h),
	rndIntPos: _ => Pos3D(rnd0Int(w), rnd0Int(h), rnd0Int(d)),
	rndIntPosExcept: avoid_pos => {
		const size = Size3D(w, h, d);
		const pos = size.rndIntPos();
		const avoid_pos_valid = pipe(uniq, reject(outside(size)))(avoid_pos);
		if (len(avoid_pos_valid) >= size.volume()) return Nothing();
		if (incl(pos)(avoid_pos_valid))
			return size.rndIntPosExcept(avoid_pos_valid);
		return Just(pos);
	},
	midPos: _ => Pos3D(w / 2, h / 2, d / 2)
});
Size3D.empty = _ => Size3D(0, 0, 0);

const Cuboid = (x, y, z, w, h, d) => ({
	x, y, z, w, h, d, isCuboid: true,
	concat: b => Cuboid(x + b.x, y + b.y, z + b.z, w + b.w, h + b.h, d + b.d),
	toStr: _ => `Cuboid(${toStr(x)}, ${toStr(y)}, ${toStr(z)}, `
		+ `${toStr(w)}, ${toStr(h)}, ${toStr(d)})`,
	map: f => Cuboid(f(x), f(y), f(z), f(w), f(h), f(d)),
	ap: mf => Cuboid(mf.x(x), mf.y(y), mf.z(z), mf.w(w), mf.h(h), mf.d(d)),
	volume: _ => w * h * d,
	surface: _ => 2 * (w * h + w * d + h * d),
	diagonal: _ => Math.sqrt(w ** 2 + h ** 2 + d ** 2),
	equals: v => v.isCuboid && eq(x)(v.x) && eq(y)(v.y) && eq(z)(v.z) &&
		eq(w)(v.w) && eq(h)(v.h) && eq(d)(v.d),
	toPos: _ => Pos3D(x, y, z),
	toSize: _ => Size3D(w, h, d),
	sizeAsPos: _ => Pos3D(w, h, d),
	posAsSize: _ => Size3D(x, y, z),
	edgeCuboid: (margin, direction) => {
		const xyz = liftN(3)(pos => size => dir =>
			dir < 0 ? pos :
			dir > 0 ? pos + size - margin :
				pos + margin
		);
		const whd = lift(size => dir => dir == 0 ? size - margin * 2 : margin);
		return Cuboid.fromPosSize(
			xyz(Pos3D(x, y, z))(Pos3D(w, h, d))(direction),
			whd(Size3D(w, h, d))(direction.toSize())
		);
	},
	edgeCuboids: (margin, directions) => {
		const cuboid = Cuboid(x, y, z, w, h, d);
		return map(dir => cuboid.edgeCuboid(margin, dir))(directions);
	},
	trim: margin => Cuboid(x, y, z, w, h, d).edgeCuboid(margin, Pos3D.empty()),
	rndIntPos: _ => Pos3D(rndInt(x)(x + w), rndInt(y)(y + h), rndInt(z)(z + d)),
	rndIntPosExcept: avoid_pos => {
		const cuboid = Cuboid(x, y, z, w, h, d);
		const pos = cuboid.rndIntPos();
		const avoid_pos_valid = pipe(uniq, reject(outside(cuboid)))(avoid_pos);
		if (len(avoid_pos_valid) >= cuboid.volume()) return Nothing();
		if (incl(pos)(avoid_pos_valid))
			return cuboid.rndIntPosExcept(avoid_pos_valid);
		return Just(pos);
	},
	midPos: _ => Pos3D(x + w / 2, y + h / 2, z + d / 2)
});
Cuboid.empty = _ => Cuboid(0, 0, 0, 0, 0, 0);
Cuboid.fromPosSize = ({x, y, z}, {w, h, d}) => Cuboid(x, y, z, w, h, d);

const wOf = obj => obj.width || obj.w;
const hOf = obj => obj.height || obj.h;
const sizeOf = lift(w => h => Size(w, h))(wOf)(hOf);
const vlen = pos => pos.length();
const vdiagonal = size => size.diagonal();
const area = v => v.area();
const perimeter = v => v.perimeter();
const volume = v => v.volume();
const surface = v => v.surface();
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