const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs')
const cors = require('cors');
const fileUpload = require('express-fileupload');
const { Client } = require('smb2');
const rimraf = require('rimraf');
const fsExtra = require('fs-extra');
const { execSync } = require('child_process');
const { promisify } = require('util');

const router = express.Router();


//metodo multer.storage.diskStorage

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      
    //let uploadPath = 'C:/Users/Practicante 2/Downloads/';
    let uploadPath = 'C:/Clientes-proveedores/';
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Los meses son de 0 a 11
    const day = date.getDate();
    const minute = date.getMilliseconds();
    const nombre = 
    uploadPath = path.join(uploadPath, String(year)+'-'+ String(month)+'-'+ String(day));
      const ruta = `${uploadPath}`
      if(!ruta){
        fs.mkdirSync(ruta)   
      }
      cb(null, ruta)
    },
    filename: function (req, file, cb) {
    cb(null, file.fieldname);
  }
});

/* const upload = multer({ storage: storage }); */

const nameX = null;

const upload = multer({ dest: 'uploads/' });
router.post('/', upload.fields([
  { name: 'Vinculacion' },
  { name: 'ComprAntc' },
  { name: 'CtaInst' },
  { name: 'Pagare' },
  { name: 'Rut' },
  { name: 'Ccio' },
  { name: 'CrepL' },
  { name: 'Ef' },
  { name: 'Certban' },
  { name: 'Refcom' },
  { name: 'Refcom2' },
  { name: 'Refcom3' },
  { name: 'Refcom4' },
  { name: 'Cvbo' },
  { name: 'Firdoc' },
  { name: 'Infemp' },
  { name: 'Infrl' },
  { name: 'Otros'},
  { name: 'ValAnt'},
  { name: 'VboAg' },
  { name: 'VboDc' },
  { name: 'VboDf' },
]), async (req, res) => {
  const folderName = req.body.folderName;
  const originalFolderName = req.body.originalFolderName;
  /* const folderPath=null */
  if(folderName !== originalFolderName){
    
    // Ruta de la carpeta de origen
    const carpetaOrigen = `C:/Clientes-Proveedores/${originalFolderName}`;
    
    // Ruta de la carpeta de destino
    const carpetaDestino = `C:/Clientes-Proveedores/${folderName}`;
    /* const nombreArchivos =  */
    const archivosLocales = fsExtra.readdirSync(carpetaOrigen);

  archivosLocales.forEach((archivo) => {
    const rutaLocal = path.join(carpetaOrigen, archivo);
    const rutaRemotaArchivo = path.join(carpetaDestino, archivo);
    fsExtra.copySync(rutaLocal, rutaRemotaArchivo);

    /* changing names of files */
    const palabraABorrar  = req.body.originalClientName;
    const palabraReemplazo  = req.body.clientName;
    const extension = path.extname(archivo);
    const nombreBase  = path.basename(archivo);
    const nuevoNombre = nombreBase.replace(palabraABorrar,palabraReemplazo);
    const rutaOriginal = path.join(carpetaDestino,archivo);
    const rutaNueva = path.join(carpetaDestino,nuevoNombre+extension);
    fs.rename(rutaOriginal,rutaNueva,(err)=>{
      if (err) {
        console.error('Error al renombrar el archivo:', err);
      } else {
        console.log(`Archivo renombrado: ${nombreBase} => ${nuevoNombre}`);
      }
    })

  });
  console.log('Archivos copiados exitosamente.');
  }
  const folderPath = path.join(`C:/Clientes-Proveedores/${folderName}`);

async function crearCarpetaLocal(){
if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath);
  }
  for (const fileInputName in req.files){
    req.files[fileInputName].forEach((file)=>{
      const clientName = req.body.clientName;
      const extension = path.extname(file.originalname);
      const newFilePath = path.join(folderPath,file.fieldname+`-${clientName}`+extension);
      fs.rename(file.path,newFilePath,(err)=>{
        if(err){
          res.status(500).send('error al guardar los archivos');
        }
      })
    })
  } res.status(200).send('archivos guardados');
}
  // Ruta local de la carpeta que deseas enviar
  const carpetaLocal = folderPath

  // Ruta del recurso compartido en formato UNC (Uniform Naming Convention)
  const rutaRecursoCompartido = '\\\\192.168.4.237\\aplicativoterceros';

  // Ruta remota en el recurso compartido donde deseas guardar la carpeta
  const rutaRemota = `${rutaRecursoCompartido}\\${folderName}`;

  // Crear la carpeta remota en el recurso compartido
  async function carpetaRemota(){
  try {
    if(!fs.existsSync(rutaRemota)){
      execSync(`mkdir "${rutaRemota}"`);
    }
  } catch (error) {
    console.error('Error al crear la carpeta remota:', error.message);
    process.exit(1);
  }
  }
  async function renombrar (){
  // Recorrer la carpeta local y copiar cada archivo al recurso compartido
  const archivosLocales = fs.readdirSync(carpetaLocal);
  const readdir = promisify(fs.readdir);
  const rename = promisify(fs.rename);
  const copyFile = promisify(fs.copyFile);
  const carpetaA = archivosLocales;
  const carpetaB = rutaRemota;
  try{
    const archivosA = carpetaA;
    let archivosB;
    try {
        archivosB = await readdir(carpetaB);
    } catch (error) {
        // Si la carpeta B está vacía, establecemos archivosB como un arreglo vacío
        archivosB = [];
    }
    //identificamos los archivos repetidos de la carpeta local y la carpeta remota
    const archivosRepetidos = archivosA.filter(archivo => archivosB.includes(archivo));
    //identificamos los archivos que no estan repetidos
    const archivosFaltantes = archivosA.filter(archivo => !(archivosRepetidos.includes(archivo)))
    console.log(archivosFaltantes)
    //funcion para renombrar y agregar los archivos repetidos a la carpeta remota
    if(archivosRepetidos.length>0){
    await archivosRepetidos.forEach((remote)=>{
      if(archivosB.includes(remote)){
          fs.stat(path.join(rutaRemota,remote),(err,stats)=>{
            if(err) console.log(err) ;
            //funcion para obtener la fecha de modificacion del archivo
            const fechaModificacion = new Date(stats.mtime.getTime()).toLocaleDateString();
            const fecha = fechaModificacion.split('/').join('-')
            const extension = path.extname(remote);
            const nombre = path.basename(remote,path.extname(remote))
            const nuevoNombre = `${nombre}-${fecha}`;
            //cambiamos el nombre a los archivos repetidos
            rename(path.join(rutaRemota,remote),path.join(rutaRemota,nuevoNombre+extension), (err) => {
              if (err) throw err;
              console.log(`El archivo ${remote} fue renombrado a ${nuevoNombre}`);
            })
            //enviamos los archivos a la carpeta remota
              const rutaLocal = path.join(carpetaLocal, remote);
              const rutaRemotaArchivo = path.join(rutaRemota, remote);
              try {
                execSync(`copy "${rutaLocal}" "${rutaRemotaArchivo}"`);
                console.log(`Archivo ${remote} enviado correctamente.`);
              } catch (error) {
                console.error(`Error al enviar el archivo ${remote}:`, error.message);
              }
          })
      }
    })
  }
  //si hay archivos locales que no estan en la carpeta remota, los enviamos
  if(archivosFaltantes.length>0){
    await archivosFaltantes.forEach((archivo)=>{
      const rutaLocal = path.join(carpetaLocal, archivo);
      const rutaRemotaArchivo = path.join(rutaRemota, archivo);
  
      // Utiliza un comando del sistema operativo para copiar el archivo al recurso compartido
      execSync(`copy "${rutaLocal}" "${rutaRemotaArchivo}"`);
      try {
        console.log(`Archivo ${archivo} enviado correctamente.`);
      } catch (error) {
        console.error(`Error al enviar el archivo ${archivo}:`, error.message);
      }
    })
  }else{
    //si es la primera creacion del terceros simplemente mandamos los archivos a la carpeta remota
    await archivosLocales.forEach((archivo) => {
      const rutaLocal = path.join(carpetaLocal, archivo);
      const rutaRemotaArchivo = path.join(rutaRemota, archivo);
      // Utiliza un comando del sistema operativo para copiar el archivo al recurso compartido
      execSync(`copy "${rutaLocal}" "${rutaRemotaArchivo}"`);
      try {
        console.log(`Archivo ${archivo} enviado correctamente.`);
      } catch (error) {
        console.error(`Error al enviar el archivo ${archivo}:`, error.message);
      }
    });
  }
    }catch (error) {
      console.error('Ocurrió un error:', error);
    }
  }
  //funcion para enviar (no la voy a utilizar por ahora)
  async function enviar(){
  const archivosLocales = fs.readdirSync(carpetaLocal);
  archivosLocales.forEach((archivo) => {
    const rutaLocal = path.join(carpetaLocal, archivo);
    const rutaRemotaArchivo = path.join(rutaRemota, archivo);

    // Utiliza un comando del sistema operativo para copiar el archivo al recurso compartido
    execSync(`copy "${rutaLocal}" "${rutaRemotaArchivo}"`);
    try {
      console.log(`Archivo ${archivo} enviado correctamente.`);
    } catch (error) {
      console.error(`Error al enviar el archivo ${archivo}:`, error.message);
    }
  });
  }
  /* await renombrar();
  await enviar(); */

  //de esta manera controlamos la ejecucion de las funciones
  async function ejecutar(){
    console.log('Inicio de ejecucion')
    await crearCarpetaLocal();
    console.log('carpeta local creada')
    await carpetaRemota();
    console.log('carpeta remota creada')
    await renombrar()
  }
  ejecutar();
  console.log('Carpeta enviada correctamente.');
});


