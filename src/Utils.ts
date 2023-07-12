
export default class Utils {
    private constructor() {}

    public static checkParamsAreSet(params: any): void {
        Object.entries(params)
            .filter(([k, v]) => v === undefined || v === null)
            .forEach(([k, v]) => {
                throw new Error(`Invalid value ${k} === ${v}`)
            });
    }

    public static forEachRegex(regex: RegExp, str: string, callback: (match: RegExpExecArray) => void): void {
        let match: RegExpExecArray;
        while ((match = regex.exec(str)) !== null) {
            callback(match);
        }
    }
}