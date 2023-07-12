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
    fetch(url, RequestInit, contentType = "application/json") {
        return fetch(url, {
            ...RequestInit,
            headers: {
                authorization: `Token ${this._token}`,
                "Content-Type": contentType
            }
        }).then(StudySmarterAccount.resCodeCheck);
    }
    changePassword(newPassword) {
        return this.fetch(`https://prod.studysmarter.de/users/${this._id}/`, {
            method: "PATCH",
            body: JSON.stringify({
                user: {
                    password: newPassword
                }
            })
        });
    }
    createStudySet(name, color, isPublic) {
        return this.fetch(`https://prod.studysmarter.de/studysets/`, {
            method: "POST",
            body: JSON.stringify({
                colorId: color,
                countries: [],
                level: 0,
                shared: isPublic,
                name
            })
        });
    }
    getStudySets() {
        return this.fetch(`https://prod.studysmarter.de/studysets/`, {
            method: "GET",
        })
            .then(json => json.results.map((set) => StudySmarterStudySet_1.default.fromJSON(this, set)));
    }
    static resCodeCheck(res) {
        return res.status === 429 ? Promise.reject("Too many requests") : res.json();
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
            .then(StudySmarterAccount.resCodeCheck)
            .then(json => {
            console.log("LOGIN RESPONSE", json);
            if (json.error_code == "001") {
                return Promise.reject("Invalid credentials");
            }
            return new StudySmarterAccount(json.id, json.token);
        });
    }
}
exports.default = StudySmarterAccount;
