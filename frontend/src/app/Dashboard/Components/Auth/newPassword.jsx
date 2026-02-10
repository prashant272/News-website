import React, { useContext, useState } from 'react';
import { Bounce, toast } from 'react-toastify';
import { FaLock } from 'react-icons/fa';
import { UserContext } from '@/app/Dashboard/Context/ManageUserContext';

export const NewPassword = ({ setMode, Email }) => {
  const [formData, setFormData] = useState({});
  const { PasswordUpdate } = useContext(UserContext);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (formData.Newpassword === formData.confirmPassword) {
        const body = { password: formData.Newpassword, email: Email };
        const status = await PasswordUpdate(body);
        if (status === 200) {
          toast.success('Password Changed Successfully', {
            position: 'top-center',
            autoClose: 3000,
            transition: Bounce,
          });
          setTimeout(() => setMode('signin'), 3000);
        }
      } else {
        toast.error("Passwords don't match", {
          position: 'top-center',
          autoClose: 5000,
          transition: Bounce,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f172a] px-4">
      <div className="bg-white/10 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-teal-400 mb-6">
          Create New Password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {['Newpassword', 'confirmPassword'].map((field, idx) => (
            <div key={idx} className="relative">
              <input
                type="password"
                placeholder={field === 'Newpassword' ? 'New Password' : 'Confirm Password'}
                className="w-full px-4 py-3 pl-10 bg-[#1e293b] text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-teal-500"
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, [field]: e.target.value }))
                }
              />
              <FaLock className="absolute top-3.5 left-3 text-teal-400" />
            </div>
          ))}
          <button
            type="submit"
            className="w-full py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            Confirm
          </button>
        </form>
        <button
          onClick={() => setMode('signin')}
          className="mt-4 w-full text-teal-400 hover:underline text-sm"
        >
          Back to Sign In
        </button>
      </div>
    </div>
  );
};
