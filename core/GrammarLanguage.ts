import { TreeNode, ExtendibleTreeNode, AbstractExtendibleTreeNode } from "./TreeNode"
import { TreeUtils } from "./TreeUtils"
import { treeNotationTypes } from "../products/treeNotationTypes"

interface AbstractRuntimeProgramConstructorInterface {
  new (code?: string): GrammarBackedRootNode
}

declare type parserInfo = { firstWordMap: { [firstWord: string]: nodeTypeDefinitionNode }; regexTests: treeNotationTypes.regexTestDef[] }

enum GrammarConstantsCompiler {
  stringTemplate = "stringTemplate", // replacement instructions
  indentCharacter = "indentCharacter",
  catchAllCellDelimiter = "catchAllCellDelimiter",
  openChildren = "openChildren",
  joinChildrenWith = "joinChildrenWith",
  closeChildren = "closeChildren"
}

enum PreludeCellTypeIds {
  anyCell = "anyCell",
  keywordCell = "keywordCell",
  extraWordCell = "extraWordCell",
  floatCell = "floatCell",
  numberCell = "numberCell",
  bitCell = "bitCell",
  boolCell = "boolCell",
  intCell = "intCell"
}

enum GrammarConstantsConstantTypes {
  boolean = "boolean",
  string = "string",
  int = "int",
  float = "float"
}

enum GrammarBundleFiles {
  package = "package.json",
  readme = "readme.md",
  indexHtml = "index.html",
  indexJs = "index.js",
  testJs = "test.js"
}

enum GrammarCellParser {
  prefix = "prefix",
  postfix = "postfix",
  omnifix = "omnifix"
}

enum GrammarConstants {
  // node types
  extensions = "extensions",
  toolingDirective = "tooling",
  todoComment = "todo",
  version = "version",
  nodeType = "nodeType",
  cellType = "cellType",

  grammarFileExtension = "grammar",

  nodeTypeSuffix = "Node",
  cellTypeSuffix = "Cell",

  // error check time
  regex = "regex", // temporary?
  reservedWords = "reservedWords", // temporary?
  enumFromCellTypes = "enumFromCellTypes", // temporary?
  enum = "enum", // temporary?

  // baseNodeTypes
  baseNodeType = "baseNodeType",
  blobNode = "blobNode",
  errorNode = "errorNode",

  // parse time
  extends = "extends",
  abstract = "abstract",
  root = "root",
  match = "match",
  pattern = "pattern",
  inScope = "inScope",
  cells = "cells",
  catchAllCellType = "catchAllCellType",
  cellParser = "cellParser",
  catchAllNodeType = "catchAllNodeType",
  constants = "constants",
  required = "required", // Require this nodeType to be present in a node or program
  single = "single", // Have at most 1 of these
  tags = "tags",

  // default catchAll nodeType
  BlobNode = "BlobNode",
  defaultRootNode = "defaultRootNode",

  // code
  javascript = "javascript",

  // compile time
  compilerNodeType = "compiler",
  compilesTo = "compilesTo",

  // develop time
  description = "description",
  example = "example",
  frequency = "frequency", // todo: remove. switch to conditional frequencies. potentially do that outside this core lang.
  highlightScope = "highlightScope"
}

// todo: can we merge these methods into base TreeNode and ditch this class?
abstract class GrammarBackedNode extends TreeNode {
  abstract getDefinition(): AbstractGrammarDefinitionNode

  getAutocompleteResults(partialWord: string, cellIndex: treeNotationTypes.positiveInt) {
    return cellIndex === 0 ? this._getAutocompleteResultsForFirstWord(partialWord) : this._getAutocompleteResultsForCell(partialWord, cellIndex)
  }

  getChildInstancesOfNodeTypeId(nodeTypeId: treeNotationTypes.nodeTypeId): GrammarBackedNode[] {
    return this.filter(node => node.doesExtend(nodeTypeId))
  }

  doesExtend(nodeTypeId: treeNotationTypes.nodeTypeId) {
    return this.getDefinition()._doesExtend(nodeTypeId)
  }

  _getErrorNodeErrors() {
    return [this.getFirstWord() ? new UnknownNodeTypeError(this) : new BlankLineError(this)]
  }

  _getBlobNodeCatchAllNodeType() {
    return BlobNode
  }

  private _getAutocompleteResultsForFirstWord(partialWord: string) {
    let defs: nodeTypeDefinitionNode[] = Object.values(this.getDefinition().getFirstWordMapWithDefinitions())

    if (partialWord)
      defs = defs.filter(def => {
        const word = def._getFirstWordMatch()
        return word ? word.includes(partialWord) : false
      })

    return defs.map(def => {
      const id = def._getFirstWordMatch()
      const description = def.getDescription()
      return {
        text: id,
        displayText: id + (description ? " " + description : "")
      }
    })
  }

  private _getAutocompleteResultsForCell(partialWord: string, cellIndex: treeNotationTypes.positiveInt) {
    // todo: root should be [] correct?
    const cell = this._getParsedCells()[cellIndex]
    return cell ? cell.getAutoCompleteWords(partialWord) : []
  }

  // note: this is overwritten by the root node of a runtime grammar program.
  // some of the magic that makes this all work. but maybe there's a better way.
  abstract getGrammarProgramRoot(): GrammarProgram

  // todo: rename to something better?
  abstract getRootProgramNode(): GrammarBackedRootNode

  _getParsedCells(): AbstractGrammarBackedCell<any>[] {
    return []
  }

  getRunTimeEnumOptions(cell: AbstractGrammarBackedCell<any>): string[] {
    return undefined
  }

  sortNodesByInScopeOrder() {
    const nodeTypeOrder = this.getDefinition()._getMyInScopeNodeTypeIds()
    if (!nodeTypeOrder.length) return this
    const orderMap: treeNotationTypes.stringMap = {}
    nodeTypeOrder.forEach((word, index) => {
      orderMap[word] = index
    })
    this.sort(
      TreeUtils.makeSortByFn((runtimeNode: GrammarBackedNonRootNode) => {
        return orderMap[runtimeNode.getDefinition().getNodeTypeIdFromDefinition()]
      })
    )
    return this
  }

  protected _getRequiredNodeErrors(errors: treeNotationTypes.TreeError[] = []) {
    Object.values(this.getDefinition().getFirstWordMapWithDefinitions()).forEach(def => {
      if (def.isRequired()) {
        if (!this.getChildren().some(node => node.getDefinition() === def)) errors.push(new MissingRequiredNodeTypeError(this, def.getNodeTypeIdFromDefinition()))
      }
    })
    return errors
  }
}

class TypedWord {
  private _node: TreeNode
  private _cellIndex: number
  private _type: string
  constructor(node: TreeNode, cellIndex: number, type: string) {
    this._node = node
    this._cellIndex = cellIndex
    this._type = type
  }
  replace(newWord: string) {
    this._node.setWord(this._cellIndex, newWord)
  }
  get word() {
    return this._node.getWord(this._cellIndex)
  }

  get type() {
    return this._type
  }

  toString() {
    return this.word + ":" + this.type
  }
}

abstract class GrammarBackedRootNode extends GrammarBackedNode {
  getRootProgramNode() {
    return this
  }

  getProgramAsCells() {
    return this.getTopDownArray().map((node: GrammarBackedNode) => {
      const cells = node._getParsedCells()
      let indents = node.getIndentLevel()
      while (indents) {
        cells.unshift(undefined)
        indents--
      }
      return cells
    })
  }

  getProgramWidth() {
    return Math.max(...this.getProgramAsCells().map(line => line.length))
  }

  createParser() {
    return new TreeNode.Parser(BlobNode)
  }

  getAllTypedWords() {
    const words: TypedWord[] = []
    this.getTopDownArray().forEach((node: GrammarBackedNonRootNode) => {
      node.getWordTypes().forEach((cell, index) => {
        words.push(new TypedWord(node, index, cell.getCellTypeId()))
      })
    })
    return words
  }

  findAllWordsWithCellType(cellTypeId: treeNotationTypes.cellTypeId) {
    return this.getAllTypedWords().filter(typedWord => typedWord.type === cellTypeId)
  }

  findAllNodesWithNodeType(nodeTypeId: treeNotationTypes.nodeTypeId) {
    return this.getTopDownArray().filter((node: GrammarBackedNonRootNode) => node.getDefinition().getNodeTypeIdFromDefinition() === nodeTypeId)
  }

  getDefinition(): GrammarProgram {
    return this.getGrammarProgramRoot()
  }

  getInPlaceCellTypeTree() {
    return this.getTopDownArray()
      .map(child => child.getIndentation() + child.getLineCellTypes())
      .join("\n")
  }

  getParseTable(maxColumnWidth = 40) {
    const tree = new TreeNode(this.getInPlaceCellTypeTree())
    return new TreeNode(
      tree.getTopDownArray().map((node, lineNumber) => {
        const sourceNode = this.nodeAtLine(lineNumber)
        const errs = sourceNode.getErrors()
        const errorCount = errs.length
        const obj: any = {
          lineNumber: lineNumber,
          source: sourceNode.getIndentation() + sourceNode.getLine(),
          nodeType: sourceNode.constructor.name,
          cellTypes: node.getContent(),
          errorCount: errorCount
        }
        if (errorCount) obj.errorMessages = errs.map(err => err.getMessage()).join(";")
        return obj
      })
    ).toFormattedTable(maxColumnWidth)
  }

  getErrors(): treeNotationTypes.TreeError[] {
    return this._getRequiredNodeErrors(super.getErrors())
  }

  // Helper method for selecting potential nodeTypes needed to update grammar file.
  getInvalidNodeTypes() {
    return Array.from(
      new Set(
        this.getAllErrors()
          .filter(err => err instanceof UnknownNodeTypeError)
          .map(err => err.getNode().getFirstWord())
      )
    )
  }

  getAllSuggestions() {
    return new TreeNode(
      this.getAllWordBoundaryCoordinates().map(coordinate => {
        const results = this.getAutocompleteResultsAt(coordinate.y, coordinate.x)
        return {
          line: coordinate.y,
          char: coordinate.x,
          word: results.word,
          suggestions: results.matches.map(m => m.text).join(" ")
        }
      })
    ).toTable()
  }

  getAutocompleteResultsAt(lineIndex: treeNotationTypes.positiveInt, charIndex: treeNotationTypes.positiveInt) {
    const lineNode = this.nodeAtLine(lineIndex) || this
    const nodeInScope = <GrammarBackedNode>lineNode.getNodeInScopeAtCharIndex(charIndex)

    // todo: add more tests
    // todo: second param this.childrenToString()
    // todo: change to getAutocomplete definitions

    const wordIndex = lineNode.getWordIndexAtCharacterIndex(charIndex)
    const wordProperties = lineNode.getWordProperties(wordIndex)
    return {
      startCharIndex: wordProperties.startCharIndex,
      endCharIndex: wordProperties.endCharIndex,
      word: wordProperties.word,
      matches: nodeInScope.getAutocompleteResults(wordProperties.word, wordIndex)
    }
  }

