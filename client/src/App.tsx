import React, { useEffect, useState } from 'react';
import MapDrawingbaba from './components/leaflet-picker';

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
    <div className='relative w-[100vw] h-[100vw]'>
      <MapDrawingbaba></MapDrawingbaba>
    </div>
  );
}

export default App;


