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
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );`
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trail_slug TEXT NOT NULL,
      trail_name TEXT NOT NULL,
      date TEXT NOT NULL,
      time_slot TEXT,
      people_count INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone TEXT,
      message TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
    );`
  );

  db.run(
    `CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trail_slug TEXT NOT NULL,
      trail_name TEXT NOT NULL,
      rating INTEGER NOT NULL,
      author_name TEXT NOT NULL,
      author_email TEXT,
      comment TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL
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
        "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)",
        ["Administrador", "admin@chapada.com", hash, "admin", now],
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

  const now = new Date().toISOString();
  const hash = bcrypt.hashSync(password, 10);

  db.run(
    "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)",
    [name, email, hash, "user", now],
    function (err) {
      if (err) {
        if (err.message && err.message.includes("UNIQUE")) {
          return res.status(400).json({ message: "Já existe um usuário com este e-mail." });
        }
        console.error("Erro ao registrar usuário:", err);
        return res.status(500).json({ message: "Erro ao registrar usuário." });
      }

      const id = this.lastID as number;
      const payload: JwtPayload = { id, role: "user" };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

      return res.status(201).json({
        token,
        user: {
          id,
          name,
          email,
          role: "user",
          createdAt: now
        }
      });
    }
  );
});

app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: "Informe e-mail e senha." });
  }

  db.get(
    "SELECT id, name, email, password_hash, role, created_at FROM users WHERE email = ?",
    [email],
    (err, row: any) => {
      if (err) {
        console.error("Erro ao buscar usuário:", err);
        return res.status(500).json({ message: "Erro ao fazer login." });
      }
      if (!row) {
        return res.status(401).json({ message: "E-mail ou senha inválidos." });
      }

      const ok = bcrypt.compareSync(password, row.password_hash);
      if (!ok) {
        return res.status(401).json({ message: "E-mail ou senha inválidos." });
      }

      const payload: JwtPayload = { id: row.id, role: row.role };
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

      return res.json({
        token,
        user: {
          id: row.id,
          name: row.name,
          email: row.email,
          role: row.role,
          createdAt: row.created_at
        }
      });
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
        if (err) {
          console.error("Erro ao listar usuários:", err);
          return res.status(500).json({ message: "Erro ao listar usuários." });
        }
        return res.json(rows);
      }
    );
  }
);

// ---------- Contatos ----------

// Contato público (visitante do site)
app.post("/api/contacts", (req: Request, res: Response) => {
  const { name, email, phone, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ message: "Preencha nome, e-mail e mensagem." });
  }

  const now = new Date().toISOString();

  db.run(
    "INSERT INTO contacts (name, email, phone, message, created_at) VALUES (?, ?, ?, ?, ?)",
    [name, email, phone || "", message, now],
    function (err) {
      if (err) {
        console.error("Erro ao salvar contato:", err);
        return res.status(500).json({ message: "Erro ao salvar contato." });
      }
      const id = this.lastID as number;
      return res.status(201).json({ id, name, email, phone, message, createdAt: now });
    }
  );
});

// Admin: listar contatos (sem vínculo com usuário logado)
app.get(
  "/api/admin/contacts",
  authMiddleware,
  requireAdmin,
  (_req: Request & { user?: JwtPayload }, res: Response) => {
    const sql = `
      SELECT
        id,
        name,
        email,
        phone,
        message,
        created_at
      FROM contacts
      ORDER BY created_at DESC
    `;
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error("Erro ao listar contatos:", err);
        return res.status(500).json({ message: "Erro ao listar contatos." });
      }
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


// ---------- Avaliações de trilhas ----------

// Visitante envia avaliação
app.post("/api/reviews", (req: Request, res: Response) => {
  const {
    trailSlug,
    trailName,
    rating,
    authorName,
    authorEmail,
    comment
  } = req.body || {};

  const numericRating = Number(rating);

  if (!trailSlug || !trailName || !authorName || !numericRating || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ message: "Preencha os campos obrigatórios da avaliação (trilha, nome e nota de 1 a 5)." });
  }

  const now = new Date().toISOString();

  db.run(
    `INSERT INTO reviews
      (trail_slug, trail_name, rating, author_name, author_email, comment, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      trailSlug,
      trailName,
      numericRating,
      authorName,
      authorEmail || "",
      comment || "",
      "pending",
      now
    ],
    function (err) {
      if (err) {
        console.error("Erro ao salvar avaliação:", err);
        return res.status(500).json({ message: "Erro ao salvar avaliação." });
      }

      const id = this.lastID as number;
      return res.status(201).json({
        id,
        trailSlug,
        trailName,
        rating: numericRating,
        authorName,
        authorEmail: authorEmail || "",
        comment: comment || "",
        status: "pending",
        createdAt: now
      });
    }
  );
});

// Listar avaliações aprovadas de uma trilha (público)
app.get("/api/reviews", (req: Request, res: Response) => {
  const slug = (req.query.slug as string) || "";
  if (!slug) {
    return res.status(400).json({ message: "Informe o slug da trilha (parâmetro slug)." });
  }

  const sql = `
    SELECT
      id,
      trail_slug,
      trail_name,
      rating,
      author_name,
      author_email,
      comment,
      status,
      created_at
    FROM reviews
    WHERE trail_slug = ? AND status = 'approved'
    ORDER BY created_at DESC
  `;

  db.all(sql, [slug], (err, rows) => {
    if (err) {
      console.error("Erro ao listar avaliações:", err);
      return res.status(500).json({ message: "Erro ao listar avaliações." });
    }

    // Calcula média e contagem
    const count = rows.length;
    const avg =
      count === 0
        ? 0
        : rows.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / count;

    return res.json({
      reviews: rows,
      stats: {
        count,
        average: avg
      }
    });
  });
});

