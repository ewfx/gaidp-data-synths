from fastapi import FastAPI, File, UploadFile
import json
import google.generativeai as genai
import tempfile
import os
import pandas as pd
import requests
from pdf_parsing import process_pdf  # Import your PDF parsing function
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow frontend requests
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Set up Gemini API
api_key = "" #api_key
gemini_api_endpoint = "" #gemini end point
prompt = "You are an expert in financial data validation and regulatory compliance. I have a JSON file containing financial data information published by the Federal Reserve. Your task is to analyze this data and generate key data validation requirements and profiling rules. Specifically:Identify Data Validation Requirements:Define allowable value ranges, formats, and data types for each field.Detect mandatory vs. optional fields.Highlight constraints such as unique identifiers, date formats, and numerical precision.Generate Profiling Rules:Identify patterns and distribution of values for key fields.Suggest cross-field relationships (e.g., total assets should be equal to the sum of liabilities and equity).Highlight outlier detection criteria based on historical or expected distributions.Ensure Compliance with Regulatory Standards:Reference industry best practices for financial data reporting.Identify fields that must adhere to specific regulatory thresholds or consistency checks.Using the above, provide structured rules in a readable format that can be used for automated data validation and anomaly detection. Output should be structured in a clear and actionable manner, preferably as JSON validation rules or plain text descriptions."
validation_prompt = "Validate the provided dataset against these rules and return any discrepancies or issues found"

def query_gemini(json_data):
    try:
        # 1. Format the API request (Adapt to Gemini's specific request format)
        payload = {
            "contents": [{
                "parts": [
                    {
                        "text": prompt,
                    },
                    {
                        "text": json_data
                    }
                ]
            }]
        }
        
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": api_key, # Or whatever header the API uses for your API key.
        }

        # 2. Send the API request
        response = requests.post(gemini_api_endpoint, headers=headers, json=payload)
        # 3. Handle the API response
        response.raise_for_status()
        response_json = response.json()

        try:
            response_text = response_json["candidates"][0]["content"]["parts"][0]["text"]
            return response_text

        except (KeyError, IndexError):
            return "Could not extract text from response."

    except requests.exceptions.RequestException as e:
        print(f"Error during API request: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON response: {e}")
        return None

def query_gemini_2(rules_text, dataset_json):
    """Send rules + dataset to Gemini API for validation."""
    try:
        payload = {
            "contents": [{
                "parts": [
                    {"text": validation_prompt},
                    {"text": "Rules: " + rules_text},
                    {"text": "Dataset: " + dataset_json}
                ]
            }]
        }
        
        headers = {
            "x-goog-api-key": api_key,
            "Content-Type": "application/json"
        }

        response = requests.post(gemini_api_endpoint, headers=headers, json=payload)
        # 4. Handle the API response
        response.raise_for_status()
        response_json = response.json()

        try:
            response_text = response_json["candidates"][0]["content"]["parts"][0]["text"]
            return response_text#clean_response(response_text)

        except (KeyError, IndexError):
            return "Could not extract text from response."
    except requests.exceptions.RequestException as e:
        print(f"Error during API request: {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON response: {e}")
        return None

def clean_response(response_text):
    """Format the response for better readability and CSV conversion."""
    lines = response_text.split("\n")
    cleaned_lines = [line.strip() for line in lines if line.strip()]
    
    # If the first few lines contain "Okay" or unnecessary words, remove them
    if "okay" in cleaned_lines[0].lower():
        cleaned_lines = cleaned_lines[1:]

    return "\n".join(cleaned_lines) 

@app.post("/upload")
async def upload_files(pdf_file: UploadFile = File(...), csv_file: UploadFile = File(...)):
    try:
        # ✅ Save PDF temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_pdf:
            temp_pdf.write(await pdf_file.read())
            pdf_path = temp_pdf.name   

        # ✅ Parse PDF to JSON
        parsed_json = process_pdf(pdf_path)
        os.remove(pdf_path)  # Cleanup temporary file
        print("processing pdf")
        # ✅ Send parsed JSON to Gemini API (Rule Generation)
        gemini_response = query_gemini(parsed_json)

        # ✅ Save CSV temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as temp_csv:
            temp_csv.write(await csv_file.read())
            csv_path = temp_csv.name

        # ✅ Convert CSV to JSON
        df = pd.read_csv(csv_path)
        dataset_json = df.to_json(orient="records")
        os.remove(csv_path)  # Cleanup
        print("Gemini_response_1 generated")
        # ✅ Send Rules + Dataset to Gemini API (Validation)
        gemini_response_2 = query_gemini_2(gemini_response, dataset_json)
        print("Gemini response 2 generated")
        return {
            "rules_generated": gemini_response,
            "validation_response": gemini_response_2
        }

    except Exception as e:
        return {"error": str(e)}
