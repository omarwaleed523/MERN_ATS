# MERN ATS - Python Scripts

AI-powered document processing scripts for the MERN ATS system, utilizing Google Gemini AI for intelligent parsing of resumes and job descriptions.

## 🤖 Overview

This directory contains Python scripts that integrate with the Node.js backend to provide:
- **Resume Parsing**: Extract structured data from PDF and DOCX resume files
- **Job Description Parsing**: Analyze and structure job posting requirements
- **AI-Powered Processing**: Leverage Google Gemini AI for intelligent text analysis

## 📁 Files Structure

```
python-script/
├── Resume_Parsing.py         # Main resume parsing script
├── JD_Parsing.py            # Job description parsing script
├── test.docx                # Test document for validation
└── sample-documents/        # Sample job descriptions
    ├── Arts Job description.docx
    ├── Chef Job description.docx
    ├── CyberSecurity analyst job post.docx
    ├── data engineer job post.docx
    ├── Fitness Job description.docx
    └── Front end job post.docx
```

## 🛠️ Technology Stack

### Core Libraries
- **google-generativeai**: Google Gemini AI integration
- **PyPDF2**: PDF text extraction
- **python-docx**: DOCX document processing
- **json**: JSON data handling
- **sys/os**: System operations and file handling

### AI Integration
- **Google Gemini 2.0 Flash**: Latest Gemini model for text analysis
- **Custom Prompts**: Structured prompts for consistent data extraction
- **Error Handling**: Robust error management for AI responses

## 🚀 Prerequisites

### Python Requirements
- **Python 3.8+** installed on your system
- **pip** package manager

### Required Packages
```bash
pip install google-generativeai PyPDF2 python-docx
```

### Environment Setup
Ensure the following environment variable is set:
```bash
REACT_APP_GEMINI_KEY=your_google_gemini_api_key
```

## 📄 Resume Parsing Script

### `Resume_Parsing.py`

#### Purpose
Extracts structured information from resume files (PDF/DOCX) and categorizes candidates by department.

#### Supported Formats
- **.pdf**: Portable Document Format
- **.docx**: Microsoft Word Document

#### Output Schema
```json
{
  "Name": "John Doe",
  "Email": "john.doe@email.com",
  "Phone": "+1234567890",
  "Skills": ["JavaScript", "React", "Node.js"],
  "Experience": [
    {
      "Title": "Software Developer",
      "Company": "Tech Corp",
      "Dates": "2020-2023",
      "description": "Developed web applications..."
    }
  ],
  "Education": [
    {
      "Degree": "Bachelor of Computer Science",
      "University": "State University",
      "Location": "City, State"
    }
  ],
  "Department": "INFORMATION-TECHNOLOGY",
  "ResumeText": "Full resume content..."
}
```

#### Department Categories
The script categorizes resumes into 24 departments:
- ACCOUNTING
- ADVOCATE
- ARTS
- AUTOMOBILE
- AVIATION
- BANKING
- BPO
- BUSINESS-DEVELOPMENT
- CHEF
- CONSTRUCTION
- CONSULTANT
- DESIGNER
- DIGITAL-MEDIA
- ENGINEERING
- FINANCE
- FITNESS
- HEALTHCARE
- HR
- INFORMATION-TECHNOLOGY
- PUBLIC-RELATIONS
- SALES
- TEACHER

#### Usage
```bash
python Resume_Parsing.py <path_to_resume_file>
```

#### Example
```bash
python Resume_Parsing.py "/uploads/john_doe_resume.pdf"
```

#### Error Handling
- Invalid file format detection
- PDF/DOCX parsing errors
- AI response validation
- JSON formatting verification

## 📋 Job Description Parsing Script

### `JD_Parsing.py`

#### Purpose
Analyzes job descriptions and extracts structured requirements including skills, experience, and education criteria.

#### Output Schema
```json
{
  "JobTitle": "Senior Software Developer",
  "Salary": 75000,
  "Location": "New York, NY",
  "JobDescription": "Full job description text...",
  "Company": "Tech Solutions Inc",
  "Skills": ["Python", "Django", "PostgreSQL"],
  "Experience": [
    {
      "Title": "Software Developer",
      "Company": "Any tech company",
      "Dates": "3+ years",
      "Description": "Web development experience"
    }
  ],
  "Education": [
    {
      "Degree": "Bachelor's in Computer Science",
      "University": "Accredited institution",
      "Location": "Any location"
    }
  ],
  "Department": "INFORMATION-TECHNOLOGY"
}
```

#### Usage
```bash
python JD_Parsing.py <path_to_job_description_file>
```

#### Example
```bash
python JD_Parsing.py "/uploads/software_developer_jd.docx"
```

## 🔧 Integration with Node.js

### Python Runner Utilities

#### Resume Processing Integration
```javascript
// server/utils/pythonRunnerResume.js
const { spawn } = require('child_process');

const runPythonScript = (filePath) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [
      '../python-script/Resume_Parsing.py', 
      filePath
    ]);
    
    let output = '';
    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(output);
          resolve(result);
        } catch (error) {
          reject(new Error('Invalid JSON output'));
        }
      } else {
        reject(new Error(`Python script failed with code ${code}`));
      }
    });
  });
};
```

#### Job Description Processing Integration
```javascript
// server/utils/pythonRunnerJD.js
const runPythonScript = (filePath) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, '..', '..', 'python-script', 'JD_Parsing.py');
    const pythonProcess = spawn('python', [scriptPath, filePath]);
    
    // Similar implementation for JD processing
  });
};
```

