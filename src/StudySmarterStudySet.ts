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
    "image_string": string
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
        return this._account.fetch(`https://prod.studysmarter.de/studysets/${this._id}/flashcards/?search=&s_bad=true&s_medium=true&s_good=true&s_trash=false&s_unseen=true&tag_ids=&quantity=9999999&created_by=&order=smart&cursor=`, {
            method: "GET"
        }).then(({results}) => results.map(r => StudySmarterStudySet.fromJSON(this._account, r)))
    }

    async addFlashCard(question: string, answer: string, images: ImageEntry[] = []) {

        // const imageObjects: {[name: string]: FlashcardImage} = Object.fromEntries(await Promise.all());
        let imageObjects: {[name: string]: FlashcardImage} = {};

        for (const image of images) {
            imageObjects[image.name] = await this.uploadImage(image.image_string);
        }

        console.log(imageObjects)
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
        })
    }

    private static replaceImageTags(text: string, images: {[name: string]: FlashcardImage}): string {
        let result = text;
        Utils.forEachRegex(/<img[^s>]*src="([^"]+)"[^>]*>/g, text, (match) => {
            const image = images[match[1]];
            result = result.replace(new RegExp(`<img[^s>]*src=\"${match[1]}\"[^>]*>`, "g"), `<img localid="${image.localID}" width="${image.width}" class="fr-fic fr-dii">`)
        })
        return result;
    }

    private async uploadImage(image_string: string): Promise<FlashcardImage> {
        const body = new FormData();
        body.append("image_file", await fetch(image_string).then(r => r.blob()));
        body.append("localID", "" + Date.now());
        console.log("sending image", body)
        return await this._account.fetch(`https://prod.studysmarter.de/studysets/${this._id}/images/`, {
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