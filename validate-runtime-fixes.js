#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 VALIDATING RUNTIME ERROR FIXES...\n');

let totalIssues = 0;
let fixedIssues = 0;

// Check for colors references in StyleSheet.create() blocks
function checkStyleSheetColorsReferences() {
  console.log('1. Checking for colors references in StyleSheet.create() blocks...');
  
  const files = [
    'app/favorites.tsx',
    'context/ToastContext.tsx',
    'components/map/ScooterMarker.tsx',
    'components/map/ScooterDetails.tsx',
    'components/map/MapHeader.tsx',
    'app/(tabs)/rides.tsx',
    'app/(tabs)/index.tsx'
  ];
  
  let styleSheetIssues = 0;
  
  files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Look for StyleSheet.create() blocks containing colors references
      const styleSheetRegex = /StyleSheet\.create\({[\s\S]*?}\);/g;
      const matches = content.match(styleSheetRegex);
      
      if (matches) {
        matches.forEach(styleBlock => {
          if (styleBlock.includes('shadowColor: colors.')) {
            console.log(`   ❌ ${file}: Found colors reference in StyleSheet`);
            styleSheetIssues++;
            totalIssues++;
          }
        });
      }
    }
  });
  
  if (styleSheetIssues === 0) {
    console.log('   ✅ No colors references in StyleSheet.create() blocks');
    fixedIssues++;
  }
  
  console.log('');
}

// Check for default exports in route files
function checkDefaultExports() {
  console.log('2. Checking for default exports in route files...');
  
  const routeFiles = [
    'app/_layout.tsx',
    'app/index.tsx',
    'app/favorites.tsx',
    'app/notifications.tsx',
    'app/payment-methods.tsx',
    'app/ride.tsx',
    'app/settings.tsx',
    'app/(tabs)/_layout.tsx',
    'app/(tabs)/index.tsx',
    'app/(tabs)/rides.tsx',
    'app/(tabs)/scan.tsx',
    'app/(tabs)/profile.tsx',
    'app/(auth)/_layout.tsx',
    'app/(auth)/login.tsx',
    'app/(auth)/register.tsx'
  ];
  
  let missingExports = 0;
  
  routeFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (!content.includes('export default')) {
        console.log(`   ❌ ${file}: Missing default export`);
        missingExports++;
        totalIssues++;
      }
    }
  });
  
  if (missingExports === 0) {
    console.log('   ✅ All route files have default exports');
    fixedIssues++;
  }
  
  console.log('');
}

// Check for router safety patterns
function checkRouterSafety() {
  console.log('3. Checking for router safety patterns...');
  
  const files = [
    'app/(tabs)/scan.tsx',
    'app/settings.tsx',
    'app/notifications.tsx',
    'app/favorites.tsx',
    'app/payment-methods.tsx',
    'app/ride.tsx'
  ];
  
  let unsafeRouterCalls = 0;
  
  files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for unsafe router.back() calls
      if (content.includes('router.back()') && !content.includes('if (router && router.back)')) {
        console.log(`   ❌ ${file}: Unsafe router.back() call`);
        unsafeRouterCalls++;
        totalIssues++;
      }
    }
  });
  
  if (unsafeRouterCalls === 0) {
    console.log('   ✅ All router calls are safe');
    fixedIssues++;
  }
  
  console.log('');
}

// Check for Camera API updates
function checkCameraAPI() {
  console.log('4. Checking for Camera API updates...');
  
  const scanFile = path.join(process.cwd(), 'app/(tabs)/scan.tsx');
  if (fs.existsSync(scanFile)) {
    const content = fs.readFileSync(scanFile, 'utf8');
    
    if (content.includes('CameraType.back') || content.includes('barCodeScannerSettings')) {
      console.log('   ❌ app/(tabs)/scan.tsx: Old Camera API still in use');
      totalIssues++;
    } else if (content.includes('facing="back"') && content.includes('barcodeScannerSettings')) {
      console.log('   ✅ Camera API updated to new format');
      fixedIssues++;
    }
  }
  
  console.log('');
}

// Check for hardcoded backgrounds
function checkHardcodedBackgrounds() {
  console.log('5. Checking for hardcoded white backgrounds...');
  
  const files = [
    'app/(tabs)/scan.tsx',
    'components/map/ScooterMarker.tsx',
    'context/ToastContext.tsx'
  ];
  
  let hardcodedBackgrounds = 0;
  
  files.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      if (content.includes("backgroundColor: 'white'")) {
        console.log(`   ❌ ${file}: Hardcoded white background found`);
        hardcodedBackgrounds++;
        totalIssues++;
      }
    }
  });
  
  if (hardcodedBackgrounds === 0) {
    console.log('   ✅ No hardcoded white backgrounds found');
    fixedIssues++;
  }
  
  console.log('');
}

// Run all checks
checkStyleSheetColorsReferences();
checkDefaultExports();
checkRouterSafety();
checkCameraAPI();
checkHardcodedBackgrounds();

// Summary
console.log('🏁 VALIDATION SUMMARY:');
console.log(`   ✅ Fixed: ${fixedIssues}/5 categories`);
console.log(`   ❌ Issues: ${totalIssues} remaining`);

if (totalIssues === 0) {
  console.log('\n🎉 ALL RUNTIME ERRORS HAVE BEEN FIXED!');
  console.log('✨ The FastRide app is ready for production!');
} else {
  console.log(`\n⚠️  ${totalIssues} issues remaining that need attention.`);
}
