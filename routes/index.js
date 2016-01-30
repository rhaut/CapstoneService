var express = require('express');
var router = express.Router();

var PARAMETERS;
var HEADERS;

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'capstone'
});

router.get('/', function(req, res, next) {
    PARAMETERS = req.query;
    HEADERS = req.headers;
    if(isValidRequest()) {
        handleRequest[PARAMETERS["request"]](res);
    } else {
        res.send(null);
    }
});

var handleRequest = {
    "create_race":function(res) {
        if(hasValidParameters("name", "latitude", "longitude")) {
            var sql = 'INSERT INTO races (name, latitude, longitude) VALUES (' +
                mysql.escape(PARAMETERS["name"]) + ', ' +
                mysql.escape(PARAMETERS["latitude"]) + ', ' +
                mysql.escape(PARAMETERS["longitude"]) +
                ')';
            connection.query(sql, function(err, results) {
                res.send(JSON.stringify(results, null, 4));
            });
        }
    },
    "get_races":function(res) {
        var sql = 'SELECT * FROM races';
        connection.query(sql, function(err, results) {
            res.send(JSON.stringify(results, null, 4));
        });
    },
    "get_players":function(res) {
        if(hasValidParameters("race_id")) {
            var sql = 'SELECT users.id, users.name FROM users, players WHERE users.id = players.user_id AND ' +
                'players.race_id=' + mysql.escape(PARAMETERS["race_id"]);
            connection.query(sql, function(err, results) {
                res.send(JSON.stringify(results, null, 4));
            });
        }
    },
    "report_coordinates":function(res) {
        if(hasValidParameters("latitude", "longitude")) {
            var sql = 'UPDATE users SET ' +
                'latitude=' + mysql.escape(PARAMETERS["latitude"]) + ', ' +
                'longitude=' + mysql.escape(PARAMETERS["longitude"]) +
                ' WHERE ' +
                'id=' + mysql.escape(HEADERS["id"]);
            connection.query(sql, function(err, results) {
                res.send(JSON.stringify(results, null, 4));
            });
        }
    },
    "join_race":function(res) {
        if(hasValidParameters("race_id")) {
            var sql = 'INSERT INTO players (race_id, user_id) VALUES (' +
                mysql.escape(PARAMETERS["race_id"]) + ', ' +
                mysql.escape(HEADERS["id"]) +
                ')';
            connection.query(sql, function(err, results) {
                res.send(JSON.stringify(results, null, 4));
            });
        }
    },
    "quit_race":function(res) {
        var sql = 'DELETE FROM players WHERE ' +
            'user_id=' + mysql.escape(HEADERS["id"]);
        connection.query(sql, function(err, results) {
            res.send(JSON.stringify(results, null, 4));
        });
    }
    ,
    "delete_race":function(res) {
        if(hasValidParameters("race_id")) {
            var sql = 'DELETE FROM races WHERE ' +
                'id=' + mysql.escape(PARAMETERS["race_id"]);
            connection.query(sql, function(err, results) {
                res.send(JSON.stringify(results, null, 4));
            });
        }
    },
    "add_user":function(res) {
        if(hasValidParameters("name")) {
            var sql = 'INSERT INTO users (id, name) VALUES (' +
                mysql.escape(HEADERS["id"]) + ', ' +
                mysql.escape(PARAMETERS["name"]) +
                ')';
            connection.query(sql, function(err, results) {
                res.send(JSON.stringify(results, null, 4));
            });
        }
    }
};

function hasValidParameters() {
    for(var x = 0; x < arguments.length; x++) {
        if(!(arguments[x] in PARAMETERS)) {
            return false;
        }
    }
    return true;
}

function isValidRequest() {
    return "request" in PARAMETERS && "id" in HEADERS;
}

module.exports = router;
