/**
 * Cross-platform build script
 */
const fs = require('fs');
const path = require('path');

console.log('Starting cross-platform build script...');

// Ensure build directory exists
const buildDir = path.join(__dirname, '..', 'build');
if (!fs.existsSync(buildDir)) {
  console.log('Creating build directory...');
  fs.mkdirSync(buildDir, { recursive: true });
}

// Ensure scripts directory exists in build
const buildScriptsDir = path.join(buildDir, 'scripts');
if (!fs.existsSync(buildScriptsDir)) {
  console.log('Creating build/scripts directory...');
  fs.mkdirSync(buildScriptsDir, { recursive: true });
}

// Copy frontend files
console.log('Copying frontend files...');
copyDir(path.join(__dirname, '..', 'frontend'), path.join(buildDir));

// Copy backend files
console.log('Copying backend files...');
copyDir(path.join(__dirname, '..', 'backend'), path.join(buildDir, 'backend'));

// Copy buffer polyfill
console.log('Copying buffer polyfill...');
fs.copyFileSync(
  path.join(__dirname, 'buffer-polyfill.js'),
  path.join(buildScriptsDir, 'buffer-polyfill.js')
);

console.log('Build completed successfully!');

/**
 * Recursively copy directory and its contents
 */
function copyDir(src, dest) {
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Read source directory contents
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectory
      copyDir(srcPath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
    }
  }
} 