export { Store };

const Store = (lookup, pointer) => ({
	lookup, pointer,
	seek: p => Store(lookup, p),
	peek: p => lookup(p),
	map: f => Store(p => f(lookup(p)), pointer),
	extend: f => Store(p => f(Store(lookup, p)), pointer),
	extract: _ => lookup(pointer)
});