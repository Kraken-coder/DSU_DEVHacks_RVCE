from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from typing import List
import shutil
import os
from StudyUtlis import StudyBot
import nest_asyncio
from fastapi.middleware.cors import CORSMiddleware


nest_asyncio.apply()
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Adjust this to your frontend's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


qm = None

class Question(BaseModel):
    text: str
    options: List[str]
    answer: str

class QuestionSet(BaseModel):
    questions: List[Question]

class SummarizeRequest(BaseModel):
    text: str
class QuestionAnswer(BaseModel):
    question: str
    user_input: str
    answer: str
    explanation: str = None
class QuestionList(BaseModel):
    questions: List[QuestionAnswer]

@app.post("/upload-documents/")
async def upload_documents(files: List[UploadFile] = File(...)):
    global qm
    os.makedirs("Documents", exist_ok=True)
    for file in files:
        file_path = os.path.join("Documents", file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    try:
        qm = StudyBot()
        qm.initialize()
        qm.initialize_string()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing documents: {str(e)}")
    
    return {"message": "Documents uploaded and processed successfully"}

@app.post("/generate-questions/", response_model=QuestionSet)
async def generate_questions():
    if qm is None:
        raise HTTPException(status_code=400, detail="Please upload documents first")
    
    questions = qm.generate_question()
    return questions

@app.post("/summarize/", response_model=str)
async def summarize(request: SummarizeRequest):
    if qm is None:
        raise HTTPException(status_code=400, detail="Please upload documents first")
    
    summary = qm.summerise()
    return summary
@app.get("/query/{text}")
async def query(text:str):
    if qm is None:
        raise HTTPException(status_code=400, detail="Please upload documents first")
    else:
        answer = qm.answer_from_documents(text)
        cosine_val = qm.similarity()
        print(answer)
        return {"answer": answer , "cosine_similarity": cosine_val }
@app.post("/process")
async def process_queries(questions: QuestionList):
    results = []
    for question_item in questions.questions:
        if question_item.user_input != question_item.answer:
            explanation = qm.answer_from_documents(
                f"Give me the explanation. The question is: {question_item.question}. The answer is: {question_item.answer}."
            )
            question_item.explanation = explanation
        else:
            question_item.explanation = "Correct"
        results.append(question_item)
    return {"results": results}
            

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)