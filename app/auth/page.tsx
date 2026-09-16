'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Logo from '@/components/Logo'; 
import { 
  HiOutlinePhone, 
  HiOutlineEnvelope, 
  HiOutlineLockClosed,
  HiOutlineEye,      
  HiOutlineEyeSlash  
} from 'react-icons/hi2';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  sendPasswordResetEmail
} from 'firebase/auth';
import Link from 'next/link';

declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}

const COUNTRY_CODES = [
  // AFRICA
  { code: '+213', flag: '🇩🇿', name: 'Algeria' },
  { code: '+244', flag: '🇦🇴', name: 'Angola' },
  { code: '+229', flag: '🇧🇯', name: 'Benin' },
  { code: '+267', flag: '🇧🇼', name: 'Botswana' },
  { code: '+226', flag: '🇧🇫', name: 'Burkina Faso' },
  { code: '+257', flag: '🇧🇮', name: 'Burundi' },
  { code: '+237', flag: '🇨🇲', name: 'Cameroon' },
  { code: '+238', flag: '🇨🇻', name: 'Cape Verde' },
  { code: '+236', flag: '🇨🇫', name: 'Central African Republic' },
  { code: '+235', flag: '🇹🇩', name: 'Chad' },
  { code: '+269', flag: '🇰🇲', name: 'Comoros' },
  { code: '+242', flag: '🇨🇬', name: 'Congo' },
  { code: '+243', flag: '🇨🇩', name: 'Congo (DRC)' },
  { code: '+253', flag: '🇩🇯', name: 'Djibouti' },
  { code: '+20',  flag: '🇪🇬', name: 'Egypt' },
  { code: '+240', flag: '🇬🇶', name: 'Equatorial Guinea' },
  { code: '+291', flag: '🇪🇷', name: 'Eritrea' },
  { code: '+268', flag: '🇸🇿', name: 'Eswatini' },
  { code: '+251', flag: '🇪🇹', name: 'Ethiopia' },
  { code: '+241', flag: '🇬🇦', name: 'Gabon' },
  { code: '+220', flag: '🇬🇲', name: 'Gambia' },
  { code: '+233', flag: '🇬🇭', name: 'Ghana' },
  { code: '+224', flag: '🇬🇳', name: 'Guinea' },
  { code: '+245', flag: '🇬🇼', name: 'Guinea-Bissau' },
  { code: '+225', flag: '🇨🇮', name: 'Ivory Coast' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+266', flag: '🇱🇸', name: 'Lesotho' },
  { code: '+231', flag: '🇱🇷', name: 'Liberia' },
  { code: '+218', flag: '🇱🇾', name: 'Libya' },
  { code: '+261', flag: '🇲🇬', name: 'Madagascar' },
  { code: '+265', flag: '🇲🇼', name: 'Malawi' },
  { code: '+223', flag: '🇲🇱', name: 'Mali' },
  { code: '+222', flag: '🇲🇷', name: 'Mauritania' },
  { code: '+230', flag: '🇲🇺', name: 'Mauritius' },
  { code: '+212', flag: '🇲🇦', name: 'Morocco' },
  { code: '+258', flag: '🇲🇿', name: 'Mozambique' },
  { code: '+264', flag: '🇳🇦', name: 'Namibia' },
  { code: '+227', flag: '🇳🇪', name: 'Niger' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+250', flag: '🇷🇼', name: 'Rwanda' },
  { code: '+239', flag: '🇸🇹', name: 'São Tomé and Príncipe' },
  { code: '+221', flag: '🇸🇳', name: 'Senegal' },
  { code: '+248', flag: '🇸🇨', name: 'Seychelles' },
  { code: '+232', flag: '🇸🇱', name: 'Sierra Leone' },
  { code: '+252', flag: '🇸🇴', name: 'Somalia' },
  { code: '+27',  flag: '🇿🇦', name: 'South Africa' },
  { code: '+211', flag: '🇸🇸', name: 'South Sudan' },
  { code: '+249', flag: '🇸🇩', name: 'Sudan' },
  { code: '+255', flag: '🇹🇿', name: 'Tanzania' },
  { code: '+228', flag: '🇹🇬', name: 'Togo' },
  { code: '+216', flag: '🇹🇳', name: 'Tunisia' },
  { code: '+256', flag: '🇺🇬', name: 'Uganda' },
  { code: '+260', flag: '🇿🇲', name: 'Zambia' },
  { code: '+263', flag: '🇿🇼', name: 'Zimbabwe' },

  // AMERICAS
  { code: '+1',   flag: '🇺🇸', name: 'United States / Canada' },
  { code: '+54',  flag: '🇦🇷', name: 'Argentina' },
  { code: '+591', flag: '🇧🇴', name: 'Bolivia' },
  { code: '+55',  flag: '🇧🇷', name: 'Brazil' },
  { code: '+56',  flag: '🇨🇱', name: 'Chile' },
  { code: '+57',  flag: '🇨🇴', name: 'Colombia' },
  { code: '+506', flag: '🇨🇷', name: 'Costa Rica' },
  { code: '+53',  flag: '🇨🇺', name: 'Cuba' },
  { code: '+1809',flag: '🇩🇴', name: 'Dominican Republic' },
  { code: '+593', flag: '🇪🇨', name: 'Ecuador' },
  { code: '+503', flag: '🇸🇻', name: 'El Salvador' },
  { code: '+502', flag: '🇬🇹', name: 'Guatemala' },
  { code: '+509', flag: '🇭🇹', name: 'Haiti' },
  { code: '+504', flag: '🇭🇳', name: 'Honduras' },
  { code: '+1876',flag: '🇯🇲', name: 'Jamaica' },
  { code: '+52',  flag: '🇲🇽', name: 'Mexico' },
  { code: '+505', flag: '🇳🇮', name: 'Nicaragua' },
  { code: '+507', flag: '🇵🇦', name: 'Panama' },
  { code: '+595', flag: '🇵🇾', name: 'Paraguay' },
  { code: '+51',  flag: '🇵🇪', name: 'Peru' },
  { code: '+1787',flag: '🇵🇷', name: 'Puerto Rico' },
  { code: '+598', flag: '🇺🇾', name: 'Uruguay' },
  { code: '+58',  flag: '🇻🇪', name: 'Venezuela' },

  // ASIA & MIDDLE EAST
  { code: '+93',  flag: '🇦🇫', name: 'Afghanistan' },
  { code: '+374', flag: '🇦🇲', name: 'Armenia' },
  { code: '+994', flag: '🇦🇿', name: 'Azerbaijan' },
  { code: '+973', flag: '🇧🇭', name: 'Bahrain' },
  { code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { code: '+975', flag: '🇧🇹', name: 'Bhutan' },
  { code: '+673', flag: '🇧🇳', name: 'Brunei' },
  { code: '+855', flag: '🇰🇭', name: 'Cambodia' },
  { code: '+86',  flag: '🇨🇳', name: 'China' },
  { code: '+995', flag: '🇬🇪', name: 'Georgia' },
  { code: '+852', flag: '🇭🇰', name: 'Hong Kong' },
  { code: '+91',  flag: '🇮🇳', name: 'India' },
  { code: '+62',  flag: '🇮🇩', name: 'Indonesia' },
  { code: '+98',  flag: '🇮🇷', name: 'Iran' },
  { code: '+964', flag: '🇮🇶', name: 'Iraq' },
  { code: '+972', flag: '🇮🇱', name: 'Israel' },
  { code: '+81',  flag: '🇯🇵', name: 'Japan' },
  { code: '+962', flag: '🇯🇴', name: 'Jordan' },
  { code: '+7',   flag: '🇰🇿', name: 'Kazakhstan' },
  { code: '+965', flag: '🇰🇼', name: 'Kuwait' },
  { code: '+996', flag: '🇰🇬', name: 'Kyrgyzstan' },
  { code: '+856', flag: '🇱🇦', name: 'Laos' },
  { code: '+961', flag: '🇱🇧', name: 'Lebanon' },
  { code: '+853', flag: '🇲🇴', name: 'Macau' },
  { code: '+60',  flag: '🇲🇾', name: 'Malaysia' },
  { code: '+960', flag: '🇲🇻', name: 'Maldives' },
  { code: '+976', flag: '🇲🇳', name: 'Mongolia' },
  { code: '+95',  flag: '🇲🇲', name: 'Myanmar' },
  { code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { code: '+850', flag: '🇰🇵', name: 'North Korea' },
  { code: '+968', flag: '🇴🇲', name: 'Oman' },
  { code: '+92',  flag: '🇵🇰', name: 'Pakistan' },
  { code: '+970', flag: '🇵🇸', name: 'Palestine' },
  { code: '+63',  flag: '🇵🇭', name: 'Philippines' },
  { code: '+974', flag: '🇶🇦', name: 'Qatar' },
  { code: '+966', flag: '🇸🇦', name: 'Saudi Arabia' },
  { code: '+65',  flag: '🇸🇬', name: 'Singapore' },
  { code: '+82',  flag: '🇰🇷', name: 'South Korea' },
  { code: '+94',  flag: '🇱🇰', name: 'Sri Lanka' },
  { code: '+963', flag: '🇸🇾', name: 'Syria' },
  { code: '+886', flag: '🇹🇼', name: 'Taiwan' },
  { code: '+992', flag: '🇹🇯', name: 'Tajikistan' },
  { code: '+66',  flag: '🇹🇭', name: 'Thailand' },
  { code: '+670', flag: '🇹🇱', name: 'Timor-Leste' },
  { code: '+90',  flag: '🇹🇷', name: 'Turkey' },
  { code: '+993', flag: '🇹🇲', name: 'Turkmenistan' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
  { code: '+998', flag: '🇺🇿', name: 'Uzbekistan' },
  { code: '+84',  flag: '🇻🇳', name: 'Vietnam' },
  { code: '+967', flag: '🇾🇪', name: 'Yemen' },

  // EUROPE
  { code: '+355', flag: '🇦🇱', name: 'Albania' },
  { code: '+376', flag: '🇦🇩', name: 'Andorra' },
  { code: '+43',  flag: '🇦🇹', name: 'Austria' },
  { code: '+375', flag: '🇧🇾', name: 'Belarus' },
  { code: '+32',  flag: '🇧🇪', name: 'Belgium' },
  { code: '+387', flag: '🇧🇦', name: 'Bosnia and Herzegovina' },
  { code: '+359', flag: '🇧🇬', name: 'Bulgaria' },
  { code: '+385', flag: '🇭🇷', name: 'Croatia' },
  { code: '+357', flag: '🇨🇾', name: 'Cyprus' },
  { code: '+420', flag: '🇨🇿', name: 'Czech Republic' },
  { code: '+45',  flag: '🇩🇰', name: 'Denmark' },
  { code: '+372', flag: '🇪🇪', name: 'Estonia' },
  { code: '+358', flag: '🇫🇮', name: 'Finland' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+30',  flag: '🇬🇷', name: 'Greece' },
  { code: '+36',  flag: '🇭🇺', name: 'Hungary' },
  { code: '+354', flag: '🇮🇸', name: 'Iceland' },
  { code: '+353', flag: '🇮🇪', name: 'Ireland' },
  { code: '+39',  flag: '🇮🇹', name: 'Italy' },
  { code: '+383', flag: '🇽🇰', name: 'Kosovo' },
  { code: '+371', flag: '🇱🇻', name: 'Latvia' },
  { code: '+423', flag: '🇱🇮', name: 'Liechtenstein' },
  { code: '+370', flag: '🇱🇹', name: 'Lithuania' },
  { code: '+352', flag: '🇱🇺', name: 'Luxembourg' },
  { code: '+356', flag: '🇲🇹', name: 'Malta' },
  { code: '+373', flag: '🇲🇩', name: 'Moldova' },
  { code: '+377', flag: '🇲🇨', name: 'Monaco' },
  { code: '+382', flag: '🇲🇪', name: 'Montenegro' },
  { code: '+31',  flag: '🇳🇱', name: 'Netherlands' },
  { code: '+389', flag: '🇲🇰', name: 'North Macedonia' },
  { code: '+47',  flag: '🇳🇴', name: 'Norway' },
  { code: '+48',  flag: '🇵🇱', name: 'Poland' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+40',  flag: '🇷🇴', name: 'Romania' },
  { code: '+7',   flag: '🇷🇺', name: 'Russia' },
  { code: '+378', flag: '🇸🇲', name: 'San Marino' },
  { code: '+381', flag: '🇷🇸', name: 'Serbia' },
  { code: '+421', flag: '🇸🇰', name: 'Slovakia' },
  { code: '+386', flag: '🇸🇮', name: 'Slovenia' },
  { code: '+34',  flag: '🇪🇸', name: 'Spain' },
  { code: '+46',  flag: '🇸🇪', name: 'Sweden' },
  { code: '+41',  flag: '🇨🇭', name: 'Switzerland' },
  { code: '+380', flag: '🇺🇦', name: 'Ukraine' },
  { code: '+44',  flag: '🇬🇧', name: 'United Kingdom' },
  { code: '+379', flag: '🇻🇦', name: 'Vatican City' },

  // OCEANIA
  { code: '+61',  flag: '🇦🇺', name: 'Australia' },
  { code: '+679', flag: '🇫🇯', name: 'Fiji' },
  { code: '+686', flag: '🇰🇮', name: 'Kiribati' },
  { code: '+692', flag: '🇲🇭', name: 'Marshall Islands' },
  { code: '+691', flag: '🇫🇲', name: 'Micronesia' },
  { code: '+674', flag: '🇳🇷', name: 'Nauru' },
  { code: '+64',  flag: '🇳🇿', name: 'New Zealand' },
  { code: '+680', flag: '🇵🇼', name: 'Palau' },
  { code: '+675', flag: '🇵🇬', name: 'Papua New Guinea' },
  { code: '+685', flag: '🇼🇸', name: 'Samoa' },
  { code: '+677', flag: '🇸🇧', name: 'Solomon Islands' },
  { code: '+676', flag: '🇹🇴', name: 'Tonga' },
  { code: '+688', flag: '🇹🇻', name: 'Tuvalu' },
  { code: '+678', flag: '🇻🇺', name: 'Vanuatu' },
];

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('AUTHENTICATING...');
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'phone' | 'reset'>('login');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [countryCode, setCountryCode] = useState('+234');
  
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const urlParams = new URLSearchParams(window.location.search);
        const nextUrl = urlParams.get('next') || '/account';
        router.push(nextUrl);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleGoogleAuth = async () => {
    if (!agreedToTerms) return;
    setLoadingText('CONNECTING TO GOOGLE...');
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      setIsLoading(false);
    }
  };

  const handleAppleAuth = () => {
    if (!agreedToTerms) return;
    alert("Apple Sign-In requires Developer Account configuration in Firebase. Coming soon!");
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return alert("Please agree to the Terms of Service.");
    
    setLoadingText(authMode === 'signup' ? 'CREATING ACCOUNT...' : 'SIGNING IN...');
    setIsLoading(true);
    
    try {
      if (authMode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error: any) {
      alert(`Error: ${error.message.replace('Firebase: ', '')}`);
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return alert("Please enter your email address first.");
    
    setLoadingText('SENDING RESET LINK...');
    setIsLoading(true);
    
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset link sent! Check your inbox.");
      setAuthMode('login'); 
    } catch (error: any) {
      alert(`Error: ${error.message.replace('Firebase: ', '')}`);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) return alert("Please agree to the Terms of Service.");
    
    setLoadingText('SENDING SMS CODE...');
    setIsLoading(true);
    
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      const cleanNumber = phoneNumber.replace(/^0/, '').replace(/\s+/g, '');
      const formattedPhone = `${countryCode}${cleanNumber}`;
      
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      window.confirmationResult = confirmationResult;
      setShowOtpInput(true);
      setIsLoading(false);
    } catch (error: any) {
      console.error("SMS Error:", error);
      alert(`Firebase says: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingText('VERIFYING CODE...');
    setIsLoading(true);
    
    try {
      await window.confirmationResult.confirm(otpCode);
    } catch (error: any) {
      alert("Invalid code. Please try again.");
      setIsLoading(false);
    }
  };

  const selectedCountryObj = COUNTRY_CODES.find((c) => c.code === countryCode) || COUNTRY_CODES[0];
  const filteredCountries = COUNTRY_CODES.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.code.includes(countrySearch)
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between" onClick={() => setIsCountryOpen(false)}>
      <Navbar />

      {isLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm 
             transition-opacity duration-500">
          <div className="flex flex-col items-center gap-6">
            
            <div className="relative flex items-center justify-center animate-pulse">
              <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full scale-[2.0]"></div>
              <Logo size={85} theme="dark" className="relative z-10" />
            </div>
            
            <div className="flex items-center gap-3">
              <svg className="animate-spin h-4 w-4 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" 
                   viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 
                      5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-emerald-400 font-bold tracking-[0.15em] uppercase text-xs drop-shadow-md">
                {loadingText}
              </p>
            </div>

          </div>
        </div>
      )}

      <section className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl w-full max-w-md space-y-8 relative">
          
          <div id="recaptcha-container"></div>

          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {authMode === 'login' ? 'Welcome Back' : authMode === 'signup' ? 'Join SkillForge' : authMode === 'reset' ? 
               'Reset Password' : 'Phone Sign In'}
            </h1>
            <p className="text-sm text-slate-500">
              {authMode === 'reset' ? "Enter your email and we'll send you a link to reset your password." : (showOtpInput ?
              'Enter the 6-digit code sent to your phone.' : 'Sign in to publish events and connect with your community.')}
            </p>
          </div>

          {authMode === 'reset' ? (
            <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
              <div className="relative">
                <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address" 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium 
                  outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white transition-all
                 hover:bg-emerald-500 active:scale-95 shadow-md shadow-emerald-900/10 disabled:opacity-50">
                Send Reset Link
              </button>
            </form>
          ) : authMode !== 'phone' ? (
            <form onSubmit={handleEmailAuth} className="space-y-4 pt-2">
              <div className="space-y-3">
                <div className="relative">
                  <HiOutlineEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address" 
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium 
                    outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
                
                <div>
                  <div className="relative">
                    <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                    
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password (min 6 characters)" 
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm 
                      ont-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                    
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                      title={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? (
                        <HiOutlineEyeSlash className="text-lg" />
                      ) : (
                        <HiOutlineEye className="text-lg" />
                      )}
                    </button>
                  </div>
                  
                  {authMode === 'login' && (
                    <div className="flex justify-end pt-1.5">
                      <button 
                        type="button" 
                        onClick={() => setAuthMode('reset')} 
                        className="text-[11px] font-bold text-emerald-600 hover:text-emerald-500 transition-colors">
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>

              </div>
              <button 
                type="submit"
                disabled={!agreedToTerms || isLoading}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white transition-all
                 hover:bg-emerald-500 active:scale-95 shadow-md shadow-emerald-900/10 disabled:opacity-50 mt-2">
                {authMode === 'login' ? 'Sign In with Email' : 'Create Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={showOtpInput ? handleVerifyOtp : handleSendOtp} className="space-y-4 pt-2">
              {!showOtpInput ? (
                <div className="flex rounded-xl border border-slate-200 bg-slate-50 focus-within:border-emerald-500 
                    focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all overflow-visible relative">
                  
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setIsCountryOpen(!isCountryOpen)}
                      className="flex items-center pl-3 pr-2.5 py-3.5 bg-slate-100 border-r border-slate-200 rounded-l-xl
                       text-sm font-bold text-slate-700 hover:bg-slate-200/60 transition-colors">
                      <span className="mr-1.5">{selectedCountryObj.flag}</span>
                      <span>{selectedCountryObj.code}</span>
                    </button>

                    {isCountryOpen && (
                      <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-2xl 
                           shadow-xl z-50 p-2 space-y-2">
                        <input
                          type="text"
                          placeholder="Search country or code (+234)..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          autoFocus
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium 
                          outline-none focus:border-emerald-500"
                        />
                        <div className="max-h-56 overflow-y-auto space-y-1">
                          {filteredCountries.map((country) => (
                            <button
                              key={`${country.code}-${country.name}`}
                              type="button"
                              onClick={() => {
                                setCountryCode(country.code);
                                setIsCountryOpen(false);
                                setCountrySearch('');
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 text-left text-xs
                               hover:bg-emerald-50 hover:text-emerald-700 rounded-lg font-medium transition-colors">
                              <span>{country.flag} {country.name}</span>
                              <span className="font-bold text-slate-500">{country.code}</span>
                            </button>
                          ))}
                          {filteredCountries.length === 0 && (
                            <p className="text-center text-xs text-slate-400 py-3">No country found</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <input 
                    type="tel" 
                    required 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="800 000 0000" 
                    className="w-full bg-transparent py-3.5 px-4 text-sm font-medium outline-none"
                  />
                </div>
              ) : (
                <input 
                  type="text" 
                  required 
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="Enter 6-digit code" 
                  maxLength={6}
                  className="w-full text-center tracking-widest rounded-xl border border-slate-200 bg-slate-50 py-3.5 
                  px-4 text-lg font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              )}
              
              <button 
                type="submit"
                disabled={!agreedToTerms || isLoading}
                className="w-full rounded-xl bg-emerald-600 px-4 py-3.5 text-sm font-bold text-white transition-all
                 hover:bg-emerald-500 active:scale-95 shadow-md shadow-emerald-900/10 disabled:opacity-50">
                {showOtpInput ? 'Verify Code' : 'Send Code'}
              </button>
            </form>
          )}

          <div className="text-center text-sm text-slate-500">
            {authMode === 'reset' ? (
              <button type="button" onClick={() => setAuthMode('login')} className="font-bold text-emerald-600 hover:text-emerald-500">
                Back to Log In
              </button>
            ) : authMode !== 'phone' ? (
              <>
                {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} 
                        className="font-bold text-emerald-600 hover:text-emerald-500">
                  {authMode === 'login' ? 'Sign Up' : 'Log In'}
                </button>
              </>
            ) : (
              <button type="button" onClick={() => setAuthMode('login')} className="font-bold text-emerald-600
                      hover:text-emerald-500">
                Back to Email Login
              </button>
            )}
          </div>

          {authMode !== 'reset' && (
            <>
              <div className="relative flex items-center py-2">
                <div className="grow border-t border-slate-200" />
                <span className="shrink-0 px-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Or continue with</span>
                <div className="grow border-t border-slate-200" />
              </div>

              <div className="space-y-3">
                {authMode !== 'phone' ? (
                  <>
                    <button
                      type="button"
                      disabled={!agreedToTerms || isLoading}
                      onClick={handleGoogleAuth}
                      className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 
                      rounded-xl px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Google
                    </button>

                    <button
                      type="button"
                      disabled={!agreedToTerms || isLoading}
                      onClick={handleAppleAuth}
                      className="w-full flex items-center justify-center gap-3 bg-black border border-black rounded-xl 
                      px-4 py-3 text-sm font-bold text-white hover:bg-slate-900 transition-colors disabled:opacity-50"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 
                        15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.88 1.49.03 2.76.57 3.59 
                        1.69-3.21 1.83-2.65 6.06.39 7.42-.76 1.6-1.57 3.12-2.56 3.94zM12.03 7.21c-.15-2.88 2.4-5.22 5.07-5.21.36 3.1-2.73 5.42-5.07 5.21z"/>
                      </svg>
                      Apple
                    </button>

                    <button 
                      type="button"
                      disabled={!agreedToTerms || isLoading}
                      onClick={() => setAuthMode('phone')}
                      className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 rounded-xl 
                      px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
                    >
                      <HiOutlinePhone className="text-xl text-emerald-600" />
                      Phone Number
                    </button>
                  </>
                ) : null}
              </div>
            </>
          )}

          <div className="flex items-start gap-3 pt-4 border-t border-slate-100">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed cursor-pointer">
              I acknowledge that I have read and agree to the{' '}
              <Link href="/terms" className="text-emerald-600 font-bold hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-emerald-600 font-bold hover:underline">Privacy Policy</Link>.
            </label>
          </div>
          
        </div>
      </section>

      <Footer />
    </main>
  );
}
