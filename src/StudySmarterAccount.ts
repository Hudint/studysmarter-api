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

    public fetchJson(url: string, RequestInit: RequestInit, setContentType: boolean = true) {
        return this.fetch(url, RequestInit, setContentType).then(res => res.json())
    }

    public fetch(url: string, RequestInit: RequestInit, setContentType: boolean = true) {
        return fetch(url, {
            ...RequestInit,
            headers: {
                authorization: `Token ${this._token}`,
                ...(setContentType ? {"Content-Type": "application/json"} : {})
            }
        }).then(StudySmarterAccount.validateResponse)
    }

    public changePassword(newPassword: string) {
        return this.fetchJson(`https://prod.studysmarter.de/users/${this._id}/`, {
            method: "PATCH",
            body: JSON.stringify({
                user: {
                    password: newPassword
                }
            })
        })
    }

    public createStudySet(name: string, color: SetColor, isPublic: boolean) {
        return this.fetchJson(`https://prod.studysmarter.de/studysets/`, {
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

    public getStudySets(verbose: boolean = false) : Promise<StudySmarterStudySet[]> {
        return this.fetchJson(`https://prod.studysmarter.de/studysets/`, {
            method: "GET",
        })
            .then(json => json.results.map((set: any) => {
                if(verbose) {
                    console.log(set)
                }
                return StudySmarterStudySet.fromJSON(this, set)
            }))
    }

    private static async validateResponse(res: Response) {
        if(String(res.status).startsWith("2")) {
            return res;
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
            .then(StudySmarterAccount.validateResponse)
            .then(res => res.json())
            .then(json => {
                if (json.error_code == "001") {
                    return Promise.reject("Invalid credentials")
                }

                return new StudySmarterAccount(json.id, json.token);
            });
    }
}