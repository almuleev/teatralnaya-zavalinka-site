const assert = require("node:assert/strict");
const net = require("node:net");
const path = require("node:path");
const { spawn } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..");

async function run() {
  const blocker = net.createServer();
  await new Promise((resolve, reject) => {
    blocker.once("error", reject);
    blocker.listen(0, resolve);
  });

  const { port } = blocker.address();
  const child = spawn(process.execPath, ["server/server.js"], {
    cwd: rootDir,
    env: {
      ...process.env,
      NODE_ENV: "development",
      PORT: String(port),
      PUBLIC_SITE_URL: `http://localhost:${port}`
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  try {
    const exitCode = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        child.kill();
        reject(new Error("Server did not exit after the port conflict."));
      }, 5000);

      child.once("error", reject);
      child.once("exit", (code) => {
        clearTimeout(timeout);
        resolve(code);
      });
    });

    assert.equal(exitCode, 1);
    assert.match(stderr, new RegExp(`Port ${port} is already in use`));
    assert.doesNotMatch(stderr, /Unhandled 'error' event/);
    console.log("Startup conflict test passed.");
  } finally {
    await new Promise((resolve) => blocker.close(resolve));
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
