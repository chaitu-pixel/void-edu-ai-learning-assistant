// ==========================================
// Void Edu - Main Application JavaScript
// ==========================================

const API_BASE = 'http://127.0.0.1:8000/api/v1';

// ==========================================
// State Management
// ==========================================
const state = {
    selectedFiles: [],
    currentQuiz: null,
    generatedQuestions: null,
    questionsType: 'mcq'
};

// ==========================================
// DOM Elements
// ==========================================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const elements = {
    // Navigation
    navItems: $$('.nav-item'),
    sections: $$('.content-section'),
    serverStatus: $('#serverStatus'),
    
    // Upload
    dropZone: $('#dropZone'),
    fileInput: $('#fileInput'),
    fileList: $('#fileList'),
    uploadBtn: $('#uploadBtn'),
    buildKbBtn: $('#buildKbBtn'),
    uploadStatus: $('#uploadStatus'),
    
    // Chat
    chatMessages: $('#chatMessages'),
    chatForm: $('#chatForm'),
    questionInput: $('#questionInput'),
    sendBtn: $('#sendBtn'),
    
    // Quiz
    quizTopic: $('#quizTopic'),
    generateQuizBtn: $('#generateQuizBtn'),
    quizCreate: $('#quizCreate'),
    quizQuestionsContainer: $('#quizQuestionsContainer'),
    quizTopicTitle: $('#quizTopicTitle'),
    quizProgress: $('#quizProgress'),
    quizQuestions: $('#quizQuestions'),
    submitQuizBtn: $('#submitQuizBtn'),
    newQuizBtn: $('#newQuizBtn'),
    quizResults: $('#quizResults'),
    scoreCircle: $('#scoreCircle'),
    scoreValue: $('#scoreValue'),
    scoreText: $('#scoreText'),
    resultsBreakdown: $('#resultsBreakdown'),
    retryQuizBtn: $('#retryQuizBtn'),
    quizStatus: $('#quizStatus'),
    
    // Questions
    questionsTopic: $('#questionsTopic'),
    generateQuestionsBtn: $('#generateQuestionsBtn'),
    generatedQuestions: $('#generatedQuestions'),
    questionsTabs: $$('.questions-tab'),
    questionsContent: $('#questionsContent'),
    mcqCount: $('#mcqCount'),
    descCount: $('#descCount'),
    questionsStatus: $('#questionsStatus'),
    
    // Loading & Toast
    loadingOverlay: $('#loadingOverlay'),
    loadingText: $('#loadingText'),
    toastContainer: $('#toastContainer')
};

// ==========================================
// Initialization
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initNavigation();
    initUpload();
    initChat();
    initQuiz();
    initQuestions();
    checkServerStatus();
});

// ==========================================
// Navigation
// ==========================================
function initNavigation() {
    elements.navItems.forEach(item => {
        item.addEventListener('click', () => {
            const tabId = item.dataset.tab;
            
            // Update nav items
            elements.navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update sections
            elements.sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === tabId) {
                    section.classList.add('active');
                }
            });
            
            // Reinitialize icons for the new section
            lucide.createIcons();
        });
    });
}

// ==========================================
// Server Status Check
// ==========================================
async function checkServerStatus() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (response.ok) {
            elements.serverStatus.innerHTML = `
                <i data-lucide="wifi"></i>
                <span>Connected</span>
            `;
            elements.serverStatus.className = 'status-indicator online';
        } else {
            throw new Error('Server not responding');
        }
    } catch (error) {
        elements.serverStatus.innerHTML = `
            <i data-lucide="wifi-off"></i>
            <span>Offline</span>
        `;
        elements.serverStatus.className = 'status-indicator offline';
    }
    lucide.createIcons();
}

// ==========================================
// Upload Section
// ==========================================
function initUpload() {
    // Click to browse
    elements.dropZone.addEventListener('click', () => elements.fileInput.click());
    
    // File input change
    elements.fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    elements.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        elements.dropZone.classList.add('dragover');
    });
    
    elements.dropZone.addEventListener('dragleave', () => {
        elements.dropZone.classList.remove('dragover');
    });
    
    elements.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        elements.dropZone.classList.remove('dragover');
        handleFileSelect({ target: { files: e.dataTransfer.files } });
    });
    
    // Buttons
    elements.uploadBtn.addEventListener('click', uploadFiles);
    elements.buildKbBtn.addEventListener('click', buildKnowledgeBase);
}

