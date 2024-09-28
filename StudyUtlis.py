from llama_index.llms.ollama import Ollama
from llama_parse import LlamaParse
from llama_index.core import VectorStoreIndex , SimpleDirectoryReader, PromptTemplate
from llama_index.core.embeddings import resolve_embed_model
from llama_index.core import Settings
import pandas as pd
from llama_index.core import StorageContext
from pydantic import BaseModel
from llama_index.core.output_parsers import PydanticOutputParser
from llama_index.core.query_pipeline import QueryPipeline
from typing import List
import json
from llama_index.core.graph_stores import SimpleGraphStore
from llama_index.core import KnowledgeGraphIndex
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
class StudyBot:
    def __init__(self) -> None:
        self.llm = Ollama(model='llama3:instruct')
        self.parser = LlamaParse(api_key="llx-LGTUvvbAO7oaJeY3nInjzfI4dGII3muV33FhBloswibmH1hn", result_type="markdown")
        self.llm_check = Ollama(model='llama3:instruct')
        self.checkllm = Ollama(model='llama3')
    def initialize(self):
        file_extractor = {".pdf": self.parser}
        self.documents = SimpleDirectoryReader("Documents", exclude_hidden=False, file_extractor=file_extractor).load_data()
        embed_model = resolve_embed_model("local:BAAI/bge-m3")
        graph_store = SimpleGraphStore()
        storage_context = StorageContext.from_defaults(graph_store=graph_store)
        index = KnowledgeGraphIndex.from_documents(documents=self.documents,
                                                   max_triplets_per_chunk=3,
                                                   storage_context=storage_context,
                                                   embed_model=embed_model,
                                                   include_embeddings=True,
                                                   llm=self.llm)
        self.query_engine = index.as_query_engine(include_text=True,
                                                  response_mode="tree_summarize",
                                                  embedding_mode="hybrid",
                                                  similarity_top_k=5,
                                                  llm=self.llm)
    def initialize_string(self):
        print("initializing")
        self.generated_text = ""
        for doc in self.documents:
            self.generated_text = self.generated_text + doc.text + "\n"
    def generate_question(self, chunk_size=3000, context_size=1000):
        print("Generating questions")
        string = self.generated_text
        class MCQ(BaseModel):
            text: str
            options: List[str]
            answer: str

        class MCQSet(BaseModel):
            questions: List[MCQ]
        PromptTemplate_str = """You are tasked with generating exactly 3 multiple-choice questions (MCQs) based on the provided text. 
        Each question should have four options, with only one correct answer. Ensure the format is consistent and structured as follows:

        - "text": Provide a question based on the content of the text.
        - "options": A list of four possible answers, marked as "a", "b", "c", "d".
        - "answer": Clearly state which option (a, b, c, or d) is the correct answer.

        Here is the format to follow for each question:
        {{
            "text": "<question>",
            "options": [
                "a. <option 1>",
                "b. <option 2>",
                "c. <option 3>",
                "d. <option 4>"
            ],
            "answer": "<correct option (a, b, c, or d)>"
        }}
        strictly follow the Format for each question.
        Generate exactly 3 questions based on the following text:
        {inserted_text}
        """
        self.parser = PydanticOutputParser(MCQSet)
        json_prompt_str = self.parser.format(PromptTemplate_str)
        json_prompt_tmpl = PromptTemplate(json_prompt_str)
        output_pipeline = QueryPipeline(chain=[json_prompt_tmpl, self.llm])

        total_chars = len(string)
        all_questions = []
        for i in range(0, total_chars, chunk_size):
            start_index = max(i - context_size, 0)
            end_index = min(i + chunk_size + context_size, total_chars)
            chunk = string[start_index:end_index]
            try:
                result = output_pipeline.run(response=chunk)
                result = str(result)
                parsed_result = self.parser.parse(result)
                all_questions.extend(parsed_result.questions)
            except Exception:
                try:
                    result = output_pipeline.run(response=chunk)
                    result = str(result)
                    parsed_result = self.parser.parse(result)
                    all_questions.extend(parsed_result.questions)
                except Exception:
                    try:
                        result = output_pipeline.run(response=chunk)
                        result = str(result)
                        parsed_result = self.parser.parse(result)
                        all_questions.extend(parsed_result.questions)
                    except Exception:
                        print(f"error proccessing chunk {i} : {Exception}")
        return {"questions": all_questions}
    def summerise(self, chunk_size =1500 , context_size = 250):
        string = self.generated_text       
        total_chars = len(string)
        summerise_string = " "
        print("Started summerisizng")
        for i in range(0, total_chars, chunk_size):
            start_index = max(i - context_size, 0)
            end_index = min(i + chunk_size + context_size, total_chars)
            chunk = string[start_index:end_index]
            summerise_string = summerise_string + " " + str(self.llm.complete(chunk + "summarize concepts for the topics "))
        print(summerise_string)
        return summerise_string
    def answer_from_documents(self,query):
        self.query = query 
        print("answering doubt")
        self.answer = self.query_engine.query(query + "elaborately")
        self.ansr = str(self.answer)
        return f'{self.answer}'
    def similarity(self):
        text1 = str(self.checkllm.complete(self.query))
        text2 = self.ansr
        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([text1, text2])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
        print(f"Reliablity %: {similarity[0][0]*100}")            
        return f'{similarity[0][0]*100}'   