const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')
const PORT = process.env.PORT || 3001
app.use(cors())
app.use(express.json())
app.use(express.static('dist'))
app.use(morgan('tiny'))

// Defining a custom token for morgan to log the request body for POST requests
morgan.token('req-body', (req) => {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return ''
})

// Middleware for logging with custom format
app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :req-body'
  )
)

// let persons = [
//   {
//     id: 1,
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: 2,
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: 3,
//     name: "Dan Abramov",
//     number: "12-43-234345",
//   },
//   {
//     id: 4,
//     name: "Mary Poppendieck",
//     number: "39-23-6423122",
//   },
// ];

// // Getting all persons
app.get('/api/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

// Getting person info
// Info Route: Show total count & date
app.get('/info', async (req, res) => {
  try {
    const count = await Person.countDocuments() // Get count from MongoDB
    res.send(`Phonebook has info for ${count} people. <br><br> ${new Date()}`)
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Database error' })
  }
})

// Get a Single Person by ID
app.get('/api/persons/:id', async (req, res, next) => {
  try {
    const person = await Person.findById(req.params.id)

    if (!person) {
      return res.status(404).send(`Person with id: ${req.params.id} NOT FOUND!`)
    }

    res.json(person)
  } catch (error) {
    next(error) // Passes errors to the middleware
  }
})


// // function to generate a random value for each new entry
// const generatedId = () => {
//   const maxId =
//     persons.length > 0 ? Math.floor(Math.random() * (200 - 5 + 1) + 5) : 0;
//   return maxId + 1;
// };

// // creating a new entry from the user
app.post('/api/persons', async (req, res, next) => {
  const { name, number } = req.body

  if (!name || !number) {
    return res.status(400).json({ error: 'Name or number missing' })
  }

  const person = new Person({ name, number })

  try {
    const savedPerson = await person.save()
    res.status(201).json(savedPerson)
  } catch (error) {
    next(error)
  }
})

app.put('/api/persons/:id', (req, res, next) => {
  const { id } = req.params
  const { number } = req.body

  Person.findByIdAndUpdate(
    id,
    { number },
    { new: true, runValidators: true, context: 'query' } // Ensure validation runs
  )
    .then((updatedPerson) => {
      if (updatedPerson) {
        res.json(updatedPerson)
      } else {
        res.status(404).end() // Return 404 if the person is not found
      }
    })
    .catch((error) => next(error)) // Pass errors to the error handler
})


app.delete('/api/persons/:id', async (req, res, next) => {
  try {
    const deletedPerson = await Person.findByIdAndDelete(req.params.id)

    if (!deletedPerson) {
      return res.status(404).json({ error: 'Person not found' })
    }

    res.status(204).end() // No Content response
  } catch (error) {
    next(error)
  }
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})