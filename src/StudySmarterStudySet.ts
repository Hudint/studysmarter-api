import StudySmarterAccount from "./StudySmarterAccount";
import Utils from "./Utils";

enum SetColor {
    Red = 0,
    Blue = 1,
    Mint = 2,
    Purple = 3,
    Teal = 4,
    Orange = 5,
    Green = 6,
    Violet = 7
}

type FlashcardImage = {
    "id": number,
    "image_string": string,
    "presigned_url": string,
    "image_file"?: any,
    "created": string,
    "image": string,
    "width": number,
    "deleted": boolean,
    "math_ml": string,
    "xfdfString"?: null,
    "localID": number,
    "flashcardinfo"?: number
}


type ImageEntry = {
    "name": string,
    "image_string"?: string,
    "image_file"?: Blob
}


export default class StudySmarterStudySet {
    private readonly _account: StudySmarterAccount;
    private readonly _id: number;
    private readonly _name: string;
    private readonly _color: SetColor;
    private readonly _creator_id: number;
    private readonly _isShared: boolean;


    constructor(account: StudySmarterAccount, id: number, name: string, color: SetColor, creator_id: number, isShared: boolean) {
        Utils.checkParamsAreSet({account: account, id, name, color, creator_id, isShared});

        this._account = account;
        this._id = id;
        this._name = name;
        this._color = color;
        this._creator_id = creator_id;
        this._isShared = isShared;
    }


    get id(): number {
        return this._id;
    }

    get name(): string {
        return this._name;
    }

    get color(): SetColor {
        return this._color;
    }

    get creator_id(): number {
        return this._creator_id;
    }

    get isShared(): boolean {
        return this._isShared;
    }

    getFlashCards() {
        return this._account.fetchJson(`https://prod.studysmarter.de/studysets/${this._id}/flashcards/?search=&s_bad=true&s_medium=true&s_good=true&s_trash=false&s_unseen=true&tag_ids=&quantity=9999999&created_by=&order=smart&cursor=`, {
            method: "GET"
        }).then(({results}) => results.map(r => StudySmarterStudySet.fromJSON(this._account, r)))
    }

    async delete() {
        return this._account.fetch(`https://prod.studysmarter.de/studysets/${this._id}/`, {
            method: "DELETE"
        })
    }

    async addFlashCard(question: string, answer: string, images: ImageEntry[] = []) {
        // const imageObjects: {[name: string]: FlashcardImage} = Object.fromEntries(await Promise.all());
        let imageObjects: {[name: string]: FlashcardImage} = {};

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
        })
    }

    private async replaceImageTags(text: string, images: ImageEntry[], uploadedImages: {[name: string]: FlashcardImage}) {
        let result = text;

        for(const match of Utils.regexExecArray(/<img[^s>]*src="([^"]+)"[^>]*>/g, text)) {
            const imageEntry = images.find(i => i.name === match[1]);
            const uploaded = uploadedImages[imageEntry.name] || await this.uploadImage(imageEntry);
            uploadedImages[imageEntry.name] = uploaded;

            result = result.replace(new RegExp(`<img[^s>]*src=\"${match[1]}\"[^>]*>`, "g"), `<img localid="${uploaded.localID}" width="${uploaded.width}" class="fr-fic fr-dii">`)
        }
        return result;
    }

    private async uploadImage(image: ImageEntry): Promise<FlashcardImage> {
        const body = new FormData();
        body.append("image_file", image.image_file ?? await fetch(image.image_string).then(r => r.blob()));
        body.append("localID", "" + Date.now());
        return await this._account.fetchJson(`https://prod.studysmarter.de/studysets/${this._id}/images/`, {
            method: "POST",
            body
        }, false)
    }

    public static fromJSON(account: StudySmarterAccount, json: any): StudySmarterStudySet {
        return new StudySmarterStudySet(account, json["id"], json["name"], json["colorId"], json["creator_id"], json["shared"]);
    }
}

export type {FlashcardImage}
export {SetColor}