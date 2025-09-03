import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'your-gemini-api-key-here');

// Initialize PostgreSQL connection
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'crop_advisor',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

// Create analyses table if it doesn't exist
const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analyses (
        id SERIAL PRIMARY KEY,
        analysis_id VARCHAR(255) UNIQUE NOT NULL,
        farmer_address VARCHAR(255) NOT NULL,
        image_hash VARCHAR(255) NOT NULL,
        diagnosis TEXT,
        advice TEXT,
        confidence DECIMAL(3,2),
        severity VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};

// Initialize database on startup
initDatabase();

// API Routes
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    const { analysisId } = req.body;
    const imageFile = req.file;

    if (!imageFile) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!analysisId) {
      return res.status(400).json({ error: 'Analysis ID is required' });
    }

    // Read and encode image for Gemini
    const imageData = fs.readFileSync(imageFile.path);
    const base64Image = imageData.toString('base64');

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      You are an expert agricultural pathologist. Analyze this crop/plant image for diseases, pests, or health issues.
      
      Provide a response in the following JSON format:
      {
        "diagnosis": "Brief diagnosis of what you see",
        "advice": "Detailed treatment recommendations and next steps",
        "severity": "low|medium|high",
        "confidence": 0.95
      }
      
      Focus on:
      - Disease identification
      - Pest damage assessment
      - Nutrient deficiencies
      - Environmental stress factors
      - Specific treatment recommendations
      - Prevention strategies
    `;

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: imageFile.mimetype
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Parse the AI response
    let analysisResult;
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response');
      }
    } catch (parseError) {
      // Fallback parsing if JSON extraction fails
      analysisResult = {
        diagnosis: text.substring(0, 200) + '...',
        advice: 'Please consult with a local agricultural expert for detailed treatment recommendations.',
        severity: 'medium',
        confidence: 0.75
      };
    }

    // Store in database
    await pool.query(
      `UPDATE analyses 
       SET diagnosis = $1, advice = $2, confidence = $3, severity = $4, completed_at = NOW()
       WHERE analysis_id = $5`,
      [
        analysisResult.diagnosis,
        analysisResult.advice,
        analysisResult.confidence,
        analysisResult.severity,
        analysisId
      ]
    );

    // Clean up uploaded file
    fs.unlinkSync(imageFile.path);

    res.json(analysisResult);

  } catch (error) {
    console.error('Analysis failed:', error);
    
    // Clean up file if it exists
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('File cleanup failed:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      error: 'Analysis failed. Please try again later.' 
    });
  }
});

// Get analysis history for a farmer
app.get('/api/analyses/:farmerAddress', async (req, res) => {
  try {
    const { farmerAddress } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM analyses WHERE farmer_address = $1 ORDER BY created_at DESC',
      [farmerAddress]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch analyses:', error);
    res.status(500).json({ error: 'Failed to fetch analysis history' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});