## 🤖 AI Prompt Engineering

### Resume Parsing Prompt
```python
PROMPT_TEMPLATE = """
Analyze this resume and extract structured data. Follow these rules:

1. **Name**: Extract full name (required)
2. **Email**: Valid email address (required)
3. **Phone**: Phone number in any format (required)
4. **Skills**: List technical/soft skills (max 15, required)
5. **Experience**: Extract work experience with:
   - **Title**: Job position
   - **Company**: Company name
   - **Dates**: Employment period
   - **description**: Job responsibilities
6. **Education**: Extract education with:
   - **Degree**: Qualification name
   - **University**: Institution name
   - **Location**: Location if specified
7. **Department**: Categorize using exactly these options: {departments}
8. **ResumeText**: Include full resume text in cleaned format

Output valid JSON only.
"""
```

### Job Description Parsing Prompt
```python
PROMPT_TEMPLATE = """
Analyze this job description and extract structured data:

1. **JobTitle**: Official position title (required)
2. **Salary**: Extract salary range or amount (numeric, required)
3. **Location**: Job location (required)
4. **JobDescription**: Full description (required)
5. **Company**: Company name (required)
6. **Skills**: Required technical/soft skills (max 15)
7. **Experience**: Required experience with structure
8. **Education**: Required education with structure
9. **Department**: Categorize using: {departments}

Return valid JSON only.
"""
```

## 🧪 Testing

### Test Resume Processing
```bash
# Test with sample resume
python Resume_Parsing.py test.docx
```

### Test Job Description Processing
```bash
# Test with sample job description
python JD_Parsing.py "Arts Job description.docx"
```

### Validation Script
```python
def validate_output(json_output):
    required_fields = ['Name', 'Email', 'Phone', 'Skills', 'Department']
    for field in required_fields:
        if field not in json_output:
            raise ValueError(f"Missing required field: {field}")
    
    if not isinstance(json_output['Skills'], list):
        raise ValueError("Skills must be a list")
    
    # Additional validation...
```

## 🔍 Debugging

### Common Issues

1. **File Format Errors**
   ```python
   if not file_path.endswith(('.pdf', '.docx')):
       print("Unsupported file format", file=sys.stderr)
       sys.exit(1)
   ```

2. **AI Response Parsing**
   ```python
   try:
       json_response = json.loads(ai_output)
   except json.JSONDecodeError:
       # Clean and retry parsing
       cleaned_output = clean_json_response(ai_output)
       json_response = json.loads(cleaned_output)
   ```

3. **Text Extraction Issues**
   ```python
   def extract_text_from_pdf(file_path):
       try:
           with open(file_path, 'rb') as file:
               reader = PyPDF2.PdfReader(file)
               text = ""
               for page in reader.pages:
                   text += page.extract_text()
               return text
       except Exception as e:
           print(f"Error extracting PDF: {e}", file=sys.stderr)
           return None
   ```

### Debug Mode
```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def debug_extraction(file_path):
    logger.debug(f"Processing file: {file_path}")
    text = extract_text(file_path)
    logger.debug(f"Extracted text length: {len(text)}")
    # Continue debugging...
```

## 🚀 Performance Optimization

### Batch Processing
```python
def process_multiple_resumes(file_paths):
    results = []
    for file_path in file_paths:
        try:
            result = process_single_resume(file_path)
            results.append(result)
        except Exception as e:
            logger.error(f"Error processing {file_path}: {e}")
    return results
```

### Caching AI Responses
```python
import hashlib
import pickle

def get_cached_result(text_hash):
    cache_file = f"cache/{text_hash}.pkl"
    if os.path.exists(cache_file):
        with open(cache_file, 'rb') as f:
            return pickle.load(f)
    return None

def cache_result(text_hash, result):
    os.makedirs("cache", exist_ok=True)
    with open(f"cache/{text_hash}.pkl", 'wb') as f:
        pickle.dump(result, f)
```

## 📊 Error Handling & Logging

### Comprehensive Error Handling
```python
def safe_process_document(file_path):
    try:
        # Validate file exists
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        
        # Extract text
        text = extract_text(file_path)
        if not text or len(text.strip()) == 0:
            raise ValueError("No text extracted from document")
        
        # Process with AI
        result = process_with_ai(text)
        validate_result(result)
        
        return result
        
    except Exception as e:
        logger.error(f"Error processing {file_path}: {str(e)}")
        return {"error": str(e)}
```

## 🔐 Security Considerations

### Input Validation
```python
def validate_file_path(file_path):
    # Prevent directory traversal
    if ".." in file_path or file_path.startswith("/"):
        raise ValueError("Invalid file path")
    
    # Check file size
    if os.path.getsize(file_path) > 10 * 1024 * 1024:  # 10MB limit
        raise ValueError("File too large")
```

### API Key Security
```python
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv('REACT_APP_GEMINI_KEY')
if not GEMINI_API_KEY:
    raise ValueError("Gemini API key not found in environment variables")
```

## 🤝 Contributing

1. **Follow Python PEP 8** style guidelines
2. **Add type hints** for better code documentation
3. **Write comprehensive tests** for new features
4. **Update prompts carefully** - test thoroughly before deployment
5. **Handle edge cases** in document processing
6. **Maintain backward compatibility** with existing integrations

## 📞 Support

For Python script issues:
- Check Python version compatibility
- Verify all required packages are installed
- Ensure API keys are properly configured
- Test with sample documents first
- Check file permissions and paths
- Review error logs for detailed information
