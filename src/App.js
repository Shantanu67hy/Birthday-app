import React, { useState, useEffect, useRef } from 'react';
import { Heart, Calendar, Image, MessageCircle, Cake, Sparkles, Music } from 'lucide-react';
import emailjs from '@emailjs/browser';

export default function BirthdayCountdown() {
  const [currentPage, setCurrentPage] = useState('countdown');
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isBirthday, setIsBirthday] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [visibleWishes, setVisibleWishes] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [emailSent, setEmailSent] = useState(false);
  const [showCakeCutting, setShowCakeCutting] = useState(false);
  const audioRef = useRef(null);
  
  // ===== EMAIL CONFIGURATION =====
  // Replace these with your EmailJS credentials from https://www.emailjs.com/
   const EMAIL_CONFIG = {
    serviceId: 'service_wg9qztg',        // e.g., 'service_abc123'
    templateId: 'template_njdveuk',      // e.g., 'template_xyz789'
    publicKey: 'LmBn5cJbZk0veIDFZ',        // e.g., 'abcdef123456'
    recipientEmail: 'shreyasharma.21022003@gmail.com',  // Birthday person's email
    websiteLink: 'google.com',  // Your deployed app URL
    recipientName: 'Shreyaa'               // Birthday person's name
  };
  // Set your birthday here (Month is 0-indexed: 0=January, 11=December)
  const birthdayDate = new Date(2026, 1, 18, 11, 42, 0); // March 15, 2026 at midnight
  
  // Sample photos - replace with your own image URLs
   const photos = [
    "/images/image1.jpeg",
    "/images/image2.jpeg",
    "/images/image3.jpeg",
    "/images/image4.jpeg",
    "/images/image5.jpeg",
    "/images/image6.jpeg",
    "/images/image7.jpeg",
    "/images/image8.jpeg",
    "/images/image9.jpeg",
    "/images/image10.jpeg"
  ];
  
  const wishes = [
    "🎈 Wishing you the happiest of birthdays!",
    "✨ May all your dreams come true this year!",
    "🎂 Here's to another year of wonderful memories!",
    "🌟 You deserve all the love and happiness today!",
    "🎉 Celebrating you and all that you are!",
    "💝 You make the world brighter just by being in it!",
    "🎁 May this year bring you endless joy!",
    "🌈 Happy Birthday to someone truly special!",
    "❤️Love you Potaaato"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = birthdayDate.getTime() - now;

      // Check if we're 5 minutes before birthday and haven't sent email yet
      const fiveMinutesInMs = 5 * 60 * 1000;
      if (distance <= fiveMinutesInMs && distance > 0 && !emailSent) {
        sendBirthdayEmail();
        setEmailSent(true);
      }

      if (distance < 0) {
        setIsBirthday(true);
        
        // Show cake cutting animation first
        if (!showCakeCutting) {
          setShowCakeCutting(true);
          
          // Try to play music immediately when cake animation starts
          if (audioRef.current && !isPlaying) {
            // First attempt: Try to play directly
            audioRef.current.play().then(() => {
              setIsPlaying(true);
              console.log('Music playing! 🎵');
            }).catch(() => {
              // If blocked, music will play when user interacts with page
              console.log('Autoplay blocked, music will play on first user interaction');
            });
          }
          
          // After 4 seconds, hide cake animation and show celebration
          setTimeout(() => {
            setShowCakeCutting(false);
            
            // Try to play music again if it hasn't started yet
            if (audioRef.current && !isPlaying) {
              audioRef.current.play().then(() => {
                setIsPlaying(true);
              }).catch(() => {
                // Silent fail
              });
            }
            
            // Auto-navigate to wishes page after 3 more seconds
            setTimeout(() => {
              setCurrentPage('wishes');
            }, 3000);
          }, 4000);
        }
        
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, emailSent]);

  // Play music immediately on page load if birthday has already passed
  useEffect(() => {
    const now = new Date().getTime();
    const distance = birthdayDate.getTime() - now;
    
    if (distance < 0 && !isPlaying && audioRef.current) {
      // Birthday has passed, try to play music
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.log('Autoplay blocked, will play after user interaction');
      });
    }
  }, []);

  // Enable autoplay by capturing any user interaction before countdown ends
  useEffect(() => {
    const enableAutoplay = () => {
      if (audioRef.current && !isPlaying) {
        // Prepare audio for autoplay by playing and immediately pausing
        audioRef.current.play().then(() => {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          console.log('Audio primed for autoplay! 🎵');
        }).catch(() => {
          // Ignore error
        });
      }
    };

    // Listen for ANY user interaction (click, touch, key press)
    window.addEventListener('click', enableAutoplay, { once: true });
    window.addEventListener('touchstart', enableAutoplay, { once: true });
    window.addEventListener('keydown', enableAutoplay, { once: true });

    return () => {
      window.removeEventListener('click', enableAutoplay);
      window.removeEventListener('touchstart', enableAutoplay);
      window.removeEventListener('keydown', enableAutoplay);
    };
  }, [isPlaying]);

  // Function to send birthday email
  const sendBirthdayEmail = async () => {
    try {
      const templateParams = {
        to_email: EMAIL_CONFIG.recipientEmail,
        to_name: EMAIL_CONFIG.recipientName,
        website_link: EMAIL_CONFIG.websiteLink,
        message: `Hey ${EMAIL_CONFIG.recipientName}! 🎉 Your special day is just 5 minutes away! We have something amazing prepared for you. Click the link below to see your birthday surprise!`
      };

      await emailjs.send(
        EMAIL_CONFIG.serviceId,
        EMAIL_CONFIG.templateId,
        templateParams,
        EMAIL_CONFIG.publicKey
      );

      console.log('Birthday notification email sent successfully! 🎉');
    } catch (error) {
      console.error('Failed to send birthday email:', error);
      // Don't show error to user - fail silently
    }
  };

  useEffect(() => {
    if (currentPage === 'slideshow' && isAutoPlay) {
      const interval = setInterval(() => {
        setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [currentPage, isAutoPlay]);

  // Sequential wishes loading
  useEffect(() => {
    if (currentPage === 'wishes') {
      setVisibleWishes(0);
      const interval = setInterval(() => {
        setVisibleWishes((prev) => {
          if (prev < wishes.length) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 600); // Show one wish every 600ms
      
      // Auto-navigate to slideshow after 20 seconds
      const navigationTimer = setTimeout(() => {
        setCurrentPage('slideshow');
      }, 20000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(navigationTimer);
      };
    }
  }, [currentPage]);

  // Keyboard controls for slideshow
  useEffect(() => {
    if (currentPage === 'slideshow') {
      const handleKeyDown = (e) => {
        if (e.key === 'ArrowLeft') {
          goToPrevPhoto();
        } else if (e.key === 'ArrowRight') {
          goToNextPhoto();
        } else if (e.key === ' ') {
          e.preventDefault();
          setIsAutoPlay(prev => !prev);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [currentPage, currentPhotoIndex]);

  const goToNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const goToPrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // Auto-rotate through pages every 10 seconds (starting from slideshow)
  useEffect(() => {
    // Only auto-rotate after birthday page
    if (currentPage === 'slideshow' || currentPage === 'message') {
      const pages = ['slideshow', 'message'];
      const interval = setInterval(() => {
        setCurrentPage((current) => {
          const currentIndex = pages.indexOf(current);
          const nextIndex = (currentIndex + 1) % pages.length;
          return pages[nextIndex];
        });
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [currentPage]);

  const CountdownPage = () => (
    <div className="page-content">
      {!isBirthday ? (
        <div className="countdown-display">
          {/* Flying ribbons background */}
          <div className="ribbons-container">
            {[...Array(30)].map((_, i) => (
              <div 
                key={i} 
                className="ribbon" 
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${8 + Math.random() * 4}s`,
                  backgroundColor: ['#ff6b9d', '#ffd93d', '#6bcf7f', '#4ecdc4', '#a78bfa', '#ff9ff3'][Math.floor(Math.random() * 6)]
                }}
              />
            ))}
          </div>
          
          <div className="countdown-messages">
            <h2 className="exciting-message">✨ Something Special Awaits You ✨</h2>
            <p className="countdown-subtitle">Get ready for an unforgettable celebration!</p>
          </div>
          
          <div className="countdown-card">
            <div className="countdown-numbers">
              <div className="time-unit">
                <div className="time-value">{timeLeft.days}</div>
                <div className="time-text">DAYS</div>
              </div>
              <div className="time-unit">
                <div className="time-value">{timeLeft.hours}</div>
                <div className="time-text">HOURS</div>
              </div>
              <div className="time-unit">
                <div className="time-value">{timeLeft.minutes}</div>
                <div className="time-text">MINUTES</div>
              </div>
              <div className="time-unit">
                <div className="time-value">{timeLeft.seconds}</div>
                <div className="time-text">SECONDS</div>
              </div>
            </div>
          </div>
          
          <div className="anticipation-message">
            <p className="anticipation-text">🎁 A magical surprise is coming your way! 🎁</p>
          </div>
        </div>
      ) : showCakeCutting ? (
        <div className="cake-cutting-animation">
          <div className="cake-container">
            {/* Birthday Cake */}
            <div className="cake">
              {/* Cake layers */}
              <div className="cake-layer cake-layer-3"></div>
              <div className="cake-layer cake-layer-2"></div>
              <div className="cake-layer cake-layer-1"></div>
              
              {/* Candles */}
              <div className="candles">
                <div className="candle">
                  <div className="flame"></div>
                  <div className="wick"></div>
                </div>
                <div className="candle candle-2">
                  <div className="flame"></div>
                  <div className="wick"></div>
                </div>
                <div className="candle candle-3">
                  <div className="flame"></div>
                  <div className="wick"></div>
                </div>
              </div>
            </div>
            
            {/* Knife cutting animation */}
            <div className="knife"></div>
            
            {/* Text */}
            <h2 className="cake-text">🎂 Time to Celebrate! 🎂</h2>
          </div>
          
          {/* Sparkles around cake */}
          <div className="sparkles-container">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className="sparkle-particle" 
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              >✨</div>
            ))}
          </div>
        </div>
      ) : (
        <div className="birthday-celebration">
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div key={i} className="confetti" style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: ['#ff6b9d', '#ffd93d', '#6bcf7f', '#4ecdc4', '#a78bfa'][Math.floor(Math.random() * 5)]
              }} />
            ))}
          </div>
          <h2 className="birthday-title">🎉 Happy Birthday Shreyaa! 🎉</h2>
          <p className="birthday-message">It's finally here! Your special day has arrived!</p>
        </div>
      )}
    </div>
  );

  const WishesPage = () => (
    <div className="page-content wishes-page">
      {/* Fireworks animation */}
      <div className="fireworks-container">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="firework" style={{
            left: `${10 + Math.random() * 80}%`,
            top: `${10 + Math.random() * 60}%`,
            animationDelay: `${Math.random() * 3}s`
          }}>
            <div className="firework-spark"></div>
            <div className="firework-spark"></div>
            <div className="firework-spark"></div>
            <div className="firework-spark"></div>
            <div className="firework-spark"></div>
            <div className="firework-spark"></div>
          </div>
        ))}
      </div>
      
      <div className="wishes-header">
        <Heart className="icon-large" />
        <h1 className="main-title birthday-wishes-title">🎂 Happy Birthday! 🎂</h1>
        <p className="subtitle">Wishing you all the best!</p>
      </div>
      <div className="wishes-grid">
        {wishes.slice(0, visibleWishes).map((wish, index) => (
          <div key={index} className="wish-card wish-appear">
            <p className="wish-text">{wish}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const SlideshowPage = () => (
    <div className="page-content">
      <div className="slideshow-header">
        <Image className="icon-large" />
        <h1 className="main-title">Memory Lane</h1>
      </div>
      <div className="slideshow-container">
        <button className="slideshow-nav-btn prev-btn" onClick={goToPrevPhoto}>
          ←
        </button>
        
        <div className="slideshow-image-wrapper">
          <img 
            src={photos[currentPhotoIndex]} 
            alt={`Memory ${currentPhotoIndex + 1}`}
            className="slideshow-image"
            key={currentPhotoIndex}
          />
        </div>
        
        <button className="slideshow-nav-btn next-btn" onClick={goToNextPhoto}>
          →
        </button>
        
        <div className="slideshow-controls">
          <button 
            className="control-btn" 
            onClick={() => setIsAutoPlay(!isAutoPlay)}
          >
            {isAutoPlay ? '⏸ Pause' : '▶ Play'}
          </button>
          <div className="slideshow-counter">
            {currentPhotoIndex + 1} / {photos.length}
          </div>
        </div>
        
        <div className="slideshow-dots">
          {photos.map((_, index) => (
            <div 
              key={index} 
              className={`dot ${index === currentPhotoIndex ? 'active' : ''}`}
              onClick={() => setCurrentPhotoIndex(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const MessagePage = () => (
    <div className="page-content">
      <div className="message-container">
        <Sparkles className="icon-large sparkle" />
        <h1 className="main-title">A Special Message</h1>
        <div className="message-card">
          <p className="message-text">
            On this special day, I want you to know how truly wonderful you are. 
            Your presence lights up every room, and your smile brings joy to everyone around you.
          </p>
          <p className="message-text">
            May this year bring you countless moments of happiness, new adventures, 
            and dreams coming true. You deserve all the love and celebration today and always.
          </p>
          <p className="message-text">
            Thank you for being you. Here's to another amazing year of life, laughter, 
            and unforgettable memories together!
          </p>
          <p className="message-signature">
            With all my love ❤️
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-container">
      <audio ref={audioRef} loop autoPlay muted={false}>
        <source src="/music.mp3" type="audio/mpeg" />
      </audio>
      
      <div className="background-animation" />
      
      <nav className="navigation">
        <button 
          className={`nav-button ${currentPage === 'countdown' ? 'active' : ''}`}
          onClick={() => setCurrentPage('countdown')}
        >
          <Calendar size={20} />
          <span>Countdown</span>
        </button>
        {isBirthday && (
          <>
            <button 
              className={`nav-button ${currentPage === 'wishes' ? 'active' : ''}`}
              onClick={() => setCurrentPage('wishes')}
            >
              <Heart size={20} />
              <span>Wishes</span>
            </button>
            <button 
              className={`nav-button ${currentPage === 'slideshow' ? 'active' : ''}`}
              onClick={() => setCurrentPage('slideshow')}
            >
              <Image size={20} />
              <span>Photos</span>
            </button>
            <button 
              className={`nav-button ${currentPage === 'message' ? 'active' : ''}`}
              onClick={() => setCurrentPage('message')}
            >
              <MessageCircle size={20} />
              <span>Message</span>
            </button>
          </>
        )}
      </nav>

      <main className="main-content">
        {currentPage === 'countdown' && <CountdownPage />}
        {currentPage === 'wishes' && <WishesPage />}
        {currentPage === 'slideshow' && <SlideshowPage />}
        {currentPage === 'message' && <MessagePage />}
      </main>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
        }

        .background-animation {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 20% 50%, rgba(255, 107, 157, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255, 217, 61, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 90%, rgba(107, 207, 127, 0.3) 0%, transparent 50%);
          animation: backgroundShift 20s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes backgroundShift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(50px, -50px) scale(1.1); }
          66% { transform: translate(-50px, 50px) scale(0.9); }
        }

        .navigation {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.95);
          padding: 0.75rem;
          border-radius: 50px;
          backdrop-filter: blur(10px);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          z-index: 100;
        }

        .nav-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          background: transparent;
          color: #666;
          border-radius: 50px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .nav-button:hover {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          transform: translateY(-2px);
        }

        .nav-button.active {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
        }

        .main-content {
          padding: 3rem 2rem 8rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-content {
          animation: fadeInUp 0.6s ease-out;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .countdown-header {
          text-align: center;
          margin-bottom: 4rem;
          padding-top: 4rem;
        }

        .countdown-title {
          font-size: 2.5rem;
          font-weight: 400;
          color: rgba(100, 100, 120, 0.8);
          letter-spacing: 0.5px;
        }

        .countdown-display {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 500px;
          position: relative;
          gap: 2rem;
        }

        .ribbons-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
          z-index: 1;
        }

        .ribbon {
          position: absolute;
          width: 8px;
          height: 60px;
          top: -100px;
          opacity: 0.7;
          animation: ribbonFall linear infinite;
          transform-origin: center;
        }

        @keyframes ribbonFall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0.7;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0.3;
          }
        }

        .countdown-messages {
          text-align: center;
          z-index: 2;
          animation: fadeInDown 1s ease-out;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .exciting-message {
          font-size: 3rem;
          font-weight: 700;
          background: linear-gradient(135deg, #ff6b9d, #ffd93d, #6bcf7f, #4ecdc4, #a78bfa);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 3s ease infinite;
          margin-bottom: 1rem;
          text-shadow: 0 4px 20px rgba(255, 107, 157, 0.3);
          letter-spacing: 1px;
        }

        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .countdown-subtitle {
          font-size: 1.5rem;
          font-weight: 600;
          color: white;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          font-style: italic;
          letter-spacing: 0.5px;
        }

        .countdown-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 240, 255, 0.95) 100%);
          padding: 3rem 4rem;
          border-radius: 30px;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.5) inset;
          backdrop-filter: blur(10px);
          z-index: 2;
          animation: floatIn 1s ease-out 0.3s backwards;
        }

        @keyframes floatIn {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .anticipation-message {
          text-align: center;
          z-index: 2;
          animation: fadeInUp 1s ease-out 0.6s backwards;
        }

        .anticipation-text {
          font-size: 1.6rem;
          font-weight: 700;
          color: white;
          text-shadow: 0 3px 15px rgba(0, 0, 0, 0.4);
          animation: bounce 2s ease-in-out infinite;
          letter-spacing: 0.5px;
        }

        .countdown-numbers {
          display: flex;
          gap: 4rem;
          align-items: center;
        }

        .time-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .time-value {
          font-size: 6rem;
          font-weight: 300;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          min-width: 100px;
          text-align: center;
        }

        .time-text {
          font-size: 0.9rem;
          font-weight: 600;
          color: #667eea;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .wishes-header,
        .slideshow-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .wishes-page {
          position: relative;
        }

        .fireworks-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
        }

        .firework {
          position: absolute;
          width: 4px;
          height: 4px;
        }

        .firework-spark {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          animation: fireworkSpark 1.5s ease-out infinite;
        }

        .firework-spark:nth-child(1) {
          background: #ff6b9d;
          animation-delay: 0s;
        }

        .firework-spark:nth-child(2) {
          background: #ffd93d;
          animation-delay: 0.2s;
        }

        .firework-spark:nth-child(3) {
          background: #6bcf7f;
          animation-delay: 0.4s;
        }

        .firework-spark:nth-child(4) {
          background: #4ecdc4;
          animation-delay: 0.6s;
        }

        .firework-spark:nth-child(5) {
          background: #a78bfa;
          animation-delay: 0.8s;
        }

        .firework-spark:nth-child(6) {
          background: #ff9ff3;
          animation-delay: 1s;
        }

        @keyframes fireworkSpark {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(
              calc(var(--random-x, 50) * 1px),
              calc(var(--random-y, -50) * 1px)
            ) scale(0);
            opacity: 0;
          }
        }

        .firework-spark:nth-child(1) {
          --random-x: 60;
          --random-y: -60;
        }

        .firework-spark:nth-child(2) {
          --random-x: -40;
          --random-y: -70;
        }

        .firework-spark:nth-child(3) {
          --random-x: 30;
          --random-y: -50;
        }

        .firework-spark:nth-child(4) {
          --random-x: -60;
          --random-y: -40;
        }

        .firework-spark:nth-child(5) {
          --random-x: 50;
          --random-y: -80;
        }

        .firework-spark:nth-child(6) {
          --random-x: -30;
          --random-y: -65;
        }

        .birthday-wishes-title {
          animation: colorShift 18s ease-in-out infinite;
        }

        @keyframes colorShift {
          0%, 100% {
            text-shadow: 0 4px 20px rgba(255, 107, 157, 0.5);
          }
          50% {
            text-shadow: 0 4px 20px rgba(167, 139, 250, 0.5);
          }
        }

        .icon-large {
          width: 60px;
          height: 60px;
          color: white;
          margin-bottom: 1rem;
          filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.2));
        }

        .sparkle {
          animation: gentleRotate 8s linear infinite;
        }

        @keyframes gentleRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .main-title {
          font-size: 3.5rem;
          font-weight: 800;
          color: white;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          margin-bottom: 0.5rem;
          letter-spacing: -1px;
        }

        .subtitle {
          font-size: 1.3rem;
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
        }

        .birthday-celebration {
          text-align: center;
          position: relative;
          padding: 3rem 2rem;
        }

        /* Cake Cutting Animation Styles */
        .cake-cutting-animation {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: 70vh;
          position: relative;
          animation: fadeIn 0.5s ease-out;
        }

        .cake-container {
          position: relative;
          z-index: 10;
        }

        .cake {
          position: relative;
          width: 200px;
          height: 180px;
          margin: 0 auto 3rem;
          animation: cakeAppear 1s ease-out;
        }

        @keyframes cakeAppear {
          from {
            opacity: 0;
            transform: scale(0.5) translateY(50px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .cake-layer {
          position: absolute;
          width: 100%;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        }

        .cake-layer-1 {
          height: 60px;
          bottom: 0;
          background: linear-gradient(135deg, #ff6b9d, #ff8fab);
          border: 3px solid #ff5588;
        }

        .cake-layer-2 {
          height: 60px;
          bottom: 60px;
          background: linear-gradient(135deg, #ffd93d, #ffe066);
          border: 3px solid #ffcc00;
          width: 90%;
          left: 5%;
        }

        .cake-layer-3 {
          height: 60px;
          bottom: 120px;
          background: linear-gradient(135deg, #6bcf7f, #8fe09a);
          border: 3px solid #4ecdc4;
          width: 80%;
          left: 10%;
        }

        /* Candles */
        .candles {
          position: absolute;
          top: -40px;
          width: 100%;
          display: flex;
          justify-content: center;
          gap: 30px;
        }

        .candle {
          position: relative;
          width: 10px;
          height: 40px;
          background: linear-gradient(to bottom, #fff, #f0f0f0);
          border-radius: 2px;
          animation: candleFlicker 2s ease-in-out infinite;
        }

        .candle-2 {
          animation-delay: 0.3s;
        }

        .candle-3 {
          animation-delay: 0.6s;
        }

        @keyframes candleFlicker {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .wick {
          position: absolute;
          top: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 2px;
          height: 8px;
          background: #333;
        }

        .flame {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          width: 12px;
          height: 18px;
          background: radial-gradient(circle at 50% 80%, #ffd93d, #ff6b9d);
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          animation: flameFlicker 0.5s ease-in-out infinite;
        }

        @keyframes flameFlicker {
          0%, 100% {
            transform: translateX(-50%) scale(1) translateY(0);
            opacity: 1;
          }
          25% {
            transform: translateX(-50%) scale(1.1) translateY(-2px);
          }
          50% {
            transform: translateX(-50%) scale(0.95) translateY(1px);
            opacity: 0.9;
          }
          75% {
            transform: translateX(-50%) scale(1.05) translateY(-1px);
          }
        }

        /* Knife cutting animation */
        .knife {
          position: absolute;
          top: 50%;
          right: -80px;
          width: 100px;
          height: 8px;
          background: linear-gradient(to right, #c0c0c0 0%, #e0e0e0 30%, #888 100%);
          border-radius: 0 4px 4px 0;
          transform-origin: left center;
          animation: knifeSlice 4s ease-in-out;
          z-index: 20;
        }

        .knife::before {
          content: '';
          position: absolute;
          left: 0;
          top: -2px;
          width: 30px;
          height: 12px;
          background: #8b4513;
          border-radius: 4px 0 0 4px;
        }

        .knife::after {
          content: '';
          position: absolute;
          right: -20px;
          top: -8px;
          width: 0;
          height: 0;
          border-left: 25px solid #e0e0e0;
          border-top: 12px solid transparent;
          border-bottom: 12px solid transparent;
        }

        @keyframes knifeSlice {
          0% {
            right: -80px;
            transform: rotate(-45deg);
          }
          40% {
            right: -20px;
            transform: rotate(-10deg);
          }
          60% {
            right: 30px;
            transform: rotate(5deg);
          }
          80% {
            right: 50px;
            transform: rotate(10deg);
          }
          100% {
            right: -80px;
            transform: rotate(-45deg);
          }
        }

        .cake-text {
          font-size: 3rem;
          font-weight: 800;
          color: white;
          text-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          animation: textBounce 2s ease-in-out infinite;
          margin-top: 2rem;
        }

        @keyframes textBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* Sparkles around cake */
        .sparkles-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .sparkle-particle {
          position: absolute;
          font-size: 2rem;
          animation: sparkleFloat 2s ease-in-out infinite;
          opacity: 0;
        }

        @keyframes sparkleFloat {
          0%, 100% {
            opacity: 0;
            transform: scale(0) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.5) rotate(180deg);
          }
        }

        .confetti-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: hidden;
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          top: -10px;
          border-radius: 50%;
          animation: confettiFall 4s linear infinite;
        }

        @keyframes confettiFall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        .birthday-title {
          font-size: 4rem;
          font-weight: 900;
          color: white;
          text-shadow: 0 5px 30px rgba(0, 0, 0, 0.4);
          margin-bottom: 1rem;
          animation: bounce 1s ease-in-out infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        .birthday-message {
          font-size: 1.5rem;
          color: white;
          font-weight: 600;
        }

        .wishes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        .wish-card {
          background: rgba(255, 255, 255, 0.95);
          padding: 2rem;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }

        .wish-appear {
          animation: wishAppear 0.5s ease-out;
        }

        @keyframes wishAppear {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.9);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .wish-card:hover {
          transform: translateY(-10px) rotate(2deg);
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.2);
        }

        .wish-text {
          font-size: 1.2rem;
          color: #333;
          font-weight: 600;
          line-height: 1.6;
          text-align: center;
        }

        .slideshow-container {
          max-width: 800px;
          margin: 0 auto;
          position: relative;
        }

        .slideshow-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 255, 255, 0.9);
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
          transition: all 0.3s ease;
          color: #667eea;
          font-weight: bold;
        }

        .slideshow-nav-btn:hover {
          background: white;
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
        }

        .prev-btn {
          left: -70px;
        }

        .next-btn {
          right: -70px;
        }

        .slideshow-image-wrapper {
          border-radius: 30px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          aspect-ratio: 1/1;
          background: rgba(255, 255, 255, 0.1);
        }

        .slideshow-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          animation: fadeIn 0.8s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .slideshow-controls {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 2rem;
          margin-top: 1.5rem;
        }

        .control-btn {
          background: rgba(255, 255, 255, 0.9);
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          color: #667eea;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }

        .control-btn:hover {
          background: white;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
        }

        .slideshow-counter {
          background: rgba(255, 255, 255, 0.9);
          padding: 0.5rem 1.5rem;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          color: #667eea;
        }

        .slideshow-dots {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-top: 2rem;
        }

        .dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dot:hover {
          background: rgba(255, 255, 255, 0.7);
          transform: scale(1.2);
        }

        .dot.active {
          background: white;
          transform: scale(1.3);
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
        }

        .message-container {
          text-align: center;
          max-width: 700px;
          margin: 0 auto;
        }

        .message-card {
          background: rgba(255, 255, 255, 0.95);
          padding: 3rem;
          border-radius: 30px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          margin-top: 2rem;
          animation: fadeInUp 0.8s ease-out;
        }

        .message-text {
          font-size: 1.2rem;
          line-height: 1.8;
          color: #333;
          margin-bottom: 1.5rem;
          font-weight: 500;
        }

        .message-signature {
          font-size: 1.4rem;
          font-weight: 700;
          color: #667eea;
          margin-top: 2rem;
          font-style: italic;
        }

        @media (max-width: 768px) {
          .main-title {
            font-size: 2.5rem;
          }

          .exciting-message {
            font-size: 2rem;
          }

          .countdown-subtitle {
            font-size: 1.2rem;
          }

          .anticipation-text {
            font-size: 1.2rem;
            padding: 0 1rem;
          }

          .countdown-card {
            padding: 2rem;
          }

          .countdown-numbers {
            gap: 1.5rem;
          }

          .time-value {
            font-size: 3.5rem;
            min-width: 60px;
          }

          .time-text {
            font-size: 0.7rem;
          }

          .navigation {
            bottom: 1rem;
            width: calc(100% - 2rem);
            padding: 0.5rem;
          }

          .nav-button span {
            display: none;
          }

          .nav-button {
            padding: 0.75rem;
          }

          .wishes-grid {
            grid-template-columns: 1fr;
          }

          .birthday-title {
            font-size: 2.5rem;
          }

          .message-card {
            padding: 2rem;
          }

          .prev-btn {
            left: 10px;
          }

          .next-btn {
            right: 10px;
          }

          .slideshow-nav-btn {
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
          }

          .slideshow-controls {
            gap: 1rem;
          }

          .control-btn {
            padding: 0.6rem 1.5rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </div>
  );
}
