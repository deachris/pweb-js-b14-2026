document.getElementById('loginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    const errorMessage = document.getElementById('errorMessage');

    // Loading State
    loginBtn.textContent = 'Loading...';
    loginBtn.disabled = true;
    errorMessage.style.display = 'none';

    try {
        // Autentikasi API
        const response = await fetch('https://dummyjson.com/users');
        const data = await response.json();

        // Validasi kredensial pengguna
        const user = data.users.find(u => u.username === usernameInput && u.password === passwordInput);

        if (user) {
            localStorage.setItem('firstName', user.firstName);
            
            // Auto Redirect
            window.location.href = 'index.html'; 
        } else {
            // Case kredensial salah
            errorMessage.textContent = 'Username atau password salah.';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        // Case API bermasalah
        errorMessage.textContent = 'Terjadi kesalahan koneksi jaringan atau server.';
        errorMessage.style.display = 'block';
    } finally {
        // Mengembalikan tombol ke keadaan semula
        loginBtn.textContent = 'Masuk';
        loginBtn.disabled = false;
    }
});