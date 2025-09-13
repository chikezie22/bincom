import express from 'express';
import mysql from 'mysql2';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// connect to DB
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    console.error('DB connection failed:', err);
    return;
  }
  console.log('✅ MySQL connected');
});

// === ROUTES ===

// Q1: Get polling unit results
app.get('/api/polling-unit/:id', (req, res) => {
  const { id } = req.params;
  db.query(
    'SELECT party_abbreviation, party_score FROM announced_pu_results WHERE polling_unit_uniqueid = ?',
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// Q2: Get LGA results
app.get('/api/lga/:id', (req, res) => {
  const { id } = req.params;
  db.query(
    `SELECT party_abbreviation, SUM(party_score) as total_score 
     FROM announced_pu_results apr
     JOIN polling_unit pu ON apr.polling_unit_uniqueid = pu.uniqueid
     WHERE pu.lga_id = ?
     GROUP BY party_abbreviation`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    }
  );
});

// Q3: Insert new polling unit result
app.post('/api/polling-unit', (req, res) => {
  const { polling_unit_uniqueid, party_abbreviation, party_score } = req.body;
  db.query(
    'INSERT INTO announced_pu_results (polling_unit_uniqueid, party_abbreviation, party_score) VALUES (?, ?, ?)',
    [polling_unit_uniqueid, party_abbreviation, party_score],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Inserted successfully', id: result.insertId });
    }
  );
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
