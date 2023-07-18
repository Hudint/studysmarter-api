# Installation
## Requirements
- node >= 18.0.0.
## Install
```
npm install -g
```
# Usage
Help:
```
npx studysmarter-api -h
```
```
Usage: studysmarter-api [options] <email> <password>

A CLI for a StudySmarter-Api-Wrapper

Arguments:
  email                             The Email of the StudySmarter Account
  password                          The Password of the StudySmarter Account

Options:
  -V, --version                     output the version number
  -cs, --create-set <name>          Creates a new StudySmarter Set
  -c, --color <color>               Select color (choices: "0", "1", "2", "3", "4", "5", "6", "7", "Red", "Blue", "Mint", "Purple", "Teal", "Orange", "Green", "Violet")
  -sh, --share                      Select shared / isPublic (default: false)
  -n, --name <name>                 Set temp name (e.g. for modify)
  -fs, --fetch-sets                 Fetches all StudySmarter Sets and prints them to the console
  -sn, --select-set-by-name <name>  Selects a StudySmarter Set by name
  -s, --select-set <id>             Selects a StudySmarter Set by id
  -ps, --print-set                  Prints the selected StudySmarter Set to the console
  -a, --add-flashcard <text>        Adds a new Flashcard to a StudySmarter Set, front and back are seperated via |
  -i, --import-sets <path>          Imports all decks from a 'apkg' File to StudySmarter
  -ic, --import-cards <path>        Imports all cards from a 'apkg' File to StudySmarter
  -m, --modify-set                  Modifies the selected StudySmarter Set
  -d, --delete-set                  Deletes the selected StudySmarter Set
  --delete-all-sets                 Deletes all StudySmarter Sets
  -pa, --print-account              Prints the StudySmarter Account to the console
  -v, --verbose                     Prints more information to the console
  -h, --help                        display help for command

```
## Examples
### Create a new Set
```
npx studysmarter-api example@notvalid.de VERYSECRETPASSWORD -cs "My Set" -c Blue -sh
```
### Create a new Set and add Flashcards
```
npx studysmarter-api example@notvalid.de VERYSECRETPASSWORD -cs "My Set With Multiple Cards" -c Blue -sh -a "Front;Back" -a "Front2;Back2"
```

### Import a Anki Deck to StudySmarter
```
npx studysmarter-api example@notvalid.de VERYSECRETPASSWORD -i mydeck.apkg
```

