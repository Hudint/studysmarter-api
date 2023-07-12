export default class Utils {
    private constructor();
    static checkParamsAreSet(params: any): void;
    static forEachRegex(regex: RegExp, str: string, callback: (match: RegExpExecArray) => void): void;
}
