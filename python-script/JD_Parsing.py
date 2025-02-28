import sys
import json
import re
from pdfminer.high_level import extract_text as extract_pdf_text
import docx2txt
import google.generativeai as genai
import os

# Environment configuration
os.environ['GRPC_ENABLE_FORK_SUPPORT'] = '0'

# Constants
VALID_DEPARTMENTS = [
    "ACCOUNTANT", "ADVOCATE", "AGRICULTURE", "APPAREL", "ARTS", "AUTOMOBILE",
    "AVIATION", "BANKING", "BPO", "BUSINESS-DEVELOPMENT", "CHEF", "CONSTRUCTION",
    "CONSULTANT", "DESIGNER", "DIGITAL-MEDIA", "ENGINEERING", "FINANCE", "FITNESS",
    "HEALTHCARE", "HR", "INFORMATION-TECHNOLOGY", "PUBLIC-RELATIONS", "SALES", "TEACHER"
]

# Configure Gemini
GEMINI_API_KEY = "AIzaSyA5l9-6IZvEZTbKvJsyAKQq8wkpNET_h6o"
genai.configure(api_key=GEMINI_API_KEY)
MODEL = genai.GenerativeModel('models/gemini-2.0-flash')

PROMPT_TEMPLATE = """
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
   {departments}

Return VALID JSON only. Follow this structure exactly:
{{
  "jobTitle": "",
  "salary": 0,
  "location": "",
  "jobDescription": "",
  "company": "",
  "skills": [],
  "experience": [
    {{
      "title": "",
      "company": "",
      "dates": "",
      "description": ""
    }}
  ],
  "education": [
    {{
      "degree": "",
      "university": "",
      "location": ""
    }}
  ],
  "department": ""
}}

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
{{
  "jobTitle": "Senior Software Engineer",
  "salary": 120000,
  "location": "San Francisco, CA",
  "jobDescription": "We are seeking an experienced Senior Software Engineer to join our dynamic team...",
  "company": "Tech Solutions Inc.",
  "skills": ["JavaScript", "React", "Node.js", "MongoDB", "AWS"],
  "experience": [
    {{
      "title": "Software Engineer",
      "company": "Previous Tech Corp",
      "dates": "3+ years",
      "description": "Led development of scalable web applications"
    }}
  ],
  "education": [
    {{
      "degree": "Bachelor of Science in Computer Science",
      "university": "Stanford University",
      "location": "Stanford, CA"
    }}
  ],
  "department": "INFORMATION-TECHNOLOGY"
}}
""".format(departments=VALID_DEPARTMENTS)

def extract_text(file_path):
    """Extract text from PDF/DOCX files with enhanced error handling"""
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}", file=sys.stderr)
        return None

    try:
        if file_path.endswith('.pdf'):
            return extract_pdf_text(file_path)
        elif file_path.endswith('.docx'):
            return docx2txt.process(file_path)
        else:
            print(f"Unsupported file format: {file_path}", file=sys.stderr)
            return None
    except Exception as e:
        print(f"Text extraction error: {str(e)}", file=sys.stderr)
        return None

def validate_json_structure(data):
    """Validate the parsed JSON structure"""
    required_fields = {
        'jobTitle': str,
        'salary': (int, float),
        'location': str,
        'jobDescription': str,
        'company': str,
        'skills': list,
        'department': str
    }

    try:
        for field, field_type in required_fields.items():
            if field not in data:
                print(f"Missing required field: {field}", file=sys.stderr)
                return False
            if not isinstance(data[field], field_type):
                print(f"Invalid type for field {field}", file=sys.stderr)
                return False
        
        if data['department'] not in VALID_DEPARTMENTS:
            print(f"Invalid department: {data['department']}", file=sys.stderr)
            return False

        return True
    except Exception as e:
        print(f"Validation error: {str(e)}", file=sys.stderr)
        return False

def parse_jd(text):
    """Parse job description text using Gemini"""
    try:
        response = MODEL.generate_content([PROMPT_TEMPLATE, text])
        
        # Extract JSON from response
        json_str = response.text.strip()
        if json_str.startswith('```json'):
            json_str = json_str[7:-3]  # Remove ```json and ``` markers
        elif json_str.startswith('```'):
            json_str = json_str[3:-3]  # Remove ``` markers
            
        parsed_data = json.loads(json_str)
        
        if validate_json_structure(parsed_data):
            return parsed_data
        return None

    except Exception as e:
        print(f"Parsing error: {str(e)}", file=sys.stderr)
        return None

def main():
    """Main function with proper error handling"""
    if len(sys.argv) != 2:
        print("Usage: python JD_Parsing.py <file_path>", file=sys.stderr)
        sys.exit(1)

    file_path = sys.argv[1]
    
    # Extract text
    text = extract_text(file_path)
    if not text:
        sys.exit(1)

    # Parse JD
    result = parse_jd(text)
    if not result:
        sys.exit(1)

    # Output JSON to stdout
    print(json.dumps(result))
    sys.exit(0)

if __name__ == "__main__":
    main()