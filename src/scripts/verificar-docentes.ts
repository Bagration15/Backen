import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DocentesService } from '../docentes/docentes.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Docente } from '../docentes/schemas/docente.schema';

async function verificarDocentes() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  try {
    console.log('\n=== VERIFICACIÓN DE DOCENTES EN LA BASE DE DATOS ===\n');
    
    // Obtener el modelo directamente
    const docenteModel = app.get<Model<Docente>>(getModelToken(Docente.name));
    
    // Obtener la conexión y la base de datos
    const connection = docenteModel.db;
    const dbName = connection.name;
    console.log(`📊 Base de datos conectada: ${dbName}`);
    
    // Obtener el nombre de la colección
    const collectionName = docenteModel.collection.name;
    console.log(`📦 Colección: ${collectionName}`);
    
    // Contar documentos
    const count = await docenteModel.countDocuments();
    console.log(`\n📈 Total de docentes en la colección: ${count}`);
    
    // Listar todos los docentes
    if (count > 0) {
      console.log('\n📋 Lista de docentes:');
      const docentes = await docenteModel.find().select('-password').lean();
      docentes.forEach((docente, index) => {
        console.log(`\n${index + 1}. ${docente.nombre}`);
        console.log(`   Email: ${docente.email}`);
        console.log(`   Departamento: ${docente.departamento}`);
        console.log(`   Activo: ${docente.activo !== false ? 'Sí' : 'No'}`);
        console.log(`   ID: ${docente._id}`);
      });
    } else {
      console.log('\n⚠️  No se encontraron docentes en la colección.');
      console.log('\n💡 Posibles causas:');
      console.log('   1. Los docentes se están guardando en otra base de datos');
      console.log('   2. Los docentes se están guardando en otra colección');
      console.log('   3. Hay un error al guardar que no se está mostrando');
    }
    
    // Verificar otras posibles colecciones
    console.log('\n🔍 Verificando otras colecciones posibles...');
    const collections = connection.collections;
    const docenteCollections: string[] = [];
    
    for (const [name, collection] of Object.entries(collections)) {
      if (name.toLowerCase().includes('docent') || 
          name.toLowerCase().includes('profesor') ||
          name.toLowerCase().includes('teacher')) {
        docenteCollections.push(name);
      }
    }
    
    if (docenteCollections.length > 0) {
      console.log('\n📦 Colecciones relacionadas encontradas:');
      for (const colName of docenteCollections) {
        const collection = collections[colName];
        const colCount = await collection.countDocuments();
        console.log(`   - ${colName}: ${colCount} documentos`);
      }
    }
    
    // Verificar todas las colecciones
    console.log('\n📚 Todas las colecciones en la base de datos:');
    for (const [name] of Object.entries(collections)) {
      console.log(`   - ${name}`);
    }
    
  } catch (error) {
    console.error('❌ Error al verificar docentes:', error);
  } finally {
    await app.close();
  }
}

verificarDocentes().catch(console.error);

