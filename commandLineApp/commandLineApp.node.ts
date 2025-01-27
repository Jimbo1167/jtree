#!/usr/bin/env ts-node
//onsave jtree build produce commandLineApp.node.js

const fs = require("fs")
const recursiveReadSync = require("recursive-readdir-sync")
const homedir = require("os").homedir
const { execSync } = require("child_process")

const { jtree } = require("../index.js")
const { TreeNode, GrammarProgram, Utils } = jtree

import { treeNotationTypes } from "../products/treeNotationTypes"

class CommandLineApp {
  constructor(grammarsPath = homedir() + "/grammars.ssv", cwd = process.cwd()) {
    this._grammarsPath = grammarsPath
    this._initFile(grammarsPath, "name filepath")
    this._reload() // todo: cleanup
    this._cwd = cwd
  }

  private _grammarsPath: treeNotationTypes.filepath
  private _cwd: treeNotationTypes.filepath
  private _grammarsTree: treeNotationTypes.treeNode

  _getRegistryPath() {
    return this._grammarsPath
  }

  // todo: cleanup.
  _reload() {
    this._grammarsTree = TreeNode.fromSsv(this._read(this._grammarsPath)) // todo: index on name, or build a Tree Grammar lang
  }

  build(commandName: string, argument: any) {
    let dir = Utils._removeLastSlash(this._cwd) + "/"
    let filePath = ""
    while (dir !== "/") {
      filePath = dir + "builder.ts"
      if (fs.existsSync(filePath)) break
      dir = Utils._getParentFolder(dir)
    }
    if (!fs.existsSync(filePath)) throw new Error(`No '${filePath}' found.`)

    return execSync([filePath, commandName, argument].filter(f => f).join(" "), { encoding: "utf8" })
  }

  combine(grammarName: treeNotationTypes.grammarName) {
    const content = this.programs(grammarName)
      .split(" ")
      .map(path => {
        const distributeLine = true ? `#file ${path}\n` : ""
        return distributeLine + " " + this._read(path).replace(/\n/g, "\n ")
      })
      .join("\n")

    return new TreeNode(content).toString()
  }

  distribute(combinedFilePath: treeNotationTypes.filepath) {
    if (!combinedFilePath) throw new Error(`No combinedFilePath provided`)
    const masterFile = new TreeNode(this._read(combinedFilePath))
    return masterFile.split("#file").map((file: treeNotationTypes.treeNode) => {
      const firstLine = file.nodeAt(0)
      if (firstLine.getFirstWord() !== "#file") return undefined
      const filepath = firstLine.getWord(1)

      const needsShift = !firstLine.length
      if (needsShift) firstLine.shiftYoungerSibsRight()

      this._write(filepath, firstLine.childrenToString())
      return filepath
    })
  }

  _initFile(path: treeNotationTypes.filepath, initialString = "") {
    if (!fs.existsSync(path)) this._write(path, initialString)
  }

  _write(path: treeNotationTypes.filepath, content: string) {
    return fs.writeFileSync(path, content, "utf8")
  }

  _read(path: treeNotationTypes.filepath) {
    return fs.readFileSync(path, "utf8")
  }

  // todo: improve or remove
  cases(folder: treeNotationTypes.filepath, grammarName: treeNotationTypes.grammarName) {
    const files = recursiveReadSync(folder).filter((file: treeNotationTypes.filepath) => file.endsWith("." + grammarName))
    const grammarProgram = this._getGrammarProgramRoot(grammarName)
    files.map((filename: treeNotationTypes.filepath) => {
      const errors = this._check(filename)
      if (errors.length) {
        throw new Error(`Type check errors ${errors}`)
      }
      const actual = this.compile(filename)
      const expectedPath = filename.replace("." + grammarName, ".compiled")
      const expected = this._read(expectedPath)
      if (expected !== actual) {
        const errorTree = new TreeNode()
        errorTree.appendLineAndChildren("expected", expected)
        errorTree.appendLineAndChildren("actual", actual)
        throw new Error("Compile Errors\n" + errorTree.toString())
      }
      console.log(`${filename} passed`)
    })
  }

  getGrammars() {
    return this._grammarsTree
  }

  help() {
    const help = this._read(__dirname + "/../commandLineApp/help.ssv") // note: we do the parent indirection for compiled reasons.
    return TreeNode.fromSsv(help).toTable()
  }

  base(folderPath: treeNotationTypes.absoluteFolderPath = undefined, port = 4444) {
    const { TreeBaseFolder, TreeBaseServer } = require("../products/treeBase.node.js")
    if (!folderPath) {
      folderPath = require("path").resolve(__dirname + "/../treeBase/planets/")
      console.log(`No path to a TreeBase folder provided. Defaulting to '${folderPath}'`)
    }
    const folder = new TreeBaseFolder(undefined, folderPath)
    folder.startListeningForFileChanges()
    new TreeBaseServer(folder).listen(port)
  }

