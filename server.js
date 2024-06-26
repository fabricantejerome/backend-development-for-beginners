const express = require("express")
const app = express()
const db = require("./database.js")
const md5 = require("md5")

const bodyParser = require("body-parser")
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

// The server will run on this port
const HTTP_PORT = 8000

app.listen(HTTP_PORT, () => {
    console.log(`The server is running on PORT ${HTTP_PORT}`)
})

// Lets start creating an endpoint
app.get("/", (req, res, next) => {
    res.json({ message: "OK"})
})

// Get the list of users
app.get("/api/users", (req, res, next) => {
    const query = "SELECT * FROM user"

    db.all(query, (err, rows) => {
        if (err) {
            res.status(400).json({message: err.message})
            return
        }
        
        res.json({ message: "success", data: rows})
    })
})

// Get a user by id
app.get("/api/user/:id", (req, res, next) => {
    const id = req.params.id
    const sql = "SELECT * FROM user WHERE id = ?"

    db.get(sql, id, (err, row) => {
        if (err) {
            res.status(400).json({ message: err.message })
            return
        }

        res.json({ message: "success", data: row})
    })
})

// Create new user
app.post("/api/user/", (req, res, next) => {
    let errors=[]
    if (!req.body.password){
        errors.push("No password specified");
    }
    if (!req.body.email){
        errors.push("No email specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    const data = {
        name: req.body.name,
        email: req.body.email,
        password : md5(req.body.password)
    }
    const sql ='INSERT INTO user (name, email, password) VALUES (?,?,?)'
    const params =[data.name, data.email, data.password]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,
            "id" : this.lastID
        })
    });
})

// Update user
app.patch("/api/user/:id", (req, res, next) => {
    const { id } = req.params
    let { name, email, password} = req.body
    password = password ? md5(password) : null
    const data = {name, email, password}

    const sql = `UPDATE user SET
                name = COALESCE(?,name),
                email = COALESCE(?,email),
                password = COALESCE(?,password)
                WHERE id = ?`
    const params = [name, email, password, id]
    db.run(sql, params, function(err, result) {
        if (err) {
            res.status(400).json({ message: err.message })
            return
        }

        res.json({
            message: "User was updated",
            data,
            changes: this.changes
        })
    })
})

// Delete user
app.delete("/api/user/:id", (req, res, next) => {
    const id = req.params.id
    const sql = "DELETE FROM user WHERE id = ?"
    db.run(sql, id, function(err, result) {
        if (err) {
            res.status(400).json({ message: err.message })
            return
        }

        res.json({ message: "User was delete", changes: this.changes })
    })
})

// Fallback when the routes/endpoint does not exist
app.use((req, res)=> {
    res.status(404).json({ message: "You are accesing the endpoint which does not exist! Read the API documentation."})
})