  getSortedByInheritance() {
    const clone = new ExtendibleTreeNode(this.clone())
    const familyTree = new GrammarProgram(clone.toString()).getNodeTypeFamilyTree()
    const rank: treeNotationTypes.stringMap = {}
    familyTree.getTopDownArray().forEach((node, index) => {
      rank[node.getWord(0)] = index
    })
    const nodeAFirst = -1
    const nodeBFirst = 1
    clone.sort((nodeA, nodeB) => {
      const nodeARank = rank[nodeA.getWord(0)]
      const nodeBRank = rank[nodeB.getWord(0)]
      return nodeARank < nodeBRank ? nodeAFirst : nodeBFirst
    })

    return clone
  }

  getNodeTypeUsage(filepath = "") {
    // returns a report on what nodeTypes from its language the program uses
    const usage = new TreeNode()
    const grammarProgram = this.getGrammarProgramRoot()
    grammarProgram.getValidConcreteAndAbstractNodeTypeDefinitions().forEach((def: AbstractGrammarDefinitionNode) => {
      const requiredCellTypeIds = def.getCellParser().getRequiredCellTypeIds()
      usage.appendLine([def.getNodeTypeIdFromDefinition(), "line-id", "nodeType", requiredCellTypeIds.join(" ")].join(" "))
    })
    this.getTopDownArray().forEach((node, lineNumber) => {
      const stats = <TreeNode>usage.getNode(node.getNodeTypeId())
      stats.appendLine([filepath + "-" + lineNumber, node.getWords().join(" ")].join(" "))
    })
    return usage
  }

  getInPlaceHighlightScopeTree() {
    return this.getTopDownArray()
      .map(child => child.getIndentation() + child.getLineHighlightScopes())
      .join("\n")
  }

  getInPlaceCellTypeTreeWithNodeConstructorNames() {
    return this.getTopDownArray()
      .map(child => child.constructor.name + this.getZI() + child.getIndentation() + child.getLineCellTypes())
      .join("\n")
  }

  getInPlacePreludeCellTypeTreeWithNodeConstructorNames() {
    return this.getTopDownArray()
      .map(child => child.constructor.name + this.getZI() + child.getIndentation() + child.getLineCellPreludeTypes())
      .join("\n")
  }

  getTreeWithNodeTypes() {
    return this.getTopDownArray()
      .map(child => child.constructor.name + this.getZI() + child.getIndentation() + child.getLine())
      .join("\n")
  }

  getCellHighlightScopeAtPosition(lineIndex: number, wordIndex: number): treeNotationTypes.highlightScope | undefined {
    this._initCellTypeCache()
    const typeNode = this._cache_highlightScopeTree.getTopDownArray()[lineIndex - 1]
    return typeNode ? typeNode.getWord(wordIndex - 1) : undefined
  }

  private _cache_programCellTypeStringMTime: number
  private _cache_highlightScopeTree: TreeNode
  private _cache_typeTree: TreeNode

  protected _initCellTypeCache(): void {
    const treeMTime = this.getLineOrChildrenModifiedTime()
    if (this._cache_programCellTypeStringMTime === treeMTime) return undefined

    this._cache_typeTree = new TreeNode(this.getInPlaceCellTypeTree())
    this._cache_highlightScopeTree = new TreeNode(this.getInPlaceHighlightScopeTree())
    this._cache_programCellTypeStringMTime = treeMTime
  }
}

abstract class GrammarBackedNonRootNode extends GrammarBackedNode {
  getRootProgramNode() {
    return (<GrammarBackedNode>this.getParent()).getRootProgramNode()
  }

  createParser() {
    return new TreeNode.Parser(
      this.getParent()
        ._getParser()
        ._getCatchAllNodeConstructor(this.getParent()),
      {}
    )
  }

  getNodeTypeId(): treeNotationTypes.nodeTypeId {
    return this.getDefinition().getNodeTypeIdFromDefinition()
  }

  getDefinition(): nodeTypeDefinitionNode {
    return this.getRootProgramNode()
      .getGrammarProgramRoot()
      .getNodeTypeDefinitionByNodeTypeId(this.constructor.name)
  }

  getGrammarProgramRoot() {
    return this.getRootProgramNode().getGrammarProgramRoot()
  }

  getWordTypes() {
    return this._getParsedCells().filter(cell => cell.getWord() !== undefined)
  }

  _getParsedCells(): AbstractGrammarBackedCell<any>[] {
    return this.getDefinition()
      .getCellParser()
      .getCellArray(this)
  }

  // todo: just make a fn that computes proper spacing and then is given a node to print
  getLineCellTypes() {
    return this._getParsedCells()
      .map(slot => slot.getCellTypeId())
      .join(" ")
  }

  getLineCellPreludeTypes() {
    return this._getParsedCells()
      .map(slot => {
        const def = slot._getCellTypeDefinition()
        //todo: cleanup
        return def ? def._getPreludeKindId() : PreludeCellTypeIds.anyCell
      })
      .join(" ")
  }

  getLineHighlightScopes(defaultScope = "source") {
    return this._getParsedCells()
      .map(slot => slot.getHighlightScope() || defaultScope)
      .join(" ")
  }

  getErrors() {
    const errors = this._getParsedCells()
      .map(check => check.getErrorIfAny())
      .filter(i => i)

    const firstWord = this.getFirstWord()
    if (this.getDefinition().has(GrammarConstants.single))
      this.getParent()
        .findNodes(firstWord)
        .forEach((node, index) => {
          if (index) errors.push(new NodeTypeUsedMultipleTimesError(<GrammarBackedNode>node))
        })

    return this._getRequiredNodeErrors(errors)
  }

  protected _getCompiledIndentation() {
    const indentCharacter = this.getDefinition()._getCompilerObject()[GrammarConstantsCompiler.indentCharacter]
    const indent = this.getIndentation()
    return indentCharacter !== undefined ? indentCharacter.repeat(indent.length) : indent
  }

  private _getFields() {
    // fields are like cells
    const fields: any = {}
    this.forEach(node => {
      const def = node.getDefinition()
      if (def.isRequired() || def.has(GrammarConstants.single)) fields[node.getWord(0)] = node.getContent()
    })
    return fields
  }

  protected _getCompiledLine() {
    const compiler = this.getDefinition()._getCompilerObject()
    const catchAllCellDelimiter = compiler[GrammarConstantsCompiler.catchAllCellDelimiter]
    const str = compiler[GrammarConstantsCompiler.stringTemplate]
    return str !== undefined ? TreeUtils.formatStr(str, catchAllCellDelimiter, Object.assign(this._getFields(), this.cells)) : this.getLine()
  }

  compile() {
    const def = this.getDefinition()
    if (def.isTerminalNodeType()) return this._getCompiledIndentation() + this._getCompiledLine()

    const compiler = def._getCompilerObject()
    const openChildrenString = compiler[GrammarConstantsCompiler.openChildren] || ""
    const closeChildrenString = compiler[GrammarConstantsCompiler.closeChildren] || ""
    const childJoinCharacter = compiler[GrammarConstantsCompiler.joinChildrenWith] || "\n"

    const compiledLine = this._getCompiledLine()
    const indent = this._getCompiledIndentation()

    const compiledChildren = this.map(child => child.compile()).join(childJoinCharacter)

    return `${indent}${compiledLine}${openChildrenString}
${compiledChildren}
${indent}${closeChildrenString}`
  }

  // todo: remove
  get cells() {
    const cells: treeNotationTypes.stringMap = {}
    this._getParsedCells().forEach(cell => {
      const cellTypeId = cell.getCellTypeId()
      if (!cell.isCatchAll()) cells[cellTypeId] = cell.getParsed()
      else {
        if (!cells[cellTypeId]) cells[cellTypeId] = []
        cells[cellTypeId].push(cell.getParsed())
      }
    })
    return cells
  }
}

class BlobNode extends GrammarBackedNonRootNode {
  createParser() {
    return new TreeNode.Parser(BlobNode, {})
  }

  getErrors(): treeNotationTypes.TreeError[] {
    return []
  }
}

class UnknownNodeTypeNode extends GrammarBackedNonRootNode {
  createParser() {
    return new TreeNode.Parser(UnknownNodeTypeNode, {})
  }

  getErrors(): treeNotationTypes.TreeError[] {
    return [new UnknownNodeTypeError(this)]
  }
}

/*
A cell contains a word but also the type information for that word.
*/
abstract class AbstractGrammarBackedCell<T> {
  constructor(node: GrammarBackedNonRootNode, index: treeNotationTypes.int, typeDef: cellTypeDefinitionNode, cellTypeId: string, isCatchAll: boolean, nodeTypeDef: AbstractGrammarDefinitionNode) {
    this._typeDef = typeDef
    this._node = node
    this._isCatchAll = isCatchAll
    this._index = index
    this._cellTypeId = cellTypeId
    this._nodeTypeDefinition = nodeTypeDef
  }

  getWord() {
    return this._node.getWord(this._index)
  }

  private _node: GrammarBackedNonRootNode
  protected _index: treeNotationTypes.int
  private _typeDef: cellTypeDefinitionNode
  private _isCatchAll: boolean
  private _cellTypeId: string
  protected _nodeTypeDefinition: AbstractGrammarDefinitionNode

  getCellTypeId() {
    return this._cellTypeId
  }

  static parserFunctionName = ""

  getNode() {
    return this._node
  }

  getCellIndex() {
    return this._index
  }

  isCatchAll() {
    return this._isCatchAll
  }

  abstract getParsed(): T

  getHighlightScope(): string | undefined {
    const definition = this._getCellTypeDefinition()
    if (definition) return definition.getHighlightScope() // todo: why the undefined?
  }

  getAutoCompleteWords(partialWord: string = "") {
    const cellDef = this._getCellTypeDefinition()
    let words = cellDef ? cellDef._getAutocompleteWordOptions(this.getNode().getRootProgramNode()) : []

    const runTimeOptions = this.getNode().getRunTimeEnumOptions(this)
    if (runTimeOptions) words = runTimeOptions.concat(words)

    if (partialWord) words = words.filter(word => word.includes(partialWord))
    return words.map(word => {
      return {
        text: word,
        displayText: word
      }
    })
  }

  synthesizeCell(): string {
    // todo: cleanup
    const cellDef = this._getCellTypeDefinition()
    const enumOptions = cellDef._getFromExtended(GrammarConstants.enum)
    return enumOptions ? TreeUtils.getRandomString(1, enumOptions.split(" ")) : this._synthesizeCell()
  }

  abstract _synthesizeCell(): string

