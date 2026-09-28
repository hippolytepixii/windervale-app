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
  const [oauthEmail, setOauthEmail] = useState('');
  const [oauthName, setOauthName] = useState('');

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
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>(['Filmmaker']);
  const [selectedMediums, setSelectedMediums] = useState<string[]>(['16mm Film']);
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
      if (selectedDisciplines.length > 1) {
        setSelectedDisciplines(selectedDisciplines.filter(x => x !== d));
      }
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
    if (selectedDisciplines.length > 1) {
      setSelectedDisciplines(selectedDisciplines.filter((x) => x !== d));
    }
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
    if (provider === 'google') {
      setOauthEmail(email || loginEmail || 'maya.rao@gmail.com');
      setOauthName(name || 'Maya Rao');
    } else {
      setOauthEmail(email || loginEmail || 'maya.rao@icloud.com');
      setOauthName(name || 'Maya Rao');
    }
    setOauthModalOpen(true);
  };

  const handleOAuthSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!oauthEmail.trim()) {
      setError('Please provide an email address for your creative identity.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await oauthLogin(oauthProvider, {
        email: oauthEmail.trim().toLowerCase(),
        name: oauthName.trim() || undefined,
      });
      setOauthModalOpen(false);
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Social authentication protocol failed');
    } finally {
      setLoading(false);
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
            APPLICATION
          </span>
        </div>

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
                <span className="px-2 font-mono text-[9px] uppercase tracking-wider text-black/50">
                  or register with email
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
                <span>Portrait &amp; ID</span>
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
                <span>Practice &amp; Reel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: PRACTICE, MEDIUMS & PORTFOLIO */}
        {step === 'practice' && (
          <div className="space-y-4 animate-editorial-fade">
            <div className="space-y-1">
              <h2 className="font-fun font-bold text-2xl text-black leading-tight lowercase">
                practice &amp; portfolio
              </h2>
              <p className="font-fun italic text-xs text-black/75 leading-snug">
                Select your artistic disciplines, physical mediums, and past archive link.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block font-arthouse text-[10px] uppercase font-bold tracking-wider text-black mb-1.5">
                  Disciplines ({selectedDisciplines.length})
                </label>
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
                onClick={handleAdvanceFromPractice}
                className="py-2.5 px-5 bg-black hover:bg-[#6A1A4C] text-white font-arthouse font-bold text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
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
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#fbf6f0] border-[2.5px] border-black p-6 shadow-2xl relative animate-editorial-fade">
              <div className="flex items-center justify-between border-b-[2px] border-black pb-3 mb-4 font-mono text-[10px]">
                <span className="font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
                  {oauthProvider === 'google' ? 'GOOGLE CREATIVE AUTHENTICATION' : 'APPLE CREATIVE AUTHENTICATION'}
                </span>
                <button
                  type="button"
                  onClick={() => setOauthModalOpen(false)}
                  className="p-1 hover:bg-black hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1 mb-4">
                <h3 className="font-fun font-bold text-xl text-black lowercase">
                  authorize practitioner profile
                </h3>
                <p className="font-fun italic text-xs text-black/75">
                  Single sign-on authorization protocol for {oauthProvider === 'google' ? 'Google Account' : 'Apple ID'}.
                </p>
              </div>

              <form onSubmit={handleOAuthSubmit} className="space-y-3">
                <div>
                  <label className="block font-arthouse text-[10px] font-bold uppercase tracking-wider text-black mb-1">
                    Practitioner Name
                  </label>
                  <input
                    type="text"
                    required
                    value={oauthName}
                    onChange={(e) => setOauthName(e.target.value)}
                    placeholder="e.g. Clara Vance"
                    className="w-full bg-white border-[2px] border-black px-3 py-2 text-sm text-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-arthouse text-[10px] font-bold uppercase tracking-wider text-black mb-1">
                    {oauthProvider === 'google' ? 'Google Account Email' : 'Apple ID Email'}
                  </label>
                  <input
                    type="email"
                    required
                    value={oauthEmail}
                    onChange={(e) => setOauthEmail(e.target.value)}
                    placeholder={oauthProvider === 'google' ? 'clara@gmail.com' : 'clara@icloud.com'}
                    className="w-full bg-white border-[2px] border-black px-3 py-2 text-sm text-black focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-black/60 block mb-1.5">
                    Quick Select Archetypes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (oauthProvider === 'google') {
                          setOauthName('Clara Vance');
                          setOauthEmail('clara.vance@gmail.com');
                        } else {
                          setOauthName('Julian Rost');
                          setOauthEmail('julian.rost@icloud.com');
                        }
                      }}
                      className="px-2 py-1 text-[10px] font-mono bg-white border-[1.5px] border-black hover:bg-[#6A1A4C] hover:text-white transition-colors cursor-pointer"
                    >
                      {oauthProvider === 'google' ? 'Clara Vance (Google)' : 'Julian Rost (Apple)'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (oauthProvider === 'google') {
                          setOauthName('Maya Rao');
                          setOauthEmail('maya.rao@cinema-lab.org');
                        } else {
                          setOauthName('Aarav Mehta');
                          setOauthEmail('aarav.mehta@appleid.com');
                        }
                      }}
                      className="px-2 py-1 text-[10px] font-mono bg-white border-[1.5px] border-black hover:bg-[#6A1A4C] hover:text-white transition-colors cursor-pointer"
                    >
                      {oauthProvider === 'google' ? 'Maya Rao (Director)' : 'Aarav Mehta (Cinematographer)'}
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t-[2px] border-black flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setOauthModalOpen(false)}
                    className="font-mono text-xs text-black/70 hover:text-black font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !oauthEmail.trim()}
                    className="py-2.5 px-5 bg-black hover:bg-[#6A1A4C] text-white font-arthouse font-bold text-xs tracking-wider uppercase disabled:opacity-40 flex items-center gap-2 cursor-pointer"
                  >
                    <span>{loading ? 'Authenticating...' : `Authorize with ${oauthProvider === 'google' ? 'Google' : 'Apple'} \u2192`}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
