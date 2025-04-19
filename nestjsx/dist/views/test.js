"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Test;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
function Test() {
    (0, react_1.useEffect)(() => {
        alert("Client side rendering is the best");
    }, []);
    return (0, jsx_runtime_1.jsx)("div", { children: "Hello world" });
}
//# sourceMappingURL=test.js.map