// Food-related words (strictly 5 letters, no plurals, no drinks/beverages)
const FOOD_WORDS = [
    'APPLE', 'BACON', 'BREAD', 'BROTH', 'CANDY', 'CREAM', 'CURRY', 'DONUT',
    'FLOUR', 'GRAPE', 'HONEY', 'LEMON', 'MANGO', 'OLIVE', 'ONION', 'PASTA',
    'PEACH', 'PIZZA', 'SALAD', 'SAUCE', 'SPICE', 'STEAK', 'SUGAR', 'TOAST',
    'WHEAT', 'BERRY', 'FRESH', 'FRIED', 'GRILL', 'MELON', 'PANKO', 'RANCH',
    'ROAST', 'SALTY', 'SWEET', 'TANGY', 'YEAST', 'ZESTY', 'BAGEL', 'CHARD',
    'CHILI', 'CRUST', 'DRIED', 'GRAIN', 'GRAVY', 'GREEN', 'MAPLE', 'MINTY',
    'NUTTY', 'PLATE', 'SERVE', 'SMOKE', 'SNACK', 'SPICY', 'STEAM', 'STOCK',
    'SYRUP', 'TABLE', 'TASTE', 'TREAT', 'WHISK', 'BLEND', 'BRINE', 'BROIL',
    'BROWN', 'CAKEY', 'CRISP', 'CRUMB', 'DICED', 'FEAST', 'FIBER', 'FLAKY',
    'GLAZE', 'LEAFY', 'LIGHT', 'MOIST', 'PLAIN', 'PUREE', 'SHARP', 'SLICE',
    'SOLID', 'SPLIT', 'THICK', 'TOUGH', 'TWIST', 'WAFER', 'WHOLE', 'DOUGH',
    'GUMBO', 'MATZO', 'MOCHI', 'NACHO', 'SCONE', 'THYME', 'BASIL', 'CUMIN',
    'ICING', 'PESTO', 'QUESO', 'SALSA', 'UMAMI', 'CHURN', 'CRACK', 'CRIMP',
    'CRUSH', 'GRIND', 'KNEAD', 'MINCE', 'BRAZE', 'SAUTE', 'SIEVE', 'STUFF'
];

const KEYBOARD_LAYOUT = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE']
];

class FoodleGame {
    constructor() {
        this.initializeDaily();
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
        
        // Show stats modal if game is already completed
        if (this.gameOver) {
            setTimeout(() => {
                this.updateStatsDisplay();
                this.showModal('stats-modal');
            }, 1000);
        }
        
        console.log('Target word:', this.targetWord); // For testing
        console.log('Game number:', this.gameNumber); // For testing
    }
    
    getTodaysDateString() {
        const today = new Date();
        return today.getFullYear() + '-' + 
               String(today.getMonth() + 1).padStart(2, '0') + '-' + 
               String(today.getDate()).padStart(2, '0');
    }
    
    initializeDaily() {
        // Get today's date string in YYYY-MM-DD format (local timezone)
        const dateString = this.getTodaysDateString();
        
        // Calculate days since a fixed start date (January 1, 2024)
        const startDate = new Date('2024-01-01');
        const currentDate = new Date(dateString);
        const timeDiff = currentDate.getTime() - startDate.getTime();
        this.gameNumber = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
        
        console.log('Date string:', dateString, 'Game number:', this.gameNumber);
        
        // Check if we already have today's game state saved
        const savedGameState = this.loadTodaysGame();
        if (savedGameState && savedGameState.gameNumber === this.gameNumber) {
            // Continue existing game
            this.targetWord = savedGameState.targetWord;
            this.currentRow = savedGameState.currentRow;
            this.currentCol = savedGameState.currentCol;
            this.gameOver = savedGameState.gameOver;
            this.gameWon = savedGameState.gameWon;
            this.guesses = savedGameState.guesses || [];
            this.keyboardState = savedGameState.keyboardState || {};
        } else {
            // Start new game for today
            this.targetWord = this.getDailyWord();
            this.gameOver = false;
            this.gameWon = false;
            this.guesses = [];
            this.keyboardState = {};
        }
    }
    
    getDailyWord() {
        // Use game number as seed for consistent daily word
        const wordIndex = this.gameNumber % FOOD_WORDS.length;
        return FOOD_WORDS[wordIndex];
    }
    
