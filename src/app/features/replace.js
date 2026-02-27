const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        return;
    }
    let content = fs.readFileSync(filePath, 'utf8');

    // Casing replacements
    content = content.replace(/Medicine/g, 'Cam');
    content = content.replace(/medicine/g, 'cam');
    content = content.replace(/Thuốc/g, 'Cám');
    content = content.replace(/thuốc/g, 'cám');
    content = content.replace(/Thuoc/g, 'Cam');
    content = content.replace(/thuoc/g, 'cam');
    content = content.replace(/THUOC/g, 'CAM');
    content = content.replace(/MEDICINE/g, 'CAM');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Replaced in', filePath);
}

const dirCam = 'd:/quan-ly-trai-lon/FE-quan-ly-trai-lon/src/app/features/cam';
const filesCam = ['cam.component.ts', 'cam.component.html', 'cam.service.ts'];
filesCam.forEach(f => replaceInFile(path.join(dirCam, f)));

const dirKhoCam = 'd:/quan-ly-trai-lon/FE-quan-ly-trai-lon/src/app/features/kho-cam';
const filesKhoCam = ['kho-cam.component.ts', 'kho-cam.component.html', 'kho-cam.service.ts'];
filesKhoCam.forEach(f => replaceInFile(path.join(dirKhoCam, f)));
console.log('Done replacement');
