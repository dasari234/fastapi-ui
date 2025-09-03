// import { useEffect } from "react";
import DocumentList from "./components/DocumentList";
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
        
        <DocumentList />
      </div>
    </>
  );
}

export default App;
