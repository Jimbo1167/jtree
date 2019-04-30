#! /usr/local/bin/node --use_strict

const fs = require("fs")
const CLI = require("../cli.js")

const testTree = {}

testTree.consoleBasics = equal => {
  // Arrange
  const app = new CLI()

  // Act/Assert
  equal(typeof app.getGrammars().toString(), "string")
  equal(typeof app.help(), "string")
  equal(typeof app.allHistory(), "string")
  equal(typeof app.programs("grammar"), "string")
  equal(typeof app.list(), "string", "list works")
  equal(typeof app.version(), "string", "version ok")
  equal(typeof app.usage("grammar"), "string", "usage")

  // Act
  const grammarErrors = app.check(__dirname + "/../grammar.grammar")
  const jibErrors = app.check(__dirname + "/jibberish/jibberish.grammar")

  // Assert
  equal(grammarErrors.includes("0 errors"), true, grammarErrors)
  equal(jibErrors.includes("0 errors"), true, jibErrors)
}

testTree.distribute = equal => {
  // Arrange
  const paths = ["test-combined1.delete.css", "test-combined2.delete.js", "test-combined.combined"].map(
    file => __dirname + "/" + file
  )
  const data = [
    "here is some data",
    `foobar
 test
foo
`
  ]

  const combinedFile = `#file ${paths[0]}
${data[0]}
#file ${paths[1]}
${data[1]}`

  // Assert
  paths.forEach(path => {
    equal(fs.existsSync(path), false, "no file")
  })

  // Act
  fs.writeFileSync(paths[2], combinedFile, "utf8")
  const app = new CLI()
  const createdFilePaths = app.distribute(paths[2])

  // Assert
  equal(createdFilePaths.length, 2)
  paths.forEach((path, index) => {
    equal(fs.existsSync(path), true, "file exists")
    if (data[index]) equal(fs.readFileSync(path, "utf8"), data[index], "correct data written")

    // Cleanup
    fs.unlinkSync(path)
  })
}

/*NODE_JS_ONLY*/ if (!module.parent) require("./testTreeRunner.js")(testTree)

module.exports = testTree