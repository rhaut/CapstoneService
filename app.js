var express = require('express');
var bodyParser = require('body-parser');

var app = express();
app.use(bodyParser.json());

var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : '',
    database : 'gamedb'
});

app.post('/', function(req, res) {
    console.log(req.body);
    if(isValidRequest(req, handleRequest)) {
        var request = handleRequest[req.query["request"]];
        if(hasValidAttributes(request.required, req.body)) {
            request.execute(res, req.body);
        } else {
            res.send(errorResponse("Did not include required attributes"));
        }
    } else {
        res.send(errorResponse("Request does not exist"));
    }
});

app.use(function(err, req, res, next) {
    res.send(err.message);
});

var handleRequest = {
    "add_user": {
        "required": ["user_id", "name"],
        "execute": function (res, body) {
            var sql = 'INSERT INTO users (user_id, user_name) VALUES(' +
                mysql.escape(body['user_id']) + ", " +
                mysql.escape(body['name']) +
                ')';
            connection.query(sql, function(err, results) {
                var result;
                if(err) {
                    result = errorResponse(err.message);
                } else {
                    result = basicResponse(results.affectedRows > 0);
                }
                res.send(result);
            });
        }
    },
    "create_game": {
        "required": ["user_id", "name", "has_pass", "hash_pass", "teams"],
        "execute": function (res, body) {
            var sql = 'INSERT INTO games (user_id, game_name, has_pass, hash_pass, teams) VALUES(' +
                mysql.escape(body['user_id']) + ', ' +
                mysql.escape(body['name']) + ', ' +
                mysql.escape(body['has_pass']) + ', ' +
                mysql.escape(body['hash_pass']) + ', ' +
                mysql.escape(body['teams']) +
                ')';
            connection.query(sql, function(err, results) {
                var result;
                if(err) {
                    result = errorResponse(err.message);
                } else {
                    result = basicResponse(results.affectedRows > 0);
                }
                res.send(result);
            });
        }
    },
    "get_games": {
        "required": ["user_id"],
        "execute": function (res, body) {
            var sql = 'SELECT games.game_id, games.game_name, games.has_pass, games.hash_pass, games.teams, users.user_name FROM games, users WHERE users.user_id=games.user_id';
            connection.query(sql, function(err, results) {
                var result;
                if(err) {
                    result = errorResponse(err.message);
                } else {
                    result = results;
                }
                res.send(result);
            });
        }
    },
    "join_game": {
        "required": ["user_id", "game_id", "team_id"],
        "execute": function (res, body) {
            var sql = 'INSERT INTO players (user_id, game_id, team_id) VALUES(' +
                mysql.escape(body['user_id']) + ', ' +
                mysql.escape(body['game_id']) + ', ' +
                mysql.escape(body['team_id']) +
                ')';
            connection.query(sql, function(err, results) {
                var result;
                if(err) {
                    result = errorResponse(err.message);
                } else {
                    result = basicResponse(results.affectedRows > 0);
                }
                res.send(result);
            });
        }
    },
    "get_players": {
        "required": ["user_id", "game_id"],
        "execute": function (res, body) {
            var sql = 'SELECT users.user_name, players.team_id, players.points FROM users, players, games WHERE games.game_id=' +
                mysql.escape(body['game_id']);
            connection.query(sql, function (err, results) {
                var result;
                if (err) {
                    result = errorResponse(err.message);
                } else {
                    result = results;
                }
                res.send(result);
            });
        }
    },
    "update_coordinates": {
        "required": ["user_id", "longitude", "latitude"],
        "execute": function (res, body) {
            var sql = 'UPDATE users SET ' +
                'longitude='+ mysql.escape(body['longitude']) + ', ' +
                'latitude=' + mysql.escape(body['latitude']) +
                ' WHERE ' +
                'users.user_id=' + mysql.escape(body['user_id']);
            connection.query(sql, function (err, results) {
                var result;
                if (err) {
                    result = errorResponse(err.message);
                } else {
                    result = basicResponse(results.affectedRows > 0);
                }
                res.send(result);
            });
        }
    },
    "quit_game": {
        "required": ["user_id", "game_id"],
        "execute": function (res, body) {
            var sql = 'DELETE FROM players WHERE ' +
                'user_id=' + mysql.escape(body['user_id']) +
                ' AND ' +
                'game_id=' + mysql.escape(body['game_id']);
            connection.query(sql, function (err, results) {
                var result;
                if (err) {
                    result = errorResponse(err.message);
                } else {
                    result = basicResponse(results.affectedRows > 0);
                }
                res.send(result);
            });
        }
    },
    "delete_game": {
        "required": ["user_id", "game_id"],
        "execute": function (res, body) {
            var sql = 'DELETE FROM games WHERE ' +
                'game_id=' + mysql.escape(body['game_id']) +
                ' AND ' +
                'user_id=' + mysql.escape(body['user_id']);
            connection.query(sql, function (err, results) {
                var result;
                if (err) {
                    result = errorResponse(err.message);
                } else {
                    result = basicResponse(results.affectedRows > 0);
                }
                res.send(result);
            });
        }
    },
    "send_message": {
        "required": ["user_id", "game_id", "team_only", "message"],
        "execute": function (res, body) {
            var sql = 'INSERT INTO messages (user_id, game_id, team_only, message) VALUES(' +
                mysql.escape(body['user_id']) + ", " +
                mysql.escape(body['game_id']) + ", " +
                mysql.escape(body['team_only']) + ", " +
                mysql.escape(body['message']) +
                ')';
            connection.query(sql, function (err, results) {
                var result;
                if (err) {
                    result = errorResponse(err.message);
                } else {
                    result = basicResponse(results.affectedRows > 0);
                }
                res.send(result);
            });
        }
    },
    "get_messages": {
        "required": ["user_id", "game_id", "team_id"],
        "execute": function (res, body) {
            var sql = 'SELECT users.user_name, messages.message FROM users, players, games, messages WHERE ' +
                'messages.game_id=' + body['game_id'] +
                ' AND (team_only=false OR (players.game_id=messages.game_id AND ' +
                'players.team_id=' + body['team_id'] +
                ' AND players.user_id=messages.user_id))';
            connection.query(sql, function (err, results) {
                var result;
                if (err) {
                    result = errorResponse(err.message);
                } else {
                    result = results;
                }
                res.send(result);
            });
        }
    }

};

function basicResponse(successful) {
    return {
        "success":successful
    }
}

function errorResponse(message) {
    return {
        "success":false,
        "message":message
    }
}

function hasValidAttributes(attributes, object) {
    for(var x = 0; x < attributes.length; x++) {
        if(!(attributes[x] in object)) {
            return false;
        }
    }
    return true;
}

function isValidRequest(req, handler) {
    console.log(req.query["request"]);
    return "request" in req.query &&
            req.query["request"] in handler;
}

module.exports = app;
