const { GoogleGenerativeAI } = require("@google/generative-ai");
const { getCourses, getJobs, getCareerStats } = require('./externalDataService.js');

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

const availableFunctions = {
  getCourses: getCourses,
  getJobs: getJobs,
  getCareerStats: getCareerStats
};

// one-shot example 
const oneShotExample = `
USER INPUT:
- Education: Computer Science student
- Interests: Artificial Intelligence, Web Development
- Goals: Become a full-stack developer

AI RESPONSE:
{
  "career_paths": [
    {"title": "Full-Stack Developer", "description": "Build both frontend and backend applications"},
    {"title": "AI Engineer", "description": "Develop intelligent systems and machine learning models"},
    {"title": "Web Developer", "description": "Create responsive and interactive websites"}
  ],
  "skills_to_learn": [
    {"skill": "JavaScript", "importance": "High"},
    {"skill": "React.js", "importance": "High"},
    {"skill": "Node.js", "importance": "High"},
    {"skill": "Python", "importance": "Medium"},
    {"skill": "Database Management", "importance": "Medium"}
  ],
  "recommended_courses": [
    {"title": "Full-Stack Web Development", "platform": "Coursera", "url": "https://www.coursera.org/learn/fullstack-web-development"},
    {"title": "React.js Masterclass", "platform": "Udemy", "url": "https://www.udemy.com/course/react-masterclass-with-hooks-context/"},
    {"title": "Python for AI", "platform": "edX", "url": "https://www.edx.org/course/cs50s-introduction-to-artificial-intelligence-with-python"}
  ],
  "job_roles": [
    {"role": "Junior Full-Stack Developer", "companies": ["TechStart", "WebInnovate", "AppWorks"]},
    {"role": "Frontend Developer Intern", "companies": ["DesignCo", "DigitalSolutions", "CreativeLabs"]}
  ]
}
`;

async function generateCareerRecommendation(userData) {
  const { education, interests, goals } = userData;
  
  const prompt = `Act as a career counselor. I will give you one example, then you will respond to new user inputs in the same format.

EXAMPLE:
${oneShotExample}

NEW USER INPUT:
- Education: ${education}
- Interests: ${interests.join(', ')}
- Goals: ${goals}

Based on this new input, provide career recommendations in the EXACT same JSON format as the example.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON response from Gemini");
    }
    
    let recommendations = JSON.parse(jsonMatch[0]);
    
    // Handle function calls if any
    if (recommendations.function_calls && recommendations.function_calls.length > 0) {
      for (const funcCall of recommendations.function_calls) {
        if (availableFunctions[funcCall.name]) {
          const funcResult = await availableFunctions[funcCall.name](funcCall.parameters);
          
          const enhancedPrompt = `${prompt}\n\nAdditional data from ${funcCall.name}: ${JSON.stringify(funcResult)}`;
          const enhancedResult = await model.generateContent(enhancedPrompt);
          const enhancedResponse = await enhancedResult.response;
          const enhancedText = enhancedResponse.text();
          
          const enhancedJsonMatch = enhancedText.match(/\{[\s\S]*\}/);
          if (enhancedJsonMatch) {
            recommendations = JSON.parse(enhancedJsonMatch[0]);
          }
        }
      }
    }
    
    return recommendations;
  } catch (error) {
    console.error("Error generating career recommendations:", error);
    throw error;
  }
}

module.exports = {
  generateCareerRecommendation
};