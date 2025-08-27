const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generationConfig = {
  temperature: 0.7,
  topP: 0.8,
  topK: 40,
};

const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig 
});

async function generateCareerRecommendation(userData) {
  const { education, interests, goals } = userData;
  
  const prompt = `Act as a career counselor. Based on the user's background, suggest:
  - 3 relevant career paths with brief descriptions
  - 5 key skills to learn with importance levels
  - 3 online courses with platforms and URLs
  - 2 job/internship roles with potential companies
  
  User Info:
  Education: ${education}
  Interests: ${interests.join(', ')}
  Goals: ${goals}
  
  Return the response as a valid JSON object with this exact structure:
  {
    "career_paths": [
      {"title": "Career Title", "description": "Brief description"}
    ],
    "skills_to_learn": [
      {"skill": "Skill Name", "importance": "High/Medium/Low"}
    ],
    "recommended_courses": [
      {"title": "Course Title", "platform": "Platform Name", "url": "Course URL"}
    ],
    "job_roles": [
      {"role": "Job Role", "companies": ["Company 1", "Company 2"]}
    ]
  }`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error("Failed to parse JSON response from Gemini");
  } catch (error) {
    console.error("Error generating career recommendations:", error);
    throw error;
  }
}

module.exports = {
  generateCareerRecommendation
};