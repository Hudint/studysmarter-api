export default class DataStorage {
    static data: any;
    private constructor();
    static get(key: string): any;
    static set(key: string, value: any): void;
}
