import StudySmarterStudySet, {SetColor} from "./StudySmarterStudySet";


export default class StudySmarterAccount {
    private readonly _id: number;
    private readonly _token: string;

    constructor(id: number, token: string) {
        this._id = id;
        this._token = token;
    }

    get id(): number {
        return this._id;
    }

    get token(): string {
        return this._token;
    }

    public fetch(url: string, RequestInit: RequestInit, setContentType: boolean = true) {
        return fetch(url, {
            ...RequestInit,
            headers: {
                authorization: `Token ${this._token}`,
                ...(setContentType ? {"Content-Type": "application/json"} : {})
            }
        }).then(StudySmarterAccount.resCodeCheck)
    }

    public changePassword(newPassword: string) {
        return this.fetch(`https://prod.studysmarter.de/users/${this._id}/`, {
            method: "PATCH",
            body: JSON.stringify({
                user: {
                    password: newPassword
                }
            })
        })
    }

    public createStudySet(name: string, color: SetColor, isPublic: boolean) {
        return this.fetch(`https://prod.studysmarter.de/studysets/`, {
            method: "POST",
            body: JSON.stringify({
                colorId: color,
                countries: [],
                level: 0,
                shared: isPublic,
                name
            })
        }).then(json => StudySmarterStudySet.fromJSON(this, json))
    }

    public getStudySets() : Promise<StudySmarterStudySet[]> {
        return this.fetch(`https://prod.studysmarter.de/studysets/`, {
            method: "GET",
        })
            .then(json => json.results.map((set: any) => StudySmarterStudySet.fromJSON(this, set)))
    }

    private static async resCodeCheck(res: Response) : Promise<any> {
        if(String(res.status).startsWith("2")) {
            return await res.json();
        }else {
            return Promise.reject(JSON.stringify({
                status: res.status,
                response: await res.text()
            }));
        }
    }

    public static fromEmailAndPassword(email: string, password: string): Promise<StudySmarterAccount> {
        return fetch("https://prod.studysmarter.de/api-token-auth/", {
            method: "POST",
            body: JSON.stringify({
                platform: "web",
                username: email,
                password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(StudySmarterAccount.resCodeCheck)
            .then(json => {
                console.log("LOGIN RESPONSE", json)
                if (json.error_code == "001") {
                    return Promise.reject("Invalid credentials")
                }

                return new StudySmarterAccount(json.id, json.token);
            });
    }
}