  _getCellTypeDefinition() {
    return this._typeDef
  }

  protected _getFullLine() {
    return this.getNode().getLine()
  }

  protected _getErrorContext() {
    return this._getFullLine().split(" ")[0] // todo: XI
  }

  protected abstract _isValid(): boolean

  isValid(): boolean {
    const runTimeOptions = this.getNode().getRunTimeEnumOptions(this)
    const word = this.getWord()
    if (runTimeOptions) return runTimeOptions.includes(word)
    return this._getCellTypeDefinition().isValid(word, this.getNode().getRootProgramNode()) && this._isValid()
  }

  getErrorIfAny(): treeNotationTypes.TreeError {
    const word = this.getWord()
    if (word !== undefined && this.isValid()) return undefined

    // todo: refactor invalidwordError. We want better error messages.
    return word === undefined || word === "" ? new MissingWordError(this) : new InvalidWordError(this)
  }
}

class GrammarIntCell extends AbstractGrammarBackedCell<number> {
  _isValid() {
    const word = this.getWord()
    const num = parseInt(word)
    if (isNaN(num)) return false
    return num.toString() === word
  }

  static defaultHighlightScope = "constant.numeric.integer"

  _synthesizeCell() {
    return TreeUtils.getRandomString(2, "123456789".split(""))
  }

  getRegexString() {
    return "\-?[0-9]+"
  }

  getParsed() {
    const word = this.getWord()
    return parseInt(word)
  }

  static parserFunctionName = "parseInt"
}

class GrammarBitCell extends AbstractGrammarBackedCell<boolean> {
  _isValid() {
    const word = this.getWord()
    return word === "0" || word === "1"
  }

  static defaultHighlightScope = "constant.numeric"

  _synthesizeCell() {
    return TreeUtils.getRandomString(1, "01".split(""))
  }

  getRegexString() {
    return "[01]"
  }

  getParsed() {
    const word = this.getWord()
    return !!parseInt(word)
  }
}

class GrammarFloatCell extends AbstractGrammarBackedCell<number> {
  _isValid() {
    const word = this.getWord()
    const num = parseFloat(word)
    return !isNaN(num) && /^-?\d*(\.\d+)?$/.test(word)
  }

  static defaultHighlightScope = "constant.numeric.float"

  _synthesizeCell() {
    return TreeUtils.getRandomString(2, "123456789".split("")) + "." + TreeUtils.getRandomString(2, "0123456789".split(""))
  }

  getRegexString() {
    return "-?\d*(\.\d+)?"
  }

  getParsed() {
    const word = this.getWord()
    return parseFloat(word)
  }

  static parserFunctionName = "parseFloat"
}

// ErrorCellType => grammar asks for a '' cell type here but the grammar does not specify a '' cell type. (todo: bring in didyoumean?)

class GrammarBoolCell extends AbstractGrammarBackedCell<boolean> {
  private _trues = new Set(["1", "true", "t", "yes"])
  private _falses = new Set(["0", "false", "f", "no"])

  _isValid() {
    const word = this.getWord()
    const str = word.toLowerCase()
    return this._trues.has(str) || this._falses.has(str)
  }

  static defaultHighlightScope = "constant.numeric"

  _synthesizeCell() {
    return TreeUtils.getRandomString(1, ["1", "true", "t", "yes", "0", "false", "f", "no"])
  }

  private _getOptions() {
    return Array.from(this._trues).concat(Array.from(this._falses))
  }

  getRegexString() {
    return "(?:" + this._getOptions().join("|") + ")"
  }

  getParsed() {
    const word = this.getWord()
    return this._trues.has(word.toLowerCase())
  }
}

class GrammarAnyCell extends AbstractGrammarBackedCell<string> {
  _isValid() {
    return true
  }

  _synthesizeCell() {
    return this._nodeTypeDefinition._getKeywordIfAny()
  }

  getRegexString() {
    return "[^ ]+"
  }

  getParsed() {
    return this.getWord()
  }
}

class GrammarKeywordCell extends GrammarAnyCell {
  static defaultHighlightScope = "keyword"

  _synthesizeCell() {
    return this._nodeTypeDefinition._getKeywordIfAny()
  }
}

class GrammarExtraWordCellTypeCell extends AbstractGrammarBackedCell<string> {
  _isValid() {
    return false
  }

  _synthesizeCell() {
    return "extraWord" // should never occur?
  }

  getParsed() {
    return this.getWord()
  }

  getErrorIfAny(): treeNotationTypes.TreeError {
    return new ExtraWordError(this)
  }
}

class GrammarUnknownCellTypeCell extends AbstractGrammarBackedCell<string> {
  _isValid() {
    return false
  }

  _synthesizeCell() {
    return "unknownCell" // should never occur?
  }

  getParsed() {
    return this.getWord()
  }

  getErrorIfAny(): treeNotationTypes.TreeError {
    return new UnknownCellTypeError(this)
  }
}

abstract class AbstractTreeError implements treeNotationTypes.TreeError {
  constructor(node: GrammarBackedNode) {
    this._node = node
  }
  private _node: GrammarBackedNode // todo: would it ever be a TreeNode?

  getLineIndex(): treeNotationTypes.positiveInt {
    return this.getLineNumber() - 1
  }

  getLineNumber(): treeNotationTypes.positiveInt {
    return this.getNode()._getLineNumber() // todo: handle sourcemaps
  }

  isCursorOnWord(lineIndex: treeNotationTypes.positiveInt, characterIndex: treeNotationTypes.positiveInt) {
    return lineIndex === this.getLineIndex() && this._doesCharacterIndexFallOnWord(characterIndex)
  }

  private _doesCharacterIndexFallOnWord(characterIndex: treeNotationTypes.positiveInt) {
    return this.getCellIndex() === this.getNode().getWordIndexAtCharacterIndex(characterIndex)
  }

  // convenience method. may be removed.
  isBlankLineError() {
    return false
  }

  // convenience method. may be removed.
  isMissingWordError() {
    return false
  }

  getIndent() {
    return this.getNode().getIndentation()
  }

  getCodeMirrorLineWidgetElement(onApplySuggestionCallBack = () => {}) {
    const suggestion = this.getSuggestionMessage()
    if (this.isMissingWordError()) return this._getCodeMirrorLineWidgetElementCellTypeHints()
    if (suggestion) return this._getCodeMirrorLineWidgetElementWithSuggestion(onApplySuggestionCallBack, suggestion)
    return this._getCodeMirrorLineWidgetElementWithoutSuggestion()
  }

  getNodeTypeId(): string {
    return (<GrammarBackedNonRootNode>this.getNode()).getDefinition().getNodeTypeIdFromDefinition()
  }

  private _getCodeMirrorLineWidgetElementCellTypeHints() {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + (<GrammarBackedNonRootNode>this.getNode()).getDefinition().getLineHints()))
    el.className = "LintCellTypeHints"
    return el
  }

  private _getCodeMirrorLineWidgetElementWithoutSuggestion() {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + this.getMessage()))
    el.className = "LintError"
    return el
  }

  private _getCodeMirrorLineWidgetElementWithSuggestion(onApplySuggestionCallBack: Function, suggestion: string) {
    const el = document.createElement("div")
    el.appendChild(document.createTextNode(this.getIndent() + `${this.getErrorTypeName()}. Suggestion: ${suggestion}`))
    el.className = "LintErrorWithSuggestion"
    el.onclick = () => {
      this.applySuggestion()
      onApplySuggestionCallBack()
    }
    return el
  }

  getLine() {
    return this.getNode().getLine()
  }

  getExtension() {
    return this.getNode()
      .getGrammarProgramRoot()
      .getExtensionName()
  }

  getNode() {
    return this._node
  }

  getErrorTypeName() {
    return this.constructor.name.replace("Error", "")
  }

  getCellIndex() {
    return 0
  }

  toObject() {
    return {
      type: this.getErrorTypeName(),
      line: this.getLineNumber(),
      cell: this.getCellIndex(),
      suggestion: this.getSuggestionMessage(),
      path: this.getNode().getFirstWordPath(),
      message: this.getMessage()
    }
  }

  hasSuggestion() {
    return this.getSuggestionMessage() !== ""
  }

  getSuggestionMessage() {
    return ""
  }

  toString() {
    return this.getMessage()
  }

  applySuggestion() {}

  getMessage(): string {
    return `${this.getErrorTypeName()} at line ${this.getLineNumber()} cell ${this.getCellIndex()}.`
  }
}

abstract class AbstractCellError extends AbstractTreeError {
  constructor(cell: AbstractGrammarBackedCell<any>) {
    super(cell.getNode())
    this._cell = cell
  }

  getCell() {
    return this._cell
  }

  getCellIndex() {
    return this._cell.getCellIndex()
  }

  protected _getWordSuggestion() {
    return TreeUtils.didYouMean(
      this.getCell().getWord(),
      this.getCell()
        .getAutoCompleteWords()
        .map(option => option.text)
    )
  }

  private _cell: AbstractGrammarBackedCell<any>
}

class UnknownNodeTypeError extends AbstractTreeError {
  getMessage(): string {
    const node = this.getNode()
    const parentNode = node.getParent()
    const options = parentNode._getParser().getFirstWordOptions()
    return super.getMessage() + ` Invalid nodeType "${node.getFirstWord()}". Valid nodeTypes are: ${TreeUtils._listToEnglishText(options, 7)}.`
  }

  protected _getWordSuggestion() {
    const node = this.getNode()
    const parentNode = node.getParent()
    return TreeUtils.didYouMean(node.getFirstWord(), (<GrammarBackedNode>parentNode).getAutocompleteResults("", 0).map(option => option.text))
  }

  getSuggestionMessage() {
    const suggestion = this._getWordSuggestion()
    const node = this.getNode()

    if (suggestion) return `Change "${node.getFirstWord()}" to "${suggestion}"`

    return ""
  }

  applySuggestion() {
    const suggestion = this._getWordSuggestion()
    if (suggestion) this.getNode().setWord(this.getCellIndex(), suggestion)
    return this
  }
}

class BlankLineError extends UnknownNodeTypeError {
  getMessage(): string {
    return super.getMessage() + ` Line: "${this.getNode().getLine()}". Blank lines are errors.`
  }

  // convenience method
  isBlankLineError() {
    return true
  }

  getSuggestionMessage() {
    return `Delete line ${this.getLineNumber()}`
  }

  applySuggestion() {
    this.getNode().destroy()
    return this
  }
}

class MissingRequiredNodeTypeError extends AbstractTreeError {
  constructor(node: GrammarBackedNode, missingNodeTypeId: treeNotationTypes.firstWord) {
    super(node)
    this._missingNodeTypeId = missingNodeTypeId
  }

  private _missingNodeTypeId: treeNotationTypes.nodeTypeId

