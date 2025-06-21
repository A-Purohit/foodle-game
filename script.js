// Food-related words (5 letters)
const FOOD_WORDS = [
    'APPLE', 'BACON', 'BREAD', 'BROTH', 'CANDY', 'CREAM', 'CURRY', 'DONUT',
    'FLOUR', 'GRAPE', 'HONEY', 'LEMON', 'MANGO', 'OLIVE', 'ONION', 'PASTA',
    'PEACH', 'PIZZA', 'RICE', 'SALAD', 'SAUCE', 'SPICE', 'STEAK', 'SUGAR',
    'TOAST', 'TOMATO', 'WATER', 'WHEAT', 'BERRY', 'CARROT', 'CELERY', 'CHARD',
    'CHILI', 'CACAO', 'DATES', 'FRIES', 'GARLIC', 'HERBS', 'JUICE', 'KIWI',
    'LEEKS', 'MELON', 'NAAN', 'OATS', 'PANKO', 'QUINOA', 'RADISH', 'SUSHI',
    'THYME', 'VANILLA'
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
        this.grid = [];
        this.keyboardState = {};
        
        this.initializeGrid();
        this.initializeKeyboard();
        this.loadStats();
        this.bindEvents();
        
        console.log('Target word:', this.targetWord); // For testing
    }
    
    getRandomWord() {
        return FOOD_WORDS[Math.floor(Math.random() * FOOD_WORDS.length)];
    }
    
    initializeGrid() {
        const gridElement = document.getElementById('grid');
        gridElement.innerHTML = '';
        
        for (let row = 0; row < 6; row++) {
            this.grid[row] = [];
            for (let col = 0; col < 5; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.id = `cell-${row}-${col}`;
                gridElement.appendChild(cell);
                this.grid[row][col] = '';
            }
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
                keyElement.id = `key-${key}`;
                
                if (key === 'ENTER' || key === 'DELETE') {
                    keyElement.classList.add('wide');
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
        
        document.getElementById('play-again').addEventListener('click', () => {
            this.resetGame();
        });
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
            const cell = document.getElementById(`cell-${this.currentRow}-${this.currentCol}`);
            cell.textContent = letter;
            cell.classList.add('filled');
            this.currentCol++;
        }
    }
    
    deleteLetter() {
        if (this.currentCol > 0) {
            this.currentCol--;
            this.grid[this.currentRow][this.currentCol] = '';
            const cell = document.getElementById(`cell-${this.currentRow}-${this.currentCol}`);
            cell.textContent = '';
            cell.classList.remove('filled');
        }
    }
    
    submitGuess() {
        if (this.currentCol !== 5) {
            this.showMessage('Not enough letters!');
            return;
        }
        
        const guess = this.grid[this.currentRow].join('');
        const isValidWord = this.isValidWord(guess);
        
        if (!isValidWord) {
            this.showMessage('Not a valid food word!');
            this.shakeRow();
            return;
        }
        
        this.checkGuess(guess);
        
        if (guess === this.targetWord) {
            this.gameWon();
        } else if (this.currentRow === 5) {
            this.gameLost();
        } else {
            this.currentRow++;
            this.currentCol = 0;
        }
    }
    
    isValidWord(word) {
        // For now, allow any 5-letter combination
        // You could expand this with a proper dictionary check
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
        
        // Update UI
        for (let i = 0; i < 5; i++) {
            const cell = document.getElementById(`cell-${this.currentRow}-${i}`);
            const key = document.getElementById(`key-${guessArray[i]}`);
            
            setTimeout(() => {
                cell.classList.add(result[i]);
                
                // Update keyboard colors (only if better than current state)
                const currentKeyState = this.keyboardState[guessArray[i]];
                if (!currentKeyState || 
                    (result[i] === 'correct') ||
                    (result[i] === 'present' && currentKeyState !== 'correct')) {
                    
                    this.keyboardState[guessArray[i]] = result[i];
                    key.classList.remove('correct', 'present', 'absent');
                    key.classList.add(result[i]);
                }
            }, i * 100);
        }
    }
    
    gameWon() {
        this.gameOver = true;
        setTimeout(() => {
            this.updateStats(true);
            this.showModal('Congratulations! 🎉', `You guessed "${this.targetWord}" correctly!`);
        }, 600);
    }
    
    gameLost() {
        this.gameOver = true;
        setTimeout(() => {
            this.updateStats(false);
            this.showModal('Game Over! 😔', `The word was "${this.targetWord}"`);
        }, 600);
    }
    
    showMessage(message) {
        // Simple alert for now - could be improved with better UI
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1000;
        `;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 2000);
    }
    
    shakeRow() {
        for (let i = 0; i < 5; i++) {
            const cell = document.getElementById(`cell-${this.currentRow}-${i}`);
            cell.style.animation = 'shake 0.5s';
            setTimeout(() => {
                cell.style.animation = '';
            }, 500);
        }
    }
    
    showModal(title, message) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').innerHTML = message;
        document.getElementById('correct-word').textContent = this.targetWord;
        document.getElementById('modal').classList.add('show');
    }
    
    resetGame() {
        this.targetWord = this.getRandomWord();
        this.currentRow = 0;
        this.currentCol = 0;
        this.gameOver = false;
        this.keyboardState = {};
        
        // Clear grid
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 5; col++) {
                const cell = document.getElementById(`cell-${row}-${col}`);
                cell.textContent = '';
                cell.className = 'cell';
                this.grid[row][col] = '';
            }
        }
        
        // Clear keyboard colors
        document.querySelectorAll('.key').forEach(key => {
            key.classList.remove('correct', 'present', 'absent');
        });
        
        // Hide modal
        document.getElementById('modal').classList.remove('show');
        
        console.log('New target word:', this.targetWord); // For testing
    }
    
    loadStats() {
        const stats = JSON.parse(localStorage.getItem('foodle-stats') || '{"played": 0, "won": 0, "streak": 0}');
        this.updateStatsDisplay(stats);
    }
    
    updateStats(won) {
        const stats = JSON.parse(localStorage.getItem('foodle-stats') || '{"played": 0, "won": 0, "streak": 0}');
        
        stats.played++;
        if (won) {
            stats.won++;
            stats.streak++;
        } else {
            stats.streak = 0;
        }
        
        localStorage.setItem('foodle-stats', JSON.stringify(stats));
        this.updateStatsDisplay(stats);
    }
    
    updateStatsDisplay(stats) {
        document.getElementById('games-played').textContent = stats.played;
        document.getElementById('win-percentage').textContent = 
            stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
        document.getElementById('current-streak').textContent = stats.streak;
    }
}

// Add shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new FoodleGame();
});