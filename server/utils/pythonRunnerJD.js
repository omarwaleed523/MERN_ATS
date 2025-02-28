const { spawn } = require('child_process');
const path = require('path');

const runPythonScript = (filePath) => {
  return new Promise((resolve, reject) => {
    // Use relative path from server directory
    const scriptPath = path.join(__dirname, '..', '..', 'python-script', 'JD_Parsing.py');

    console.log(`[PYTHON] Executing script at: ${scriptPath}`);
    console.log(`[PYTHON] Processing file: ${filePath}`);

    const pythonProcess = spawn('python', [scriptPath, filePath], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errors = '';

    pythonProcess.stdout.on('data', (data) => {
      const chunk = data.toString();
      console.log('[PYTHON OUTPUT]:', chunk);
      output += chunk;
    });

    pythonProcess.stderr.on('data', (data) => {
      const chunk = data.toString();
      console.error('[PYTHON ERROR]:', chunk);
      errors += chunk;
    });

    pythonProcess.on('error', (error) => {
      console.error('[PYTHON PROCESS ERROR]:', error);
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });

    pythonProcess.on('close', (code) => {
      console.log(`[PYTHON] Process exited with code ${code}`);

      if (code !== 0) {
        return reject(new Error(`Python script failed with code ${code}: ${errors}`));
      }

      try {
        // Try to parse the output as JSON
        const trimmedOutput = output.trim();
        const result = JSON.parse(trimmedOutput);
        console.log('[PYTHON SUCCESS] Parsed JSON result');
        resolve(result);
      } catch (e) {
        console.error('[PYTHON ERROR] Failed to parse JSON:', e);
        console.error('Raw output:', output);
        reject(new Error('Invalid JSON output from Python script'));
      }
    });
  });
};

module.exports = { runPythonScript };