const fs = require('fs');
const path = require('path');

const dataDir = __dirname;
const files = fs.readdirSync(dataDir);

// Helper to convert camelCase or PascalCase to kebab-case
const toKebabCase = str => str
  .replace(/([a-z])([A-Z])/g, '$1-$2')
  .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
  .replace(/_/g, '-')
  .toLowerCase();

files.forEach((file) => {
  if (!file.endsWith('-scenarios.js')) return;
  const baseName = file.replace('.js', '').replace('-scenarios', '');
  const kebabName = toKebabCase(baseName);
  const jsonFile = path.join(dataDir, `${kebabName}-scenarios.json`);
  const jsFile = path.join(dataDir, file);

  // Remove old JSON file if it exists
  if (fs.existsSync(jsonFile)) {
    fs.unlinkSync(jsonFile);
  }

  try {
    const fileContent = fs.readFileSync(jsFile, 'utf8');
    // Try export default first
    let match = fileContent.match(/export default (.*);?$/s);
    let exported;
    if (match) {
      exported = match[1].trim();
      if (exported.endsWith(';')) exported = exported.slice(0, -1);
    } else {
      // Try export const <name> = ...
      match = fileContent.match(/export const (\w+)\s*=\s*([\s\S]*?)\n?};?\s*$/);
      if (!match) throw new Error('No export default or named export found');
      exported = match[2].trim();
      // Add closing } if missing (for objects)
      if (!exported.endsWith('}')) exported += '}';
    }
    // Evaluate the exported object/array
    // eslint-disable-next-line no-eval
    const data = eval('(' + exported + ')');
    fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2), 'utf8');
    console.log(`Converted ${file} to ${kebabName}-scenarios.json`);
  } catch (err) {
    console.error(`Failed to convert ${file}:`, err.message);
  }
}); 