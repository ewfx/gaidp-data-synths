# 🚀 Gen AI based data profiling by team datasynths

## 📌 Table of Contents
- [Introduction](#introduction)
- [Demo](#demo)
- [What It Does](#what-it-does)
- [How We Built It](#how-we-built-it)
- [Challenges We Faced](#challenges-we-faced)
- [How to Run](#how-to-run)
- [Tech Stack](#tech-stack)
- [Team](#team)

---

## 🎯 Introduction
This Gen AI-based Data Profiling solution automates and enhances the process of ensuring data quality and compliance. By leveraging large language models (LLMs) and unsupervised machine learning, Gen AI can automatically generate data profiling rules aligned with regulatory requirements, and suggest remediation actions when discrepancies arise.

Unlike traditional methods, Gen AI continuously learns from data and regulatory changes, improving its accuracy and efficiency over time. This helps reduce human error, streamline compliance processes, and adapt to evolving regulations in real-time.

## 🎥 Demo
📹 [Video Demo](https://github.com/ewfx/gaidp-data-synths/blob/main/artifacts/demo/demo_video.mp4)

🖼️ Screenshots:
![Screenshot 1]((https://github.com/ewfx/gaidp-data-synths/blob/main/artifacts/demo/Screenshot%202025-03-26%20132503.png))
![Screenshot 2]((https://github.com/ewfx/gaidp-data-synths/blob/main/artifacts/demo/Screenshot%202025-03-26%20132743.png))

## ⚙️ What It Does
The project reads a pdf file containing regulatory instructions, parses the pdf to json, send this json to gemini api for data profiling.
The received response contains generated rules which are sent to gemini api along with a data set to perform the validation. Finally the results of
both the api call are displayed on the UI where the user can download it as a csv file

## 🛠️ How We Built It
We have used React to build our front end and Python for our backend framework. The llm model we have used is gemini-2.0-flash

## 🚧 Challenges We Faced
The unavaliability of a larger dataset for validation of the rules was the major challenged we faced

## 🏃 How to Run
1. Clone the repository  
   ```sh
   git clone https://github.com/ewfx/gaidp-data-synths.git
   ```
2. Install dependencies  
   ```sh
   npm install axios  
   pip install fastapi uvicorn google-generativeai python-multipart pdfplumber 
   pip install requests  
   pip install pandas                                                                                                              
   ```
3. Run the project  
   ```sh
   Frontend:
   cd pdf-uploader
   npm start  
   Backend:
   uvicorn main:app --reload
   ```

## 🏗️ Tech Stack
- 🔹 Frontend: React 
- 🔹 Backend: Python
- 🔹 LLM- Gemini API

## 👥 Team
- **Aparna Amarnani** 
- **Keshav Bhotika** 
- **Nimish Mangal** 
- **Ritish Zalke** 
- **Ramya Kasinavesi** 
