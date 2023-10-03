Bun.serve({
    hostname: "localhost",
    port: 3000,
    fetch: fetchHandler,
  });