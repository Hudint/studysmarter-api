"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const InsertFile_1 = require("./InsertFile");
const StudySmarterAccount_1 = require("./StudySmarterAccount");
async function run() {
    // const acc = await StudySmarterAccount.fromEmailAndPassword("s2@hudint.de", "test123!");
    const acc = new StudySmarterAccount_1.default(10510632, 'c9d8e46a642eff85112d0eeb85abc729d489c95e');
    console.log({ id: acc.id, token: acc.token });
    const sets = await acc.getStudySets();
    // console.log(sets);
    const set = sets.find(s => s.name === "Test");
    console.log(set);
    // set.addFlashCard("Question", "Answer");
    set.addFlashCard(`Question<br><img src="image.png"><br>hier drüber ist ein bild`, "Answer", [
        {
            name: "image.png",
            image_string: InsertFile_1.default
        }
    ]);
    // await acc.createStudySet("Test", SetColor.Mint, false);
}
run();
