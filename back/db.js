const mysql = require('mysql');

class MySQL{
    constructor (){
        if (MySQL._instance) {
            return MySQL._instance;
        }
        else{
            this.connection = mysql.createConnection({
                host: 'localhost',
                port: 3306,
                database: 'cultural_objects',
                user: 'root',
                password: ''
            })
            MySQL._instance = this;
        }
    }

    openConnection = () => {
        this.connection.connect(function (err) {
            if(err){
                console.log("error occurred while connecting");
            }
            else{
                console.log("connection created with Mysql successfully");
            }
        });
    }

    closeConnection = () => {
        this.connection.end();
    }

    makeQuery = (query, callback) =>{
        this.connection.query(query, function (error, results){
            if (error) throw error;
            return callback(JSON.stringify(results));
        })
    }
    prepareQuery = (query, values) =>{
        return mysql.format(query, values);
    }

}
module.exports = MySQL;