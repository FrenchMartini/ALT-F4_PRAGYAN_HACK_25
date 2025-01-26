import { RxHamburgerMenu } from "react-icons/rx";
import { FaPlus } from "react-icons/fa6";
import { useState } from "react";

const Navbar: React.FC = (): JSX.Element => {
  const [clicked, setClicked] = useState<boolean>(false);

  const toggle = () => {
    setClicked(!clicked);
  };

  return (
    <nav
      className={
        "z-[300] py-4 transition-all duration-300 ease-out bg-black w-full h-16 flex items-center justify-between px-4"
      }
    >
      <RxHamburgerMenu size={40} color="white" />
      <div className="relative flex flex-col w-32 h-10 mx-4">
        {/* Dropdown button */}
        <button
          onClick={toggle}
          aria-expanded={clicked}
          aria-controls="dropdown-menu"
          className="w-full h-full flex items-center justify-center bg-white text-black text-xl font-semibold rounded-sm ransition-all duration-300  hover:shadow-lg hover:scale-105 hover:bg-gray-100"
        >
          <span className="px-2">Add</span>
          <span  className="transition-all duration-200 ease-in-out"
          style={
            {
                rotate:clicked?'45deg':'0deg'
            }
          }
          ><FaPlus size={15}/></span>
        </button>

        {/* Dropdown menu */}
        <div
          id="dropdown-menu"
          role="menu"
          className={`absolute top-[120%] left-0 w-32 bg-white border border-gray-300 rounded-sm shadow-lg transition-all duration-300 ease-out ${
            clicked ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
          style={{
            transform: clicked ? "translateY(0)" : "translateY(-10px)",
          }}
        >
          <div
            role="menuitem"
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            BIM
          </div>
          <div
            role="menuitem"
            className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
          >
            GIS
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
