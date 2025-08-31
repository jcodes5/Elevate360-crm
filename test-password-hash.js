const bcrypt = require('bcryptjs');

// Test the specific hash from your logs
const testPassword = "password123"; // Common test password
const storedHash = "$2b$12$Qd47E64PBX80QkRWOGAmCOpMrAN59rnG7pyPWkoNjb.GE7DuAsJB.";

console.log("Testing password verification:");
console.log("Stored hash:", storedHash);
console.log("Test password:", testPassword);

bcrypt.compare(testPassword, storedHash).then(result => {
  console.log("Password comparison result:", result);
  
  if (result) {
    console.log("✅ Password matches!");
  } else {
    console.log("❌ Password does NOT match!");
    
    // Let's also test hashing a new password to see if we get a similar hash
    bcrypt.hash(testPassword, 12).then(newHash => {
      console.log("New hash for same password:", newHash);
      console.log("New hash length:", newHash.length);
      console.log("Stored hash length:", storedHash.length);
      
      // Try comparing again with the new hash
      bcrypt.compare(testPassword, newHash).then(newResult => {
        console.log("New hash comparison result:", newResult);
      });
    });
  }
});

// Also test with a few common variations
const variations = ["Password123", "password123!", "Password123!", "123password", ""];
console.log("\nTesting common password variations:");

Promise.all(variations.map(pass => {
  return bcrypt.compare(pass, storedHash).then(result => {
    console.log(`Password "${pass}" matches: ${result}`);
    return result;
  });
})).then(results => {
  const anyMatch = results.some(result => result === true);
  if (!anyMatch) {
    console.log("None of the common variations matched.");
  }
});