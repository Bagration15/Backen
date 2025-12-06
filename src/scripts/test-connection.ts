import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DocentesService } from '../docentes/docentes.service';
import { MongooseModule } from '@nestjs/mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    // Verificar conexión a MongoDB
    const connection = app.get(getConnectionToken());
    const dbState = connection.readyState;
    
    console.log('\n🔍 Verificando conexión a MongoDB...');
    console.log('Estado de conexión:', dbState === 1 ? '✅ Conectado' : '❌ Desconectado');
    
    if (dbState === 1) {
      const dbName = connection.db.databaseName;
      console.log('📊 Base de datos:', dbName);
      
      // Listar colecciones
      const collections = await connection.db.listCollections().toArray();
      console.log('📁 Colecciones encontradas:', collections.length);
      collections.forEach(col => {
        console.log('   -', col.name);
      });
    }
    
    // Verificar usuarios en la base de datos
    console.log('\n👤 Verificando usuarios en la base de datos...');
    const docentesService = app.get(DocentesService);
    const usuarios = await docentesService.findAll();
    
    console.log(`✅ Total de usuarios encontrados: ${usuarios.length}`);
    
    if (usuarios.length > 0) {
      console.log('\n📋 Lista de usuarios:');
      usuarios.forEach((user, index) => {
        console.log(`\n   ${index + 1}. ${user.nombre}`);
        console.log('      Email:', user.email);
        console.log('      Departamento:', user.departamento);
        console.log('      Rol:', user.role);
        console.log('      Activo:', user.activo ? 'Sí' : 'No');
      });
    } else {
      console.log('⚠️  No hay usuarios en la base de datos');
    }
    
    // Verificar usuario de prueba específico
    console.log('\n🔎 Buscando usuario de prueba...');
    const testUser = await docentesService.findByEmail('admin@universidad.edu');
    
    if (testUser) {
      console.log('✅ Usuario de prueba encontrado:');
      console.log('   Email:', testUser.email);
      console.log('   Nombre:', testUser.nombre);
      console.log('   ID:', testUser._id);
    } else {
      console.log('❌ Usuario de prueba no encontrado');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap();

