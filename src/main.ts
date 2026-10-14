import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { UPLOAD_ROOT } from './uploads/uploads.controller';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useStaticAssets(UPLOAD_ROOT, { prefix: '/uploads' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const doc = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle('InternTM API').setVersion('1.0').addBearerAuth().build(),
  );
  SwaggerModule.setup('docs', app, doc, { swaggerOptions: { persistAuthorization: true } });

  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port);
  new Logger('Bootstrap').log(`API: http://localhost:${port}/api   Swagger: http://localhost:${port}/docs`);
}
bootstrap();