  getMessage(): string {
    return super.getMessage() + ` A "${this._missingNodeTypeId}" is required.`
  }
}

class NodeTypeUsedMultipleTimesError extends AbstractTreeError {
  getMessage(): string {
    return super.getMessage() + ` Multiple "${this.getNode().getFirstWord()}" found.`
  }

  getSuggestionMessage() {
    return `Delete line ${this.getLineNumber()}`
  }

  applySuggestion() {
    return this.getNode().destroy()
  }
}

class UnknownCellTypeError extends AbstractCellError {
  getMessage(): string {
    return super.getMessage() + ` No cellType "${this.getCell().getCellTypeId()}" found. Language grammar for "${this.getExtension()}" may need to be fixed.`
  }
}

class InvalidWordError extends AbstractCellError {
  getMessage(): string {
    return super.getMessage() + ` "${this.getCell().getWord()}" does not fit in cellType "${this.getCell().getCellTypeId()}".`
  }

  getSuggestionMessage() {
    const suggestion = this._getWordSuggestion()

    if (suggestion) return `Change "${this.getCell().getWord()}" to "${suggestion}"`

    return ""
  }

  applySuggestion() {
    const suggestion = this._getWordSuggestion()
    if (suggestion) this.getNode().setWord(this.getCellIndex(), suggestion)
    return this
  }
}

class ExtraWordError extends AbstractCellError {
  getMessage(): string {
    return super.getMessage() + ` Extra word "${this.getCell().getWord()}" in ${this.getNodeTypeId()}.`
  }

  getSuggestionMessage() {
    return `Delete word "${this.getCell().getWord()}" at cell ${this.getCellIndex()}`
  }

  applySuggestion() {
    return this.getNode().deleteWordAt(this.getCellIndex())
  }
}

class MissingWordError extends AbstractCellError {
  // todo: autocomplete suggestion

  getMessage(): string {
    return super.getMessage() + ` Missing word for cell "${this.getCell().getCellTypeId()}".`
  }

  isMissingWordError() {
    return true
  }
}

// todo: add standard types, enum types, from disk types

abstract class AbstractGrammarWordTestNode extends TreeNode {
  abstract isValid(str: string, programRootNode?: GrammarBackedRootNode): boolean
}

class GrammarRegexTestNode extends AbstractGrammarWordTestNode {
  private _regex: RegExp

  isValid(str: string) {
    if (!this._regex) this._regex = new RegExp("^" + this.getContent() + "$")
    return !!str.match(this._regex)
  }
}

class GrammarReservedWordsTestNode extends AbstractGrammarWordTestNode {
  private _set: Set<string>

  isValid(str: string) {
    if (!this._set) this._set = new Set(this.getContent().split(" "))
    return !this._set.has(str)
  }
}

// todo: remove in favor of custom word type constructors
class EnumFromCellTypesTestNode extends AbstractGrammarWordTestNode {
  _getEnumFromCellTypes(programRootNode: GrammarBackedRootNode): treeNotationTypes.stringMap {
    const cellTypeIds = this.getWordsFrom(1)
    const enumGroup = cellTypeIds.join(" ")
    // note: hack where we store it on the program. otherwise has global effects.
    if (!(<any>programRootNode)._enumMaps) (<any>programRootNode)._enumMaps = {}
    if ((<any>programRootNode)._enumMaps[enumGroup]) return (<any>programRootNode)._enumMaps[enumGroup]

    const wordIndex = 1
    const map: treeNotationTypes.stringMap = {}
    const cellTypeMap: treeNotationTypes.stringMap = {}
    cellTypeIds.forEach(typeId => (cellTypeMap[typeId] = true))
    programRootNode
      .getAllTypedWords()
      .filter((typedWord: TypedWord) => cellTypeMap[typedWord.type])
      .forEach(typedWord => {
        map[typedWord.word] = true
      })
    ;(<any>programRootNode)._enumMaps[enumGroup] = map
    return map
  }

  // todo: remove
  isValid(str: string, programRootNode: GrammarBackedRootNode) {
    return this._getEnumFromCellTypes(programRootNode)[str] === true
  }
}

class GrammarEnumTestNode extends AbstractGrammarWordTestNode {
  private _map: treeNotationTypes.stringMap

  isValid(str: string) {
    // enum c c++ java
    return !!this.getOptions()[str]
  }

  getOptions() {
    if (!this._map) this._map = TreeUtils.arrayToMap(this.getWordsFrom(1))
    return this._map
  }
}

class cellTypeDefinitionNode extends AbstractExtendibleTreeNode {
  createParser() {
    const types: treeNotationTypes.stringMap = {}
    types[GrammarConstants.regex] = GrammarRegexTestNode
    types[GrammarConstants.reservedWords] = GrammarReservedWordsTestNode
    types[GrammarConstants.enumFromCellTypes] = EnumFromCellTypesTestNode
    types[GrammarConstants.enum] = GrammarEnumTestNode
    types[GrammarConstants.highlightScope] = TreeNode
    types[GrammarConstants.todoComment] = TreeNode
    types[GrammarConstants.description] = TreeNode
    types[GrammarConstants.extends] = TreeNode
    return new TreeNode.Parser(undefined, types)
  }

  _getId() {
    return this.getWord(0)
  }

  _getIdToNodeMap() {
    return this._getRootProgramNode().getCellTypeDefinitions()
  }

  getGetter(wordIndex: number) {
    const wordToNativeJavascriptTypeParser = this.getCellConstructor().parserFunctionName
    return `get ${this.getCellTypeId()}() {
      return ${wordToNativeJavascriptTypeParser ? wordToNativeJavascriptTypeParser + `(this.getWord(${wordIndex}))` : `this.getWord(${wordIndex})`}
    }`
  }

  getCatchAllGetter(wordIndex: number) {
    const wordToNativeJavascriptTypeParser = this.getCellConstructor().parserFunctionName
    return `get ${this.getCellTypeId()}() {
      return ${wordToNativeJavascriptTypeParser ? `this.getWordsFrom(${wordIndex}).map(val => ${wordToNativeJavascriptTypeParser}(val))` : `this.getWordsFrom(${wordIndex})`}
    }`
  }

  // `this.getWordsFrom(${requireds.length + 1})`

  // todo: cleanup typings. todo: remove this hidden logic. have a "baseType" property?
  getCellConstructor(): typeof AbstractGrammarBackedCell {
    return this._getPreludeKind() || GrammarAnyCell
  }

  _getPreludeKind() {
    return PreludeKinds[this.getWord(0)] || PreludeKinds[this._getExtendedCellTypeId()]
  }

  _getPreludeKindId() {
    if (PreludeKinds[this.getWord(0)]) return this.getWord(0)
    else if (PreludeKinds[this._getExtendedCellTypeId()]) return this._getExtendedCellTypeId()
    return PreludeCellTypeIds.anyCell
  }

  private _getExtendedCellTypeId() {
    const arr = this._getAncestorsArray()
    return arr[arr.length - 1]._getId()
  }

  getHighlightScope(): string | undefined {
    const hs = this._getFromExtended(GrammarConstants.highlightScope)
    if (hs) return hs
    const preludeKind = this._getPreludeKind()
    if (preludeKind) return preludeKind.defaultHighlightScope
  }

  private _getEnumOptions() {
    const enumNode = this._getNodeFromExtended(GrammarConstants.enum)
    if (!enumNode) return undefined

    // we sort by longest first to capture longest match first. todo: add test
    const options = Object.keys((<GrammarEnumTestNode>enumNode.getNode(GrammarConstants.enum)).getOptions())
    options.sort((a, b) => b.length - a.length)

    return options
  }

  private _getEnumFromCellTypeOptions(program: GrammarBackedRootNode) {
    const node = this._getNodeFromExtended(GrammarConstants.enumFromCellTypes)
    return node ? Object.keys((<EnumFromCellTypesTestNode>node.getNode(GrammarConstants.enumFromCellTypes))._getEnumFromCellTypes(program)) : undefined
  }

  _getRootProgramNode(): GrammarProgram {
    return <GrammarProgram>this.getParent()
  }

  _getAutocompleteWordOptions(program: GrammarBackedRootNode): string[] {
    return this._getEnumOptions() || this._getEnumFromCellTypeOptions(program) || []
  }

  getRegexString() {
    // todo: enum
    const enumOptions = this._getEnumOptions()
    return this._getFromExtended(GrammarConstants.regex) || (enumOptions ? "(?:" + enumOptions.join("|") + ")" : "[^ ]*")
  }

  isValid(str: string, programRootNode: GrammarBackedRootNode) {
    return this._getChildrenByNodeConstructorInExtended(AbstractGrammarWordTestNode).every(node => (<AbstractGrammarWordTestNode>node).isValid(str, programRootNode))
  }

  getCellTypeId(): treeNotationTypes.cellTypeId {
    return this.getWord(0)
  }

  public static types: any
}

abstract class AbstractCellParser {
  constructor(definition: AbstractGrammarDefinitionNode) {
    this._definition = definition
  }

  getCatchAllCellTypeId(): treeNotationTypes.cellTypeId | undefined {
    return this._definition._getFromExtended(GrammarConstants.catchAllCellType)
  }

  // todo: improve layout (use bold?)
  getLineHints(): string {
    const catchAllCellTypeId = this.getCatchAllCellTypeId()
    const nodeTypeId = this._definition._getId() // todo: cleanup
    return `${nodeTypeId}: ${this.getRequiredCellTypeIds().join(" ")}${catchAllCellTypeId ? ` ${catchAllCellTypeId}...` : ""}`
  }

  protected _definition: AbstractGrammarDefinitionNode

  getRequiredCellTypeIds(): treeNotationTypes.cellTypeId[] {
    const parameters = this._definition._getFromExtended(GrammarConstants.cells)
    return parameters ? parameters.split(" ") : []
  }

  protected _getCellTypeId(cellIndex: treeNotationTypes.int, requiredCellTypeIds: string[], totalWordCount: treeNotationTypes.int) {
    return requiredCellTypeIds[cellIndex]
  }

  protected _isCatchAllCell(cellIndex: treeNotationTypes.int, numberOfRequiredCells: treeNotationTypes.int, totalWordCount: treeNotationTypes.int) {
    return cellIndex >= numberOfRequiredCells
  }

