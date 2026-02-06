"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    const apiPrefix = configService.get('API_PREFIX', 'api');
    app.setGlobalPrefix(apiPrefix);
    app.enableCors({
        origin: configService.get('FRONTEND_URL', 'http://localhost:5173'),
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const port = configService.get('PORT', 3000);
    await app.listen(port);
    logger.log(`🚀 Application running on: http://localhost:${port}/${apiPrefix}`);
    logger.log(`📚 Environment: ${configService.get('NODE_ENV', 'development')}`);
}
bootstrap();
//# sourceMappingURL=main.js.map