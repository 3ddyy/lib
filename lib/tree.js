const Tree = (root, forest) => ({
	root, forest,
	map: f => Tree(f(root), forest.map(t => t.map(f))),
	reduce: (f, z) => {
		const rootReduced = f(z, root);
		return forest.reduce((acc, tree) => tree.reduce(f, acc), rootReduced)
	},
	extend: f => Tree(f(Tree(root, forest)), forest.map(t => t.extend(f))),
	equals: y => eq(root)(y.root) && eq(forest)(y.forest)
});
Tree.of = x => Tree(x, []);

const Node = (l, x, r) => ({
	l, x, r,
	map: f => Node(l.map(f), f(x), r.map(f)),
	reduce: (f, z) => {
		const left = l.reduce(f, z);
		const l_x = f(left, x);
		return r.reduce(f, l_x);
	},
	extend: f => Node(l.extend(f), f(Node(l, x, r)), r.extend(f)),
	equals: y => foldMap(All)(juxt([
		isNode,
		eqProp("x")(x),
		eqProp("l")(l),
		eqProp("r")(r)
	])(y)).val,
	setLeft: l_ => Node(l_, x, r),
	setRight: r_ => Node(l, x, r_),
	insert: ins => cond2([
		[eq(x), id],
		[lt(x), tree => tree.setLeft(l.insert(ins))],
		[gt(x), tree => tree.setRight(r.insert(ins))]
	])(ins)(Node(l, x, r)),
	concat: y => reduce(flip(insert))(Node(l, x, r))(y),
	toStr: _ => `Node(${toStr(l)}, ${toStr(x)}, ${toStr(r)})`,
	sort: _ => foldMap(BTree)(Node(l, x, r)),
	isNode: _ => true,
	isLeaf: _ => false
});

const Leaf = _ => ({
	map: _ => Leaf(),
	reduce: (_, z) => z,
	extend: f => Node(Leaf(), f(Leaf()), Leaf()),
	equals: y => isLeaf(y),
	setLeft: _ => Leaf(),
	setRight: _ => Leaf(),
	insert: x => BTree.of(x),
	concat: y => y,
	toStr: _ => `Leaf()`,
	sort: _ => Leaf(),
	isNode: _ => false,
	isLeaf: _ => true
});

const BTree = x => Node(Leaf(), x, Leaf());
BTree.Node = Node;
BTree.Leaf = Leaf;
BTree.of = x => Node(Leaf(), x, Leaf());
BTree.empty = _ => Leaf();
BTree.fromFoldable = xs => pipe(map(BTree.of), fold(BTree))(xs);

//[0, 1, 2] -> ["forest", 0, "forest", 1, "forest", 2, "root"]
const treePath = p => path(pipe(
	chain(k => ["forest", k]),
	append("root")
)(p));
const bTreePath = p => path(append("x")(p));
const insert = ins => tree => tree.insert(ins);
const isNode = t => t.isNode();
const isLeaf = t => t.isLeaf();