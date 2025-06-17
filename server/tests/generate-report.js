const fs = require('fs');
const path = require('path');

// Read the coverage report
const coveragePath = path.join(__dirname, '..', 'coverage', 'coverage-final.json');
const lcovPath = path.join(__dirname, '..', 'coverage', 'lcov-report', 'index.html');

try {
  const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
  
  // Extract overall stats
  const stats = {
    total: 0,
    covered: 0,
    files: [],
  };
  
  // Process each file
  Object.keys(coverage).forEach(file => {
    const fileData = coverage[file];
    const fileName = path.relative(path.join(__dirname, '..'), file);
    
    const fileStats = {
      name: fileName,
      statements: {
        total: Object.keys(fileData.statementMap).length,
        covered: 0,
      },
      branches: {
        total: Object.keys(fileData.branchMap).length,
        covered: 0,
      },
      functions: {
        total: Object.keys(fileData.fnMap).length,
        covered: 0,
      },
    };
    
    // Count covered statements
    Object.keys(fileData.s).forEach(s => {
      if (fileData.s[s] > 0) fileStats.statements.covered++;
    });
    
    // Count covered branches
    Object.keys(fileData.b).forEach(b => {
      const branches = fileData.b[b];
      let coveredBranches = 0;
      branches.forEach(count => {
        if (count > 0) coveredBranches++;
      });
      if (coveredBranches === branches.length) fileStats.branches.covered++;
    });
    
    // Count covered functions
    Object.keys(fileData.f).forEach(f => {
      if (fileData.f[f] > 0) fileStats.functions.covered++;
    });
    
    // Calculate percentages
    fileStats.statements.percentage = Math.round((fileStats.statements.covered / fileStats.statements.total) * 100) || 0;
    fileStats.branches.percentage = Math.round((fileStats.branches.covered / fileStats.branches.total) * 100) || 0;
    fileStats.functions.percentage = Math.round((fileStats.functions.covered / fileStats.functions.total) * 100) || 0;
    fileStats.overall = Math.round(
      (fileStats.statements.percentage + fileStats.branches.percentage + fileStats.functions.percentage) / 3
    );
    
    stats.files.push(fileStats);
    
    // Add to totals
    stats.total += fileStats.statements.total + fileStats.branches.total + fileStats.functions.total;
    stats.covered += fileStats.statements.covered + fileStats.branches.covered + fileStats.functions.covered;
  });
  
  // Calculate overall coverage
  stats.percentage = Math.round((stats.covered / stats.total) * 100) || 0;
  
  // Sort files by coverage (lowest first)
  stats.files.sort((a, b) => a.overall - b.overall);
  
  // Create report
  const report = {
    timestamp: new Date().toISOString(),
    overallCoverage: stats.percentage,
    fileCount: stats.files.length,
    lowCoverageFiles: stats.files.filter(f => f.overall < 50).map(f => f.name),
    fullReport: lcovPath,
    files: stats.files.map(f => ({
      name: f.name,
      overallCoverage: f.overall,
      statementCoverage: f.statements.percentage,
      branchCoverage: f.branches.percentage,
      functionCoverage: f.functions.percentage,
    })),
  };
  
  // Write report to file
  fs.writeFileSync(
    path.join(__dirname, '..', 'coverage-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log(`\n✅ Test Report Generated: ${path.join(__dirname, '..', 'coverage-report.json')}`);
  console.log(`\n📊 Overall Coverage: ${stats.percentage}%`);
  console.log(`\n🔍 Full HTML Report: ${lcovPath}`);
  
  if (report.lowCoverageFiles.length > 0) {
    console.log('\n⚠️ Files with coverage below 50%:');
    report.lowCoverageFiles.forEach(file => {
      console.log(`  - ${file}`);
    });
  }
  
} catch (err) {
  console.error('Failed to generate test report:', err.message);
}
