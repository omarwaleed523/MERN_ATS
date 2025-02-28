const { spawn } = require('child_process');
const path = require('path');

const runPythonScript = (filePath) => {
    return new Promise((resolve, reject) => {
        // Resolve the absolute path to the Python script
        const pythonScriptPath = path.resolve(__dirname, process.env.PYTHON_SCRIPT_PATH_RESUME);

        // Log the Python script path for debugging
        console.log(`Python Script Path: ${pythonScriptPath}`);

        // Use 'python' instead of 'python3' for Windows
        const pythonProcess = spawn('python', [pythonScriptPath, filePath], {
            stdio: ['pipe', 'pipe', 'pipe'], // Capture stderr
        });

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const jsonResponse = JSON.parse(dataString);
                    resolve(jsonResponse);
                } catch (error) {
                    console.error('Failed to parse Python script output:', errorString);
                    reject(new Error('Failed to parse Python script output'));
                }
            } else {
                console.error('Python script error:', errorString);
                reject(new Error(`Python script exited with code ${code}`));
            }
        });
    });
};

module.exports = { runPythonScript };