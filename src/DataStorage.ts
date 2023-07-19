import * as path from "path";
import * as fs from "fs";

const storagePath = path.join(__dirname, "..", "data.json");

export default class DataStorage{
    static {
        if(!fs.existsSync(storagePath)) {
            fs.writeFileSync(storagePath, "{}");
        }
    }
    static data: any = JSON.parse(fs.readFileSync(storagePath, "utf8"));

    private constructor() {}

    public static get(key: string): any {
        return this.data[key];
    }

    public static set(key: string, value: any): void {
        this.data[key] = value;
        fs.writeFileSync(storagePath, JSON.stringify(this.data));
    }
}