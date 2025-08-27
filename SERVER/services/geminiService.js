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

async function generateCareerRecommendationWithFunctions(userData) {
  const { education, interests, goals } = userData;
  
  const prompt = `Act as a career counselor. Based on the user's background, suggest:
  - 3 relevant career paths with brief descriptions
  - 5 key skills to learn with importance levels
  - 3 online courses with platforms and URLs
  - 2 job/internship roles with potential companies
  
  If you need additional data to provide better recommendations, you can call these functions:
  - getCourses(skills): Get relevant courses for specific skills
  - getJobs(role): Get job suggestions for a specific role
  - getCareerStats(careerPath): Get statistics about a career path
  
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
    ],
    "function_calls": [
      {"name": "function_name", "parameters": {"param1": "value1"}}
    ]
  }`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON response from Gemini");
    }
    
    let recommendations = JSON.parse(jsonMatch[0]);
    
    // Handle function calls
    if (recommendations.function_calls && recommendations.function_calls.length > 0) {
      for (const funcCall of recommendations.function_calls) {
        if (availableFunctions[funcCall.name]) {
          const funcResult = await availableFunctions[funcCall.name](funcCall.parameters);
          
          // Regenerate with enhanced data
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
  generateCareerRecommendation: generateCareerRecommendationWithFunctions
};