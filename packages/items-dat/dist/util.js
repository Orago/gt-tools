export const SECRET = 'PBG892FXX982ABC*';
export function getUniqueItems(a, b) {
    const c = a.concat(b);
    return c.filter(item => c.indexOf(item) === c.lastIndexOf(item));
}
