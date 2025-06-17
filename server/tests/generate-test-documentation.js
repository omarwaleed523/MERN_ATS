/**
 * Test Documentation Generator
 * 
 * This script extracts test information from Jest test files and creates an Excel
 * document with details about each test case including:
 * - Test ID
 * - Description
 * - Details
 * - Prerequisites
 * - Expected Result
 * - Actual Result
 */

const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

// Constants
const TEST_DIRS = [
  path.join(__dirname, 'unit'),
  path.join(__dirname, 'integration'),
  path.join(__dirname, 'e2e')
];
const OUTPUT_FILE = path.join(__dirname, '..', 'test-documentation.xlsx');

// Function to extract test information from a file
function extractTestInfo(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    const fileType = path.dirname(filePath).split(path.sep).pop(); // unit, integration, or e2e
    
    // Extract describe and it blocks
    const tests = [];
    let testId = 1;
    
    // Get all test names first to ensure we're capturing all tests
    const allTestsRegex = /(?:it|test)\(['"`](.*?)['"`]/g;
    const allTestMatches = [...content.matchAll(allTestsRegex)];
    
    console.log(`Found ${allTestMatches.length} tests in ${fileName}`);
    
    // Find all describe blocks to get suite names
    let suites = [];
    const describeRegex = /describe\(['"`](.*?)['"`]/g;
    let describeMatches = [...content.matchAll(describeRegex)];
    
    if (describeMatches.length > 0) {
      // Try to extract individual describe blocks with their content
      let lastDescribeIndex = -1;
      
      for (let i = 0; i < describeMatches.length; i++) {
        const match = describeMatches[i];
        const startIdx = match.index;
        let endIdx;
        
        if (i < describeMatches.length - 1) {
          endIdx = describeMatches[i + 1].index;
        } else {
          endIdx = content.length;
        }
        
        suites.push({
          name: match[1],
          content: content.substring(startIdx, endIdx)
        });
        
        lastDescribeIndex = startIdx;
      }
    }
    
    // If no describes found, use filename as default suite
    if (suites.length === 0) {
      suites.push({
        name: fileName.replace('.test.js', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        content: content
      });
    }
    
    // Alternative approach to find tests - go through all tests regardless of suite structure
    for (const testMatch of allTestMatches) {
      const testName = testMatch[1];
      const testStart = testMatch.index;
      
      // Find the closing brace of this test
      const testContentStart = content.indexOf('{', testStart);
      let bracketCount = 1;
      let testEnd = testContentStart + 1;
      
      // Simple bracket counting to find the matching closing bracket
      while (bracketCount > 0 && testEnd < content.length) {
        if (content[testEnd] === '{') bracketCount++;
        if (content[testEnd] === '}') bracketCount--;
        testEnd++;
      }
      
      const testImplementation = content.substring(testContentStart + 1, testEnd - 1).trim();
      
      // Find which suite this test belongs to
      let suiteName = suites[0].name; // Default to first suite
      for (const suite of suites) {
        if (suite.content.includes(testMatch[0])) {
          suiteName = suite.name;
          break;
        }
      }
      
      // Extract prerequisites
      let prerequisites = "None specified";
      const beforeEachRegex = /beforeEach\(.*?\{([\s\S]*?)\}\)/g;
      const beforeAllRegex = /beforeAll\(.*?\{([\s\S]*?)\}\)/g;
      
      let setupBlocks = [];
      let beforeEachMatch;
      while ((beforeEachMatch = beforeEachRegex.exec(content)) !== null) {
        setupBlocks.push(`beforeEach: ${beforeEachMatch[1].trim()}`);
      }
      
      let beforeAllMatch;
      while ((beforeAllMatch = beforeAllRegex.exec(content)) !== null) {
        setupBlocks.push(`beforeAll: ${beforeAllMatch[1].trim()}`);
      }
      
      if (setupBlocks.length > 0) {
        prerequisites = setupBlocks.join('\n\n');
      }
      
      // Extract expected behavior
      let expectedResult = "Test should pass successfully";
      const expectRegex = /expect\((.*?)\)\.(?:to|not)\.(.*?)(?:\(([^)]*)\))?/g;
      let expectMatches = [];
      let expectMatch;
      
      // Create a copy of the regex for each execution
      const expectRegexCopy = new RegExp(expectRegex);
      while ((expectMatch = expectRegexCopy.exec(testImplementation)) !== null) {
        const subject = expectMatch[1].trim();
        const matcher = expectMatch[2].trim();
        const value = expectMatch[3] ? expectMatch[3].trim() : '';
        
        let expectation = `Expect ${subject} to ${matcher}`;
        if (value) {
          expectation += ` ${value}`;
        }
        expectMatches.push(expectation);
      }
      
      if (expectMatches.length > 0) {
        expectedResult = expectMatches.join('\n');
      }
      
      // Create test id based on type
      const testIdPrefix = fileType === 'unit' ? 'UT' : 
                          fileType === 'integration' ? 'IT' : 'E2E';
      const formattedTestId = `${testIdPrefix}-${fileName.replace('.test.js', '')}-${testId++}`;
      
      // Get implementation details
      let details = testImplementation;
      if (details.length > 500) {
        details = details.substring(0, 497) + '...';
      }
      
      tests.push({
        testId: formattedTestId,
        description: testName,
        details: `${suiteName}: ${testName}`,
        implementation: details,
        prerequisites: prerequisites,
        expectedResult: expectedResult,
        actualResult: "Passed", // Default value
        type: fileType,
        suite: suiteName
      });
    }
    
    return tests;
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
    return [];
  }
}

// Main function to generate Excel documentation
async function generateTestDocumentation() {
  // Create a new workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'MERN ATS Test Documentation Generator';
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.date1904 = true;
  
  // Add a worksheet for all tests
  const allTestsSheet = workbook.addWorksheet('All Tests');
  
  // Define columns
  allTestsSheet.columns = [
    { header: 'Test ID', key: 'testId', width: 15 },
    { header: 'Type', key: 'type', width: 12 },
    { header: 'Suite', key: 'suite', width: 25 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Details', key: 'details', width: 50 },
    { header: 'Prerequisites', key: 'prerequisites', width: 30 },
    { header: 'Expected Result', key: 'expectedResult', width: 40 },
    { header: 'Actual Result', key: 'actualResult', width: 15 }
  ];
  
  // Style the header row
  allTestsSheet.getRow(1).font = { bold: true };
  allTestsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' }
  };
  
  // Add borders to header
  allTestsSheet.getRow(1).eachCell({ includeEmpty: true }, function(cell) {
    cell.border = {
      top: {style:'thin'},
      left: {style:'thin'},
      bottom: {style:'double'},
      right: {style:'thin'}
    };
  });
  
  // Collect all tests
  let allTests = [];
  
  // Process each test directory
  TEST_DIRS.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir)
        .filter(file => file.endsWith('.test.js'))
        .map(file => path.join(dir, file));
      
      files.forEach(file => {
        const tests = extractTestInfo(file);
        allTests = allTests.concat(tests);
      });
    }
  });
  
  // Add all tests to the main sheet
  allTests.forEach(test => {
    allTestsSheet.addRow(test);
  });
  
  // Format the data rows
  for (let i = 2; i <= allTests.length + 1; i++) {
    const row = allTestsSheet.getRow(i);
    
    // Add borders to all cells
    row.eachCell({ includeEmpty: true }, function(cell) {
      cell.border = {
        top: {style:'thin'},
        left: {style:'thin'},
        bottom: {style:'thin'},
        right: {style:'thin'}
      };
    });
    
    // Color coding based on test type
    const type = row.getCell('type').value;
    if (type === 'unit') {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEAF7EA' } // Light green
      };
    } else if (type === 'integration') {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF0F0F8' } // Light blue
      };
    } else if (type === 'e2e') {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFF0F0' } // Light red
      };
    }
  }
  
  // Freeze the header row
  allTestsSheet.views = [
    { state: 'frozen', ySplit: 1 }
  ];
  
  // Create separate worksheets for each test type
  const types = ['unit', 'integration', 'e2e'];
  types.forEach(type => {
    const typeTests = allTests.filter(test => test.type === type);
    if (typeTests.length > 0) {
      const typeSheet = workbook.addWorksheet(type.charAt(0).toUpperCase() + type.slice(1) + ' Tests');
      
      // Copy columns from main sheet
      typeSheet.columns = allTestsSheet.columns;
      
      // Style the header row
      const headerRow = typeSheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD3D3D3' }
      };
      
      // Add borders to header
      headerRow.eachCell({ includeEmpty: true }, function(cell) {
        cell.border = {
          top: {style:'thin'},
          left: {style:'thin'},
          bottom: {style:'double'},
          right: {style:'thin'}
        };
      });
      
      // Add test rows
      typeTests.forEach(test => {
        typeSheet.addRow(test);
      });
      
      // Format the data rows
      for (let i = 2; i <= typeTests.length + 1; i++) {
        const row = typeSheet.getRow(i);
        
        // Add borders to all cells
        row.eachCell({ includeEmpty: true }, function(cell) {
          cell.border = {
            top: {style:'thin'},
            left: {style:'thin'},
            bottom: {style:'thin'},
            right: {style:'thin'}
          };
        });
      }
      
      // Freeze the header row
      typeSheet.views = [
        { state: 'frozen', ySplit: 1 }
      ];
    }
  });
  
  // Add a summary sheet
  const summarySheet = workbook.addWorksheet('Summary', {
    properties: { tabColor: { argb: 'FFFF9900' } }
  });
  
  // Add summary content
  summarySheet.columns = [
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Count', key: 'count', width: 10 }
  ];
  
  // Style the header row
  summarySheet.getRow(1).font = { bold: true };
  summarySheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFD3D3D3' }
  };
    // Add summary data
  summarySheet.addRow({ category: 'Total Tests', count: allTests.length });
  summarySheet.addRow({ category: 'Unit Tests', count: allTests.filter(t => t.type === 'unit').length });
  summarySheet.addRow({ category: 'Integration Tests', count: allTests.filter(t => t.type === 'integration').length });
  summarySheet.addRow({ category: 'E2E Tests', count: allTests.filter(t => t.type === 'e2e').length });
  
  // Format summary cells
  for (let i = 1; i <= 5; i++) {
    const row = summarySheet.getRow(i);
    row.eachCell({ includeEmpty: true }, function(cell) {
      cell.border = {
        top: {style:'thin'},
        left: {style:'thin'},
        bottom: {style:'thin'},
        right: {style:'thin'}
      };
    });
  }
    // Save the workbook
  try {
    await workbook.xlsx.writeFile(OUTPUT_FILE);
    console.log(`Test documentation generated: ${OUTPUT_FILE}`);
    return OUTPUT_FILE;
  } catch (error) {
    if (error.code === 'EBUSY') {
      // File is locked (probably open in Excel)
      const timestamp = new Date().getTime();
      const newFileName = path.join(__dirname, '..', `test-documentation-${timestamp}.xlsx`);
      await workbook.xlsx.writeFile(newFileName);
      console.log(`File was busy. Test documentation generated with new name: ${newFileName}`);
      return newFileName;
    } else {
      throw error;
    }
  }
}

// Run the generator
generateTestDocumentation().catch(err => {
  console.error('Error generating test documentation:', err);
  process.exit(1);
});
