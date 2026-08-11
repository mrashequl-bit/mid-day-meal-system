const http = require('http');

async function test() {
  try {
    const loginRes = await fetch('http://localhost:3002/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'sunny', password: '123456' })
    });
    
    console.log("Login status:", loginRes.status);
    const cookies = loginRes.headers.get('set-cookie');
    console.log("Cookies:", cookies);
    console.log("Login Text:", await loginRes.text());

    if (cookies) {
      const pageRes = await fetch('http://localhost:3002/', {
        headers: { 'Cookie': cookies }
      });
      console.log("Page status:", pageRes.status);
      const text = await pageRes.text();
      console.log("Page length:", text.length);
    }
  } catch (e) {
    console.error(e);
  }
}

test();
