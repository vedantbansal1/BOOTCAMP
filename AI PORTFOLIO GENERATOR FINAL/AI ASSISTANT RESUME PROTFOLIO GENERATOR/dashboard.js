/**
 * Dashboard UI Interactivity & API Client
 * AI Resume Portfolio Generator - 4 Custom Themes & Multimodal Engine
 */

document.addEventListener('DOMContentLoaded', () => {

  const resumeInput = document.getElementById('resume-input');
  const btnGenerate = document.getElementById('btn-generate');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const btnSample = document.getElementById('btn-sample');
  const btnUpload = document.getElementById('btn-upload');
  const fileInput = document.getElementById('file-input');
  const fileNameDisplay = document.getElementById('file-name-display');

  const avatarInput = document.getElementById('avatar-input');
  const btnUploadAvatar = document.getElementById('btn-upload-avatar');
  const avatarFilename = document.getElementById('avatar-filename');
  let profileImageBase64 = null;

  let selectedTheme = 'dark-lime'; // Default Theme 1
  const themeCardGrid = document.getElementById('theme-card-grid');

  if (themeCardGrid) {
    const themeCards = themeCardGrid.querySelectorAll('.theme-card-option');
    themeCards.forEach(card => {
      card.addEventListener('click', () => {
        themeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        selectedTheme = card.dataset.theme;
        showLog(`Selected theme: '${card.querySelector('.theme-name').textContent}'`, 'info');
      });
    });
  }

  const logBanner = document.getElementById('log-banner');
  const logMessage = document.getElementById('log-message');
  const logIcon = document.getElementById('log-icon');
  
  const previewIframe = document.getElementById('preview-iframe');
  const codeDisplay = document.getElementById('code-display');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const btnDownload = document.getElementById('btn-download');
  const btnPrintPdf = document.getElementById('btn-print-pdf');

  const btnDownloadZip = document.getElementById('btn-download-zip');
  const btnCopyGit = document.getElementById('btn-copy-git');
  const gitCommandsBox = document.getElementById('git-commands-box');

  const tabVisual = document.getElementById('tab-visual');
  const tabAts = document.getElementById('tab-ats');
  const tabCode = document.getElementById('tab-code');
  const tabDeploy = document.getElementById('tab-deploy');

  const paneVisual = document.getElementById('pane-visual');
  const paneAts = document.getElementById('pane-ats');
  const paneCode = document.getElementById('pane-code');
  const paneDeploy = document.getElementById('pane-deploy');

  const atsScoreDisplay = document.getElementById('ats-score-display');
  const atsStrengthsList = document.getElementById('ats-strengths-list');
  const atsTipsList = document.getElementById('ats-tips-list');

  let selectedFileObj = null;
  let currentGeneratedHtml = '';

  const sampleResumeText = `Kelvin Shah
Lead UI/UX Designer & Creative Frontend Developer
Location: San Francisco, CA
Email: kelvin.shah@example.com
Phone: +1 (555) 890-1234
LinkedIn: https://linkedin.com/in/kelvinshah-design
GitHub: https://github.com/kelvinshah-design
Portfolio: https://kelvinshah.design

PROFESSIONAL SUMMARY
Passionate Senior UI/UX Designer and Frontend Engineer with 8+ years of experience building modern, accessible web products and design systems. Specialized in high-contrast visual aesthetics, user research, wireframing, and interactive design.

TECHNICAL SKILLS
- Design & Prototyping: Figma, Adobe XD, Photoshop, Illustrator, Motion Design, Wireframing
- Frontend Web: HTML5, CSS3, Tailwind CSS, JavaScript, React, Vue.js, WebGL
- Tools & Workflow: Git, GitHub, Zeplin, Storybook, Design Systems, Responsive Layouts

WORK EXPERIENCE
Lead UI/UX Designer | TechNova Solutions | San Francisco, CA
June 2022 - Present
- Led redesign of flagship SaaS product improving user conversion by 45% across 200,000+ monthly active users.
- Created scalable design system with 120+ accessible UI components in Figma and React.

Senior Product Designer | Creative Agency | New York, NY
January 2019 - May 2022
- Designed responsive web applications and mobile dashboards for high-growth tech startups.

PROJECTS
Classic Portfolio Theme | HTML5, CSS3, JavaScript, Figma
- Created an electric lime & matte black high-contrast portfolio theme with interactive step timelines.

Smart UI Design System | React, Tailwind CSS, Storybook
- Built an open-source design token system adopted by 30+ engineering teams.

EDUCATION & CERTIFICATIONS
Master of Fine Arts in Interaction Design | California Institute of the Arts (2018)
- 1st Place Winner - Bay Area Design Hackathon (2023)
- Certified Professional in Accessibility Core Competencies (CPACC)`;

  resumeInput.value = sampleResumeText;

  btnSample.addEventListener('click', () => {
    selectedFileObj = null;
    fileNameDisplay.textContent = 'No file selected';
    resumeInput.value = sampleResumeText;
    showLog('Sample resume loaded.', 'info');
  });

  // Avatar Image Upload
  btnUploadAvatar.addEventListener('click', () => avatarInput.click());
  avatarInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      avatarFilename.textContent = file.name;
      profileImageBase64 = await fileToDataURL(file);
      showLog(`Loaded profile image '${file.name}'.`, 'info');
    }
  });

  // File Input Upload
  btnUpload.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      selectedFileObj = file;
      fileNameDisplay.textContent = file.name;
      showLog(`Selected '${file.name}'. Ready to process with AI!`, 'info');

      if (file.name.endsWith('.txt')) {
        const reader = new FileReader();
        reader.onload = (evt) => { resumeInput.value = evt.target.result; };
        reader.readAsText(file);
      } else {
        resumeInput.value = `[File attached: ${file.name} (${Math.round(file.size / 1024)} KB)]\n\nClick 'Generate Web Portfolio' to parse this document with Gemini AI!`;
      }
    }
  });

  // Tab Navigation
  const tabs = [
    { btn: tabVisual, pane: paneVisual },
    { btn: tabAts, pane: paneAts },
    { btn: tabCode, pane: paneCode },
    { btn: tabDeploy, pane: paneDeploy }
  ];

  tabs.forEach(({ btn, pane }) => {
    btn.addEventListener('click', () => {
      tabs.forEach(t => {
        t.btn.classList.remove('active');
        t.pane.classList.remove('active');
      });
      btn.classList.add('active');
      pane.classList.add('active');
    });
  });

  // Generate API Trigger
  btnGenerate.addEventListener('click', async () => {
    const text = resumeInput.value.trim();

    if (!selectedFileObj && (!text || text.length < 30)) {
      showLog('Please provide valid resume text or upload a PDF/Word file!', 'error');
      return;
    }

    setLoading(true);
    showLog(`Processing resume & generating portfolio with ${selectedTheme} theme...`, 'info');

    let bodyPayload = {
      profile_image: profileImageBase64,
      selected_theme: selectedTheme
    };

    if (selectedFileObj && !selectedFileObj.name.endsWith('.txt')) {
      const base64Data = await fileToBase64(selectedFileObj);
      bodyPayload.filename = selectedFileObj.name;
      bodyPayload.file_data = base64Data;
    } else {
      bodyPayload.filename = selectedFileObj ? selectedFileObj.name : 'resume.txt';
      bodyPayload.resume_text = text;
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      const result = await response.json();

      if (result.success) {
        currentGeneratedHtml = result.html;
        previewIframe.srcdoc = result.html;
        codeDisplay.textContent = result.html;

        // Render ATS Analysis
        const ats = result.ats_analysis || {};
        if (ats.score) {
          atsScoreDisplay.textContent = ats.score;
        }
        if (ats.strengths) {
          atsStrengthsList.innerHTML = ats.strengths.map(s => `<li>${s}</li>`).join('');
        }
        if (ats.suggestions) {
          atsTipsList.innerHTML = ats.suggestions.map(s => `<li>${s}</li>`).join('');
        }

        showLog(`🎉 Portfolio generated successfully in '${selectedTheme}' theme!`, 'success');
      } else {
        showLog(`❌ Error: ${result.error || 'Failed to generate portfolio.'}`, 'error');
      }
    } catch (err) {
      showLog(`❌ Connection Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  });

  // Print PDF Button Handler in Dashboard Header
  if (btnPrintPdf) {
    btnPrintPdf.addEventListener('click', () => {
      if (previewIframe.contentWindow) {
        previewIframe.contentWindow.print();
      } else {
        window.open('portfolio.html', '_blank').print();
      }
    });
  }

  // Download Deploy Package (.zip) Button Handler
  if (btnDownloadZip) {
    btnDownloadZip.addEventListener('click', () => {
      window.location.href = '/api/download-zip';
      showLog('📦 Downloading Deploy Package (portfolio_website.zip)...', 'success');
    });
  }

  // Copy Git Commands Handler
  if (btnCopyGit && gitCommandsBox) {
    btnCopyGit.addEventListener('click', () => {
      navigator.clipboard.writeText(gitCommandsBox.textContent);
      showLog('📋 Copied Git deployment commands to clipboard!', 'success');
    });
  }

  btnFullscreen.addEventListener('click', () => {
    window.open('portfolio.html', '_blank');
  });

  btnDownload.addEventListener('click', () => {
    const content = currentGeneratedHtml || previewIframe.srcdoc;
    if (!content) {
      alert('Please generate a portfolio first!');
      return;
    }
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  }

  function fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  function showLog(msg, type = 'info') {
    logBanner.style.display = 'flex';
    logMessage.textContent = msg;

    if (type === 'error') {
      logIcon.textContent = '❌';
      logBanner.style.background = 'rgba(239, 68, 68, 0.15)';
      logBanner.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    } else if (type === 'success') {
      logIcon.textContent = '✅';
      logBanner.style.background = 'rgba(16, 185, 129, 0.15)';
      logBanner.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    } else {
      logIcon.textContent = 'ℹ️';
      logBanner.style.background = 'rgba(204, 255, 0, 0.15)';
      logBanner.style.borderColor = 'rgba(204, 255, 0, 0.3)';
    }
  }

  function setLoading(isLoading) {
    if (isLoading) {
      btnGenerate.disabled = true;
      btnSpinner.style.display = 'inline-block';
      btnText.textContent = 'Generating Theme & AI...';
    } else {
      btnGenerate.disabled = false;
      btnSpinner.style.display = 'none';
      btnText.textContent = '✨ Generate Web Portfolio';
    }
  }

});
