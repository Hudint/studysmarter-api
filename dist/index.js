"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StudySmarterAccount_1 = require("./StudySmarterAccount");
const StudySmarterStudySet_1 = require("./StudySmarterStudySet");
const Utils_1 = require("./Utils");
const path = require("path");
const fs = require("fs");
async function run() {
    // const acc = await StudySmarterAccount.fromEmailAndPassword("s2@hudint.de", "test123!");
    const acc = new StudySmarterAccount_1.default(10510632, 'c9d8e46a642eff85112d0eeb85abc729d489c95e');
    // console.log({id: acc.id, token: acc.token});
    // const sets = await acc.getStudySets();
    // console.log(sets);
    // const set = sets.find(s => s.name === "Test");
    // console.log(set)
    // set.addFlashCard("Question", "Answer");
    // set.addFlashCard(`Question<br><img src="image.png"><br>hier drüber ist ein bild`, "Answer", [
    //     {
    //         name: "image.png",
    //         image_string: InsertFile
    //     }
    // ]);
    // await acc.createStudySet("Test", SetColor.Mint, false);
    const ankiResult = await Utils_1.default.convertFromAnki(path.join(__dirname, "..", "test.apkg"));
    const images = ankiResult.imagePaths.map(({ name, path }) => ({
        name,
        image_file: new Blob([fs.readFileSync(path)])
    }));
    for (const deck of ankiResult.decks) {
        const re = await acc.createStudySet(deck.name, StudySmarterStudySet_1.SetColor.Violet, false);
        for (const card of deck.cards) {
            await re.addFlashCard(card.front, card.back, images);
        }
    }
}
run();