  getCellArray(node: GrammarBackedNonRootNode = undefined): AbstractGrammarBackedCell<any>[] {
    const wordCount = node ? node.getWords().length : 0
    const def = this._definition
    const grammarProgram = def.getLanguageDefinitionProgram()
    const requiredCellTypeIds = this.getRequiredCellTypeIds()
    const numberOfRequiredCells = requiredCellTypeIds.length

    const actualWordCountOrRequiredCellCount = Math.max(wordCount, numberOfRequiredCells)
    const cells: AbstractGrammarBackedCell<any>[] = []

    // A for loop instead of map because "numberOfCellsToFill" can be longer than words.length
    for (let cellIndex = 0; cellIndex < actualWordCountOrRequiredCellCount; cellIndex++) {
      const isCatchAll = this._isCatchAllCell(cellIndex, numberOfRequiredCells, wordCount)

      let cellTypeId = isCatchAll ? this.getCatchAllCellTypeId() : this._getCellTypeId(cellIndex, requiredCellTypeIds, wordCount)

      let cellTypeDefinition = grammarProgram.getCellTypeDefinitionById(cellTypeId)

      let cellConstructor
      if (cellTypeDefinition) cellConstructor = cellTypeDefinition.getCellConstructor()
      else if (cellTypeId) cellConstructor = GrammarUnknownCellTypeCell
      else {
        cellConstructor = GrammarExtraWordCellTypeCell
        cellTypeId = PreludeCellTypeIds.extraWordCell
        cellTypeDefinition = grammarProgram.getCellTypeDefinitionById(cellTypeId)
      }

      cells[cellIndex] = new cellConstructor(node, cellIndex, cellTypeDefinition, cellTypeId, isCatchAll, def)
    }
    return cells
  }
}

class PrefixCellParser extends AbstractCellParser {}

class PostfixCellParser extends AbstractCellParser {
  protected _isCatchAllCell(cellIndex: treeNotationTypes.int, numberOfRequiredCells: treeNotationTypes.int, totalWordCount: treeNotationTypes.int) {
    return cellIndex < totalWordCount - numberOfRequiredCells
  }

  protected _getCellTypeId(cellIndex: treeNotationTypes.int, requiredCellTypeIds: string[], totalWordCount: treeNotationTypes.int) {
    const catchAllWordCount = totalWordCount - requiredCellTypeIds.length
    return requiredCellTypeIds[cellIndex - catchAllWordCount]
  }
}

class OmnifixCellParser extends AbstractCellParser {
  getCellArray(node: GrammarBackedNonRootNode = undefined): AbstractGrammarBackedCell<any>[] {
    const cells: AbstractGrammarBackedCell<any>[] = []
    const def = this._definition
    const program = <GrammarBackedRootNode>(node ? node.getRootNode() : undefined)
    const grammarProgram = def.getLanguageDefinitionProgram()
    const words = node ? node.getWords() : []
    const requiredCellTypeDefs = this.getRequiredCellTypeIds().map(cellTypeId => grammarProgram.getCellTypeDefinitionById(cellTypeId))
    const catchAllCellTypeId = this.getCatchAllCellTypeId()
    const catchAllCellTypeDef = catchAllCellTypeId && grammarProgram.getCellTypeDefinitionById(catchAllCellTypeId)

    words.forEach((word, wordIndex) => {
      let cellConstructor: any
      for (let index = 0; index < requiredCellTypeDefs.length; index++) {
        const cellTypeDefinition = requiredCellTypeDefs[index]
        if (cellTypeDefinition.isValid(word, program)) {
          // todo: cleanup cellIndex/wordIndex stuff
          cellConstructor = cellTypeDefinition.getCellConstructor()
          cells.push(new cellConstructor(node, wordIndex, cellTypeDefinition, cellTypeDefinition._getId(), false, def))
          requiredCellTypeDefs.splice(index, 1)
          return true
        }
      }
      if (catchAllCellTypeDef && catchAllCellTypeDef.isValid(word, program)) {
        cellConstructor = catchAllCellTypeDef.getCellConstructor()
        cells.push(new cellConstructor(node, wordIndex, catchAllCellTypeDef, catchAllCellTypeId, true, def))
        return true
      }
      cells.push(new GrammarUnknownCellTypeCell(node, wordIndex, undefined, undefined, false, def))
    })
    const wordCount = words.length
    requiredCellTypeDefs.forEach((cellTypeDef, index) => {
      let cellConstructor: any = cellTypeDef.getCellConstructor()
      cells.push(new cellConstructor(node, wordCount + index, cellTypeDef, cellTypeDef._getId(), false, def))
    })

    return cells
  }
}

class GrammarExampleNode extends TreeNode {}

class GrammarCompilerNode extends TreeNode {
  createParser() {
    const types = [
      GrammarConstantsCompiler.stringTemplate,
      GrammarConstantsCompiler.indentCharacter,
      GrammarConstantsCompiler.catchAllCellDelimiter,
      GrammarConstantsCompiler.joinChildrenWith,
      GrammarConstantsCompiler.openChildren,
      GrammarConstantsCompiler.closeChildren
    ]
    const map: treeNotationTypes.firstWordToNodeConstructorMap = {}
    types.forEach(type => {
      map[type] = TreeNode
    })
    return new TreeNode.Parser(undefined, map)
  }
}

abstract class GrammarNodeTypeConstant extends TreeNode {
  getGetter() {
    return `get ${this.getIdentifier()}() { return ${this.getConstantValueAsJsText()} }`
  }

  getIdentifier() {
    return this.getWord(1)
  }

  getConstantValueAsJsText() {
    const words = this.getWordsFrom(2)
    return words.length > 1 ? `[${words.join(",")}]` : words[0]
  }

  getConstantValue() {
    return JSON.parse(this.getConstantValueAsJsText())
  }
}

class GrammarNodeTypeConstantInt extends GrammarNodeTypeConstant {}
class GrammarNodeTypeConstantString extends GrammarNodeTypeConstant {
  getConstantValueAsJsText() {
    return "`" + TreeUtils.escapeBackTicks(this.getConstantValue()) + "`"
  }

  getConstantValue() {
    return this.length ? this.childrenToString() : this.getWordsFrom(2).join(" ")
  }
}
class GrammarNodeTypeConstantFloat extends GrammarNodeTypeConstant {}
class GrammarNodeTypeConstantBoolean extends GrammarNodeTypeConstant {}

abstract class AbstractGrammarDefinitionNode extends AbstractExtendibleTreeNode {
  createParser() {
    // todo: some of these should just be on nonRootNodes
    const types = [
      GrammarConstants.frequency,
      GrammarConstants.inScope,
      GrammarConstants.cells,
      GrammarConstants.extends,
      GrammarConstants.description,
      GrammarConstants.catchAllNodeType,
      GrammarConstants.catchAllCellType,
      GrammarConstants.cellParser,
      GrammarConstants.extensions,
      GrammarConstants.version,
      GrammarConstants.tags,
      GrammarConstants.match,
      GrammarConstants.pattern,
      GrammarConstants.baseNodeType,
      GrammarConstants.required,
      GrammarConstants.root,
      GrammarConstants.compilesTo,
      GrammarConstants.abstract,
      GrammarConstants.javascript,
      GrammarConstants.single,
      GrammarConstants.todoComment
    ]

    const map: treeNotationTypes.firstWordToNodeConstructorMap = {}
    types.forEach(type => {
      map[type] = TreeNode
    })
    map[GrammarConstantsConstantTypes.boolean] = GrammarNodeTypeConstantBoolean
    map[GrammarConstantsConstantTypes.int] = GrammarNodeTypeConstantInt
    map[GrammarConstantsConstantTypes.string] = GrammarNodeTypeConstantString
    map[GrammarConstantsConstantTypes.float] = GrammarNodeTypeConstantFloat
    map[GrammarConstants.compilerNodeType] = GrammarCompilerNode
    map[GrammarConstants.example] = GrammarExampleNode
    return new TreeNode.Parser(undefined, map)
  }

  _getId() {
    return this.getWord(0)
  }

  getConstantsObject() {
    const obj = this._getUniqueConstantNodes()
    Object.keys(obj).forEach(key => {
      obj[key] = obj[key].getConstantValue()
    })
    return obj
  }

  _getKeywordIfAny(): string {
    const matchKeyword = this.get(GrammarConstants.match)
    return matchKeyword || this._getId().replace(GrammarProgram.nodeTypeSuffixRegex, "")
  }

  _getUniqueConstantNodes(extended = true) {
    const obj: { [key: string]: GrammarNodeTypeConstant } = {}
    const items = extended ? this._getChildrenByNodeConstructorInExtended(GrammarNodeTypeConstant) : this.getChildrenByNodeConstructor(GrammarNodeTypeConstant)
    items.reverse() // Last definition wins.
    items.forEach((node: GrammarNodeTypeConstant) => {
      obj[node.getIdentifier()] = node
    })
    return obj
  }

  getExamples(): GrammarExampleNode[] {
    return this._getChildrenByNodeConstructorInExtended(GrammarExampleNode)
  }

  getNodeTypeIdFromDefinition(): treeNotationTypes.nodeTypeId {
    return this.getWord(0)
  }

  // todo: remove? just reused nodeTypeId
  _getGeneratedClassName() {
    return this.getNodeTypeIdFromDefinition()
  }

  _hasValidNodeTypeId() {
    return !!this._getGeneratedClassName()
  }

  _isAbstract() {
    return this.has(GrammarConstants.abstract)
  }

  _getConcreteDescendantDefinitions() {
    const defs = this._getProgramNodeTypeDefinitionCache()
    const id = this._getId()
    return Object.values(defs).filter(def => {
      return def._doesExtend(id) && !def._isAbstract()
    })
  }

  private _cache_definedNodeConstructor: treeNotationTypes.RunTimeNodeConstructor

  _getConstructorDefinedInGrammar() {
    if (!this._cache_definedNodeConstructor) this._cache_definedNodeConstructor = this.getLanguageDefinitionProgram()._getCompiledLoadedNodeTypes()[this.getNodeTypeIdFromDefinition()]
    return this._cache_definedNodeConstructor
  }

  _getFirstWordMatch() {
    if (this._getRegexMatch())
      // todo: enforce firstWordMatch and regexMatch as being XOR
      return undefined
    return this.get(GrammarConstants.match) || this._getNodeTypeIdWithoutNodeTypeSuffix()
  }

  private _getNodeTypeIdWithoutNodeTypeSuffix() {
    return this.getNodeTypeIdFromDefinition().replace(GrammarProgram.nodeTypeSuffixRegex, "")
  }

  _getRegexMatch() {
    return this.get(GrammarConstants.pattern)
  }

  getLanguageDefinitionProgram(): GrammarProgram {
    return <GrammarProgram>this.getParent()
  }

  protected _getCustomJavascriptMethods(): treeNotationTypes.javascriptCode {
    const hasJsCode = this.has(GrammarConstants.javascript)
    return hasJsCode ? this.getNode(GrammarConstants.javascript).childrenToString() : ""
  }

  private _cache_firstWordToNodeDefMap: { [firstWord: string]: nodeTypeDefinitionNode }

  getFirstWordMapWithDefinitions() {
    if (!this._cache_firstWordToNodeDefMap) this._cache_firstWordToNodeDefMap = this._createParserInfo(this._getInScopeNodeTypeIds()).firstWordMap
    return this._cache_firstWordToNodeDefMap
  }

