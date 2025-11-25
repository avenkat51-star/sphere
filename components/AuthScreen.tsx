
import React, { useState } from 'react';
import { Zap, Mail, Lock, User, ArrowRight, Loader, Smartphone, ChevronLeft, Check, ChevronDown, MessageSquare } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

const COUNTRY_CODES = [
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+91', country: 'IN', flag: '🇮🇳' },
  { code: '+81', country: 'JP', flag: '🇯🇵' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+39', country: 'IT', flag: '🇮🇹' },
  { code: '+86', country: 'CN', flag: '🇨🇳' },
  { code: '+7', country: 'RU', flag: '🇷🇺' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+55', country: 'BR', flag: '🇧🇷' },
  { code: '+971', country: 'AE', flag: '🇦🇪' },
  { code: '+20', country: 'EG', flag: '🇪🇬' },
  { code: '+234', country: 'NG', flag: '🇳🇬' },
  { code: '+27', country: 'ZA', flag: '🇿🇦' },
];

const AuthScreen: React.FC = () => {
  const { login, signup, loginWithPhone } = useAppContext();
  
  // Auth Method State
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [isLogin, setIsLogin] = useState(true);
  
  // Email Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // Phone Form State
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].code);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  
  // Notification State
  const [demoOtpNotification, setDemoOtpNotification] = useState<string | null>(null);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // --- Handlers ---

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (isLogin) {
      login(email);
    } else {
      signup(name, email);
    }
    setIsLoading(false);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 4) {
        alert("Please enter a valid phone number");
        return;
    }
    setIsLoading(true);
    // Simulate OTP Network Request
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
    setShowOtpInput(true);
    
    // Simulate receiving SMS
    setTimeout(() => {
        setDemoOtpNotification("123456");
        // Auto-hide after 8 seconds
        setTimeout(() => setDemoOtpNotification(null), 8000);
    }, 1500);
  };

  const handleResendOtp = () => {
     setDemoOtpNotification(null);
     // Simulate delay
     setTimeout(() => {
         setDemoOtpNotification("123456");
         setTimeout(() => setDemoOtpNotification(null), 8000);
     }, 1000);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '123456') {
      alert('Invalid verification code. Please try again.');
      return;
    }
    setDemoOtpNotification(null);
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    loginWithPhone(`${countryCode} ${phoneNumber}`);
    setIsLoading(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockGoogleEmail = "google_user@gmail.com";
      const mockGoogleName = "Google User";
      if (isLogin) login(mockGoogleEmail);
      else signup(mockGoogleName, mockGoogleEmail);
    } catch (error) {
      console.error("Google login failed", error);
    } finally {
      setGoogleLoading(false);
    }
  };

  const resetPhoneFlow = () => {
    setShowOtpInput(false);
    setOtp('');
    setDemoOtpNotification(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Simulated Mobile Notification */}
      {demoOtpNotification && (
        <div 
          onClick={() => { setOtp(demoOtpNotification); setDemoOtpNotification(null); }}
          className="fixed top-6 right-6 z-50 bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-4 w-80 cursor-pointer animate-in slide-in-from-top-10 duration-500 hover:scale-105 transition-transform"
        >
           <div className="flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                 <MessageSquare size={20} fill="currentColor" />
              </div>
              <div className="flex-1">
                 <div className="flex justify-between items-start">
                    <h4 className="font-bold text-slate-900 text-sm">Messages</h4>
                    <span className="text-[10px] text-slate-500">now</span>
                 </div>
                 <p className="text-sm text-slate-600 mt-1 leading-snug">
                    Sphere Verification Code: <span className="font-bold text-slate-900 tracking-wider">{demoOtpNotification}</span>
                 </p>
                 <p className="text-[10px] text-indigo-500 font-bold mt-2">Tap to autofill</p>
              </div>
           </div>
        </div>
      )}

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/30 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/30 rounded-full blur-[100px] animate-pulse"></div>
      </div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl w-full max-w-4xl h-[700px] shadow-2xl flex overflow-hidden z-10 relative">
        
        {/* Left Side (Form) */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-white overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Zap size={24} fill="currentColor" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Sphere</span>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            {authMethod === 'email' 
              ? (isLogin ? 'Welcome back' : 'Create account')
              : 'Mobile Login'
            }
          </h2>
          <p className="text-slate-500 mb-6">
            {authMethod === 'email'
              ? (isLogin ? 'Please enter your details to sign in.' : 'Join the future of social networking.')
              : 'Enter your phone number to receive a verification code.'
            }
          </p>

          {/* Method Toggle Tabs */}
          <div className="flex p-1.5 bg-slate-100 rounded-xl mb-8">
            <button 
              onClick={() => { setAuthMethod('email'); resetPhoneFlow(); }}
              className={`flex-1 flex items-center justify-center py-2.5 text-sm font-bold rounded-lg transition-all ${authMethod === 'email' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Mail size={16} className="mr-2" /> Email
            </button>
            <button 
              onClick={() => setAuthMethod('phone')}
              className={`flex-1 flex items-center justify-center py-2.5 text-sm font-bold rounded-lg transition-all ${authMethod === 'phone' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Smartphone size={16} className="mr-2" /> Mobile
            </button>
          </div>

          {/* --- FORMS --- */}

          {authMethod === 'email' ? (
            // EMAIL FORM
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    required
                  />
                </div>
              )}
              
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-400" size={20} />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-400" size={20} />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                  required
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-slate-600 cursor-pointer">
                  <input type="checkbox" className="mr-2 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                  Remember me
                </label>
                {isLogin && <a href="#" className="text-indigo-600 font-semibold hover:underline">Forgot password?</a>}
              </div>

              <button
                type="submit"
                disabled={isLoading || googleLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Sign Up'}
                    <ArrowRight size={20} className="ml-2" />
                  </>
                )}
              </button>
            </form>
          ) : (
            // MOBILE OTP FORM
            <div className="space-y-6">
              {!showOtpInput ? (
                // Step 1: Phone Input
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="relative">
                    {/* Country Code Selector */}
                    <div className="absolute left-2 top-2 bottom-2 flex items-center">
                      <div className="relative h-full">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="h-full appearance-none bg-slate-100 hover:bg-slate-200 border-none rounded-lg pl-3 pr-8 text-slate-700 font-bold text-sm focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
                        >
                          {COUNTRY_CODES.map((c, index) => (
                            <option key={`${c.country}-${c.code}-${index}`} value={c.code}>
                              {c.flag} {c.code}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                      </div>
                    </div>
                    
                    <input
                      type="tel"
                      placeholder="Mobile Number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full pl-[7.5rem] pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-lg tracking-wide font-medium"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-400">
                    By continuing, you may receive an SMS for verification. Message and data rates may apply.
                  </p>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-indigo-200 disabled:opacity-70"
                  >
                    {isLoading ? <Loader className="animate-spin" size={20} /> : 'Get Verification Code'}
                  </button>
                </form>
              ) : (
                // Step 2: OTP Input
                <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                   <div className="flex items-center justify-between mb-2">
                     <button 
                       type="button" 
                       onClick={resetPhoneFlow}
                       className="text-sm text-indigo-600 font-medium flex items-center hover:underline"
                     >
                       <ChevronLeft size={16} className="mr-1" /> Change Number
                     </button>
                     <span className="text-sm text-slate-500 font-medium">{countryCode} {phoneNumber}</span>
                   </div>
                   
                   <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full text-center py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white transition text-2xl tracking-[0.5em] font-mono font-bold text-slate-800"
                        required
                        autoFocus
                      />
                   </div>
                   
                   <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader className="animate-spin" size={20} /> : 'Verify & Login'}
                  </button>
                  
                  <div className="text-center">
                    <button type="button" onClick={handleResendOtp} className="text-sm text-slate-400 hover:text-indigo-600 transition">
                      Didn't receive code? <span className="font-semibold">Resend</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Social Login & Footer */}
          <div className="mt-auto">
            {authMethod === 'email' && (
               <>
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">Or continue with</span>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading || googleLoading}
                    className="w-full bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl transition-all flex items-center justify-center hover:bg-slate-50 hover:border-slate-300 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed mb-6"
                >
                    {googleLoading ? (
                    <Loader className="animate-spin mr-3 text-indigo-600" size={20} />
                    ) : (
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"/>
                        <path fill="#EA4335" d="M12 4.66c1.61 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    )}
                    {googleLoading ? 'Connecting...' : 'Google'}
                </button>
              </>
            )}

            {authMethod === 'email' && (
              <div className="text-center mt-2">
                <p className="text-slate-500 text-sm">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-indigo-600 font-bold hover:underline"
                  >
                    {isLogin ? 'Sign up' : 'Log in'}
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side (Visual) */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-600 p-12 text-white flex-col justify-between relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
           
           <div className="relative z-10">
             <h3 className="text-xl font-medium opacity-80 mb-2">Sphere Social</h3>
             <h1 className="text-5xl font-bold leading-tight">
                {authMethod === 'phone' ? 'Secure, fast, passwordless.' : 'Connect with the future.'}
             </h1>
           </div>

           <div className="relative z-10 space-y-4">
             <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-green-900 font-bold">AI</div>
                <div>
                   <p className="font-semibold">Gemini Powered</p>
                   <p className="text-sm opacity-70">Smart content generation & interaction</p>
                </div>
             </div>
             <div className="flex items-center space-x-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center text-blue-900 font-bold">HD</div>
                <div>
                   <p className="font-semibold">Live Calling</p>
                   <p className="text-sm opacity-70">Crystal clear video & audio</p>
                </div>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default AuthScreen;
