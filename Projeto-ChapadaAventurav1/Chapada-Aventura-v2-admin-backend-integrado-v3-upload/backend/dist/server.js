"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const PORT = process.env.PORT || 3333;
const JWT_SECRET = process.env.JWT_SECRET || "chapada-secret-dev";
// Diretórios de arquivos estáticos e uploads
const publicDir = path_1.default.join(__dirname, "..", "..", "public");
const uploadsDir = path_1.default.join(publicDir, "uploads", "trails");
if (!fs_1.default.existsSync(uploadsDir)) {
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
}
// Configuração do Multer para upload de imagens
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, "_");
        const unique = Date.now() + "-" + safeName;
        cb(null, unique);
    }
});
const upload = (0, multer_1.default)({ storage });
// Banco de dados SQLite
const dbFile = path_1.default.join(__dirname, "..", "data", "chapada.db");
sqlite3_1.default.verbose();
const db = new sqlite3_1.default.Database(dbFile);
// Inicialização das tabelas
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL
    );`);
    db.run(`CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );`);
    // Usuário admin padrão
    db.get("SELECT id FROM users WHERE email = ?", ["admin@chapada.com"], (err, row) => {
        if (err) {
            console.error("Erro ao verificar admin:", err);
            return;
        }
        if (!row) {
            const hash = bcryptjs_1.default.hashSync("123456", 10);
            const now = new Date().toISOString();
            db.run("INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, 'admin', ?)", ["Admin Chapada", "admin@chapada.com", hash, now], (e) => {
                if (e)
                    console.error("Erro ao criar admin:", e);
                else
                    console.log("Usuário admin padrão criado (admin@chapada.com / 123456).");
            });
        }
    });
});
function authMiddleware(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Token não informado." });
    }
    const token = auth.slice("Bearer ".length);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch {
        return res.status(401).json({ message: "Token inválido." });
    }
}
function requireAdmin(req, res, next) {
    if (!req.user)
        return res.status(401).json({ message: "Não autenticado." });
    if (req.user.role !== "admin")
        return res.status(403).json({ message: "Apenas administradores." });
    next();
}
// ---------- Rotas de Autenticação ----------
app.post("/api/auth/register", (req, res) => {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
        return res.status(400).json({ message: "Preencha nome, e-mail e senha." });
    }
    const normEmail = String(email).trim().toLowerCase();
    const now = new Date().toISOString();
    const hash = bcryptjs_1.default.hashSync(String(password), 10);
    db.get("SELECT id FROM users WHERE email = ?", [normEmail], (err, row) => {
        if (err)
            return res.status(500).json({ message: "Erro ao acessar banco." });
        if (row)
            return res.status(409).json({ message: "Já existe um usuário com este e-mail." });
        db.run("INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, 'user', ?)", [name, normEmail, hash, now], function (insertErr) {
            if (insertErr)
                return res.status(500).json({ message: "Erro ao criar usuário." });
            const userId = this.lastID;
            const token = jsonwebtoken_1.default.sign({ id: userId, role: "user" }, JWT_SECRET, { expiresIn: "7d" });
            const user = { id: userId, name, email: normEmail, role: "user", createdAt: now };
            return res.status(201).json({ token, user });
        });
    });
});
app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return res.status(400).json({ message: "Informe e-mail e senha." });
    }
    const normEmail = String(email).trim().toLowerCase();
    db.get("SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = ?", [normEmail], (err, row) => {
        if (err)
            return res.status(500).json({ message: "Erro ao acessar banco." });
        if (!row)
            return res.status(401).json({ message: "Credenciais inválidas." });
        const ok = bcryptjs_1.default.compareSync(String(password), row.password_hash);
        if (!ok)
            return res.status(401).json({ message: "Credenciais inválidas." });
        const token = jsonwebtoken_1.default.sign({ id: row.id, role: row.role }, JWT_SECRET, { expiresIn: "7d" });
        const user = {
            id: row.id,
            name: row.name,
            email: row.email,
            role: row.role,
            createdAt: row.created_at
        };
        return res.json({ token, user });
    });
});
app.get("/api/auth/me", authMiddleware, (req, res) => {
    const id = req.user.id;
    db.get("SELECT id, name, email, role, created_at FROM users WHERE id = ?", [id], (err, row) => {
        if (err)
            return res.status(500).json({ message: "Erro ao acessar banco." });
        if (!row)
            return res.status(404).json({ message: "Usuário não encontrado." });
        return res.json({
            id: row.id,
            name: row.name,
            email: row.email,
            role: row.role,
            createdAt: row.created_at
        });
    });
});
// ---------- Admin: usuários ----------
app.get("/api/admin/users", authMiddleware, requireAdmin, (_req, res) => {
    db.all("SELECT id, name, email, role, created_at FROM users ORDER BY name COLLATE NOCASE", [], (err, rows) => {
        if (err)
            return res.status(500).json({ message: "Erro ao listar usuários." });
        return res.json(rows);
    });
});
// ---------- Contatos ----------
app.post("/api/contacts", authMiddleware, (req, res) => {
    const { name, email, phone, message } = req.body || {};
    if (!name || !email || !message) {
        return res.status(400).json({ message: "Preencha nome, e-mail e mensagem." });
    }
    const now = new Date().toISOString();
    const userId = req.user.id;
    db.run("INSERT INTO contacts (user_id, name, email, phone, message, created_at) VALUES (?, ?, ?, ?, ?, ?)", [userId, name, email, phone || "", message, now], function (err) {
        if (err)
            return res.status(500).json({ message: "Erro ao salvar contato." });
        const id = this.lastID;
        return res.status(201).json({ id, userId, name, email, phone, message, createdAt: now });
    });
});
// Admin: listar contatos
app.get("/api/admin/contacts", authMiddleware, requireAdmin, (_req, res) => {
    const sql = `
      SELECT c.id, c.name, c.email, c.phone, c.message, c.created_at,
             u.name as user_name, u.email as user_email
      FROM contacts c
      JOIN users u ON u.id = c.user_id
      ORDER BY c.created_at DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err)
            return res.status(500).json({ message: "Erro ao listar contatos." });
        return res.json(rows);
    });
});
// Admin: apagar contato
app.delete("/api/admin/contacts/:id", authMiddleware, requireAdmin, (req, res) => {
    const id = Number(req.params.id);
    if (!id)
        return res.status(400).json({ message: "ID inválido." });
    db.run("DELETE FROM contacts WHERE id = ?", [id], function (err) {
        if (err)
            return res.status(500).json({ message: "Erro ao apagar contato." });
        if (this.changes === 0)
            return res.status(404).json({ message: "Contato não encontrado." });
        return res.status(204).send();
    });
});
// ---------- Upload de imagem de trilha (apenas admin) ----------
app.post("/api/uploads/trail-image", authMiddleware, requireAdmin, upload.single("image"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado." });
    }
    const relativeUrl = "/uploads/trails/" + req.file.filename;
    return res.status(201).json({ url: relativeUrl });
});
// ---------- Static frontend ----------
app.use(express_1.default.static(publicDir));
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