  list() {
    const grammars = this.getGrammars().clone()
    grammars.sortBy("name")
    return `${grammars.length} Tree Grammars registered in ${this._getRegistryPath()}
${grammars.toTable()}`
  }

  isRegistered(grammarName: treeNotationTypes.grammarName) {
    return this.getGrammars().where("name", "=", grammarName).length === 1
  }

  _getGrammarPathByGrammarNameOrThrow(grammarName: treeNotationTypes.grammarName) {
    const node = this.getGrammars().getNodeByColumns("name", grammarName)

    if (!node) throw new Error(`No registered grammar named '${grammarName}'. Registered grammars are ${this._getRegisteredGrammarNames().join(",")}`)

    return node.getParent().get("filepath")
  }

  create() {
    jtree.executeFile(__dirname + "/create.stamp", this._getGrammarPathByGrammarNameOrThrow("stamp"))
  }

  check(programPath: treeNotationTypes.treeProgramFilePath) {
    return this._checkAndLog(programPath)
  }

  checkAll(grammarName: treeNotationTypes.grammarName) {
    const files = this._history(grammarName)
    return files.map(file => this._checkAndLog(file)).join("\n")
  }

  _checkAndLog(programPath: treeNotationTypes.treeProgramFilePath) {
    const errors = this._check(programPath)
    return `${errors.length} errors for ${programPath}${errors.length ? "\n" + errors.join("\n") : ""}`
  }

  _check(programPath: treeNotationTypes.treeProgramFilePath) {
    const grammarPath = this._getGrammarPathOrThrow(programPath)
    const program = jtree.makeProgram(programPath, grammarPath)
    return program.getAllErrors().map((err: any) => err.getMessage())
  }

  _getRegisteredGrammarNames() {
    return this.getGrammars().getColumn("name")
  }

  _getGrammarPathOrThrow(programPath: treeNotationTypes.treeProgramFilePath) {
    const extension = Utils.getFileExtension(programPath)
    return this._getGrammarPathByGrammarNameOrThrow(extension)
  }

  sandbox(port = 3333) {
    const { SandboxServer } = require("../products/SandboxServer.node.js")
    const server = new SandboxServer()
    server.start(port)
    return `Starting sandbox on port ${port}`
  }

  prettify(programPath: treeNotationTypes.treeProgramFilePath) {
    const programConstructor = jtree.getProgramConstructor(this._getGrammarPathOrThrow(programPath))
    const program = new programConstructor(this._read(programPath))
    const original = program.toString()
    const pretty = program.sortNodesByInScopeOrder().getSortedByInheritance()
    this._write(programPath, pretty)
    return original === pretty ? "No change" : "File updated"
  }

  parse(programPath: treeNotationTypes.treeProgramFilePath) {
    const programConstructor = jtree.getProgramConstructor(this._getGrammarPathOrThrow(programPath))
    const program = new programConstructor(this._read(programPath))
    return program.getParseTable(35)
  }

  sublime(grammarName: treeNotationTypes.grammarName, outputDirectory: treeNotationTypes.absoluteFolderPath = ".") {
    const grammarPath = this._getGrammarPathByGrammarNameOrThrow(grammarName)
    const grammarProgram = new GrammarProgram(fs.readFileSync(grammarPath, "utf8"))
    const outputPath = outputDirectory + `/${grammarProgram.getExtensionName()}.sublime-syntax`

    this._write(outputPath, grammarProgram.toSublimeSyntaxFile())
    return `Saved: ${outputPath}`
  }

  _getGrammarProgramRoot(grammarName: treeNotationTypes.grammarName) {
    const grammarPath = this._getGrammarPathByGrammarNameOrThrow(grammarName)
    return new GrammarProgram(this._read(grammarPath))
  }

  compile(programPath: treeNotationTypes.treeProgramFilePath) {
    // todo: allow user to provide destination
    const grammarPath = this._getGrammarPathOrThrow(programPath)
    const program = jtree.makeProgram(programPath, grammarPath)
    const grammarProgram = new GrammarProgram(this._read(grammarPath))
    return program.compile()
  }

  _getLogFilePath() {
    return homedir() + "/history.ssv"
  }

  programs(grammarName: treeNotationTypes.grammarName) {
    return this._history(grammarName).join(" ")
  }

  allHistory() {
    return this._getHistoryFile()
  }

  _getHistoryFile() {
    this._initFile(this._getLogFilePath(), "command paramOne paramTwo timestamp\n")
    return this._read(this._getLogFilePath())
  }

  _history(grammarName: treeNotationTypes.grammarName) {
    this._getGrammarPathByGrammarNameOrThrow(grammarName)
    // todo: store history of all commands
    // todo: build language for commandLineApp history
    // todo: refactor this
    // todo: some easier one step way to get a set from a column
    // todo: add support for initing a TreeNode from a JS set and map
    const data = TreeNode.fromSsv(this._getHistoryFile())
    const files = data
      .filter((node: treeNotationTypes.treeNode) => {
        const command = node.get("command")
        const filepath = node.get("paramOne")
        // make sure theres a filder and it has an extension.
        if (!filepath || !filepath.includes(".")) return false
        if (["check", "run", "", "compile"].includes(command)) return true
      })
      .map((node: treeNotationTypes.treeNode) => node.get("paramOne"))
    const items = Object.keys(new TreeNode(files.join("\n")).toObject())
    return items.filter(file => file.endsWith(grammarName)).filter(file => fs.existsSync(file))
  }