function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    const validExtensions = ['.pdf', '.docx', '.txt', '.md'];
    
    files.forEach(file => {
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        if (validExtensions.includes(ext) && state.selectedFiles.length < 5) {
            if (!state.selectedFiles.find(f => f.name === file.name)) {
                state.selectedFiles.push(file);
            }
        }
    });
    
    renderFileList();
    elements.uploadBtn.disabled = state.selectedFiles.length === 0;
}

function renderFileList() {
    if (state.selectedFiles.length === 0) {
        elements.fileList.innerHTML = '';
        return;
    }
    
    elements.fileList.innerHTML = state.selectedFiles.map((file, index) => `
        <div class="file-item">
            <div class="file-info">
                <div class="file-icon">
                    <i data-lucide="${getFileIcon(file.name)}"></i>
                </div>
                <div class="file-details">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${formatFileSize(file.size)}</span>
                </div>
            </div>
            <button class="file-remove" onclick="removeFile(${index})">
                <i data-lucide="x"></i>
            </button>
        </div>
    `).join('');
    
    lucide.createIcons();
}

function removeFile(index) {
    state.selectedFiles.splice(index, 1);
    renderFileList();
    elements.uploadBtn.disabled = state.selectedFiles.length === 0;
}

function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        'pdf': 'file-text',
        'docx': 'file-text',
        'doc': 'file-text',
        'txt': 'file',
        'md': 'file-code'
    };
    return icons[ext] || 'file';
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
}

async function uploadFiles() {
    if (state.selectedFiles.length === 0) return;
    
    showLoading('Uploading files...');
    
    try {
        const formData = new FormData();
        state.selectedFiles.forEach(file => formData.append('files', file));
        
        const response = await fetch(`${API_BASE}/documents/upload`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Upload failed');
        }
        
        const data = await response.json();
        
        showStatus(elements.uploadStatus, 'success', 
            `Successfully uploaded ${data.uploaded} file(s). Click "Build Knowledge Base" to index them.`);
        showToast('success', 'Files uploaded successfully!');
        
        state.selectedFiles = [];
        renderFileList();
        elements.uploadBtn.disabled = true;
        elements.fileInput.value = '';
        
    } catch (error) {
        showStatus(elements.uploadStatus, 'error', `Error: ${error.message}`);
        showToast('error', error.message);
    } finally {
        hideLoading();
    }
}

async function buildKnowledgeBase() {
    showLoading('Building knowledge base... This may take a moment.');
    
    try {
        const response = await fetch(`${API_BASE}/kb/build`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Build failed');
        }
        
        const data = await response.json();
        
        if (data.status === 'no_files_found') {
            showStatus(elements.uploadStatus, 'error', 'No files found. Please upload documents first.');
            showToast('error', 'No files found to index');
        } else {
            showStatus(elements.uploadStatus, 'success', 
                `Knowledge base built! ${data.total_documents} document(s), ${data.total_chunks} chunks indexed.`);
            showToast('success', 'Knowledge base built successfully!');
        }
        
    } catch (error) {
        showStatus(elements.uploadStatus, 'error', `Error: ${error.message}`);
        showToast('error', error.message);
    } finally {
        hideLoading();
    }
}

// ==========================================
// Chat Section
// ==========================================
function initChat() {
    elements.chatForm.addEventListener('submit', handleChatSubmit);
}

