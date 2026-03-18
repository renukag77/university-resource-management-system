import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { Calendar, UserCheck, ShieldCheck, ArrowRight, Zap, Target, BookOpen } from 'lucide-react';
import './Landing.css';

const MacbookHeroOut = ({ children }) => {
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end center"]
  });

  // Laptop shrinks and fades away during first 35% of scroll
  const laptopScale = useTransform(scrollYProgress, [0, 0.35, 1], [1, 0.6, 0.6]);
  const laptopOpacity = useTransform(scrollYProgress, [0.05, 0.35], [1, 0]);

  // Text stays at normal size initially, slight growth during animation (0-35%), stays in place (35-65%), then fades out (65%+)
  const textScale = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [1, 1.05, 1.05, 1.05]);
  const textY = useTransform(scrollYProgress, [0, 0.35, 0.65, 1], [100, -30, -30, -30]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.35, 0.65, 0.8, 1], [1, 1, 1, 0.3, 0]);

  return (
    <div ref={containerRef} className="macbook-hero-scroll-container">
      <div className="macbook-hero-sticky">
        <div className="macbook-responsive-scaler">
          
          <motion.div className="macbook-wrapper" style={{ scale: laptopScale, opacity: laptopOpacity }}>
            <div className="macbook-lid">
              <div className="macbook-notch"></div>
              <div className="macbook-screen">
                {/* Visual grid inside the empty screen */}
              </div>
            </div>
            <div className="macbook-base">
              <div className="macbook-lip"></div>
            </div>
          </motion.div>

          <motion.div className="macbook-content-layer" style={{ scale: textScale, y: textY, opacity: textOpacity }}>
            {children}
          </motion.div>

        </div>
      </div>
    </div>
  );
};

const Landing = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Framer Motion Variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80, damping: 20 } }
  };

  const popIn = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 60, damping: 15 } }
  };

  return (
    <div className="landing-layout">
      {/* Dynamic Scroll Progress Bar */}
      <motion.div className="progress-bar" style={{ scaleX }} />

      {/* Grid Pattern & Gradients */}
      <div className="landing-background">
        <div className="grid-pattern"></div>
        <div className="gradient-orb orb-purple"></div>
        <div className="gradient-orb orb-blue"></div>
      </div>

      {/* Navigation Layer */}
      <nav className="glass-nav">
        <div className="nav-container">
          <div className="logo-group">
            <Zap className="logo-icon" size={28} />
            <span className="logo-text">CampusSync</span>
          </div>
          <div className="auth-group">
            <Link to="/login" className="btn-ghost">Sign In</Link>
            <Link to="/register" className="btn-neon">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="landing-main">
        
        {/* Macbook Hero Section */}
        <MacbookHeroOut>
          <div className="screen-content">
            <motion.div 
              className="hero-content"
              initial="hidden"
              whileInView="show"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp} className="badge-wrapper">
              <span className="premium-badge">Smart Campus Management</span>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="hero-title">
              The Ultimate Hub for <br/>
              <span className="text-glow">Campus Events</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="hero-subtitle">
              Students register for workshops and track applications. Club heads create stunning events with media and request venue slots. Administrators maintain total control over approvals and space allocation.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="hero-cta">
              <button className="btn-primary-large" onClick={() => navigate('/register')}>
                Join the Platform <ArrowRight size={20} className="ml-2" />
              </button>
            </motion.div>
            
            <motion.div variants={fadeInUp} className="mock-ui-elements">
              <div className="ui-card">🎟️ Register & Track</div>
              <div className="ui-card">📅 Conflict-Free Booking</div>
              <div className="ui-card">✅ Admin Approvals</div>
            </motion.div>

            </motion.div>
          </div>
        </MacbookHeroOut>

        {/* METRICS / BENTO GRID SECTION */}
        <section id="features" className="bento-section">
          <motion.div 
            className="section-header"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp}>Architected for Every Layer</motion.h2>
            <motion.p variants={fadeInUp}>A completely unified ecosystem connecting administration, organizers, and students seamlessly.</motion.p>
          </motion.div>

          <motion.div 
            className="bento-grid"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {/* Student Feature */}
            <motion.div variants={popIn} className="bento-card span-col-1 highlight-blue">
              <div className="card-top">
                <div className="icon-wrapper bg-blue"><UserCheck size={28} /></div>
                <h3>Student Portal</h3>
              </div>
              <p>Discover strictly curated campus events. Register instantly and track your technical, cultural, and academic footprint in real-time.</p>
              <ul className="capability-list">
                <li><BookOpen size={16} /> Instant registration pipelines</li>
                <li><Target size={16} /> Real-time tracking</li>
              </ul>
            </motion.div>

            {/* Club Head Feature */}
            <motion.div variants={popIn} className="bento-card span-col-1 highlight-purple">
              <div className="card-top">
                <div className="icon-wrapper bg-purple"><Calendar size={28} /></div>
                <h3>Organizer Command</h3>
              </div>
              <p>Execute events flawlessly. Deploy rich event pages, manage registrations automatically, and secure precise venue slots directly through the system.</p>
              <ul className="capability-list">
                <li><BookOpen size={16} /> Intelligent capacity scaling</li>
                <li><Target size={16} /> Conflict-free scheduling engine</li>
              </ul>
            </motion.div>

            {/* Admin Feature */}
            <motion.div variants={popIn} className="bento-card span-col-2 highlight-orange">
              <div className="card-top">
                <div className="icon-wrapper bg-orange"><ShieldCheck size={28} /></div>
                <h3>Administrative Control Board</h3>
              </div>
              <p>Command the entire campus grid. Process venue requests computationally, maintain absolute oversight of resource allocation, and instantly re-route assets when conflicts occur.</p>
              <div className="admin-visual-mockup">
                <div className="mock-row"><span className="dot green"></span> Approved: Tech Symposium</div>
                <div className="mock-row"><span className="dot yellow"></span> Pending: Robotics Lab Booking</div>
                <div className="mock-row"><span className="dot red"></span> Conflict: Main Auditorium</div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* CTA SECTION */}
        <section className="bottom-cta-section">
          <motion.div 
            className="cta-glass-box"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <div className="cta-grid-bg"></div>
            <motion.h2 variants={fadeInUp}>Ready to synchronize your campus?</motion.h2>
            <motion.p variants={fadeInUp}>Join the platform defining the standard for institutional resource management.</motion.p>
            <motion.div variants={fadeInUp}>
              <button className="btn-primary-large glow-effect" onClick={() => navigate('/register')}>
                Initialize Your Account
              </button>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="modern-footer">
        <div className="footer-container">
          <div className="brand-lockup">
            <Zap className="logo-icon-small" size={20} />
            <span>CampusSync Engine</span>
          </div>
          <p className="copyright">&copy; {new Date().getFullYear()} CampusSync Inc. All systems operational.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
