import TreeNode from "../base/TreeNode"
import jTreeTypes from "../jTreeTypes"

// todo: currently only works in nodejs

interface updatedFile {
  tree: TreeNode
  path: jTreeTypes.absoluteFilePath
}

abstract class Upgrader extends TreeNode {
  upgradeManyInPlace(globPatterns: jTreeTypes.globPattern[], fromVersion: jTreeTypes.semanticVersion, toVersion?: jTreeTypes.semanticVersion) {
    this._upgradeMany(globPatterns, fromVersion, toVersion).forEach(file => file.tree.toDisk(file.path))
    return this
  }

  upgradeManyPreview(globPatterns: jTreeTypes.globPattern[], fromVersion: jTreeTypes.semanticVersion, toVersion?: jTreeTypes.semanticVersion) {
    return this._upgradeMany(globPatterns, fromVersion, toVersion)
  }

  private _upgradeMany(globPatterns: jTreeTypes.globPattern[], fromVersion: jTreeTypes.semanticVersion, toVersion?: jTreeTypes.semanticVersion): updatedFile[] {
    const glob = require("glob")
    return (<any>globPatterns.map(pattern => glob.sync(pattern))).flat().map((path: jTreeTypes.absoluteFilePath) => {
      return {
        tree: this.upgrade(TreeNode.fromDisk(path), fromVersion, toVersion),
        path: path
      }
    })
  }

  abstract getUpgradeFromMap(): jTreeTypes.upgradeFromMap

  upgrade(code: TreeNode, fromVersion: jTreeTypes.semanticVersion, toVersion?: jTreeTypes.semanticVersion): TreeNode {
    const updateFromMap = this.getUpgradeFromMap()
    const semver = require("semver")
    let fromMap: jTreeTypes.upgradeToMap
    while ((fromMap = updateFromMap[fromVersion])) {
      const toNextVersion = Object.keys(fromMap)[0] // todo: currently we just assume 1 step at a time
      if (semver.lt(toVersion, toNextVersion)) break
      const fn = Object.values(fromMap)[0]
      code = fn(code)
      fromVersion = toNextVersion
    }
    return code
  }
}

export default Upgrader
