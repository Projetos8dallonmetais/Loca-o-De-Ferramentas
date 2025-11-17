require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const bcrypt = require('bcrypt');
const { randomUUID } = require('crypto');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3001;

// --- Middlewares ---
app.use(cors());
app.use(express.json());
// Servir arquivos estáticos da pasta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// --- Configuração do Multer para Upload de Arquivos ---
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });


// --- Funções Auxiliares ---
const mapDbToApi = (r) => ({
    id: r.id,
    supplier: r.supplier,
    description: r.description,
    sector: r.sector,
    dailyRate: parseFloat(r.daily_rate),
    weeklyRate: parseFloat(r.weekly_rate),
    monthlyRate: parseFloat(r.monthly_rate),
    rateOption: r.rate_option,
    rentalDate: new Date(r.rental_date).toISOString().split('T')[0],
    returnDate: r.return_date ? new Date(r.return_date).toISOString().split('T')[0] : undefined,
    project: r.project,
    requester: r.requester,
    usageType: r.usage_type,
    receiptName: r.receipt_name,
    receiptUrl: r.receipt_path ? `/uploads/${path.basename(r.receipt_path)}` : undefined,
    observations: r.observations,
    status: r.status,
});

// --- Rotas da API ---

// Rota de teste
app.get('/api', (req, res) => {
  res.send('API do Sistema de Controle de Locação funcionando!');
});

// === ROTAS DE LOCAÇÕES (RENTALS) ===

// GET /api/rentals - Listar todas as locações
app.get('/api/rentals', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM rentals ORDER BY rental_date DESC');
    res.json(rows.map(mapDbToApi));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar locações.' });
  }
});

// POST /api/rentals - Criar nova locação
app.post('/api/rentals', upload.single('receipt'), async (req, res) => {
    const {
        supplier, description, sector, dailyRate, weeklyRate, monthlyRate,
        rateOption, rentalDate, returnDate, project, requester, usageType, observations
    } = req.body;

    const status = returnDate ? 'devolvido' : 'alugado';
    const newId = randomUUID();
    const receiptName = req.file ? req.file.originalname : null;
    const receiptPath = req.file ? req.file.path : null;

    try {
        const query = `
            INSERT INTO rentals(id, supplier, description, sector, daily_rate, weekly_rate, monthly_rate, rate_option, rental_date, return_date, project, requester, usage_type, receipt_name, receipt_path, observations, status)
            VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING *;
        `;
        const values = [
            newId, supplier, description, sector, dailyRate, weeklyRate, monthlyRate,
            rateOption, rentalDate, returnDate || null, project, requester, usageType,
            receiptName, receiptPath, observations, status
        ];
        
        const { rows } = await db.query(query, values);
        res.status(201).json(mapDbToApi(rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao salvar locação.' });
    }
});


// PUT /api/rentals/:id - Atualizar uma locação
app.put('/api/rentals/:id', upload.single('receipt'), async (req, res) => {
    const { id } = req.params;
    const {
        supplier, description, sector, dailyRate, weeklyRate, monthlyRate,
        rateOption, rentalDate, returnDate, project, requester, usageType, observations
    } = req.body;
     
    try {
        const { rows: existingRows } = await db.query('SELECT receipt_path, receipt_name FROM rentals WHERE id = $1', [id]);
        if (existingRows.length === 0) {
            return res.status(404).json({ error: 'Locação não encontrada.' });
        }

        const status = returnDate ? 'devolvido' : 'alugado';
        const receiptName = req.file ? req.file.originalname : (req.body.receiptName || existingRows[0].receipt_name);
        const receiptPath = req.file ? req.file.path : existingRows[0].receipt_path;

        const query = `
            UPDATE rentals
            SET supplier = $1, description = $2, sector = $3, daily_rate = $4, weekly_rate = $5, monthly_rate = $6, rate_option = $7, rental_date = $8, return_date = $9, project = $10, requester = $11, usage_type = $12, observations = $13, status = $14, receipt_name = $15, receipt_path = $16
            WHERE id = $17
            RETURNING *;
        `;
        const values = [
            supplier, description, sector, dailyRate, weeklyRate, monthlyRate,
            rateOption, rentalDate, returnDate || null, project, requester, usageType, observations, status,
            receiptName, receiptPath, id
        ];

        const { rows } = await db.query(query, values);
        res.json(mapDbToApi(rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar locação.' });
    }
});

// POST /api/rentals/:id/toggle-status - Mudar status de uma locação
app.post('/api/rentals/:id/toggle-status', async (req, res) => {
    const { id } = req.params;
    try {
        const { rows: currentRentalRows } = await db.query('SELECT status FROM rentals WHERE id = $1', [id]);
        if (currentRentalRows.length === 0) {
            return res.status(404).json({ error: 'Locação não encontrada.' });
        }
        
        const isReturning = currentRentalRows[0].status === 'alugado';
        const newStatus = isReturning ? 'devolvido' : 'alugado';
        const newReturnDate = isReturning ? new Date().toISOString().split('T')[0] : null;

        const { rows } = await db.query(
            'UPDATE rentals SET status = $1, return_date = $2 WHERE id = $3 RETURNING *',
            [newStatus, newReturnDate, id]
        );
        res.json(mapDbToApi(rows[0]));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar status da locação.' });
    }
});

// DELETE /api/rentals/:id - Deletar locação
app.delete('/api/rentals/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const { rowCount } = await db.query('DELETE FROM rentals WHERE id = $1', [id]);
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Locação não encontrada.' });
        }
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao deletar locação.' });
    }
});


// === ROTAS DE USUÁRIOS (USERS) ===

// POST /api/login - Autenticar usuário
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Email ou senha inválidos.' });
        }
        const user = rows[0];
        const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordMatch) {
            return res.status(401).json({ error: 'Email ou senha inválidos.' });
        }
        res.json({ email: user.email, role: user.role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// GET /api/users - Listar todos os usuários
app.get('/api/users', async (req, res) => {
    try {
        const { rows } = await db.query('SELECT email, role FROM users ORDER BY email ASC');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar usuários.' });
    }
});

// POST /api/users - Adicionar novo usuário
app.post('/api/users', async (req, res) => {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
        return res.status(400).json({ error: 'Email, senha e nível de acesso são obrigatórios.' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        const { rows } = await db.query(
            'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING email, role',
            [email, passwordHash, role]
        );
        res.status(201).json(rows[0]);
    } catch (err) {
        if (err.code === '23505') { // unique_violation
            return res.status(409).json({ error: 'Este email já está cadastrado.' });
        }
        console.error(err);
        res.status(500).json({ error: 'Erro ao criar usuário.' });
    }
});

// DELETE /api/users/:email - Deletar usuário
app.delete('/api/users/:email', async (req, res) => {
    const email = decodeURIComponent(req.params.email);
    try {
        const { rowCount } = await db.query('DELETE FROM users WHERE email = $1', [email]);
        if (rowCount === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao deletar usuário.' });
    }
});

// --- Iniciar o Servidor ---
app.listen(port, () => {
  console.log(`Servidor backend iniciado com sucesso.`);
  console.log(`Acessível em: http://localhost:${port}`);
});
