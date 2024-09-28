import React, { useState } from 'react';

function DoubtPage() {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [reliability, setReliability] = useState('');  // New state for reliability score
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/query/${query}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setAnswer(data.answer);
        setReliability(data.reliability);  // Set the reliability score
      } else {
        console.error('Error fetching answer');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Query Document</h2>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your query"
      />
      <button onClick={handleQuery} disabled={loading}>
        {loading ? 'Fetching...' : 'Query'}
      </button>
      {answer && <p>Answer: {answer}</p>}
      {reliability &&<p>reliability & Reliability Score: {reliability}%</p>}  
    </div>
  );
}

export default DoubtPage; 