async function handleChatSubmit(e) {
    e.preventDefault();
    
    const question = elements.questionInput.value.trim();
    if (!question) return;
    
    // Clear welcome message if present
    const welcome = elements.chatMessages.querySelector('.welcome-message');
    if (welcome) welcome.remove();
    
    // Add user message
    addMessage('user', question);
    elements.questionInput.value = '';
    
    // Add typing indicator
    const typingId = addTypingIndicator();
    
    try {
        const response = await fetch(`${API_BASE}/chat/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, top_k: 5 })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Request failed');
        }
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator(typingId);
        
        // Add bot response with sources
        let content = data.answer;
        if (data.sources && data.sources.length > 0) {
            const sourceList = [...new Set(data.sources.map(s => s.source))].join(', ');
            content += `<div class="message-sources"><strong>Sources:</strong> ${sourceList}</div>`;
        }
        
        addMessage('bot', content);
        
    } catch (error) {
        removeTypingIndicator(typingId);
        addMessage('bot', `Sorry, I encountered an error: ${error.message}. Make sure you have uploaded documents and built the knowledge base.`);
    }
}

function addMessage(type, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const iconName = type === 'bot' ? 'bot' : 'user';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i data-lucide="${iconName}"></i>
        </div>
        <div class="message-content">${content}</div>
    `;
    
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    lucide.createIcons();
}

function addTypingIndicator() {
    const id = 'typing-' + Date.now();
    const typingDiv = document.createElement('div');
    typingDiv.id = id;
    typingDiv.className = 'message bot';
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i data-lucide="bot"></i>
        </div>
        <div class="message-content">
            <span class="typing-indicator">Thinking...</span>
        </div>
    `;
    elements.chatMessages.appendChild(typingDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    lucide.createIcons();
    return id;
}

function removeTypingIndicator(id) {
    const typing = document.getElementById(id);
    if (typing) typing.remove();
}

// ==========================================
// Quiz Section
// ==========================================
function initQuiz() {
    elements.generateQuizBtn.addEventListener('click', generateQuiz);
    elements.submitQuizBtn.addEventListener('click', submitQuiz);
    elements.newQuizBtn.addEventListener('click', resetQuiz);
    elements.retryQuizBtn.addEventListener('click', resetQuiz);
}

async function generateQuiz() {
    const topic = elements.quizTopic.value.trim();
    if (!topic) {
        showStatus(elements.quizStatus, 'error', 'Please enter a topic');
        return;
    }
    
    showLoading('Generating quiz questions... This may take a moment.');
    
    try {
        const response = await fetch(`${API_BASE}/quiz/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, top_k: 5 })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to generate quiz');
        }
        
        state.currentQuiz = await response.json();
        renderQuiz();
        showToast('success', 'Quiz generated successfully!');
        
    } catch (error) {
        showStatus(elements.quizStatus, 'error', `Error: ${error.message}`);
        showToast('error', error.message);
    } finally {
        hideLoading();
    }
}

function renderQuiz() {
    elements.quizCreate.classList.add('hidden');
    elements.quizResults.classList.add('hidden');
    elements.quizQuestionsContainer.classList.remove('hidden');
    
    elements.quizTopicTitle.textContent = `Topic: ${state.currentQuiz.topic}`;
    elements.quizProgress.textContent = `${state.currentQuiz.mcq_count} Questions`;
    
    elements.quizQuestions.innerHTML = state.currentQuiz.mcqs.map((mcq, index) => {
        const qId = mcq.id || `q${index + 1}`;
        
        return `
            <div class="quiz-question">
                <div class="question-header">
                    <span class="question-number">${index + 1}</span>
                    <span class="question-text">${mcq.question}</span>
                </div>
                <div class="quiz-options">
                    ${['A', 'B', 'C', 'D'].map(letter => `
                        <label class="quiz-option" onclick="selectOption(this, '${qId}', '${letter}')">
                            <input type="radio" name="${qId}" value="${letter}">
                            <span class="option-letter">${letter}</span>
                            <span class="option-text">${mcq.options[letter]}</span>
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    }).join('');
    
    hideStatus(elements.quizStatus);
    lucide.createIcons();
}

function selectOption(element, questionId, letter) {
    const parent = element.parentElement;
    parent.querySelectorAll('.quiz-option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    element.querySelector('input').checked = true;
}

async function submitQuiz() {
    // Collect answers
    const answers = {};
    state.currentQuiz.mcqs.forEach((mcq, index) => {
        const qId = mcq.id || `q${index + 1}`;
        const selected = document.querySelector(`input[name="${qId}"]:checked`);
        if (selected) {
            answers[qId] = selected.value;
        }
    });
    
    // Check if all answered
    if (Object.keys(answers).length < state.currentQuiz.mcqs.length) {
        showStatus(elements.quizStatus, 'error', 'Please answer all questions before submitting.');
        showToast('error', 'Please answer all questions');
        return;
    }
    
    showLoading('Evaluating your answers...');
    
    try {
        const response = await fetch(`${API_BASE}/quiz/${state.currentQuiz.quiz_id}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Submission failed');
        }
        
        const results = await response.json();
        renderResults(results);
        
    } catch (error) {
        showStatus(elements.quizStatus, 'error', `Error: ${error.message}`);
        showToast('error', error.message);
    } finally {
        hideLoading();
    }
}

function renderResults(results) {
    elements.quizQuestionsContainer.classList.add('hidden');
    elements.quizResults.classList.remove('hidden');
    
    // Score display with circular progress
    const percentage = results.accuracy;
    elements.scoreCircle.style.background = `conic-gradient(var(--primary-500) ${percentage * 3.6}deg, rgba(168, 85, 247, 0.2) 0deg)`;
    elements.scoreValue.textContent = `${Math.round(percentage)}%`;
    elements.scoreText.textContent = `You scored ${results.score} out of ${results.total}`;
    
    // Results breakdown
    elements.resultsBreakdown.innerHTML = results.details.map((detail, index) => {
        const mcq = state.currentQuiz.mcqs[index];
        const isCorrect = detail.is_correct;
        
        return `
            <div class="result-item ${isCorrect ? 'correct' : 'incorrect'}">
                <div class="result-icon">
                    <i data-lucide="${isCorrect ? 'check-circle' : 'x-circle'}"></i>
                </div>
                <div class="result-content">
                    <div class="result-question">${mcq.question}</div>
                    <div class="result-answer">
                        Your answer: ${detail.given || 'Not answered'} | 
                        Correct: ${detail.correct}
                        ${mcq.explanation ? ` — ${mcq.explanation}` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    lucide.createIcons();
}

function resetQuiz() {
    state.currentQuiz = null;
    elements.quizQuestionsContainer.classList.add('hidden');
    elements.quizResults.classList.add('hidden');
    elements.quizCreate.classList.remove('hidden');
    elements.quizTopic.value = '';
    hideStatus(elements.quizStatus);
}

// ==========================================
// Questions Generation Section
// ==========================================
function initQuestions() {
    elements.generateQuestionsBtn.addEventListener('click', generateQuestions);
    
    elements.questionsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const type = tab.dataset.type;
            state.questionsType = type;
            
            elements.questionsTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            renderQuestionsContent();
        });
    });
}

