import StudySmarterAccount from "./StudySmarterAccount";
import StudySmarterStudySet, {StudySmarterColor} from "./StudySmarterStudySet";


export default class StudySmarterTag{
    private readonly _account: StudySmarterAccount
    private readonly _set: StudySmarterStudySet
    private readonly _id: number
    private _name: string
    private _colour: StudySmarterColor


    constructor(account: StudySmarterAccount, set: StudySmarterStudySet, id: number, name: string, colour: StudySmarterColor) {
        this._account = account;
        this._set = set;
        this._id = id;
        this._name = name;
        this._colour = colour;
    }

    get id(): number {
        return this._id;
    }
    get name(): string {
        return this._name;
    }
    get colour(): StudySmarterColor {
        return this._colour;
    }

    static fromJSON(account: StudySmarterAccount, set: StudySmarterStudySet, json: any) : StudySmarterTag{
        return new StudySmarterTag(account, set, json["id"], json["name"], json["colour"]);
    }
}
