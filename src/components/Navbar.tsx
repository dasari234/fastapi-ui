export default function Navbar() {
  return (
    <>
      <nav className="hidden md:flex space-x-6">
        <a href="#" className="text-gray-600 hover:text-black">
          Home
        </a>
        <a href="#" className="text-gray-600 hover:text-black">
          About
        </a>
        <a href="#" className="text-gray-600 hover:text-black">
          Contact
        </a>
      </nav>
      {/* Mobile Menu Button */}
      <button className="md:hidden text-gray-600 hover:text-black">☰</button>
    </>
  );
}
