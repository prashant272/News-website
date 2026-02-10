import React, { useContext, useState } from 'react';
import { Bounce, toast } from 'react-toastify';
import { FaEnvelope, FaKey } from 'react-icons/fa';
import { NewPassword } from './newPassword';
import { UserContext } from '@/app/Dashboard/Context/ManageUserContext';

const ForgotPass = ({ setMode }) => {
  const { findAccount, SENDOTP, VERIFYOTP } = useContext(UserContext);
  const [data, setFormData] = useState({});
  const [user, setUser] = useState(false);
  const [email, setEmail] = useState('');
  const [passwordInp, setPasswordInp] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const findUserAccount = async (body) => {
    try {
      const data = await findAccount(body);
      const resolve = new Promise((resolve, reject) => {
        setTimeout(() => {
          if (data.data.email) {
            setEmail(data.data.email);
            setUser(true);
            resolve();
          } else reject();
        }, 2000);
      });

      toast.promise(resolve, {
        pending: 'Finding account...',
        success: 'Account found 👌',
        error: '"User Not Found" 🤯',
      });
    } catch (error) {
      toast.error('Error finding the account.');
    }
  };

  const OTPHandler = async (body) => {
    try {
      const data = await SENDOTP(body);
      const resolve = new Promise((resolve, reject) => {
        setTimeout(() => {
          if (data.Status === 'OTP Sent Successfully') {
            setShowInput(true);
            resolve();
          } else reject();
        }, 1500);
      });

      toast.promise(resolve, {
        pending: 'Sending OTP...',
        success: 'OTP Sent 👌',
        error: 'Failed to send OTP 🤯',
      });
    } catch (error) {
      toast.error('Error sending OTP');
    }
  };

  const VERIFYOTPHandler = async (body) => {
    try {
      const data = await VERIFYOTP(body);
      const resolve = new Promise((resolve, reject) => {
        setTimeout(() => {
          if (data.msg === 'OTP verified successfully') {
            setPasswordInp(true);
            resolve();
          } else reject();
        }, 2000);
      });

      toast.promise(resolve, {
        pending: 'Verifying OTP...',
        success: 'OTP Verified 👌',
        error: 'Verification Failed 🤯',
      });
    } catch (error) {
      toast.error('Error verifying OTP');
    }
  };

  if (passwordInp) return <NewPassword setMode={setMode} Email={email} />;

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#0f172a] px-4">
      <div className="bg-white/10 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-lg p-8 w-full max-w-md">
        {user ? (
          <>
            <h2 className="text-2xl font-semibold text-teal-400 text-center mb-1">{email}</h2>
            <p className="text-sm text-gray-300 text-center mb-6">
              Enter the OTP sent to your email
            </p>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              {showInput && (
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    className="flex-1 px-4 py-3 bg-[#1e293b] text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500"
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, OTP: e.target.value }))
                    }
                  />
                  <button
                    className="bg-green-600 text-white px-4 rounded-lg hover:bg-green-700 transition"
                    onClick={() => VERIFYOTPHandler({ email, otp: data.OTP })}
                  >
                    Submit
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition"
                onClick={() => OTPHandler({ UserEmail: email })}
              >
                {showInput ? 'Resend OTP' : 'Send OTP'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-teal-400 text-center">Find Your Account</h2>
            <p className="text-sm text-gray-300 text-center mt-2 mb-6">Enter your registered email</p>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter Email"
                  className="w-full px-4 py-3 pl-10 bg-[#1e293b] text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
                <FaEnvelope className="absolute top-3.5 left-3 text-blue-400" />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                onClick={() => findUserAccount(data)}
              >
                Continue
              </button>
            </form>
          </>
        )}

        <button
          className="text-teal-400 text-center mt-6 w-full hover:underline text-sm"
          onClick={() => setMode('signin')}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPass;
