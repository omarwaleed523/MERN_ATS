const fs = require('fs');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const GEMINI_API_KEY = "AIzaSyA5l9-6IZvEZTbKvJsyAKQq8wkpNET_h6o";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// System instruction for the Gemini model
const INSTRUCTION = `
Extract the following information from this resume text:
- Name
- Email
- Phone
- Skills
- Experience
- Education
- Department: Categorize the resume based on the following departments:
  ACCOUNTANT, ADVOCATE, AGRICULTURE, APPAREL, ARTS, AUTOMOBILE, AVIATION, BANKING, BPO,
  BUSINESS-DEVELOPMENT, CHEF, CONSTRUCTION, CONSULTANT, DESIGNER, DIGITAL-MEDIA,
  ENGINEERING, FINANCE, FITNESS, HEALTHCARE, HR, INFORMATION-TECHNOLOGY, PUBLIC-RELATIONS,
  SALES, TEACHER.
- ResumeText: Include the full text of the resume in a cleaned format.(Required)

This is the schema for the experience, education, and resume schema. Do not change the schema.:
const ExperienceSchema = new mongoose.Schema({
  Title: String,      
  Company: String,     
  Dates: String,       
  description: String  
});

const EducationSchema = new mongoose.Schema({
  Degree: String,      
  University: String,  
  Location: String     
});

const ResumeSchema = new mongoose.Schema({
  Name: String,
  Email: String,
  Phone: String,
  Skills: [String],
  Experience: [ExperienceSchema], 
  Education: [EducationSchema],   
  Department: String,
  ResumeText: String
});

Make sure to categorize based on the related skills, education, and experience with one of the 24 departments mentioned.
Ensure you return names, emails, and phone numbers even if they aren't explicitly labeled in the text.
If missing, use placeholders like 'John Doe', '0123456789', 'example@gmail.com'.
For the ResumeText field, include the entire content of the resume in a clean, well-formatted text format.
Return the data in JSON format with these fields as keys.
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
        return result.value.replace(/\t/g, ' '); // Replace tabs with spaces
    } catch (error) {
        console.error('Error extracting text from DOCX:', error);
        return null;
    }
}

/**
 * Generate response from Gemini AI based on extracted text
 * @param {string} extractedText - The text extracted from the resume
 * @returns {Promise<Object|null>} - Parsed JSON response or null if error
 */
async function generateResponse(extractedText) {
    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Resume parsing attempt ${attempt}/${maxRetries}`);
            
            // Use the stable model name instead of experimental
            const model = genAI.getGenerativeModel({ 
                model: "gemini-1.5-flash",
                systemInstruction: INSTRUCTION,
                generationConfig: {
                    temperature: 0.1,
                    topK: 1,
                    topP: 1,
                    maxOutputTokens: 2048,
                }
            });

            const result = await model.generateContent(extractedText);
            const response = await result.response;
            const text = response.text();

            // Log the raw Gemini response for debugging
            console.log('Raw Gemini response:', text);

            // Remove all Markdown code block markers (``` and ```json)
            let cleanedText = text.replace(/```json|```/gi, '').trim();

            // Try to parse the whole cleaned text as JSON first
            try {
                if (cleanedText.startsWith('{') && cleanedText.endsWith('}')) {
                    // Attempt to fix common JSON issues: remove trailing commas
                    let fixedText = cleanedText.replace(/,\s*([}\]])/g, '$1');
                    try {
                        const jsonResponse = JSON.parse(fixedText);
                        if (!jsonResponse.ResumeText) {
                            jsonResponse.ResumeText = extractedText;
                        }
                        console.log('Successfully parsed resume (whole text)');
                        return jsonResponse;
                    } catch (jsonError) {
                        // Try to repair JSON using jsonrepair if available
                        try {
                            const { jsonrepair } = require('jsonrepair');
                            const repaired = jsonrepair(fixedText);
                            const jsonResponse = JSON.parse(repaired);
                            if (!jsonResponse.ResumeText) {
                                jsonResponse.ResumeText = extractedText;
                            }
                            console.log('Successfully parsed resume (jsonrepair)');
                            return jsonResponse;
                        } catch (repairError) {
                            console.error('jsonrepair failed:', repairError.message);
                        }
                    }
                }
            } catch (e) {
                // Ignore and fallback to regex extraction
            }

            // Extract the first JSON object from the response
            const jsonPattern = /{[\s\S]*?}\s*(?=\n|$)/;
            const matches = cleanedText.match(jsonPattern);

            if (matches) {
                let cleanResponseText = matches[0];
                // Attempt to fix common JSON issues: remove trailing commas
                cleanResponseText = cleanResponseText.replace(/,\s*([}\]])/g, '$1');
                try {
                    const jsonResponse = JSON.parse(cleanResponseText);
                    if (!jsonResponse.ResumeText) {
                        jsonResponse.ResumeText = extractedText;
                    }
                    console.log('Successfully parsed resume (regex fallback)');
                    return jsonResponse;
                } catch (jsonError) {
                    // Try to repair JSON using jsonrepair if available
                    try {
                        const { jsonrepair } = require('jsonrepair');
                        const repaired = jsonrepair(cleanResponseText);
                        const jsonResponse = JSON.parse(repaired);
                        if (!jsonResponse.ResumeText) {
                            jsonResponse.ResumeText = extractedText;
                        }
                        console.log('Successfully parsed resume (regex+jsonrepair)');
                        return jsonResponse;
                    } catch (repairError) {
                        throw new Error(`JSON parsing and repair failed: ${repairError.message}`);
                    }
                }
            } else {
                throw new Error('No valid JSON found in the response');
            }
        } catch (error) {
            lastError = error;
            console.error(`Resume parsing attempt ${attempt} failed:`, error.message);
            
            if (attempt < maxRetries) {
                // Wait before retrying (exponential backoff)
                const delay = Math.pow(2, attempt) * 1000;
                console.log(`Waiting ${delay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    console.error(`All ${maxRetries} resume parsing attempts failed. Last error:`, lastError.message);
    return null;
}

/**
 * Fallback parsing function for resumes using basic text analysis
 * Used when Gemini API is unavailable
 * @param {string} text - The resume text
 * @returns {Object|null} - Basic parsed resume data or null if error
 */
function fallbackParseResume(text) {
    try {
        console.log('Using fallback resume parsing method');
        
        // Basic text analysis
        const lines = text.split('\n').filter(line => line.trim());
        
        // Extract basic information using regex patterns
        const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/i);
        const phoneMatch = text.match(/(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/);
        
        // Extract name (usually in the first few lines)
        let name = "John Doe";
        for (let i = 0; i < Math.min(5, lines.length); i++) {
            const line = lines[i].trim();
            if (line.length > 2 && line.length < 50 && /^[a-zA-Z\s]+$/.test(line)) {
                name = line;
                break;
            }
        }
        
        // Extract skills
        const skillsSection = text.match(/(?:skills|technologies|proficiencies):?\s*(.*?)(?:\n\n|\n[A-Z]|$)/is);
        let skills = [];
        if (skillsSection) {
            skills = skillsSection[1]
                .split(/[,\n•\-\*]/)
                .map(skill => skill.trim())
                .filter(skill => skill.length > 0 && skill.length < 30)
                .slice(0, 10);
        }
        
        // Basic department assignment
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
        } else if (textLower.includes('teacher') || textLower.includes('education')) {
            department = "TEACHER";
        }
        
        const fallbackData = {
            Name: name,
            Email: emailMatch ? emailMatch[0] : "example@gmail.com",
            Phone: phoneMatch ? phoneMatch[0] : "0123456789",
            Skills: skills.length > 0 ? skills : ["General skills"],
            Experience: [{
                Title: "Professional Experience",
                Company: "Previous Company",
                Dates: "Years of experience",
                description: "Experience details from resume"
            }],
            Education: [{
                Degree: "Educational Background",
                University: "Educational Institution",
                Location: "Location"
            }],
            Department: department,
            ResumeText: text.slice(0, 2000) // First 2000 characters
        };
        
        console.log('Fallback resume parsing completed successfully');
        return fallbackData;
        
    } catch (error) {
        console.error(`Fallback resume parsing error: ${error.message}`);
        return null;
    }
}

/**
 * Parse resume file and extract structured data
 * @param {string} filePath - Path to the resume file
 * @returns {Promise<Object|null>} - Parsed resume data or null if error
 */
async function parseResumeFile(filePath) {
    let extractedText = null;

    // Extract text based on file type
    if (filePath.endsWith('.pdf')) {
        extractedText = await extractTextFromPdf(filePath);
    } else if (filePath.endsWith('.docx')) {
        extractedText = await extractTextFromDocx(filePath);
    } else {
        console.error('Unsupported file format');
        return null;
    }    if (!extractedText) {
        console.error('Failed to extract text');
        return null;
    }

    console.log('Starting resume parsing...');

    // Generate response from Gemini
    const jsonResponse = await generateResponse(extractedText);
    if (!jsonResponse) {
        console.log('Gemini parsing failed, trying fallback method...');
        const fallbackResult = fallbackParseResume(extractedText);
        if (!fallbackResult) {
            console.error('Both Gemini and fallback parsing failed');
            return null;
        }
        console.log('Resume parsing completed with fallback method');
        return fallbackResult;
    }

    console.log('Resume parsing completed successfully with Gemini');
    return jsonResponse;
}

module.exports = {
    parseResumeFile,
    extractTextFromPdf,
    extractTextFromDocx,
    generateResponse
};
