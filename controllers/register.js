const handleRegister = (req,res, db, bcrypt) => {
    const { email, name, password } = req.body;
    if (!email || !name || !password) { // check if any of these fields are empty
        return res.status(400).json('incorrect form submission')
    }
    var salt = bcrypt.genSaltSync(10); // synchronous version
    var hash = bcrypt.hashSync(password, salt);
        // Transactions are wrappers such that if one aspect of the transaction fails, the whole transaction fails
        // This ensures that there won't be any disparities between users and login tables, since we should be updating them at the same time 
        db.transaction(trx=>{ // Use trx instead of db object to do actions within transaction
            trx.insert({
                hash: hash,
                email: email
            })
            .into('login') // This is equivalent to writing db('login')
            .returning('email')
            .then(loginEmail=>{
                return trx('users')
                    .returning('*') // Return all fields, knex.js method
                    .insert({ // This is a promise
                        email: loginEmail[0],
                        name: name,
                        joined: new Date()
                    })
                    .then(user => {
                        res.json(user[0]);
                    })
                })
                .then(trx.commit) // If all of this transaction succeeds, then commit
                .catch(trx.rollback) // If not all of this transation succeeds, then rollback
            }) 
//     bcrypt.genSalt(10, function(err, salt) {
//         bcrypt.hash(password, salt, function(err, hash) {
//         console.log(hash);
//     });
// });
    // database.users.push({
    //     id: '125',
    //     name: name,
    //     email: email,
    //     password: password,
    //     entries: 0,
    //     joined: new Date()
    // })
    .catch(err => res.status(400).json('unable to register'));
    // res.json(database.users[database.users.length - 1]) // REMEMBER TO SEND A RESPONSE, OR THE TRANSACTION WILL NEVER END
}

module.exports = {
    handleRegister: handleRegister
}