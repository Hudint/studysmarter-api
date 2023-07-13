#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk = require("chalk");
const commander_1 = require("commander");
const figlet = require("figlet");
const fs = require("fs");
const path = require("path");
const cliProgress = require("cli-progress");
const StudySmarterAccount_1 = require("./StudySmarterAccount");
const StudySmarterStudySet_1 = require("./StudySmarterStudySet");
const Utils_1 = require("./Utils");
commander_1.program.version('0.0.1')
    .name("study-smarter-cli")
    .description("A CLI for a StudySmarter-Api-Wrapper")
    .addHelpText("before", chalk.blue(figlet.textSync('StudySmarter CLI', { horizontalLayout: 'default' })))
    .argument("<email>", "The Email of the StudySmarter Account")
    .argument("<password>", "The Password of the StudySmarter Account")
    .option("-cs, --create-set <name>", "Creates a new StudySmarter Set")
    .addOption(new commander_1.Option("-c, --color <color>", "Select color")
    .default(StudySmarterStudySet_1.SetColor.Purple)
    .choices(Object.keys(StudySmarterStudySet_1.SetColor))
    .argParser(Utils_1.default.parseColor))
    .option("-sh, --share", "Select shared / isPublic", false)
    .option("-fs, --fetch-sets", "Fetches all StudySmarter Sets and prints them to the console")
    .option("-sn, --select-set-by-name <name>", "Selects a StudySmarter Set by name")
    .option("-s, --select-set <id>", "Selects a StudySmarter Set by id")
    .option("-ps, --print-set", "Prints the selected StudySmarter Set to the console")
    .option("-a, --add-flashcard <text>", "Adds a new Flashcard to a StudySmarter Set, front and back are seperated via |", Utils_1.default.collectOption)
    .option("-i, --import-sets <path>", "Imports all decks from a 'apkg' File to StudySmarter")
    .option("-d, --delete-set", "Deletes the selected StudySmarter Set")
    .option("--delete-all-sets", "Deletes all StudySmarter Sets")
    .option("-pa, --print-account", "Prints the StudySmarter Account to the console")
    .option("-v, --verbose", "Prints more information to the console");
const options = commander_1.program.opts();
commander_1.program
    .action((email, password) => run(email, password).catch(e => console.error(chalk.red(e))))
    .parse(process.argv);
function printVerbose(...args) {
    if (options.verbose)
        console.log(...args);
}
function printSuccess(message) {
    console.log(chalk.green(message));
}
printVerbose("Options:", options);
async function run(email, password) {
    printVerbose("Username:", options, "Password:", password);
    const account = await StudySmarterAccount_1.default.fromEmailAndPassword(email, password);
    printVerbose("Account:", account);
    if (options.printAccount)
        console.table([account]);
    let selectedSet;
    let sets;
    if (options.fetchSets) {
        sets = sets || await account.getStudySets();
        console.table(sets.map(s => ({ ...s, _account: "Irrlevant" })));
    }
    if (options.createSet) {
        const set = await account.createStudySet(options.createSet, options.color, options.share);
        printVerbose("Created:", set);
        printSuccess(`Created Set '${set.name}' with id ${set.id} in color ${StudySmarterStudySet_1.SetColor[set.color]}`);
        selectedSet = set;
    }
    if (options.selectSetByName) {
        sets = sets || await account.getStudySets();
        selectedSet = sets.find(s => s.name == options.selectSetByName);
        printVerbose("Selected via Name:", selectedSet);
        if (!selectedSet)
            throw new Error(`Could not find set with name ${options.selectSetByName}`);
    }
    if (options.selectSet) {
        sets = sets || await account.getStudySets();
        selectedSet = sets.find(s => s.id == options.selectSet);
        printVerbose("Selected via Id:", selectedSet);
        if (!selectedSet)
            throw new Error(`Could not find set with id ${options.selectSet}`);
    }
    if (options.printSet) {
        console.table({ ...selectedSet, _account: "Irrlevant" });
    }
    if (options.addFlashcard) {
        if (!selectedSet)
            throw new Error("No set selected");
        for (const text of options.addFlashcard) {
            printVerbose("Adding Flashcard:", text);
            const [front, back] = text.split(";");
            await selectedSet.addFlashCard(front, back);
            printSuccess(`Added Flashcard With Front: '${front}' Back: '${back}' to set '${selectedSet.name}'`);
        }
    }
    if (options.deleteSet) {
        if (!selectedSet)
            throw new Error("No set selected");
        await selectedSet.delete();
        printSuccess(`Deleted Set '${selectedSet.name}'`);
    }
    if (options.deleteAllSets) {
        sets = sets || await account.getStudySets();
        sets = sets.filter(s => s.creator_id === account.id);
        const progress = new cliProgress.SingleBar({}, cliProgress.Presets.rect);
        progress.start(sets.length, 0);
        for (const set of sets) {
            await set.delete();
            progress.increment();
            printSuccess(`Deleted Set '${set.name}' : ${set.id}`);
        }
        progress.stop();
    }
    if (options.importSets) {
        const ankiResult = await Utils_1.default.convertFromAnki(path.join(process.cwd(), options.importSets));
        const images = ankiResult.imagePaths.map(({ name, path }) => ({
            name,
            image_file: new Blob([fs.readFileSync(path)])
        }));
        printSuccess(`Found ${ankiResult.decks.length} decks in ${options.importSets}`);
        const progress = new cliProgress.SingleBar({}, cliProgress.Presets.rect);
        progress.start(ankiResult.decks.reduce((p, c) => p + c.cards.length, 0), 0);
        for (const deck of ankiResult.decks) {
            const re = await account.createStudySet(deck.name, StudySmarterStudySet_1.SetColor.Violet, false);
            for (const card of deck.cards) {
                await re.addFlashCard(card.front, card.back, images);
                progress.increment();
            }
        }
        progress.stop();
        fs.rmSync(ankiResult.outFolder, { recursive: true });
    }
}
