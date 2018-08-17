require('dotenv').config();
const express = require('express');
const { ObjectID } = require('mongodb');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');

const { User } = require('./model/User')
const { Todo } = require('./model/todo');

const { authenticate } = require('./middleware/authenticate');

const port = process.env.PORT || 3000;

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

app.patch('/api/todos/:id', (request, response) => {
    const id = request.params.id;
    let todo = request.body;
    if(!ObjectID.isValid(id)) {
        response.status(404).send();
    }
    if(typeof todo.completed === 'boolean' && todo.completed) {
        todo.completedAt = new Date().getTime();
    } else {
        todo.completed = false;
        todo.completedAt = null;
    }
    Todo.findOneAndUpdate(id, {
        $set: todo
    }, {
        new: true
    }).then(todo => {
        if(!todo) return response.status(404).send();
        response.send({todo});
    }).catch(error => res.status(400).send());
});

app.post('/users', (request, response) => {
    const user = new User({
        email: request.body.email,
        password: request.body.password
    });
    user.save().then(() => user.generateAuthToken())
    .then(token => response.header('x-auth', token).send(user))
    .catch(error => response.status(400).send(error));
});

app.get('/users/me', authenticate, (request, response) => {
    response.send(request.user);
});

app.post('/users/login', (request, response) => {
    var body = {
        email: request.body.email,
        password: request.body.password
    };
    User.findByCredentials(body.email, body.password).then(user => {
        if(!user) return response.status('401').send();
        return user.generateAuthToken().then(token => response.header('x-auth', token).send(user));
    }).catch(error => response.status('401').send());
});

app.listen(port, () => console.log(`Server: http://localhost:${port}`));
