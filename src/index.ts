import InsertFile from "./InsertFile";
import StudySmarterAccount from "./StudySmarterAccount";
import {SetColor} from "./StudySmarterStudySet";


async function run(){
    // const acc = await StudySmarterAccount.fromEmailAndPassword("s2@hudint.de", "test123!");
    const acc = new StudySmarterAccount(10510632, 'c9d8e46a642eff85112d0eeb85abc729d489c95e');
    console.log({id: acc.id, token: acc.token});
    const sets = await acc.getStudySets();
    // console.log(sets);
    const set = sets.find(s => s.name === "Test");
    // console.log(set)
    // set.addFlashCard("Question", "Answer");
    set.addFlashCard(`Question<br><img src="image.png"><br>hier drüber ist ein bild`, "Answer", [
        {
            name: "image.png",
            image_string: InsertFile
        }
    ]);
    // await acc.createStudySet("Test", SetColor.Mint, false);

}
run();