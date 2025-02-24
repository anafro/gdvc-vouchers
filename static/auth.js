async function storeTokenAndReload(token) {
    setCookie('auth_token', token, 365 * 3);
    window.location.reload();
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000)); // Expiration time
    const expiresString = "expires=" + expires.toUTCString();

    document.cookie = `${name}=${value}; ${expiresString}; path=/`;
}
