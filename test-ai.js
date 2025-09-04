// Quick test of the AI service
const testContent = `
Hey, can you call me at +1-555-123-4567 or email me at john@example.com?
I'm available tomorrow March 15, 2024 at 2 PM.
My office is at 123 Main Street, New York, NY 10001.
Check out this cool project: https://github.com/user/awesome-project
`;

console.log('Testing AI classification with sample content:');
console.log(testContent);
console.log('\nThis would detect:');
console.log('- Phone: +1-555-123-4567 → Suggest call, WhatsApp');
console.log('- Email: john@example.com → Suggest email, Outlook');
console.log('- Date: March 15, 2024 → Suggest calendar event');
console.log('- Address: 123 Main Street... → Suggest maps, Google Maps');
console.log('- GitHub URL → Suggest browser, GitHub Desktop');