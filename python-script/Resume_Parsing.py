import sys
import json
import re
from pdfminer.high_level import extract_text as extract_pdf_text
import docx2txt
import google.generativeai as genai
import os

# Suppress gRPC warnings
os.environ['GRPC_ENABLE_FORK_SUPPORT'] = '0'

# Configure Gemini API
GEMINI_API_KEY = "AIzaSyA5l9-6IZvEZTbKvJsyAKQq8wkpNET_h6o"
genai.configure(api_key=GEMINI_API_KEY)

# Instruction for the Gemini model
INSTRUCTION = """
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
    Department: String
});
  Make sure to categorize based on the related skills, education, and experience with one of the 24 departments mentioned.
Ensure you return names, emails, and phone numbers even if they aren't explicitly labeled in the text.
If missing, use placeholders like 'John Doe', '0123456789', 'example@gmail.com'.
Return the data in JSON format with these fields as keys.
"""

# Initialize Gemini model
MODEL = genai.GenerativeModel("models/gemini-2.0-flash", system_instruction=INSTRUCTION)


def extract_text_from_pdf(pdf_path):
    """Extract text from a PDF file."""
    try:
        return extract_pdf_text(pdf_path)
    except Exception as e:
        print(f"Error extracting text from PDF: {e}", file=sys.stderr)
        return None


def extract_text_from_docx(docx_path):
    """Extract text from a DOCX file."""
    try:
        txt = docx2txt.process(docx_path)
        if txt:
            return txt.replace('\t', ' ')  # Replace tabs with spaces
        return None
    except Exception as e:
        print(f"Error extracting text from DOCX: {e}", file=sys.stderr)
        return None


def generate_response(extracted_text):
    """Generate response from Gemini based on extracted text."""
    try:
        response = MODEL.generate_content(extracted_text)

        # Extract JSON from the response
        json_pattern = r'\{.*\}'
        matches = re.findall(json_pattern, response.text, re.DOTALL)

        if matches:
            clean_response_text = matches[0]
            try:
                json_response = json.loads(clean_response_text)
                return json_response
            except json.JSONDecodeError:
                print("Error decoding JSON response from the model.", file=sys.stderr)
        else:
            print("No valid JSON found in the response.", file=sys.stderr)
    except Exception as e:
        print(f"Error generating response from Gemini: {e}", file=sys.stderr)
    return None


def main():
    if len(sys.argv) != 2:
        print("Usage: python Resume_Parsing.py <file_path>", file=sys.stderr)
        sys.exit(1)

    file_path = sys.argv[1]
    extracted_text = None

    # Extract text based on file type
    if file_path.endswith('.pdf'):
        extracted_text = extract_text_from_pdf(file_path)
    elif file_path.endswith('.docx'):
        extracted_text = extract_text_from_docx(file_path)
    else:
        print("Unsupported file format", file=sys.stderr)
        sys.exit(1)

    if extracted_text:
        # Generate response from Gemini
        json_response = generate_response(extracted_text)
        if json_response:
            print(json.dumps(json_response))  # Print only the JSON output
        else:
            print("Failed to generate response", file=sys.stderr)
    else:
        print("Failed to extract text", file=sys.stderr)


if __name__ == "__main__":
    main()