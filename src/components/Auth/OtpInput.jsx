import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOtp } from '../../api/auth.api';
import { AuthContext } from '../../context/AuthContext';

const OtpInput = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    try {
      const response = await verifyOtp({ email: state?.email, otp });
      // On success, save token and move to home
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid OTP');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6">
      <div className="w-full max-w-sm text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
        <p className="text-gray-400 mb-8">Enter the code sent to {state?.email}</p>
        
        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            maxLength="6"
            className="w-full text-center text-2xl tracking-[1rem] py-3 bg-gray-900 border border-gray-800 rounded-lg text-white"
            placeholder="000000"
            onChange={(e) => setOtp(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button className="w-full py-3 font-bold text-white bg-pink-600 rounded-lg">
            Verify & Start Watching
          </button>
        </form>
      </div>
    </div>
  );
};

export default OtpInput;