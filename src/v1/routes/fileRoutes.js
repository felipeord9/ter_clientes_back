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
  /* { name: 'pdfFile0' },
  { name: 'pdfFile1' },
  { name: 'pdfFile2' },
  { name: 'pdfFile3' },
  { name: 'pdfFile4' },
  { name: 'pdfFile5' },
  { name: 'pdfFile6' },
  { name: 'pdfFile7' },
  { name: 'pdfFile8' },
  { name: 'pdfFile9' },
  { name: 'pdfFile10' },
  { name: 'pdfFile11' },
  { name: 'pdfFile12' },
  { name: 'pdfFile13' } */
  // Add more fields if necessary

  /* second form */
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
  //const folderPath = path.join(`C:/Users/Practicante 2/Downloads/${folderName}`);

/* const folderPath = path.join(`smb${folderName}`);
 */if (!fs.existsSync(folderPath)) {
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

  // Ruta local de la carpeta que deseas enviar
  const carpetaLocal = folderPath

  // Ruta del recurso compartido en formato UNC (Uniform Naming Convention)
  const rutaRecursoCompartido = '\\\\192.168.4.237\\aplicativoterceros';

  // Ruta remota en el recurso compartido donde deseas guardar la carpeta
  const rutaRemota = `${rutaRecursoCompartido}\\${folderName}`;

  // Crear la carpeta remota en el recurso compartido
  try {
    if(!fs.existsSync(rutaRemota)){
      execSync(`mkdir "${rutaRemota}"`);
    }
  } catch (error) {
    console.error('Error al crear la carpeta remota:', error.message);
    process.exit(1);
  }

  // Recorrer la carpeta local y copiar cada archivo al recurso compartido
  const archivosLocales = fs.readdirSync(carpetaLocal);
  archivosLocales.forEach((archivo) => {
    const rutaLocal = path.join(carpetaLocal, archivo);
    const rutaRemotaArchivo = path.join(rutaRemota, archivo);

    // Utiliza un comando del sistema operativo para copiar el archivo al recurso compartido
    try {
      execSync(`copy "${rutaLocal}" "${rutaRemotaArchivo}"`);
      console.log(`Archivo ${archivo} enviado correctamente.`);
    } catch (error) {
      console.error(`Error al enviar el archivo ${archivo}:`, error.message);
    }
  });

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

/* router.get('/archivo/:nombreArchivo',(req,res)=>{
  const { nombreArchivo } = req.params;
  const folderName = req.body.folderName;
  const rutaArchivo = path.join(`${carpetaCompartida}`, nombreArchivo);
  try{
    res.sendFile(rutaArchivo);
  }catch (error){
    console.log('Error no hay ningun archivo con este nombre',error)
  }
}) */

/* const carpetaCompartida = '\\\\192.168.4.237\\aplicativoterceros\\1006101631-ORDOÑEZ-MARIN-FELIPE-JOSE'; // Reemplaza con la ruta de tu carpeta compartida
router.get('/archivos',express.static(carpetaCompartida));
 */


/* app.use('/archivos',express.static(carpetaCompartida)) */
/* get the files in the ftp */
/* const arr = express.static();
arr.get('archivos',('\\\\192.168.4.237\\aplicativoterceros\\1006101631-ORDOÑEZ-MARIN-FELIPE-EMANUEL')) */
/* router.use('/archivos', express.static(carpetaCompartida));
 *//* router.use('/archivo',(req,res)=>{
  const folderName = req.body.folderName;
  const carpetaCompartida = `\\\\192.168.4.237\\aplicativoterceros\\${folderName}`; // Reemplaza con la ruta de tu carpeta compartida
  express.static(carpetaCompartida)

}) */


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