async function generateQuestions() {
    const topic = elements.questionsTopic.value.trim();
    if (!topic) {
        showStatus(elements.questionsStatus, 'error', 'Please enter a topic');
        return;
    }
    
    showLoading('Generating questions... This may take a moment.');
    
    try {
        const response = await fetch(`${API_BASE}/questions/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                topic, 
                top_k: 5,
                mcq_count: 10,
                descriptive_count: 5
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to generate questions');
        }
        
        state.generatedQuestions = await response.json();
        
        // Update counts
        elements.mcqCount.textContent = state.generatedQuestions.mcqs?.length || 0;
        elements.descCount.textContent = state.generatedQuestions.descriptive?.length || 0;
        
        // Show results
        elements.generatedQuestions.classList.remove('hidden');
        renderQuestionsContent();
        showToast('success', 'Questions generated successfully!');
        
    } catch (error) {
        showStatus(elements.questionsStatus, 'error', `Error: ${error.message}`);
        showToast('error', error.message);
    } finally {
        hideLoading();
    }
}

function renderQuestionsContent() {
    if (!state.generatedQuestions) return;
    
    const questions = state.questionsType === 'mcq' 
        ? state.generatedQuestions.mcqs 
        : state.generatedQuestions.descriptive;
    
    if (!questions || questions.length === 0) {
        elements.questionsContent.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--gray-500);">
                No ${state.questionsType === 'mcq' ? 'MCQ' : 'descriptive'} questions generated.
            </div>
        `;
        return;
    }
    
    if (state.questionsType === 'mcq') {
        elements.questionsContent.innerHTML = questions.map((q, index) => `
            <div class="question-item">
                <div class="question-item-header">
                    <span class="question-item-number">Q${index + 1}</span>
                </div>
                <div class="question-item-text">${q.question}</div>
                <div class="question-item-options">
                    ${['A', 'B', 'C', 'D'].map(letter => `
                        <div class="option-display ${letter === q.answer ? 'correct' : ''}">
                            ${letter}: ${q.options[letter]}
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    } else {
        elements.questionsContent.innerHTML = questions.map((q, index) => `
            <div class="question-item">
                <div class="question-item-header">
                    <span class="question-item-number">Q${index + 1}</span>
                </div>
                <div class="question-item-text">${q.question}</div>
            </div>
        `).join('');
    }
}

// ==========================================
// Utility Functions
// ==========================================
function showLoading(text = 'Loading...') {
    elements.loadingText.textContent = text;
    elements.loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    elements.loadingOverlay.classList.add('hidden');
}

function showStatus(element, type, message) {
    element.className = `status-card show ${type}`;
    element.textContent = message;
}

function hideStatus(element) {
    element.className = 'status-card';
}

function showToast(type, message) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">
            <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i>
        </span>
        <span class="toast-message">${message}</span>
    `;
    
    elements.toastContainer.appendChild(toast);
    lucide.createIcons();
    
    // Remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Make functions available globally
window.removeFile = removeFile;
window.selectOption = selectOption;
