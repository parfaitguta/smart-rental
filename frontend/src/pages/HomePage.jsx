// frontend/src/pages/HomePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
  Search, CreditCard, MessageCircle, MapPin, Bed, Bath,
  ArrowRight, Star, Shield, Zap, TrendingUp, Users, Home as HomeIcon,
  CheckCircle, ChevronRight, Menu, X, Phone, Mail,
  Heart, UserCircle, Building, Crown, Moon, Sun
} from 'lucide-react';

// Helper function to format currency
const formatCurrency = (amount) => {
  if (!amount) return 'RWF 0';
  return `RWF ${Number(amount).toLocaleString()}`;
};

// Function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `https://smart-rental-cqr0.onrender.com${imagePath}`;
};

// Navbar Component with Role Selection and Dark Mode Toggle
function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    applyTheme(savedDarkMode);
  }, []);

  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.body.style.backgroundColor = '#111827';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#f3f4f6';
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
    applyTheme(newDarkMode);
  };

  const handleRoleSelect = (role) => {
    setShowRoleModal(false);
    if (role === 'admin') {
      navigate('/admin-login');
    } else if (role === 'landlord') {
      navigate('/login?role=landlord');
    } else {
      navigate('/login?role=renter');
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const navbarBgClass = darkMode ? 'bg-gray-900 border-gray-800' : 'bg-white/95 backdrop-blur-md border-gray-100';
  const textColorClass = darkMode ? 'text-gray-200' : 'text-gray-600';
  const hoverTextClass = darkMode ? 'hover:text-blue-400' : 'hover:text-blue-600';
  const mobileMenuBgClass = darkMode ? 'bg-gray-900' : 'bg-white';
  const modalBgClass = darkMode ? 'bg-gray-800' : 'bg-white';
  const modalTextClass = darkMode ? 'text-white' : 'text-gray-900';
  const modalSubtextClass = darkMode ? 'text-gray-400' : 'text-gray-500';
  const roleButtonBgClass = darkMode ? 'hover:bg-blue-900/30' : 'hover:bg-blue-50';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 shadow-sm border-b ${navbarBgClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <HomeIcon className="h-8 w-8 text-blue-600" />
              <span className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Smart<span className="text-blue-600">Rental</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/search" className={`${textColorClass} ${hoverTextClass} transition-colors font-medium`}>
                Browse Properties
              </Link>
              <Link to="/about" className={`${textColorClass} ${hoverTextClass} transition-colors font-medium`}>
                About
              </Link>
              <Link to="/contact" className={`${textColorClass} ${hoverTextClass} transition-colors font-medium`}>
                Contact
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-3">
              {/* Dark Mode Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {user ? (
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Welcome, {user.full_name?.split(' ')[0]}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => setShowRoleModal(true)}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
                  >
                    <UserCircle size={16} />
                    Sign In
                  </button>
                  <Link
                    to="/register"
                    className={`border border-blue-600 text-blue-600 px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition ${darkMode ? 'hover:bg-blue-900' : ''}`}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 md:hidden">
              {/* Mobile Dark Mode Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode 
                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-lg transition ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className={`md:hidden ${mobileMenuBgClass} border-t ${darkMode ? 'border-gray-800' : 'border-gray-100'} py-4 px-4`}>
            <div className="flex flex-col gap-3">
              <Link to="/search" className={`${textColorClass} ${hoverTextClass} py-2`} onClick={() => setIsMenuOpen(false)}>
                Browse Properties
              </Link>
              <Link to="/about" className={`${textColorClass} ${hoverTextClass} py-2`} onClick={() => setIsMenuOpen(false)}>
                About
              </Link>
              <Link to="/contact" className={`${textColorClass} ${hoverTextClass} py-2`} onClick={() => setIsMenuOpen(false)}>
                Contact
              </Link>
              {!user && (
                <>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      setShowRoleModal(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-center"
                  >
                    Sign In
                  </button>
                  <Link
                    to="/register"
                    className="border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Role Selection Modal with Dark Mode */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`${modalBgClass} rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl`}>
            <div className="text-center mb-6">
              <div className={`w-16 h-16 ${darkMode ? 'bg-blue-900' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <UserCircle className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <h3 className={`text-xl font-bold ${modalTextClass}`}>Select Your Role</h3>
              <p className={`${modalSubtextClass} text-sm mt-1`}>Choose how you want to sign in</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => handleRoleSelect('renter')}
                className={`w-full flex items-center gap-4 p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl ${roleButtonBgClass} transition-all group`}
              >
                <div className={`w-12 h-12 ${darkMode ? 'bg-green-900' : 'bg-green-100'} rounded-full flex items-center justify-center group-hover:${darkMode ? 'bg-green-800' : 'bg-green-200'} transition`}>
                  <HomeIcon className={`h-6 w-6 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className={`font-bold ${modalTextClass}`}>Renter</div>
                  <div className={`text-xs ${modalSubtextClass}`}>Browse and rent properties</div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
              </button>

              <button
                onClick={() => handleRoleSelect('landlord')}
                className={`w-full flex items-center gap-4 p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl ${roleButtonBgClass} transition-all group`}
              >
                <div className={`w-12 h-12 ${darkMode ? 'bg-purple-900' : 'bg-purple-100'} rounded-full flex items-center justify-center group-hover:${darkMode ? 'bg-purple-800' : 'bg-purple-200'} transition`}>
                  <Building className={`h-6 w-6 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className={`font-bold ${modalTextClass}`}>Landlord</div>
                  <div className={`text-xs ${modalSubtextClass}`}>List and manage properties</div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600" />
              </button>

              <button
                onClick={() => handleRoleSelect('admin')}
                className={`w-full flex items-center gap-4 p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-xl ${roleButtonBgClass} transition-all group`}
              >
                <div className={`w-12 h-12 ${darkMode ? 'bg-red-900' : 'bg-red-100'} rounded-full flex items-center justify-center group-hover:${darkMode ? 'bg-red-800' : 'bg-red-200'} transition`}>
                  <Crown className={`h-6 w-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className={`font-bold ${modalTextClass}`}>Administrator</div>
                  <div className={`text-xs ${modalSubtextClass}`}>System Admin Portal</div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-red-600" />
              </button>
            </div>

            <button
              onClick={() => setShowRoleModal(false)}
              className={`w-full mt-4 ${modalSubtextClass} text-sm py-2 hover:${darkMode ? 'text-gray-300' : 'text-gray-700'} transition`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Animated Element Component
const AnimatedElement = ({ children, className, delay = 0 }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      setIsVisible(true);
      return;
    }

    const fallback = setTimeout(() => setIsVisible(true), 800 + delay);
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        clearTimeout(fallback);
        setTimeout(() => setIsVisible(true), delay);
        observer.unobserve(el);
      }
    }, { threshold: 0.05, rootMargin: "0px 0px 200px 0px" });

    observer.observe(el);
    return () => { observer.disconnect(); clearTimeout(fallback); };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"} ${className || ""}`}
    >
      {children}
    </div>
  );
};

// Hero Section (No changes needed - already has dark colors)
function HeroSection() {
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 pt-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900" />
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-yellow-500/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center mt-10">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-5 py-2 mb-8 border border-white/20">
            <span className="text-yellow-400 text-sm font-semibold">🏆 Rwanda's #1 Rental Platform</span>
          </div>

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-extrabold text-white tracking-tight leading-[1.05] mb-8">
            Find Your{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">Perfect Home</span>
              <div className="absolute bottom-2 left-0 right-0 h-4 bg-yellow-500/30 -z-0 skew-x-12" />
            </span>
            <br />in Rwanda
          </h1>

          <p className="text-xl sm:text-2xl text-white/80 mb-6 max-w-2xl mx-auto leading-relaxed font-medium">
            Discover thousands of properties across Kigali and Rwanda
          </p>

          <p className="text-base sm:text-lg text-white/60 mb-12 max-w-xl mx-auto">
            Rent properties easily with MTN MoMo and Airtel Money. Secure, fast, and completely digital.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link to={user ? "/search" : "/register"}>
              <button className="relative overflow-hidden bg-yellow-500 text-gray-900 hover:bg-yellow-400 font-bold px-10 py-4 text-lg rounded-2xl shadow-[0_0_40px_-10px_rgba(234,179,8,0.5)] hover:scale-105 active:scale-95 transition-all duration-300">
                <span className="relative flex items-center gap-2">
                  {user ? "Browse Properties" : "Get Started"} <ArrowRight className="h-5 w-5" />
                </span>
              </button>
            </Link>
          </div>

          <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
            {[
              { label: "Properties Listed", value: "2,500+" },
              { label: "Happy Tenants", value: "8,000+" },
              { label: "Districts Covered", value: "30+" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-extrabold text-yellow-400 mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Features Section with Dark Mode
function FeaturesSection() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBgClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const textColorClass = darkMode ? 'text-white' : 'text-gray-900';
  const descColorClass = darkMode ? 'text-gray-400' : 'text-gray-500';

  const features = [
    {
      icon: Search,
      title: "Find Properties",
      description: "Search thousands of properties across Rwanda with powerful filters — location, price, bedrooms, and more.",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500"
    },
    {
      icon: CreditCard,
      title: "Pay Online",
      description: "Pay rent instantly via MTN MoMo or Airtel Money. Secure, fast, and fully mobile — no bank visits needed.",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-500"
    },
    {
      icon: MessageCircle,
      title: "Chat with Landlord",
      description: "Direct messaging with property owners. Ask questions, schedule viewings, and negotiate terms — all in one place.",
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-500"
    }
  ];

  return (
    <section className={`py-32 relative ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedElement>
          <div className="text-center mb-20">
            <h2 className={`text-4xl sm:text-5xl font-extrabold ${textColorClass} tracking-tight mb-6`}>
              Why Choose Smart Rental?
            </h2>
            <p className={`${descColorClass} text-xl max-w-2xl mx-auto`}>
              We've redesigned the rental experience to be seamless, digital, and completely transparent.
            </p>
          </div>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <AnimatedElement key={i} delay={i * 150}>
              <div className={`group ${cardBgClass} border rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 cursor-pointer h-full`}>
                <div className="p-10 flex flex-col items-center text-center h-full">
                  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${f.iconBg} mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    <f.icon className={`h-10 w-10 ${f.iconColor}`} />
                  </div>
                  <h3 className={`text-2xl font-bold ${textColorClass} mb-4`}>{f.title}</h3>
                  <p className={`${descColorClass} text-base leading-relaxed`}>{f.description}</p>
                </div>
              </div>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
}

// Properties Section (keeps existing styling, dark mode supported via index.css)
function PropertiesSection() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await api.get('/properties?status=available&limit=6');
        const propertiesData = response.data.properties || [];
        
        const propertiesWithImages = await Promise.all(
          propertiesData.map(async (property) => {
            try {
              const imagesRes = await api.get(`/images/${property.id}`);
              const images = imagesRes.data.images || [];
              const primaryImage = images.find(img => img.is_primary === 1) || images[0];
              return {
                ...property,
                primaryImage: primaryImage?.image_url || null,
                imageCount: images.length
              };
            } catch (error) {
              return { ...property, primaryImage: null, imageCount: 0 };
            }
          })
        );
        
        setProperties(propertiesWithImages);
      } catch (error) {
        console.error('Error fetching properties:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  if (loading) {
    return (
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading properties...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedElement>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-sm font-semibold mb-4">
                🏠 Available Now
              </div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Featured Properties
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-4 text-xl">Hand-picked premium homes across Rwanda</p>
            </div>
            <Link to="/search">
              <button className="bg-blue-600 text-white hover:bg-blue-700 font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-blue-600/30 transition-all hover:scale-105 active:scale-95">
                View All <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </AnimatedElement>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property, i) => {
              const imageUrl = getImageUrl(property.primaryImage);
              return (
                <AnimatedElement key={property.id} delay={i * 100}>
                  <Link to={`/property/${property.id}`}>
                    <div className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-pointer flex flex-col h-full">
                      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-800">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/600x400/e5e7eb/9ca3af?text=🏠+No+Image';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-200 dark:bg-gray-700">
                            <HomeIcon size={48} className="mb-2" />
                            <span className="text-sm">No Image</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-80" />
                        <div className="absolute top-4 left-4 flex gap-2 z-10">
                          <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                            {property.type || 'Apartment'}
                          </span>
                          {property.imageCount > 0 && (
                            <span className="bg-black/50 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md flex items-center gap-1">
                              📸 {property.imageCount}
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-4 left-4 z-10">
                          <div className="text-white font-extrabold text-2xl drop-shadow-md">
                            {formatCurrency(property.price)} <span className="text-base font-semibold opacity-90">/mo</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-6 flex flex-col flex-grow">
                        <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">{property.title}</h3>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-6">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">{property.district}, {property.province}</span>
                        </div>
                        <div className="mt-auto grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-gray-700 pt-5">
                          <div className="flex flex-col items-center justify-center gap-1">
                            <Bed className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs font-bold text-gray-900 dark:text-white">{property.bedrooms || 0} Bed</span>
                          </div>
                          <div className="flex flex-col items-center justify-center gap-1 border-x border-gray-100 dark:border-gray-700">
                            <Bath className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs font-bold text-gray-900 dark:text-white">{property.bathrooms || 0} Bath</span>
                          </div>
                          <div className="flex flex-col items-center justify-center gap-1">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-xs font-bold text-green-600">Available</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </AnimatedElement>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
            <HomeIcon size={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No available properties at the moment.</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Check back soon for new listings!</p>
          </div>
        )}
      </div>
    </section>
  );
}

// How It Works Section with Dark Mode
function HowItWorksSection() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-white';
  const textColorClass = darkMode ? 'text-white' : 'text-gray-900';
  const descColorClass = darkMode ? 'text-gray-400' : 'text-gray-500';
  const stepBgClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-blue-200';

  const steps = [
    { icon: Search, step: "01", title: "Browse & Search", description: "Filter by location, budget, bedrooms, or property type to find your ideal home." },
    { icon: MessageCircle, step: "02", title: "Connect & View", description: "Message landlords directly, schedule visits, and ask any questions instantly." },
    { icon: CreditCard, step: "03", title: "Pay with MoMo", description: "Pay your deposit and rent securely via MTN MoMo or Airtel Money — anytime, anywhere." },
    { icon: HomeIcon, step: "04", title: "Move In", description: "Sign your lease digitally and get your keys. Welcome to your new home in Rwanda!" }
  ];

  return (
    <section className={`py-32 relative overflow-hidden ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <AnimatedElement>
          <div className="text-center mb-24">
            <h2 className={`text-4xl sm:text-5xl font-extrabold ${textColorClass} tracking-tight mb-6`}>
              How It Works
            </h2>
            <p className={`${descColorClass} text-xl max-w-2xl mx-auto`}>
              Four easy steps to secure your perfect rental property without the hassle.
            </p>
          </div>
        </AnimatedElement>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {steps.map((step, i) => (
            <AnimatedElement key={i} delay={i * 150}>
              <div className="group relative text-center">
                <div className={`relative inline-flex items-center justify-center w-24 h-24 rounded-3xl ${stepBgClass} border-2 mb-8 shadow-xl group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:-translate-y-2 transition-all duration-500`}>
                  <step.icon className="h-10 w-10 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-yellow-500 text-gray-900 text-sm font-extrabold flex items-center justify-center shadow-lg border-2 border-white">{step.step}</span>
                </div>
                <h3 className={`font-bold ${textColorClass} text-xl mb-3`}>{step.title}</h3>
                <p className={`${descColorClass} text-base leading-relaxed max-w-xs mx-auto`}>{step.description}</p>
              </div>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
}

// Payment Section with Dark Mode
function PaymentSection() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  const bgClass = darkMode ? 'bg-gray-800' : 'bg-gray-50';
  const textColorClass = darkMode ? 'text-white' : 'text-gray-900';
  const cardBgClass = darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-100';
  const descColorClass = darkMode ? 'text-gray-400' : 'text-gray-500';

  return (
    <section className={`py-32 relative overflow-hidden ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <AnimatedElement>
            <div>
              <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded-full px-3 py-1 text-sm font-semibold mb-6">
                Seamless Integration
              </div>
              <h2 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold ${textColorClass} tracking-tight mb-8 leading-[1.1]`}>
                Pay Rent with<br />
                <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">MTN MoMo & Airtel</span>
              </h2>
              <p className={`${descColorClass} text-xl mb-10 leading-relaxed`}>
                No more bank queues or cash handling. Pay your rent, deposit, and fees instantly using Rwanda's most popular mobile money platforms. It's secure, verifiable, and instant.
              </p>
              <ul className="space-y-5 mb-12">
                {[
                  "Instant payment confirmation via SMS & Email",
                  "Secure digital transaction history",
                  "Pay from anywhere, 24/7",
                  "Supported by MTN MoMo & Airtel Money"
                ].map((item, i) => (
                  <li key={i} className={`flex items-center gap-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'} text-lg font-medium`}>
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/search">
                <button className="bg-gray-900 dark:bg-gray-700 text-white hover:bg-gray-800 dark:hover:bg-gray-600 px-8 py-4 text-lg font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl flex items-center gap-3">
                  Start Renting <Zap className="h-5 w-5" />
                </button>
              </Link>
            </div>
          </AnimatedElement>

          <AnimatedElement delay={200}>
            <div className="relative w-full max-w-md mx-auto lg:ml-auto">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-yellow-500/30 rounded-[2.5rem] blur-3xl -z-10" />
              <div className={`${cardBgClass} border rounded-[2.5rem] p-8 shadow-2xl`}>
                <div className="flex items-center justify-between mb-8">
                  <h3 className={`font-bold ${textColorClass} text-xl`}>Recent Transactions</h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full">This Month</span>
                </div>
                <div className="space-y-5">
                  {[
                    { method: "MTN MoMo", amount: "450,000 RWF", status: "Paid", color: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300", iconColor: "text-green-500" },
                    { method: "Airtel Money", amount: "320,000 RWF", status: "Pending", color: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300", iconColor: "text-yellow-500" },
                    { method: "MTN MoMo", amount: "180,000 RWF", status: "Paid", color: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300", iconColor: "text-green-500" }
                  ].map((tx, i) => (
                    <div key={i} className={`flex items-center justify-between p-5 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'} border ${darkMode ? 'border-gray-700' : 'border-gray-100'} shadow-sm hover:shadow-md transition-shadow`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl ${cardBgClass} border ${darkMode ? 'border-gray-700' : 'border-gray-100'} flex items-center justify-center shadow-sm`}>
                          <CreditCard className={`h-6 w-6 ${tx.iconColor}`} />
                        </div>
                        <div>
                          <div className={`font-bold ${textColorClass} text-base`}>{tx.method}</div>
                          <div className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-sm font-medium`}>{tx.amount}</div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 font-bold text-xs rounded-lg ${tx.color}`}>{tx.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimatedElement>
        </div>
      </div>
    </section>
  );
}

// Testimonials Section with Dark Mode
function TestimonialsSection() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  const bgClass = darkMode ? 'bg-gray-900' : 'bg-white';
  const cardBgClass = darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100';
  const textColorClass = darkMode ? 'text-white' : 'text-gray-900';
  const contentColorClass = darkMode ? 'text-gray-300' : 'text-gray-700';

  const testimonials = [
    { id: 1, name: "Amina Uwimana", role: "Tenant — Kiyovu", content: "Smart Rental made finding my apartment so easy! I paid my deposit through MTN MoMo in seconds. No more carrying cash. Absolutely love this platform.", rating: 5 },
    { id: 2, name: "Jean-Pierre Habimana", role: "Landlord — Kimihurura", content: "I have managed my properties through Smart Rental for 8 months. The tenant messaging and Airtel Money payments make it a breeze. Highly recommended!", rating: 5 },
    { id: 3, name: "Grace Mukamana", role: "Tenant — Remera", content: "Finding a clean, affordable apartment in Kigali used to be stressful. Smart Rental showed me options I never knew existed and the mobile payments are perfect.", rating: 5 },
    { id: 4, name: "Patrick Nkurunziza", role: "Property Agent — Kacyiru", content: "The direct chat feature with tenants saves so much time. I close deals faster and the MoMo integration builds trust with clients immediately.", rating: 4 }
  ];

  return (
    <section className={`py-32 relative ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-6">
        <AnimatedElement>
          <div className="text-center mb-20">
            <h2 className={`text-4xl sm:text-5xl font-extrabold ${textColorClass} tracking-tight mb-6`}>
              Loved by Thousands
            </h2>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xl max-w-2xl mx-auto`}>
              Join 8,000+ tenants and landlords who trust Smart Rental for their housing needs.
            </p>
          </div>
        </AnimatedElement>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <AnimatedElement key={t.id} delay={i * 100}>
              <div className={`${cardBgClass} border rounded-[2rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 overflow-hidden h-full`}>
                <div className="p-8 lg:p-10 flex flex-col h-full">
                  <div className="flex gap-1.5 mb-6">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className={`h-5 w-5 ${j < (t.rating || 5) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 dark:text-gray-700"}`} />
                    ))}
                  </div>
                  <p className={`${contentColorClass} leading-relaxed mb-10 text-lg font-medium italic flex-grow`}>"{t.content}"</p>
                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                      <span className="text-blue-600 dark:text-blue-400 font-extrabold text-xl">{t.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <div className={`font-bold ${textColorClass} text-lg`}>{t.name}</div>
                      <div className="text-blue-600 dark:text-blue-400 font-medium">{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedElement>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section (no changes needed - already has gradient)
function CTASection() {
  const { user } = useAuth();

  return (
    <section className="bg-gradient-to-r from-blue-900 to-indigo-900 py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.1)_1px,_transparent_1px)] bg-[length:24px_24px] opacity-20" />
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <AnimatedElement>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-8">
            Ready to Get Started?
          </h2>
          <p className="text-white/70 text-xl sm:text-2xl mb-12 leading-relaxed max-w-2xl mx-auto font-medium">
            Join thousands of users already using Smart Rental to find their perfect home in Rwanda.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link to={user ? "/search" : "/register"}>
              <button className="bg-yellow-500 text-gray-900 hover:bg-yellow-400 font-bold px-10 py-4 text-lg rounded-2xl shadow-xl shadow-yellow-500/20 hover:scale-105 active:scale-95 transition-all duration-300 w-full sm:w-auto">
                {user ? "Browse Properties" : "Create Free Account"}
              </button>
            </Link>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
}

// Footer Section (no changes needed - already dark)
function FooterSection() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-xl mb-4">Smart Rental</h3>
            <p className="text-sm">Your trusted partner for finding the perfect home in Rwanda.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/search" className="hover:text-white transition-colors">Browse Properties</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Register</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Connect With Us</h4>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <span className="text-lg">📘</span>
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <span className="text-lg">🐦</span>
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <span className="text-lg">📸</span>
              </a>
              <a href="#" className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <span className="text-lg">🔗</span>
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; 2026 Smart Rental. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// Main Home Page Component
export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <PropertiesSection />
      <HowItWorksSection />
      <PaymentSection />
      <TestimonialsSection />
      <CTASection />
      <FooterSection />
    </div>
  );
}