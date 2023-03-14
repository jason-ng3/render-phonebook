const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('dist'));

morgan.token('content', (request, response) => JSON.stringify(request.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content'));

let persons = [
  { 
    "id": 1,
    "name": "Arto Hellas", 
    "number": "040-123456"
  },
  { 
    "id": 2,
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
  },
  { 
    "id": 3,
    "name": "Dan Abramov", 
    "number": "12-43-234345"
  },
  { 
    "id": 4,
    "name": "Mary Poppendieck", 
    "number": "39-23-6423122"
  }
];

const requestTime = (request, response, next) => {
  request.requestTime = new Date(Date.now()).toString();
  next();
};

app.use(requestTime);

app.get('/api/persons', (request, response) => {
  response.json(persons);
});

app.get('/info', (request, response) => {
  let responseText = `<p>Phonebook has info for ${persons.length} people</p>` +
                     `<p>${request.requestTime}</p>`;
  response.send(responseText);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find(person => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id);

  if (person) {
    persons = persons.filter(person => person.id !== id)
  }

  response.status(204).end()
})

const newId = () => {
  return Math.floor(Math.random() * Math.floor(Math.random() * Date.now()));
};

app.post('/api/persons', (request, response) => {
  morgan.token('content', function (req, res) { return req.body });
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing'
    });
  }

  if (persons.find(person => person.number === body.number)) {
    return response.status(400).json({
      error: 'number already in phonebook'
    });
  }

  const person = {
    id: newId(),
    name: body.name,
    number: body.number,
  }

  persons = persons.concat(person)
  response.json(person);
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const PORT = 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


