// Importă modulele necesare pentru crearea serverului și gestionarea bazei de date
const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Configurează și conectează baza de date SQLite utilizând Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'notes.db',
});

// Definește modelul pentru tabela Note în baza de date
const Note = sequelize.define('Note', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true,
  }
});

// Funcție pentru a sincroniza sau a crea baza de date
const initializeDatabase = async () => {
  await sequelize.sync({ alter: true });
};

// Inițializează baza de date la pornirea serverului
initializeDatabase();

// Creează o aplicație Express
const app = express();

// Setează directorul pentru fișierele statice
app.use(express.static('public'));

// Permite aplicației să parseze JSON din corpul cererii
app.use(express.json());

// Endpoint pentru a obține toate notele
app.get('/notes', async (req, res) => {
  try {
    const notes = await Note.findAll();
    res.status(200).json(notes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint pentru adăugarea unei noi note
app.post('/notes', async (req, res) => {
  try {
    const { title, content, category, status } = req.body;
    const note = await Note.create({ title, content, category, status});
    res.status(201).json(note);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint pentru a obține o notă după ID
app.get('/notes/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (note) {
      res.status(200).json({
        id: note.id,
        title: note.title,
        content: note.content,
        category: note.category,
        status: note.status,  
      });
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint pentru a edita o notă după ID
app.put('/notes/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (note) {
      const { title, content, category, status } = req.body;
      await note.update({ title, content, category, status });
      res.status(200).json(note);
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Endpoint pentru a șterge o notă după ID
app.delete('/notes/:id', async (req, res) => {
  try {
    const note = await Note.findByPk(req.params.id);
    if (note) {
      await note.destroy();
      res.status(204).json({ message: 'Deleted' });
    } else {
      res.status(404).json({ message: 'Not found' });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Configurare port și pornirea serverului
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
