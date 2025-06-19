class Memory {
    #$templateGameCard;
    #$gameCards;
    #$cards;
    #$hardcoreOption;
    #completeCards;
    #flippedCards;
    #flipDuration;
    #currentMode;
    #modes;
    #emojis;
    #game;
    #gameBlockedValues;
    #gameBlocked;
    #sounds;

    /**
     * Shows a flipped card animation and insert the 'content' to the card.
     * This method also has the option to play a sound
     */
    #showCardContent(card, content, sound = false) {
        // First part of the animation
        card.style.transform = 'rotateY(90deg)';

        // Play the flip sound
        if (sound) {
            this.#sounds.flip.currentTime = 0;
            this.#sounds.flip.play();
        }

        // Set one timeout to show the second part of the animation
        setTimeout(() => {
            card.innerText = content;
            card.style.transform = 'rotateY(0deg)';
        }, this.#flipDuration);
    }

    /**
     * Show all the cards in the hardcore mode one by one
     */
    #showAllCards(idx = 0) {
        // Verify if it was the last card
        if (idx == this.#$cards.length) {
            this.#gameBlocked = this.#gameBlockedValues.unlock;
            return;
        }

        // Remove the open class from the settings to prohibit the user from
        // changing the mode during the animation
        document.querySelector('#game-settings')
            .classList.remove('game__settings--open');

        // Block the game to prohibit the user from playing during the animation
        this.#gameBlocked = this.#gameBlockedValues.totalLock;

        // Get the current card with it's emoji
        const card = this.#$cards[idx];
        const cardEmoji = this.#game[idx];

        // Show the card
        this.#showCardContent(card, cardEmoji, true);

        // Show the next card after 100 ms
        setTimeout(() => {
            this.#showAllCards(++idx);
        }, 100);
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
     * Reposition the current cards in the game cards section
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

        // Show all the cards if the hardcore mode is selected
        if (this.#$hardcoreOption.checked) this.#showAllCards();
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
     * Check whether the player has won or not
     */
    #verfiyVictory() {
        const totalCards = this.#modes[this.#currentMode].total;
        const completeCards = this.#completeCards.length;

        // Check if the complete cards is equal to the total cards
        if (completeCards != totalCards) return;

        // Shows the modal after 200 ms
        const modal = document.querySelector("#modal");
        setTimeout(() => {
            // Open the modal
            modal.showModal();

            // Set modal title
            modal.querySelector('.modal__title').innerText = '¡Has ganado!';

            // Set modal text
            modal.querySelector('.modal__text').innerText = 'Felicidades, ' +
                'has encontrado todos los pares';

            // Hides the page scroll
            document.querySelector('.page').style.overflowY = 'hidden';

            // Play the 'win' sound
            this.#sounds.win.play();
        }, 200);
    }

    /**
     * This method will be executed when the users lose in hardcore mode. All
     * options and the modal will be displayed
     */
    #showLose() {
        // Shows the rest of the cards and the modal after 400ms
        const modal = document.querySelector("#modal");
        setTimeout(() => {
            const totalCards = this.#$cards.length;

            for (let i = 0; i < totalCards; i++) {
                // Verify if the card is alreade shown
                const card = this.#$cards[i];
                if (card.innerText != '★') continue;

                // Show the card emoji
                const emoji = this.#game[i];
                this.#showCardContent(card, emoji);
            }

            // Open the modal
            modal.showModal();

            // Set modal title
            modal.querySelector('.modal__title').innerText = '¡Has perdido!';

            // Set modal text
            modal.querySelector('.modal__text').innerText = 'Recuerda que, ' +
                'en el modo de una vida, tienes que encontrar todos los ' +
                'pares en un solo intento';

            // Hides the page scroll
            document.querySelector('.page').style.overflowY = 'hidden';

            // Play the 'lose' sound
            this.#sounds.lose.play();
        }, 400);
    }

    /**
     * Controls the actions in the normal game
     */
    #controlGame(card) {
        // Get the card index
        const cardIdx = card.getAttribute('data-idx');

        // Check that the user doesn't click on the same card or one complete
        // card
        if (this.#flippedCards.includes(cardIdx) ||
            this.#completeCards.includes(cardIdx)) {
            return;
        }

        // Get and show the card emoji
        const cardEmoji = this.#game[cardIdx];
        this.#showCardContent(card, cardEmoji, true);

        // Flip and hide the cards
        const flippedAmount = this.#flippedCards.length;
        switch (flippedAmount) {
            case 0:
                // Check if it's the first click of the game on hardcore mode
                if (this.#$hardcoreOption.checked) {
                    const completeAmount = this.#completeCards.length;
                    if (flippedAmount == 0 && completeAmount == 0) {
                        // Add the current index to the flipped cards
                        this.#flippedCards.push(cardIdx);

                        // Hide the rest of the cards
                        for (let i = 0; i < this.#game.length; i++) {
                            // Check if the iterator is the current card
                            if (i == cardIdx) continue;

                            // Hide the card
                            const card = this.#$cards[i];
                            this.#showCardContent(card, '★');
                        }

                        break;
                    }
                }

                // Add the current index to the flipped cards
                this.#flippedCards.push(cardIdx);
                break;
            case 1:
                // Get the last card emoji
                const lastIdx = this.#flippedCards.at(-1);
                const lastEmoji = this.#game[lastIdx];

                // Check if the new emoji is the same as the old one
                if (cardEmoji == lastEmoji) {
                    // Add the indexes to the complete cards
                    this.#completeCards.push(cardIdx, lastIdx);

                    // Clear the flipped cards
                    this.#flippedCards.length = 0;

                    // Apply a white filter to the cards after 300 ms
                    setTimeout(() => {
                        // Get the last card
                        const lastCard = this.#$cards[lastIdx];

                        // Set the 'game__card--complete' class to the cards
                        card.classList.add('game__card--complete');
                        lastCard.classList.add('game__card--complete');

                        // Play the 'pop' audio
                        this.#sounds.pop.play();

                        this.#verfiyVictory();
                    }, 300);
                } else {
                    // Check if it's the hardcore mode to show the losing modal
                    if (this.#$hardcoreOption.checked) {
                        this.#showLose()
                    }

                    // Add the current index to the flipped cards
                    this.#flippedCards.push(cardIdx);
                }
                break;
            default:
                // Hides all the flipped cards
                this.#flippedCards.forEach((idx) => {
                    // Get the current card
                    const flippedCard = this.#$cards[idx];

                    // Shows an empty string in the flipped card
                    this.#showCardContent(flippedCard, '★');
                });

                // Clear the flipped cards list
                this.#flippedCards.length = 0;
                this.#flippedCards.push(cardIdx);
        }
    }

    /**
     * Sets the game events to change the current mode and play the game
     */
    #gameEvents() {
        // Event when the user shows the settings
        const settingsBtn = document.querySelector('#game-settings-btn');
        const settings = document.querySelector('#game-settings');
        settingsBtn.addEventListener('pointerdown', () => {
            settings.classList.toggle('game__settings--open');
        });

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

        // Event when the user changes to hardcore mode
        this.#$hardcoreOption.addEventListener('change', () => {
            this.#setGame(this.#createCards.bind(this));  // Reset the game
        });

        // Event when the user makes a play
        this.#$gameCards.addEventListener('click', (event) => {
            // Check that the game is not blocked
            switch (this.#gameBlocked) {
                case this.#gameBlockedValues.partialLock:
                    // Restart the game
                    this.#setGame(this.#createCards.bind(this));
                case this.#gameBlockedValues.totalLock:
                    return;
            }

            // Get the clicked element
            const target = event.target;

            // Check that the clicked element is a card
            if (!target.classList.contains('game__card')) return;

            // Executes the method that controls the game
            this.#controlGame(target);
        });

        // Events when the user close the modal
        const modal = document.querySelector('#modal');
        modal.addEventListener('click', (event) => {
            // Check where the user clicks
            const target = event.target;

            // Check if neither the backdrop nor the close button were clicked
            if (target != modal && target.tagName != 'BUTTON') return;

            // Shows the page scroll
            document.querySelector('.page').style.overflowY = 'auto';

            // Close the modal
            modal.close();

            // Check if the hardcore mode is selected
            if (this.#$hardcoreOption.checked) {  // Hardcore mode
                // Give a partial lock to the game
                this.#gameBlocked = this.#gameBlockedValues.partialLock;
            } else {  // Normal mode
                this.#setGame(this.#createCards.bind(this));  // Game restart
            }
        });
    }

    /**
     * Sets the device events when the screens resizes
     */
    #setDeviceEvents() {
        window.addEventListener('resize', () => {
            this.#setGame(this.#repositionCards.bind(this))
        });
    }

    constructor() {
        // Configure the attributes
        this.#completeCards = [];  // Indexes list of the complete cards
        this.#flippedCards = [];  // Indexes list of the flipped cards
        this.#flipDuration = 130;  // Set the flip duration in 130 ms
        this.#currentMode = '4×4';  // Set the initial mode
        this.#gameBlockedValues = {
            'unlock': 0,
            'totalLock': 1,
            'partialLock': 2,
        };
        this.#gameBlocked = this.#gameBlockedValues.unlock;
        this.#sounds = {
            'flip': new Audio('./public/sounds/flip.wav'),
            'pop': new Audio('./public/sounds/pop.wav'),
            'win': new Audio('./public/sounds/win.wav'),
            'lose': new Audio('./public/sounds/lose.wav'),
        };
        this.#modes = {
            '4×4': { rows: 4, columns: 4, total: 16 },
            '5×4': { rows: 5, columns: 4, total: 20 },
            '6×4': { rows: 6, columns: 4, total: 24 },
            '7×4': { rows: 7, columns: 4, total: 28 },
            '8×4': { rows: 8, columns: 4, total: 32 },
            '9×4': { rows: 9, columns: 4, total: 36 },
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
        this.#$hardcoreOption = document.querySelector('#hardcore-mode');
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