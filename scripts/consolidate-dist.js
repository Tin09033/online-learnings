const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const distDir = path.join(rootDir, '..', 'dist');
const frontendDist = path.join(rootDir, '..', 'frontend', 'dist');
const adminDist = path.join(rootDir, '..', 'admin', 'dist');

// Remove existing dist directory
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

// Create fresh dist directory
fs.mkdirSync(distDir, { recursive: true });

// Copy frontend dist contents to root dist
console.log('Copying frontend dist...');
copyDir(frontendDist, distDir);

// Create admin subfolder in dist
const adminTargetDir = path.join(distDir, 'admin');
fs.mkdirSync(adminTargetDir, { recursive: true });

// Copy admin dist contents to dist/admin
console.log('Copying admin dist...');
copyDir(adminDist, adminTargetDir);

console.log('\n✓ Build consolidated successfully!');
console.log('\nDeployment structure:');
console.log('dist/');
listDir(distDir, '  ');
console.log('dist/admin/');
listDir(adminTargetDir, '  ');

function copyDir(src, dest) {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function listDir(dir, indent = '') {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    console.log(`${indent}${entry.name}${entry.isDirectory() ? '/' : ''}`);
    if (entry.isDirectory() && indent === '  ') {
      listDir(path.join(dir, entry.name), indent + '  ');
    }
  }
}
