const { spawn } = require('child_process');
const path = require('path');

const runPythonScript = (filePath) => {
    return new Promise((resolve, reject) => {
        // Resolve the absolute path to the Python script
        const pythonScriptPath = path.resolve(__dirname, process.env.PYTHON_SCRIPT_PATH);

        // Log the Python script path for debugging
        console.log(`Python Script Path: ${pythonScriptPath}`);

        // Use 'python' instead of 'python3' for Windows
        const pythonProcess = spawn('python', [pythonScriptPath, filePath], {
            stdio: ['pipe', 'pipe', 'ignore'], // Redirect stderr to /dev/null or nul
        });

        let dataString = '';
        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const jsonResponse = JSON.parse(dataString);
                    resolve(jsonResponse);
                } catch (error) {
                    reject(new Error('Failed to parse Python script output'));
                }
            } else {
                reject(new Error(`Python script exited with code ${code}`));
            }
        });
    });
};

module.exports = { runPythonScript };