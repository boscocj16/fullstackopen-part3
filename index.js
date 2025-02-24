const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors()); 

morgan.token('body', (req) => req.method === 'POST' ? JSON.stringify(req.body) : '');

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

let persons = [
    { id: 1, name: "Arto Hellas", number: "040-123456" },
    { id: 2, name: "Ada Lovelace", number: "39-44-5323523" },
    { id: 3, name: "Dan Abramov", number: "12-43-234345" },
    { id: 4, name: "Mary Poppendieck", number: "39-23-6423122" }
];

app.get('/api/persons', (req, res) => {
    res.json(persons);
});

app.get('/info', (req, res) => {
    const currentTime = new Date();
    res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${currentTime}</p>`);
});

app.get('/api/persons/:id', (req, res) => {
    const person = persons.find(p => p.id === Number(req.params.id));
    person ? res.json(person) : res.status(404).json({ error: "Person not found" });
});

app.post('/api/persons', (req, res) => {
    const { name, number } = req.body;

    if (!name || !number) {
        return res.status(400).json({ error: "Name and number are required" });
    }

    if (persons.some(person => person.name === name)) {
        return res.status(400).json({ error: "Name must be unique" });
    }

    const newPerson = {
        id: Math.floor(Math.random() * 1000000),
        name,
        number
    };

    persons.push(newPerson);
    res.status(201).json(newPerson);
});

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    const initialLength = persons.length;
    persons = persons.filter(person => person.id !== id);

    persons.length < initialLength ? res.status(204).end() : res.status(404).json({ error: "Person not found" });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
