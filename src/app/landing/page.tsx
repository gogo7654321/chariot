
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { FaGraduationCap, FaBook, FaLaptop, FaUsers, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

const useIsVisible = (ref: React.RefObject<HTMLElement>) => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
            setIntersecting(true);
            // No need to unobserve, we want it to re-trigger
        } else {
            setIntersecting(false);
        }
      },
      {
        threshold: 0.1,
      }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref]);

  return isIntersecting;
};

const useAnimatedCounter = (target: number, isVisible: boolean) => {
    const [count, setCount] = useState(0);
    const animationFrameRef = useRef<number>();
  
    useEffect(() => {
      if (isVisible) {
        let startTime: number | null = null;
        const duration = 3000;
  
        const easeInOutCubic = (t: number) =>
          t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  
        const animate = (timestamp: number) => {
          if (!startTime) startTime = timestamp;
          const elapsed = timestamp - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeInOutCubic(progress);
          
          setCount(Math.round(easedProgress * target));
  
          if (progress < 1) {
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        };
        
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(0);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
      }
      return () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
      }
    }, [isVisible, target]);
  
    return count;
  };


export default function LandingPage() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const passRateRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const coursesRef = useRef<HTMLDivElement>(null);

  const isStatsVisible = useIsVisible(passRateRef);
  const isFeaturesVisible = useIsVisible(featuresRef);
  const isCoursesVisible = useIsVisible(coursesRef);
  
  const animatedPassRateNational = useAnimatedCounter(60, isStatsVisible);
  const animatedPassRateApAce = useAnimatedCounter(92, isStatsVisible);
  const animatedScoring5National = useAnimatedCounter(20, isStatsVisible);
  const animatedScoring5ApAce = useAnimatedCounter(45, isStatsVisible);
  const animatedEfficiency = useAnimatedCounter(40, isStatsVisible);
  const animatedImprovementRate = useAnimatedCounter(96, isStatsVisible);
  const animatedLikelihood = useAnimatedCounter(2, isStatsVisible);
  const animatedStudentsHelped = useAnimatedCounter(50, isStatsVisible);

  useEffect(() => {
    // Force light theme for the landing page regardless of system/user preference
    document.documentElement.classList.remove('dark');
    
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const highSchoolLogos = [
    { name: "Sprayberry", src: "/images/highschools/sprayberry.png" },
    { name: "South Cobb", src: "/images/highschools/south cobb.png" },
    { name: "Pope", src: "/images/highschools/pope.png" },
    { name: "Pebblebrook", src: "/images/highschools/pebblebrook.png" },
    { name: "Osborne", src: "/images/highschools/osborne.png" },
    { name: "North Cobb", src: "/images/highschools/north cobb.png" },
    { name: "McEachern", src: "/images/highschools/mceachern.png" },
    { name: "Lassiter", src: "/images/highschools/lassiter.png" },
    { name: "Kennesaw", src: "/images/highschools/kennesaw.png" },
    { name: "Kell", src: "/images/highschools/kell.png" },
    { name: "Hillgrove", src: "/images/highschools/hillgrove.png" },
    { name: "Harrison", src: "/images/highschools/harrison.png" },
    { name: "Campbell", src: "/images/highschools/campbell.png" },
    { name: "Allatoona", src: "/images/highschools/allatoona.png" },
    { name: "Walton", src: "/images/highschools/walton.png" },
    { name: "Wheeler", src: "/images/highschools/wheeler.jpeg" },
  ];

  const popularCourses = [
    { name: "Calculus AB", icon: "/images/ap_calculus_ab.svg" },
    { name: "US History", icon: "/images/ap_united_states_history.svg" },
    { name: "English Language", icon: "/images/ap_english_language_and_composition.svg" },
    { name: "Psychology", icon: "/images/ap_psychology.svg" },
    { name: "Biology", icon: "/images/ap_biology.svg" },
    { name: "Statistics", icon: "/images/ap_statistics.svg" },
    { name: "World History", icon: "/images/ap_world_history_modern.svg" },
    { name: "Computer Science Principles", icon: "/images/ap_computer_science_principles.svg" }
  ];

  return (
    <div className="landing-container">
      <section className="hero-section">
        <div 
          className="parallax-bg" 
          style={{ 
            transform: `translateY(${scrollPosition * 0.5}px)`
          }}
        ></div>
        <div className="hero-content">
          <Image
            src="/images/logo.png" 
            alt="AP Ace© Logo"
            width={120}
            height={120}
            className="hero-logo"
            style={{ transform: `translateY(${-scrollPosition * 0.2}px)` }}
          />
          <h1 
            className="hero-title"
            style={{ transform: `translateY(${-scrollPosition * 0.1}px)` }}
          >
            Master Your AP Exams
          </h1>
          <p 
            className="hero-subtitle"
            style={{ transform: `translateY(${-scrollPosition * 0.05}px)` }}
          >
            Personalized study plans, practice tests, and resources to help you excel
          </p>
          <div className="hero-buttons">
            <Link href="/auth" className="cta-button">
              Get Started <FaArrowRight className="btn-icon" />
            </Link>
            <button className="secondary-button">Learn More</button>
          </div>
        </div>
        <div className="scroll-indicator">
          <span>Scroll Down</span>
          <div className="scroll-arrow"></div>
        </div>
      </section>

      <section className="pass-rate-section" ref={passRateRef}>
        <div className="section-header">
          <h2>See the Difference</h2>
          <div className="underline"></div>
          <p className="section-subheading">Our students consistently outperform national averages on AP exams</p>
        </div>
        
        <div className="graphs-container" data-visible={isStatsVisible}>
          <div className="graph-wrapper" style={{ transitionDelay: '0ms' }}>
            <div className="graph-card">
              <h3>AP Pass Rates</h3>
              <div className="graph-content">
                <div className="bar national">
                  <div className="bar-fill" style={{height: `${isStatsVisible ? 60 : 0}%`}}></div>
                  <span className="bar-value">{animatedPassRateNational}%</span>
                  <span className="bar-label">National Avg.</span>
                </div>
                <div className="bar ap-ace">
                  <div className="bar-fill" style={{height: `${isStatsVisible ? 92 : 0}%`}}></div>
                  <span className="bar-value">{animatedPassRateApAce}%</span>
                  <span className="bar-label">AP Ace<span className="copyright-symbol">&copy;</span> Users</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="graph-wrapper" style={{transitionDelay: '100ms'}}>
            <div className="graph-card">
              <h3>Students Scoring 5</h3>
              <div className="graph-content">
                <div className="bar national">
                  <div className="bar-fill" style={{height: `${isStatsVisible ? 20 : 0}%`}}></div>
                  <span className="bar-value">{animatedScoring5National}%</span>
                  <span className="bar-label">National Avg.</span>
                </div>
                <div className="bar ap-ace">
                  <div className="bar-fill" style={{height: `${isStatsVisible ? 45 : 0}%`}}></div>
                  <span className="bar-value">{animatedScoring5ApAce}%</span>
                  <span className="bar-label">AP Ace<span className="copyright-symbol">&copy;</span> Users</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="graph-wrapper" style={{transitionDelay: '200ms'}}>
            <div className="graph-card">
              <h3>Study Time Efficiency</h3>
              <div className="graph-content">
                <div className="circle-graph">
                  <div className="circle-inner">
                    <div className="percentage">{animatedEfficiency}%</div>
                    <div className="sub-text">Less Time</div>
                  </div>
                  <svg viewBox="0 0 120 120" className="circle-progress">
                    <circle r="52" cx="60" cy="60" className="circle-bg" />
                    <circle r="52" cx="60" cy="60" className="circle-value" strokeDasharray="326.7" style={{strokeDashoffset: 326.7 - (326.7 * (isStatsVisible ? 40 : 0) / 100) }} />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" className="gradient-start" />
                        <stop offset="100%" className="gradient-end" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="graph-caption">
                  <span>Our students achieve better results with 40% less study time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="stats-row" data-visible={isStatsVisible}>
          <div className="stat-item" style={{transitionDelay: '100ms'}}>
            <div className="stat-number counter">{animatedImprovementRate}%</div>
            <div className="stat-text">of our students improve their scores</div>
          </div>
          <div className="stat-item" style={{transitionDelay: '200ms'}}>
            <div className="stat-number counter">{animatedLikelihood}x</div>
            <div className="stat-text">more likely to score a 5</div>
          </div>
          <div className="stat-item" style={{transitionDelay: '300ms'}}>
            <div className="stat-number counter">{animatedStudentsHelped}k+</div>
            <div className="stat-text">students helped last year</div>
          </div>
        </div>
      </section>

      <section className="trusted-section">
        <div className="trusted-content">
          <h2>Used and trusted by schools all over the world!</h2>
        </div>
      </section>

      <section className="logo-marquee-section">
        <div className="logos">
          <div className="logos-slide">
            {[...highSchoolLogos, ...highSchoolLogos].map((logo, index) => (
              <Image key={`${logo.name}-${index}`} src={logo.src} alt={logo.name} width={150} height={100} />
            ))}
          </div>
        </div>
      </section>

      <section className="features-section" ref={featuresRef}>
        <div className="section-header">
          <h2>Why Choose AP Ace<span className="copyright-symbol">&copy;</span>?</h2>
          <div className="underline"></div>
        </div>

        <div className="features-grid" data-visible={isFeaturesVisible}>
          <div className="feature-card" style={{ transitionDelay: '0ms' }}>
            <div className="feature-icon"><FaGraduationCap /></div>
            <h3>Expert Content</h3>
            <p>Created by experienced AP teachers and exam scorers to align perfectly with exam requirements.</p>
          </div>
          <div className="feature-card" style={{ transitionDelay: '200ms' }}>
            <div className="feature-icon"><FaBook /></div>
            <h3>Comprehensive Resources</h3>
            <p>From detailed study guides to thousands of practice questions spanning all AP subjects.</p>
          </div>
          <div className="feature-card" style={{ transitionDelay: '400ms' }}>
            <div className="feature-icon"><FaLaptop /></div>
            <h3>Adaptive Learning</h3>
            <p>Our platform adjusts to your strengths and weaknesses to create personalized study plans.</p>
          </div>
          <div className="feature-card" style={{ transitionDelay: '600ms' }}>
            <div className="feature-icon"><FaUsers /></div>
            <h3>Community Support</h3>
            <p>Connect with other AP students and get help from our community of experienced tutors.</p>
          </div>
        </div>
      </section>

      <section className="product-showcase">
        <div className="showcase-container">
          <div className="showcase-item">
            <div className="showcase-content">
              <h2>Study Smarter, Not Harder</h2>
              <p>Our intelligent system identifies your knowledge gaps and creates a personalized study plan that focuses on what you need most.</p>
              <Link href="/classes" className="learn-more-link">
                Learn more <FaArrowRight className="arrow-icon" />
              </Link>
            </div>
            <div className="showcase-image">
              <div className="image-wrapper">
                <Image src="https://placehold.co/600x400.png" alt="Personalized Study" width={600} height={400} className="mockup-image" data-ai-hint="studying laptop" />
              </div>
            </div>
          </div>
          
          <div className="showcase-item reverse">
            <div className="showcase-content">
              <h2>Real Exam Experience</h2>
              <p>Practice with authentic AP-style questions and timed tests that simulate the real exam environment.</p>
              <Link href="/tools/practice-test" className="learn-more-link">
                Learn more <FaArrowRight className="arrow-icon" />
              </Link>
            </div>
            <div className="showcase-image">
              <div className="image-wrapper">
                <Image src="https://placehold.co/600x400.png" alt="Exam Practice" width={600} height={400} className="mockup-image" data-ai-hint="test online" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section 
        className="quote-section"
        style={{ backgroundPositionY: `${(scrollPosition - 800) * 0.15}px`, backgroundImage: 'linear-gradient(rgba(26, 43, 80, 0.85), rgba(26, 43, 80, 0.85)), url("/images/students-background.png")' }}
      >
        <div className="quote-content">
          <h2>"AP Ace<span className="copyright-symbol">&copy;</span> transformed my study routine. I went from struggling to scoring a 5 on my AP Calculus exam."</h2>
          <p>— Khaleel A., Stanford University</p>
        </div>
      </section>

      <section className="courses-section" ref={coursesRef}>
        <div className="section-header">
          <h2>Popular AP Courses</h2>
          <div className="underline"></div>
        </div>

        <div className="courses-grid" data-visible={isCoursesVisible}>
          {popularCourses.map((course, index) => (
            <div key={course.name} className="course-card" style={{ transitionDelay: `${index * 100}ms` }}>
              <div className="course-icon">
                <Image src={course.icon} alt={course.name} width={60} height={60} />
              </div>
              <h3>{course.name}</h3>
              <Link href="/classes" className="course-btn">Explore</Link>
            </div>
          ))}
        </div>
      </section>

      <section 
        className="cta-section"
        style={{ backgroundPositionY: `${(scrollPosition - 1600) * 0.1}px`, backgroundImage: 'linear-gradient(rgba(77, 138, 139, 0.85), rgba(77, 138, 139, 0.85)), url("/images/cta-background.png")' }}
      >
        <div className="cta-content">
          <h2>Ready to Ace Your AP Exams?</h2>
          <p>Join thousands of students who've improved their scores with AP Ace<span className="copyright-symbol">&copy;</span></p>
          <Link href="/auth" className="cta-button">
            Start Now <FaArrowRight className="btn-icon" />
          </Link>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="section-header">
          <h2>What Our Students Say</h2>
          <div className="underline"></div>
        </div>
        
        <div className="testimonials-container">
          <div className="testimonial-card">
            <div className="testimonial-image">
              <Image src="/images/testimonials/adam.JPEG" alt="Student" width={80} height={80} className="student-avatar" />
            </div>
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">"AP Ace<span className="copyright-symbol">&copy;</span> helped me organize my study schedule and focus on my weak areas. I improved from a 3 to a 5 on my AP Human exam!"</p>
            <p className="testimonial-author">Adam K., High School Freshman</p>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-image">
              <Image src="/images/testimonials/mann.jpeg" alt="Student" width={80} height={80} className="student-avatar" />
            </div>
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">"The practice questions are spot-on! They really match the difficulty and style of the actual AP exams. Highly recommend!"</p>
            <p className="testimonial-author">Mann P., College Freshman</p>
          </div>
          
          <div className="testimonial-card">
            <div className="testimonial-image">
              <Image src="/images/testimonials/gabe.jpeg" alt="Student" width={80} height={80} className="student-avatar" />
            </div>
            <div className="testimonial-stars">★★★★★</div>
            <p className="testimonial-text">"AP Ace<span className="copyright-symbol">&copy;</span>'s detailed explanations for each practice question helped me understand complex concepts I had been struggling with."</p>
            <p className="testimonial-author">Gabe A., High School Junior</p>
          </div>
        </div>
      </section>
    </div>
  );
}
