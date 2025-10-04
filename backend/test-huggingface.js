// Move this file to backend directory to test
const { HfInference } = require('@huggingface/inference');

async function testHuggingFace() {
  console.log('🤖 Testing Hugging Face AI...');
  
  const hf = new HfInference();
  
  const testText = `
    This is a long piece of text that needs to be summarized. 
    It contains multiple sentences and ideas that should be condensed into key points. 
    The goal is to extract the most important information and present it in a clear, concise format. 
    This will help users quickly understand the main concepts without reading the entire text.
  `;

  try {
    console.log('📝 Testing summarization...');
    const result = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: testText.trim(),
      parameters: {
        max_length: 100,
        min_length: 30,
        do_sample: false
      }
    });

    console.log('✅ Summarization successful!');
    console.log('Original:', testText.trim());
    console.log('Summary:', result.summary_text);
    
    // Convert to bullet points
    const sentences = result.summary_text.split('. ');
    const bullets = sentences.map(s => `• ${s.trim()}`).join('\n');
    console.log('Bullet format:', bullets);
    
  } catch (error) {
    console.error('❌ Hugging Face test failed:', error.message);
    console.log('💡 This is normal - Hugging Face models may take time to load on first use');
    console.log('💡 The fallback methods will work while models are loading');
  }
}

testHuggingFace();