const fs = require("fs")

import { jtree } from "./jtree"
import { treeNotationTypes } from "../products/treeNotationTypes"
import { GrammarProgram, GrammarBackedRootNode, GrammarConstants } from "./GrammarLanguage"
import { Upgrader } from "./Upgrader"

enum CompileTarget {
  nodejs = "nodejs",
  browser = "browser"
}

class jtreeNode extends jtree {
  static Upgrader = Upgrader
  static GrammarConstants = GrammarConstants

  static executeFile = (programPath: treeNotationTypes.filepath, grammarPath: treeNotationTypes.filepath): Promise<any> =>
    jtreeNode.makeProgram(programPath, grammarPath).execute(programPath)

  static executeFiles = (programPaths: treeNotationTypes.filepath[], grammarPath: treeNotationTypes.filepath): Promise<any>[] => {
    const programConstructor = jtreeNode.getProgramConstructor(grammarPath)
    return programPaths.map(programPath => new programConstructor(fs.readFileSync(programPath, "utf8")).execute(programPath))
  }

  static executeFileSync = (programPath: treeNotationTypes.filepath, grammarPath: treeNotationTypes.filepath): any =>
    jtreeNode.makeProgram(programPath, grammarPath).executeSync(programPath)

  static makeProgram = (programPath: treeNotationTypes.filepath, grammarPath: treeNotationTypes.filepath): GrammarBackedRootNode => {
    const programConstructor = jtreeNode.getProgramConstructor(grammarPath)
    return new programConstructor(fs.readFileSync(programPath, "utf8"))
  }

  static compileGrammarForNodeJs(pathToGrammar: treeNotationTypes.absoluteFilePath, outputFolder: treeNotationTypes.absoluteFolderPath, usePrettier = true) {
    return this._compileGrammar(pathToGrammar, outputFolder, CompileTarget.nodejs, usePrettier)
  }

  private static _compileGrammar(
    pathToGrammar: treeNotationTypes.absoluteFilePath,
    outputFolder: treeNotationTypes.absoluteFolderPath,
    target: CompileTarget,
    usePrettier: boolean
  ) {
    const isNodeJs = CompileTarget.nodejs === target
    const grammarCode = jtree.TreeNode.fromDisk(pathToGrammar)
    const program = new GrammarProgram(grammarCode.toString())
    let name = program.getGrammarName()
    const pathToJtree = __dirname + "/../index.js"
    const outputFilePath = outputFolder + `${name}.${target}.js`

    let result = isNodeJs ? program.toNodeJsJavascript(pathToJtree) : program.toBrowserJavascript()

    if (isNodeJs)
      result =
        "#! /usr/bin/env node\n" +
        result.replace(
          /}\s*$/,
          `
if (!module.parent) new ${name}(jtree.TreeNode.fromDisk(process.argv[2]).toString()).execute()
}
`
        )

    if (usePrettier) result = require("prettier").format(result, { semi: false, parser: "babel", printWidth: 160 })

    fs.writeFileSync(outputFilePath, result, "utf8")

    if (isNodeJs) fs.chmodSync(outputFilePath, 0o755)
    return outputFilePath
  }

  static compileGrammarForBrowser(pathToGrammar: treeNotationTypes.absoluteFilePath, outputFolder: treeNotationTypes.absoluteFolderPath, usePrettier = true) {
    return this._compileGrammar(pathToGrammar, outputFolder, CompileTarget.browser, usePrettier)
  }

  // returns GrammarBackedProgramClass
  static getProgramConstructor = (grammarPath: treeNotationTypes.filepath) => {
    if (!fs.existsSync(grammarPath)) throw new Error(`Grammar file does not exist: ${grammarPath}`)
    const grammarCode = fs.readFileSync(grammarPath, "utf8")
    const grammarProgram = new GrammarProgram(grammarCode)
    return <any>grammarProgram.getRootConstructor()
  }

  static combineFiles = (globPatterns: treeNotationTypes.globPattern[]) => {
    const glob = require("glob")
    const files = jtree.Utils.flatten(<any>globPatterns.map(pattern => glob.sync(pattern)))
    const content = files.map((path: treeNotationTypes.filepath) => fs.readFileSync(path, "utf8")).join("\n")

    return new jtree.TreeNode(content)
  }
}

export { jtreeNode }
