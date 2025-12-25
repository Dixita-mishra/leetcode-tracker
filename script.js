// Load data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateStreakDisplay();
});

// Add problem when button clicked
function addProblem() {
    const input = document.getElementById('problem-input');
    const problemName = input.value.trim();
    
    if (problemName === '') {
        alert('Please enter a problem name!');
        return;
    }
    
    // Add to problems list
    const problems = JSON.parse(localStorage.getItem('problems')) || [];
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    problems.push({
        name: problemName,
        firstAttempt: today,
        revisions: [today],
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
            <br><button onclick="markRevision(${problem.id})" style="margin-top: 5px; background: #10b981; padding: 5px 10px; font-size: 12px;">
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

// Calculate streak (days you've practiced)
function calculateStreak() {
    const problems = JSON.parse(localStorage.getItem('problems')) || [];
    const today = new Date();
    let streak = 0;
    
    // Check how many consecutive days have activity
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

// Update streak display
function updateStreakDisplay() {
    const streak = calculateStreak();
    document.getElementById('streakCounter').textContent = streak;
}

// Load all data and display
function loadData() {
    displayProblems();
}

// Allow Enter key to add problem
document.getElementById('problem-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        addProblem();
    }
});
