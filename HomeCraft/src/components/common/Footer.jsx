export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row justify-between items-center">
        <p className="text-sm sm:text-base">© 2025 HomeCraft. All rights reserved.</p>
        <div className="space-x-4 mt-4 sm:mt-0 flex">
          <a href="#" className="hover:text-white transition">Facebook</a>
          <a href="#" className="hover:text-white transition">Instagram</a>
          <a href="#" className="hover:text-white transition">Twitter</a>
        </div>
      </div>
    </footer>
  );
}