# 🚀 AI-Assisted Resume Portfolio Generator

An intelligent, full-featured Python application and interactive Web Dashboard that converts resume text (`.txt`, `.pdf`, `.docx`) into a **stunning, responsive HTML/CSS personal portfolio website** using Google Gemini 2.5 Flash API.

---

## 📋 Project Overview & Required Technologies

| Technology | Purpose |
| :--- | :--- |
| **Python 3.10+** | Read files, interface with Gemini API, process JSON, and generate portfolio HTML |
| **Google Gemini API** | Extract structured data from resumes & calculate ATS score analysis |
| **JSON Schema** | Store candidate profile details in structured format |
| **HTML5 & CSS3** | Multi-theme responsive portfolio website and interactive dashboard UI |
| **GitHub** | Version control & mandatory project repository submission |

---

## 🌟 Key Features & Optional Enhancements (PDF Sec. 15)

1. **🤖 Interactive AI Recruiter Chatbot (`Ask AI About Candidate`)**:
   - Floating chat assistant widget on the generated portfolio website (`portfolio.html`).
   - Answers recruiter and visitor questions live grounded in Gemini 2.5 Flash API based on candidate details.

2. **🎨 4 Custom Theme Selection Options**:
   - 🟢 **1. Electric Lime & Matte Black** (Default high-contrast neon theme)
   - 🌿 **2. Green Minimalist & Mono** (Deep black with leaf green accents & circular avatar)
   - 🍊 **3. Sunset Orange & Warm Dark** (Charcoal background with vibrant orange highlights)
   - 💜 **4. Cyberpunk Neon Purple & Glass** (Deep space violet with radial glow & glass cards)

3. **📊 AI Resume ATS Score & Improvement Advisor**:
   - Calculates an instant **ATS Quality Score (0-100)**.
   - Identifies key resume strengths and provides 3 actionable tips to boost keyword density.

4. **📷 Profile Picture / Headshot Photo Upload**:
   - Supports uploading custom headshots (`.png`, `.jpg`) encoded into Base64 to populate candidate profile pictures.

5. **🖨️ 1-Click Printable PDF Resume Export**:
   - Includes `@media print` layout allowing candidates to print or save a clean 1-page PDF resume with a single click from the Dashboard.

6. **🚀 1-Click Free Hosting & Deployment Suite**:
   - **Netlify Drop Zip Package**: 1-click download (`portfolio_website.zip`) containing `index.html` + `style.css` ready to drop onto Netlify.
   - **GitHub Pages Commands**: 1-click clipboard copy for Git terminal deployment.

---

## 📁 Reference Project Structure (PDF Sec. 7)

```text
AI-Assisted-Resume-Portfolio-Generator/
├── main.py            # Core Python engine (Gemini 2.5 Flash API, ATS scoring, HTML builder)
├── server.py          # HTTP Server powering Dashboard UI & API endpoints (/api/generate, /api/chat, /api/download-zip)
├── index.html         # Interactive Web Dashboard (Resume input, 4 Theme selection, ATS score, Deploy Live)
├── dashboard.css      # Low-glare warm dark-cream dashboard stylesheet
├── dashboard.js       # Interactive dashboard client & API handlers
├── template.html      # Responsive HTML template with dynamic placeholders & AI Chatbot
├── style.css          # Multi-theme CSS stylesheet with print layout rules
├── resume.txt         # Default sample resume text file
├── portfolio.html     # Generated output portfolio webpage
├── requirements.txt   # Dependencies (google-genai, python-dotenv, pypdf, python-docx)
├── .env.example       # API Key configuration template (Safe for GitHub)
└── .gitignore         # Excludes private .env file, virtual environments, and python cache
```

---

## 🔄 Project Workflow & Prompt Design (PDF Sec. 4 & 6)

### Workflow
1. Resume content is placed inside `resume.txt` or uploaded via Dashboard UI (`.pdf`, `.docx`, `.txt`).
2. Input text is validated and cleaned (removing unnecessary whitespace and empty lines).
3. Structured prompt with JSON schema is sent to Gemini 2.5 Flash API.
4. Gemini returns structured JSON payload containing candidate details & ATS score.
5. Python validates JSON response and maps values into Python dictionaries.
6. Python injects data into `template.html` placeholders and outputs `portfolio.html`.

