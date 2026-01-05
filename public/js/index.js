import '@babel/polyfill';
import { login, logout } from './login';

//ELEMENT
const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('.nav__el--logout');
//VALUES

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    console.log('gigidojfosdljfo');
    e.preventDefault();
    login(email, password);
  });
}

if (logOutBtn) {
  logOutBtn.addEventListener('click', logout);
}
