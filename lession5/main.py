from fastapi import FastAPI

app = FastAPI(title="Production API", version="0.1.0")

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/healthz", status_code=200)
def health_check():
    return {"status": "healthy"}