

import React, { useState } from 'react';

function QuizPage() {
  const [questions, setQuestions] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [loading, setLoading] = useState(false);

  const handleQuizPage = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/generate-questions/', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
      } else {
        console.error('Error generating questions');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle radio button selection
  const handleOptionChange = (questionIndex, option) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionIndex]: option,
    });
  };

  // Function to handle answer submission
  const handleSubmitAnswer = (questionIndex) => {
    setSubmittedAnswers({
      ...submittedAnswers,
      [questionIndex]: selectedAnswers[questionIndex],
    });
  };

  const isCorrect = (question, selectedAnswer) => {
    return question.answer === selectedAnswer;
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Generate Questions</h2>
      <button onClick={handleQuizPage} disabled={loading} style={styles.button}>
        {loading ? 'Generating...' : 'Generate Questions'}
      </button>
      {questions && (
        <ul style={styles.questionList}>
          {questions.map((q, index) => (
            <li key={index} style={styles.questionItem}>
              <p><strong>Question:</strong> {q.text}</p>
              <form>
                {q.options.map((option, i) => (
                  <div key={i} style={styles.option}>
                    <label style={styles.optionLabel}>
                      <input
                        type="radio"
                        name={`question-${index}`}
                        value={option}
                        checked={selectedAnswers[index] === option}
                        onChange={() => handleOptionChange(index, option)}
                        disabled={submittedAnswers[index] !== undefined} 
                      />
                      {option}
                    </label>
                  </div>
                ))}
              </form>
              <button
                onClick={() => handleSubmitAnswer(index)}
                disabled={submittedAnswers[index] !== undefined} 
                style={styles.submitButton}
              >
                Submit Answer
              </button>
              {submittedAnswers[index] !== undefined && (
                <p style={isCorrect(q, submittedAnswers[index]) ? styles.correct : styles.incorrect}>
                  {isCorrect(q, submittedAnswers[index])
                    ? 'Correct!'
                    : `Incorrect. The correct answer is: ${q.answer}`}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#f0f4f8',
    minHeight: '100vh',
  },
  heading: {
    color: '#333',
    marginBottom: '20px',
    fontSize: '24px',
  },
  button: {
    backgroundColor: '#007BFF',
    color: 'white',
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    marginBottom: '20px',
    transition: 'background-color 0.3s ease',
  },
  questionList: {
    listStyleType: 'none',
    padding: 0,
    width: '100%',
    maxWidth: '600px',
  },
  questionItem: {
    backgroundColor: '#fff',
    padding: '15px',
    marginBottom: '10px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  option: {
    marginBottom: '10px',
  },
  optionLabel: {
    color: '#333',  
    fontSize: '16px',
  },
  submitButton: {
    backgroundColor: '#28a745',
    color: 'white',
    padding: '8px 16px',
    fontSize: '14px',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px',
  },
  correct: {
    color: 'green',
    marginTop: '10px',
    fontWeight: 'bold',
  },
  incorrect: {
    color: 'red',
    marginTop: '10px',
    fontWeight: 'bold',
  },
};

export default QuizPage;
