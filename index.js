// desconstruct args to see if path is supplied
// if not, ask for path
const fs = require('fs')
const path = require('path')
const readline = require('readline')
const filesize = require('filesize')

const initPath = [...process.argv][2]
let filesToBeDeleted = []
let totalZip = 0
let totalSize = 0

const deleteFiles = (files) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question("Do you want to delete the files? ", (p) => {
    // if yes, delete them
    if (p.toLowerCase() === 'yes' || p.toLowerCase() === 'y') {
      files.forEach(f => console.log(f))
    } else {
      console.log('Bye.')
      process.exit();
    }

    rl.close();
  });
};

const getSubFolders = (srcPath) => {
  const subfolders = fs.readdirSync(srcPath).filter(file => fs.statSync(path.join(srcPath, file)).isDirectory())

  subfolders.forEach(fld => {
    fs.readdir(path.join(srcPath, fld), function (err, files) {
      if (err) {
        console.log(err);
      }

      files.forEach(function (file) {
        if (path.extname(file) === '.zip') {
          const fullpath = path.join(srcPath, fld)
          const fname = path.basename(file).split('.')
          if (fs.existsSync(path.join(fullpath, fname[fname.length - 2]))) {
            totalZip++;
            let stats = fs.statSync(path.join(fullpath, file))
            let fileSizeInBytes = stats['size']
            totalSize += fileSizeInBytes
            console.log(`Total files: ${totalZip} total size: ${filesize(totalSize, {round: 2})}`);
            filesToBeDeleted.push(path.join(fullpath, file))
          }
        }
      })
      getSubFolders(path.join(srcPath, fld))
    })
  })
}

const checkPath = (path) => {
  if ( fs.existsSync(path)) {
    console.log(`the path ${path} exists`);
    // iterate through the subfolders
    getSubFolders(path)
    deleteFiles(filesToBeDeleted)
  } else {
    processArgs()
  }
}

const processArgs = () => {
  if (initPath) {
    checkPath(initPath)
  } else {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question('Insert path: ', (p) => {
      console.log(`checking if ${p} exists`);
      checkPath(p)
       rl.close()
    })
  }
}

processArgs()