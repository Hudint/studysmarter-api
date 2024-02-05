#!/usr/bin/env node

import * as chalk from "chalk";
import {Option, program} from "commander";
import * as figlet from "figlet";
import * as fs from "fs";
import * as path from "path";
import * as cliProgress from "cli-progress";
import StudySmarterAccount from "./StudySmarterAccount";
import StudySmarterStudySet, {
    ImageEntry,
    SetColor,
    StudySmarterSearchOrder,
    StudySmarterSearchParams
} from "./StudySmarterStudySet";
import Utils from "./Utils";
import DataStorage from "./DataStorage";
import StudySmarterFlashCard, {FlashCardShareStatus} from "./StudySmarterFlashCard";


program.version('0.0.1')
    .name("studysmarter-api")
    .description("A CLI for a StudySmarter-Api-Wrapper")
    .addHelpText("before", chalk.blue(figlet.textSync('StudySmarter CLI', {horizontalLayout: 'default'})))
    .option("-l, --login <email:password>", "Login to StudySmarter with your credentials seperated with : (e.g. -l example@test.de:password)")
    .option("-lo, --logout", "Logout from StudySmarter")
    .option("-cs, --create-set <name>", "Creates a new StudySmarter Set")
    .addOption(
        new Option("-c, --color <color>", "Select color")
            .choices(Object.keys(SetColor))
            .argParser(input => Utils.selectIntEnum<SetColor>(input,SetColor)))
    .option("-sh, --share", "Select shared / isPublic", false)
    .option("-n, --name <name>", "Set temp name (e.g. for modify)")
    .addOption(
        new Option("-q, --quantity <quantity>", "Sets the quantity variable for fetching flashcards")
            .argParser(Number.parseInt))
    .addOption(
        new Option("-o, --order <order>", "Sets the order variable for fetching flashcards")
            .choices(Object.keys(StudySmarterSearchOrder))
            .argParser(order => Utils.selectEnum(order, StudySmarterSearchOrder)))
    .option("-fs, --fetch-sets", "Fetches all StudySmarter Sets and prints them to the console")
    .option("-sn, --select-set-by-name <name>", "Selects a StudySmarter Set by name")
    .option("-s, --select-set <id>", "Selects a StudySmarter Set by id")
    .option("-ps, --print-set", "Prints the selected StudySmarter Set to the console")
    .option("-fc, --fetch-cards", "Fetches all StudySmarter Cards from the selected Set and prints them to the console")
    .option("-f, --front <text>", "Sets the front variable to modify flashcards")
    .option("-b, --back <text>", "Sets the back variable to modify flashcards")
    .option("-a, --add-flashcard <text>", "Adds a new Flashcard to a StudySmarter Set, front and back are seperated via ;", Utils.collectOption)
    .option("-sc, --select-card <id>", "Selects a StudySmarter Card by id")
    .option("-pc, --print-card", "Prints the selected StudySmarter Card to the console")
    .option("-cc, --copy-cards <deck-id>", "Copies all cards from StudySmarter Set to the current selected Set")
    .option("-i, --import-sets <path>", "Imports all decks from a 'apkg' File to StudySmarter")
    .option("-e, --export-set <path>", "[NOT AVAILABLE] Exports set from StudySmarter to a 'apkg' File")
    .option("-ic, --import-cards <path>", "Imports all cards from a 'apkg' File to StudySmarter")
    .option("-m, --modify-set", "Modifies the selected StudySmarter Set")
    .option("-mc, --modify-card", "Modifies the selected StudySmarter Card")
    .addOption(
        new Option("-sac, --share-all-cards <share-status>", "Set all cards share status")
            .choices(Object.keys(FlashCardShareStatus))
            .argParser(status => Utils.selectIntEnum(status, FlashCardShareStatus)))
    .option("-d, --delete-set", "Deletes the selected StudySmarter Set")
    .option("--delete-all-sets", "Deletes all StudySmarter Sets")
    .option("-pa, --print-account", "Prints the StudySmarter Account to the console")
    .option("-v, --verbose", "Prints more information to the console")
    .addOption(new Option("-rc, --recopy-cards <deck-id>").hideHelp());

const options = program.opts();

program
    .action(() => run().catch(e => console.error(options.verbose ? e : chalk.red(e))))
    .parse(process.argv);

function printVerbose(...args: any[]) {
    if (options.verbose) console.log(...args);
}

