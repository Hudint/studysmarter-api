"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetColor = void 0;
const Utils_1 = require("./Utils");
var SetColor;
(function (SetColor) {
    SetColor[SetColor["Red"] = 0] = "Red";
    SetColor[SetColor["Blue"] = 1] = "Blue";
    SetColor[SetColor["Mint"] = 2] = "Mint";
    SetColor[SetColor["Purple"] = 3] = "Purple";
    SetColor[SetColor["Teal"] = 4] = "Teal";
    SetColor[SetColor["Orange"] = 5] = "Orange";
    SetColor[SetColor["Green"] = 6] = "Green";
    SetColor[SetColor["Violet"] = 7] = "Violet";
})(SetColor || (SetColor = {}));
exports.SetColor = SetColor;
class StudySmarterStudySet {
    constructor(account, id, name, color, creator_id, isShared) {
        Utils_1.default.checkParamsAreSet({ account: account, id, name, color, creator_id, isShared });
        this._account = account;
        this._id = id;
        this._name = name;
        this._color = color;
        this._creator_id = creator_id;
        this._isShared = isShared;
    }
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    get color() {
        return this._color;
    }
    get creator_id() {
        return this._creator_id;
    }
    get isShared() {
        return this._isShared;
    }
    getFlashCards() {
        return this._account.fetch(`https://prod.studysmarter.de/studysets/${this._id}/flashcards/?search=&s_bad=true&s_medium=true&s_good=true&s_trash=false&s_unseen=true&tag_ids=&quantity=9999999&created_by=&order=smart&cursor=`, {
            method: "GET"
        }).then(({ results }) => results.map(r => StudySmarterStudySet.fromJSON(this._account, r)));
    }
    async addFlashCard(question, answer, images = []) {
        const imageObjects = Object.fromEntries(await Promise.all(images.map(i => [i.name, this.uploadImage(i.image_string)])));
        console.log(imageObjects);
        return this._account.fetch(`https://prod.studysmarter.de/studysets/${this._id}/flashcards/`, {
            method: "POST",
            body: JSON.stringify({
                "flashcard_image_ids": Object.values(imageObjects).map(i => i.id),
                "tags": [],
                "question_html": [{
                        text: StudySmarterStudySet.replaceImageTags(question, imageObjects),
                        is_correct: true
                    }],
                "answer_html": [{
                        text: StudySmarterStudySet.replaceImageTags(answer, imageObjects),
                        is_correct: true
                    }],
                "shared": 2,
                "hint_html": [],
                "solution_html": ""
            })
        });
    }
    static replaceImageTags(text, images) {
        let result = text;
        Utils_1.default.forEachRegex(/<img[^s>]*src="([^"]+)"[^>]*>/g, text, (match) => {
            const image = images[match[1]];
            result = result.replace(new RegExp(`<img[^s>]*src=\"${match[1]}\"[^>]*>`, "g"), `<img localid="${image.localId}" width="${image.width}" class="fr-fic fr-dii">`);
        });
        return result;
    }
    async uploadImage(image_string) {
        const body = new FormData();
        body.append("image_file", await fetch(image_string).then(r => r.blob()));
        body.append("localId", "" + Date.now());
        console.log("sending image");
        return await this._account.fetch(`https://prod.studysmarter.de/studysets/${this._id}/images/`, {
            method: "POST",
            body
        });
    }
    static fromJSON(account, json) {
        return new StudySmarterStudySet(account, json["id"], json["name"], json["colorId"], json["creator_id"], json["shared"]);
    }
}
exports.default = StudySmarterStudySet;
