const mongoose = require('mongoose')

// Validate arguments
if (process.argv.length < 3) {
  console.log('Usage: node mongo.js <password> [name] [number]')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

// ✅ Use your full MongoDB URI with dynamic password
const url = `mongodb+srv://boscojoseph79:${password}@cluster0.sqq1g.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error.message)
    process.exit(1)
  })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

// ✅ If name and number are provided → add new person
if (name && number) {
  const person = new Person({ name, number })

  person.save()
    .then(() => {
      console.log(`added ${name} number ${number} to phonebook`)
      return mongoose.connection.close()
    })
    .catch(err => {
      console.error('Error saving to MongoDB:', err.message)
      mongoose.connection.close()
    })

} else {
  // ✅ If only password is provided → list all persons
  Person.find({})
    .then(persons => {
      console.log('phonebook:')
      persons.forEach(p => {
        console.log(`${p.name} ${p.number}`)
      })
      mongoose.connection.close()
    })
    .catch(err => {
      console.error('Error fetching from MongoDB:', err.message)
      mongoose.connection.close()
    })
}
