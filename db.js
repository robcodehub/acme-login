const Sequelize = require('sequelize');
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_login_db');

const pg = require('pg');

const User = conn.define('user', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    name: Sequelize.STRING,
    favoriteWord: Sequelize.STRING,
    email: {
        type: Sequelize.STRING,
        allowNull:false,
        unique: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

const syncAndSeed = async() =>{
    await conn.sync({ force: true });

    const users = [
        { id: 1,
          name: 'moe',
          password: 'moefoo',
          email: 'moe@foo.com',
          favoriteWord: 'foo'
        },
        {
          id: 2,
          name: 'lucy',
          password: 'lucybar',
          email: 'lucy@bar.com',
          favoriteWord: 'bar'
        }
      ];

     const [moe, lucy] =  await Promise.all(users.map(user => User.create(user)))


}

module.exports ={
    syncAndSeed,
    models: {
        User
    }
}
