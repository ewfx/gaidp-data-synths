import React, { useState } from "react";
import axios from "axios";

function App() {
  const [pdfFile, setPdfFile] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePdfChange = (event) => {
    setPdfFile(event.target.files[0]);
  };

  const handleCsvChange = (event) => {
    setCsvFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!pdfFile || !csvFile) {
      alert("Please select both PDF and CSV files!");
      return;
    }

    const formData = new FormData();
    formData.append("pdf_file", pdfFile);
    formData.append("csv_file", csvFile);

    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResponse(res.data);
    } catch (error) {
      setResponse("Error uploading file: " + error.message);
    }
    setLoading(false);
  };

  // Convert text response to CSV.
  // It first attempts to parse the text as JSON, and if that fails, it falls back to a line-by-line conversion.
  const convertToCSV = (textResponse) => {
    if (!textResponse || textResponse.trim() === "") {
      return "No data available";
    }

    try {
      // Attempt to parse as JSON.
      const objArray = JSON.parse(textResponse);

      if (!Array.isArray(objArray) || objArray.length === 0) {
        throw new Error("Parsed data is not an array");
      }

      const headers = Object.keys(objArray[0]).join(",") + "\n";
      const rows = objArray
        .map((row) => Object.values(row).join(","))
        .join("\n");
      return headers + rows;
    } catch (error) {
      console.warn("Response is not a JSON array, converting as plain text");

      // Fallback: convert text response into line-based CSV.
      const lines = textResponse
        .split("\n")
        .map((line) => `"${line.replace(/"/g, '""')}"`);
      return lines.join("\n");
    }
  };

  // Download CSV file
  const downloadCSV = (data, filename) => {
    const csvData = new Blob([data], { type: "text/csv" });
    const csvURL = URL.createObjectURL(csvData);
    const tempLink = document.createElement("a");
    tempLink.href = csvURL;
    tempLink.download = filename;
    tempLink.click();
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Gen AI based Data profiling</h1>
      <p style={styles.subtitle}>Upload your PDF and CSV files for rule generation and validation.</p>
      <div style={styles.uploadContainer}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Upload Regulations PDF File:</label>
          <input type="file" accept="application/pdf" onChange={handlePdfChange} style={styles.input} />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Upload Dataset File:</label>
          <input type="file" accept=".csv" onChange={handleCsvChange} style={styles.input} />
        </div>
        <button onClick={handleUpload} style={styles.button}>
          Upload Files
        </button>
      </div>

      {loading && <p style={styles.loading}>Processing...</p>}

      {response && (
        <div style={styles.responseContainer}>
          {response.rules_generated && (
            <div style={styles.responseBox}>
              <h3 style={styles.responseTitle}>Generated Rules</h3>
              <pre style={styles.preformatted}>{response.rules_generated}</pre>
              <button
                onClick={() =>
                  downloadCSV(convertToCSV(response.rules_generated), "rules_generated.csv")
                }
                style={styles.downloadButton}
              >
                Export Rules as CSV
              </button>
            </div>
          )}

          {response.validation_response && (
            <div style={styles.responseBox}>
              <h3 style={styles.responseTitle}>Validation Response</h3>
              <pre style={styles.preformatted}>{response.validation_response}</pre>
              <button
                onClick={() =>
                  downloadCSV(convertToCSV(response.validation_response), "validation_results.csv")
                }
                style={styles.downloadButton}
              >
                Export Validation as CSV
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: "800px",
    margin: "0 auto",
  },
  title: {
    fontSize: "2em",
    marginBottom: "0.25em",
  },
  subtitle: {
    color: "#555",
    marginBottom: "1.5em",
  },
  uploadContainer: {
    backgroundColor: "#f9f9f9",
    padding: "20px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    marginBottom: "20px",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "bold",
  },
  input: {
    padding: "8px",
    width: "80%",
    maxWidth: "400px",
    margin: "0 auto",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#007BFF",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "1em",
  },
  loading: {
    fontStyle: "italic",
    color: "#666",
  },
  responseContainer: {
    marginTop: "20px",
  },
  responseBox: {
    textAlign: "left",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    overflowWrap: "break-word",
    maxHeight: "300px",
    overflowY: "auto",
    padding: "15px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    width: "90%",
    margin: "10px auto",
    backgroundColor: "#fff",
  },
  responseTitle: {
    marginBottom: "10px",
    borderBottom: "1px solid #ddd",
    paddingBottom: "5px",
  },
  preformatted: {
    margin: 0,
    fontFamily: "monospace",
    fontSize: "0.9em",
    lineHeight: "1.4em",
  },
  downloadButton: {
    marginTop: "10px",
    padding: "8px 16px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default App;
