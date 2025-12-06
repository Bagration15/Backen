import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DocentesService } from '../docentes/docentes.service';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

async function verificarYMigrarDocentes() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const connection = app.get<Connection>(getConnectionToken());
  const db = connection.db;
  
  console.log('🔍 Verificando ubicación de docentes en la base de datos...\n');
  console.log(`📊 Base de datos conectada: ${db.databaseName}\n`);

  try {
    // Listar todas las colecciones
    const collections = await db.listCollections().toArray();
    console.log('📋 Colecciones encontradas:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    console.log('');

    // Verificar colección 'docentes'
    const docentesCollection = db.collection('docentes');
    const countDocentes = await docentesCollection.countDocuments();
    console.log(`📊 Documentos en colección 'docentes': ${countDocentes}`);

    if (countDocentes > 0) {
      console.log('\n✅ La colección "docentes" tiene documentos:');
      const docentes = await docentesCollection.find({}).limit(5).toArray();
      docentes.forEach((doc, index) => {
        console.log(`\n   ${index + 1}. ${doc.nombre || 'Sin nombre'} (${doc.email || 'Sin email'})`);
        console.log(`      ID: ${doc._id}`);
        console.log(`      Rol: ${doc.role || 'No definido'}`);
        console.log(`      Activo: ${doc.activo !== false ? 'Sí' : 'No'}`);
      });
    } else {
      console.log('\n⚠️  La colección "docentes" está vacía');
      
      // Buscar en otras colecciones posibles
      console.log('\n🔍 Buscando docentes en otras colecciones...\n');
      
      const posiblesColecciones = ['users', 'usuarios', 'profesores', 'teachers', 'docente'];
      
      for (const colName of posiblesColecciones) {
        try {
          const col = db.collection(colName);
          const count = await col.countDocuments();
          if (count > 0) {
            console.log(`📦 Encontrados ${count} documentos en "${colName}"`);
            const docs = await col.find({ role: 'docente' }).limit(3).toArray();
            if (docs.length > 0) {
              console.log(`   Algunos docentes encontrados:`);
              docs.forEach(doc => {
                console.log(`   - ${doc.nombre || 'Sin nombre'} (${doc.email || 'Sin email'})`);
              });
            }
          }
        } catch (error) {
          // Colección no existe, continuar
        }
      }
      
      // Buscar en todas las colecciones documentos con role: 'docente'
      console.log('\n🔍 Buscando documentos con role="docente" en todas las colecciones...\n');
      
      for (const col of collections) {
        try {
          const colInstance = db.collection(col.name);
          const docs = await colInstance.find({ role: 'docente' }).limit(3).toArray();
          if (docs.length > 0) {
            console.log(`📦 Encontrados ${docs.length} docentes en "${col.name}":`);
            docs.forEach(doc => {
              console.log(`   - ${doc.nombre || 'Sin nombre'} (${doc.email || 'Sin email'})`);
            });
            
            // Preguntar si migrar
            console.log(`\n💡 ¿Deseas migrar estos docentes a la colección "docentes"?`);
            console.log(`   Ejecuta: npm run migrar:docentes "${col.name}"`);
          }
        } catch (error) {
          // Continuar
        }
      }
    }

    // Verificar también usando el servicio
    console.log('\n\n🔍 Verificando usando DocentesService...\n');
    const docentesService = app.get(DocentesService);
    const docentesDesdeService = await docentesService.findAll();
    console.log(`📊 Docentes encontrados por el servicio: ${docentesDesdeService.length}`);
    
    if (docentesDesdeService.length > 0) {
      console.log('\n✅ Docentes encontrados:');
      docentesDesdeService.forEach((docente, index) => {
        console.log(`\n   ${index + 1}. ${docente.nombre} (${docente.email})`);
        console.log(`      ID: ${docente._id}`);
        console.log(`      Rol: ${docente.role || 'No definido'}`);
        console.log(`      Activo: ${docente.activo !== false ? 'Sí' : 'No'}`);
        console.log(`      Departamento: ${docente.departamento || 'N/A'}`);
      });
    } else {
      console.log('\n⚠️  No se encontraron docentes usando el servicio');
      console.log('💡 Esto puede indicar que:');
      console.log('   1. Los docentes no se están guardando correctamente');
      console.log('   2. Hay un problema con la conexión a la base de datos');
      console.log('   3. Los docentes están en otra base de datos');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await app.close();
  }
}

verificarYMigrarDocentes().catch(console.error);

