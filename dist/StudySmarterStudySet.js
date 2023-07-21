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
})(SetColor || (exports.SetColor = SetColor = {}));
class StudySmarterStudySet {
    constructor(account, id, name, color, creator_id, isShared, published_at) {
        Utils_1.default.checkParamsAreSet({ account: account, id, name, color, isShared });
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
    get published_at() {
        return this._published_at;
    }
    getFlashCards() {
        return this._account.fetchJson(`https://prod.studysmarter.de/studysets/${this._id}/flashcards/?search=&s_bad=true&s_medium=true&s_good=true&s_trash=false&s_unseen=true&tag_ids=&quantity=9999999&created_by=&order=smart&cursor=`, {
            method: "GET"
        }).then(({ results }) => results.map(r => StudySmarterStudySet.fromJSON(this._account, r)));
    }
    async delete() {
        return this._account.fetch(`https://prod.studysmarter.de/studysets/${this._id}/`, {
            method: "DELETE"
        });
    }
    modify(name, color, isPublic) {
        console.log(name, color, isPublic);
        return this._account.fetchJson(`https://prod.studysmarter.de/studysets/${this._id}/`, {
            method: "PATCH",
            body: JSON.stringify({
                colorId: color !== null && color !== void 0 ? color : this._color,
                shared: isPublic !== null && isPublic !== void 0 ? isPublic : this._isShared,
                name: name !== null && name !== void 0 ? name : this._name
            })
        }).then(({ name, colorId, shared }) => {
            this._name = name;
            this._color = colorId;
            this._isShared = shared;
        });
    }
    async addFlashCard(question, answer, images = []) {
        // const imageObjects: {[name: string]: FlashcardImage} = Object.fromEntries(await Promise.all());
        let imageObjects = {};
        const questionWithImages = await this.replaceImageTags(question, images, imageObjects);
        const answerWithImages = await this.replaceImageTags(answer, images, imageObjects);
        return this._account.fetchJson(`https://prod.studysmarter.de/studysets/${this._id}/flashcards/`, {
            method: "POST",
            body: JSON.stringify({
                "flashcard_image_ids": Object.values(imageObjects).map(i => i.id),
                "tags": [],
                "question_html": [{
                        text: questionWithImages,
                        is_correct: true
                    }],
                "answer_html": [{
                        text: answerWithImages,
                        is_correct: true
                    }],
                "shared": 2,
                "hint_html": [],
                "solution_html": ""
            })
        });
    }
    async replaceImageTags(text, images, uploadedImages) {
        let result = text;
        for (const match of Utils_1.default.regexExecArray(/<img[^s>]*src="([^"]+)"[^>]*>/g, text)) {
            const imageEntry = images.find(i => i.name === match[1]);
            const uploaded = uploadedImages[imageEntry.name] || await this.uploadImage(imageEntry);
            uploadedImages[imageEntry.name] = uploaded;
            result = result.replace(new RegExp(`<img[^s>]*src=\"${match[1]}\"[^>]*>`, "g"), `<img localid="${uploaded.localID}" width="${uploaded.width}" class="fr-fic fr-dii">`);
        }
        return result;
    }
    async uploadImage(image) {
        var _a;
        const body = new FormData();
        body.append("image_file", (_a = image.image_file) !== null && _a !== void 0 ? _a : await fetch(image.image_string).then(r => r.blob()));
        body.append("localID", "" + Date.now());
        return await this._account.fetchJson(`https://prod.studysmarter.de/studysets/${this._id}/images/`, {
            method: "POST",
            body
        }, false);
    }
    static fromJSON(account, json) {
        return new StudySmarterStudySet(account, json["id"], json["name"], json["colorId"], json["creator_id"], json["shared"], json["published_at"]);
    }
}
exports.default = StudySmarterStudySet;
