// Browser console script - paste this into your existing browser's DevTools console
// This will automatically test the signup form in your current tab

console.log('🎯 Starting Signup Demo in Current Tab...');

// Function to find and fill form fields
function fillSignupForm() {
  // Look for username field
  const usernameField = document.querySelector('input[placeholder*="username" i], input[placeholder*="user" i]');
  if (usernameField) {
    usernameField.value = 'demouser123';
    usernameField.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('✅ Filled username field');
  }

  // Look for email field
  const emailField = document.querySelector('input[placeholder*="email" i], input[type="email"]');
  if (emailField) {
    emailField.value = 'demo@example.com';
    emailField.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('✅ Filled email field');
  }

  // Look for password fields
  const passwordFields = document.querySelectorAll('input[type="password"], input[placeholder*="password" i]');
  passwordFields.forEach((field, index) => {
    field.value = 'DemoPassword123!';
    field.dispatchEvent(new Event('input', { bubbles: true }));
    console.log(`✅ Filled password field ${index + 1}`);
  });

  console.log('📋 Form filling complete!');
}

// Function to highlight elements
function highlightElement(selector, color = '#ff0000') {
  const elements = document.querySelectorAll(selector);
  elements.forEach(el => {
    el.style.outline = `3px solid ${color}`;
    el.style.outlineOffset = '2px';
  });
  return elements.length;
}

// Demo sequence
setTimeout(() => {
  console.log('🔍 Step 1: Analyzing page elements...');
  
  const buttons = document.querySelectorAll('button').length;
  const inputs = document.querySelectorAll('input').length;
  const links = document.querySelectorAll('a').length;
  
  console.log(`📊 Found: ${buttons} buttons, ${inputs} inputs, ${links} links`);
}, 1000);

setTimeout(() => {
  console.log('🎯 Step 2: Highlighting signup elements...');
  
  const signupButtons = highlightElement('button:contains("Create"), button:contains("Sign"), button:contains("Register")', '#00ff00');
  const signupLinks = highlightElement('a:contains("Create"), a:contains("Sign"), a:contains("Register")', '#00ff00');
  
  console.log(`✅ Highlighted ${signupButtons + signupLinks} signup elements`);
}, 2000);

setTimeout(() => {
  console.log('📝 Step 3: Testing form interactions...');
  fillSignupForm();
}, 3000);

setTimeout(() => {
  console.log('🎉 Demo complete! Check the form fields and highlighted elements.');
  console.log('💡 You can now manually test the submit button or navigation.');
}, 4000);

// Export functions for manual use
window.signupDemo = {
  fillForm: fillSignupForm,
  highlight: highlightElement
};