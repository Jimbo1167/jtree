import AbstractNode from "./AbstractNode.node";
import Parser from "./Parser";
import jTreeTypes from "../jTreeTypes";
declare type int = jTreeTypes.int;
declare type word = jTreeTypes.word;
declare type cellFn = (str: string, rowIndex: int, colIndex: int) => any;
declare type mapFn = (value: any, index: int, array: any[]) => any;
declare enum WhereOperators {
    equal = "=",
    notEqual = "!=",
    lessThan = "<",
    lessThanOrEqual = "<=",
    greaterThan = ">",
    greaterThanOrEqual = ">=",
    includes = "includes",
    doesNotInclude = "doesNotInclude",
    in = "in",
    notIn = "notIn",
    empty = "empty",
    notEmpty = "notEmpty"
}
declare class ImmutableNode extends AbstractNode {
    constructor(children?: jTreeTypes.children, line?: string, parent?: ImmutableNode);
    private _uid;
    private _words;
    private _parent;
    private _children;
    private _line;
    private _index;
    execute(context: any): Promise<any[]>;
    getErrors(): jTreeTypes.TreeError[];
    getLineCellTypes(): string;
    executeSync(context: any): any[];
    isNodeJs(): boolean;
    isBrowser(): boolean;
    getOlderSiblings(): ImmutableNode[];
    protected _getClosestOlderSibling(): ImmutableNode | undefined;
    getYoungerSiblings(): ImmutableNode[];
    getSiblings(): any[];
    protected _getUid(): number;
    getParent(): ImmutableNode;
    getPoint(): jTreeTypes.point;
    protected _getPoint(relativeTo?: ImmutableNode): jTreeTypes.point;
    getPointRelativeTo(relativeTo?: ImmutableNode): jTreeTypes.point;
    getIndentation(relativeTo?: ImmutableNode): string;
    protected _getTopDownArray(arr: TreeNode[]): void;
    getTopDownArray(): jTreeTypes.treeNode[];
    getTopDownArrayIterator(): IterableIterator<jTreeTypes.treeNode>;
    nodeAtLine(lineNumber: jTreeTypes.positiveInt): TreeNode | undefined;
    getNumberOfLines(): int;
    protected _cachedLineNumber: int;
    _getLineNumber(target?: ImmutableNode): number;
    isBlankLine(): boolean;
    hasDuplicateFirstWords(): boolean;
    isEmpty(): boolean;
    protected _getYCoordinate(relativeTo?: ImmutableNode): number;
    isRoot(relativeTo?: ImmutableNode): boolean;
    getRootNode(): ImmutableNode | this;
    protected _getRootNode(relativeTo?: ImmutableNode): ImmutableNode | this;
    toString(indentCount?: number, language?: this): string;
    printLinesFrom(start: jTreeTypes.int, quantity: jTreeTypes.int): this;
    printLinesWithLineNumbersFrom(start: jTreeTypes.int, quantity: jTreeTypes.int): this;
    private _printLinesFrom;
    getWord(index: int): word;
    protected _toHtml(indentCount: int): string;
    protected _getWords(startFrom: int): string[];
    getWords(): word[];
    doesExtend(nodeTypeId: jTreeTypes.nodeTypeId): boolean;
    require(moduleName: string, filePath?: string): any;
    getWordsFrom(startFrom: int): string[];
    getSparsity(): number;
    getBiDirectionalMaps(propertyNameOrFn: mapFn | string, propertyNameOrFn2?: mapFn | string): {
        [key: string]: string[];
    }[];
    private _getWordIndexCharacterStartPosition;
    getNodeInScopeAtCharIndex(charIndex: jTreeTypes.positiveInt): ImmutableNode;
    getWordProperties(wordIndex: int): {
        startCharIndex: number;
        endCharIndex: number;
        word: string;
    };
    getAllWordBoundaryCoordinates(): jTreeTypes.point[];
    getWordBoundaryIndices(): jTreeTypes.positiveInt[];
    getWordIndexAtCharacterIndex(charIndex: jTreeTypes.positiveInt): int;
    getAllErrors(lineStartsAt?: number): jTreeTypes.TreeError[];
    getAllErrorsIterator(): IterableIterator<any>;
    getFirstWord(): word;
    getContent(): string;
    getContentWithChildren(): string;
    getFirstNode(): ImmutableNode;
    getStack(): ImmutableNode[];
    protected _getStack(relativeTo?: ImmutableNode): ImmutableNode[];
    getStackString(): string;
    getLine(language?: ImmutableNode): string;
    getColumnNames(): word[];
    getOneHot(column: string): TreeNode;
    protected _getFirstWordPath(relativeTo?: ImmutableNode): jTreeTypes.firstWordPath;
    getFirstWordPathRelativeTo(relativeTo?: ImmutableNode): jTreeTypes.firstWordPath;
    getFirstWordPath(): jTreeTypes.firstWordPath;
    getPathVector(): jTreeTypes.pathVector;
    getPathVectorRelativeTo(relativeTo?: ImmutableNode): jTreeTypes.pathVector;
    protected _getPathVector(relativeTo?: ImmutableNode): jTreeTypes.pathVector;
    getIndex(): int;
    isTerminal(): boolean;
    protected _getLineHtml(): string;
    protected _getXmlContent(indentCount: jTreeTypes.positiveInt): string;
    protected _toXml(indentCount: jTreeTypes.positiveInt): string;
    protected _toObjectTuple(): Object[];
    protected _indexOfNode(needleNode: ImmutableNode): number;
    getSlice(startIndexInclusive: int, stopIndexExclusive: int): TreeNode;
    protected _hasColumns(columns: string[]): boolean;
    hasWord(index: int, word: string): boolean;
    getNodeByColumns(...columns: string[]): ImmutableNode;
    getNodeByColumn(index: int, name: string): ImmutableNode;
    protected _getNodesByColumn(index: int, name: word): ImmutableNode[];
    select(columnNames: string[] | string): TreeNode;
    print(message?: string): this;
    where(columnName: string, operator: WhereOperators, fixedValue?: string | number | string[] | number[]): TreeNode;
    with(firstWord: string): any[];
    first(quantity?: number): TreeNode;
    last(quantity?: number): TreeNode;
    limit(quantity: int, offset?: number): TreeNode;
    getChildrenFirstArray(): ImmutableNode[];
    protected _getChildrenFirstArray(arr: ImmutableNode[]): void;
    protected _getXCoordinate(relativeTo: ImmutableNode): number;
    getParentFirstArray(): ImmutableNode[];
    protected _getLevels(): {
        [level: number]: ImmutableNode[];
    };
    protected _getChildrenArray(): ImmutableNode[];
    protected _getChildren(): ImmutableNode[];
    getLines(): string[];
    getChildren(): any[];
    readonly length: jTreeTypes.positiveInt;
    protected _nodeAt(index: int): ImmutableNode;
    nodeAt(indexOrIndexArray: int | int[]): ImmutableNode | undefined;
    protected _toObject(): jTreeTypes.stringMap;
    toHtml(): jTreeTypes.htmlString;
    protected _getHtmlJoinByCharacter(): string;
    protected _childrenToHtml(indentCount: int): string;
    protected _childrenToString(indentCount?: int, language?: this): string;
    childrenToString(): string;
    protected _getChildJoinCharacter(): string;
    compile(): string;
    toXml(): jTreeTypes.xmlString;
    toDisk(path: string): this;
    _lineToYaml(indentLevel: number, listTag?: string): string;
    _isYamlList(): boolean;
    toYaml(): string;
    _childrenToYaml(indentLevel: number): string[];
    _collapseYamlLine(): boolean;
    _toYamlListElement(indentLevel: number): string;
    _childrenToYamlList(indentLevel: number): string[];
    _toYamlAssociativeArrayElement(indentLevel: number): string;
    _childrenToYamlAssociativeArray(indentLevel: number): string[];
    toJsonSubset(): jTreeTypes.jsonSubset;
    findNodes(firstWordPath: jTreeTypes.firstWordPath | jTreeTypes.firstWordPath[]): TreeNode[];
    format(str: jTreeTypes.formatString): string;
    getColumn(path: word): string[];
    getFiltered(fn: jTreeTypes.filterFn): TreeNode;
    getNode(firstWordPath: jTreeTypes.firstWordPath): ImmutableNode;
    get(firstWordPath: jTreeTypes.firstWordPath): string;
    getNodesByGlobPath(query: jTreeTypes.globPath): TreeNode[];
    private _getNodesByGlobPath;
    protected _getNodeByPath(firstWordPath: jTreeTypes.firstWordPath): ImmutableNode;
    getNext(): ImmutableNode;
    getPrevious(): ImmutableNode;
    protected _getUnionNames(): string[];
    getAncestorNodesByInheritanceViaExtendsKeyword(key: word): ImmutableNode[];
    getAncestorNodesByInheritanceViaColumnIndices(thisColumnNumber: int, extendsColumnNumber: int): ImmutableNode[];
    protected _getAncestorNodes(getPotentialParentNodesByIdFn: (thisParentNode: ImmutableNode, id: word) => ImmutableNode[], getParentIdFn: (thisNode: ImmutableNode) => word, cannotContainNode: ImmutableNode): ImmutableNode[];
    pathVectorToFirstWordPath(pathVector: jTreeTypes.pathVector): word[];
    toCsv(): string;
    protected _getTypes(header: string[]): string[];
    toDataTable(header?: string[]): jTreeTypes.dataTable;
    toDelimited(delimiter: jTreeTypes.delimiter, header?: string[]): string;
    protected _getMatrix(columns: string[]): string[][];
    protected _toArrays(header: string[], cellFn: cellFn): {
        rows: any[];
        header: any[];
    };
    protected _toDelimited(delimiter: jTreeTypes.delimiter, header: string[], cellFn: cellFn): string;
    toTable(): string;
    toFormattedTable(maxCharactersPerColumn: number, alignRight?: boolean): string;
    protected _toTable(maxCharactersPerColumn: number, alignRight?: boolean): string;
    toSsv(): string;
    toOutline(): string;
    toMappedOutline(nodeFn: jTreeTypes.nodeToStringFn): string;
    protected _toOutline(nodeFn: jTreeTypes.nodeToStringFn): string;
    copyTo(node: TreeNode, index: int): any;
    split(firstWord: jTreeTypes.word): ImmutableNode[];
    toMarkdownTable(): string;
    toMarkdownTableAdvanced(columns: word[], formatFn: jTreeTypes.formatFunction): string;
    toTsv(): string;
    getYI(): string;
    getZI(): string;
    getYIRegex(): RegExp;
    getXI(): string;
    protected _textToContentAndChildrenTuple(text: string): string[];
    protected _getLine(): string;
    protected _setLine(line?: string): this;
    protected _clearChildren(): this;
    protected _setChildren(content: any, circularCheckArray?: any[]): this;
    protected _setFromObject(content: any, circularCheckArray: Object[]): this;
    protected _appendFromJavascriptObjectTuple(firstWord: jTreeTypes.word, content: any, circularCheckArray: Object[]): void;
    _setLineAndChildren(line: string, children?: jTreeTypes.children, index?: number): any;
    protected _parseString(str: string): this;
    protected _getIndex(): {
        [firstWord: string]: number;
    };
    getContentsArray(): any[];
    getChildrenByNodeConstructor(constructor: Function): any[];
    getNodeByType(constructor: Function): any;
    indexOfLast(firstWord: word): int;
    indexOf(firstWord: word): int;
    toObject(): Object;
    getFirstWords(): word[];
    protected _makeIndex(startAt?: number): {
        [firstWord: string]: number;
    };
    protected _childrenToXml(indentCount: jTreeTypes.positiveInt): string;
    protected _getIndentCount(str: string): number;
    clone(): TreeNode;
    has(firstWord: word): boolean;
    protected _hasFirstWord(firstWord: string): boolean;
    map(fn: mapFn): any[];
    filter(fn: jTreeTypes.filterFn): any[];
    find(fn: jTreeTypes.filterFn): any;
    every(fn: jTreeTypes.everyFn): boolean;
    forEach(fn: jTreeTypes.forEachFn): this;
    _clearIndex(): void;
    slice(start: int, end?: int): ImmutableNode[];
    getInheritanceTree(): TreeNode;
    protected _getGrandParent(): ImmutableNode | undefined;
    private _parser;
    _getParser(): Parser;
    createParser(): Parser;
    private static _uniqueId;
    static _makeUniqueId(): number;
    protected static _getFileFormat(path: string): string;
    static Parser: typeof Parser;
    static iris: string;
}
declare class TreeNode extends ImmutableNode {
    private _mtime;
    private _cmtime;
    getMTime(): int;
    protected _getChildrenMTime(): number;
    protected _getCMTime(): number;
    protected _setCMTime(value: number): this;
    getTreeMTime(): int;
    private _virtualParentTree;
    protected _setVirtualParentTree(tree: TreeNode): this;
    protected _getVirtualParentTreeNode(): TreeNode;
    private _setVirtualAncestorNodesByInheritanceViaColumnIndicesAndThenExpand;
    private _isVirtualExpanded;
    private _isExpanding;
    protected _expandFromVirtualParentTree(): this;
    _expandChildren(thisIdColumnNumber: int, extendsIdColumnNumber: int, childrenThatNeedExpanding?: any[]): this;
    extend(nodeOrStr: TreeNode | string): this;
    macroExpand(macroDefinitionWord: string, macroUsageWord: string): TreeNode;
    setChildren(children: jTreeTypes.children): this;
    protected _updateMTime(): void;
    insertWord(index: int, word: string): this;
    deleteDuplicates(): this;
    setWord(index: int, word: string): this;
    deleteChildren(): this;
    setContent(content: string): TreeNode;
    setContentWithChildren(text: string): TreeNode;
    setFirstWord(firstWord: word): this;
    setLine(line: string): this;
    duplicate(): any;
    destroy(): void;
    set(firstWordPath: jTreeTypes.firstWordPath, text: string): TreeNode;
    setFromText(text: string): this;
    appendLine(line: string): any;
    appendLineAndChildren(line: string, children: jTreeTypes.children): any;
    getNodesByRegex(regex: RegExp | RegExp[]): ImmutableNode[];
    getNodesByLinePrefixes(columns: string[]): TreeNode[];
    protected _getNodesByLineRegex(matches: ImmutableNode[], regs: RegExp[]): void;
    concat(node: string | ImmutableNode): any[];
    protected _deleteByIndexes(indexesToDelete: int[]): this;
    protected _deleteNode(node: ImmutableNode): 0 | this;
    reverse(): this;
    shift(): any;
    sort(fn: jTreeTypes.sortFn): this;
    invert(): this;
    protected _rename(oldFirstWord: jTreeTypes.word, newFirstWord: jTreeTypes.word): this;
    remap(map: jTreeTypes.stringMap): this;
    rename(oldFirstWord: word, newFirstWord: word): this;
    renameAll(oldName: word, newName: word): this;
    protected _deleteAllChildNodesWithFirstWord(firstWord: word): this;
    delete(path?: jTreeTypes.firstWordPath): 0 | TreeNode;
    deleteColumn(firstWord?: string): this;
    protected _getNonMaps(): TreeNode[];
    replaceNode(fn: (thisStr: string) => string): TreeNode[];
    insertLineAndChildren(line: string, children: jTreeTypes.children, index: int): any;
    insertLine(line: string, index: int): any;
    prependLine(line: string): any;
    pushContentAndChildren(content?: jTreeTypes.line, children?: jTreeTypes.children): any;
    deleteBlanks(): this;
    firstWordSort(firstWordOrder: jTreeTypes.word[]): this;
    deleteWordAt(wordIndex: jTreeTypes.positiveInt): this;
    setWords(words: jTreeTypes.word[]): this;
    setWordsFrom(index: jTreeTypes.positiveInt, words: jTreeTypes.word[]): this;
    appendWord(word: jTreeTypes.word): this;
    _firstWordSort(firstWordOrder: jTreeTypes.word[], secondarySortFn?: jTreeTypes.sortFn): this;
    protected _touchNode(firstWordPathArray: jTreeTypes.word[]): this;
    protected _touchNodeByString(str: string): this;
    touchNode(str: jTreeTypes.firstWordPath): this;
    appendNode(node: TreeNode): any;
    hasLine(line: jTreeTypes.line): boolean;
    getNodesByLine(line: jTreeTypes.line): any[];
    toggleLine(line: jTreeTypes.line): TreeNode;
    sortByColumns(indexOrIndices: int | int[]): this;
    getWordsAsSet(): Set<string>;
    appendWordIfMissing(word: string): this;
    addObjectsAsDelimited(arrayOfObjects: Object[], delimiter?: string): this;
    setChildrenAsDelimited(tree: TreeNode | string, delimiter?: string): this;
    convertChildrenToDelimited(delimiter?: string): this;
    addUniqueRowsToNestedDelimited(header: string, rowsAsStrings: string[]): this;
    shiftLeft(): TreeNode;
    shiftRight(): TreeNode;
    shiftYoungerSibsRight(): TreeNode;
    sortBy(nameOrNames: jTreeTypes.word[]): this;
    static fromCsv(str: string): TreeNode;
    static fromJsonSubset(str: jTreeTypes.jsonSubset): TreeNode;
    static fromSsv(str: string): TreeNode;
    static fromTsv(str: string): TreeNode;
    static fromDelimited(str: string, delimiter: string, quoteChar?: string): TreeNode;
    static _getEscapedRows(str: string, delimiter: string, quoteChar: string): string[][];
    static fromDelimitedNoHeaders(str: string, delimiter: string, quoteChar: string): TreeNode;
    static _strToRows(str: string, delimiter: string, quoteChar: string, newLineChar?: string): string[][];
    static multiply(nodeA: TreeNode, nodeB: TreeNode): TreeNode;
    static _rowsToTreeNode(rows: string[][], delimiter: string, hasHeaders: boolean): TreeNode;
    private static _xmlParser;
    static _initializeXmlParser(): void;
    static fromXml(str: string): ImmutableNode;
    static _zipObject(keys: string[], values: any): jTreeTypes.stringMap;
    static fromShape(shapeArr: int[], rootNode?: TreeNode): TreeNode;
    static fromDataTable(table: jTreeTypes.dataTable): TreeNode;
    static _parseXml2(str: string): HTMLDivElement;
    static _treeNodeFromXml(xml: any): TreeNode;
    static _getHeader(rows: string[][], hasHeaders: boolean): string[];
    static nest(str: string, xValue: int): string;
    static fromDisk(path: string): TreeNode;
}
export default TreeNode;
