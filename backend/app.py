import re
import requests
from PyPDF2 import PdfReader
import docx
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import uuid
from pymongo import MongoClient
from bson.objectid import ObjectId 

load_dotenv()

# --- Configuration ---
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY") 
MONGO_URI = os.getenv("MONGO_URI") # Get URI from .env
DB_NAME = "LegalEaseDB"
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

# --- MongoDB Setup ---
try:
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    DocumentsCollection = db["documents"] # Stores document metadata and full text
    ChatsCollection = db["chats"]        # Stores chat history for each session
    print("MongoDB connected successfully!")
except Exception as e:
    print(f"MongoDB connection failed: {e}")
    # In a real app, you'd handle this failure gracefully

# --- Document Processing Functions (UNCHANGED) ---

def extract_text_from_file(file_path):
    text = ""
    if file_path.endswith(".pdf"):
        reader = PdfReader(file_path)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    elif file_path.endswith(".docx"):
        doc = docx.Document(file_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    else:
        raise ValueError("Unsupported file format. Please upload PDF or DOCX.")
    return text.strip()

def clean_text(text: str) -> str:
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'\s([?.!,"])', r'\1', text)
    return text.strip()

def chunk_text(text, max_chars=3000):
    words = text.split()
    chunks, chunk = [], []
    
    for word in words:
        if sum(len(w) for w in chunk) + len(word) + len(chunk) < max_chars:
            chunk.append(word)
        else:
            chunks.append(" ".join(chunk))
            chunk = [word]
    if chunk:
        chunks.append(" ".join(chunk))
    return chunks

def summarize_chunk(chunk, idx, api_key):    
    """
    Summarize a chunk of legal document text using the LLM API.
    Returns the summary as-is from the API with minimal cleaning.
    """
    try:
        response = requests.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "meta-llama/llama-3.2-3b-instruct:free",
                "messages": [
                    {"role": "user", "content": (
                        f"Please provide a concise summary of this legal document in 4-6 sentences. "
                        f"Include: parties involved, main purpose, key amounts (if any), and what is being requested.\n\n"
                        f"Document text:\n{chunk}\n\n"
                        f"Summary:"
                    )}
                ],
                "temperature": 0.7,
                "max_tokens": 600,
                "top_p": 0.9
            },
            timeout=30
        )

        if response.status_code != 200:
            print(f"ERROR: OpenRouter API returned status {response.status_code}")
            print(f"Response: {response.text}")
            return ""
            
        response_data = response.json()
        
        # Debug: Print full API response
        print(f"\n{'='*60}")
        print(f"CHUNK {idx} - FULL API RESPONSE:")
        print(response_data)
        print(f"{'='*60}\n")
        
        if "choices" not in response_data or len(response_data["choices"]) == 0:
            print(f"ERROR: No choices in API response for chunk {idx}")
            return ""
            
        summary_text = response_data["choices"][0]["message"]["content"]
        
        print(f"RAW SUMMARY TEXT: {repr(summary_text)}")
        print(f"Length: {len(summary_text)} characters\n")
        
        # MINIMAL cleaning - just strip whitespace and remove control tokens
        summary_text = summary_text.strip()
        
        # Remove only LLM special tokens
        summary_text = summary_text.replace("<s>", "").replace("</s>", "")
        summary_text = re.sub(r'\[/?INST\]', '', summary_text, flags=re.IGNORECASE)
        
        # Final strip
        summary_text = summary_text.strip()
        
        print(f"FINAL SUMMARY TEXT: {repr(summary_text)}")
        print(f"Length: {len(summary_text)} characters")
        print(f"{'='*60}\n")
        
        # If empty or too short, return empty string
        if len(summary_text) < 10:
            print(f"WARNING: Summary too short for chunk {idx}")
            return ""
        
        return summary_text
        
    except Exception as e:
        print(f"ERROR: Exception while processing chunk {idx}: {str(e)}")
        import traceback
        traceback.print_exc()
        return ""


# --- Flask application setup and API Endpoints ---
app = Flask(__name__)
CORS(app)

