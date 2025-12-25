let currentProblemId = null;
let originalSolution = '';

// Load data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateStreakDisplay();
    
    // Tab switching fix
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            switchTab(this.getAttribute('onclick').match(/'([^']+)'/)[1]);
        });
    });
});

// Add problem when button clicked
function addProblem() {
    const input = document.getElementById('problem-input');
    const problemName = input.value.trim();
    
    if (problemName === '') {
        alert('Please enter a problem name!');
        return;
    }
    
    const problems = JSON.parse(localStorage.getItem('problems')) || [];
    const today = new Date().toISOString().split('T')[0];
    
    problems.push({
        name: problemName,
        firstAttempt: today,
        revisions: [today],
        solution: '',
        id: Date.now()
    });
    
    localStorage.setItem('problems', JSON.stringify(problems));
    input.value = '';
    displayProblems();
    updateStreakDisplay();
}

// Display all problems
function displayProblems() {
    const problems = JSON.parse(localStorage.getItem('problems')) || [];
    const list = document.getElementById('problemList');
    
    list.innerHTML = '';
    
    problems.forEach(problem => {
        const li = document.createElement('li');
        const revisionsCount = problem.revisions.length;
        const lastRevision = new Date(problem.revisions[problem.revisions.length - 1]);
        const daysAgo = Math.floor((new Date() - lastRevision) / (1000 * 60 * 60 * 24));
        
        li.innerHTML = `
            <strong>${problem.name}</strong>
            <br><small>First: ${problem.firstAttempt}</small>
            <br><small>Revisions: ${revisionsCount} | Last: ${daysAgo === 0 ? 'Today' : daysAgo + ' days ago'}</small>
            <br><button onclick="loadProblem(${problem.id})" style="margin-top: 5px; background: #3b82f6; padding: 5px 10px; font-size: 12px;">
                Edit Solution
            </button>
            <button onclick="markRevision(${problem.id})" style="margin-top: 5px; margin-left: 5px; background: #10b981; padding: 5px 10px; font-size: 12px;">
                Revise Today
            </button>
        `;
        list.appendChild(li);
    });
}

// Mark problem as revised today
function markRevision(problemId) {
    const problems = JSON.parse(localStorage.getItem('problems')) || [];
    const today = new Date().toISOString().split('T')[0];
    
    const problem = problems.find(p => p.id === problemId);
    if (problem && !problem.revisions.includes(today)) {
        problem.revisions.push(today);
        localStorage.setItem('problems', JSON.stringify(problems));
        displayProblems();
        updateStreakDisplay();
    }
}

// Load problem for editing
function loadProblem(problemId) {
    const problems = JSON.parse(localStorage.getItem('problems')) || [];
    const problem = problems.find(p => p.id === problemId);
    
    if (problem) {
        currentProblemId = problemId;
        originalSolution = problem.solution || '';
        
        document.getElementById('originalCode').value = originalSolution;
        document.getElementById('currentCode').value = ''; // Clear for fresh attempt
        
        switchTab('original');
        alert(`📝 Loaded: ${problem.name}\nRevisions so far: ${problem.revisions.length}`);
    }
}


// Save original solution
function saveOriginalSolution() {
    if (!currentProblemId) {
        alert('Please select a problem first!');
        return;
    }
    
    const problems = JSON.parse(localStorage.getItem('problems')) || [];
    const problem = problems.find(p => p.id === currentProblemId);
    
    if (problem) {
        problem.solution = document.getElementById('originalCode').value;
        localStorage.setItem('problems', JSON.stringify(problems));
        alert('✅ Original solution saved!');
        displayProblems();
    }
}

// Clear current attempt
function clearCurrent() {
    document.getElementById('currentCode').value = '';
}

// Compare solutions
function compareSolutions() {
    const original = document.getElementById('originalCode').value;
    const current = document.getElementById('currentCode').value;
    
    if (!original) {
        alert('⚠️ Save original solution first!');
        return;
    }
    
    if (!current) {
        alert('⚠️ Write your current attempt first!');
        return;
    }
    
    const diff = simpleDiff(original, current);
    document.getElementById('diffView').innerHTML = diff;
    switchTab('diff');
}

// Simple line-by-line diff
function simpleDiff(original, current) {
    const originalLines = original.split('\n');
    const currentLines = current.split('\n');
    
    let diffHtml = '<h4>🔍 Code Comparison</h4>';
    
    for (let i = 0; i < Math.max(originalLines.length, currentLines.length); i++) {
        const origLine = originalLines[i] || '';
        const currLine = currentLines[i] || '';
        
        if (origLine === currLine && origLine.trim()) {
            diffHtml += `<div class="match">${origLine}</div>`;
        } else {
            if (currLine.trim()) {
                diffHtml += `<div class="addition">+ ${currLine}</div>`;
            }
            if (origLine.trim()) {
                diffHtml += `<div class="deletion">- ${origLine}</div>`;
            }
        }
    }
    
    return diffHtml || '<div style="color: #666;">No differences found! 🎉 Perfect recall!</div>';
}

// Tab switching
function switchTab(tabName) {
    document.getElementById('originalCode').style.display = 'none';
    document.getElementById('currentCode').style.display = 'none';
    document.getElementById('diffView').style.display = 'none';
    
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    
    if (tabName === 'original') {
        document.getElementById('originalCode').style.display = 'block';
        document.querySelector('.tab[onclick*="original"]').classList.add('active');
    } else if (tabName === 'current') {
        document.getElementById('currentCode').style.display = 'block';
        document.querySelector('.tab[onclick*="current"]').classList.add('active');
    } else {
        document.getElementById('diffView').style.display = 'block';
        document.querySelector('.tab[onclick*="diff"]').classList.add('active');
    }
}

// Streak calculation
function calculateStreak() {
    const problems = JSON.parse(localStorage.getItem('problems')) || [];
    const today = new Date();
    let streak = 0;
    
    while (true) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - streak);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        const hasActivity = problems.some(p => p.revisions.includes(dateStr));
        
        if (!hasActivity) break;
        streak++;
    }
    
    return streak;
}

function updateStreakDisplay() {
    const streak = calculateStreak();
    document.getElementById('streakCounter').textContent = streak;
}

function loadData() {
    displayProblems();
}

// Enter key support
document.getElementById('problem-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addProblem();
});
