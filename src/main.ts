import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Establecer el prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:80',
      'http://localhost',
      'http://frontend',
    ],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Sistema Universitario API')
    .setDescription('API para gestión de asistencia universitaria')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3000);
  console.log('🚀 Servidor ejecutándose en http://localhost:3000');
  console.log('📚 Documentación API en http://localhost:3000/api-docs');
}
bootstrap();