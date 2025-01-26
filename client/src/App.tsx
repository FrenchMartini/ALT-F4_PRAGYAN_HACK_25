import React, { useEffect, useState } from 'react';
import MapDrawingbaba from './components/leaflet-picker';
import Navbar from './components/Navbar';
import { IoIosArrowUp } from "react-icons/io";
// Define the type for the backend response
interface ApiResponse {
  message: string;
}

function App() {
  // Define the state type as a string
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // Fetch from the backend
    fetch('/api')
      .then((res) => res.json())
      .then((data: ApiResponse) => setMessage(data.message));
  }, []);
  
  const scrollToSection = (sectionId: string) => {
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const [hover, setHover] = useState(false);

  return (
    <div className='snap-mandatory relative w-screen h-screen snap-y scroll-smooth  '>
      <div className="snap-start h-screen w-screen flex bg-gradient-to-bl from-yellow-100 via-red-200 " id="section1">
        <Navbar />
        <div className='absolute top-56 left-[50%] translate-x-[-50%] text-[200px] drop-shadow-lg '
         style={{fontFamily:"OutfitMedium"}}
        >
          NO JAM
        </div>
        <div className='absolute top-[60%] left-[70%] translate-x-[-50%] text-[50px]'
         style={{fontFamily:"Eagle"}}
        >
         For A Better World 
        </div>
        <button 
          data-target="section2" 
          className={`absolute bottom-[10px] left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-in-out `} 
          onClick={() => scrollToSection("section2")} 
          onMouseEnter={() => setHover(true)} 
          onMouseLeave={() => setHover(false)}
          style={{
            bottom: `${hover ? '15px' : '10px'}`,
            boxShadow: hover ? '0px 4px 15px rgba(0,0,0,0.2)' : 'none',
            transform: 'translateX(-50%)'
          }}
        >
          <IoIosArrowUp size={70} color="black"/>
        </button>
      </div>
      <div id="section2" className='relative scroll-smooth snap-start h-screen w-screen snap-y items-center flex flex-col'>
     
        <MapDrawingbaba />
        <button 
          data-target="section1" 
          className={`relative transition-all duration-300 ease-in-out h-16 w-full left-[-30px] bottom-[2px] bg-black text-white flex items-center justify-center`} 
          onClick={() => scrollToSection("section1")} 
          onMouseEnter={() => setHover(true)} 
          onMouseLeave={() => setHover(false)}
          style={{
            boxShadow: hover ? '0px 4px 15px rgba(0,0,0,0.2)' : 'none',
            fontFamily:"OutfitMedium"
          }}
        >
          BACK TO TOP
        </button>
      </div>
    </div>
  );
}

export default App;