  // todo: remove
  getRunTimeFirstWordsInScope(): treeNotationTypes.nodeTypeId[] {
    return this._getParser().getFirstWordOptions()
  }

  // todo: what happens when you have a cell getter and constant with same name?
  _getCellGettersAndNodeTypeConstants() {
    // todo: add cellType parsings
    const grammarProgram = this.getLanguageDefinitionProgram()
    const requiredCells = this.get(GrammarConstants.cells)
    const getters = (requiredCells ? requiredCells.split(" ") : []).map((cellTypeId, index) => {
      const cellTypeDef = grammarProgram.getCellTypeDefinitionById(cellTypeId)
      if (!cellTypeDef) throw new Error(`No cellType "${cellTypeId}" found`)
      return cellTypeDef.getGetter(index)
    })

    const catchAllCellTypeId = this.get(GrammarConstants.catchAllCellType)
    if (catchAllCellTypeId) getters.push(grammarProgram.getCellTypeDefinitionById(catchAllCellTypeId).getCatchAllGetter(getters.length))

    // Constants
    Object.values(this._getUniqueConstantNodes(false)).forEach(node => {
      getters.push(node.getGetter())
    })

    return getters.join("\n")
  }

  protected _createParserInfo(nodeTypeIdsInScope: treeNotationTypes.nodeTypeId[]): parserInfo {
    const result: parserInfo = {
      firstWordMap: {},
      regexTests: []
    }

    if (!nodeTypeIdsInScope.length) return result

    const allProgramNodeTypeDefinitionsMap = this._getProgramNodeTypeDefinitionCache()
    Object.keys(allProgramNodeTypeDefinitionsMap)
      .filter(nodeTypeId => allProgramNodeTypeDefinitionsMap[nodeTypeId].isOrExtendsANodeTypeInScope(nodeTypeIdsInScope))
      .filter(nodeTypeId => !allProgramNodeTypeDefinitionsMap[nodeTypeId]._isAbstract())
      .forEach(nodeTypeId => {
        const def = allProgramNodeTypeDefinitionsMap[nodeTypeId]
        const regex = def._getRegexMatch()
        const firstWord = def._getFirstWordMatch()
        if (regex) result.regexTests.push({ regex: regex, nodeConstructor: def.getNodeTypeIdFromDefinition() })
        else result.firstWordMap[firstWord] = def
      })
    return result
  }

  getTopNodeTypeIds(): treeNotationTypes.nodeTypeId[] {
    const arr = Object.values(this.getFirstWordMapWithDefinitions())
    arr.sort(TreeUtils.makeSortByFn((definition: nodeTypeDefinitionNode) => definition.getFrequency()))
    arr.reverse()
    return arr.map(definition => definition.getNodeTypeIdFromDefinition())
  }

  _getMyInScopeNodeTypeIds(): treeNotationTypes.nodeTypeId[] {
    const nodeTypesNode = this.getNode(GrammarConstants.inScope)
    return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : []
  }

  protected _getInScopeNodeTypeIds(): treeNotationTypes.nodeTypeId[] {
    // todo: allow multiple of these if we allow mixins?
    const ids = this._getMyInScopeNodeTypeIds()
    const parentDef = this._getExtendedParent()
    return parentDef ? ids.concat((<AbstractGrammarDefinitionNode>parentDef)._getInScopeNodeTypeIds()) : ids
  }

  isRequired(): boolean {
    return this._hasFromExtended(GrammarConstants.required)
  }

  getNodeTypeDefinitionByNodeTypeId(nodeTypeId: treeNotationTypes.nodeTypeId): AbstractGrammarDefinitionNode {
    // todo: return catch all?
    const def = this._getProgramNodeTypeDefinitionCache()[nodeTypeId]
    if (def) return def
    // todo: cleanup
    this.getLanguageDefinitionProgram()._addDefaultCatchAllBlobNode()
    return this._getProgramNodeTypeDefinitionCache()[nodeTypeId]
  }

  isDefined(nodeTypeId: string) {
    return !!this._getProgramNodeTypeDefinitionCache()[nodeTypeId]
  }

  _getIdToNodeMap() {
    return this._getProgramNodeTypeDefinitionCache()
  }

  private _cache_isRoot: boolean

  private _amIRoot(): boolean {
    if (this._cache_isRoot === undefined) this._cache_isRoot = this._getLanguageRootNode() === this
    return this._cache_isRoot
  }

  private _getLanguageRootNode() {
    return (<GrammarProgram>this.getParent())._getRootNodeTypeDefinitionNode()
  }

  private _isErrorNodeType() {
    return this.get(GrammarConstants.baseNodeType) === GrammarConstants.errorNode
  }

  private _isBlobNodeType() {
    // Do not check extended classes. Only do once.
    return this.get(GrammarConstants.baseNodeType) === GrammarConstants.blobNode
  }

  private _getErrorMethodToJavascript(): treeNotationTypes.javascriptCode {
    if (this._isBlobNodeType()) return "getErrors() { return [] }" // Skips parsing child nodes for perf gains.
    if (this._isErrorNodeType()) return "getErrors() { return this._getErrorNodeErrors() }"
    return ""
  }

  private _getParserToJavascript(): treeNotationTypes.javascriptCode {
    if (this._isBlobNodeType())
      // todo: do we need this?
      return "createParser() { return new jtree.TreeNode.Parser(this._getBlobNodeCatchAllNodeType())}"
    const parserInfo = this._createParserInfo(this._getMyInScopeNodeTypeIds())
    const myFirstWordMap = parserInfo.firstWordMap
    const regexRules = parserInfo.regexTests

    // todo: use constants in first word maps?
    // todo: cache the super extending?
    const firstWords = Object.keys(myFirstWordMap)
    const hasFirstWords = firstWords.length
    const catchAllConstructor = this._getCatchAllNodeConstructorToJavascript()
    if (!hasFirstWords && !catchAllConstructor && !regexRules.length) return ""

    const firstWordsStr = hasFirstWords
      ? `Object.assign(Object.assign({}, super.createParser()._getFirstWordMap()), {` + firstWords.map(firstWord => `"${firstWord}" : ${myFirstWordMap[firstWord].getNodeTypeIdFromDefinition()}`).join(",\n") + "})"
      : "undefined"

    const regexStr = regexRules.length
      ? `[${regexRules
          .map(rule => {
            return `{regex: /${rule.regex}/, nodeConstructor: ${rule.nodeConstructor}}`
          })
          .join(",")}]`
      : "undefined"

    const catchAllStr = catchAllConstructor ? catchAllConstructor : this._amIRoot() ? `this._getBlobNodeCatchAllNodeType()` : "undefined"

    return `createParser() {
  return new jtree.TreeNode.Parser(${catchAllStr}, ${firstWordsStr}, ${regexStr})
  }`
  }

  private _getCatchAllNodeConstructorToJavascript(): treeNotationTypes.javascriptCode {
    if (this._isBlobNodeType()) return "this._getBlobNodeCatchAllNodeType()"
    const nodeTypeId = this.get(GrammarConstants.catchAllNodeType)
    if (!nodeTypeId) return ""
    const nodeDef = this.getNodeTypeDefinitionByNodeTypeId(nodeTypeId)
    if (!nodeDef) throw new Error(`No definition found for nodeType id "${nodeTypeId}"`)
    return nodeDef._getGeneratedClassName()
  }

  _nodeDefToJavascriptClass(): treeNotationTypes.javascriptCode {
    const components = [this._getParserToJavascript(), this._getErrorMethodToJavascript(), this._getCellGettersAndNodeTypeConstants(), this._getCustomJavascriptMethods()].filter(code => code)

    const extendedDef = <AbstractGrammarDefinitionNode>this._getExtendedParent()
    const rootNode = this._getLanguageRootNode()
    const amIRoot = this._amIRoot()
    // todo: cleanup? If we have 2 roots, and the latter extends the first, the first should extent GBRootNode. Otherwise, the first should not extend RBRootNode.
    const doesRootExtendMe = this.has(GrammarConstants.root) && rootNode._getAncestorSet().has(this._getGeneratedClassName())
    const extendsClassName = extendedDef ? extendedDef._getGeneratedClassName() : amIRoot || doesRootExtendMe ? "jtree.GrammarBackedRootNode" : "jtree.GrammarBackedNonRootNode"

    if (amIRoot) {
      components.push(`getGrammarProgramRoot() {
        if (!this._cachedGrammarProgramRoot)
          this._cachedGrammarProgramRoot = new jtree.GrammarProgram(\`${TreeUtils.escapeBackTicks(
            this.getParent()
              .toString()
              .replace(/\\/g, "\\\\")
          )}\`)
        return this._cachedGrammarProgramRoot
      }`)

      const nodeTypeMap = this.getLanguageDefinitionProgram()
        .getValidConcreteAndAbstractNodeTypeDefinitions()
        .map(def => {
          const id = def.getNodeTypeIdFromDefinition()
          return `"${id}": ${id}`
        })
        .join(",\n")

      components.push(`static getNodeTypeMap() { return {${nodeTypeMap} }}`)
    }

    return `class ${this._getGeneratedClassName()} extends ${extendsClassName} {
      ${components.join("\n")}
    }`
  }

  _getCompilerObject(): treeNotationTypes.stringMap {
    let obj: { [key: string]: string } = {}
    const items = this._getChildrenByNodeConstructorInExtended(GrammarCompilerNode)
    items.reverse() // Last definition wins.
    items.forEach((node: GrammarCompilerNode) => {
      obj = Object.assign(obj, node.toObject()) // todo: what about multiline strings?
    })
    return obj
  }

  // todo: improve layout (use bold?)
  getLineHints(): string {
    return this.getCellParser().getLineHints()
  }

  isOrExtendsANodeTypeInScope(firstWordsInScope: string[]): boolean {
    const chain = this._getNodeTypeInheritanceSet()
    return firstWordsInScope.some(firstWord => chain.has(firstWord))
  }

  isTerminalNodeType() {
    return !this._getFromExtended(GrammarConstants.inScope) && !this._getFromExtended(GrammarConstants.catchAllNodeType)
  }

