const { spawn } = require('child_process');
const path = require('path');

const runPythonScript = (filePath) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(
      __dirname,
      process.env.PYTHON_SCRIPT_PATH_JD
    );

    console.log(`[PYTHON] Executing: ${scriptPath} ${filePath}`);

    // Use a different variable name here
    const pythonProcess = spawn('python', [
      scriptPath,
      filePath.replace(/\\/g, '/')
    ], { stdio: ['pipe', 'pipe', 'pipe'] });

    let output = '';
    let errors = '';

    pythonProcess.stdout.on('data', (data) => output += data.toString());
    pythonProcess.stderr.on('data', (data) => errors += data.toString());

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`[PYTHON ERROR] Exit code ${code}: ${errors}`);
        return reject(new Error(`Python error: ${errors}`));
      }

      try {
        const result = JSON.parse(output);
        console.log("[PYTHON SUCCESS] Valid JSON received");
        resolve(result);
      } catch (e) {
        console.error("[PYTHON ERROR] Invalid JSON:", output);
        reject(new Error('Invalid JSON from Python script'));
      }
    });
  });
};

module.exports = { runPythonScript };