const sqlite3 = require("sqlite3").verbose()
const md5 = require("md5")

const DBSOURCE = 'db.sqlite'

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        console.err(err.message)
        throw err
    } else {
        console.log('Connected to the SQLITE Database')
        const createTable = `CREATE TABLE user(id INTEGER PRIMARY KEY AUTOINCREMENT, 
                                name text, email text UNIQUE, password text, 
                                CONSTRAINT email_unique UNIQUE (email))`

        db.run(createTable, (err) => {
            if (err) {
                console.log("Table was created")
            } else {
                const userData = "INSERT INTO user(name, email, password) VALUES(?,?,?)"
                db.run(userData, ["admin", "admin@example.com", md5('admin1234')])
                db.run(userData, ["user", "user@example.com", md5('user1234')])
            }
        })
    }
})

module.exports = db