### Prompt Design Rules
- Instructs Gemini to use **ONLY** information explicitly stated in the resume.
- Prohibits inventing or hallucinating skills, companies, dates, or projects.
- Requests strict JSON output without markdown wrappers.
- Forces unmentioned fields to default safely to `null` or empty lists `[]`.

---

## 🧪 Mandatory Testing Results (PDF Sec. 9)

| Test Case | Expected Behavior | Status |
| :--- | :--- | :---: |
| **Missing `resume.txt`** | Displays clear error message and exits safely | ✅ **PASS** |
| **Empty or very short resume** | Rejects input with a helpful message (< 30 chars) | ✅ **PASS** |
| **Valid resume** | Generates `portfolio.html` successfully | ✅ **PASS** |
| **Resume with missing sections** | Generates available sections without inventing facts | ✅ **PASS** |
| **Missing API key** | Displays configuration error and instructions | ✅ **PASS** |
| **API failure / disconnect** | Handles failure gracefully without program crash | ✅ **PASS** |
| **Invalid JSON response** | Catches parse error and logs clear message | ✅ **PASS** |

---

## 🤖 AI Development Tools & Usage Log (PDF Sec. 11)

| Requirement | Detail |
| :--- | :--- |
| **1. AI Tool Used** | Google Antigravity IDE & Google Gemini 2.5 Flash API |
| **2. Prompt / Request Given** | - "Extract resume into structured JSON schema with Name, Headline, Summary, Contact, Skills, Experience, Projects, Education, and Achievements."<br>- "Calculate ATS Quality Score (0-100) and 3 actionable improvement tips."<br>- "Build an interactive AI Recruiter Chatbot grounded strictly in candidate portfolio JSON." |
| **3. What the Tool Generated** | Core Python extraction pipeline (`main.py`), web API server (`server.py`), responsive multi-theme CSS (`style.css`, `dashboard.css`), and HTML template structure. |
| **4. What Was Changed / Corrected** | Added safe fallback handlers for missing fields, added default `resume.txt` fallback for chatbot, configured UTF-8 output encoding for Windows, and strictly excluded `.env` from git tracking. |

---

## 🛡️ Responsible AI, Privacy & Security (PDF Sec. 10)

- **API Key Security**: The Gemini API key is stored strictly inside `.env` and is **never** committed to GitHub or exposed to browser-side JavaScript.
- **Fact-Grounded Prompting**: Strict prompts prevent Gemini from hallucinating missing skills, dates, or experience.
- **Data Privacy**: No passwords, government IDs, or sensitive financial information are included or processed.

---

## ⚡ Quick Start Guide

### 1. Clone & Install Dependencies
```bash
# 1. Clone the repository
git clone https://github.com/Adhyyan6712/Portfolio-Generator.git
cd Portfolio-Generator
pip install -r requirements.txt
```

### 2. Configure Gemini API Key
Create a `.env` file in the project root directory (copy from `.env.example`):
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
> 💡 *Get a free API key from [Google AI Studio](https://aistudio.google.com/).*

### 3. Run Web Dashboard (Recommended)
```bash
python server.py
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser!

### 4. Direct CLI Execution (Alternative)
```bash
python main.py
```

---

## 🐙 Step-by-Step GitHub Upload Instructions (PDF Sec. 12)

Run the following commands in your terminal to publish this project to your GitHub repository:

```bash
# 1. Initialize git repository
git init

# 2. Add all project files
git add .

# 3. Commit files
git commit -m "Initial commit: AI-Assisted Resume Portfolio Generator"

# 4. Set main branch
git branch -M main

# 5. Link your GitHub repository URL
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git

# 6. Push code to GitHub
git push -u origin main
```

---

## 📋 Final Submission Checklist (PDF Sec. 13 & 14)

- [x] **GitHub Repository**: Complete, public, and instructor-accessible
- [x] **Source Files**: `main.py`, `server.py`, `index.html`, `template.html`, `style.css`, `dashboard.css`, `dashboard.js`
- [x] **Configuration Files**: `requirements.txt`, `.gitignore`, `.env.example`
- [x] **Input & Output**: `resume.txt` sample input & generated `portfolio.html`
- [x] **Documentation**: Complete `README.md` with setup instructions, prompt design, privacy guidelines, testing results, and AI usage log
- [x] **Evidence & Screenshots**: Python execution output, Web Dashboard UI, generated portfolio themes, and ATS score advisor
- [x] **Definition of Completion**: Verified end-to-end (cloning repo, setting API key, running Python program, generating `portfolio.html`, and viewing in browser)
