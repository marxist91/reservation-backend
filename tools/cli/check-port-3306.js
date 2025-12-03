// tools/cli/check-port-3306.js

const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const PORTS = [3306, 3307, 3308, 3310];
const OUTPUT_PATH = path.join(__dirname, "..", "reports", "port-3306-report.json");

function parseNetstat(raw) {
  const lines = raw.trim().split("\n");
  return lines.map((line) => {
    const parts = line.trim().split(/\s+/);
    return {
      protocol: parts[0],
      local: parts[1],
      remote: parts[2],
      state: parts[3],
      pid: parts[4],
    };
  });
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
    const uniquePIDs = [...new Set(results.map(r => r.pid))];

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

function runPortCheck() {
  let fallbackUsed = false;

  checkPort(PORTS[0], (err, report) => {
    if (report.status === "libre") {
      console.log(`✅ Port ${report.port} libre. Utilisation confirmée.`);
      fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ ...report, fallbackUsed }, null, 2));
      process.exitCode = 0;
    } else {
      console.log(`🚫 Port ${report.port} occupé par ${report.process} [PID ${report.pid}].`);
      fallbackUsed = true;
      checkPort(PORTS[1], (err, fallbackReport) => {
        if (fallbackReport.status === "libre") {
          console.log(`🔁 Fallback actif : port ${fallbackReport.port} libre. Sélectionné.`);
          fs.writeFileSync(
            OUTPUT_PATH,
            JSON.stringify({ ...fallbackReport, fallbackUsed }, null, 2)
          );
          process.exitCode = 0;
        } else {
          console.log(`🚫 Fallback échoué : port ${fallbackReport.port} aussi occupé.`);
          fs.writeFileSync(OUTPUT_PATH, JSON.stringify({ ...fallbackReport, fallbackUsed }, null, 2));
          process.exitCode = 1;
        }
      });
    }
  });
}

runPortCheck();