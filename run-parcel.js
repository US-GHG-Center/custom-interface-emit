// run-parcel.js
const { execSync } = require('child_process');

const buildDir = process.argv[3];
const publicUrl = process.env.PUBLIC_URL;

if (!publicUrl) {
  console.error(
    'Error: PUBLIC_URL is not defined in your .env file or environment.'
  );
  console.error(
    'Please define it (e.g., PUBLIC_URL="/my/custom/path").'
  );
  process.exit(1);
}

let parcelCommand;

const mode = process.argv[2];
console.log({ mode });
switch (mode) {
  case 'build':
    parcelCommand = `parcel build --public-url "${publicUrl}" --dist-dir ${buildDir}`;
    break;
  case 'serve':
    parcelCommand = `parcel  --public-url "${publicUrl}"`;
    break;
  default:
    console.error(`[run-parcel.js] ❌ Unknown mode: ${mode}`);
    process.exit(1);
}

console.log(`[run-parcel.js] ▶ Running: ${parcelCommand}`);
try {
  execSync(parcelCommand, { stdio: 'inherit' });
} catch (error) {
  console.error(`[run-parcel.js] ❌ Parcel command failed for mode: ${mode}`);
  // error object itself is already printed by execSync on failure when stdio is 'inherit'
  process.exit(1); // Ensure script exits with error code
}
