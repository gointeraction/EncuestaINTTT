import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './core/app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('EncuestaINTTT — Back-office analítico')
    .setDescription('API de analítica, reportería y acceso restringido (sesión de staff).')
    .setVersion('0.1.0')
    .addCookieAuth('staff_session')
    .build();
  SwaggerModule.setup('openapi', app, SwaggerModule.createDocument(app, config));

  await app.listen(process.env.PORT ?? 3151);
}
await bootstrap();

