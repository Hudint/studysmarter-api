"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utils_1 = require("./Utils");
class StudySmarterFlashCard {
    constructor(account, id, original_studyset_id, question_html, answer_html, hint_html, flashcard_images, tags) {
        Utils_1.default.checkParamsAreSet({ account: account, id, original_studyset_id, question_html, answer_html, hint_html, flashcard_images, tags });
        this._account = account;
        this._id = id;
        this._original_studyset_id = original_studyset_id;
        this._question_html = question_html;
        this._answer_html = answer_html;
        this._hint_html = hint_html;
        this._flashcard_images = flashcard_images;
        this._tags = tags;
    }
    static fromJSON(account, json) {
        return new StudySmarterFlashCard(account, json["id"], json["original_studyset_id"], json["question_html"], json["answer_html"], json["hint_html"], json["flashcard_images"], json["tags"]);
    }
}
exports.default = StudySmarterFlashCard;
