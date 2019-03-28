const Tree = (root, forest) => ({
	root, forest,
	map: f => Tree(f(root), forest.map(t => t.map(f))),
	reduce: (f, z) => {
		const rootReduced = f(z, root);
		return forest.reduce((acc, tree) => tree.reduce(f, acc), rootReduced)
	},
	extend: f => Tree(f(Tree(root, forest)), forest.map(t => t.extend(f)))
});
Tree.of = x => Tree(x, []);