function printSuccess(message: string) {
    console.log(chalk.green(message));
}


printVerbose("Options:", options)

async function run() {
    let account: StudySmarterAccount;
    if(options.login) {
        const {1: email, 2: password} = options.login.match(/^([^:]+):(.*)$/);
        printVerbose("Email:", email, "Password:", password);
        if(!email || !password) throw new Error("Please provide a valid email and password seperated by ':'");
        account = await StudySmarterAccount.fromEmailAndPassword(email, password);
        DataStorage.set("account", account);
        printSuccess("Logged in successfully as " + email);
    }else{
        const savedAcc = DataStorage.get("account");
        if(!savedAcc) throw new Error("No login provided and no account saved");
        account = new StudySmarterAccount(savedAcc._id, savedAcc._token);
        printSuccess("Logged in successfully as id " + account.id);
    }

    printVerbose("Account:", account);

    if(options.printAccount) console.table([account]);

    const progress = new cliProgress.SingleBar({}, cliProgress.Presets.rect);


    let selectedSet: StudySmarterStudySet;
    let sets: StudySmarterStudySet[];
    let searchParams: StudySmarterSearchParams = {};

    if(options.quantity) searchParams.quantity = options.quantity;
    if(options.order) searchParams.order = options.order;

    if (options.fetchSets) {
        sets = sets || await account.getStudySets(options.verbose);
        console.table(sets.map(s => Utils.getObjectWithoutKeys(s, ["_account"])));
    }

    if (options.createSet) {
        const set = await account.createStudySet(options.createSet, options.color ?? SetColor.Purple, options.share);
        printVerbose("Created:", set)
        printSuccess(`Created Set '${set.name}' with id ${set.id} in color ${SetColor[set.color]}`);
        selectedSet = set;
    }
    if (options.selectSetByName) {
        sets = sets || await account.getStudySets();
        selectedSet = sets.find(s => s.name == options.selectSetByName);
        printVerbose("Selected via Name:", selectedSet);
        if (!selectedSet) throw new Error(`Could not find set with name ${options.selectSetByName}`);
    }

    if (options.selectSet) {
        sets = sets || await account.getStudySets();
        printVerbose("Sets:", sets)
        selectedSet = sets.find(s => s.id == options.selectSet);
        printVerbose("Selected via Id:", selectedSet);
        if (!selectedSet) throw new Error(`Could not find set with id ${options.selectSet}`);
    }

    if (options.printSet) {
        console.table({...selectedSet, _account: "Irrlevant"});
    }

    let cards: StudySmarterFlashCard[];
    let selectedCard: StudySmarterFlashCard;

    if (options.fetchCards) {
        if (!selectedSet) throw new Error("No set selected");
        cards = await selectedSet.getFlashCards(searchParams);
        cards
            .map(c => ({id: c.id, front: c.question_html.map(q => q.text), back: c.answer_html.map(q => q.text)}))
            .forEach(c => console.log(c));
    }

    if (options.selectCard) {
        if (!selectedSet) throw new Error("No set selected");
        cards = cards ?? await selectedSet.getFlashCards();
        selectedCard = cards.find(c => c.id == options.selectCard);
    }

    if (options.addFlashcard) {
        if (!selectedSet) throw new Error("No set selected");
        for (const text of options.addFlashcard) {
            printVerbose("Adding Flashcard:", text)
            if(!text.includes(";")) throw new Error("Please provide a front and back seperated by ';'");
            const [front, back] = text.split(";");
            await selectedSet.addFlashCard(front, back);
            printSuccess(`Added Flashcard With Front: '${front}' Back: '${back}' to set '${selectedSet.name}'`);
        }
    }

    if(options.printCard) {
        if (!selectedCard) throw new Error("No card selected");
        console.log({...selectedCard, _account: "Irrelevant"});
    }

    if(options.modifyCard) {
        if (!selectedCard) throw new Error("No card selected");
        if(!options.front && !options.back) throw new Error("Please provide a front and back");
        await selectedCard.modifyText(options.front, options.back);
        printSuccess(`Modified Card '${selectedCard.id}' with Front: '${options.front}' Back: '${options.back}'`);
    }

    if(options.shareAllCards){
        if (!selectedSet) throw new Error("No set selected");
        cards = cards ?? await selectedSet.getFlashCards();
        cards = cards.filter(card => card.selfOwned() && card.shared != options.shareAllCards)

        progress.start(cards.length, 0)
        for(const card of cards) {
            await card.modifyShare(options.shareAllCards);
            progress.increment();
        }
        progress.stop();
    }

    if(options.modifySet) {
        if (!selectedSet) throw new Error("No set selected");
        await selectedSet.modify(options.name, options.color, options.share);
        printSuccess(`Modified Set '${selectedSet.name}'`);
    }

    if(options.copyCards) {
        if (!selectedSet) throw new Error("No set selected");
        sets = sets || await account.getStudySets();
        const otherSet = sets.find(s => s.id == options.copyCards);
        if(!otherSet) throw new Error(`Could not find deck with id ${options.copyCards}`);
        const cards = await otherSet.getFlashCards(searchParams);
        progress.start(cards.length, 0)
        for(const card of cards) {
            await selectedSet.addFlashCardClone(card);
            progress.increment();
        }
        progress.stop();
        printSuccess(`Copied Cards from '${otherSet.name}' to '${selectedSet.name}'`);
    }

    //This is just for one specific use-case
    if(options.recopyCards) {
        if (!selectedSet) throw new Error("No set selected");
        sets = sets || await account.getStudySets();
        const otherSet = sets.find(s => s.id == options.recopyCards);
        if(!otherSet) throw new Error(`Could not find deck with id ${options.recopyCards}`);

        const otherCards = await otherSet.getFlashCards();
        const currentCards = await selectedSet.getFlashCards();
        progress.start(currentCards.length, 0)
        for(const card of otherCards) {
            await currentCards.find(c => c.question == card.question)?.modifyText(card.question, card.answer);
            progress.increment();
        }
        progress.stop();
        printSuccess(`Copied Cards from '${otherSet.name}' to '${selectedSet.name}'`);
    }

    if (options.deleteSet) {
        if (!selectedSet) throw new Error("No set selected");
        await selectedSet.delete();
        printSuccess(`Deleted Set '${selectedSet.name}'`);
    }

    if(options.deleteAllSets) {
        sets = sets || await account.getStudySets();
        sets = sets.filter(s => s.creator_id === account.id);

        progress.start(sets.length, 0);
        for(const set of sets) {
            await set.delete();
            progress.increment();
            printSuccess(`Deleted Set '${set.name}' : ${set.id}`);
        }
        progress.stop();
    }

    if (options.importCards) {
        if(!selectedSet) throw new Error("No set selected")
        const ankiResult = await Utils.convertFromAnki(path.join(process.cwd(), options.importCards))
        const cards = ankiResult.decks.flatMap(d => d.cards);
        const images: ImageEntry[] = ankiResult.imagePaths.map(({name, path}) => ({
            name,
            image_blob: new Blob([fs.readFileSync(path)])
        }))

        printSuccess(`Found ${cards.length} cards in ${options.importCards}`);

        progress.start(cards.length, 0);
        for (const card of cards) {
            await selectedSet.addFlashCard(card.front, card.back, images);
            progress.increment();
        }
        progress.stop();
        fs.rmSync(ankiResult.outFolder, {recursive: true})
    }

    if (options.importSets) {
        const ankiResult = await Utils.convertFromAnki(path.join(process.cwd(), options.importSets))
        const images: ImageEntry[] = ankiResult.imagePaths.map(({name, path}) => ({
            name,
            image_blob: new Blob([fs.readFileSync(path)])
        }))

        printSuccess(`Found ${ankiResult.decks.length} decks in ${options.importSets}`);

        progress.start(ankiResult.decks.reduce((p, c) => p + c.cards.length, 0), 0);
        for (const deck of ankiResult.decks) {
            const re = await account.createStudySet(deck.name, SetColor.Violet, false);
            for (const card of deck.cards) {
                await re.addFlashCard(card.front, card.back, images);
                progress.increment();
            }
        }
        progress.stop();
        fs.rmSync(ankiResult.outFolder, {recursive: true})
    }

    if(options.exportSet) {
        if (!selectedSet) throw new Error("No set selected");
        const ankiResult = await Utils.convertToAnki(selectedSet, path.join(process.cwd(), options.exportSet))
        // printSuccess(`Exported ${cards} cards to ${options.exportCards}`);
    }

    if (options.logout) {
        DataStorage.set("account", undefined);
        printSuccess("Logged out");
    }
}



