from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import json
from functools import lru_cache
import google.generativeai as genai
from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()  # Load variables from .env file

# API Configuration
SCRAPING_API_URL = "https://app.scrapingbee.com/api/v1/"
SCRAPING_API_KEY = os.environ.get("SCRAPING_API_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

# Initialize FastAPI
app = FastAPI(title="Product Scraping API",
             description="API for extracting product information using Scraping Bee and Gemini AI")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
genai.configure(api_key=GEMINI_API_KEY)

EXTRACTION_PROMPT = """
Extract product information EXACTLY as specified below. DO NOT include explanations, analysis, or markdown formatting.

REQUIRED FIELDS:
- name: Product name without brand (remove 'ZARA' if present)
- description: Combined details without size/shipping info
- image: Highest resolution JPG URL matching Zara pattern
- offers.price: Numeric price value

FORMAT REQUIREMENTS:
- Return ONLY this JSON structure:
```json
{
  "product_name": "Clean product name",
  "product_desc": "Full description",
  "product_image": "direct_image_url.jpg",
  "product_price": "XX.XX"
}
```
- Use double quotes only
- Escape forward slashes
- No additional text/comments
"""


class ScrapeRequest(BaseModel):
    url: str

def scraping_api_request(url: str):
    """Fetch HTML using Scraping Bee"""
    params = {
        "url": url,
        "api_key": SCRAPING_API_KEY,
        "render_js": True,
        "premium_proxy": True
    }
    try:
        response = requests.get(SCRAPING_API_URL, params=params)
        response.raise_for_status()
        return response.text
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Scraping error: {str(e)}")

@lru_cache(maxsize=100)
def get_product_info(url: str):
    """Main processing function with caching"""
    try:
        html = scraping_api_request(url)
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content([EXTRACTION_PROMPT, html])
        
        # Improved JSON cleaning and validation
        json_str = response.text.strip()
        
        # Remove all markdown formatting variants
        json_str = json_str.replace('```json', '').replace('```', '').strip()
        
        # Find first { and last } to handle any surrounding text
        start_idx = json_str.find('{')
        end_idx = json_str.rfind('}') + 1
        
        if start_idx == -1 or end_idx == -1:
            raise ValueError("No JSON found in response")
        
        json_str = json_str[start_idx:end_idx]
        
        # Validate JSON structure
        parsed = json.loads(json_str)
     
        # Ensure required fields exist
        required_fields = ['product_name', 'product_desc', 'product_price', 'product_image']
        if not all(field in parsed for field in required_fields):
            missing = [field for field in required_fields if field not in parsed]
            raise ValueError(f"Missing required fields: {missing}")
            
        return parsed
            
    except json.JSONDecodeError as e:
        error_msg = f"JSON parsing failed: {str(e)}\nResponse content: {response.text if 'response' in locals() else 'No response'}"
        raise HTTPException(status_code=500, detail=error_msg)
    except Exception as e:
        error_msg = f"Processing error: {str(e)}\nResponse content: {response.text if 'response' in locals() else 'No response'}"
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/extract")
async def extract_product_data(request: ScrapeRequest):
    try:
        result = get_product_info(request.url)

        if not result:
            raise HTTPException(status_code=404, detail="No product data found")
            
        # Handle array responses by taking first item
        if isinstance(result, list):
            result = result[0]
            
        # Transform to final output format
        return {
            "product_name": result.get('product_name', ''),
            "product_desc": result.get('product_desc', ''),
            "product_price": result.get('product_price', ''),
            "product_image": result.get('product_image', '')
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
