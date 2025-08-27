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

// MULTI-SHOT EXAMPLES for prompting
const multiShotExample = `

EXAMPLE 1 - Without function calls:
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

EXAMPLE 2 - With function calls:
USER INPUT:
- Education: 2nd year Data Science
- Interests: Machine Learning, Big Data
- Goals: Become a data scientist at tech company
AI RESPONSE:
{
  "career_paths": [
    {"title": "Data Scientist", "description": "Extract insights from large datasets"},
    {"title": "ML Engineer", "description": "Build and deploy machine learning models"},
    {"title": "Data Analyst", "description": "Analyze data to inform business decisions"}
  ],
  "skills_to_learn": [
    {"skill": "Python", "importance": "High"},
    {"skill": "R Programming", "importance": "Medium"},
    {"skill": "SQL", "importance": "High"},
    {"skill": "TensorFlow", "importance": "Medium"},
    {"skill": "Data Visualization", "importance": "Medium"}
  ],
  "recommended_courses": [
    {"title": "Machine Learning A-Z", "platform": "Udemy", "url": "https://www.udemy.com/course/machinelearning/"},
    {"title": "Data Science Specialization", "platform": "Coursera", "url": "https://www.coursera.org/specializations/jhu-data-science"},
    {"title": "Python for Data Science", "platform": "edX", "url": "https://www.edx.org/course/python-for-data-science"}
  ],
  "job_roles": [
    {"role": "Data Science Intern", "companies": ["DataCorp", "AnalyticsCo", "TechGiant"]},
    {"role": "Junior Data Analyst", "companies": ["BusinessSolutions", "MarketInsights", "FinanceCo"]}
  ],
  "function_calls": [
    {"name": "getCourses", "parameters": {"skills": ["Machine Learning", "Data Science"]}},
    {"name": "getCareerStats", "parameters": {"careerPath": "Data Scientist"}}
  ]
}

EXAMPLE 3 - Another user scenario:
USER INPUT:
- Education: 3rd year Software Engineering
- Interests: Cybersecurity, Cloud Computing
- Goals: Become a cloud security engineer
AI RESPONSE:
{
  "career_paths": [
    {"title": "Cloud Security Engineer", "description": "Secure cloud infrastructure and services"},
    {"title": "Cybersecurity Analyst", "description": "Protect systems against cyber threats"},
    {"title": "DevOps Engineer", "description": "Manage CI/CD pipelines and cloud deployments"}
  ],
  "skills_to_learn": [
    {"skill": "AWS Security", "importance": "High"},
    {"skill": "Network Security", "importance": "High"},
    {"skill": "Python", "importance": "Medium"},
    {"skill": "Linux Administration", "importance": "Medium"},
    {"skill": "Docker & Kubernetes", "importance": "Medium"}
  ],
  "recommended_courses": [
    {"title": "AWS Security Fundamentals", "platform": "Coursera", "url": "https://www.coursera.org/learn/aws-security-fundamentals"},
    {"title": "Cybersecurity Bootcamp", "platform": "Udemy", "url": "https://www.udemy.com/course/cybersecurity-bootcamp/"},
    {"title": "Linux for Developers", "platform": "edX", "url": "https://www.edx.org/course/linux-for-developers"}
  ],
  "job_roles": [
    {"role": "Cloud Security Intern", "companies": ["CloudSecure", "TechGuard", "SafeNet"]},
    {"role": "Junior Cybersecurity Analyst", "companies": ["SecureIT", "CyberSolutions", "NetProtect"]}
  ]
}
`;

async function generateCareerRecommendation(userData) {
  const { education, interests, goals } = userData;
  
  // COMBINED PROMPT: One-shot examples + function calling instructions
  const prompt = `${multiShotExample}

Now analyze this new user and provide career recommendations:

Act as a career counselor. Based on the user's background, suggest:
- 3 relevant career paths with brief descriptions
- 5 key skills to learn with importance levels (High/Medium/Low)
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

Return the response as a valid JSON object with the exact same structure as the examples above. Include the "function_calls" array ONLY if you need to call external functions for better recommendations.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    
    console.log("Raw Gemini response:", text); // Debugging
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse JSON response from Gemini");
    }
    
    let recommendations = JSON.parse(jsonMatch[0]);
    
    // FUNCTION CALLING HANDLING
    if (recommendations.function_calls && recommendations.function_calls.length > 0) {
      console.log('Gemini requested function calls:', recommendations.function_calls);
      
      // Store original recommendations before enhancement
      const originalRecommendations = {...recommendations};
      
      for (const funcCall of recommendations.function_calls) {
        if (availableFunctions[funcCall.name]) {
          console.log(`Executing function: ${funcCall.name} with params:`, funcCall.parameters);
          
          try {
            const funcResult = await availableFunctions[funcCall.name](funcCall.parameters);
            
            // Create enhanced prompt with real data
            const enhancementPrompt = `Original recommendations: ${JSON.stringify(originalRecommendations, null, 2)}
            
Additional data from ${funcCall.name}(${JSON.stringify(funcCall.parameters)}): 
${JSON.stringify(funcResult, null, 2)}

Please enhance the original recommendations with this new data. Keep the same JSON structure but improve the recommendations with the real-world information. Return ONLY the enhanced JSON object.`;

            const enhancedResult = await model.generateContent(enhancementPrompt);
            const enhancedResponse = await enhancedResult.response;
            const enhancedText = await enhancedResponse.text();
            
            console.log("Enhanced response:", enhancedText); // Debugging
            
            const enhancedJsonMatch = enhancedText.match(/\{[\s\S]*\}/);
            if (enhancedJsonMatch) {
              recommendations = JSON.parse(enhancedJsonMatch[0]);
            }
          } catch (funcError) {
            console.error(`Error executing function ${funcCall.name}:`, funcError);
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