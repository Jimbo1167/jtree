"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TreeNode_1 = require("../base/TreeNode");
const GrammarConstNode_1 = require("./GrammarConstNode");
class GrammarConstantsNode extends TreeNode_1.default {
    getCatchAllNodeClass(line) {
        return GrammarConstNode_1.default;
    }
    getConstantsObj() {
        const result = {};
        this.forEach(node => {
            const name = node.getName();
            result[name] = node.getValue();
        });
        return result;
    }
}
exports.default = GrammarConstantsNode;