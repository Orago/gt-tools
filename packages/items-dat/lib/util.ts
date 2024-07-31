export const SECRET = 'PBG892FXX982ABC*';

export function getUniqueItems(a: any[], b: any[]) {
	const c = a.concat(b);

	return c.filter(item => c.indexOf(item) === c.lastIndexOf(item));
}