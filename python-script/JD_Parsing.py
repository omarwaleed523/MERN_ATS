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
2. **Skills**: List technical/soft skills (max 15, required)
3. **Experience**: Extract required experience with:
   - **Title**: Position name (e.g., "Senior Accountant")
   - **Company**: Leave this field empty (do not use "Required Experience")
   - **Dates**: Duration format (e.g., "3-5 years")
   - **Description**: Specific responsibilities or achievements (bullet points or sentences)
4. **Education**: Extract required education with:
   - **Degree**: Qualification name (e.g., "Master of Science in Accounting")
   - **University**: Name of the institution (e.g., "New York University")
   - **Location**: Country/region if specified (e.g., "New York, NY")
5. **Department**: Categorize using exactly these options:
   {departments}

Return VALID JSON only. Follow this structure exactly:
{{
  "JobTitle": "",
  "Skills": [],
  "Experience": [
    {{
      "Title": "",
      "Company": "",
      "Dates": "",
      "description": ""
    }}
  ],
  "Education": [
    {{
      "Degree": "",
      "University": "",
      "Location": ""
    }}
  ],
  "Department": ""
}}

Example Input:
Job Title: Senior Accountant
Department: ACCOUNTANT
Location: New York, NY
________________________________________
Job Description:
We are seeking a detail-oriented Senior Accountant to join our finance team. The ideal candidate will have extensive experience in corporate accounting and financial reporting.
________________________________________
Key Skills Required:
• Advanced knowledge of GAAP
• Proficiency in QuickBooks and SAP
• Advanced Excel skills (PivotTables, VLOOKUP)
• Tax preparation and compliance
• Financial statement analysis
• Accounts payable/receivable management
• Budget forecasting
• Audit preparation
________________________________________
Experience Requirements:
1. Senior Accountant
Duration: 3-5 years
• Managed full-cycle accounting for $10M+ organization
• Prepared monthly financial statements and reports
• Led annual audit processes with external firms
• Supervised team of 3 junior accountants
2. Junior Accountant
Duration: 2+ years
• Processed accounts payable/receivable
• Assisted with monthly closing procedures
• Maintained general ledger accounts
• Performed bank reconciliations
________________________________________
Education Requirements:
1. Master of Science in Accounting
University: New York University
Location: New York, NY
2. Bachelor of Business Administration (Accounting)
University: Baruch College
Location: New York, NY
3. Certified Public Accountant (CPA)
University: American Institute of CPAs
Location: United States
________________________________________
Additional Requirements:
• Strong understanding of tax regulations (IRS/SEC)
• Experience with ERP systems implementation
• Excellent communication skills for cross-department collaboration

Example Output:
{{
  "JobTitle": "Senior Accountant",
  "Skills": [
    "Advanced knowledge of GAAP",
    "Proficiency in QuickBooks and SAP",
    "Advanced Excel skills (PivotTables, VLOOKUP)",
    "Tax preparation and compliance",
    "Financial statement analysis",
    "Accounts payable/receivable management",
    "Budget forecasting",
    "Audit preparation",
    "Strong understanding of tax regulations (IRS/SEC)",
    "Experience with ERP systems implementation",
    "Excellent communication skills"
  ],
  "Experience": [
    {{
      "Title": "Senior Accountant",
      "Company": "",
      "Dates": "3-5 years",
      "description": "Managed full-cycle accounting for $10M+ organization; Prepared monthly financial statements and reports; Led annual audit processes with external firms; Supervised team of 3 junior accountants"
    }},
    {{
      "Title": "Junior Accountant",
      "Company": "",
      "Dates": "2+ years",
      "description": "Processed accounts payable/receivable; Assisted with monthly closing procedures; Maintained general ledger accounts; Performed bank reconciliations"
    }}
  ],
  "Education": [
    {{
      "Degree": "Master of Science in Accounting",
      "University": "New York University",
      "Location": "New York, NY"
    }},
    {{
      "Degree": "Bachelor of Business Administration (Accounting)",
      "University": "Baruch College",
      "Location": "New York, NY"
    }},
    {{
      "Degree": "Certified Public Accountant (CPA)",
      "University": "American Institute of CPAs",
      "Location": "United States"
    }}
  ],
  "Department": "ACCOUNTANT"
}}
""".format(departments=VALID_DEPARTMENTS)

def extract_text(file_path):
    """Extract text from PDF/DOCX/TXT files with error handling."""
    try:
        if file_path.endswith('.pdf'):
            return extract_pdf_text(file_path)
        elif file_path.endswith('.docx'):
            text = docx2txt.process(file_path)
            return text.replace('\t', ' ')
        elif file_path.endswith('.txt'):
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        raise ValueError("Unsupported file format")
    except Exception as e:
        print(f"Text extraction error: {str(e)}", file=sys.stderr)
        return None

def validate_structure(data):
    """Validate the parsed JSON structure."""
    required_fields = ['JobTitle', 'Skills', 'Experience', 'Education', 'Department']
    if not all(field in data for field in required_fields):
        return False
    return data['Department'] in VALID_DEPARTMENTS

def parse_jd(text):
    """Parse JD text using Gemini with enhanced error handling."""
    try:
        response = MODEL.generate_content([PROMPT_TEMPLATE, text])
        json_match = re.search(r'```json(.*?)```', response.text, re.DOTALL) or \
                     re.search(r'\{.*\}', response.text, re.DOTALL)
        
        if not json_match:
            return None
            
        json_str = json_match.group(1) or json_match.group(0)
        parsed = json.loads(json_str.strip())
        
        return parsed if validate_structure(parsed) else None
        
    except Exception as e:
        print(f"Parsing error: {str(e)}", file=sys.stderr)
        return None

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python JD_Parsing.py <file_path>", file=sys.stderr)
        sys.exit(1)

    try:
        text = extract_text(sys.argv[1])
        if not text:
            sys.exit(1)
            
        result = parse_jd(text)
        if result:
            print(json.dumps(result))  # Only JSON output to stdout
            sys.exit(0)
            
        sys.exit(1)
        
    except Exception as e:
        print(f"Critical error: {str(e)}", file=sys.stderr)
        sys.exit(1)