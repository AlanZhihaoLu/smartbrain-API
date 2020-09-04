const handleSignin = (req,res,db,bcrypt) => {
    // bcrypt.compare("apples", '$2a$10$v6FAek6yK753YcK9R.eQY.cTpFTn4OiJhIoaGYEhd08npw23ym3rS', function(err, res) {
    //     console.log('first guess', res);
    // });
    // bcrypt.compare("veggies", '$2a$10$v6FAek6yK753YcK9R.eQY.cTpFTn4OiJhIoaGYEhd08npw23ym3rS', function(err, res) {
    //     console.log('second guess', res);
    // });
    if (!req.body.email || !req.body.password) { // check if any of these fields are empty
        return res.status(400).json('incorrect form submission')
    }
    db.select('email','hash').from('login')
        .where('email','=',req.body.email)
        .then(data=>{
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
            if (isValid) {
                return db.select('*').from('users')
                    .where('email', '=', req.body.email)
                    .then(user => {
                        // console.log(user);
                        res.json(user[0])
                    })
                    .catch(err => res.status(400).json('unable to get user'))
            } else {
                return res.status(400).json('wrong credentials')
            }
        })
        .catch(err => res.status(400).json('wrong credentials'))
    // if (req.body.email === database.users[0].email && // checking if the information in the body of the request matches the information in the database
    //     req.body.password === database.users[0].password) {
    //         res.json(database.users[0]); // respond with 'success'
    //     } else {
    //         res.status(400).json('error logging in'); // respond with 400 status code and 'error logging in'
    //     }
    // res.json('signin'); // respond with 'signin'
}

module.exports = {
    handleSignin: handleSignin
}