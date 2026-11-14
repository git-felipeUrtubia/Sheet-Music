// electron/main.js
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const http = require("http");
const Database = require("better-sqlite3");

let db;
let staticServerPort = null;

// 1. Inicializar SQLite (seed.db / sheetmusic.db)
function initDatabase() {
    const userDbPath = path.join(app.getPath("userData"), "sheetmusic.db");
    const seedDbPath = app.isPackaged
        ? path.join(process.resourcesPath, "database", "seed.db")
        : path.join(__dirname, "..", "database", "seed.db");

    if (!fs.existsSync(userDbPath) && fs.existsSync(seedDbPath)) {
        fs.mkdirSync(path.dirname(userDbPath), { recursive: true });
        fs.copyFileSync(seedDbPath, userDbPath);
    }

    const activeDbPath = app.isPackaged ? userDbPath : seedDbPath;
    db = new Database(activeDbPath);
    db.pragma("journal_mode = WAL");
}

// 2. Servidor estático interno para servir la carpeta "out" (preview y producción)
const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".ttf": "font/ttf",
    ".xml": "application/xml; charset=utf-8",
    ".musicxml": "application/xml; charset=utf-8",
};

function startStaticOutServer() {
    return new Promise((resolve) => {
        const outDir = path.join(__dirname, "..", "out");

        const server = http.createServer((req, res) => {
            const cleanUrl = decodeURIComponent((req.url || "/").split("?")[0]);
            let filePath = path.join(outDir, cleanUrl === "/" ? "index.html" : cleanUrl);

            // Si la ruta es una carpeta o ruta de Next sin extensión, buscar su .html o index.html
            if (!path.extname(filePath)) {
                if (fs.existsSync(`${filePath}.html`)) {
                    filePath = `${filePath}.html`;
                } else {
                    filePath = path.join(filePath, "index.html");
                }
            }

            fs.readFile(filePath, (err, content) => {
                if (err) {
                    res.writeHead(404);
                    res.end("Not found");
                    return;
                }
                const ext = path.extname(filePath).toLowerCase();
                res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
                res.end(content);
            });
        });

        // Puerto 0 asigna un puerto libre del sistema automáticamente sin colisionar
        server.listen(0, "127.0.0.1", () => {
            staticServerPort = server.address().port;
            resolve(staticServerPort);
        });
    });
}

// Comprueba rápido si localhost:3000 está encendido (modo dev en vivo)
function isPort3000Running() {
    return new Promise((resolve) => {
        const req = http.get("http://localhost:3000", () => {
            resolve(true);
        });
        req.on("error", () => resolve(false));
        req.setTimeout(400, () => {
            req.destroy();
            resolve(false);
        });
    });
}

// 3. Canales IPC de SQLite
ipcMain.handle("db:get-exercises", (_event, level) => {
    if (!db) return [];
    const rows = db.prepare("SELECT * FROM exercises WHERE level = ?").all(level);
    return rows.map((r) => ({
        id: r.id,
        title: r.title,
        level: r.level,
        clef: r.clef,
        timeSignature: r.time_signature,
        notes: JSON.parse(r.notes_json),
    }));
});

ipcMain.handle("db:save-progress", (_event, exerciseId, bpm) => {
    if (!db) return { ok: false };
    const stmt = db.prepare(`
    INSERT INTO user_progress (exercise_id, completed, best_bpm, updated_at)
    VALUES (?, 1, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(exercise_id) DO UPDATE SET
      completed = 1,
      best_bpm = MAX(best_bpm, excluded.best_bpm),
      updated_at = CURRENT_TIMESTAMP
  `);
    stmt.run(exerciseId, bpm);
    return { ok: true };
});

ipcMain.handle("db:get-catalog", () => {
    if (!db) return [];
    const rows = db.prepare(`
    SELECT id, title, composer, level, genre, instrument, clef,
           time_signature, bpm, measures_count, score_file
    FROM scores
  `).all();

    return rows.map((r) => ({
        id: r.id,
        title: r.title,
        composer: r.composer,
        level: r.level,
        genre: r.genre,
        instrument: r.instrument,
        clef: r.clef,
        timeSignature: r.time_signature,
        bpm: r.bpm,
        measuresCount: r.measures_count,
        scoreFile: r.score_file,
    }));
});

ipcMain.handle("db:get-score-xml", (_event, scoreId) => {
    if (!db) return null;
    const row = db
        .prepare("SELECT musicxml_content FROM scores WHERE id = ?")
        .get(scoreId);
    return row ? row.musicxml_content : null;
});

// 4. Crear ventana de Electron
async function createWindow() {

    const iconPath = app.isPackaged
        ? path.join(process.resourcesPath, "app.asar.unpacked", "public", "icon3.png")
        : path.join(__dirname, "..", "public", "icon3.png");

    const win = new BrowserWindow({
        width: 1280,
        height: 820,
        minWidth: 960,
        minHeight: 650,
        show: false,
        icon: iconPath,
        autoHideMenuBar: true,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    win.maximize();
    win.show();

    // Si estamos en desarrollo con "npm run dev" abierto, usa el puerto 3000;
    // si corremos "electron:preview" o el .exe final, sirve la carpeta "out" con todos sus estilos
    const devServerActive = !app.isPackaged && (await isPort3000Running());

    if (devServerActive) {
        win.loadURL("http://localhost:3000");
    } else {
        if (!staticServerPort) {
            await startStaticOutServer();
        }
        win.loadURL(`http://127.0.0.1:${staticServerPort}`);
    }
}

app.whenReady().then(async () => {
    initDatabase();
    await createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (db) db.close();
    if (process.platform !== "darwin") app.quit();
});