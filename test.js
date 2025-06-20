async function debugLogin() {
  try {
    const response = await fetch('https://probable-space-doodle-976w7r5v666x3xvx7-3000.app.github.dev/api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'your_username',
        password: 'your_password'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response ok:', response.ok);

    // Get the raw response text first
    const responseText = await response.text();
    console.log('Raw response:', responseText);

    // Only try to parse JSON if there's content
    if (responseText) {
      try {
        const data = JSON.parse(responseText);
        console.log('Parsed JSON:', data);
      } catch (parseError) {
        console.log('Failed to parse JSON:', parseError.message);
        console.log('Response is not valid JSON');
      }
    } else {
      console.log('Empty response received');
    }

  } catch (error) {
    console.error('Network error:', error);
  }
}

// Alternative approach - check if response is JSON before parsing
async function safeLogin() {
  try {
    const response = await fetch('https://probable-space-doodle-976w7r5v666x3xvx7-3000.app.github.dev/api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'your_username',
        password: 'your_password'
      })
    });

    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('JSON response:', data);
    } else {
      const text = await response.text();
      console.log('Non-JSON response:', text);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

// Test if the endpoint exists first
async function testEndpoint() {
  try {
    const response = await fetch('https://probable-space-doodle-976w7r5v666x3xvx7-3000.app.github.dev/api/user', {
      method: 'GET', // Try GET first to see if endpoint exists
    });
    
    console.log('GET test - Status:', response.status);
    console.log('GET test - Status text:', response.statusText);
    
    const text = await response.text();
    console.log('GET test - Response:', text);
    
  } catch (error) {
    console.error('Endpoint test error:', error);
  }
}

// Run the debug functions
console.log('=== Testing endpoint ===');
testEndpoint();

console.log('\n=== Debug login ===');
debugLogin();

console.log('\n=== Safe login ===');
safeLogin();