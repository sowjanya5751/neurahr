import pdfplumber
import io

def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract all text from a PDF file given as bytes."""
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {e}")

    if not text.strip():
        raise ValueError("No text could be extracted from this PDF.")

    return text.strip()