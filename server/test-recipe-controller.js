require('dotenv').config();
const mongoose = require('mongoose');
const { generateRecipe } = require('./controllers/recipeController');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const req = { body: { query: 'butter chicken' } };
  const res = {
    status: function(code) { this.statusCode = code; return this; },
    json: function(data) { console.log('Response:', data); }
  };
  const next = function(err) { console.error('Next Error:', err); };

  await generateRecipe(req, res, next);
  mongoose.connection.close();
}

test();