/* eliminar una carpeta */
router.delete('/:folderName', (req,res)=>{
  const folderName = req.params.folderName; 
  const rutaArchivo = path.join(`C:/Users/Practicante 2/Downloads/${folderName}`);

  fsExtra.remove(rutaArchivo)
    .then(() => {
      console.log('Carpeta eliminada correctamente');
    })
    .catch((err) => {
      console.error(`Error al eliminar la carpeta: ${err.message}`);
    });if (err) {
      console.error(err);
      return res.status(500).send('Error al eliminar la carpeta');
    }
});

const carpetaCompartida = '\\\\192.168.4.237\\aplicativoterceros\\87877767-COMFENALCO';

router.get('/obtener-archivo/:carpeta/:archivo', (req, res) => {
  const { carpeta, archivo } = req.params;
  const rutaArchivo = path.join('\\\\192.168.4.237\\aplicativoterceros\\', carpeta, archivo);
  res.sendFile(rutaArchivo);
});

router.get('/archivos/compartidos',(req,res)=>{
  const folderName = req.params.folderName; 
  const rutaRecursoCompartido = '\\192.168.4.237\aplicativoterceros';

  // Ruta remota en el recurso compartido donde deseas guardar la carpeta
  const rutaRemota = `${rutaRecursoCompartido}\\${folderName}`;
  fsExtra.readdir(rutaRemota, (err, files) => {
    if (err) {
      console.error('Error al obtener archivos:', err);
      return;
    }

    console.log('Archivos en la carpeta compartida:', files);
  });
})

module.exports=router
