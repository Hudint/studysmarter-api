"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetColor = void 0;
const html_entities_1 = require("html-entities");
const Utils_1 = require("./Utils");
const StudySmarterFlashCard_1 = require("./StudySmarterFlashCard");
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
    constructor(account, id, creator_id, name, color, isShared, flashcard_count, created, published_at, last_used) {
        Utils_1.default.checkParamsAreSet({ account: account, id, name, color, isShared });
        this._account = account;
        this._id = id;
        this._creator_id = creator_id;
        this._name = name;
        this._color = color;
        this._isShared = isShared;
        this._flashcard_count = flashcard_count;
        this._created = created;
        this._published_at = published_at;
        this._last_used = last_used;
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
    get flashcard_count() {
        return this._flashcard_count;
    }
    get published_at() {
        return this._published_at;
    }
    get created() {
        return this._created;
    }
    get last_used() {
        return this._last_used;
    }
    getFlashCards() {
        return this._account.fetchJson(`https://prod.studysmarter.de/studysets/${this._id}/flashcards/?search=&s_bad=true&s_medium=true&s_good=true&s_trash=false&s_unseen=true&tag_ids=&quantity=9999999&created_by=&order=smart&cursor=`, {
            method: "GET"
        }).then(({ results }) => results.map(card => {
            return StudySmarterFlashCard_1.default.fromJSON(this._account, this, card);
        }));
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
    async addFlashCardClone(card) {
        // const images: ImageEntry[] = [];
        // console.log(card)
        // for (const image of card.flashcard_images) {
        //     console.log(image)
        //     const imageBlob = await (await this._account.fetch(image.presigned_url, {})).blob();
        //     images.push({
        //         name: image.presigned_url,
        //         image_blob: imageBlob
        //     })
        // }
        return this.addFlashCard(card.question, card.answer, []);
    }
    async addFlashCard(question, answer, images = []) {
        let uploadedImages = {};
        const questionWithImages = await this.replaceImageTags(question, images, uploadedImages);
        const answerWithImages = await this.replaceImageTags(answer, images, uploadedImages);
        return this._account.fetchJson(`https://prod.studysmarter.de/studysets/${this._id}/flashcards/`, {
            method: "POST",
            body: JSON.stringify({
                "flashcard_image_ids": Object.values(uploadedImages).map(i => i.id),
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
        }).then(() => this._flashcard_count++);
    }
    async replaceImageTags(text, images, uploadedImages) {
        let result = text;
        for (const [full, src] of Utils_1.default.regexExecArray(/<img[^s>]*src="([^"]+)"[^>]*>/g, text)) {
            if (src.startsWith("http")) {
                images.push({
                    name: src,
                    image_blob: await (await fetch((0, html_entities_1.decode)(src), { method: "GET" })).blob()
                });
            }
            const imageEntry = images.find(i => i.name === src);
            if (!imageEntry) {
                console.log("Image not found", src);
                continue;
            }
            const uploaded = uploadedImages[imageEntry.name] || await this.uploadImage(imageEntry);
            uploadedImages[imageEntry.name] = uploaded;
            result = result.replace(new RegExp(`<img[^s>]*src=\"${Utils_1.default.escapeRegExp(src)}\"[^>]*>`, "g"), `<img localid="${uploaded.localID}" width="${uploaded.width}" class="fr-fic fr-dii">`);
        }
        return result;
    }
    async uploadImage(image) {
        var _a;
        const body = new FormData();
        body.append("image_file", (_a = image.image_blob) !== null && _a !== void 0 ? _a : await fetch(image.image_string).then(r => r.blob()));
        body.append("localID", "" + Date.now());
        return await this._account.fetchJson(`https://prod.studysmarter.de/studysets/${this._id}/images/`, {
            method: "POST",
            body
        }, false);
    }
    static fromJSON(account, json) {
        return new StudySmarterStudySet(account, json.id, json.creator_id, json.name, json.colorId, json.shared, json.flashcard_count, Utils_1.default.nullableDateFormat(json.created), Utils_1.default.nullableDateFormat(json.published_at), Utils_1.default.nullableDateFormat(json.last_used));
    }
}
exports.default = StudySmarterStudySet;
