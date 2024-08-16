import './App.css'

function App() {


  return (
   <>
    <div className="flex flex-col min-h-screen">
      <div className="absolute inset-0 bg-[#71717a] z-0"></div>
      <div className="relative z-10 w-full h-24 bg-[#8BD5D3] flex justify-between items-center p-3">
        <h1 className="text-3xl font-bold text-[#737373] pl-4">RCCIIT <span className="font-bold text-2xl text-[#030712]">Placement Data Analysis</span></h1>
        <div className="flex items-center space-x-2 pr-4"></div>
      </div>
      <main className="relative z-10 flex flex-1 justify-center gap-4 p-4">
        <div className="w-full max-w-md mx-auto mt-4 my-16 bg-white flex justify-center rounded">
          <div className="absolute w-6 mx-2 mb-3 flex justify-center items-center p-6 gap-32">
            <button class="bg-[#d6d3d1] hover:bg-[#a1a1aa] text-black text-lg font-semibold py-2 px-8 border border-black rounded-full">Select</button>
            <button class="bg-[#d6d3d1] hover:bg-[#a1a1aa] text-black text-lg font-semibold py-2 px-8 border border-black rounded-full">Clear</button>
          </div>
          <div className="w-full mx-6 my-20 bg-[#d6d3d1] rounded p-4"></div>
          <div className="absolute w-full max-w-md ml-72 mt-[450px] p-6">
            <button class="bg-[#d6d3d1] hover:bg-[#a1a1aa] text-black text-lg font-semibold py-2 px-8 border border-black rounded-full">Update</button>
          </div>
        </div>
        <div className="w-full mt-4 my-16 bg-white rounded"></div>
      </main>
      <div className="w-full h-12 fixed bottom-0 left-0 right-0  bg-[#155e75]"></div>
    </div>
   </>
  ) 
}

export default App
