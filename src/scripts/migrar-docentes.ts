import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import * as bcrypt from 'bcryptjs';

async function migrarDocentes() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const connection = app.get<Connection>(getConnectionToken());
  const db = connection.db;
  
  console.log('🔄 Migrando docentes a la colección correcta...\n');
  console.log(`📊 Base de datos: ${db.databaseName}\n`);

  try {
    const args = process.argv.slice(2);
    const coleccionOrigen = args[0] || 'users'; // Por defecto buscar en 'users'
    
    console.log(`🔍 Buscando docentes en la colección: "${coleccionOrigen}"\n`);

    // Buscar en la colección origen
    let coleccionOrigenInstance;
    try {
      coleccionOrigenInstance = db.collection(coleccionOrigen);
    } catch (error) {
      console.log(`❌ No se encontró la colección "${coleccionOrigen}"`);
      console.log('\n📋 Colecciones disponibles:');
      const collections = await db.listCollections().toArray();
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
      await app.close();
      return;
    }

    // Buscar docentes en la colección origen
    const docentesEncontrados = await coleccionOrigenInstance.find({ 
      $or: [
        { role: 'docente' },
        { role: 'teacher' },
        { role: 'profesor' }
      ]
    }).toArray();

    console.log(`📊 Docentes encontrados: ${docentesEncontrados.length}\n`);

    if (docentesEncontrados.length === 0) {
      console.log('⚠️  No se encontraron docentes para migrar');
      await app.close();
      return;
    }

    // Obtener la colección destino
    const docentesCollection = db.collection('docentes');

    let migrados = 0;
    let errores = 0;

    for (const docente of docentesEncontrados) {
      try {
        // Verificar si ya existe en docentes
        const existe = await docentesCollection.findOne({ email: docente.email });
        
        if (existe) {
          console.log(`⏭️  Ya existe: ${docente.email} (saltado)`);
          continue;
        }

        // Preparar el documento para la colección docentes
        const nuevoDocente: any = {
          nombre: docente.nombre || 'Docente Sin Nombre',
          email: docente.email,
          departamento: docente.departamento || 'Sin Departamento',
          role: 'docente',
          activo: docente.activo !== false,
        };

        // Si tiene password, mantenerlo; si no, crear uno por defecto
        if (docente.password) {
          nuevoDocente.password = docente.password;
        } else {
          // Crear password por defecto basado en el email
          const passwordDefault = docente.email.split('@')[0] + '123';
          nuevoDocente.password = await bcrypt.hash(passwordDefault, 10);
          console.log(`🔑 Password generado para ${docente.email}: ${passwordDefault}`);
        }

        // Agregar campos opcionales
        if (docente.especialidad) nuevoDocente.especialidad = docente.especialidad;
        if (docente.telefono) nuevoDocente.telefono = docente.telefono;
        if (docente.createdAt) nuevoDocente.createdAt = docente.createdAt;
        if (docente.updatedAt) nuevoDocente.updatedAt = docente.updatedAt;

        // Insertar en la colección docentes
        await docentesCollection.insertOne(nuevoDocente);
        
        console.log(`✅ Migrado: ${docente.nombre} (${docente.email})`);
        migrados++;

      } catch (error: any) {
        console.error(`❌ Error migrando ${docente.email}:`, error.message);
        errores++;
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   ✅ Migrados: ${migrados}`);
    console.log(`   ❌ Errores: ${errores}`);
    console.log(`   📦 Total procesados: ${docentesEncontrados.length}`);

    // Verificar resultado final
    const countFinal = await docentesCollection.countDocuments();
    console.log(`\n📊 Total de docentes en la colección "docentes": ${countFinal}`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await app.close();
  }
}

migrarDocentes().catch(console.error);

