/* eslint-disable @typescript-eslint/no-require-imports */
// En los servidores de Vercel no hace falta recompilar binarios nativos de Electron.
// Misma condición que:
// node -e "if (!process.env.VERCEL) require('child_process').execSync('electron-builder install-app-deps', {stdio: 'inherit'})"
if (process.env.VERCEL) {
  console.log("Vercel detectado: se omite electron-builder install-app-deps.");
  process.exit(0);
}

require("child_process").execSync("electron-builder install-app-deps", {
  stdio: "inherit",
});
