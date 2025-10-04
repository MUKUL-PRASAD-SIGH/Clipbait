from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoModelForCausalLM, AutoTokenizer, pipeline
import torch
import re
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AITransformationService:
    def __init__(self):
        self.models = {}
        self.tokenizers = {}
        self.pipelines = {}
        self.load_models()
    
    def load_models(self):
        """Load AI models for different tasks"""
        try:
            # For summarization - using a lightweight model
            logger.info("Loading summarization model...")
            self.pipelines['summarize'] = pipeline(
                "summarization", 
                model="facebook/bart-large-cnn",
                device=0 if torch.cuda.is_available() else -1
            )
            
            # For text generation/rewriting - using a smaller model for speed
            logger.info("Loading text generation model...")
            model_name = "microsoft/DialoGPT-small"  # Lightweight alternative
            self.tokenizers['generate'] = AutoTokenizer.from_pretrained(model_name)
            self.models['generate'] = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
                device_map="auto" if torch.cuda.is_available() else None
            )
            
            logger.info("AI models loaded successfully!")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            # Fallback to rule-based transformations
            self.models = {}
            self.pipelines = {}
    
    def summarize_text(self, content):
        """Summarize text using AI model"""
        try:
            if 'summarize' in self.pipelines and len(content) > 100:
                # Use AI summarization for longer texts
                result = self.pipelines['summarize'](
                    content, 
                    max_length=min(150, len(content.split()) // 2),
                    min_length=30,
                    do_sample=False
                )
                summary = result[0]['summary_text']
                
                # Convert to bullet points
                sentences = summary.split('. ')
                bullets = [f"• {sentence.strip()}" for sentence in sentences if sentence.strip()]
                return '\n'.join(bullets)
            else:
                return self.fallback_summarize(content)
                
        except Exception as e:
            logger.error(f"AI summarization failed: {e}")
            return self.fallback_summarize(content)
    
    def make_professional(self, content):
        """Convert text to professional tone"""
        try:
            if 'generate' in self.models:
                prompt = f"Rewrite this text in a professional business tone: {content}"
                
                tokenizer = self.tokenizers['generate']
                model = self.models['generate']
                
                inputs = tokenizer.encode(prompt, return_tensors='pt')
                
                with torch.no_grad():
                    outputs = model.generate(
                        inputs,
                        max_length=inputs.shape[1] + min(200, len(content)),
                        temperature=0.7,
                        do_sample=True,
                        pad_token_id=tokenizer.eos_token_id
                    )
                
                result = tokenizer.decode(outputs[0], skip_special_tokens=True)
                # Extract the generated part
                generated = result[len(prompt):].strip()
                
                if generated and len(generated) > 10:
                    return generated
                else:
                    return self.fallback_professional(content)
            else:
                return self.fallback_professional(content)
                
        except Exception as e:
            logger.error(f"AI professional tone failed: {e}")
            return self.fallback_professional(content)
    
    def expand_text(self, content):
        """Expand text with more details"""
        try:
            if 'generate' in self.models and len(content) < 300:
                prompt = f"Expand this idea with more details and context: {content}"
                
                tokenizer = self.tokenizers['generate']
                model = self.models['generate']
                
                inputs = tokenizer.encode(prompt, return_tensors='pt')
                
                with torch.no_grad():
                    outputs = model.generate(
                        inputs,
                        max_length=inputs.shape[1] + 250,
                        temperature=0.8,
                        do_sample=True,
                        pad_token_id=tokenizer.eos_token_id
                    )
                
                result = tokenizer.decode(outputs[0], skip_special_tokens=True)
                generated = result[len(prompt):].strip()
                
                if generated and len(generated) > 20:
                    return f"{content}\n\n{generated}"
                else:
                    return self.fallback_expand(content)
            else:
                return self.fallback_expand(content)
                
        except Exception as e:
            logger.error(f"AI expansion failed: {e}")
            return self.fallback_expand(content)
    
    # Fallback methods (rule-based)
    def fallback_summarize(self, content):
        sentences = content.split('. ')
        key_sentences = sentences[:min(3, len(sentences))]
        return '\n'.join([f"• {s.strip()}" for s in key_sentences if s.strip()])
    
    def fallback_professional(self, content):
        # Smart professional conversion
        professional = content
        replacements = [
            ('hi', 'Hello'), ('hey', 'Hello'), ('yeah', 'Yes'),
            ('ok', 'Understood'), ('thanks', 'Thank you'),
            ("can't", 'cannot'), ("won't", 'will not')
        ]
        
        for casual, formal in replacements:
            professional = re.sub(r'\b' + casual + r'\b', formal, professional, flags=re.IGNORECASE)
        
        if len(professional) < 100:
            professional = f"I would like to inform you that {professional.lower()}"
        
        return professional
    
    def fallback_expand(self, content):
        return f"{content}\n\nTo elaborate further, this topic encompasses several important considerations that merit detailed examination and thoughtful analysis."

# Initialize the AI service
ai_service = AITransformationService()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'models_loaded': len(ai_service.models) > 0})

@app.route('/transform', methods=['POST'])
def transform_text():
    try:
        data = request.json
        content = data.get('content', '')
        transform_type = data.get('transformationType', '')
        
        if not content:
            return jsonify({'error': 'Content is required'}), 400
        
        logger.info(f"Transforming content (type: {transform_type}, length: {len(content)})")
        
        if transform_type == 'summarize':
            result = ai_service.summarize_text(content)
        elif transform_type == 'professional':
            result = ai_service.make_professional(content)
        elif transform_type == 'expand':
            result = ai_service.expand_text(content)
        elif transform_type == 'casual':
            result = f"Hey! {content.lower()} 😊"
        elif transform_type == 'bullet_points':
            sentences = content.split('. ')
            result = '\n'.join([f"• {s.strip()}" for s in sentences if s.strip()])
        else:
            result = content
        
        return jsonify({
            'success': True,
            'transformedContent': result,
            'originalContent': content,
            'transformationType': transform_type
        })
        
    except Exception as e:
        logger.error(f"Transformation error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🤖 Starting AI Transformation Service...")
    print("🔧 Loading models (this may take a few minutes)...")
    app.run(host='0.0.0.0', port=5001, debug=False)