const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');

const { User } = require('./model/User')
const { Todo } = require('./model/todo');

const app = express();

app.use(bodyParser.json());

app.post('/api/todos', (request, response) => {
    const todo = new Todo({
        text: request.body.text
    });

    todo.save().then(document => {
        response.send(document);
    }, error => response.status(400).send(error));
});

app.get('/api/todos', (request, response) => {
    console.log(request.body);
});

app.listen(3001, () => console.log('Server: http://localhost:3000'))