const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const GEMINI_API_KEY = "AIzaSyA5l9-6IZvEZTbKvJsyAKQq8wkpNET_h6o";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Valid departments
const VALID_DEPARTMENTS = [
    "ACCOUNTANT", "ADVOCATE", "AGRICULTURE", "APPAREL", "ARTS", "AUTOMOBILE",
    "AVIATION", "BANKING", "BPO", "BUSINESS-DEVELOPMENT", "CHEF", "CONSTRUCTION",
    "CONSULTANT", "DESIGNER", "DIGITAL-MEDIA", "ENGINEERING", "FINANCE", "FITNESS",
    "HEALTHCARE", "HR", "INFORMATION-TECHNOLOGY", "PUBLIC-RELATIONS", "SALES", "TEACHER"
];

// Prompt template for job description parsing
const PROMPT_TEMPLATE = `
Analyze this job description and extract structured data. Follow these rules:

1. **JobTitle**: Official position title (required)
2. **Salary**: Extract salary range or fixed amount (required, numeric)
3. **Location**: Job location (required)
4. **JobDescription**: Full job description text (required)
5. **Company**: Company name (required)
6. **Skills**: List technical/soft skills (max 15, required)
7. **Experience**: Extract required experience with:
   - **Title**: Position name
   - **Company**: Company name if mentioned
   - **Dates**: Duration format
   - **Description**: Specific responsibilities
8. **Education**: Extract required education with:
   - **Degree**: Qualification name
   - **University**: Institution name
   - **Location**: Location if specified
9. **Department**: Categorize using exactly these options:
   ${VALID_DEPARTMENTS.join(', ')}

Return VALID JSON only. Follow this structure exactly:
{
  "jobTitle": "",
  "salary": 0,
  "location": "",
  "jobDescription": "",
  "company": "",
  "skills": [],
  "experience": [
    {
      "title": "",
      "company": "",
      "dates": "",
      "description": ""
    }
  ],
  "education": [
    {
      "degree": "",
      "university": "",
      "location": ""
    }
  ],
  "department": ""
}

Example Input:
Senior Software Engineer
Company: Tech Solutions Inc.
Location: San Francisco, CA
Salary: $120,000 - $150,000
________________________________________
Job Description:
We are seeking an experienced Senior Software Engineer to join our dynamic team...
[rest of example]

Example Output:
{
  "jobTitle": "Senior Software Engineer",
  "salary": 120000,
  "location": "San Francisco, CA",
  "jobDescription": "We are seeking an experienced Senior Software Engineer to join our dynamic team...",
  "company": "Tech Solutions Inc.",
  "skills": ["JavaScript", "React", "Node.js", "MongoDB", "AWS"],
  "experience": [
    {
      "title": "Software Engineer",
      "company": "Previous Tech Corp",
      "dates": "3+ years",
      "description": "Led development of scalable web applications"
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Science in Computer Science",
      "university": "Stanford University",
      "location": "Stanford, CA"
    }
  ],
  "department": "INFORMATION-TECHNOLOGY"
}
`;

/**
 * Extract text from PDF file
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<string|null>} - Extracted text or null if error
 */
async function extractTextFromPdf(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        console.error('Error extracting text from PDF:', error);
        return null;
    }
}

/**
 * Extract text from DOCX file
 * @param {string} filePath - Path to the DOCX file
 * @returns {Promise<string|null>} - Extracted text or null if error
 */
async function extractTextFromDocx(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (error) {
        console.error('Error extracting text from DOCX:', error);
        return null;
    }
}

/**
 * Extract text from file based on file type
 * @param {string} filePath - Path to the file
 * @returns {Promise<string|null>} - Extracted text or null if error
 */
async function extractText(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        return null;
    }

    try {
        if (filePath.endsWith('.pdf')) {
            return await extractTextFromPdf(filePath);
        } else if (filePath.endsWith('.docx')) {
            return await extractTextFromDocx(filePath);
        } else {
            console.error(`Unsupported file format: ${filePath}`);
            return null;
        }
    } catch (error) {
        console.error(`Text extraction error: ${error.message}`);
        return null;
    }
}

/**
 * Validate the parsed JSON structure
 * @param {Object} data - The parsed JSON data
 * @returns {boolean} - True if valid, false otherwise
 */
function validateJsonStructure(data) {
    const requiredFields = {
        'jobTitle': 'string',
        'salary': 'number',
        'location': 'string',
        'jobDescription': 'string',
        'company': 'string',
        'skills': 'array',
        'department': 'string'
    };

    try {
        for (const [field, expectedType] of Object.entries(requiredFields)) {
            if (!(field in data)) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
            
            let value = data[field];
            
            // Fix common type issues
            if (expectedType === 'string' && typeof value !== 'string') {
                if (typeof value === 'object' && value !== null) {
                    // Convert object to string representation
                    data[field] = JSON.stringify(value);
                } else {
                    data[field] = String(value);
                }
            } else if (expectedType === 'number' && typeof value !== 'number') {
                // Try to extract number from string
                if (typeof value === 'string') {
                    const numMatch = value.match(/\d+/);
                    data[field] = numMatch ? parseInt(numMatch[0]) : 0;
                } else {
                    data[field] = 0;
                }
            } else if (expectedType === 'array' && !Array.isArray(value)) {
                // Convert to array if not already
                data[field] = Array.isArray(value) ? value : [value];
            }
        }
        
        // Ensure department is valid
        if (!VALID_DEPARTMENTS.includes(data['department'])) {
            console.log(`Invalid department: ${data['department']}, setting to INFORMATION-TECHNOLOGY`);
            data['department'] = 'INFORMATION-TECHNOLOGY';
        }

        // Ensure arrays have proper structure
        if (!Array.isArray(data.experience)) {
            data.experience = [];
        }
        if (!Array.isArray(data.education)) {
            data.education = [];
        }

        return true;
    } catch (error) {
        console.error(`Validation error: ${error.message}`);
        return false;
    }
}