  // todo: refactor. move some parts to cellParser?
  getMatchBlock() {
    const defaultHighlightScope = "source"
    const program = this.getLanguageDefinitionProgram()
    const regexMatch = this._getRegexMatch()
    const firstWordMatch = this._getFirstWordMatch()
    const match = regexMatch ? `'${regexMatch}'` : `'^ *${TreeUtils.escapeRegExp(firstWordMatch)}(?: |$)'`
    const cellParser = this.getCellParser()
    const requiredCellTypeIds = cellParser.getRequiredCellTypeIds()
    const catchAllCellTypeId = cellParser.getCatchAllCellTypeId()
    const firstCellTypeDef = program.getCellTypeDefinitionById(requiredCellTypeIds[0])
    const firstWordHighlightScope = (firstCellTypeDef ? firstCellTypeDef.getHighlightScope() : defaultHighlightScope) + "." + this.getNodeTypeIdFromDefinition()
    const topHalf = ` '${this.getNodeTypeIdFromDefinition()}':
  - match: ${match}
    scope: ${firstWordHighlightScope}`
    if (catchAllCellTypeId) requiredCellTypeIds.push(catchAllCellTypeId)
    if (!requiredCellTypeIds.length) return topHalf
    const captures = requiredCellTypeIds
      .map((cellTypeId, index) => {
        const cellTypeDefinition = program.getCellTypeDefinitionById(cellTypeId) // todo: cleanup
        if (!cellTypeDefinition) throw new Error(`No ${GrammarConstants.cellType} ${cellTypeId} found`) // todo: standardize error/capture error at grammar time
        return `        ${index + 1}: ${(cellTypeDefinition.getHighlightScope() || defaultHighlightScope) + "." + cellTypeDefinition.getCellTypeId()}`
      })
      .join("\n")

    const cellTypesToRegex = (cellTypeIds: string[]) => cellTypeIds.map((cellTypeId: string) => `({{${cellTypeId}}})?`).join(" ?")

    return `${topHalf}
    push:
     - match: ${cellTypesToRegex(requiredCellTypeIds)}
       captures:
${captures}
     - match: $
       pop: true`
  }

  private _cache_nodeTypeInheritanceSet: Set<treeNotationTypes.nodeTypeId>
  private _cache_ancestorNodeTypeIdsArray: treeNotationTypes.nodeTypeId[]

  _getNodeTypeInheritanceSet() {
    if (!this._cache_nodeTypeInheritanceSet) this._cache_nodeTypeInheritanceSet = new Set(this.getAncestorNodeTypeIdsArray())
    return this._cache_nodeTypeInheritanceSet
  }

  getAncestorNodeTypeIdsArray(): treeNotationTypes.nodeTypeId[] {
    if (!this._cache_ancestorNodeTypeIdsArray) {
      this._cache_ancestorNodeTypeIdsArray = this._getAncestorsArray().map(def => (<AbstractGrammarDefinitionNode>def).getNodeTypeIdFromDefinition())
      this._cache_ancestorNodeTypeIdsArray.reverse()
    }
    return this._cache_ancestorNodeTypeIdsArray
  }

  protected _getProgramNodeTypeDefinitionCache(): { [nodeTypeId: string]: nodeTypeDefinitionNode } {
    return this.getLanguageDefinitionProgram()._getProgramNodeTypeDefinitionCache()
  }

  getDescription(): string {
    return this._getFromExtended(GrammarConstants.description) || ""
  }

  getFrequency() {
    const val = this._getFromExtended(GrammarConstants.frequency)
    return val ? parseFloat(val) : 0
  }

  private _getExtendedNodeTypeId(): treeNotationTypes.nodeTypeId {
    const ancestorIds = this.getAncestorNodeTypeIdsArray()
    if (ancestorIds.length > 1) return ancestorIds[ancestorIds.length - 2]
  }

  _generateSimulatedLine(): string {
    const cells = this.getCellParser().getCellArray()
    if (!cells.length) return undefined
    // todo: generate simulated data from catch all
    return cells.map(cell => cell.synthesizeCell()).join(" ")
  }

  // todo: refactor
  synthesizeNode(nodeCount = 1, indentCount = -1, nodeTypeChain: string[] = []) {
    let nodeTypeIds = this._getInScopeNodeTypeIds()
    const catchAllNodeTypeId = this._getFromExtended(GrammarConstants.catchAllNodeType)
    if (catchAllNodeTypeId) nodeTypeIds.push(catchAllNodeTypeId)
    const thisId = this._getId()
    if (!nodeTypeChain.includes(thisId)) nodeTypeChain.push(thisId)
    const lines = []
    while (nodeCount > 0) {
      const line = this._generateSimulatedLine()
      if (line) lines.push(" ".repeat(indentCount >= 0 ? indentCount : 0) + line)

      const concreteNodeTypeDefs: AbstractGrammarDefinitionNode[] = []
      nodeTypeIds
        .filter(nodeTypeId => {
          if (nodeTypeChain.includes(nodeTypeId)) return false
          return true
        })
        .forEach(nodeTypeId => {
          const def = this.getNodeTypeDefinitionByNodeTypeId(nodeTypeId)
          if (def._isErrorNodeType()) return true
          else if (def._isAbstract()) {
            def._getConcreteDescendantDefinitions().forEach(def => concreteNodeTypeDefs.push(def))
          } else {
            concreteNodeTypeDefs.push(def)
          }
        })

      concreteNodeTypeDefs.forEach(def => {
        if (def._isAbstract()) return true
        const nodeTypeId = def._getId()
        if (nodeTypeChain.includes(nodeTypeId)) return true
        const chain = nodeTypeChain.slice(0)
        chain.push(nodeTypeId)
        def.synthesizeNode(1, indentCount + 1, chain).forEach(line => {
          lines.push(line)
        })
      })
      nodeCount--
    }
    return lines
  }

  private _cellParser: AbstractCellParser

  getCellParser() {
    if (!this._cellParser) {
      const cellParsingStrategy = this._getFromExtended(GrammarConstants.cellParser)
      if (cellParsingStrategy === GrammarCellParser.postfix) this._cellParser = new PostfixCellParser(this)
      else if (cellParsingStrategy === GrammarCellParser.omnifix) this._cellParser = new OmnifixCellParser(this)
      else this._cellParser = new PrefixCellParser(this)
    }
    return this._cellParser
  }
}

// todo: remove?
class nodeTypeDefinitionNode extends AbstractGrammarDefinitionNode {}

// GrammarProgram is a constructor that takes a grammar file, and builds a new
// constructor for new language that takes files in that language to execute, compile, etc.
class GrammarProgram extends AbstractGrammarDefinitionNode {
  createParser() {
    const map: treeNotationTypes.stringMap = {}
    map[GrammarConstants.toolingDirective] = TreeNode
    map[GrammarConstants.todoComment] = TreeNode
    return new TreeNode.Parser(UnknownNodeTypeNode, map, [{ regex: GrammarProgram.nodeTypeFullRegex, nodeConstructor: nodeTypeDefinitionNode }, { regex: GrammarProgram.cellTypeFullRegex, nodeConstructor: cellTypeDefinitionNode }])
  }

  static makeNodeTypeId = (str: string) => TreeUtils._replaceNonAlphaNumericCharactersWithCharCodes(str).replace(GrammarProgram.nodeTypeSuffixRegex, "") + GrammarConstants.nodeTypeSuffix
  static makeCellTypeId = (str: string) => TreeUtils._replaceNonAlphaNumericCharactersWithCharCodes(str).replace(GrammarProgram.cellTypeSuffixRegex, "") + GrammarConstants.cellTypeSuffix

  static nodeTypeSuffixRegex = new RegExp(GrammarConstants.nodeTypeSuffix + "$")
  static nodeTypeFullRegex = new RegExp("^[a-zA-Z0-9_]+" + GrammarConstants.nodeTypeSuffix + "$")

  static cellTypeSuffixRegex = new RegExp(GrammarConstants.cellTypeSuffix + "$")
  static cellTypeFullRegex = new RegExp("^[a-zA-Z0-9_]+" + GrammarConstants.cellTypeSuffix + "$")

  private _cache_compiledLoadedNodeTypes: { [nodeTypeId: string]: Function }

  _getCompiledLoadedNodeTypes() {
    if (!this._cache_compiledLoadedNodeTypes) {
      if (this.isNodeJs()) {
        const code = this.toNodeJsJavascript(__dirname + "/../index.js")
        try {
          const rootNode = this._importNodeJsRootNodeTypeConstructor(code)
          this._cache_compiledLoadedNodeTypes = rootNode.getNodeTypeMap()
          if (!this._cache_compiledLoadedNodeTypes) throw new Error(`Failed to getNodeTypeMap`)
        } catch (err) {
          console.log(err)
          console.log(`Error in code: `)
          console.log(code)
        }
      } else this._cache_compiledLoadedNodeTypes = this._importBrowserRootNodeTypeConstructor(this.toBrowserJavascript(), this.getGrammarName()).getNodeTypeMap()
    }
    return this._cache_compiledLoadedNodeTypes
  }

  private _importNodeJsRootNodeTypeConstructor(code: treeNotationTypes.javascriptCode): any {
    const vm = require("vm")
    // todo: cleanup up
    try {
      ;(<any>global).jtree = require(__dirname + "/../index.js")
      ;(<any>global).require = require
      ;(<any>global).module = {}
      return vm.runInThisContext(code)
    } catch (err) {
      console.log(`Error in compiled grammar code for language "${this.getGrammarName()}":`)
      console.log(
        code
          .split("\n")
          .map((line, index) => index + 1 + " " + line)
          .join("\n")
      )
      console.log(err)
      throw err
    }
  }

  private _importBrowserRootNodeTypeConstructor(code: treeNotationTypes.javascriptCode, name: string): any {
    const script = document.createElement("script")
    script.innerHTML = code
    document.head.appendChild(script)
    return (<any>window)[name]
  }

  // todo: better formalize the source maps pattern somewhat used here by getAllErrors
  // todo: move this to Grammar.grammar (or just get the bootstrapping done.)
  getErrorsInGrammarExamples() {
    const programConstructor = this.getRootConstructor()
    const errors: treeNotationTypes.TreeError[] = []
    this.getValidConcreteAndAbstractNodeTypeDefinitions().forEach(def =>
      def.getExamples().forEach(example => {
        const exampleProgram = new programConstructor(example.childrenToString())
        exampleProgram.getAllErrors(example._getLineNumber() + 1).forEach(err => {
          errors.push(err)
        })
      })
    )
    return errors
  }

  toReadMe() {
    const languageName = this.getExtensionName()
    const rootNodeDef = this._getRootNodeTypeDefinitionNode()
    const cellTypes = this.getCellTypeDefinitions()
    const nodeTypeFamilyTree = this.getNodeTypeFamilyTree()
    const exampleNode = rootNodeDef.getExamples()[0]
    return `title ${languageName} Readme

paragraph ${rootNodeDef.getDescription()}

subtitle Quick Example

code
${exampleNode ? exampleNode.childrenToString(1) : ""}

subtitle Quick facts about ${languageName}

list
 - ${languageName} has ${nodeTypeFamilyTree.getTopDownArray().length} node types.
 - ${languageName} has ${Object.keys(cellTypes).length} cell types
 - The source code for ${languageName} is ${this.getTopDownArray().length} lines long.

subtitle Installing

code
 npm install .

subtitle Testing

code
 node test.js

subtitle Node Types

code
${nodeTypeFamilyTree.toString(1)}

subtitle Cell Types

code
${new TreeNode(Object.keys(cellTypes).join("\n")).toString(1)}

subtitle Road Map

paragraph Here are the "todos" present in the source code for ${languageName}:

list
${this.getTopDownArray()
  .filter(node => node.getWord(0) === "todo")
  .map(node => ` - ${node.getLine()}`)
  .join("\n")}

paragraph This readme was auto-generated using the
 link https://github.com/treenotation/jtree JTree library.`
  }

