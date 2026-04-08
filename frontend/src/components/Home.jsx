import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true; // Ensure muted is set for autoplay
      videoRef.current.play().catch(error => console.error("Video play failed:", error));
    }
  }, []);

  // Scroll Animation Observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show-element');
          observer.unobserve(entry.target); // Stop observing once shown to improve performance
        }
      });
    }, { threshold: 0.1 });

    const hiddenElements = document.querySelectorAll('.hidden-element');
    hiddenElements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const skills = [
    { name: 'JavaScript', description: 'The language of the web. Essential for frontend development.' },
    { name: 'Python', description: 'Versatile language for backend, data science, and AI.' },
    { name: 'React', description: 'A JavaScript library for building user interfaces.' },
    { name: 'Design', description: 'Create stunning visuals and user experiences.' },
    { name: 'Marketing', description: 'Strategies to promote products and grow businesses.' },
    { name: 'Photography', description: 'Capture moments and master the art of visual storytelling.' },
    { name: 'Music', description: 'Learn instruments, theory, or production techniques.' },
    { name: 'Languages', description: 'Connect with the world by learning new languages.' }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero">
        <video
          ref={videoRef}
          className="hero-video"
          src="https://framerusercontent.com/assets/DIxKdkWMeotCUZDGcvrTFMPqq8c.mp4"
          loop
          autoPlay
          muted
          playsInline
          preload="auto"
        />
        <div className="hero-content">
          <h1>Unlock Your Potential with Skillswap</h1>
          <p>
            The ultimate platform to exchange knowledge. Teach what you know, learn what you don't.
            Connect with a global community of learners today.
          </p>
          <div className="hero-actions" style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '0.8rem 2rem', borderRadius: '8px' }}>
              Start Swapping
            </Link>
            <Link to="/login" className="btn-outline" style={{ textDecoration: 'none', padding: '0.8rem 2rem', borderRadius: '8px' }}>
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats hidden-element">
        <div className="stats-grid">
          <div className="stat-item">
            <h3 className="stat-number">10k+</h3>
            <p className="stat-label">Active Users</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">500+</h3>
            <p className="stat-label">Skills Listed</p>
          </div>
          <div className="stat-item">
            <h3 className="stat-number">25k+</h3>
            <p className="stat-label">Swaps Completed</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features hidden-element">
        <h2>How It Works</h2>
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🔍</div>
            <h3>Find a Skill</h3>
            <p>Browse through thousands of skills offered by our community members.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🤝</div>
            <h3>Connect & Swap</h3>
            <p>Propose a swap. Teach them your skill in exchange for theirs.</p>
          </div>
          <div className="feature-item">
            <div className="feature-icon">🚀</div>
            <h3>Grow Together</h3>
            <p>Master new abilities and help others achieve their goals.</p>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-us hidden-element" style={{ textAlign: 'center' }}>
        <h2>Why Choose Skillswap?</h2>
        <div className="why-us-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
          <div className="card" style={{ textAlign: 'left' }}>
            <h3 style={{ color: '#fff' }}>💰 Completely Free</h3>
            <p>No hidden fees. Knowledge should be accessible to everyone, regardless of budget.</p>
          </div>
          <div className="card" style={{ textAlign: 'left' }}>
            <h3 style={{ color: '#fff' }}>🌍 Global Community</h3>
            <p>Connect with people from different cultures and backgrounds. Learn more than just a skill.</p>
          </div>
          <div className="card" style={{ textAlign: 'left' }}>
            <h3 style={{ color: '#fff' }}>⭐ Verified Reviews</h3>
            <p>Our rating system ensures you find high-quality teachers and reliable partners.</p>
          </div>
        </div>
      </section>

      {/* Popular Skills Section */}
      <section className="popular-skills hidden-element">
        <h2>Popular Skills to Swap</h2>
        <div className="skills-grid">
          {skills.map((skill, index) => (
            <div key={index} className="skill-tag">
              {skill.name}
              <div className="skill-tooltip">
                <strong>{skill.name}</strong>
                <p>{skill.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials hidden-element" style={{ textAlign: 'center' }}>
        <h2>What Our Users Say</h2>
        <div className="testimonial-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
          <div className="card">
            <p>"I learned React in exchange for teaching Guitar. Best experience ever!"</p>
            <h4 style={{ marginTop: '1rem', color: '#646cff' }}>- Alex D.</h4>
          </div>
          <div className="card">
            <p>"Skillswap helped me find a language partner. Now I speak fluent Spanish."</p>
            <h4 style={{ marginTop: '1rem', color: '#646cff' }}>- Sarah M.</h4>
          </div>
        </div>
      </section>

      {/* Learning Experiences Section */}
      <section className="learning-experiences hidden-element" style={{ textAlign: 'center' }}>
        <h2>Inspiring Learning Experiences</h2>
        <p style={{ maxWidth: '600px', margin: '0 auto 3rem', color: '#aaa' }}>
          Real stories from our community members who transformed their lives through skill swapping.
        </p>
        <div className="experiences-grid">
          <div className="experience-card">
            <div className="experience-header">
              <div className="avatar" style={{ background: '#646cff' }}>👨‍💻</div>
              <div>
                <h4>David & Elena</h4>
                <small>Coding ↔️ Design</small>
              </div>
            </div>
            <p>"I needed a logo for my startup, and Elena wanted to learn Python. We swapped skills for 3 months. Now my business has a brand, and she's a junior dev!"</p>
          </div>
          <div className="experience-card">
            <div className="experience-header">
              <div className="avatar" style={{ background: '#bc13fe' }}>🎸</div>
              <div>
                <h4>Sam & Raj</h4>
                <small>Guitar ↔️ Cooking</small>
              </div>
            </div>
            <p>"Raj taught me how to make authentic curry, and I helped him master the pentatonic scale. It was more than just learning; we became great friends."</p>
          </div>
          <div className="experience-card">
            <div className="experience-header">
              <div className="avatar" style={{ background: '#ff6464' }}>🗣️</div>
              <div>
                <h4>Lisa & Kenji</h4>
                <small>English ↔️ Japanese</small>
              </div>
            </div>
            <p>"Preparing for my trip to Tokyo was easy thanks to Kenji. In return, I helped him with his business English presentations. Win-win!"</p>
          </div>
        </div>
      </section>

      {/* Community Values Section */}
      <section className="values hidden-element" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2>Our Core Values</h2>
          <div className="values-grid">
            <div className="value-item">
              <span className="value-icon">🤝</span>
              <h3>Trust First</h3>
              <p>We build connections based on mutual respect and reliability.</p>
            </div>
            <div className="value-item">
              <span className="value-icon">🌱</span>
              <h3>Continuous Growth</h3>
              <p>Learning never stops. We encourage curiosity and improvement.</p>
            </div>
            <div className="value-item">
              <span className="value-icon">🌍</span>
              <h3>Inclusivity</h3>
              <p>Knowledge belongs to everyone, everywhere, regardless of background.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq hidden-element">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          <div className="faq-item">
            <h4>Is it really free?</h4>
            <p>Yes! Skillswap is built on the premise of bartering knowledge. No money changes hands.</p>
          </div>
          <div className="faq-item">
            <h4>How do I schedule sessions?</h4>
            <p>Once you match with a partner, you can chat and agree on a time that works for both of you.</p>
          </div>
          <div className="faq-item">
            <h4>What if I don't have a skill to teach?</h4>
            <p>Everyone knows something! Whether it's your native language, cooking, or even listening, there's value in what you know.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="cta cta-section hidden-element" style={{ textAlign: 'center', background: 'linear-gradient(180deg, transparent, rgba(100, 108, 255, 0.1))', borderRadius: '16px', marginTop: '2rem' }}>
        <h2>Ready to Start Your Journey?</h2>
        <p style={{ maxWidth: '600px', margin: '1rem auto 2rem' }}>Join thousands of learners and teachers today. It's free to get started.</p>
        <Link to="/register" className="btn-primary" style={{ textDecoration: 'none', padding: '1rem 2.5rem', borderRadius: '8px', fontSize: '1.1rem' }}>
          Join Now
        </Link>
      </section>

      {/* Detailed Footer */}
      <footer className="hidden-element">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-col">
              <h3>Skillswap</h3>
              <p>
                The ultimate platform to exchange knowledge. Connect, learn, and grow with a global community.
              </p>
            </div>
            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Connect With Us</h4>
              <div className="social-links">
                <a href="" className="social-icon">🐦</a>
                <a href="#" className="social-icon">💼</a>
                <a href="#" className="social-icon">📸</a>
                <a href="#" className="social-icon">🐙</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 Skillswap. All rights reserved. | Made with ❤️ for learning.</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
