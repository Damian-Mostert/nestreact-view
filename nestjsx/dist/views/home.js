"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const nestjsx_1 = require("@damian88/nestjsx");
const react_1 = require("react");
let ClientSide = class ClientSide {
    Welcome() {
        react_1.default.useEffect(() => {
            alert("welcome");
        }, []);
        return ((0, jsx_runtime_1.jsxs)("div", { style: {
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                fontFamily: 'sans-serif',
                background: 'linear-gradient(to right, #4e54c8, #8f94fb)',
                color: 'white',
                padding: '2rem'
            }, children: [(0, jsx_runtime_1.jsxs)("h1", { style: { fontSize: '3rem', marginBottom: '1rem' }, children: ["\uD83D\uDC4B Welcome to ", (0, jsx_runtime_1.jsx)("code", { children: "@damian88/nestjsx" })] }), (0, jsx_runtime_1.jsx)("p", { style: { fontSize: '1.2rem', maxWidth: '600px', textAlign: 'center' }, children: "This is your first server-rendered component using your own custom JSX SSR framework." }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: '2rem' }, children: (0, jsx_runtime_1.jsx)("button", { onClick: () => alert('🔥 Let’s build something cool!'), style: {
                            padding: '0.8rem 1.5rem',
                            fontSize: '1rem',
                            border: 'none',
                            borderRadius: '8px',
                            background: 'white',
                            color: '#4e54c8',
                            cursor: 'pointer',
                            transition: '0.3s'
                        }, onMouseOver: (e) => {
                            e.currentTarget.style.background = '#ddd';
                        }, onMouseOut: (e) => {
                            e.currentTarget.style.background = 'white';
                        }, children: "Get Started" }) })] }));
    }
};
__decorate([
    (0, nestjsx_1.Component)('div'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ClientSide.prototype, "Welcome", null);
ClientSide = __decorate([
    (0, nestjsx_1.Client)(),
    (0, nestjsx_1.Use)({})
], ClientSide);
let WelcomePage = class WelcomePage {
    render({ Client, props }) {
        return ((0, jsx_runtime_1.jsxs)("html", { children: [(0, jsx_runtime_1.jsx)("head", { children: (0, jsx_runtime_1.jsx)("title", { children: props.title }) }), (0, jsx_runtime_1.jsx)("body", { style: { margin: 0, padding: 0 }, children: (0, jsx_runtime_1.jsx)(Client.Welcome, {}) })] }));
    }
};
__decorate([
    (0, nestjsx_1.Render)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], WelcomePage.prototype, "render", null);
WelcomePage = __decorate([
    (0, nestjsx_1.Server)()
], WelcomePage);
//# sourceMappingURL=home.js.map