  toBundle() {
    const files: treeNotationTypes.stringMap = {}
    const rootNodeDef = this._getRootNodeTypeDefinitionNode()
    const languageName = this.getExtensionName()
    const example = rootNodeDef.getExamples()[0]
    const sampleCode = example ? example.childrenToString() : ""

    files[GrammarBundleFiles.package] = JSON.stringify(
      {
        name: languageName,
        private: true,
        dependencies: {
          jtree: TreeNode.getVersion()
        }
      },
      null,
      2
    )
    files[GrammarBundleFiles.readme] = this.toReadMe()

    const testCode = `const program = new ${languageName}(sampleCode)
const errors = program.getAllErrors()
console.log("Sample program compiled with " + errors.length + " errors.")
if (errors.length)
 console.log(errors.map(error => error.getMessage()))`

    const nodePath = `${languageName}.node.js`
    files[nodePath] = this.toNodeJsJavascript()
    files[GrammarBundleFiles.indexJs] = `module.exports = require("./${nodePath}")`

    const browserPath = `${languageName}.browser.js`
    files[browserPath] = this.toBrowserJavascript()
    files[GrammarBundleFiles.indexHtml] = `<script src="node_modules/jtree/products/jtree.browser.js"></script>
<script src="${browserPath}"></script>
<script>
const sampleCode = \`${sampleCode.toString()}\`
${testCode}
</script>`

    const samplePath = "sample." + this.getExtensionName()
    files[samplePath] = sampleCode.toString()
    files[GrammarBundleFiles.testJs] = `const ${languageName} = require("./index.js")
/*keep-line*/ const sampleCode = require("fs").readFileSync("${samplePath}", "utf8")
${testCode}`
    return files
  }

  getTargetExtension() {
    return this._getRootNodeTypeDefinitionNode().get(GrammarConstants.compilesTo)
  }

  private _cache_cellTypes: {
    [name: string]: cellTypeDefinitionNode
  }

  getCellTypeDefinitions() {
    if (!this._cache_cellTypes) this._cache_cellTypes = this._getCellTypeDefinitions()
    return this._cache_cellTypes
  }

  getCellTypeDefinitionById(cellTypeId: treeNotationTypes.cellTypeId) {
    // todo: return unknownCellTypeDefinition? or is that handled somewhere else?
    return this.getCellTypeDefinitions()[cellTypeId]
  }

  getNodeTypeFamilyTree() {
    const tree = new TreeNode()
    Object.values(this.getValidConcreteAndAbstractNodeTypeDefinitions()).forEach(node => {
      const path = node.getAncestorNodeTypeIdsArray().join(" ")
      tree.touchNode(path)
    })
    return tree
  }

  protected _getCellTypeDefinitions() {
    const types: { [typeName: string]: cellTypeDefinitionNode } = {}
    // todo: add built in word types?
    this.getChildrenByNodeConstructor(cellTypeDefinitionNode).forEach(type => (types[(<cellTypeDefinitionNode>type).getCellTypeId()] = type))
    return types
  }

  getLanguageDefinitionProgram() {
    return this
  }

  getValidConcreteAndAbstractNodeTypeDefinitions() {
    return <nodeTypeDefinitionNode[]>this.getChildrenByNodeConstructor(nodeTypeDefinitionNode).filter((node: nodeTypeDefinitionNode) => node._hasValidNodeTypeId())
  }

  private _cache_rootNodeTypeNode: nodeTypeDefinitionNode

  _getRootNodeTypeDefinitionNode() {
    if (!this._cache_rootNodeTypeNode) {
      this.forEach(def => {
        if (def instanceof AbstractGrammarDefinitionNode && def.has(GrammarConstants.root) && def._hasValidNodeTypeId()) this._cache_rootNodeTypeNode = def
      })
    }
    // By default, have a very permissive basic root node.
    // todo: whats the best design pattern to use for this sort of thing?
    if (!this._cache_rootNodeTypeNode) {
      this._cache_rootNodeTypeNode = <nodeTypeDefinitionNode>this.concat(`${GrammarConstants.defaultRootNode}
 ${GrammarConstants.root}
 ${GrammarConstants.catchAllNodeType} ${GrammarConstants.BlobNode}`)[0]
      this._addDefaultCatchAllBlobNode()
    }
    return this._cache_rootNodeTypeNode
  }

  // todo: whats the best design pattern to use for this sort of thing?
  _addDefaultCatchAllBlobNode() {
    delete this._cache_nodeTypeDefinitions
    this.concat(`${GrammarConstants.BlobNode}
 ${GrammarConstants.baseNodeType} ${GrammarConstants.blobNode}`)
  }

  getExtensionName() {
    return this.getGrammarName().replace(GrammarProgram.nodeTypeSuffixRegex, "")
  }

  getGrammarName(): string | undefined {
    return this._getRootNodeTypeDefinitionNode().getNodeTypeIdFromDefinition()
  }

  _getMyInScopeNodeTypeIds(): treeNotationTypes.nodeTypeId[] {
    const nodeTypesNode = this._getRootNodeTypeDefinitionNode().getNode(GrammarConstants.inScope)
    return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : []
  }

  protected _getInScopeNodeTypeIds(): treeNotationTypes.nodeTypeId[] {
    const nodeTypesNode = this._getRootNodeTypeDefinitionNode().getNode(GrammarConstants.inScope)
    return nodeTypesNode ? nodeTypesNode.getWordsFrom(1) : []
  }

  // At present we only have global nodeType definitions (you cannot have scoped nodeType definitions right now).
  private _cache_nodeTypeDefinitions: { [nodeTypeId: string]: nodeTypeDefinitionNode }

  protected _initProgramNodeTypeDefinitionCache(): void {
    if (this._cache_nodeTypeDefinitions) return undefined

    this._cache_nodeTypeDefinitions = {}

    this.getChildrenByNodeConstructor(nodeTypeDefinitionNode).forEach(nodeTypeDefinitionNode => {
      this._cache_nodeTypeDefinitions[(<nodeTypeDefinitionNode>nodeTypeDefinitionNode).getNodeTypeIdFromDefinition()] = nodeTypeDefinitionNode
    })
  }

  _getProgramNodeTypeDefinitionCache() {
    this._initProgramNodeTypeDefinitionCache()
    return this._cache_nodeTypeDefinitions
  }

  static _languages: any = {}
  static _nodeTypes: any = {}

  private _getRootConstructor(): AbstractRuntimeProgramConstructorInterface {
    const def = this._getRootNodeTypeDefinitionNode()
    return <AbstractRuntimeProgramConstructorInterface>def._getConstructorDefinedInGrammar()
  }

  private _cache_rootConstructorClass: AbstractRuntimeProgramConstructorInterface

  getRootConstructor() {
    if (!this._cache_rootConstructorClass) this._cache_rootConstructorClass = this._getRootConstructor()
    return this._cache_rootConstructorClass
  }

  private _getFileExtensions(): string {
    return this._getRootNodeTypeDefinitionNode().get(GrammarConstants.extensions)
      ? this._getRootNodeTypeDefinitionNode()
          .get(GrammarConstants.extensions)
          .split(" ")
          .join(",")
      : this.getExtensionName()
  }

  toNodeJsJavascript(jtreePath = "jtree"): treeNotationTypes.javascriptCode {
    return this._rootNodeDefToJavascriptClass(jtreePath, true).trim()
  }

  toBrowserJavascript(): treeNotationTypes.javascriptCode {
    return this._rootNodeDefToJavascriptClass("", false).trim()
  }

  private _getProperName() {
    return TreeUtils.ucfirst(this.getExtensionName())
  }

  private _rootNodeDefToJavascriptClass(jtreePath: string, forNodeJs = true): treeNotationTypes.javascriptCode {
    const defs = this.getValidConcreteAndAbstractNodeTypeDefinitions()
    // todo: throw if there is no root node defined
    const nodeTypeClasses = defs.map(def => def._nodeDefToJavascriptClass()).join("\n\n")
    const rootName = this._getRootNodeTypeDefinitionNode()._getGeneratedClassName()

    if (!rootName) throw new Error(`Root Node Type Has No Name`)

    let exportScript = ""
    if (forNodeJs) {
      exportScript = `module.exports = ${rootName};
${rootName}`
    } else {
      exportScript = `window.${rootName} = ${rootName}`
    }

    // todo: we can expose the previous "constants" export, if needed, via the grammar, which we preserve.
    return `{
"use strict";

${forNodeJs ? `const {jtree} = require("${jtreePath}")` : ""}

${nodeTypeClasses}

${exportScript}
}
`
  }

  toSublimeSyntaxFile() {
    const cellTypeDefs = this.getCellTypeDefinitions()
    const variables = Object.keys(cellTypeDefs)
      .map(name => ` ${name}: '${cellTypeDefs[name].getRegexString()}'`)
      .join("\n")

    const defs = this.getValidConcreteAndAbstractNodeTypeDefinitions().filter(kw => !kw._isAbstract())
    const nodeTypeContexts = defs.map(def => def.getMatchBlock()).join("\n\n")
    const includes = defs.map(nodeTypeDef => `  - include: '${nodeTypeDef.getNodeTypeIdFromDefinition()}'`).join("\n")

    return `%YAML 1.2
---
name: ${this.getExtensionName()}
file_extensions: [${this._getFileExtensions()}]
scope: source.${this.getExtensionName()}

variables:
${variables}

contexts:
 main:
${includes}

${nodeTypeContexts}`
  }
}

const PreludeKinds: treeNotationTypes.stringMap = {}
PreludeKinds[PreludeCellTypeIds.anyCell] = GrammarAnyCell
PreludeKinds[PreludeCellTypeIds.keywordCell] = GrammarKeywordCell
PreludeKinds[PreludeCellTypeIds.floatCell] = GrammarFloatCell
PreludeKinds[PreludeCellTypeIds.numberCell] = GrammarFloatCell
PreludeKinds[PreludeCellTypeIds.bitCell] = GrammarBitCell
PreludeKinds[PreludeCellTypeIds.boolCell] = GrammarBoolCell
PreludeKinds[PreludeCellTypeIds.intCell] = GrammarIntCell

export { GrammarConstants, PreludeCellTypeIds, GrammarProgram, GrammarBackedRootNode, GrammarBackedNonRootNode }
