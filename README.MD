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
Usage: studysmarter-api [options]

A CLI for a StudySmarter-Api-Wrapper

Options:
  -V, --version                     output the version number
  -l, --login <email:password>      Login to StudySmarter with your credentials seperated with : (e.g. -l example@test.de:password)
  -lo, --logout                     Logout from StudySmarter
  -cs, --create-set <name>          Creates a new StudySmarter Set
  -c, --color <color>               Select color (choices: "0", "1", "2", "3", "4", "5", "6", "7", "Red", "Blue", "Mint", "Purple", "Teal", "Orange", "Green", "Violet")
  -sh, --share                      Select shared / isPublic (default: false)
  -n, --name <name>                 Set temp name (e.g. for modify)
  -q, --quantity <quantity>         Sets the quantity variable for fetching flashcards
  -o, --order <order>               Sets the order variable for fetching flashcards (choices: "smart", "chronological")
  -fs, --fetch-sets                 Fetches all StudySmarter Sets and prints them to the console
  -sn, --select-set-by-name <name>  Selects a StudySmarter Set by name
  -s, --select-set <id>             Selects a StudySmarter Set by id
  -ps, --print-set                  Prints the selected StudySmarter Set to the console
  -fc, --fetch-cards                Fetches all StudySmarter Cards from the selected Set and prints them to the console
  -f, --front <text>                Sets the front variable to modify flashcards
  -b, --back <text>                 Sets the back variable to modify flashcards
  -a, --add-flashcard <text>        Adds a new Flashcard to a StudySmarter Set, front and back are seperated via ;
  -sc, --select-card <id>           Selects a StudySmarter Card by id
  -pc, --print-card                 Prints the selected StudySmarter Card to the console
  -cc, --copy-cards <deck-id>       Copies all cards from StudySmarter Set to the current selected Set
  -i, --import-sets <path>          Imports all decks from a 'apkg' File to StudySmarter
  -ic, --import-cards <path>        Imports all cards from a 'apkg' File to StudySmarter
  -m, --modify-set                  Modifies the selected StudySmarter Set
  -mc, --modify-card                Modifies the selected StudySmarter Card
  -d, --delete-set                  Deletes the selected StudySmarter Set
  --delete-all-sets                 Deletes all StudySmarter Sets
  -pa, --print-account              Prints the StudySmarter Account to the console
  -v, --verbose                     Prints more information to the console
  -h, --help                        display help for command
```
## Examples
### Login
```
npx studysmarter-api -l "example@notvalid.de:VERYSECRETPASSWORD"
```
### Logout
```
npx studysmarter-api -lo
```
### Create a new Set
```
npx studysmarter-api -cs "My Set" -c Blue -sh
```
### Create a new Set and add Flashcards
```
npx studysmarter-api -cs "My Set With Multiple Cards" -c Blue -sh -a "Front;Back" -a "Front2;Back2"
```

### Import a Anki Deck to StudySmarter
```
npx studysmarter-api -i mydeck.apkg
```

