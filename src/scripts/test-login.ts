import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  const testCredentials = {
    email: 'admin@universidad.edu',
    password: 'admin123'
  };

  try {
    console.log('\n🔐 Probando inicio de sesión...');
    console.log('📧 Email:', testCredentials.email);
    console.log('🔑 Password:', testCredentials.password);
    
    const result = await authService.login(testCredentials);
    
    console.log('\n✅ ¡Inicio de sesión exitoso!');
    console.log('👤 Usuario:', result.user.nombre);
    console.log('📧 Email:', result.user.email);
    console.log('🏢 Departamento:', result.user.departamento);
    console.log('🔑 Token generado:', result.access_token ? 'Sí' : 'No');
    console.log('📝 Token (primeros 50 caracteres):', result.access_token.substring(0, 50) + '...');
    
  } catch (error) {
    console.error('\n❌ Error al iniciar sesión:', error.message);
    console.error('Detalles:', error.response || error);
  } finally {
    await app.close();
  }
}

bootstrap();

