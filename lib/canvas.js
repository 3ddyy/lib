const Canv = {};
Canv.new = ({w, h}) => {
	const canvas = document.createElement("canvas");
	canvas.width = w;
	canvas.height = h;
	return canvas;
};
Canv.w = ctx => ctx.canvas.width;
Canv.h = ctx => ctx.canvas.height;
Canv.size = lift(w => h => Size(w, h))(Canv.w)(Canv.h);
Canv.getCtx = canv => canv.getContext("2d");
Canv.getCanv = ctx => ctx.canvas;
Canv.setFillStr = col => tap(ctx => ctx.fillStyle = col);
Canv.setFillCol = pipe(col => col.toStr(), Canv.setFillStr);
Canv.setFillNew = r => g => b => Canv.setFillCol(Col(r)(g)(b));
Canv.font = font => tap(ctx => ctx.font = font);
Canv.textAlign = align => tap(ctx => ctx.textAlign = align);
Canv.textBaseline = baseline => tap(ctx => ctx.textBaseline = baseline);
Canv.rect = ({x, y, w, h}) => tap(ctx => ctx.fillRect(x, y, w, h));
Canv.rectNew = curryN(4)(pipe(Rect, Canv.rect));
Canv.pos = p => Canv.rect(Rect.fromPosSize(p, Size(1, 1)));
Canv.full = ctx => Canv.rect(Rect.fromPosSize(Pos(0, 0), Canv.size(ctx)))(ctx);
Canv.clearRect = ({x, y, w, h}) => tap(ctx => ctx.clearRect(x, y, w, h));
Canv.clearRectNew = curryN(4)(pipe(Rect, Canv.rect));
Canv.clearPos = p => Canv.clearRect(Rect.fromPosSize(p, Size(1, 1)));
Canv.clear = ctx => Canv.clearRect(Rect.fromPosSize(
	Pos(0, 0),
	Canv.size(ctx)
))(ctx);
Canv.image = ({x, y}) => img => tap(ctx => ctx.drawImage(img, x, y));
Canv.imageRect = ({x, y, w, h}) => img => tap(
	ctx => ctx.drawImage(img, x, y, w, h)
);
/* Canv.imagePositioned:
full: the image covers the entire canvas, it may be stretched
centered: the image is scaled to max proportionally and centered
topleft: the image is scaled to max proportionally and positioned at the top-left */
Canv.imagePositioned = setting => img => ctx => {
	if (setting == "full")
		return Canv.imageRect(
			Rect.fromPosSize(Pos(0, 0), Canv.size(ctx))
		)(img)(ctx);
	if (setting == "centered") {
		const canvSize = Canv.size(ctx);
		const minS = toRatio(true)(sRatio(sizeOf(img)))(canvSize);
		const offset = lift(full => min => (full - min) / 2)(canvSize)(minS);
		return Canv.imageRect(
			Rect(offset.w, offset.h, minS.w, minS.h)
		)(img)(ctx);
	};
	if (setting == "topleft") {
		const minS = toRatio(true)(sRatio(sizeOf(img)))(Canv.size(ctx));
		return Canv.imageRect(Rect.fromPosSize(Pos(0, 0), minS))(img)(ctx);
	};
};
Canv.text = ({x, y}) => t => tap(ctx => ctx.fillText(t, x, y));
Canv.midText = t => chain(flip(Canv.text)(t))(pipe(
	Canv.size,
	midPos,
	map(fl)
));
Canv.setImageSmoothing = bool => tap(ctx => ctx.imageSmoothingEnabled = bool);
Canv.translate = x => y => tap(ctx => ctx.translate(x, y));
Canv.setTransform = a => b => c => d => e => f => tap(
	ctx => ctx.setTransform(a, b, c, d, e, f)
);
Canv.resetTransform = tap(ctx => ctx.resetTransform());