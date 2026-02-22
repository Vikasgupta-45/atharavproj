import os
import uvicorn
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

if __name__ == "__main__":
    # Get config from env with defaults
    app_host = os.getenv("HOST", "127.0.0.1")
    app_port = int(os.getenv("PORT", 8000))
    app_reload = os.getenv("RELOAD", "True").lower() == "true"
    
    print(f"Starting server on http://{app_host}:{app_port}")
    
    # Run uvicorn
    # Using string import "main:app" assumes main.py is in the same directory
    uvicorn.run("main:app", host=app_host, port=app_port, reload=app_reload)
