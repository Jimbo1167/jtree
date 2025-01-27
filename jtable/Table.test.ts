#!/usr/bin/env ts-node

import { Table, ComparisonOperators } from "./Table"
import { DummyDataSets } from "./DummyDataSets"

import { treeNotationTypes } from "../products/treeNotationTypes"

const { jtree } = require("../index.js")

const moment = require("moment")

const testTree: treeNotationTypes.testTree = {}

testTree.all = equal => {
  // Arrange
  const rows = [{ date: "1/10/2015" }, { date: "1/28/2015" }, { date: "2/26/2015" }, { date: "3/25/2015" }, { date: "4/23/2015" }]
  const table = new Table(rows, [{ source: "date", name: "year", type: "year" }])

  // Assert
  equal(table.getRowCount(), 5)
  equal(table.getColumnCount(), 2)

  // Act
  const vals = table.getJavascriptNativeTypedValues()
  const col = table.getColumnByName("year")
  // Assert
  equal(col.toDisplayString(vals[0].year), "2015", "Got correct numeric value")

  // Act
  const typedVals = table.getJavascriptNativeTypedValues()
  // Assert
  equal(<any>typedVals[0].year instanceof Date, true)

  // Act
  const result = table.getPredictionsForAPropertyNameToColumnNameMapGivenHintsNode(new jtree.TreeNode(`xAxis isString=false`), {})
  // Assert
  equal(result["xAxis"], "date")
}

testTree.vegaTest = equal => {
  // Arrange
  const rows = [
    ["appeared", "count", "total"],
    [1941, 1, 1],
    [1943, 1, 2],
    [1947, 2, 4],
    [1948, 1, 5],
    [1949, 1, 6],
    [1950, 3, 9],
    [1951, 4, 13],
    [1952, 2, 15],
    [1953, 5, 20],
    [1954, 3, 23],
    [1955, 9, 32],
    [1956, 5, 37],
    [1957, 8, 45]
  ]
  const table = new Table(jtree.Utils.javascriptTableWithHeaderRowToObjects(rows), [{ source: "appeared", name: "year", type: "year" }])

  // Assert
  const typedVals = table.getJavascriptNativeTypedValues()
  // Assert
  equal(<any>typedVals[0].year instanceof Date, true)
  equal(moment(typedVals[0].year).format("YYYY"), "1941")
}

testTree.filterTest = equal => {
  // Arrange
  const table = new Table(jtree.Utils.javascriptTableWithHeaderRowToObjects(DummyDataSets.waterBill), [{ source: "PaidOn", name: "year", type: "year" }])
  // Act
  const res = table.filterClonedRowsByScalar("year", ComparisonOperators.greaterThan, "2018")
  // Assert
  equal(res.getRowCount(), 3)
}

testTree.timeTest = equal => {
  // Arrange
  const rows = [["time"], [1535482671], [1534034894], [1533851918], [1531158072], [1520274393], [1514831947], [1512006781], [1511556916]]
  const table = new Table(jtree.Utils.javascriptTableWithHeaderRowToObjects(rows))
  const typedVals = table.getJavascriptNativeTypedValues()
  const column = table.getColumnByName("time")

  // Assert
  equal(column.getPrimitiveTypeName(), "second")
}

/*NODE_JS_ONLY*/ if (!module.parent) jtree.Utils.runTestTree(testTree)
export { testTree }
