import chalk from "chalk";
import inquirer from 'inquirer';
import { createInterface } from "readline/promises";

export class InputManager {
    /**
     * @type {[string, string | string[] | boolean][]}
     */
    static totalSelection = []

    /** @private*/
    static lineReader = createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    /**@private */
    static applyQuesionStyle = chalk.bgGreen.bold.whiteBright

    /**
     * @param {string} question
     * @returns {Promise<string>}
     */
    static async getInput(question) {
        console.clear()
        const res = await this.lineReader.question(
            this.applyQuesionStyle(` ${question}: `) + " "
        )
        this.totalSelection.push([question, res])
        return res
    }

    /** @type {import("./types").multipleChoice} */
    static async multipleChoice(question, choices, defaultValues) {
        console.clear()
        const res = await inquirer.prompt([
            {
                type: "checkbox",
                name: "chk",
                message: this.applyQuesionStyle(` ${question} `),
                choices: choices.reduce((/** @type {import("inquirer").CheckboxChoiceOptions[]}*/prev, curr, i) => {
                    prev.push({
                        name: curr,
                        // @ts-ignore
                        checked: !!defaultValues[i]
                    })
                    return prev
                }, []),
            }
        ])
        this.totalSelection.push([question, res.chk])
        return res.chk
    }

    /** @type {import("./types").oneOf} */
    static async oneOf(question, choices) {
        console.clear()
        const res = await inquirer.prompt([
            {
                type: "rawlist",
                name: "chk",
                message: this.applyQuesionStyle(` ${question} `),
                choices
            }
        ])
        this.totalSelection.push([question, res.chk])
        return res.chk
    }

    /**
     * @param {string} question
     * @param {boolean} [defaultValue=true] 
     * @returns {Promise<boolean>}
     */
    static async boolOf(question, defaultValue = true) {
        console.clear()
        const res = await inquirer.prompt([
            {
                type: "confirm",
                name: "chk",
                default: defaultValue,
                message: this.applyQuesionStyle(` ${question} `),
            }
        ])
        this.totalSelection.push([question, res.chk])
        return res.chk
    }

    /**@returns {Promise<boolean>} */
    static async confirmAll() {
        console.clear()
        const msg = this.totalSelection.reduce((prev, [question, result]) => {
            prev += `${question} : ${result}\n`
            return prev
        }, "")

        const res = await inquirer.prompt([
            {
                type: "confirm",
                name: "chk",
                message: `${this.applyQuesionStyle("Confirm The Summary")}\n${msg}`
            }
        ])
        return res.chk
    }
}