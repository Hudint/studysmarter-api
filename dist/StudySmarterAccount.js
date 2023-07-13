"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StudySmarterStudySet_1 = require("./StudySmarterStudySet");
class StudySmarterAccount {
    constructor(id, token) {
        this._id = id;
        this._token = token;
    }
    get id() {
        return this._id;
    }
    get token() {
        return this._token;
    }
    fetchJson(url, RequestInit, setContentType = true) {
        return this.fetch(url, RequestInit, setContentType).then(res => res.json());
    }
    fetch(url, RequestInit, setContentType = true) {
        return fetch(url, {
            ...RequestInit,
            headers: {
                authorization: `Token ${this._token}`,
                ...(setContentType ? { "Content-Type": "application/json" } : {})
            }
        }).then(StudySmarterAccount.validateResponse);
    }
    changePassword(newPassword) {
        return this.fetchJson(`https://prod.studysmarter.de/users/${this._id}/`, {
            method: "PATCH",
            body: JSON.stringify({
                user: {
                    password: newPassword
                }
            })
        });
    }
    createStudySet(name, color, isPublic) {
        return this.fetchJson(`https://prod.studysmarter.de/studysets/`, {
            method: "POST",
            body: JSON.stringify({
                colorId: color,
                countries: [],
                level: 0,
                shared: isPublic,
                name
            })
        }).then(json => StudySmarterStudySet_1.default.fromJSON(this, json));
    }
    getStudySets() {
        return this.fetchJson(`https://prod.studysmarter.de/studysets/`, {
            method: "GET",
        })
            .then(json => json.results.map((set) => StudySmarterStudySet_1.default.fromJSON(this, set)));
    }
    static async validateResponse(res) {
        if (String(res.status).startsWith("2")) {
            return res;
        }
        else {
            return Promise.reject(JSON.stringify({
                status: res.status,
                response: await res.text()
            }));
        }
    }
    static fromEmailAndPassword(email, password) {
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
                return Promise.reject("Invalid credentials");
            }
            return new StudySmarterAccount(json.id, json.token);
        });
    }
}
exports.default = StudySmarterAccount;
