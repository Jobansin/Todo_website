import React, { useState } from "react";
import { renderToString } from "react-dom/server";

const server = Bun.serve({
  hostname: "localhost",
  port: 3000,
  fetch: fetchHandler,
});

console.log(`Bun Todo running on ${server.hostname}:${server.port}`);

type Todo = { id: number; name: string; completed: boolean };
const initialTodos: Todo[] = [];

async function fetchHandler(request: Request): Promise<Response> {
  const url = new URL(request.url);

  if (url.pathname === "" || url.pathname === "/") {
    return new Response(Bun.file("index.html"));
  }

  if (url.pathname === "/todos" && request.method === "GET") {
    return new Response(renderToString(<TodoList todos={todos} />));
  }

  if (url.pathname === "/todos" && request.method === "POST") {
    const { todo } = await request.json();
    const newTodo: Todo = {
      id: todos.length + 1,
      name: todo,
      completed: false,
    };
    todos.push(newTodo);
    return new Response(renderToString(<TodoList todos={todos} />));
  }

  if (url.pathname === "/toggle" && request.method === "POST") {
    const { id } = await request.json();
    const updatedTodos = todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    todos = updatedTodos;
    return new Response(renderToString(<TodoList todos={todos} />));
  }

  return new Response("Not Found", { status: 404 });
}

function TodoList(props: { todos: Todo[] }) {
  const toggleTodoCompletion = (id: number) => {
    const updatedTodos = props.todos.map((todo) =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    // Update the state with the new todos
    setTodos(updatedTodos);
    // Send a POST request to update the server
    fetch("/toggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
  };

  return (
    <ul>
      {props.todos.length ? (
        props.todos.map((todo) => (
          <li key={`todo-${todo.id}`}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodoCompletion(todo.id)}
            />
            {todo.name}
          </li>
        ))
      ) : (
        <li>No todos found</li>
      )}
    </ul>
  );
}

// Initialize the todos state with the initial data
let todos: Todo[] = initialTodos;
// A function to update the state
const setTodos = (updatedTodos: Todo[]) => {
  todos = updatedTodos;
};

export { todos };