/**
 * Parse job description text using Gemini AI
 * @param {string} text - The job description text
 * @returns {Promise<Object|null>} - Parsed job data or null if error
 */
async function parseJobDescription(text) {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Parsing attempt ${attempt}/${maxRetries}`);
            
            // Use the stable model name instead of experimental
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                generationConfig: {
                    temperature: 0.1,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048,
                }
            });
            
            const result = await model.generateContent([PROMPT_TEMPLATE, text]);
            const response = await result.response;
            let jsonStr = response.text().trim();
            
            // Clean up the response
            if (jsonStr.startsWith('```json')) {
                jsonStr = jsonStr.slice(7, -3); // Remove ```json and ``` markers
            } else if (jsonStr.startsWith('```')) {
                jsonStr = jsonStr.slice(3, -3); // Remove ``` markers
            }
            
            const parsedData = JSON.parse(jsonStr);
            
            if (validateJsonStructure(parsedData)) {
                console.log('Successfully parsed job description');
                return parsedData;
            } else {
                throw new Error('Validation failed for parsed data');
            }

        } catch (error) {
            lastError = error;
            console.error(`Parsing attempt ${attempt} failed:`, error.message);
            
            if (attempt < maxRetries) {
                // Wait before retrying (exponential backoff)
                const delay = Math.pow(2, attempt) * 1000;
                console.log(`Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    console.error(`All ${maxRetries} parsing attempts failed. Last error:`, lastError.message);
    return null;
}

/**
 * Fallback parsing function using basic text analysis
 * Used when Gemini API is unavailable
 * @param {string} text - The job description text
 * @returns {Object|null} - Basic parsed job data or null if error
 */
function fallbackParseJobDescription(text) {
    try {
        console.log('Using fallback parsing method');
        
        // Basic text analysis
        const lines = text.split('\n').filter(line => line.trim());
        
        // Extract basic information using regex patterns
        const jobTitleMatch = text.match(/(?:position|title|role):?\s*(.+?)(?:\n|$)/i);
        const companyMatch = text.match(/(?:company|organization):?\s*(.+?)(?:\n|$)/i);
        const locationMatch = text.match(/(?:location|address|city):?\s*(.+?)(?:\n|$)/i);
        const salaryMatch = text.match(/(?:salary|compensation|pay):?\s*(.+?)(?:\n|$)/i);
        
        // Extract skills using common patterns
        const skillsSection = text.match(/(?:skills|requirements|qualifications):?\s*(.*?)(?:\n\n|\n[A-Z]|$)/is);
        let skills = [];
        if (skillsSection) {
            skills = skillsSection[1]
                .split(/[,\n•\-\*]/)
                .map(skill => skill.trim())
                .filter(skill => skill.length > 0 && skill.length < 50)
                .slice(0, 10); // Limit to 10 skills
        }
        
        // Default department assignment based on keywords
        let department = "OTHER";
        const textLower = text.toLowerCase();
        if (textLower.includes('software') || textLower.includes('developer') || textLower.includes('programming')) {
            department = "INFORMATION-TECHNOLOGY";
        } else if (textLower.includes('marketing') || textLower.includes('sales')) {
            department = "SALES";
        } else if (textLower.includes('design') || textLower.includes('creative')) {
            department = "DESIGNER";
        } else if (textLower.includes('finance') || textLower.includes('accounting')) {
            department = "FINANCE";
        } else if (textLower.includes('hr') || textLower.includes('human resources')) {
            department = "HR";
        }
        
        const fallbackData = {
            jobTitle: jobTitleMatch ? jobTitleMatch[1].trim() : "Job Position",
            salary: salaryMatch ? parseInt(salaryMatch[1].replace(/\D/g, '')) || 0 : 0,
            location: locationMatch ? locationMatch[1].trim() : "Location not specified",
            jobDescription: text.slice(0, 1000), // First 1000 characters
            company: companyMatch ? companyMatch[1].trim() : "Company not specified",
            skills: skills,
            experience: [{
                title: "Experience required",
                company: "",
                dates: "",
                description: "As specified in job description"
            }],
            education: [{
                degree: "As required",
                university: "",
                location: ""
            }],
            department: department
        };
        
        console.log('Fallback parsing completed successfully');
        return fallbackData;
        
    } catch (error) {
        console.error(`Fallback parsing error: ${error.message}`);
        return null;
    }
}

/**
 * Parse job description file and extract structured data
 * @param {string} filePath - Path to the job description file
 * @returns {Promise<Object|null>} - Parsed job data or null if error
 */
async function parseJobDescriptionFile(filePath) {
    // Extract text
    const text = await extractText(filePath);
    if (!text) {
        return null;
    }

    console.log('Starting job description parsing...');
    
    // Try Gemini AI parsing first
    let result = await parseJobDescription(text);
    
    // If Gemini fails, use fallback parsing
    if (!result) {
        console.log('Gemini parsing failed, trying fallback method...');
        result = fallbackParseJobDescription(text);
    }
    
    if (!result) {
        console.error('Both Gemini and fallback parsing failed');
        return null;
    }

    console.log('Job description parsing completed successfully');
    return result;
}

module.exports = {
    parseJobDescriptionFile,
    parseJobDescription,
    extractText,
    extractTextFromPdf,
    extractTextFromDocx,
    validateJsonStructure,
    VALID_DEPARTMENTS
};
