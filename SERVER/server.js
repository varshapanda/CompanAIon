require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDatabase = require('./config/database.js');
const authRoutes = require('./routes/authRoutes.js');
const careerRoutes = require('./routes/careerRoutes.js');

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
connectDatabase();

app.get('/', (req,res)=>{
  return res.status(200).send("Welcome to CompanAIon");
})
app.use('/auth', authRoutes);
app.use('/career', careerRoutes);

const PORT = process.env.PORT||8080;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}, http://localhost:${PORT}`);
});