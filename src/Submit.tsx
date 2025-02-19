import React, { useState } from "react";
import "./Quiz.css";
import { FileText, X, CheckCircle, FolderOpen, Send } from 'lucide-react';
import { auth, db } from './config/firebase'; // Import db from firebase config
import { doc, updateDoc, getDoc } from 'firebase/firestore'; // Import Firestore functions

const baseUrl = 'https://sairams-m1pro-system.tail4ef781.ts.net';

const Submit = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"initial" | "uploading" | "success" | "fail">("initial");
  const [progress, setProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [conversationId, setConversationId] = useState("");
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      const allowedTypes = ["application/pdf"];

      if (!allowedTypes.includes(selectedFile.type)) {
        setModalMessage("❌ Only PDF files are allowed!");
        setShowModal(true);
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setStatus("initial");
    }
  };

  const incrementPdfCount = async () => {
    if (!auth.currentUser) return;
    const userId = auth.currentUser.uid;
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        await updateDoc(docRef, {
          pdfCount: (data.pdfCount || 0) + 1
        });
      }
    } catch (error) {
      console.error("Error incrementing PDF count:", error);
    }
  };

  const handleGenerate = async () => {
    if (!message) {
      setModalMessage("Please enter a message");
      setShowModal(true);
      return;
    }

    if (!conversationId) {
      setModalMessage("Please enter a conversation ID");
      setShowModal(true);
      return;
    }

    if (!file) {
      setModalMessage("Please select a file to upload");
      setShowModal(true);
      return;
    }

    setIsGenerating(true);
    setStatus("uploading");
    setProgress(0);

    const formData = new FormData();
    formData.append("files", file);

    try {
      // Start progress animation immediately
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev < 90) return prev + 2;
          return prev;
        });
      }, 100);

      const result = await fetch(`${baseUrl}/api/upload?id=${encodeURIComponent(conversationId)}`, {
        method: "POST",
        body: formData,
      });

      if (result.ok) {
        const data = await result.json();
        console.log(data);

        // Complete the progress and show success
        clearInterval(progressInterval);
        setProgress(100);
        setStatus("success");

        // Increment PDF count in Firestore
        await incrementPdfCount();

        const generateResult = await fetch(`${baseUrl}/api/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: conversationId,
            message: message,
          }),
        });

        if (generateResult.ok) {
          const generateData = await generateResult.json();
          if (generateData.status === "success") {
            setResponse(generateData.message);
          } else {
            setModalMessage("Generation failed: " + generateData.message);
            setShowModal(true);
          }
        } else {
          setModalMessage("Generation failed: " + generateResult.statusText);
          setShowModal(true);
        }

      } else {
        clearInterval(progressInterval);
        setProgress(0);
        setStatus("fail");
        setModalMessage("Upload failed: " + result.statusText);
        setShowModal(true);
      }
    } catch (error) {
      setProgress(0);
      setStatus("fail");
      setModalMessage("Upload failed: " + (error as Error).message);
      setShowModal(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatFileSize = (size: number) => {
    const units = ["bytes", "KB", "MB", "GB", "TB"];
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  return (
    <div className="p-4 lg:p-6 bg-gray-900 text-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-100 mb-2">Submit Documents</h1>
            <p className="text-gray-400 text-lg">Submit your documents to get started.</p>
          </div>

          <input
            id="file"
            type="file"
            onChange={handleFileChange}
            className="dotted-file-button"
            style={{ display: "none" }}
            accept=".pdf"
          />

          <div className="flex flex-col">
            {/* Left Column - Upload Area */}
            <div className="flex-1">
              {(!file || status === "success") && (
                <div 
                  className="bg-gray-800 rounded-xl border border-gray-700 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-700 transition-colors h-full min-h-[400px] mb-4"
                  onClick={() => document.getElementById("file")?.click()}
                >
                  <FolderOpen className="w-16 h-16 text-indigo-500 mb-4" />
                  <p className="text-xl font-semibold text-gray-100 mb-2">Browse Files</p>
                  <p className="text-gray-400">Acceptable file type: .pdf</p>
                </div>
              )}
              {file && (
                <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 min-h-[400px] flex flex-col">
                  <div className="flex items-center mb-4">
                    <FileText className="w-6 h-6 text-indigo-500 mr-4" />
                    <div className="flex-1">
                      <h6 className="text-gray-100 mb-2">{file.name}</h6>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-500 transition-all duration-300" 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                    </div>
                    {status === "initial" && (
                      <button 
                        onClick={() => setFile(null)}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-gray-400" />
                      </button>
                    )}
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4 mt-4 space-y-2">
                    <div className="text-gray-400">Name: <span className="text-gray-100">{file.name}</span></div>
                    <div className="text-gray-400">Type: <span className="text-gray-100">{file.type}</span></div>
                    <div className="text-gray-400">Size: <span className="text-gray-100">{formatFileSize(file.size)}</span></div>
                  </div>

                  <Result status={status} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Input and Generate Button */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="mb-4">
            <label htmlFor="conversationId" className="block text-sm font-medium text-gray-300 mb-2">
              Conversation ID
            </label>
            <input
              type="text"
              id="conversationId"
              value={conversationId}
              onChange={(e) => setConversationId(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-indigo-500"
              placeholder="Enter conversation ID"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-indigo-500 min-h-[100px]"
              placeholder="Enter your message"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !message || !conversationId || !file}
            className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Send className="w-5 h-5" />
                Generating...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Generate Response
              </>
            )}
          </button>
        </div>

        {/* Response Display */}
        {response && (
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Response</h3>
            <div className="bg-gray-700 rounded-lg p-4 text-gray-100 whitespace-pre-wrap">
              {response}
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && <Modal message={modalMessage} onClose={() => setShowModal(false)} />}
    </div>
  );
};

const Result = ({ status }: { status: string }) => {
  if (status === "success") {
    return (
      <div className="flex items-center gap-2 text-green-500 mt-4">
        <CheckCircle className="w-5 h-5" />
        <span>Upload complete</span>
      </div>
    );
  }
  return null;
};

const Modal = ({ message, onClose }: { message: string; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
        <p className="text-gray-100 mb-4">{message}</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Submit;