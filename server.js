const express = require('express');
const app = express();
app.use(express.json());
const path = require('path');
const db = require('./db');
const { User } = db.models;



app.use(require('express-session')({
  secret: process.env.SECRET || "SECRETCODE"
}));

const port = process.env.PORT || 3000;
db.syncAndSeed()
  .then(()=> app.listen(port, ()=> console.log(`listening on port ${port}`)));


app.use('/dist', express.static(path.join(__dirname, 'dist')));

app.post('/api/sessions', (req, res, next)=> {
  User.findOne({
    where: {
      email: req.body.email,
      password: req.body.password
    }
  })
  .then( user => {
    if(!user){
      throw ({ status: 401 });
    }
    req.session.user = user;
    return res.send(user);
  })
  .catch( err => next(err));
});

app.get('/api/sessions', (req, res, next)=> {
  const user = req.session.user;
  if(user){
    return res.send(user);
  }
  next({ status: 401 });
});

app.delete('/api/sessions', (req, res, next)=> {
  req.session.destroy();
  res.sendStatus(204);
});

app.get('/', (req, res, next)=> {
  res.sendFile(path.join(__dirname, 'index.html'));
});

