// main.ts
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api/v2')
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  // Obtener el puerto desde el ConfigService de NestJS
  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT') || 3002

  await app.listen(port)
  console.log(`App running on port ${port}`)
}
void bootstrap()
