// Toggle password visibility
function togglePassword() {
  const passwordInput = document.getElementById('password');
  const passwordIcon = document.getElementById('password-icon');
  const toggleBtn = document.querySelector('.password-toggle');

  if (passwordInput.type === 'password') {
    passwordInput.type = 'text';
    passwordIcon.textContent = 'visibility_off';
    toggleBtn.setAttribute('aria-label', 'Ocultar contraseña');
  } else {
    passwordInput.type = 'password';
    passwordIcon.textContent = 'visibility';
    toggleBtn.setAttribute('aria-label', 'Mostrar contraseña');
  }
}