// import { useEffect } from "react";
import DocumentList from "./components/DocumentList";
import FileUpload from "./components/FileUpload";
import "./index.css";

// import FileUploadService from "./services/file-upload-service";

function App() {
  // useEffect(() => {
  //   const getBooks = async () => {
  //     const response = await FileUploadService.getBooks();
  //     console.log(response);
  //     return response;
  //   };

  //   getBooks();
  // }, []);



  return (
    <>
      <div className="card">
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <FileUpload />
        </div>
        <DocumentList />
      </div>
    </>
  );
}

export default App;