    loadTodaysGame() {
        const dateString = this.getTodaysDateString();
        const savedGame = localStorage.getItem(`foodle-game-${dateString}`);
        if (savedGame) {
            try {
                return JSON.parse(savedGame);
            } catch (e) {
                return null;
            }
        }
        return null;
    }
    
    saveTodaysGame() {
        const dateString = this.getTodaysDateString();
        const gameState = {
            gameNumber: this.gameNumber,
            targetWord: this.targetWord,
            currentRow: this.currentRow,
            currentCol: this.currentCol,
            gameOver: this.gameOver,
            gameWon: this.gameWon,
            guesses: this.guesses,
            keyboardState: this.keyboardState,
            grid: this.grid,
            dateString: dateString
        };
        localStorage.setItem(`foodle-game-${dateString}`, JSON.stringify(gameState));
        
        // Clean up old game states (keep only last 7 days)
        this.cleanupOldGames();
    }
    
    cleanupOldGames() {
        const today = new Date();
        for (let i = 8; i <= 30; i++) {
            const oldDate = new Date(today);
            oldDate.setDate(today.getDate() - i);
            const oldDateString = oldDate.getFullYear() + '-' + 
                                 String(oldDate.getMonth() + 1).padStart(2, '0') + '-' + 
                                 String(oldDate.getDate()).padStart(2, '0');
            localStorage.removeItem(`foodle-game-${oldDateString}`);
        }
    }
    
    initializeGrid() {
        const boardElement = document.getElementById('board');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < 6; row++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'row';
            if (!this.grid[row]) this.grid[row] = [];
            
            for (let col = 0; col < 5; col++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                tile.setAttribute('data-state', 'empty');
                tile.id = `tile-${row}-${col}`;
                rowElement.appendChild(tile);
                if (!this.grid[row][col]) this.grid[row][col] = '';
            }
            
            boardElement.appendChild(rowElement);
        }
        
        // Restore saved game state if continuing a game
        this.restoreGameState();
    }
    
    restoreGameState() {
        const savedGameState = this.loadTodaysGame();
        if (savedGameState && savedGameState.gameNumber === this.gameNumber && savedGameState.grid) {
            // Restore grid content and states
            for (let row = 0; row < 6; row++) {
                for (let col = 0; col < 5; col++) {
                    if (savedGameState.grid[row] && savedGameState.grid[row][col]) {
                        const tile = document.getElementById(`tile-${row}-${col}`);
                        const letter = savedGameState.grid[row][col];
                        tile.textContent = letter;
                        this.grid[row][col] = letter;
                        
                        // Set tile state based on whether this row was submitted
                        if (row < this.currentRow) {
                            // This row was already submitted, check the guess result
                            const guess = savedGameState.grid[row].join('');
                            const result = this.calculateGuessResult(guess, this.targetWord);
                            tile.setAttribute('data-state', result[col]);
                        } else if (row === this.currentRow && col < this.currentCol) {
                            // Current row, letters that have been typed
                            tile.setAttribute('data-state', 'tbd');
                        }
                    }
                }
            }
            
            // Restore keyboard states
            for (const [letter, state] of Object.entries(this.keyboardState)) {
                const key = document.querySelector(`[data-key="${letter}"]`);
                if (key) {
                    key.setAttribute('data-state', state);
                }
            }
        }
    }
    
    calculateGuessResult(guess, target) {
        const targetArray = target.split('');
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
        
        return result;
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
        
        // Stats modal events (stats button removed, but keep close functionality)
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
            this.saveTodaysGame();
        }
    }
    
    deleteLetter() {
        if (this.currentCol > 0) {
            this.currentCol--;
            this.grid[this.currentRow][this.currentCol] = '';
            const tile = document.getElementById(`tile-${this.currentRow}-${this.currentCol}`);
            tile.textContent = '';
            tile.setAttribute('data-state', 'empty');
            this.saveTodaysGame();
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
            this.saveTodaysGame();
        }
    }
    
    isValidWord(word) {
        // Strictly require 5-letter words only
        if (word.length !== 5 || !/^[A-Z]+$/.test(word)) {
            return false;
        }
        
        // For now, allow any 5-letter combination
        // In a production app, you'd check against a comprehensive dictionary
        return true;
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
        this.saveTodaysGame();
        
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
        let result = `Foodle ${this.gameNumber} ${guessCount}/6\n\n`;
        
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