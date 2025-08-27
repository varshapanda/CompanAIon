require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDatabase = require('./config/database.js');

const app = express();
app.use(cors());
app.use(express.json());
connectDatabase();

app.get('/', (req,res)=>{
  return res.status(200).send("Welcome to CompanAIon");
})

const PORT = process.env.PORT||8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}, http://localhost:${PORT}`);
});