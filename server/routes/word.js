// server/routes/word.js - Word definition API route

import express from 'express';
import getClientPromise from '../lib/mongodb.js';
import { getWordDefinition } from '../lib/openrouter.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { word, verseRef, verseContext } = req.body;
    
    if (!word || !verseRef) {
      return res.status(400).json({
        error: 'Missing required fields: word, verseRef'
      });
    }
    
    // Connect to MongoDB
    const client = await getClientPromise();
    const db = client.db('bible-app');
    const collection = db.collection('words');
    
    // Check if the word already exists in this verse context
    const existing = await collection.findOne({
      word: word.toLowerCase(),
      verse_ref: verseRef
    });
    
    if (existing) {
      console.log(`Cache hit for word: ${word} in ${verseRef}`);
      return res.json(existing);
    }
    
    console.log(`Cache miss - generating definition for: ${word} in ${verseRef}`);
    
    // If not, generate a definition using OpenRouter
    const aiDefinition = await getWordDefinition(word, verseContext || '');
    
    if (!aiDefinition) {
      return res.status(500).json({
        error: 'Failed to generate definition'
      });
    }
    
    // Save to the database with proper validation
    const newDefinition = {
      word: word.toLowerCase(),
      verse_ref: verseRef,
      basic_meaning: aiDefinition.basic_meaning || '',
      context_meaning: aiDefinition.context_meaning || '',
      greek_hebrew: aiDefinition.greek_hebrew,
      theological_weight: aiDefinition.theological_weight,
      doctrinal_themes: Array.isArray(aiDefinition.doctrinal_themes) ? aiDefinition.doctrinal_themes : undefined,
      connections: Array.isArray(aiDefinition.connections) ? aiDefinition.connections : [],
      cross_references: Array.isArray(aiDefinition.cross_references) ? aiDefinition.cross_references : undefined,
      explanations: aiDefinition.explanations,
      ai_generated: true,
      verified: false,
      created_at: new Date()
    };
    
    await collection.insertOne(newDefinition);
    
    console.log(`Definition saved for: ${word}`);
    
    return res.json(newDefinition);
  } catch (error) {
    console.error('Word API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

export default router;
