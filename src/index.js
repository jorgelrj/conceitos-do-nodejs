const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((u) => u.username === username);

  if (user) {
    request.user = user;
    return next();
  } else {
    return response.status(404).json({ error: "User not found!" });
  }
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userWithSameUserName = users.some((u) => u.username === username);

  if (userWithSameUserName) {
    return response.status(400).json({ error: "Username already in use!" });
  } else {
    const user = {
      id: uuidv4(),
      name,
      username,
      todos: [],
    };
    users.push(user);

    return response.status(201).json(user);
  }
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((e) => e.id === id);

  if (todo) {
    if (title) todo.title = title;
    if (deadline) todo.deadline = deadline;

    return response.status(200).json(todo);
  } else {
    return response.status(404).json({ error: "Todo not found!" });
  }
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((e) => e.id === id);
  if (todo) {
    todo.done = true;

    return response.status(200).json(todo);
  } else {
    return response.status(404).json({ error: "Todo not found!" });
  }
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((e) => e.id === id);

  if (todo) {
    user.todos.splice(todo, 1);
    return response.status(204).json(user.todos);
  } else {
    return response.status(404).json({ error: "Todo not found!" });
  }
});

module.exports = app;
