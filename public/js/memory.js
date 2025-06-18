class Memory {
    #$templateGameCard;
    #$gameCards;
    #$cards;
    #completeCards;
    #flippedCards;
    #currentMode;
    #modes;
    #emojis;
    #game;
    #flipDuration;
    #flipSound;

    /**
     * Reposition the current cards in the game cards
     */
    #repositionCards(rows, cols) {
        // Set the new columns in the game cards grid
        this.#$gameCards.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        // Gets all the current cards
        const currentCards = this.#$gameCards.querySelectorAll('.game__card');

        // Reconfigure all the cards in the game according to the rows and cols
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                // Get the current card
                const currentCard = currentCards[j + i * cols];

                // Put the new position in the current card
                currentCard.style.gridRow = `${i + 1}/${i + 2}`;
                currentCard.style.gridColumn = `${j + 1}/${j + 2}`;
            }
        }
    }

    /**
     * Gets the emojis that will be used in the game
     */
    #getGameEmojis() {
        const emojis = [];

        // Get the amount of emojis according to the current mode
        const amountEmojis = this.#modes[this.#currentMode].rows * 2;

        // Get the total emojis
        const totalEmojis = this.#emojis.length;

        // Set the current emojis
        for (let i = 0; i < amountEmojis; i++) {
            const currentEmoji = this.#emojis[
                Math.floor(Math.random() * totalEmojis)
            ];

            // Check that the current emoji has not been previously selected
            if (emojis.includes(currentEmoji)) {
                i--;
                continue;
            }

            // Adds the current emoji to the emojis list
            emojis.push(currentEmoji);
        }

        return emojis;
    }

    /**
     * Sets the emojis distribution of the current game
     */
    #setCurrentGame() {
        // Clear the game
        this.#game = [];

        // Get the selected emojis
        const selectedEmojis = this.#getGameEmojis();

        // Put randomly the selected emojis in the game
        while (selectedEmojis.length > 0) {
            // Select randomly one emoji
            const emojiIdx = Math.floor(Math.random() * selectedEmojis.length);
            const currentEmoji = selectedEmojis[emojiIdx];

            // Check if the game already had the current emoji included
            if (this.#game.includes(currentEmoji)) {
                // Remove the current emoji from the selected emojis
                selectedEmojis.splice(emojiIdx, 1);
            }

            // Add the current emoji to the game
            this.#game.push(currentEmoji);
        }
    }

    /**
     * Create the game cards, setting rows and columns of the current mode
     */
    #createCards(rows, cols) {
        // Set the columns in the game cards grid
        this.#$gameCards.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

        // Clear the flipped and complete cards
        this.#flippedCards.length = 0;
        this.#completeCards.length = 0;

        // Delete the old cards
        this.#$gameCards.innerText = '';

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

                // Puts the current card index inside the element
                gameCardCopy.setAttribute('data-idx', j + i * cols);

                // Insert the copy in the game cards
                this.#$gameCards.appendChild(gameCardCopy);
            }
        }

        // Set the current game
        this.#setCurrentGame();

        // Get all the game cards
        this.#$cards = this.#$gameCards.querySelectorAll('.game__card');
    }

    /**
     * Sets the game according to the current mode. This method executes the
     * method passed as a parameter to position the cards
     */
    #setGame(positionMethod) {
        // Get the rows and columns of the current mode
        const rows = this.#modes[this.#currentMode].rows;
        const cols = this.#modes[this.#currentMode].columns;

        // Get the screen dimensions
        const width = window.innerWidth;
        const height = window.innerHeight;

        // The columns will be configured depending on the screen size
        if (height > width) {  // Vertical
            positionMethod(rows, cols);
        } else {  // Horizontal (invert rows by columns)
            positionMethod(cols, rows);
        }
    }

    /**
     * Sets the game events to change the current mode and play the game
     */
    #gameEvents() {
        // Event when the user changes the current mode
        const gameOptions = document.querySelector('#game__options');
        gameOptions.addEventListener('click', (event) => {
            // Get the clicked element
            const target = event.target;

            // Verify if the clicked element is not an option
            if (!target.classList.contains('game__option')) {
                return;
            }

            // Change the current mode
            this.#currentMode = target.innerText;
            this.#setGame(this.#createCards.bind(this));
        });

        // Event when the user makes a play
        this.#$gameCards.addEventListener('click', (event) => {
            // Get the clicked element
            const target = event.target;

            // Verify if the clicked element is not a card
            if (!target.classList.contains('game__card')) return;

            // Get the card index
            const idx = target.getAttribute('data-idx');

            // Check that the user doesn't click on the same card or one complete
            // card
            if (this.#flippedCards.includes(idx) ||
                this.#completeCards.includes(idx)) {
                return;
            }

            // Get the current emoji
            const currentEmoji = this.#game[idx];

            // Shows the current emoji
            target.style.transform = 'rotateY(90deg)';
            this.#flipSound.currentTime = 0;
            this.#flipSound.play();
            setTimeout(() => {
                target.innerText = currentEmoji;
                target.style.transform = 'rotateY(0deg)';
            }, this.#flipDuration);

            // Flip and hide the cards
            switch (this.#flippedCards.length) {
                case 0:
                    // Add the current index to the flipped cards
                    this.#flippedCards.push(idx);
                    break;
                case 1:
                    // Check if the new emoji is the same as the old one
                    const lastIdx = this.#flippedCards.at(-1);
                    const lastEmoji = this.#game[lastIdx];

                    if (currentEmoji == lastEmoji) {
                        // Add the indexes to the complete cards
                        this.#completeCards.push(idx, lastIdx);

                        // Clear the flipped cards
                        this.#flippedCards.length = 0;

                        // Add the 'game__card--complete' class to the cards after
                        // 200 ms
                        setTimeout(() => {
                            const lastCard = this.#$cards[lastIdx];
                            target.classList.add('game__card--complete');
                            lastCard.classList.add('game__card--complete');
                        }, 300);
                    } else {
                        // Add the current index to the flipped cards
                        this.#flippedCards.push(idx);
                    }
                    break;
                default:
                    // Hides the flipped cards
                    this.#flippedCards.forEach((cardIdx) => {
                        // Get the current card
                        const card = this.#$cards[cardIdx];

                        // Remove the content with an animation
                        card.style.transform = 'rotateY(90deg)';
                        setTimeout(() => {
                            card.innerText = '';
                            card.style.transform = 'rotateY(0deg)';
                        }, this.#flipDuration);
                    });

                    // Clear the flipped cards list
                    this.#flippedCards.length = 0;
                    this.#flippedCards.push(idx);
            }
        })
    }

    /**
     * Sets the device events when the screens resizes
     */
    #setDeviceEvents() {
        window.addEventListener('resize', () => {
            this.#setGame(this.#repositionCards.bind(this))
        })
    }

    constructor() {
        // Configure the attributes
        this.#completeCards = [];
        this.#flippedCards = [];
        this.#currentMode = '4×4';
        this.#flipDuration = 130;
        this.#flipSound = new Audio('./public/sound/flip.wav');
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

        // Get the DOM elements
        this.#$templateGameCard = document.querySelector('#template-game-card');
        this.#$gameCards = document.querySelector('#game-cards');

        // Set the current game
        this.#setGame(this.#createCards.bind(this));

        // Set the device events
        this.#setDeviceEvents();

        // Set game events
        this.#gameEvents();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    new Memory;
})