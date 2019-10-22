const express = require('express');
const app = express();
app.use(express.json());
const path = require('path');

app.use(require('express-session')({
  secret: process.env.SECRET
}));
const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log(`listening on port ${port}`));

const users = {
  moe: {
    id: 1,
    name: 'moe',
    favoriteWord: 'foo'
  },
  lucy: {
    id: 2,
    name: 'lucy',
    favoriteWord: 'bar'
  }
};

app.use('/dist', express.static(path.join(__dirname, 'dist')));

app.post('/api/sessions', (req, res, next)=> {
  const user = users[req.body.username];
  if(user){
    req.session.user = user;
    return res.send(user);
  }
  next({ status: 401 });
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
