const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const user_on = "hello user";

app.get('/', (req, res) => {
    res.send(user_on);
});

server.listen(8080, () => {
    console.log('listening on *:8080')
})