// Listar avaliações (admin)
app.get(
  "/api/admin/reviews",
  authMiddleware,
  requireAdmin,
  (_req: Request & { user?: JwtPayload }, res: Response) => {
    const sql = `
      SELECT
        id,
        trail_slug,
        trail_name,
        rating,
        author_name,
        author_email,
        comment,
        status,
        created_at
      FROM reviews
      ORDER BY created_at DESC
    `;
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error("Erro ao listar avaliações:", err);
        return res.status(500).json({ message: "Erro ao listar avaliações." });
      }
      return res.json(rows);
    });
  }
);

// Atualizar status da avaliação (admin)
app.patch(
  "/api/admin/reviews/:id",
  authMiddleware,
  requireAdmin,
  (req: Request & { user?: JwtPayload }, res: Response) => {
    const id = Number(req.params.id);
    const { status } = req.body || {};

    if (!id) return res.status(400).json({ message: "ID inválido." });
    if (!status || !["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status inválido." });
    }

    db.run("UPDATE reviews SET status = ? WHERE id = ?", [status, id], function (err) {
      if (err) {
        console.error("Erro ao atualizar avaliação:", err);
        return res.status(500).json({ message: "Erro ao atualizar avaliação." });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: "Avaliação não encontrada." });
      }
      return res.status(200).json({ id, status });
    });
  }
);

// Apagar avaliação (admin)
app.delete(
  "/api/admin/reviews/:id",
  authMiddleware,
  requireAdmin,
  (req: Request & { user?: JwtPayload }, res: Response) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "ID inválido." });
    db.run("DELETE FROM reviews WHERE id = ?", [id], function (err) {
      if (err) {
        console.error("Erro ao apagar avaliação:", err);
        return res.status(500).json({ message: "Erro ao apagar avaliação." });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: "Avaliação não encontrada." });
      }
      return res.status(204).send();
    });
  }
);



// ---------- Agendamentos de trilhas ----------

// Visitante agenda uma trilha
app.post("/api/bookings", (req: Request, res: Response) => {
  const {
    trailSlug,
    trailName,
    date,
    timeSlot,
    peopleCount,
    customerName,
    customerEmail,
    customerPhone,
    message
  } = req.body || {};

  if (!trailSlug || !trailName || !date || !peopleCount || !customerName || !customerEmail) {
    return res.status(400).json({ message: "Preencha os campos obrigatórios do agendamento." });
  }

  const now = new Date().toISOString();

  db.run(
    `INSERT INTO bookings
      (trail_slug, trail_name, date, time_slot, people_count, customer_name, customer_email, customer_phone, message, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      trailSlug,
      trailName,
      date,
      timeSlot || "",
      Number(peopleCount) || 1,
      customerName,
      customerEmail,
      customerPhone || "",
      message || "",
      "pending",
      now
    ],
    function (err) {
      if (err) {
        console.error("Erro ao salvar agendamento:", err);
        return res.status(500).json({ message: "Erro ao salvar agendamento." });
      }

      const id = this.lastID as number;
      return res.status(201).json({
        id,
        trailSlug,
        trailName,
        date,
        timeSlot: timeSlot || "",
        peopleCount: Number(peopleCount) || 1,
        customerName,
        customerEmail,
        customerPhone: customerPhone || "",
        message: message || "",
        status: "pending",
        createdAt: now
      });
    }
  );
});

// Listar agendamentos (apenas admin)
app.get(
  "/api/admin/bookings",
  authMiddleware,
  requireAdmin,
  (_req: Request & { user?: JwtPayload }, res: Response) => {
    const sql = `
      SELECT
        id,
        trail_slug,
        trail_name,
        date,
        time_slot,
        people_count,
        customer_name,
        customer_email,
        customer_phone,
        message,
        status,
        created_at
      FROM bookings
      ORDER BY date ASC, created_at DESC
    `;
    db.all(sql, [], (err, rows) => {
      if (err) {
        console.error("Erro ao listar agendamentos:", err);
        return res.status(500).json({ message: "Erro ao listar agendamentos." });
      }
      return res.json(rows);
    });
  }
);

// Atualizar status do agendamento (apenas admin)
app.patch(
  "/api/admin/bookings/:id",
  authMiddleware,
  requireAdmin,
  (req: Request & { user?: JwtPayload }, res: Response) => {
    const id = Number(req.params.id);
    const { status } = req.body || {};

    if (!id) return res.status(400).json({ message: "ID inválido." });
    if (!status || !["pending", "confirmed", "cancelled"].includes(status)) {
      return res.status(400).json({ message: "Status inválido." });
    }

    db.run("UPDATE bookings SET status = ? WHERE id = ?", [status, id], function (err) {
      if (err) {
        console.error("Erro ao atualizar agendamento:", err);
        return res.status(500).json({ message: "Erro ao atualizar agendamento." });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: "Agendamento não encontrado." });
      }
      return res.status(200).json({ id, status });
    });
  }
);

// Apagar agendamento (apenas admin)
app.delete(
  "/api/admin/bookings/:id",
  authMiddleware,
  requireAdmin,
  (req: Request & { user?: JwtPayload }, res: Response) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: "ID inválido." });
    db.run("DELETE FROM bookings WHERE id = ?", [id], function (err) {
      if (err) {
        console.error("Erro ao apagar agendamento:", err);
        return res.status(500).json({ message: "Erro ao apagar agendamento." });
      }
      if (this.changes === 0) {
        return res.status(404).json({ message: "Agendamento não encontrado." });
      }
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
