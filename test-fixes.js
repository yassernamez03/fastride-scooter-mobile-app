// Test script to validate fixes
console.log('Testing fixes...');

// Test 1: Check if files exist and are valid
const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'app/(tabs)/scan.tsx',
  'components/ui/WeatherWidget.tsx', 
  'components/map/ScooterMarker.tsx',
  'context/ToastContext.tsx'
];

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for common issues
    const hasHardcodedWhite = content.includes("backgroundColor: 'white'") || content.includes('backgroundColor: "#FFFFFF"');
    const hasRouterBackWithoutCheck = content.includes('router.back()') && !content.includes('router && router.back');
    
    console.log(`${file}:`);
    console.log(`  - Hardcoded white background: ${hasHardcodedWhite ? '❌ FOUND' : '✅ NONE'}`);
    console.log(`  - Unsafe router.back(): ${hasRouterBackWithoutCheck ? '❌ FOUND' : '✅ SAFE'}`);
  } else {
    console.log(`${file}: ❌ FILE NOT FOUND`);
  }
});

console.log('\nTest completed!');
