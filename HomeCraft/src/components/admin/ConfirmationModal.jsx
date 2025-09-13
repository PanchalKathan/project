import { FaExclamationTriangle } from "react-icons/fa";

 const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center">
        <div className="mx-auto bg-red-100 rounded-full h-12 w-12 flex items-center justify-center">
          <FaExclamationTriangle className="text-red-600 text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mt-4">{title}</h2>
        <p className="text-gray-600 my-4">{message}</p>
        <div className="flex justify-center gap-4 pt-4">
          <button onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 font-semibold">
            Cancel
          </button>
          <button onClick={onConfirm} className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-semibold">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;