// Food-related words (5 letters)
const FOOD_WORDS = [
    'APPLE', 'BACON', 'BREAD', 'BROTH', 'CANDY', 'CREAM', 'CURRY', 'DONUT',
    'FLOUR', 'GRAPE', 'HONEY', 'LEMON', 'MANGO', 'OLIVE', 'ONION', 'PASTA',
    'PEACH', 'PIZZA', 'SALAD', 'SAUCE', 'SPICE', 'STEAK', 'SUGAR', 'TOAST',
    'WATER', 'WHEAT', 'BERRY', 'CARROT', 'CELERY', 'CHARD', 'CHILI', 'CACAO',
    'DATES', 'FRIES', 'GARLIC', 'HERBS', 'JUICE', 'LEEKS', 'MELON', 'PANKO',
    'QUINOA', 'RADISH', 'SUSHI', 'THYME', 'BASIL', 'CUMIN', 'DILL', 'MINT',
    'NUTS', 'OATS', 'PEAR', 'PLUM', 'RICE', 'TUNA', 'WRAP', 'YAMS'
];

const KEYBOARD_LAYOUT = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE']
];

class FoodleGame {
    constructor() {
        this.targetWord = this.getRandomWord();
        this.currentRow = 0;
        this.currentCol = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.grid = [];
        this.keyboardState = {};
        this.guesses = [];
        
        this.initializeGrid();
        this.initializeKeyboard();
        this.loadStats();
        this.bindEvents();
        this.updateCountdown();
        
        console.log('Target word:', this.targetWord); // For testing
    }
    
    getRandomWord() {
        return FOOD_WORDS[Math.floor(Math.random() * FOOD_WORDS.length)];
    }
    
    initializeGrid() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 6; row++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'row';
            this.grid[row] = [];
            
            for (let col = 0; col < 5; col++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.setAttribute('data-state', 'empty');
                tile.id = `tile-${row}-${col}`;
                rowElement.appendChild(tile);
                this.grid[row][col] = '';
            }
            
