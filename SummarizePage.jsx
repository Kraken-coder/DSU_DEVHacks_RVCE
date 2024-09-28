 import './summ.css';

import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown'; // Import the react-markdown library

function SummarizePage() {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      setSummary(''); 
      try {
        const response = await fetch('http://localhost:8000/summarize/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: '' }), 
        });

        if (response.ok) {
          const data = await response.json();
          setSummary(data); 
        } else {
          const error = await response.json();
          console.error('Error summarizing:', error.detail);
        }
      } catch (error) {
        console.error('Error:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []); 

  return (
    <div className="summarize-page">
      <h1>Summary</h1>
      {loading ? (
        <p>Loading summary...</p>
      ) : (
        <div className="summary-result">
          <h2>Summary:</h2>
          {/* Render the summary using ReactMarkdown */}
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export default SummarizePage;
 