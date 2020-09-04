const express = require('express');
const bcrypt = require('bcryptjs');
const cors = require('cors'); // Needed to enable CORS
// Use knex.js to have a server connect to a database 
// To do so, run npm install knex (for knex.js) and npm install pg (for postgres)
const knex = require('knex'); // Check documentation for help at any point
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const image = require('./controllers/image');

const db = knex({
    client: 'pg', // client is postgres
    connection: {
      host : '127.0.0.1',
      user : 'alanzhihaolu',
      password : '',
      database : 'smart-brain'
    }
  });

// db.select('*').from('users') // This returns a promise
// .then(data => console.log(data));

const app = express();

app.use(express.json()); // REMEMBER TO HAVE THE APP PARSE THE REQUEST IN JSON, WHENEVER A REQUEST COMES IN
app.use(cors()) // ENABLE CORS

// const database = { // makeshift database, for now
//     // This is not that useful, for now, because the data does not persist (every time the server restarts, all of the new info that's added gets wiped)
//     users: [
//         {
//             id: '123',
//             name: 'John',
//             email: 'john@gmail.com',
//             password: 'cookies', // In real life, you would NEVER store passwords as plain text. 
//             // Instead, we would store passwords in hashes
//             entries: 0,
//             joined: new Date()
//         },
//         {
//             id: '124',
//             name: 'Sally',
//             email: 'sally@gmail.com',
//             password: 'bananas',
//             entries: 0,
//             joined: new Date()
//         }
//     ]
// }

// THE PLAN:
// '/' --> GET
// '/signin' --> POST = success/fail
// '/register' --> POST = user
// '/profile/:userId' --> GET = user
// '/image' --> PUT = [update user score] 

app.get('/', (req,res) => {
    db.select('*').from('users')
    .then(data => {
        res.json(data);
    })
    // res.json(database.users); // use .json to send json strings
})

app.post('/signin', (req,res) => {signin.handleSignin(req, res, db, bcrypt)})

app.post('/register', (req, res) => {register.handleRegister(req, res, db, bcrypt)})

app.get('/profile/:id', (req,res) => { // This format means that id is provided as a parameter, not in the body or in some other place in the request
    const { id } = req.params; 
    // let found = false;
    db.select('*').from('users') // Problem: if invalid id value, will still return an empty array
        .where({
            id: id
        })
        .then(user => {
            if (user.length) { // Solution: check against empty array 
            res.json(user[0]);
            } else {
                res.status(400).json('Not found')
            }
        })
        .catch(err => res.status(400).json('error getting user'))
    // database.users.forEach(user => {
    //     if (user.id === id) {
    //         found = true;
    //         return res.json(user);
    //     } 
    // })
    // if (!found) {
    //     res.status(404).json('no such user'); // status code 404 not found
    // }
}) 

app.put('/image', (req,res) => {image.handleImage(req,res,db)})
app.post('/imageurl', (req,res) => {image.handleAPICall(req,res)})

app.listen(3000, ()=>{ // We can have a second function parameter in .listen(), which will run once the listen happens
    console.log('app is running on port 3000')
})
