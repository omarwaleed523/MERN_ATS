# MERN ATS - Test Data Requirements

This document outlines all the test data files needed to comprehensively test the MERN ATS system.

## 📁 Directory Structure
```
test-data/
├── resumes/                 # Resume files for candidate testing
├── job-descriptions/        # Job description files for recruiter testing
├── profile-images/          # User profile images
├── test-documents/          # Additional test documents
└── TEST_DATA_REQUIREMENTS.md
```

## 📄 Required Test Files

### 1. Resume Files (`resumes/` directory)
**Format**: PDF and DOCX files
**Purpose**: Test AI resume parsing and candidate functionality

#### Required Resume Files:
1. **software_engineer_resume.pdf** - IT/Software Engineering resume
2. **marketing_manager_resume.docx** - Marketing/Business Development resume
3. **data_scientist_resume.pdf** - Data Science/Analytics resume
4. **ui_ux_designer_resume.docx** - Design/Creative resume
5. **accountant_resume.pdf** - Finance/Accounting resume
6. **hr_manager_resume.docx** - HR/Administrative resume
7. **chef_resume.pdf** - Hospitality/Chef resume
8. **nurse_resume.docx** - Healthcare resume
9. **teacher_resume.pdf** - Education resume
10. **sales_representative_resume.docx** - Sales resume
11. **corrupted_resume.pdf** - Intentionally corrupted file for error testing
12. **empty_resume.docx** - Empty/minimal content for edge case testing

#### Resume Content Requirements:
Each resume should contain:
- **Personal Info**: Name, email, phone number
- **Skills**: 5-10 relevant technical/soft skills
- **Experience**: 2-3 work experiences with:
  - Job title, company name, dates, description
- **Education**: 1-2 educational qualifications with:
  - Degree, university, location, dates
- **Department**: Should map to one of the 24 system categories:
  - ACCOUNTANT, ADVOCATE, AGRICULTURE, APPAREL, ARTS, AUTOMOBILE, AVIATION, BANKING, BPO, BUSINESS-DEVELOPMENT, CHEF, CONSTRUCTION, CONSULTANT, DESIGNER, DIGITAL-MEDIA, ENGINEERING, FINANCE, FITNESS, HEALTHCARE, HR, INFORMATION-TECHNOLOGY, PUBLIC-RELATIONS, SALES, TEACHER

### 2. Job Description Files (`job-descriptions/` directory)
**Format**: PDF and DOCX files
**Purpose**: Test AI job description parsing and recruiter functionality

#### Required Job Description Files:
1. **senior_software_engineer_jd.pdf** - IT position with specific requirements
2. **marketing_coordinator_jd.docx** - Marketing position
3. **data_analyst_jd.pdf** - Analytics position
4. **graphic_designer_jd.docx** - Design position
5. **financial_analyst_jd.pdf** - Finance position
6. **hr_specialist_jd.docx** - HR position
7. **executive_chef_jd.pdf** - Hospitality position
8. **registered_nurse_jd.docx** - Healthcare position
9. **elementary_teacher_jd.pdf** - Education position
10. **sales_manager_jd.docx** - Sales position
11. **invalid_jd.pdf** - Malformed/invalid content for error testing
12. **minimal_jd.docx** - Minimal content for edge case testing

#### Job Description Content Requirements:
Each JD should contain:
- **Job Title**: Clear position title
- **Company**: Company name
- **Location**: Job location (city, state/country)
- **Salary**: Salary range or fixed amount
- **Job Description**: Detailed role description
- **Required Skills**: 5-10 technical/soft skills
- **Experience Requirements**: Previous experience details
- **Education Requirements**: Degree and qualification requirements
- **Department**: Should map to system categories

### 3. Profile Images (`profile-images/` directory)
**Format**: JPEG, PNG, GIF, HEIC
**Purpose**: Test user profile picture upload functionality

#### Required Image Files:
1. **candidate_avatar_1.jpg** - Standard profile image (< 5MB)
2. **candidate_avatar_2.png** - Standard profile image (< 5MB)
3. **recruiter_avatar_1.jpeg** - Standard profile image (< 5MB)
4. **admin_avatar_1.png** - Standard profile image (< 5MB)
5. **large_image.jpg** - Large file (> 10MB) for size limit testing
6. **corrupted_image.png** - Corrupted image file for error testing
7. **unsupported_format.bmp** - Unsupported format for validation testing
8. **small_image.gif** - Very small image for edge case testing

### 4. Test Documents (`test-documents/` directory)
**Format**: Various formats
**Purpose**: Test file validation and edge cases

#### Required Test Files:
1. **text_file.txt** - Plain text file (should be rejected)
2. **excel_file.xlsx** - Excel file (should be rejected)
3. **empty_file.pdf** - Empty PDF file
4. **password_protected.pdf** - Password-protected PDF
5. **large_resume.pdf** - Very large resume file (> 50MB)
6. **non_english_resume.pdf** - Resume in non-English language
7. **malformed_docx.docx** - Corrupted DOCX file
8. **very_long_filename_that_exceeds_normal_limits.pdf** - Long filename test

## 🧪 Test Scenarios Coverage

### Authentication & User Management
- Test all three user roles (Candidate, Recruiter, Administrator)
- Profile picture upload with various formats and sizes
- Invalid credentials and access control testing

### Resume Processing
- AI parsing accuracy across different resume formats
- Department categorization testing
- Error handling for corrupted/invalid files
- Skills extraction and matching

### Job Description Processing
- AI parsing of job requirements
- Salary and location extraction
- Skills and qualification parsing
- Invalid/malformed content handling

### Application Workflow
- Complete candidate application process
- Recruiter review and status updates
- AI similarity scoring between resumes and job descriptions
- Email notification system testing

### Interview Management
- Interview scheduling for all types
- Virtual and physical location handling
- Calendar integration and notifications
- Feedback and decision tracking

### Admin Functionality
- System analytics and reporting
- User management across all roles
- Application oversight and bulk operations
- Database schema management

### File Upload Security
- File type validation
- File size limits
- Malicious file detection
- Storage and retrieval testing

### API Endpoint Testing
- All CRUD operations for each entity
- Authentication and authorization
- Error handling and edge cases
- Bulk operations and performance

## 📊 Success Criteria

1. **Resume Parsing**: 90%+ accuracy in extracting structured data
2. **Job Matching**: Meaningful similarity scores between candidates and jobs
3. **File Handling**: Proper validation and error messages for invalid files
4. **User Flows**: Complete end-to-end workflows for all user types
5. **Security**: Proper access control and data protection
6. **Performance**: Reasonable response times for all operations
7. **Email System**: Successful delivery of notifications (test or real)
8. **Error Handling**: Graceful degradation and informative error messages

## 🔧 Setup Instructions

1. Place all test files in their respective directories
2. Ensure file naming matches the specifications above
3. Verify file formats and sizes meet requirements
4. Test with both valid and invalid data scenarios
5. Document any issues or unexpected behaviors during testing

## 📝 Notes

- All test files should be realistic and representative of actual use cases
- Include edge cases and error scenarios for comprehensive testing
- Maintain consistent naming conventions for easy identification
- Update this document as new test scenarios are identified
