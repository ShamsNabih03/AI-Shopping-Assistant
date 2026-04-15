from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "AI Shopping Assistant Backend is running"}

@app.get("/recommend")
def recommend(query: str):
    return {
        "query": query,
        "results": [
            "Sample Product 1",
            "Sample Product 2",
            "Sample Product 3"
        ]
    }