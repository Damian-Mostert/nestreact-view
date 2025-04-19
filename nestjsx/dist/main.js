"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nestjsx_1 = require("@damian88/nestjsx");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    (0, nestjsx_1.default)(app);
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
//# sourceMappingURL=main.js.map