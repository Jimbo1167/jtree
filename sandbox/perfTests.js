const log = msg => {
  jQuery("body").append(`<div>${msg}</div>`)
  console.log(msg)
}

const getBigCode = () => {
  const programCode = `foo
 whoodat
nodeWithConsts
lightbulbState on
lightbulbState off
+ 2 3 2
text
thisShouldErrorError1
to fillThis`
  const code = new jtree.TreeNode(programCode)
  let long = jtree.TreeNode.toString().repeat(20)
  code.getNode("text").setChildren(long)

  long = "+ 34 432 423 43\nto foo\n to bar\n  + 12 12\n".repeat(2000)
  code.getNode("to").setChildren(long.trim())
  return code
}

const main = (grammarCode, code) => {
  log("Building language...")
  const programClass = new GrammarProgram(grammarCode).getRootConstructor()

  log("Loading program...")

  const program = new programClass(code)

  log("Checking errors...")
  const startTime = Date.now()
  const errors = program.getAllErrors()
  //const errors = []
  const expected = 2
  const elapsed = Date.now() - startTime

  let totalLines = code.getNumberOfLines()
  const ps = (totalLines / (elapsed / 1000)).toLocaleString()
  let msg = `checked ${totalLines} lines of TN code in ${elapsed}ms. ${ps} lines per second. Expected ${expected} errors. Actual errors: ${errors.length}.`

  log(msg)
  log("")
  log("First five errors:")
  log(
    errors
      .slice(0, 5)
      .map(e => e.getMessage())
      .join("<br>")
  )

  parseStringTest()
  toStringTest()
}

const parseStringTest = () => {
  const data = TreeNode.iris.repeat(100)
  const map = {}
  const lineLength = data.split("\n").length
  const trials = 200

  const startTime = Date.now()

  for (let index = 0; index < trials; index++) {
    map[index] = new TreeNode(data)
  }
  const elapsed = Date.now() - startTime

  let totalLines = lineLength * trials
  const ps = (totalLines / (elapsed / 1000)).toLocaleString()
  log(`parsed ${totalLines} lines of TN code in ${elapsed}ms. ${ps} lines per second<br><br>`)
}

const toStringTest = () => {
  const data = new TreeNode(jtree.Utils.makeRandomTree(10000))
  const startTime = Date.now()

  const res = data.toString()
  const elapsed = Date.now() - startTime

  let totalLines = data.getNumberOfLines()
  const ps = (totalLines / (elapsed / 1000)).toLocaleString()
  log(`toString ${totalLines} lines of TN code in ${elapsed}ms. ${ps} lines per second`)
}

jQuery(async () => {
  const grammarCode = await jQuery.get("/langs/jibberish/jibberish.grammar")
  main(grammarCode, getBigCode())
})
