import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { LegalDocument } from '../../types';
import { Check, ArrowRight, ShieldCheck, Upload, Camera, AlertCircle, Eye, EyeOff, Link as LinkIcon, X } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
  onLoginClick?: () => void;
}

const DISCIPLINES = [
  'Filmmaker', 'Director', 'Cinematographer', 'Musician', 'Sound Artist',
  'Photographer', 'Writer', 'Visual Artist', 'Designer', 'Editor',
  'Scenographer', 'Dramaturg', 'Creative Coder'
];

const MEDIUMS_LIST = [
  '16mm Film', '35mm Stills', 'Super 8', 'Tape Loops', 'Modular Synth',
  'Darkroom Printing', 'Risograph', 'Foley & Field Audio', 'Large Format 4x5',
  'Screenwriting', 'Two-Channel Video', 'Creative Code'
];

const ID_TYPES = [
  { id: 'passport', label: 'Passport' },
  { id: 'national_id', label: 'National Identity Card' },
  { id: 'drivers_license', label: "Driver's License" },
  { id: 'voter_id', label: 'Voter ID Card' },
];

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const { register, login, oauthLogin } = useAuth();
  const [step, setStep] = useState<'identity' | 'media_id' | 'practice' | 'offer_seek' | 'covenants' | 'login'>('identity');

  // OAuth State
  const [oauthModalOpen, setOauthModalOpen] = useState(false);
  const [oauthProvider, setOauthProvider] = useState<'google' | 'apple'>('google');
  const [oauthStep, setOauthStep] = useState<'email' | 'password'>('email');
  const [oauthEmail, setOauthEmail] = useState('');
  const [oauthPassword, setOauthPassword] = useState('');
  const [oauthName, setOauthName] = useState('');
  const [showOauthPassword, setShowOauthPassword] = useState(false);
  const [oauthKeepSignedIn, setOauthKeepSignedIn] = useState(true);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [oauthError, setOauthError] = useState<string | null>(null);
  const [applicationNotice, setApplicationNotice] = useState<string | null>(null);

  // Step 1: Identity
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');

  // Step 2: Portrait & ID
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [avatarPublic, setAvatarPublic] = useState(true);
  const [idType, setIdType] = useState('passport');
  const [idBase64, setIdBase64] = useState<string | null>(null);
  const [idFileName, setIdFileName] = useState<string | null>(null);

  // Step 3: Practice & Portfolio
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [selectedMediums, setSelectedMediums] = useState<string[]>([]);
  const [showOtherDiscipline, setShowOtherDiscipline] = useState(false);
  const [customDisciplineInput, setCustomDisciplineInput] = useState('');
  const [showOtherMedium, setShowOtherMedium] = useState(false);
  const [customMediumInput, setCustomMediumInput] = useState('');
  const [portfolioLink, setPortfolioLink] = useState('');
  const [bio, setBio] = useState('');

  // Step 4: What Can You Offer & What Do You Want?
  const [whatCanYouOffer, setWhatCanYouOffer] = useState('');
  const [whatDoYouWant, setWhatDoYouWant] = useState('');

  // Step 5: Covenants
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptGuidelines, setAcceptGuidelines] = useState(false);
  const [legalDocs, setLegalDocs] = useState<LegalDocument[]>([]);

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.getLegalDocuments().then(data => {
      setLegalDocs(data.documents || []);
    }).catch(err => console.error(err));
  }, []);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleIdFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIdFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setIdBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleDiscipline = (d: string) => {
    if (selectedDisciplines.includes(d)) {
      setSelectedDisciplines(selectedDisciplines.filter(x => x !== d));
    } else {
      setSelectedDisciplines([...selectedDisciplines, d]);
    }
  };

  const handleAddCustomDiscipline = () => {
    const trimmed = customDisciplineInput.trim();
    if (!trimmed) return;
    if (!selectedDisciplines.includes(trimmed)) {
      setSelectedDisciplines([...selectedDisciplines, trimmed]);
    }
    setCustomDisciplineInput('');
  };

  const removeCustomDiscipline = (d: string) => {
    setSelectedDisciplines(selectedDisciplines.filter((x) => x !== d));
  };

  const toggleMedium = (m: string) => {
    if (selectedMediums.includes(m)) {
      setSelectedMediums(selectedMediums.filter(x => x !== m));
    } else {
      setSelectedMediums([...selectedMediums, m]);
    }
  };

  const handleAddCustomMedium = () => {
    const trimmed = customMediumInput.trim();
    if (!trimmed) return;
    if (!selectedMediums.includes(trimmed)) {
      setSelectedMediums([...selectedMediums, trimmed]);
    }
    setCustomMediumInput('');
  };

  const removeCustomMedium = (m: string) => {
    setSelectedMediums(selectedMediums.filter((x) => x !== m));
  };

  const handleAdvanceFromPractice = () => {
    let nextDisciplines = [...selectedDisciplines];
    if (customDisciplineInput.trim()) {
      const trimmed = customDisciplineInput.trim();
      if (!nextDisciplines.includes(trimmed)) {
        nextDisciplines.push(trimmed);
      }
      setCustomDisciplineInput('');
    }

    if (nextDisciplines.length === 0) {
      setError('Please select at least one creative discipline to continue your application.');
      return;
    }
    setError(null);

    let nextMediums = [...selectedMediums];
    if (customMediumInput.trim()) {
      const trimmed = customMediumInput.trim();
      if (!nextMediums.includes(trimmed)) {
        nextMediums.push(trimmed);
      }
      setCustomMediumInput('');
    }
    setSelectedDisciplines(nextDisciplines);
    setSelectedMediums(nextMediums);
    setStep('offer_seek');
  };

  const handleRegisterSubmit = async () => {
    if (!acceptTerms || !acceptPrivacy || !acceptGuidelines) {
      setError('Please review and accept all three founding covenants.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      let uploadedAvatarUrl: string | undefined = undefined;
      let uploadedIdUrl: string | undefined = undefined;

      if (avatarBase64) {
        try {
          const upRes = await api.uploadFile(avatarBase64, 'portrait.png');
          uploadedAvatarUrl = upRes.url;
        } catch (uErr) {
          console.error('Avatar upload failed', uErr);
        }
      }

      if (idBase64) {
        try {
          const upIdRes = await api.uploadFile(idBase64, idFileName || 'gov_id.png');
          uploadedIdUrl = upIdRes.url;
        } catch (idErr) {
          console.error('ID upload failed', idErr);
        }
      }

      // Combine what can you offer and what do you want into structured collaboration inquiry
      const fullCollaborationNotes = `OFFERING: ${whatCanYouOffer.trim()}\n\nSEEKING: ${whatDoYouWant.trim()}`;

      const selectedWorksPayload = portfolioLink.trim() ? [
        {
          title: 'Primary Portfolio & Works Archive',
          year: new Date().getFullYear().toString(),
          role: selectedDisciplines[0] || 'Creative Lead',
          description: whatCanYouOffer.trim() || 'Principal portfolio record.',
          link: portfolioLink.trim().startsWith('http') ? portfolioLink.trim() : `https://${portfolioLink.trim()}`
        }
      ] : [];

      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        location: location.trim(),
        country: country.trim(),
        bio: bio.trim(),
        disciplines: selectedDisciplines,
        practices: selectedMediums,
        collaboration_interests: whatDoYouWant.trim(),
        offerings: whatCanYouOffer.trim(),
        portfolio_url: portfolioLink.trim(),
        selected_works: selectedWorksPayload,
        avatar_url: uploadedAvatarUrl,
        avatar_public: avatarPublic ? 1 : 0,
        id_document_url: uploadedIdUrl,
        id_document_type: idType,
        latitude: 19.0760,
        longitude: 72.8777,
        acceptances: {
          terms: true,
          termsVersion: '1.0',
          privacy: true,
          privacyVersion: '1.0',
          guidelines: true,
          guidelinesVersion: '1.0',
        },
      });

      onComplete();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDirectLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    setError(null);
    setLoading(true);
    try {
      await login(loginEmail.trim().toLowerCase(), loginPassword);
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOAuth = (provider: 'google' | 'apple') => {
    setOauthProvider(provider);
    setOauthStep('email');
    setOauthEmail((email || loginEmail || '').trim());
    setOauthPassword('');
    setOauthName((name || '').trim());
    setShowOauthPassword(false);
    setOauthError(null);
    setOauthLoading(false);
    setOauthModalOpen(true);
  };

  const handleGoogleEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oauthEmail.trim() || !oauthEmail.includes('@')) {
      setOauthError('Enter a valid email address');
      return;
    }
    setOauthError(null);
    setOauthStep('password');
  };

  const handleOAuthFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oauthPassword.trim()) {
      setOauthError('Enter your password');
      return;
    }
    if (oauthProvider === 'apple' && (!oauthEmail.trim() || !oauthEmail.includes('@'))) {
      setOauthError('Enter a valid Apple ID email address');
      return;
    }
    setOauthError(null);
    setOauthLoading(true);

    try {
      let finalName = oauthName.trim();
      if (!finalName) {
        const usernamePart = oauthEmail.split('@')[0] || 'Creative';
        finalName = usernamePart
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
      }

      const result = await oauthLogin(oauthProvider, {
        email: oauthEmail.trim().toLowerCase(),
        name: finalName,
      });

      setOauthModalOpen(false);

      if (result && result.isNewUser) {
        // Not registered yet: route directly to the portrait & verification page!
        setEmail(result.email || oauthEmail.trim().toLowerCase());
        setName(result.name || finalName);
        setPassword(oauthPassword);
        setStep('media_id');
        setError(null);
        setApplicationNotice(`Authenticated as ${result.email || oauthEmail}. Please complete your monograph portrait & identity verification below.`);
      } else {
        // ONLY already registered practitioners enter!
        onComplete();
      }
    } catch (err: any) {
      setOauthError(err.message || 'Authentication protocol failed. Please check credentials.');
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf6f0] text-black p-4 sm:p-6 md:p-10 flex flex-col justify-center items-center select-none film-grain">
      {/* 
        Arthouse Cinema Magazine Questionnaire Container
        Palette: Pantone Glistening Grape (#6A1A4C), Stark Black, Crisp Ivory
        Boxes: Bold Black Borders (border-[2.5px] border-black)
        Fonts: Fraunces & Syne
      */}
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl mx-auto bg-white border-[2.5px] border-black p-6 sm:p-8 md:p-10 relative">
        {/* Folio / Step Tracker */}
        <div className="flex items-center justify-between border-b-[2.5px] border-black pb-3 mb-5 font-mono text-[10px]">
          <span className="font-bold text-black tracking-widest uppercase">
            WINDERVALE ADMISSION
          </span>
          <span className="font-mono text-[10px] font-bold text-white bg-[#6A1A4C] px-2 py-0.5 uppercase tracking-wider">
            {step === 'identity' && 'FOLIO 01 // IDENTITY'}
            {step === 'media_id' && 'FOLIO 02 // PORTRAIT & VERIFICATION'}
            {step === 'practice' && 'FOLIO 03 // PRACTICE & DISCIPLINES'}
            {step === 'offer_seek' && 'FOLIO 04 // COLLABORATION'}
            {step === 'covenants' && 'FOLIO 05 // COVENANTS'}
            {step === 'login' && 'MEMBER SIGN IN'}
          </span>
        </div>

        {applicationNotice && (
          <div className="mb-4 p-3.5 bg-[#6A1A4C] text-white font-mono text-xs flex items-center gap-2.5 border-[2px] border-black shadow-[2px_2px_0px_#000000]">
            <ShieldCheck className="w-4 h-4 text-white shrink-0" />
            <div className="space-y-0.5">
              <span className="font-bold uppercase tracking-wider block">APPLICATION REQUIRED</span>
              <span className="text-[11px] text-white/90">{applicationNotice}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-black text-white font-mono text-xs flex items-center gap-2 border-[2px] border-black">
            <AlertCircle className="w-4 h-4 text-[#6A1A4C] shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: IDENTITY */}
        {step === 'identity' && (
          <div className="space-y-4 animate-editorial-fade">
            <div className="space-y-1">
              <h2 className="font-fun font-bold text-2xl text-black leading-tight lowercase">
                creative identity
              </h2>
              <p className="font-fun italic text-xs text-black/75 leading-snug">
                Establish your practitioner monograph on the independent network.
              </p>
            </div>

            {/* Social Authentication */}
            <div className="pt-2 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenOAuth('google')}
                  className="w-full py-2.5 px-3 bg-white border-[2px] border-black hover:bg-[#6A1A4C] hover:text-white text-black font-arthouse font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenOAuth('apple')}
                  className="w-full py-2.5 px-3 bg-black text-white border-[2px] border-black hover:bg-[#6A1A4C] font-arthouse font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.07-7.64-7.85-11.83-14.34-5.96-9.14-10.4-19.34-13.32-30.59-2.92-11.25-4.39-21.73-4.39-31.43 0-14.3 3.6-26.15 10.79-35.53 7.2-9.39 16.22-14.15 27.07-14.28 5.75 0 11.75 1.57 18 4.7 6.25 3.13 10.37 4.77 12.38 4.92 1.63-.26 5.86-1.89 12.69-4.89 6.83-3 12.98-4.32 18.45-3.96 14.13.78 25.13 5.85 33.02 15.22-11.64 7.07-17.3 16.73-17 28.98.3 9.4 3.99 17.26 11.06 23.59 7.07 6.33 15.35 10.05 24.84 11.16-2.18 6.53-4.68 13.06-7.5 19.59zM119.22 31.84c0-7.72 2.76-14.93 8.28-21.64 5.53-6.7 12.39-10.47 20.59-11.3 0 .98.05 1.83.16 2.54.1 2.22-.38 4.88-1.44 7.97-1.06 3.09-2.6 6.04-4.62 8.85-4.47 6.07-10.59 9.87-18.35 11.41-.66-4.63-2.2-9.43-4.62-17.83z"/>
                  </svg>
                  <span>Continue with Apple</span>
                </button>
              </div>
              <div className="flex items-center my-3">
                <div className="flex-1 border-t-[1.5px] border-black/20"></div>
                <span className="px-2 font-mono text-[9px] uppercase tracking-wider text-black/70 font-bold">
                  or register manually [preferred]
                </span>
                <div className="flex-1 border-t-[1.5px] border-black/20"></div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block font-arthouse text-[10px] font-bold uppercase tracking-wider text-black mb-1">
                  Full Name / Mononym
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Rao"
                  className="w-full bg-white border-[2px] border-black px-3 py-2 text-sm text-black focus:outline-none "
                />
              </div>

              <div>
                <label className="block font-arthouse text-[10px] font-bold uppercase tracking-wider text-black mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. maya@independentfilm.org"
                  className="w-full bg-white border-[2px] border-black px-3 py-2 text-sm text-black focus:outline-none "
                />
              </div>

              <div>
                <label className="block font-arthouse text-[10px] font-bold uppercase tracking-wider text-black mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-white border-[2px] border-black px-3 py-2 text-sm text-black focus:outline-none "
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-arthouse text-[10px] font-bold uppercase tracking-wider text-black mb-1">
                    City / Base
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full bg-white border-[2px] border-black px-3 py-2 text-sm text-black focus:outline-none "
                  />
                </div>
                <div>
                  <label className="block font-arthouse text-[10px] font-bold uppercase tracking-wider text-black mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. India"
                    className="w-full bg-white border-[2px] border-black px-3 py-2 text-sm text-black focus:outline-none "
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-[2px] border-black flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('login')}
                className="font-mono text-xs text-black/70 hover:text-black underline font-bold"
              >
                Existing Member?
              </button>
              <button
                type="button"
                disabled={!name.trim() || !email.trim() || password.length < 6}
                onClick={() => setStep('media_id')}
                className="py-2.5 px-5 bg-black hover:bg-[#6A1A4C] text-white font-arthouse font-bold text-xs tracking-wider uppercase disabled:opacity-40 flex items-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>Portrait &amp; ID Verification</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PORTRAIT & GOVERNMENT ID */}
        {step === 'media_id' && (
          <div className="space-y-4 animate-editorial-fade">
            <div className="space-y-1">
              <h2 className="font-fun font-bold text-2xl text-black leading-tight lowercase">
                portrait &amp; verification
              </h2>
              <p className="font-fun italic text-xs text-black/75 leading-snug">
                Upload your monograph portrait and authenticate your identity.
              </p>
            </div>

            {/* Profile Picture Upload */}
            <div className="p-3.5 bg-white border-[2px] border-black space-y-3">
              <span className="font-arthouse text-[10px] uppercase font-bold text-black tracking-wider block">
                01 &middot; Monograph Portrait
              </span>
              <div className="flex items-center gap-3.5">
                <div
                  onClick={() => avatarInputRef.current?.click()}
                  className="w-16 h-16 border-[2px] border-dashed border-black bg-[#6A1A4C]/10 flex items-center justify-center cursor-pointer hover:bg-[#6A1A4C]/20 overflow-hidden shrink-0 group"
                >
                  {avatarBase64 ? (
                    <img src={avatarBase64} alt="Portrait" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-black group-hover:scale-110 transition-transform" />
                  )}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFile}
                    className="hidden"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => avatarInputRef.current?.click()}
                    className="font-arthouse text-xs uppercase tracking-wider text-black hover:underline font-bold block"
                  >
                    {avatarBase64 ? 'Replace Photo' : 'Upload Portrait Photo'}
                  </button>
                  <p className="font-fun italic text-[11px] text-black/70 mt-0.5 leading-snug">
                    Natural light portrait, darkroom still, or creative headshot.
                  </p>
                </div>
              </div>

              {/* Public Visibility Toggle */}
              <div className="pt-2 border-t-[1.5px] border-black/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {avatarPublic ? (
                    <Eye className="w-3.5 h-3.5 text-black" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-black/40" />
                  )}
                  <span className="font-fun text-xs text-black font-medium">
                    Show photo publicly on Map &amp; Dossier
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={avatarPublic}
                  onChange={(e) => setAvatarPublic(e.target.checked)}
                  className="w-4 h-4 accent-black cursor-pointer"
                />
              </div>
            </div>

            {/* Government ID Verification Upload */}
            <div className="p-3.5 bg-white border-[2px] border-black space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-arthouse text-[10px] uppercase font-bold text-black tracking-wider">
                  02 &middot; Government ID Document
                </span>
                <span className="font-mono text-[9px] bg-[#6A1A4C] text-white px-1.5 py-0.5 uppercase font-bold">
                  ENCRYPTED
                </span>
              </div>

              <div>
                <label className="block font-mono text-[9px] uppercase text-black/70 mb-1 font-bold">
                  Document Type
                </label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-full bg-[#fbf6f0] border-[2px] border-black text-xs font-sans text-black px-2.5 py-1.5 focus:outline-none"
                >
                  {ID_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div
                onClick={() => idInputRef.current?.click()}
                className="border-[2px] border-dashed border-black hover:bg-black/5 bg-[#fbf6f0] p-3 text-center cursor-pointer transition-colors"
              >
                <input
                  ref={idInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleIdFile}
                  className="hidden"
                />
                {idFileName ? (
                  <div className="flex items-center justify-center gap-2 text-xs font-mono text-black font-bold">
                    <Check className="w-4 h-4 text-black" />
                    <span className="truncate max-w-[200px]">{idFileName}</span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Upload className="w-5 h-5 text-black mx-auto" />
                    <span className="font-arthouse text-xs uppercase tracking-wider text-black block font-bold">
                      Upload ID Document File / Scan
                    </span>
                  </div>
                )}
              </div>

              <div className="p-2 bg-[#6A1A4C]/10 border-l-[3px] border-[#6A1A4C] flex items-start gap-2 text-[10px] font-fun italic text-black leading-relaxed">
                <ShieldCheck className="w-3.5 h-3.5 text-[#6A1A4C] shrink-0 mt-0.5" />
                <span>
                  Encrypted at rest. Used solely to verify authentic human identity. Never displayed publicly or shared.
                </span>
              </div>
            </div>

            <div className="pt-4 border-t-[2px] border-black flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('identity')}
                className="font-mono text-xs text-black/70 hover:text-black font-bold"
              >
                &larr; Back
              </button>
              <button
                type="button"
                onClick={() => setStep('practice')}
                className="py-2.5 px-5 bg-black hover:bg-[#6A1A4C] text-white font-arthouse font-bold text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>Disciplines &amp; Practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PRACTICE, MEDIUMS & PROFILE */}
        {step === 'practice' && (
          <div className="space-y-4 animate-editorial-fade">
            <div className="space-y-1">
              <h2 className="font-fun font-bold text-2xl text-black leading-tight lowercase">
                creative practice &amp; disciplines
              </h2>
              <p className="font-fun italic text-xs text-black/75 leading-snug">
                Select your artistic disciplines, physical mediums, and profile monograph.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-arthouse text-[10px] uppercase font-bold tracking-wider text-black">
                    Disciplines ({selectedDisciplines.length}) <span className="text-[#6A1A4C] font-mono">*Mandatory</span>
                  </label>
                  <span className="font-mono text-[9px] text-[#6A1A4C] uppercase font-bold">
                    Required for Admission
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {DISCIPLINES.map((d) => {
                    const isSel = selectedDisciplines.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDiscipline(d)}
                        className={`px-2 py-0.5 text-xs font-arthouse uppercase tracking-wider transition-all cursor-pointer ${
                          isSel
                            ? 'bg-[#6A1A4C] text-white font-bold border-[2px] border-black'
                            : 'bg-white text-black border-[1.5px] border-black hover:bg-[#6A1A4C]/15'
                        }`}
                      >
                        {d}
                      </button>
                    );
                  })}

                  {/* Custom Disciplines Added */}
                  {selectedDisciplines
                    .filter((d) => !DISCIPLINES.includes(d))
                    .map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-arthouse uppercase tracking-wider bg-[#6A1A4C] text-white font-bold border-[2px] border-black"
                      >
                        <span>{d}</span>
                        <button
                          type="button"
                          onClick={() => removeCustomDiscipline(d)}
                          className="hover:text-black cursor-pointer font-mono text-sm leading-none ml-0.5"
                          title="Remove"
                        >
                          &times;
                        </button>
                      </span>
                    ))}

                  {/* Other Option */}
                  <button
                    type="button"
                    onClick={() => setShowOtherDiscipline(!showOtherDiscipline)}
                    className={`px-2 py-0.5 text-xs font-arthouse uppercase tracking-wider transition-all cursor-pointer ${
                      showOtherDiscipline
                        ? 'bg-black text-white font-bold border-[2px] border-black'
                        : 'bg-white text-black border-[1.5px] border-black hover:bg-black/10'
                    }`}
                  >
                    {showOtherDiscipline ? '- OTHER' : '+ OTHER'}
                  </button>
                </div>

                {/* Custom Discipline Input Field */}
                {showOtherDiscipline && (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={customDisciplineInput}
                      onChange={(e) => setCustomDisciplineInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomDiscipline();
                        }
                      }}
                      placeholder="Type custom discipline (e.g. Sculptor, Choreographer)..."
                      className="flex-1 bg-white border-[2px] border-black px-3 py-1.5 text-xs font-mono text-black placeholder:text-black/40 focus:outline-none focus:border-[#6A1A4C]"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomDiscipline}
                      className="px-3.5 py-1.5 bg-black hover:bg-[#6A1A4C] text-white font-mono text-xs uppercase font-bold border-[2px] border-black transition-colors cursor-pointer shrink-0"
                    >
                      + ADD
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-arthouse text-[10px] uppercase font-bold tracking-wider text-black mb-1.5">
                  Physical Mediums &amp; Tools ({selectedMediums.length})
                </label>
                <div className="flex flex-wrap gap-1">
                  {MEDIUMS_LIST.map((m) => {
                    const isSel = selectedMediums.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => toggleMedium(m)}
                        className={`px-2 py-0.5 text-[11px] font-mono transition-all cursor-pointer ${
                          isSel
                            ? 'bg-black text-white font-bold border-[2px] border-black'
                            : 'bg-white/80 text-black border-[1.5px] border-black/60 hover:border-black'
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}

                  {/* Custom Mediums Added */}
                  {selectedMediums
                    .filter((m) => !MEDIUMS_LIST.includes(m))
                    .map((m) => (
                      <span
                        key={m}
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono bg-black text-white font-bold border-[2px] border-black"
                      >
                        <span>{m}</span>
                        <button
                          type="button"
                          onClick={() => removeCustomMedium(m)}
                          className="hover:text-[#6A1A4C] cursor-pointer font-mono text-sm leading-none ml-0.5"
                          title="Remove"
                        >
                          &times;
                        </button>
                      </span>
                    ))}

                  {/* Other Option */}
                  <button
                    type="button"
                    onClick={() => setShowOtherMedium(!showOtherMedium)}
                    className={`px-2 py-0.5 text-[11px] font-mono transition-all cursor-pointer ${
                      showOtherMedium
                        ? 'bg-black text-white font-bold border-[2px] border-black'
                        : 'bg-white/80 text-black border-[1.5px] border-black/60 hover:border-black'
                    }`}
                  >
                    {showOtherMedium ? '- OTHER' : '+ OTHER'}
                  </button>
                </div>

                {/* Custom Medium Input Field */}
                {showOtherMedium && (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={customMediumInput}
                      onChange={(e) => setCustomMediumInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomMedium();
                        }
                      }}
                      placeholder="Type custom physical medium or tool (e.g. Cyanotype, Letterpress)..."
                      className="flex-1 bg-white border-[2px] border-black px-3 py-1.5 text-xs font-mono text-black placeholder:text-black/40 focus:outline-none focus:border-black"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomMedium}
                      className="px-3.5 py-1.5 bg-black hover:bg-[#6A1A4C] text-white font-mono text-xs uppercase font-bold border-[2px] border-black transition-colors cursor-pointer shrink-0"
                    >
                      + ADD
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-arthouse text-[10px] uppercase font-bold tracking-wider text-black mb-1">
                    City / Base
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full bg-white border-[2px] border-black px-3 py-2 text-xs font-mono text-black focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-arthouse text-[10px] uppercase font-bold tracking-wider text-black mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. India"
                    className="w-full bg-white border-[2px] border-black px-3 py-2 text-xs font-mono text-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-arthouse text-[10px] uppercase font-bold tracking-wider text-black mb-1">
                  Portfolio / Reel Link
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-black absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={portfolioLink}
                    onChange={(e) => setPortfolioLink(e.target.value)}
                    placeholder="https://vimeo.com/... or personal archive link"
                    className="w-full bg-white border-[2px] border-black pl-9 pr-3 py-2 text-xs font-mono text-black focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-arthouse text-[10px] uppercase font-bold tracking-wider text-black mb-1">
                  Bio / Monograph Statement
                </label>
                <textarea
                  rows={2}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. Director exploring celluloid memory, oral histories, and tactile audio."
                  className="w-full bg-white border-[2px] border-black p-2.5 text-xs font-fun text-black focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t-[2px] border-black flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('media_id')}
                className="font-mono text-xs text-black/70 hover:text-black font-bold"
              >
                &larr; Back
              </button>
              <button
                type="button"
                disabled={selectedDisciplines.length === 0}
                onClick={handleAdvanceFromPractice}
                className="py-2.5 px-5 bg-black hover:bg-[#6A1A4C] text-white font-arthouse font-bold text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 disabled:opacity-40"
              >
                <span>Offer &amp; Seek</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: WHAT CAN YOU OFFER & WHAT DO YOU WANT? */}
        {step === 'offer_seek' && (
          <div className="space-y-4 animate-editorial-fade">
            <div className="space-y-1">
              <h2 className="font-fun font-bold text-2xl text-black leading-tight lowercase">
                collaboration exchange
              </h2>
              <p className="font-fun italic text-xs text-black/75 leading-snug">
                Define the creative energy, tools, and partnerships you wish to exchange.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block font-arthouse text-[10px] uppercase font-bold tracking-wider text-black mb-1">
                  What Can You Offer?
                </label>
                <textarea
                  rows={3}
                  value={whatCanYouOffer}
                  onChange={(e) => setWhatCanYouOffer(e.target.value)}
                  placeholder="e.g. 16mm Bolex camera package, darkroom hand-printing, tape loop mastering, score composition, script consultation, color grading."
                  className="w-full bg-white border-[2px] border-black p-2.5 text-xs font-fun text-black focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block font-arthouse text-[10px] uppercase font-bold tracking-wider text-black mb-1">
                  What Do You Want / What Are You Seeking?
                </label>
                <textarea
                  rows={3}
                  value={whatDoYouWant}
                  onChange={(e) => setWhatDoYouWant(e.target.value)}
                  placeholder="e.g. Seeking co-director for a docu-fiction project, cellist for original score, sound recordist, or exhibition curator."
                  className="w-full bg-white border-[2px] border-black p-2.5 text-xs font-fun text-black focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t-[2px] border-black flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('practice')}
                className="font-mono text-xs text-black/70 hover:text-black font-bold"
              >
                &larr; Back
              </button>
              <button
                type="button"
                onClick={() => setStep('covenants')}
                className="py-2.5 px-5 bg-black hover:bg-[#6A1A4C] text-white font-arthouse font-bold text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>Founding Covenants</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: COVENANTS */}
        {step === 'covenants' && (
          <div className="space-y-4 animate-editorial-fade">
            <div className="space-y-1">
              <h2 className="font-fun font-bold text-2xl text-black leading-tight lowercase">
                founding covenants
              </h2>
              <p className="font-fun italic text-xs text-black/75 leading-snug">
                Windervale is governed by legal respect, creative integrity, and mutual autonomy.
              </p>
            </div>

            <div className="space-y-2.5 pt-2 font-sans text-xs">
              <label className="flex items-start gap-2.5 p-2.5 bg-white border-[2px] border-black cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#6A1A4C]"
                />
                <div>
                  <span className="font-arthouse font-bold text-black uppercase text-xs block">Terms of Service</span>
                  <span className="font-fun italic text-[11px] text-black/80">
                    You retain 100% intellectual property ownership of your work.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 bg-white border-[2px] border-black cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptPrivacy}
                  onChange={(e) => setAcceptPrivacy(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#6A1A4C]"
                />
                <div>
                  <span className="font-arthouse font-bold text-black uppercase text-xs block">Privacy Policy</span>
                  <span className="font-fun italic text-[11px] text-black/80">
                    Private workspaces are confidential and never sold or indexed.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2.5 bg-white border-[2px] border-black cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptGuidelines}
                  onChange={(e) => setAcceptGuidelines(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-[#6A1A4C]"
                />
                <div>
                  <span className="font-arthouse font-bold text-black uppercase text-xs block">Community Guidelines</span>
                  <span className="font-fun italic text-[11px] text-black/80">
                    Credit honestly, establish split sheets early, and honour shared work.
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-4 border-t-[2px] border-black flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('offer_seek')}
                className="font-mono text-xs text-black/70 hover:text-black font-bold"
              >
                &larr; Back
              </button>
              <button
                type="button"
                disabled={loading || !acceptTerms || !acceptPrivacy || !acceptGuidelines}
                onClick={handleRegisterSubmit}
                className="py-3 px-6 bg-black hover:bg-[#6A1A4C] text-white font-arthouse font-bold text-xs tracking-wider uppercase disabled:opacity-40 flex items-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>{loading ? 'Transmitting...' : 'Complete Registration \u2192'}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: SIGN IN (EXISTING MEMBERS) */}
        {step === 'login' && (
          <form onSubmit={handleDirectLogin} className="space-y-4 animate-editorial-fade">
            <div className="space-y-1">
              <h2 className="font-fun font-bold text-2xl text-black leading-tight lowercase">
                member access
              </h2>
              <p className="font-fun italic text-xs text-black/75 leading-snug">
                Authenticate your creative session to access your workspaces.
              </p>
            </div>

            {/* Social Authentication */}
            <div className="pt-2 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenOAuth('google')}
                  className="w-full py-2.5 px-3 bg-white border-[2px] border-black hover:bg-[#6A1A4C] hover:text-white text-black font-arthouse font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenOAuth('apple')}
                  className="w-full py-2.5 px-3 bg-black text-white border-[2px] border-black hover:bg-[#6A1A4C] font-arthouse font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.07-7.64-7.85-11.83-14.34-5.96-9.14-10.4-19.34-13.32-30.59-2.92-11.25-4.39-21.73-4.39-31.43 0-14.3 3.6-26.15 10.79-35.53 7.2-9.39 16.22-14.15 27.07-14.28 5.75 0 11.75 1.57 18 4.7 6.25 3.13 10.37 4.77 12.38 4.92 1.63-.26 5.86-1.89 12.69-4.89 6.83-3 12.98-4.32 18.45-3.96 14.13.78 25.13 5.85 33.02 15.22-11.64 7.07-17.3 16.73-17 28.98.3 9.4 3.99 17.26 11.06 23.59 7.07 6.33 15.35 10.05 24.84 11.16-2.18 6.53-4.68 13.06-7.5 19.59zM119.22 31.84c0-7.72 2.76-14.93 8.28-21.64 5.53-6.7 12.39-10.47 20.59-11.3 0 .98.05 1.83.16 2.54.1 2.22-.38 4.88-1.44 7.97-1.06 3.09-2.6 6.04-4.62 8.85-4.47 6.07-10.59 9.87-18.35 11.41-.66-4.63-2.2-9.43-4.62-17.83z"/>
                  </svg>
                  <span>Continue with Apple</span>
                </button>
              </div>
              <div className="flex items-center my-3">
                <div className="flex-1 border-t-[1.5px] border-black/20"></div>
                <span className="px-2 font-mono text-[9px] uppercase tracking-wider text-black/50">
                  or sign in with password
                </span>
                <div className="flex-1 border-t-[1.5px] border-black/20"></div>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block font-arthouse text-[10px] font-bold uppercase tracking-wider text-black mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="name@culturalspace.org"
                  className="w-full bg-white border-[2px] border-black px-3 py-2 text-sm text-black focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-arthouse text-[10px] font-bold uppercase tracking-wider text-black mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter account password"
                  className="w-full bg-white border-[2px] border-black px-3 py-2 text-sm text-black focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t-[2px] border-black flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep('identity')}
                className="font-mono text-xs text-black/70 hover:text-black underline font-bold"
              >
                New practitioner?
              </button>
              <button
                type="submit"
                disabled={loading || !loginEmail || !loginPassword}
                className="py-3 px-6 bg-black hover:bg-[#6A1A4C] text-white font-arthouse font-bold text-xs tracking-wider uppercase disabled:opacity-40 flex items-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              >
                <span>{loading ? 'Authenticating...' : 'Enter App \u2192'}</span>
              </button>
            </div>
          </form>
        )}

        {/* SOCIAL AUTHENTICATION MODAL */}
        {oauthModalOpen && (
          <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            {oauthProvider === 'google' ? (
              /* =======================================================
                 AUTHENTIC GOOGLE ACCOUNT SIGN-IN MODAL
                 ======================================================= */
              <div className="w-full max-w-[440px] bg-white rounded-[28px] border border-[#dadce0] p-7 sm:p-9 shadow-2xl relative font-sans text-left animate-editorial-fade text-[#1f1f1f]">
                {/* Header Row: Google G Logo & Close */}
                <div className="flex items-center justify-between pb-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <button
                    type="button"
                    onClick={() => setOauthModalOpen(false)}
                    className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-black transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress Bar during authentication */}
                {oauthLoading && (
                  <div className="h-1 w-full bg-blue-100 overflow-hidden rounded mb-4">
                    <div className="h-full bg-[#0b57d0] animate-pulse w-full"></div>
                  </div>
                )}

                {oauthStep === 'email' ? (
                  /* STEP 1: GOOGLE EMAIL ENTRY */
                  <form onSubmit={handleGoogleEmailNext} className="space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-normal text-[#1f1f1f] tracking-tight">Sign in</h2>
                      <p className="text-sm text-[#444746]">to continue to Windervale</p>
                    </div>

                    <div className="pt-4 space-y-1.5">
                      <label className="block text-xs font-medium text-[#444746]">
                        Email or phone
                      </label>
                      <input
                        type="email"
                        autoFocus
                        required
                        value={oauthEmail}
                        onChange={(e) => { setOauthEmail(e.target.value); setOauthError(null); }}
                        placeholder="name@gmail.com"
                        className="w-full px-3.5 py-3 rounded-lg border border-[#747775] text-[#1f1f1f] text-base focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] outline-none transition-all placeholder-gray-400"
                      />
                      {oauthError && (
                        <p className="text-xs text-[#b3261e] pt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 inline shrink-0" /> {oauthError}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      className="text-xs font-medium text-[#0b57d0] hover:underline block pt-1 cursor-pointer"
                    >
                      Forgot email?
                    </button>

                    <p className="text-xs text-[#444746] pt-4 leading-relaxed">
                      To continue, Google will share your name, email address, language preference, and profile picture with Windervale.
                    </p>

                    <div className="pt-6 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setOauthModalOpen(false)}
                        className="text-sm font-medium text-[#0b57d0] hover:bg-[#f8fafd] px-4 py-2 rounded-full cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!oauthEmail.trim()}
                        className="bg-[#0b57d0] hover:bg-[#0842a0] disabled:opacity-50 text-white font-medium text-sm rounded-full px-7 py-2.5 cursor-pointer shadow-sm transition-all"
                      >
                        Next
                      </button>
                    </div>
                  </form>
                ) : (
                  /* STEP 2: GOOGLE PASSWORD ENTRY */
                  <form onSubmit={handleOAuthFinalSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-normal text-[#1f1f1f] tracking-tight">Welcome</h2>
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setOauthStep('email')}
                          className="inline-flex items-center gap-2 border border-[#dadce0] rounded-full px-3 py-1 text-xs text-[#444746] hover:bg-gray-50 transition-colors"
                        >
                          <span className="w-4 h-4 rounded-full bg-[#0b57d0] text-white flex items-center justify-center text-[9px] font-bold">
                            {oauthEmail.charAt(0).toUpperCase()}
                          </span>
                          <span className="font-medium text-xs truncate max-w-[200px]">{oauthEmail}</span>
                          <svg className="w-3 h-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="pt-4 space-y-1.5">
                      <label className="block text-xs font-medium text-[#444746]">
                        Enter your password
                      </label>
                      <div className="relative">
                        <input
                          type={showOauthPassword ? 'text' : 'password'}
                          autoFocus
                          required
                          value={oauthPassword}
                          onChange={(e) => { setOauthPassword(e.target.value); setOauthError(null); }}
                          placeholder="Password"
                          className="w-full px-3.5 py-3 pr-10 rounded-lg border border-[#747775] text-[#1f1f1f] text-base focus:border-[#0b57d0] focus:ring-1 focus:ring-[#0b57d0] outline-none transition-all placeholder-gray-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowOauthPassword(!showOauthPassword)}
                          className="absolute right-3 top-3.5 text-gray-500 hover:text-black cursor-pointer"
                        >
                          {showOauthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {oauthError && (
                        <p className="text-xs text-[#b3261e] pt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 inline shrink-0" /> {oauthError}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="showGooglePassword"
                        checked={showOauthPassword}
                        onChange={(e) => setShowOauthPassword(e.target.checked)}
                        className="rounded border-gray-400 text-[#0b57d0] focus:ring-[#0b57d0] cursor-pointer"
                      />
                      <label htmlFor="showGooglePassword" className="text-xs text-[#444746] cursor-pointer select-none">
                        Show password
                      </label>
                    </div>

                    <button
                      type="button"
                      className="text-xs font-medium text-[#0b57d0] hover:underline block pt-2 cursor-pointer"
                    >
                      Forgot password?
                    </button>

                    <div className="pt-6 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setOauthStep('email')}
                        className="text-sm font-medium text-[#0b57d0] hover:bg-[#f8fafd] px-4 py-2 rounded-full cursor-pointer transition-colors"
                      >
                        &larr; Back
                      </button>
                      <button
                        type="submit"
                        disabled={oauthLoading || !oauthPassword.trim()}
                        className="bg-[#0b57d0] hover:bg-[#0842a0] disabled:opacity-50 text-white font-medium text-sm rounded-full px-7 py-2.5 cursor-pointer shadow-sm transition-all flex items-center gap-2"
                      >
                        <span>{oauthLoading ? 'Verifying...' : 'Next'}</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : (
              /* =======================================================
                 AUTHENTIC APPLE ID SIGN-IN MODAL
                 ======================================================= */
              <div className="w-full max-w-[420px] bg-white rounded-2xl border border-gray-200 p-7 sm:p-9 shadow-2xl relative font-sans text-left animate-editorial-fade text-black">
                {/* Header Row: Apple Logo & Close */}
                <div className="flex items-center justify-between pb-2">
                  <div className="w-full flex justify-center pl-6">
                    <svg className="w-8 h-8 fill-current" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.07-7.64-7.85-11.83-14.34-5.96-9.14-10.4-19.34-13.32-30.59-2.92-11.25-4.39-21.73-4.39-31.43 0-14.3 3.6-26.15 10.79-35.53 7.2-9.39 16.22-14.15 27.07-14.28 5.75 0 11.75 1.57 18 4.7 6.25 3.13 10.37 4.77 12.38 4.92 1.63-.26 5.86-1.89 12.69-4.89 6.83-3 12.98-4.32 18.45-3.96 14.13.78 25.13 5.85 33.02 15.22-11.64 7.07-17.3 16.73-17 28.98.3 9.4 3.99 17.26 11.06 23.59 7.07 6.33 15.35 10.05 24.84 11.16-2.18 6.53-4.68 13.06-7.5 19.59zM119.22 31.84c0-7.72 2.76-14.93 8.28-21.64 5.53-6.7 12.39-10.47 20.59-11.3 0 .98.05 1.83.16 2.54.1 2.22-.38 4.88-1.44 7.97-1.06 3.09-2.6 6.04-4.62 8.85-4.47 6.07-10.59 9.87-18.35 11.41-.66-4.63-2.2-9.43-4.62-17.83z"/>
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOauthModalOpen(false)}
                    className="p-1 text-gray-400 hover:text-black transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-center space-y-1 pb-4">
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-black">Sign in with Apple ID</h2>
                  <p className="text-xs text-gray-500">Use your Apple ID to sign in to Windervale.</p>
                </div>

                <form onSubmit={handleOAuthFinalSubmit} className="space-y-4">
                  {/* Apple style grouped inputs */}
                  <div className="rounded-xl border border-gray-300 overflow-hidden divide-y divide-gray-200">
                    <div>
                      <input
                        type="email"
                        required
                        autoFocus
                        value={oauthEmail}
                        onChange={(e) => { setOauthEmail(e.target.value); setOauthError(null); }}
                        placeholder="Apple ID"
                        className="w-full px-3.5 py-3 text-sm text-black outline-none bg-white placeholder-gray-400"
                      />
                    </div>
                    <div className="relative">
                      <input
                        type={showOauthPassword ? 'text' : 'password'}
                        required
                        value={oauthPassword}
                        onChange={(e) => { setOauthPassword(e.target.value); setOauthError(null); }}
                        placeholder="Password"
                        className="w-full px-3.5 py-3 pr-10 text-sm text-black outline-none bg-white placeholder-gray-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOauthPassword(!showOauthPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showOauthPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {oauthError && (
                    <p className="text-xs text-red-600 pt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 inline shrink-0" /> {oauthError}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-600 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={oauthKeepSignedIn}
                        onChange={(e) => setOauthKeepSignedIn(e.target.checked)}
                        className="rounded border-gray-300 text-black focus:ring-black cursor-pointer"
                      />
                      <span>Keep me signed in</span>
                    </label>
                    <button type="button" className="text-blue-600 hover:underline cursor-pointer">
                      Forgot Apple ID?
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-500 text-center leading-relaxed pt-2">
                    Your Apple ID information is used to enable you to sign in securely.
                  </p>

                  <div className="pt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setOauthModalOpen(false)}
                      className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 cursor-pointer text-center transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={oauthLoading || !oauthEmail.trim() || !oauthPassword.trim()}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-black hover:bg-black/90 disabled:opacity-50 text-white text-sm font-medium cursor-pointer shadow text-center flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>{oauthLoading ? 'Verifying...' : 'Continue'}</span>
                      {!oauthLoading && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
