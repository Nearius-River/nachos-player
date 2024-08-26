function showConfirmation(message, callback) {
    const confirmationModal = document.getElementById('confirmationModal');
    const confirmationText = document.getElementById('confirmationText');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');

    confirmationText.textContent = message;

    confirmationModal.classList.remove('hidden');

    
    confirmYes.onclick = null;
    confirmNo.onclick = null;
    
    confirmYes.onclick = () => {
        confirmationModal.classList.add('hidden');
        if (callback) callback(true);
    };

    confirmNo.onclick = () => {
        confirmationModal.classList.add('hidden');
        if (callback) callback(false);
    };
}