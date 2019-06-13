const jtree = require("../../index.js")

class additionNode extends jtree.NonTerminalNode {}
class LineOfCodeNode extends jtree.NonTerminalNode {}
class SomeNestedNode extends jtree.NonTerminalNode {}

const nested = {}
nested.someNestedNode = SomeNestedNode

class JibberishProgramRoot extends jtree.programRoot {
  executeSync() {
    return 42
  }
}

module.exports = {
  JibberishProgramRoot,
  additionNode,
  LineOfCodeNode,
  nested
}