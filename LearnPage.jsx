import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './lrn.css';

function LearnPage() {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const navigate = useNavigate(); 

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  const handleUpload = async () => {
    if (!selectedFiles) {
      return;
    }
    

    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('files', selectedFiles[i]);
    }

    try {
      const response = await fetch('http://localhost:8000/upload-documents/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setUploadStatus('Documents uploaded successfully');
        console.log('Upload successful');
      } else {
        setUploadStatus('Error: ${data.detail}');
      }
    } catch (error) {
      setUploadStatus('Error: ${error.message}');
    }
  };

  const handleNavigateToSummarize = () => {
    navigate('/summarize'); 
  };

  const handleNavigateToDoubt = () => {
    navigate('/doubt'); 
  };

  const handleNavigateToQuiz = () => {
    navigate('/quiz'); 
  };

  return (
    <div>
      <h2>Upload Documents</h2>
      <input type="file" multiple onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
      <p>{uploadStatus}</p>

      
      <button onClick={handleNavigateToSummarize}>Summarize</button>
      <button onClick={handleNavigateToDoubt}>Doubt</button>
      <button onClick={handleNavigateToQuiz}>Quiz</button>
    </div>
  );
}

export default LearnPage;