import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [apod, setApod] = useState(null);
  const [error, setError] = useState(null); // State to hold any errors

  useEffect(() => {
    const fetchApod = async () => {
      try {
        const res = await axios.get('http://localhost:5001/api/apod');
        setApod(res.data);
      } catch (err) {
        console.error("Error fetching APOD from backend:", err);
        setError("Failed to load Astronomy Picture of the Day. Please try again later.");
      }
    };

    fetchApod();
  }, []); // Empty dependency array means this runs once on component mount

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>NASA Astronomy Picture of the Day</h1>

      {error && (
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
      )}

      {!apod && !error && (
        <p style={{ textAlign: 'center', color: '#666' }}>Loading...</p>
      )}

      {apod && (
        <div style={{ marginTop: '20px' }}>
          <h2 style={{ color: '#0056b3', marginBottom: '10px' }}>{apod.title}</h2>
          {apod.media_type === 'image' ? (
            <img 
              src={apod.url} 
              alt={apod.title} 
              style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto', borderRadius: '4px' }} 
            />
          ) : (
            <p>Content is not an image Media Type: {apod.media_type}</p>
          )}
          <p style={{ lineHeight: '1.6', color: '#555', marginTop: '15px' }}>{apod.explanation}</p>
          {apod.copyright && (
            <p style={{ fontSize: '0.9em', color: '#777', textAlign: 'right' }}>Copyright: {apod.copyright}</p>
          )}
          <p style={{ fontSize: '0.9em', color: '#777', textAlign: 'right' }}>Date: {apod.date}</p>
        </div>
      )}
    </div>
  );
}

export default App;