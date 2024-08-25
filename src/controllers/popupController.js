function showPopup(message) {
    const popupContainer = document.getElementById('popup-container');
    const popupMessage = document.getElementById('popup-message');
    popupMessage.textContent = message;
    popupContainer.classList.add('show');
    popupContainer.classList.remove('hidden');

    // Remove the popup after 3 seconds
    setTimeout(() => {
        popupContainer.classList.remove('show');
        setTimeout(() => {
            popupContainer.classList.add('hidden');
        }, 500); // Match the transition duration
    }, 3000);
}