class Memory {
    #$templateGameCard;
    #$gameCards
    #currentMode;
    #modes;
    #emojis;
    #isPlaying;

    /**
     * Configures the game cards, setting rows and columns of the current mode
     */
    #configureCards(rows, cols) {
        // Set the columns in the game cards grid
        this.#$gameCards.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        // Generate and put a card in the game according to the rows and cols
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                // Create a game card copy
                const gameCardCopy = this.#$templateGameCard.content
                    .cloneNode(true)
                    .querySelector('.game__card');

                // Put the current position in the copy
                gameCardCopy.style.gridRow = `${i + 1}/${i + 2}`;
                gameCardCopy.style.gridColumn = `${j + 1}/${j + 2}`;

                // Insert the copy in the game cards
                this.#$gameCards.appendChild(gameCardCopy);
            }
        }
    }

    /**
     * Sets the game according to the current mode
     */
    #setGame() {
        // Get the rows and columns of the current mode
        const rows = this.#modes[this.#currentMode].rows;
        const cols = this.#modes[this.#currentMode].columns;

        // Get the screen dimensions
        const width = window.innerWidth;
        const height = window.innerHeight;

        // The columns will be configured depending on the screen size
        if (height > width) {  // Vertical
            this.#configureCards(rows, cols);
        } else {  // Horizontal (invert rows by columns)
            this.#configureCards(cols, rows);
        }
    }

    /**
     * Sets the device events when the screens resizes
     */
    #setDeviceEvents() {
        window.addEventListener('resize', () => {
            this.#setGame();
        })
    }

    constructor() {
        // Configure the attributes
        this.#currentMode = '4×4';
        this.#modes = {
            '4×4': { rows: 4, columns: 4 },  // 16 cards
            '5×4': { rows: 5, columns: 4 },  // 20 cards
            '6×4': { rows: 6, columns: 4 },  // 24 cards
            '7×4': { rows: 7, columns: 4 },  // 28 cards
            '8×4': { rows: 8, columns: 4 },  // 32 cards
            '9×4': { rows: 9, columns: 4 },  // 36 cards
        };
        // Set 50 emojis for the games
        this.#emojis = [
            '👀', '👅', '🤚', '☂️', '👑', '🧶', '🧳', '👢', '💼', '⚽️',
            '🍏', '🍊', '🥑', '🥥', '🍞', '🍖', '🥪', '🍰', '🍭', '🍴',
            '🎻', '🎲', '🎯', '🎷', '🥁', '🚗', '🚑', '🏠', '⌚️', '🔎',
            '🐶', '🐱', '🦊', '🐻', '🦆', '🐒', '🦉', '🐜', '🦞', '🦈',
            '🐊', '🐂', '🐖', '🐓', '🐈', '🐉', '🌎', '🪐', '⛄️', '🌊',
        ];
        this.#isPlaying = false;

        // Get the DOM elements
        this.#$templateGameCard = document.querySelector('#template-game-card');
        this.#$gameCards = document.querySelector('#game-cards');

        // Set the current game
        this.#setGame();

        // Set the device events
        this.#setDeviceEvents();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    new Memory;
})