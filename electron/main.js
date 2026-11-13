// electron/main.js
const { app, BrowserWindow, session, protocol, net, shell, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const { pathToFileURL } = require("url");

// Permiso guardado únicamente en la memoria de la sesión actual (se reinicia al cerrar la app)
let micAllowedForSession = null;

protocol.registerSchemesAsPrivileged([
    {
        scheme: "app",
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            corsEnabled: true,
            stream: true,
        },
    },
]);

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1360,
        height: 860,
        minWidth: 1024,
        minHeight: 700,
        backgroundColor: "#0A1128",
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // Abrir enlaces externos (donaciones, links web) en el navegador predeterminado del PC
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith("http://") || url.startsWith("https://")) {
            shell.openExternal(url);
            return { action: "deny" };
        }
        return { action: "allow" };
    });

    // Permitir verificación síncrona de dispositivos de audio si aún no fue bloqueado
    session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
        if (permission === "media") {
            return micAllowedForSession !== false;
        }
        return false;
    });

    // Interceptar solicitudes de uso del micrófono
    session.defaultSession.setPermissionRequestHandler(async (webContents, permission, callback) => {
        if (permission === "media") {
            // Si el usuario ya tomó una decisión mientras la app estuvo abierta, aplicarla
            if (micAllowedForSession !== null) {
                return callback(micAllowedForSession);
            }

            const { response } = await dialog.showMessageBox(mainWindow, {
                type: "question",
                buttons: ["Permitir mientras la app esté abierta", "Bloquear micrófono"],
                defaultId: 0,
                cancelId: 1,
                title: "Permiso de Micrófono",
                message: "¿Deseas permitir que SheetMusic utilice tu micrófono?",
                detail:
                    "El micrófono se usará exclusivamente mientras la aplicación permanezca abierta para detectar las notas que tocas en tiempo real.",
            });

            micAllowedForSession = response === 0;
            return callback(micAllowedForSession);
        }

        callback(false);
    });

    mainWindow.loadURL("app://-/index.html");
}

app.whenReady().then(() => {
    const outDir = path.join(__dirname, "..", "out");

    protocol.handle("app", (request) => {
        const urlObj = new URL(request.url);
        let relPath = decodeURIComponent(urlObj.pathname);

        if (relPath === "/" || relPath === "") {
            relPath = "/index.html";
        }

        let targetPath = path.join(outDir, relPath);

        if (!fs.existsSync(targetPath) || fs.statSync(targetPath).isDirectory()) {
            const htmlCandidate = path.join(outDir, `${relPath.replace(/\/$/, "")}.html`);
            const indexCandidate = path.join(outDir, relPath, "index.html");

            if (fs.existsSync(htmlCandidate)) {
                targetPath = htmlCandidate;
            } else if (fs.existsSync(indexCandidate)) {
                targetPath = indexCandidate;
            } else {
                return new Response("Not Found", { status: 404 });
            }
        }

        return net.fetch(pathToFileURL(targetPath).toString());
    });

    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});