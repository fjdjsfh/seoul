import React, { useState } from "react";
import axios from "axios";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // 파일 선택 핸들러
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // 파일 업로드 핸들러
  const handleFileUpload = async () => {
    if (!file) {
      setMessage("파일을 선택해주세요.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setMessage("");

    try {
      // API 요청
      const response = await axios.post("http://localhost:8080/api/district/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // 성공 메시지
      setMessage(response.data);
    } catch (error) {
      // 실패 메시지
      setMessage("파일 업로드 실패: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>엑셀 파일 업로드</h2>

      <input type="file" onChange={handleFileChange} accept=".xlsx" />
      <button onClick={handleFileUpload} disabled={loading}>
        {loading ? "업로드 중..." : "파일 업로드"}
      </button>

      {message && <p>{message}</p>}
    </div>
  );
};

export default FileUpload;