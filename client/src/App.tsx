import React, { useEffect, useState } from 'react';

// Define the type for the backend response
interface ApiResponse {
  message: string;
}

function App() {
  // Define the state type as a string
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // Fetch from the backend
    fetch('/api')
      .then((res) => res.json())
      .then((data: ApiResponse) => setMessage(data.message));
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>React + Vite + Express</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;