  register(grammarPath: treeNotationTypes.grammarFilePath) {
    const extension = this._register(grammarPath)
    return `Registered ${extension}`
  }

  _register(grammarPath: treeNotationTypes.grammarFilePath) {
    // todo: create RegistryTreeLanguage. Check types, dupes, sort, etc.
    const grammarProgram = new GrammarProgram(this._read(grammarPath))
    const extension = grammarProgram.getExtensionName()
    fs.appendFileSync(this._getRegistryPath(), `\n${extension} ${grammarPath}`, "utf8")
    this._reload()
    return extension
  }

  addToHistory(one: string, two: string, three: string) {
    // everytime you run/check/compile a tree program, log it by default.
    // that way, if a language changes or you need to do refactors, you have the
    // data of file paths handy..
    // also the usage data can be used to improve the commandLineApp app
    const line = `${one || ""} ${two || ""} ${three || ""} ${Date.now()}\n`
    const logFilePath = this._getLogFilePath()
    this._initFile(logFilePath, "command paramOne paramTwo timestamp\n")
    fs.appendFile(logFilePath, line, "utf8", () => {})
  }

  async _run(programPath: treeNotationTypes.treeProgramFilePath) {
    const result = await jtree.executeFile(programPath, this._getGrammarPathOrThrow(programPath))
    return result
  }

  _runSync(programPath: treeNotationTypes.treeProgramFilePath) {
    return jtree.executeFileSync(programPath, this._getGrammarPathOrThrow(programPath))
  }

  async run(programPathOrGrammarName: treeNotationTypes.treeProgramFilePath | treeNotationTypes.grammarName) {
    if (programPathOrGrammarName.includes(".")) return this._run(programPathOrGrammarName)
    return Promise.all(this._history(programPathOrGrammarName).map(file => this._run(file)))
  }

  runSync(programPathOrGrammarName: treeNotationTypes.treeProgramFilePath | treeNotationTypes.grammarName) {
    if (programPathOrGrammarName.includes(".")) return this._runSync(programPathOrGrammarName)
    return this._history(programPathOrGrammarName).map(file => this._runSync(file))
  }

  usage(grammarName: treeNotationTypes.grammarName) {
    const files = this._history(grammarName)
    if (!files.length) return ""
    const grammarPath = this._getGrammarPathByGrammarNameOrThrow(grammarName)
    const programConstructor = jtree.getProgramConstructor(grammarPath)
    const report = new TreeNode()
    files.forEach(path => {
      try {
        const code = this._read(path)
        const program = new programConstructor(code)
        const usage = program.getNodeTypeUsage(path)
        report.extend(usage.toString())
      } catch (err) {
        // console.log(`Error getting usage stats for program ` + path)
      }
    })
    const folderName = grammarName
    const stampFile = new TreeNode(`folder ${folderName}`)
    report.forEach((node: treeNotationTypes.treeNode) => {
      const fileNode = stampFile.appendLine(`file ${folderName}/${node.getFirstWord()}.ssv`)
      fileNode.appendLineAndChildren("data", `${node.getContent()}\n` + node.childrenToString())
    })
    return stampFile.toString()
  }

  version() {
    return `jtree version ${jtree.getVersion()} installed at ${__filename}`
  }

  _getAllCommands() {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(this))
      .filter(word => !word.startsWith("_") && word !== "constructor")
      .sort()
  }

  _getPartialMatches(commandName: string) {
    return this._getAllCommands().filter(item => item.startsWith(commandName))
  }

  static async main() {
    const app = <any>new CommandLineApp()

    const action = process.argv[2]
    const paramOne = process.argv[3]
    const paramTwo = process.argv[4]
    const print = console.log
    const partialMatches = app._getPartialMatches(action)

    if (app[action]) {
      app.addToHistory(action, paramOne, paramTwo)
      const result = app[action](paramOne, paramTwo)
      if (result !== undefined) print(result)
    } else if (!action) {
      app.addToHistory()
      print(app.help())
    } else if (fs.existsSync(action)) {
      app.addToHistory(undefined, action)
      const result = await app.run(action)
      print(result)
    } else if (partialMatches.length > 0) {
      if (partialMatches.length === 1) print(app[partialMatches[0]](paramOne, paramTwo))
      else print(`Multiple matches for '${action}'. Options are:\n${partialMatches.join("\n")}`)
    } else print(`Unknown command '${action}'. Options are:\n${app._getAllCommands().join("\n")}. \nType 'tree help' to see help for commands.`)
  }
}

if (!module.parent) CommandLineApp.main()

export { CommandLineApp }
