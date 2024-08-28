
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupText, setPopupText] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
   if(Cookies.get('token')!==undefined && Cookies.get('user_name')!==undefined)
    setIsLoggedIn(true);
    setUsername(Cookies.get('user_name'));
  });

  const handleLogout=()=>{
    axios.post('http://localhost:8097/api/v1/auth/sign_out', {
      "token" : Cookies.get('token')
    })
    .then(function (response) {
      Cookies.remove('token');
      Cookies.remove('user_name');
      setIsLoggedIn(false);
      setPassword('');
    })
    .catch(function (error) {
      console.log(error);
    });
  };
  
  const handleLogin = () => {
    axios.post('http://localhost:8097/api/v1/auth/sign_in', {
      "password" : password
    })
    .then(function (response) {
      Cookies.set('token', response.data.token, { expires: 1 });
      Cookies.set('user_name', response.data.user_name, { expires: 1 });
      setIsLoggedIn(true);
      setUsername(response.data.user_name);
    })
    .catch(function (error) {
      setShowPopup(true);
      setPopupText('Invalid password');
    });
  };

  const handleSelectButton = () => {
    if(isLoggedIn){
      fileInputRef.current.click();
    } else {
      setShowPopup(true);
      setPopupText('Need to Sign in first.');  
    }
  };

  const handleUploadButton = () => {
    if (isLoggedIn) {
        if (selectedFiles.length === 0) {
            setShowPopup(true);
            setPopupText('No file selected.');
        } else {
            const file = selectedFiles[0]; 
            const formData = new FormData();
            formData.append('file', file);
            formData.append('token',Cookies.get('token'));
            fetch('http://localhost:8097/api/v1/file/upload', {
                method: 'POST',
                body: formData,
            })
            .then(data => {
              
                console.log('File uploaded successfully:', data);
            })
            .catch(error => {
                console.error('Error uploading file:', error);
            });
        }
    } else {
        setShowPopup(true);
        setPopupText('Need to Sign in first.');
    }
};


  const closePopup = () => {
    setShowPopup(false);
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files).filter((file) =>
      file.name.endsWith('.xls') || file.name.endsWith('.xlsx'));
    setSelectedFiles(files);
    console.log("Selected files:", files);
  };

  const handleClearFiles = () => {
    setSelectedFiles([]);
    fileInputRef.current.value = null;
  };

  return (
    <>
      <div className="flex flex-col min-h-screen">
        <div className="absolute inset-0 bg-[#71717a] z-0"></div>
        <div className="relative z-10 w-full h-24 bg-[#8BD5D3] flex justify-between items-center p-3">
          <h1 className="text-4xl font-bold text-[#383838] pl-4">RCCIIT <span className="text-3xl text-[#030712]">Placement Data Analysis</span></h1>
          <div className="flex items-center space-x-2 pr-4"></div>
          <div className="flex space-x-2">
            {isLoggedIn ? (
              <>
                <p className="text-lg">{username}</p>
                <button onClick={handleLogout} className="bg-gray-200 border rounded px-4 py-1">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <input
                  type="password"
                  placeholder="PASSWORD"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border rounded px-2 py-1"
                />
                <button onClick={handleLogin} className="bg-gray-200 border rounded px-4 py-1 hover:bg-gray-300"> Sign In </button>
              </>


            )}
          </div>
        </div>
        <main className="relative z-10 flex flex-1 justify-center gap-4 p-4">
          <div className="w-full max-w-md mx-auto mt-4 my-16 bg-white flex justify-center rounded">
            <div className="absolute w-6 mx-2 mb-3 flex justify-center items-center p-6 gap-32">
              <button className="bg-[#d6d3d1] hover:bg-[#a1a1aa] text-black text-lg font-semibold py-1 px-6 border border-black rounded" onClick={handleSelectButton}>Select</button>
              {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                  <div className="bg-white p-8 rounded shadow-lg w-80 h-32">
                    <p className="text-lg text-gray-700">Need to Sign in first.</p>
                    <button className="mt-4 ml-48 bg-[#d6d3d1] hover:bg-[#a1a1aa] text-black font-semibold py-2 px-4 border border-black rounded" onClick={closePopup}> Close </button>
                  </div>
                </div>
              )}
              <button className="bg-[#d6d3d1] hover:bg-[#a1a1aa] text-black text-lg font-semibold py-1 px-6 border border-black rounded" onClick={handleClearFiles}>Clear</button>
            </div>
            <input
              type="file"
              accept=".xls,.xlsx"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
            <div className="w-full mx-6 my-20 overflow-y-scroll bg-[#d6d3d1] rounded p-4">
              <h3 className="text-lg font-semibold mx-0 p-0"><span className="bg-[#f5f5f4] px-2">Selected Files:</span></h3>
              <ul className="list-none p-0">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="text-lg text-gray-700">
                    <a href={URL.createObjectURL(file)} target="_blank" rel="noopener noreferrer" className="text-black hover:underline">
                      {file.name} ({(file.size / 1024).toFixed(2)} KB)
                    </a>
                  </li>
                ))}
              </ul>
              {selectedFiles.length === 0 && (
                <div className="mt-28 flex justify-center items-center bg-[#d6d3d1] bg-opacity-80 rounded text-center text-lg font-semibold text-gray-700">No file selected</div>
              )}
            </div>
            <div className="absolute w-full max-w-md ml-72 mt-[450px] p-6">
              <button className="bg-[#d6d3d1] hover:bg-[#a1a1aa] text-black text-lg font-semibold py-1 px-6 border border-black rounded" onClick={handleUploadButton}>Upload</button>
              {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                  <div className="bg-white p-8 rounded shadow-lg w-80 h-32">
                    <p className="text-lg text-gray-700">{popupText}</p>
                    <button className="mt-4 ml-48 bg-[#d6d3d1] hover:bg-[#a1a1aa] text-black font-semibold py-2 px-4 border border-black rounded" onClick={closePopup}> Close </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-full mt-4 my-16 bg-white rounded"></div>
        </main>
        <div className="w-full h-12 fixed bottom-0 left-0 right-0 bg-[#155e75]"></div>
      </div>
    </>
  );
}

export default App;
