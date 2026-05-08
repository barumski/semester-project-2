import { LOGIN_URL, getHeaders } from '../api/api.mjs';
import { saveToStorage } from '../utilities.mjs';

const form = document.querySelector('#login-form');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = form.email.value;
  const password = form.password.value;

  try {
    const response = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.message || 'Login failed');
    }

    const {accessToken, name} = data.data;

    saveToStorage('accessToken', accessToken);
    saveToStorage('userName', name);

    console.log('Login successful');
    console.log('Token:', accessToken);

    window.location.href = '../index.html';

  } catch (error) {
    console.error('Login error:', error.message);
  }
});