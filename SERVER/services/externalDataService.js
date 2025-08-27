// Mock data for RAG implementation
const coursesData = [
  { title: "Machine Learning Fundamentals", platform: "Coursera", url: "https://www.coursera.org/learn/fundamentals-of-machine-learning-and-artificial-intelligence", skills: ["Machine Learning", "Python"] },
  { title: "Web Development Bootcamp", platform: "Udemy", url: "https://www.udemy.com/course/the-complete-web-development-bootcamp/", skills: ["JavaScript", "HTML", "CSS"] },
  { title: "Data Science with Python", platform: "edX", url: "https://www.edx.org/learn/data-science/harvard-university-introduction-to-data-science-with-python", skills: ["Python", "Data Analysis", "Statistics"] },
  { title: "AI for Everyone", platform: "Coursera", url: "https://www.coursera.org/learn/ai-for-everyone", skills: ["Artificial Intelligence", "Machine Learning"] },
  { title: "Cloud Computing Essentials", platform: "Udacity", url: "https://www.udacity.com/course/cloud-fundamentals--cd12097", skills: ["AWS", "Cloud Computing", "DevOps"] }
];


const jobsData = [
  { role: "Frontend Developer", companies: ["Google", "Facebook", "Netflix"], skills: ["JavaScript", "React", "CSS"] },
  { role: "Data Scientist", companies: ["Amazon", "Microsoft", "Twitter"], skills: ["Python", "Machine Learning", "Statistics"] },
  { role: "DevOps Engineer", companies: ["Netflix", "Amazon", "Spotify"], skills: ["AWS", "Docker", "Kubernetes"] },
  { role: "UX Designer", companies: ["Apple", "Adobe", "Airbnb"], skills: ["UI/UX", "Figma", "User Research"] },
  { role: "Product Manager", companies: ["Google", "Microsoft", "Slack"], skills: ["Product Strategy", "Agile", "Market Research"] }
];

const careerStatsData = [
  { career: "Software Engineer", growth: "22%", medianSalary: "$110,000", demand: "High" },
  { career: "Data Scientist", growth: "31%", medianSalary: "$120,000", demand: "Very High" },
  { career: "UX Designer", growth: "15%", medianSalary: "$85,000", demand: "Medium" },
  { career: "Product Manager", growth: "10%", medianSalary: "$105,000", demand: "High" },
  { career: "DevOps Engineer", growth: "21%", medianSalary: "$115,000", demand: "High" }
];

async function getCourses(params) {
  const { skills } = params;
  if (!skills || !Array.isArray(skills)) {
    return [];
  }
  
  const matchedCourses = coursesData.filter(course => 
    course.skills.some(skill => 
      skills.some(requestedSkill => 
        skill.toLowerCase().includes(requestedSkill.toLowerCase())
      )
    )
  );
  
  return matchedCourses.slice(0, 5);
}

async function getJobs(params) {
  const { role } = params;
  if (!role) {
    return [];
  }
  
  const matchedJobs = jobsData.filter(job => 
    job.role.toLowerCase().includes(role.toLowerCase())
  );
  
  return matchedJobs;
}

async function getCareerStats(params) {
  const { careerPath } = params;
  if (!careerPath) {
    return {};
  }
  
  const matchedStats = careerStatsData.find(stats => 
    stats.career.toLowerCase().includes(careerPath.toLowerCase())
  );
  
  return matchedStats || {};
}

module.exports = {
  getCourses,
  getJobs,
  getCareerStats
};