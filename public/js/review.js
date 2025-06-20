class Rate {
    #$averageValue;
    #$starsSection;
    #$starInputs;
    #lastChecked;
    #starsToIndex;
    #fetchURL;

    #fetchPetition(body, showError = false, defaultValue = null) {
        fetch(
            this.#fetchURL,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body
            }
        ).then(res => {
            if (!res.ok) {
                // Shows the alert
                if (showError) {
                    const alert = document.querySelector('#alert');
                    alert.classList.remove('alert--hidden');

                    setTimeout(() => {
                        alert.classList.add('alert--hidden');
                    }, 3000);
                }
                return false;
            }
            return res.json();
        }).then(data => {
            if (!data) return;

            // Get the value and average
            const value = defaultValue ?? data['value'];
            const average = data['average'];

            // Check the value
            if (value) {
                const idx = this.#starsToIndex[value];
                this.#$starInputs[idx].checked = true;
                this.#lastChecked = idx;
            }

            // Update the average value
            this.#$averageValue.innerText = average;
        });
    }

    #getReviewsValue() {
        // Create the body of the petition
        const body = `type=get`;
        this.#fetchPetition(body);
    }

    #setReviewsEvent() {
        this.#$starsSection.addEventListener('click', (event) => {
            const target = event.target;

            // Check the last checked element (to remove the second click from 
            // the input radio)
            if (this.#lastChecked == -1) {
                this.#$starInputs.forEach((star) => {
                    star.checked = false;
                });
            } else {
                this.#$starInputs[this.#lastChecked].checked = true;
            }

            // Verify if the clicked element was a star
            if (!target.classList.contains('reviews__star')) return;

            // Get the review value
            const reviewValue = Number(target.getAttribute('data-value'));

            // Set the last ckecked element as -1
            this.#lastChecked = -1;

            // Create the body of the petition
            const body = `type=post&value=${reviewValue}`;
            this.#fetchPetition(body, true, reviewValue);
        });
    }

    constructor() {
        // Configure the attributes
        this.#starsToIndex = {
            1: 4,  // One star -> Index '4'
            2: 3,  // Two stars -> Index '3'
            3: 2,  // Three stars -> Index '2'
            4: 1,  // Four stars -> Index '1'
            5: 0,  // Five stars -> Index '0'
        };  // Converts the number of stars to the respective index
        this.#fetchURL = './reviews.php';
        this.#lastChecked = -1;

        // Get the DOM elements
        this.#$averageValue = document.querySelector('#reviews-value');
        this.#$starsSection = document.querySelector('#reviews-stars');
        this.#$starInputs = this.#$starsSection.querySelectorAll('.reviews__input');

        // Set the event
        this.#setReviewsEvent();

        // Get the current value
        this.#getReviewsValue();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    new Rate;
});