@app.route('/summarize', methods=['POST'])
def summarize_document():
    user_id = request.form.get('user_id')
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        file_path = os.path.join("uploads", file.filename)
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        file.save(file_path)
        document_time = request.form.get('time')
        
        try:
            # Extract and clean text
            text = extract_text_from_file(file_path)
            text = clean_text(text)
            
            print(f"\n{'='*60}")
            print(f"DOCUMENT: {file.filename}")
            print(f"Total text length: {len(text)} characters")
            print(f"{'='*60}\n")
            
            # Chunk the text
            chunks = chunk_text(text, max_chars=4000)  # Increased chunk size
            print(f"Split into {len(chunks)} chunks\n")

            # Summarize each chunk
            summaries = []
            for idx, chunk in enumerate(chunks):
                print(f"Processing chunk {idx+1}/{len(chunks)}...")
                print(f"Chunk length: {len(chunk)} characters")
                summary = summarize_chunk(chunk, idx, OPENROUTER_API_KEY)
                if summary:
                    summaries.append(summary)
                    print(f"✓ Chunk {idx} summary added\n")
                else:
                    print(f"✗ Chunk {idx} produced no summary\n")

            # Combine all summaries with a space
            final_summary = " ".join(summaries).strip()
            
            print(f"\n{'='*60}")
            print(f"FINAL COMBINED SUMMARY:")
            print(f"Length: {len(final_summary)} characters")
            print(f"Content: {final_summary[:500]}")  # Print first 500 chars
            print(f"{'='*60}\n")

            # Store in MongoDB even if summary is empty
            session_id = str(uuid.uuid4())
            
            document_data = {
                "user_id": user_id,
                "session_id": session_id,
                "title": file.filename,
                "time": document_time,
                "full_text": text, 
                "summary": final_summary if final_summary else "",
                "created_at": document_time,
                "has_chat": False,
            }
            
            DocumentsCollection.insert_one(document_data)
            
            # Initialize chat history
            chat_data = {
                "session_id": session_id,
                "document_title": file.filename,
                "user_id": user_id,
                "history": [],
            }
            ChatsCollection.insert_one(chat_data)
            
            # Return response - let frontend handle empty summaries
            return jsonify({
                "summary": final_summary if final_summary else "",
                "session_id": session_id,
            })
            
        except Exception as e:
            print(f"ERROR during summarization: {e}")
            import traceback
            traceback.print_exc()
            return jsonify({"error": str(e)}), 500
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)
                
@app.route('/chat', methods=['POST'])
def chat_document():
    data = request.get_json()
    session_id = data.get('session_id')
    user_message = data.get('message')

    if not session_id or not user_message:
        return jsonify({"error": "Missing session_id or message"}), 400

    # --- MONGODB: Retrieve Chat Document and Full Text ---
    chat_doc = ChatsCollection.find_one({"session_id": session_id})
    if not chat_doc:
        return jsonify({"error": "Invalid or expired chat session"}), 404

    document_doc = DocumentsCollection.find_one({"session_id": session_id})
    if not document_doc:
        return jsonify({"error": "Document context not found"}), 404
        
    document_text = document_doc["full_text"]
    history = chat_doc["history"] # Current conversation history
    # --------------------------------------------------------

    # System prompt to ground the LLM in the document context
    system_prompt = (
        "You are a legal-document question-answer assistant. "
    "Your ONLY job is to answer questions strictly based on the text of the document. "
    "Give clear, direct, factual answers. "
    "If the document contains an explicit answer, extract it exactly. "
    "Do NOT guess, generalize, or give vague replies. "
    "If the answer does not exist in the document, say: "
    "'The document does not provide this information.' "
    "\n\n"
    f"DOCUMENT CONTENT BELOW:\n{document_text}\n\n"
    "ANSWER THE USER'S QUESTIONS BASED ONLY ON THE ABOVE DOCUMENT."
    )
    
    # Construct messages for the LLM
    messages = [
    {"role": "system", "content": system_prompt},
    *history,
    {"role": "user", "content": user_message + "\n\nAnswer in simple, easy language."}
]

    try:
        response = requests.post(
            OPENROUTER_URL,
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "mistralai/mistral-7b-instruct:free",
                "messages": messages,
                "temperature": 0.7,
                "max_tokens": 500
            }
        )

        if response.status_code != 200:
            raise RuntimeError(response.text)
        
        ai_response_content = response.json()["choices"][0]["message"]["content"]

        # --- MONGODB: Update Chat History ---
        new_history = [
            *history, 
            {"role": "user", "content": user_message}, 
            {"role": "assistant", "content": ai_response_content}
        ]
        
        ChatsCollection.update_one(
            {"session_id": session_id},
            {"$set": {"history": new_history}},
        )
        # --- MONGODB: Update Document metadata (first chat started) ---
        DocumentsCollection.update_one(
            {"session_id": session_id},
            {"$set": {"has_chat": True}},
        )
        
        return jsonify({"response": ai_response_content})

    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({"error": f"Failed to get a response from the AI: {str(e)}"}), 500

# --- NEW API: Fetch all documents for a user ---
@app.route('/documents/<user_id>', methods=['GET'])
def get_documents(user_id):
    documents_cursor = DocumentsCollection.find({"user_id": user_id}).sort("created_at", -1)
    documents = []
    for doc in documents_cursor:
        documents.append({
            "session_id": doc["session_id"],
            "title": doc["title"],
            "time": doc["time"],
            "icon": "fas fa-file-alt",
            "has_chat": doc.get("has_chat", False),
            "summary": doc.get("summary", ""),
        })
    return jsonify(documents)

# --- NEW API: Fetch chat history for a session ---
@app.route('/chat/history/<session_id>', methods=['GET'])
def get_chat_history(session_id):
    chat_doc = ChatsCollection.find_one({"session_id": session_id})
    if not chat_doc:
        return jsonify({"error": "Chat session not found"}), 404
        
    return jsonify({
        "session_id": chat_doc["session_id"],
        "document_title": chat_doc["document_title"],
        "history": chat_doc["history"],
    })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)