            boardElement.appendChild(rowElement);
        }
    }
    
    initializeKeyboard() {
        const keyboardElement = document.getElementById('keyboard');
        keyboardElement.innerHTML = '';
        
        KEYBOARD_LAYOUT.forEach(row => {
            const rowElement = document.createElement('div');
            rowElement.className = 'keyboard-row';
            
            row.forEach(key => {
                const keyElement = document.createElement('button');
                keyElement.className = 'key';
                keyElement.textContent = key;
                keyElement.setAttribute('data-key', key);
                
                if (key === 'ENTER' || key === 'DELETE') {
                    keyElement.classList.add('one-and-a-half');
                }
                
                keyElement.addEventListener('click', () => this.handleKeyPress(key));
                rowElement.appendChild(keyElement);
            });
            
            keyboardElement.appendChild(rowElement);
        });
    }
    
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toUpperCase();
            
            if (key === 'ENTER') {
                this.handleKeyPress('ENTER');
            } else if (key === 'BACKSPACE') {
                this.handleKeyPress('DELETE');
            } else if (key.match(/[A-Z]/) && key.length === 1) {
                this.handleKeyPress(key);
            }
        });
        
        // Help modal events
        document.getElementById('help-button').addEventListener('click', () => {
            this.showModal('help-modal');
        });
        
        document.getElementById('close-help').addEventListener('click', () => {
            this.hideModal('help-modal');
        });
        
        // Stats modal events
        document.getElementById('stats-button').addEventListener('click', () => {
            this.updateStatsDisplay();
            this.showModal('stats-modal');
        });
        
        document.getElementById('close-stats').addEventListener('click', () => {
            this.hideModal('stats-modal');
        });
        
        // Share button
        document.getElementById('share-button').addEventListener('click', () => {
            this.shareResults();
        });
        
        // Close modals when clicking outside
        ['help-modal', 'stats-modal'].forEach(modalId => {
            document.getElementById(modalId).addEventListener('click', (e) => {
                if (e.target.id === modalId) {
                    this.hideModal(modalId);
                }
            });
        });
    }
    
    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }
    
    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }
    
    handleKeyPress(key) {
        if (this.gameOver) return;
        
        if (key === 'ENTER') {
            this.submitGuess();
        } else if (key === 'DELETE') {
            this.deleteLetter();
        } else if (this.currentCol < 5) {
            this.addLetter(key);
        }
    }
    
    addLetter(letter) {
        if (this.currentCol < 5) {
            this.grid[this.currentRow][this.currentCol] = letter;
            const tile = document.getElementById(`tile-${this.currentRow}-${this.currentCol}`);
            tile.textContent = letter;
            tile.setAttribute('data-state', 'tbd');
            tile.setAttribute('data-animation', 'pop');
            
            // Remove animation after it completes
            setTimeout(() => {
                tile.removeAttribute('data-animation');
            }, 100);
            
            this.currentCol++;
        }
    }
    
    deleteLetter() {
        if (this.currentCol > 0) {
            this.currentCol--;
            this.grid[this.currentRow][this.currentCol] = '';
            const tile = document.getElementById(`tile-${this.currentRow}-${this.currentCol}`);
            tile.textContent = '';
            tile.setAttribute('data-state', 'empty');
        }
    }
    
    submitGuess() {
        if (this.currentCol !== 5) {
            this.showToast('Not enough letters');
            return;
        }
        
        const guess = this.grid[this.currentRow].join('');
        
        if (!this.isValidWord(guess)) {
            this.showToast('Not a valid food word');
            this.shakeRow();
            return;
        }
        
        this.guesses.push(guess);
        this.checkGuess(guess);
        
        if (guess === this.targetWord) {
            this.endGame(true);
        } else if (this.currentRow === 5) {
            this.endGame(false);
        } else {
            this.currentRow++;
            this.currentCol = 0;
        }
    }
    
    isValidWord(word) {
        // For simplicity, allow any 5-letter combination
        // In a real app, you'd check against a dictionary
        return word.length === 5 && /^[A-Z]+$/.test(word);
    }
    
    checkGuess(guess) {
        const targetArray = this.targetWord.split('');
        const guessArray = guess.split('');
        const result = new Array(5);
        const targetUsed = new Array(5).fill(false);
        
        // First pass: mark correct letters
        for (let i = 0; i < 5; i++) {
            if (guessArray[i] === targetArray[i]) {
                result[i] = 'correct';
                targetUsed[i] = true;
            }
        }
        
        // Second pass: mark present letters
        for (let i = 0; i < 5; i++) {
            if (result[i] !== 'correct') {
                const targetIndex = targetArray.findIndex((letter, index) => 
                    letter === guessArray[i] && !targetUsed[index]
                );
                
                if (targetIndex !== -1) {
                    result[i] = 'present';
                    targetUsed[targetIndex] = true;
                } else {
                    result[i] = 'absent';
                }
            }
        }
        
        // Update tiles with animation
        for (let i = 0; i < 5; i++) {
            const tile = document.getElementById(`tile-${this.currentRow}-${i}`);
            const key = document.querySelector(`[data-key="${guessArray[i]}"]`);
            
            setTimeout(() => {
                tile.setAttribute('data-state', result[i]);
                tile.setAttribute('data-animation', 'flip-in');
                
                // Update keyboard colors (only if better than current state)
                const currentKeyState = this.keyboardState[guessArray[i]];
                if (!currentKeyState || 
                    (result[i] === 'correct') ||
                    (result[i] === 'present' && currentKeyState !== 'correct')) {
                    
                    this.keyboardState[guessArray[i]] = result[i];
                    key.setAttribute('data-state', result[i]);
                }
                
                // Remove animation after it completes
                setTimeout(() => {
                    tile.removeAttribute('data-animation');
                }, 600);
            }, i * 100);
        }
    }
    
    endGame(won) {
        this.gameOver = true;
        this.gameWon = won;
        
        setTimeout(() => {
            this.updateStats(won);
            if (won) {
                this.showToast(`Fantastic! 🎉`);
            } else {
                this.showToast(`The word was ${this.targetWord}`, 5000);
            }
            
            // Show stats modal after a short delay
            setTimeout(() => {
                this.updateStatsDisplay();
                this.showModal('stats-modal');
            }, 2000);
        }, 600);
    }
    
    showToast(message, duration = 3000) {
        const toaster = document.getElementById('toaster');
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        toaster.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toaster.removeChild(toast);
            }
        }, duration);
    }
    
    shakeRow() {
        for (let i = 0; i < 5; i++) {
            const tile = document.getElementById(`tile-${this.currentRow}-${i}`);
            tile.style.animation = 'shake 0.5s';
            setTimeout(() => {
                tile.style.animation = '';
            }, 500);
        }
    }
    
    loadStats() {
        const defaultStats = {
            totalPlayed: 0,
            totalWon: 0,
            currentStreak: 0,
            maxStreak: 0,
            guessDistribution: [0, 0, 0, 0, 0, 0]
        };
        
        this.stats = JSON.parse(localStorage.getItem('foodle-stats') || JSON.stringify(defaultStats));
    }
    
    updateStats(won) {
        this.stats.totalPlayed++;
        
        if (won) {
            this.stats.totalWon++;
            this.stats.currentStreak++;
            this.stats.maxStreak = Math.max(this.stats.maxStreak, this.stats.currentStreak);
            this.stats.guessDistribution[this.currentRow]++;
        } else {
            this.stats.currentStreak = 0;
        }
        
        localStorage.setItem('foodle-stats', JSON.stringify(this.stats));
    }
    
    updateStatsDisplay() {
        document.getElementById('total-played').textContent = this.stats.totalPlayed;
        document.getElementById('win-percentage').textContent = 
            this.stats.totalPlayed > 0 ? Math.round((this.stats.totalWon / this.stats.totalPlayed) * 100) : 0;
        document.getElementById('current-streak').textContent = this.stats.currentStreak;
        document.getElementById('max-streak').textContent = this.stats.maxStreak;
        
        // Update guess distribution
        const maxCount = Math.max(...this.stats.guessDistribution, 1);
        for (let i = 1; i <= 6; i++) {
            const count = this.stats.guessDistribution[i - 1];
            const percentage = (count / maxCount) * 100;
            
            const barFill = document.querySelector(`[data-guess="${i}"]`);
            const countElement = document.getElementById(`guess-${i}`);
            
            if (barFill && countElement) {
                barFill.style.width = `${Math.max(percentage, 7)}%`;
                countElement.textContent = count;
                
                // Highlight current game result
                if (this.gameWon && this.currentRow === i - 1) {
                    barFill.style.backgroundColor = '#6aaa64';
                }
            }
        }
    }
    
    updateCountdown() {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        const timeLeft = tomorrow - now;
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        const countdownTimer = document.getElementById('countdown-timer');
        if (countdownTimer) {
            countdownTimer.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        setTimeout(() => this.updateCountdown(), 1000);
    }
    
    shareResults() {
        if (!this.gameOver) return;
        
        const guessCount = this.gameWon ? this.currentRow + 1 : 'X';
        let result = `Foodle ${guessCount}/6\n\n`;
        
        this.guesses.forEach((guess, index) => {
            const targetArray = this.targetWord.split('');
            const guessArray = guess.split('');
            const targetUsed = new Array(5).fill(false);
            const resultArray = new Array(5);
            
            // Same logic as checkGuess for determining colors
            for (let i = 0; i < 5; i++) {
                if (guessArray[i] === targetArray[i]) {
                    resultArray[i] = '🟩';
                    targetUsed[i] = true;
                }
            }
            
            for (let i = 0; i < 5; i++) {
                if (resultArray[i] !== '🟩') {
                    const targetIndex = targetArray.findIndex((letter, idx) => 
                        letter === guessArray[i] && !targetUsed[idx]
                    );
                    
                    if (targetIndex !== -1) {
                        resultArray[i] = '🟨';
                        targetUsed[targetIndex] = true;
                    } else {
                        resultArray[i] = '⬜';
                    }
                }
            }
            
            result += resultArray.join('') + '\n';
        });
        
        result += '\nPlay at: ' + window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: 'Foodle',
                text: result
            });
        } else {
            navigator.clipboard.writeText(result).then(() => {
                this.showToast('Results copied to clipboard!');
            });
        }
    }
}

// Add shake animation if not already present
if (!document.querySelector('#shake-style')) {
    const style = document.createElement('style');
    style.id = 'shake-style';
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new FoodleGame();
});