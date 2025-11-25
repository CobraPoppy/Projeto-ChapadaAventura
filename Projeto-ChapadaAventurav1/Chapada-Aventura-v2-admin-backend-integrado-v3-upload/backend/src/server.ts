import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sqlite3 from "sqlite3";
import multer from "multer";
import fs from "fs";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3333;
const JWT_SECRET = process.env.JWT_SECRET || "chapada-secret-dev";

// Diretórios de arquivos estáticos e uploads
const publicDir = path.join(__dirname, "..", "..", "public");
const uploadsDir = path.join(publicDir, "uploads", "trails");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuração do Multer para upload de imagens
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-]/g, "_");
    const unique = Date.now() + "-" + safeName;
    cb(null, unique);
  }
});
const upload = multer({ storage });

// Banco de dados SQLite
const dbFile = path.join(__dirname, "..", "data", "chapada.db");
sqlite3.verbose();
const db = new sqlite3.Database(dbFile);

// Inicialização das tabelas
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL
    );`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );`
  );

  // Usuário admin padrão
  db.get("SELECT id FROM users WHERE email = ?", ["admin@chapada.com"], (err, row) => {
    if (err) {
      console.error("Erro ao verificar admin:", err);
      return;
    }
    if (!row) {
      const hash = bcrypt.hashSync("123456", 10);
      const now = new Date().toISOString();
      db.run(
        "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, 'admin', ?)",
        ["Admin Chapada", "admin@chapada.com", hash, now],
        (e) => {
          if (e) console.error("Erro ao criar admin:", e);
          else console.log("Usuário admin padrão criado (admin@chapada.com / 123456).");
        }
      );
    }
  });
});

interface JwtPayload {
  id: number;
  role: string;
}

function authMiddleware(req: Request & { user?: JwtPayload }, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token não informado." });
  }
  const token = auth.slice("Bearer ".length);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Token inválido." });
  }
}

function requireAdmin(req: Request & { user?: JwtPayload }, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ message: "Não autenticado." });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Apenas administradores." });
  next();
}

// ---------- Rotas de Autenticação ----------

app.post("/api/auth/register", (req: Request, res: Response) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Preencha nome, e-mail e senha." });
  }
  const normEmail = String(email).trim().toLowerCase();
  const now = new Date().toISOString();
  const hash = bcrypt.hashSync(String(password), 10);

  db.get("SELECT id FROM users WHERE email = ?", [normEmail], (err, row) => {
    if (err) return res.status(500).json({ message: "Erro ao acessar banco." });
    if (row) return res.status(409).json({ message: "Já existe um usuário com este e-mail." });

    db.run(
      "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, 'user', ?)",
      [name, normEmail, hash, now],
      function (insertErr) {
        if (insertErr) return res.status(500).json({ message: "Erro ao criar usuário." });
        const userId = this.lastID as number;
        const token = jwt.sign({ id: userId, role: "user" }, JWT_SECRET, { expiresIn: "7d" });
        const user = { id: userId, name, email: normEmail, role: "user", createdAt: now };
        return res.status(201).json({ token, user });
      }
    );
  });
});

app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Informe e-mail e senha." });
  }
  const normEmail = String(email).trim().toLowerCase();
  db.get(
    "SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = ?",
    [normEmail],
    (err, row: any) => {
      if (err) return res.status(500).json({ message: "Erro ao acessar banco." });
      if (!row) return res.status(401).json({ message: "Credenciais inválidas." });
      const ok = bcrypt.compareSync(String(password), row.password_hash);
      if (!ok) return res.status(401).json({ message: "Credenciais inválidas." });
      const token = jwt.sign({ id: row.id, role: row.role }, JWT_SECRET, { expiresIn: "7d" });
      const user = {
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        createdAt: row.created_at
      };
      return res.json({ token, user });
    }
  );
});

app.get("/api/auth/me", authMiddleware, (req: Request & { user?: JwtPayload }, res: Response) => {
  const id = req.user!.id;
  db.get(
    "SELECT id, name, email, role, created_at FROM users WHERE id = ?",
    [id],
    (err, row: any) => {
      if (err) return res.status(500).json({ message: "Erro ao acessar banco." });
      if (!row) return res.status(404).json({ message: "Usuário não encontrado." });
      return res.json({
        id: row.id,
        name: row.name,
        email: row.email,
        role: row.role,
        createdAt: row.created_at
      });
    }
  );
});

// ---------- Admin: usuários ----------

app.get(
  "/api/admin/users",
  authMiddleware,
  requireAdmin,
  (_req: Request & { user?: JwtPayload }, res: Response) => {
    db.all(
      "SELECT id, name, email, role, created_at FROM users ORDER BY name COLLATE NOCASE",
      [],
      (err, rows) => {
        if (err) return res.status(500).json({ message: "Erro ao listar usuários." });
        return res.json(rows);
      }
    );
  }
);

// ---------- Contatos ----------

app.post(
  "/api/contacts",
  authMiddleware,
  (req: Request & { user?: JwtPayload }, res: Response) => {
    const { name, email, phone, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ message: "Preencha nome, e-mail e mensagem." });
    }
    const now = new Date().toISOString();
    const userId = req.user!.id;
    db.run(
      "INSERT INTO contacts (user_id, name, email, phone, message, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, name, email, phone || "", message, now],
      function (err) {
        if (err) return res.status(500).json({ message: "Erro ao salvar contato." });
        const id = this.lastID as number;
        return res.status(201).json({ id, userId, name, email, phone, message, createdAt: now });
      }
    );
  }
);

// Admin: listar contatos
app.get(
  "/api/admin/contacts",
  authMiddleware,
  requireAdmin,
  (_req: Request & { user?: JwtPayload }, res: Response) => {
    const sql = `
      SELECT c.id, c.name, c.email, c.phone, c.message, c.created_at,
             u.name as user_name, u.email as user_email
      FROM contacts c
      JOIN users u ON u.id = c.user_id
      ORDER BY c.created_at DESC
    `;
    db.all(sql, [], (err, rows) => {
      if (err) return res.status(500).json({ message: "Erro ao listar contatos." });
      return res.json(rows);
    });
  }
);

// Admin: apagar contato
app.delete(
  "/api/admin/contacts/:id",
  authMiddleware,
  requireAdmin,
  (req: Request & { user?: JwtPayload }, res: Response) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "ID inválido." });
    db.run("DELETE FROM contacts WHERE id = ?", [id], function (err) {
      if (err) return res.status(500).json({ message: "Erro ao apagar contato." });
      if (this.changes === 0) return res.status(404).json({ message: "Contato não encontrado." });
      return res.status(204).send();
    });
  }
);

// ---------- Upload de imagem de trilha (apenas admin) ----------

app.post(
  "/api/uploads/trail-image",
  authMiddleware,
  requireAdmin,
  upload.single("image"),
  (req: Request & { file?: Express.Multer.File }, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ message: "Nenhum arquivo enviado." });
    }
    const relativeUrl = "/uploads/trails/" + req.file.filename;
    return res.status(201).json({ url: relativeUrl });
  }
);

// ---------- Static frontend ----------

app.use(express.static(publicDir));

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
