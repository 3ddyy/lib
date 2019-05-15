const Canv = {};
Canv.new = ({w, h}) => {
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	return canvas;
};
Canv.w = ctx => ctx.canvas.width;
Canv.h = ctx => ctx.canvas.height;
Canv.size = lift(curry(Size))(Canv.w)(Canv.h);
Canv.getCtx = canv => canv.getContext("2d");
Canv.getCanv = ctx => ctx.canvas;

//drawing
Canv.setProp = prop => val => ctx => void (ctx[prop] = val);
Canv.runMethodReturn = m => (...args) => ctx => ctx[m](...args);
Canv.runMethod = mapf(3)(UNDEF)(Canv.runMethodReturn);
Canv.setFillStr = Canv.setProp("fillStyle");
Canv.setFillCol = pipe(toColorStr, Canv.setFillStr);
Canv.font = Canv.setProp("font");
Canv.textAlign = Canv.setProp("textAlign");
Canv.textBaseline = Canv.setProp("textBaseline");
Canv.rect = ({x, y, w, h}) => Canv.runMethod("fillRect")(x, y, w, h);
Canv.pos = p => Canv.rect(Rect.fromPosSize(p, Size(1, 1)));
Canv.full = ctx => Canv.rect(Rect.fromPosSize(Pos(0, 0), Canv.size(ctx)))(ctx);
Canv.clearRect = ({x, y, w, h}) => Canv.runMethod("clearRect")(x, y, w, h);
Canv.clearPos = p => Canv.clearRect(Rect.fromPosSize(p, Size(1, 1)));
Canv.clearFull = ctx => Canv.clearRect(Rect.fromPosSize(
	Pos(0, 0),
	Canv.size(ctx)
))(ctx);
Canv.image = ({x, y}) => img => Canv.runMethod("drawImage")(img, x, y);
Canv.imageRect = ({x, y, w, h}) => img =>
	Canv.runMethod("drawImage")(img, x, y, w, h);
Canv.imageSourceRect = ({x: sx, y: sy, w: sw, h: sh}) => ({x, y, w, h}) =>
	img => Canv.runMethod("drawImage")(img, sx, sy, sw, sh, x, y, w, h);
/* Canv.imagePositioned:
full: the image covers the entire canvas, it may be stretched
centered: the image is scaled to max proportionally and centered
topleft: the image is scaled to max proportionally and positioned at the top-left */
Canv.imagePositioned = setting => img => ctx => {
	if (setting == "full") Canv.imageRect(
		Rect.fromPosSize(Pos(0, 0), Canv.size(ctx))
	)(img)(ctx);
	else if (setting == "centered") {
		const canvSize = Canv.size(ctx);
		const minS = toRatio(true)(sRatio(sizeOf(img)))(canvSize);
		const offset = lift(full => min => (full - min) / 2)(canvSize)(minS);
		Canv.imageRect(
			Rect(offset.w, offset.h, minS.w, minS.h)
		)(img)(ctx);
	}
	else if (setting == "topleft") {
		const minS = toRatio(true)(sRatio(sizeOf(img)))(Canv.size(ctx));
		Canv.imageRect(Rect.fromPosSize(Pos(0, 0), minS))(img)(ctx);
	};
};
Canv.text = ({x, y}) => t => Canv.runMethod("fillText")(t, x, y);
Canv.midText = t => chain(flip(Canv.text)(t))(pipe(
	Canv.size,
	midPos,
	map(fl)
));
Canv.setImageSmoothing = Canv.setProp("imageSmoothingEnabled");
Canv.translate = x => y => Canv.runMethod("translate")(x, y);
Canv.translatePos = ({x, y}) => Canv.runMethod("translate")(x, y);
Canv.setTransform = a => b => c => d => e => f =>
	Canv.runMethod("setTransform")(a, b, c, d, e, f);
Canv.resetTransform = Canv.runMethod("resetTransform")();
Canv.getImageData = ({x, y, w, h}) =>
	Canv.runMethodReturn("getImageData")(x, y, w, h);
Canv.getImageDataFull = ctx => Canv.getImageData(Canv.size(ctx).toRect())(ctx);
Canv.putImageData = ({x, y}) => data =>
	Canv.runMethod("putImageData")(data, x, y);
Canv.putImageDataRect = ({x, y}) => dataDims => data => Canv.runMethod
	("putImageData")(data, x, y, dataDims.x, dataDims.y, dataDims.w, dataDims.h);
Canv.transferImageData = pipe(
	Canv.getImageDataFull,
	Canv.putImageData(Pos(0, 0))
);
Canv.actionToIO = action => ({
	offscreenCtx = Nothing(),
	transfer = Canv.transferImageData
}) => resultCtx => IO(_ => {
	const ctx = offscreenCtx.map(k).getOrElse(_ => pipe0(
		resultCtx, Canv.size, Canv.new, Canv.getCtx
	))();
	action(ctx);
	transfer(ctx)(resultCtx);
});
Canv.drawIO = (...actions) => Canv.actionToIO(juxt(actions));

const CanvMonoid = action => ({
	val: action,
	concat: y => CanvMonoid(ctx => {
		action(ctx);
		y.val(ctx);
	}),
	toIO: Canv.actionToIO(action)
});
CanvMonoid.empty = _ => CanvMonoid(UNDEF);