// tools/cli/check-port.js

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const PORTS = [3306, 3307, 3308, 3310];
const OUTPUT_PATH = path.join(__dirname, "..", "reports", "port-report.json");

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

function parseNetstat(raw) {
 const lines = raw.trim().split("\n").filter(line => line.trim() !== "");
  //const lines = raw.trim().split("\n");
  return lines
  .map(line => line.trim().split(/\s+/))
  .filter(parts => parts.length >= 5)
  .map(parts => ({
    protocol: parts[0],
    local: parts[1],
    remote: parts[2],
    state: parts[3],
    pid: parts[4]
  }));

}

function getProcessName(pid, callback) {
  exec(`tasklist /FI "PID eq ${pid}"`, (err, stdout) => {
    const match = stdout.match(/(\S+\.exe)/);
    callback(match ? match[1] : "inconnu");
  });
}

function checkPort(port, callback) {
  exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
    const results = parseNetstat(stdout);
    const uniquePIDs = [...new Set(results.map((r) => r.pid))];
    if (uniquePIDs.length === 0) {
      callback(null, { port, status: "libre", endpoints: [] });
    } else {
      getProcessName(uniquePIDs[0], (name) => {
        callback(null, {
          port,
          status: "occupé",
          pid: uniquePIDs[0],
          process: name,
          endpoints: results,
        });
      });
    }
  });
}

function runPortChecks() {
  let index = 0;

  function tryNext() {
    if (index >= PORTS.length) {
      console.log("❌ Aucun port disponible parmi :", PORTS.join(", "));
      process.exitCode = 1;
      return;
    }

    const port = PORTS[index++];
    checkPort(port, (err, report) => {
      if (report.status === "libre") {
        console.log(`✅ Port ${port} libre. Sélection confirmé.`);
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ ...report }, null, 2));
        process.exitCode = 0;
      } else {
        console.log(`🚫 Port ${port} occupé par ${report.process} [PID ${report.pid}]`);
        tryNext();
      }
    });
  }

  tryNext();
}

runPortChecks();