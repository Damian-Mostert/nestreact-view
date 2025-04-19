import  NestReactEngine from '@damian88/nestjsx';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  NestReactEngine(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
