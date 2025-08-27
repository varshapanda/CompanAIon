# CompanAIon - Career Companion AI

Career Companion AI is an intelligent assistant designed to help students and early professionals make informed decisions about their future careers. It uses the Gemini API and integrates advanced AI techniques to provide personalized career recommendations, key skills to develop, online course suggestions, and example job roles based on a user’s background, interests, and goals.

This project demonstrates the real-world application of four key AI implementation concepts: **Prompting, Structured Output, Function Calling, and Retrieval-Augmented Generation (RAG)** — all of which are fully implemented in this system.

---

## Project Flow Summary
1. User submits educational background, interests, and goals.  
2. A dynamic prompt is generated using this input and sent to Gemini.  
3. Gemini provides an initial structured response.  
4. Gemini can trigger function calls like `getCourses()` or `getJobs()`.  
5. The backend fetches real data using RAG and returns a final enriched response.  
6. Output is displayed in a structured frontend interface.  

---

## Core Concepts & Their Implementation

### 1. Prompting
**What it is:** Dynamically creating queries or instructions that are passed to the Gemini API.  

**Implementation:**  
When a user submits their profile (e.g., "2nd-year CS student interested in AI and Robotics"), the backend generates a tailored prompt like:  

```
Act as a career counselor. Based on the user’s background, suggest:
- 3 relevant career paths
- 5 skills to learn
- 3 online courses with URLs
- 2 job/internship roles

User Info:
Education: 2nd-year CS
Interests: AI, Robotics
Goals: Build smart robots or AI applications.
```

This ensures high-quality, user-specific responses.  

---

### 2. Structured Output
**What it is:** Ensures the AI returns responses in a machine-readable, standardized format (e.g., JSON).  

**Implementation Example:**  

```json
{
  "career_paths": ["AI Researcher", "Robotics Engineer"],
  "skills_to_learn": ["Python", "ROS", "Deep Learning"],
  "recommended_courses": [
    {"title": "Deep Learning Specialization", "platform": "Coursera", "url": "https://..."},
    {"title": "ROS Basics", "platform": "Udemy", "url": "https://..."}
  ],
  "job_roles": ["AI Intern at OpenAI", "Robotics Intern at Boston Dynamics"]
}
```

This enables consistent rendering in the frontend and simplifies data handling.  

---

### 3. Function Calling
**What it is:** Allows Gemini to request external data through explicit function calls.  

**Implementation Example:**  

```json
{
  "function_call": {
    "name": "getCourses",
    "parameters": {
      "skills": ["ROS", "Python"]
    }
  }
}
```

The backend interprets this, runs the `getCourses(skills)` function, fetches real data from a course API or local DB, and returns the results.  

**Available Functions:**  
- `getCourses(skills)` – Returns relevant courses.  
- `getJobs(role)` – Returns job suggestions.  
- `getStats(careerPath)` – Returns job market stats (optional).  

---

### 4. Retrieval-Augmented Generation (RAG)
**What it is:** RAG enhances AI outputs by combining the generative power of Gemini with factual, up-to-date information retrieved from external sources.  

**Implementation in Career Companion:**  
1. Gemini may suggest calling `getCourses()` or `getJobs()` when additional context is needed.  
2. The backend queries a local knowledge base (JSON/DB) or APIs (e.g., Coursera, Udemy, LinkedIn Jobs).  
3. Retrieved results are passed back into Gemini as **context** (injected into the prompt) or **post-processed** into the final JSON output.  
4. Final responses shown to the user are a combination of Gemini’s recommendations **+ retrieved real-world data**.  

**Example RAG Flow:**  
- User: “I want to learn ML for finance.”  
- Gemini: Calls `getCourses({skills: ["Machine Learning", "Finance"]})`.  
- Backend retrieves from DB/API:  
  - *“ML for Finance” – Coursera*  
  - *“Financial AI Applications” – Udemy*  
- Final Output: Gemini integrates this into a structured JSON that includes both **AI-generated career paths** and **real, actionable resources**.  

---

## System Architecture

```
[Frontend - React] 
   ⬇ (User submits profile)
[Backend - Node.js/Express]
   ⬇ (Dynamic prompt construction)  <-- Prompting
[Gemini API]
   ⬇ (Returns JSON / Function Calls)  <-- Structured Output
[Backend executes function]
   ⬇ (Queries DB/API)  <-- RAG
[Enriched JSON Response]
   ⬇
[Frontend Display]
```

---

## Tech Stack

| Component   | Technology                |
|-------------|---------------------------|
| Frontend    | React + Tailwind CSS      |
| Backend     | Node.js + Express         |
| AI API      | Google Gemini API         |
| RAG Source  | Local JSON or APIs        |
| Deployment  | Vercel (Frontend), Render (Backend) |  

---

## Example Final Output

```json
{
  "career_paths": ["ML Engineer", "AI Researcher"],
  "skills_to_learn": ["Python", "TensorFlow", "Statistics"],
  "recommended_courses": [
    {"title": "ML Foundations", "platform": "Coursera", "url": "https://..."},
    {"title": "AI Basics", "platform": "Udemy", "url": "https://..."}
  ],
  "job_roles": ["ML Intern at Google", "AI Intern at OpenAI"]
}
```

---

## Summary

| Concept            | Implementation Details                                     |
|---------------------|------------------------------------------------------------|
| **Prompting**       | Dynamic prompt from user input                             |
| **Structured Output** | JSON output from Gemini                                   |
| **Function Calling** | Gemini calls backend functions (e.g., `getCourses`)        |
| **RAG**             | Backend retrieves real data (courses/jobs) and feeds it to Gemini |
