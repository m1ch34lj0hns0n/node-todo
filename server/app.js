require('dotenv').config();
const express = require('express');
const { ObjectID } = require('mongodb');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');

const { User } = require('./model/User')
const { Todo } = require('./model/todo');

const port = process.env || 3000;

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
    Todo.find().then(todos => {
        response.send({
            todos,
            status: 'ok'
        });
    }, error => response.status(400).send(error));
});

app.get('/api/todos/:id', (request, response) => {
    const id = request.params.id;
    if(!ObjectID.isValid(id)) {
        response.status(404).send();
    }
    Todo.findById(id).then(todo => {
        if(!todo) return response.status(404).send();
        response.send({
            todo,
            status: 'ok'
        });
    }).catch(error => response.status(404).send());
});

app.delete('/api/todos/:id', (request, response) => {
    const id = request.params.id;
    if(!ObjectID.isValid(id)) {
        response.status(404).send();
    }
    Todo.findByIdAndRemove(id).then(todo => {
        if(!todo) return response.status(404).send();
        response.send({
            todo,
            status: 'ok'
        });
    }).catch(error => response.status(404).send());
});

app.listen(port, () => console.log(`Server: http://localhost:${port}`));