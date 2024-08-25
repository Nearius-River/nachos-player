function navigateTo(pageId) {
    const pages = ['home', 'profile', 'settings', 'playlists'];

    pages.forEach(page => {
        const pageElement = document.getElementById(page);
        if (pageElement) {
            const pageLink = document.getElementById(page + 'Link');
            pageLink.classList.remove('active-page');
            pageElement.classList.add('hidden');
        }
    });

    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        const pageLink = document.getElementById(pageId + 'Link');
        pageLink.classList.add('active-page');
        targetPage.classList.remove('hidden');
    }
}

document.getElementById('homeLink').addEventListener('click', () => navigateTo('home'));
document.getElementById('profileLink').addEventListener('click', () => navigateTo('profile'));
document.getElementById('settingsLink').addEventListener('click', () => navigateTo('settings'));
document.getElementById('playlistsLink').addEventListener('click', () => navigateTo('playlists'));