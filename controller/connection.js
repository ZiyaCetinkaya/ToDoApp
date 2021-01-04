const db = require("mysql");

const con = db.createConnection({
    host: "localhost",
    user: "root",
    password: "3<.&;s8]/PH.Y6Ys",
    database: "dailyjobdb"
});

con.connect();

module.exports = {
    db : con
};