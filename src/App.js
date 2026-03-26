import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Zap, Target, Activity, ShoppingCart, BarChart3, Star, X, Check, Quote } from 'lucide-react';

// --- Sub-component: Scattered Testimonial Cards (Fixes Hook Error) ---
const TestimonialCard = ({ card, index, smoothScroll }) => {
  const startScroll = 0.85 + index * 0.04; 
  const endScroll = 0.88 + index * 0.04;
  
  // Target positions for the final scene
  const positions = [
    { x: "-28vw", y: "-22vh" }, // Card 1: Top-Left
    { x: "0vw",   y: "28vh"  }, // Card 2: Bottom-Center
    { x: "28vw",  y: "-18vh" }  // Card 3: Top-Right
  ];

  const pos = positions[index];

  const cardX = useTransform(smoothScroll, [startScroll, endScroll], ["100vw", pos.x]);
  const cardY = useTransform(smoothScroll, [startScroll, endScroll], ["0vh", pos.y]);
  const cardOpacity = useTransform(smoothScroll, [startScroll, endScroll], [0, 1]);
  const cardScale = useTransform(smoothScroll, [startScroll, endScroll], [0.8, 1]);

  return (
    <motion.div 
      style={{ 
        ...stackedCard, 
        x: cardX, 
        y: cardY,
        opacity: cardOpacity, 
        scale: cardScale,
        zIndex: 100 + index,
      }}
    >
      <div style={cardHeader}>
        <Quote size={20} color={card.color} style={{ opacity: 0.3 }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: card.color, letterSpacing: '2px' }}>{card.title}</span>
      </div>
      <p style={cardQuote}>{card.quote}</p>
      <div style={cardFooter}>
        <div style={{ ...pulseDot, backgroundColor: card.color }} />
        <span style={{ fontSize: '0.7rem', opacity: 0.5, fontWeight: 'bold' }}>{card.user}</span>
      </div>
    </motion.div>
  );
};

const Portfolio = () => {
  const [selectedRacket, setSelectedRacket] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [compareList, setCompareList] = useState([]); 
  const [showModal, setShowModal] = useState(false); 
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 60, damping: 25 });

  // --- Animation Logic ---
  const introOpacity = useTransform(smoothScroll, [0, 0.1], [1, 0]); 
  const calloutOpacity = useTransform(smoothScroll, [0.15, 0.2, 0.4, 0.45, 0.8], [0, 1, 1, 0, 0]);
  const lineDraw = useTransform(smoothScroll, [0.15, 0.25], [0, 1]);
  const racketLeft = useTransform(smoothScroll, [0.45, 0.7, 0.85, 0.95], ["50%", "32%", "32%", "50%"]); 
  const racketRotateZ = useTransform(smoothScroll, [0.45, 0.7, 0.85, 0.95, 1], [0, -15, -15, 90, 90]);
  const racketScale = useTransform(smoothScroll, [0.45, 0.7, 0.85, 0.95], [1, 1.3, 1.3, 1.8]);
  const racketRotateY = useTransform(smoothScroll, [0, 0.82, 1], [0, 1440, 1440]);
  
  const panelOpacity = useTransform(smoothScroll, [0.65, 0.8, 0.84], [0, 1, 0]);
  const panelX = useTransform(smoothScroll, [0.65, 0.8], ["30px", "0px"]);

  const heroBgOpacity = useTransform(smoothScroll, [0, 0.12], [0.5, 0]);
  const heroBgScale = useTransform(smoothScroll, [0, 0.12], [1.1, 1]);
  const cardsSceneOpacity = useTransform(smoothScroll, [0.82, 0.85, 0.98, 1], [0, 1, 1, 1]);

  const rackets = [
    { id: 0, name: "ASTROX 100ZZ", color: "#38bdf8", price: "RM 949", rating: 4.9, bestFor: "POWER SMASH", speed: 85, power: 98, control: 92, flex: "Extra Stiff", frame: "HM Graphite / Namd", shaft: "6.2mm Hyper Slim", weight: "4U (Avg. 83g)", tech: "Rotational Generator System", img: "https://triplepointsports.com/cdn/shop/products/3170298515.png?v=1669726018" },
    { id: 1, name: "NANOFLARE 1000Z", color: "#facc15", price: "RM 899", rating: 4.8, bestFor: "LIGHTNING SPEED", speed: 99, power: 82, control: 88, flex: "Stiff", frame: "HM Graphite / M40X", shaft: "Ultra PE Fiber", weight: "3U (Avg. 88g)", tech: "AERO-COMPACT Frame", img: "https://e78shop.com/cdn/shop/files/nanoflare_1000_z.webp?v=1686605505" },
    { id: 2, name: "NANOFLARE 001 FEEL", color: "#15fac1", price: "RM 259", rating: 4.5, bestFor: "CONTROL & TOUCH", speed: 92, power: 75, control: 95, flex: "Flexible", frame: "HM Graphite", shaft: "Slim Shaft", weight: "5U (Avg. 78g)", tech: "Sonic Flare System", img: "https://oregonbadminton.com/cdn/shop/files/int_nf-001f_551-1_02_1_1024x1024@2x.webp?v=1732845648" },
    { id: 3, name: "001 ABILITY FLASH", color: "#fa1515", price: "RM 269", rating: 4.6, bestFor: "ALL-AROUND PLAY", speed: 95, power: 82, control: 88, flex: "Medium", frame: "HM Graphite", shaft: "Slim Shaft", weight: "4U (Avg. 83g)", tech: "Isometric Head Shape", img: "https://oregonbadminton.com/cdn/shop/files/nf-001a_flash-red_1024x1024@2x.webp?v=1706049069" },
    { id: 4, name: "NANOFLARE 700", color: "#6a2300", price: "RM 799", rating: 4.7, bestFor: "DRIVE & DEFENSE", speed: 93, power: 85, control: 90, flex: "Stiff", frame: "HM Graphite", shaft: "Super Slim", weight: "4U / 5U Options", tech: "Torayca M40X", img: "https://oregonbadminton.com/cdn/shop/files/700midnightpurple_1024x1024@2x.webp?v=1726268454" }
  ];

  const current = rackets[selectedRacket];

  const testimonialCardsData = [
    { title: "POWER", user: "SMASH MASTER", quote: "The stability on every smash is incredible. Frame remains perfectly solid.", color: current.color },
    { title: "CONTROL", user: "NET WIZARD", quote: "Exceptional touch at the net. You can feel every contact with the shuttle.", color: current.color },
    { title: "SPEED", user: "REACTION PRO", quote: "Lightning fast swing speed. Dominates the mid-court drive exchanges.", color: current.color }
  ];

  const toggleCompare = (id) => {
    if (compareList.includes(id)) {
      setCompareList(compareList.filter(item => item !== id));
    } else if (compareList.length < 2) {
      setCompareList([...compareList, id]);
    }
  };

  return (
    <div ref={containerRef} style={{ backgroundColor: '#020617', color: '#fff', height: '650vh', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Top Navigation */}
      <div style={topNav}>
        <div style={navItem}><ShoppingCart size={16} /> CART ({cartCount})</div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          onClick={() => compareList.length === 2 && setShowModal(true)}
          style={{ ...navItem, cursor: compareList.length === 2 ? 'pointer' : 'not-allowed', color: compareList.length === 2 ? '#38bdf8' : '#64748b' }}
        >
          <BarChart3 size={16} /> COMPARE ({compareList.length}/2)
          {compareList.length === 2 && <span style={pulseDot} />}
        </motion.div>
      </div>

      {/* Background Layers */}
      <motion.div 
        style={{
          ...heroBackgroundImage,
          opacity: heroBgOpacity,
          scale: heroBgScale,
          backgroundImage: `url('https://images.unsplash.com/photo-1521537634581-0dced2fee2ef?q=80&w=2070&auto=format&fit=crop')`, 
        }}
      />
      <motion.div animate={{ background: `radial-gradient(circle at 50% 50%, ${current.color}15 0%, #020617 80%)` }} style={ambientBg} />

      <div style={fixedStage}>
        <motion.div style={{ ...introBox, opacity: introOpacity }}>
          <h1 style={bigTitle}>SUPREME PERFORMANCE</h1>
        </motion.div>

        {/* --- Callout Indicators --- */}
        <motion.div style={{ ...calloutContainer, opacity: calloutOpacity }}>
          <CalloutItem side="left" top="25%" label="FRAME" text={current.frame} lineDraw={lineDraw} color={current.color} />
          <CalloutItem side="left" top="65%" label="WEIGHT" text={current.weight} lineDraw={lineDraw} color={current.color} />
          <CalloutItem side="right" top="35%" label="SHAFT" text={current.shaft} lineDraw={lineDraw} color={current.color} />
          <CalloutItem side="right" top="75%" label="TECH" text={current.tech} lineDraw={lineDraw} color={current.color} />
        </motion.div>

        {/* Racket Container */}
        <motion.div style={{ ...racketFixedContainer, left: racketLeft, scale: racketScale, rotateZ: racketRotateZ }}>
          <div style={{ perspective: '1200px' }}>
            <motion.div style={{ rotateY: racketRotateY, transformStyle: 'preserve-3d' }}>
              <RacketModel img={current.img} color={current.color} />
            </motion.div>
          </div>
          <motion.div style={{ ...glowDisk, background: current.color, opacity: useTransform(smoothScroll, [0.85, 0.95], [0.3, 0]) }} />
        </motion.div>

        {/* --- Scattered Testimonial Cards --- */}
        <motion.div style={{ ...stackedTestimonialsContainer, opacity: cardsSceneOpacity }}>
          {testimonialCardsData.map((card, index) => (
            <TestimonialCard key={index} card={card} index={index} smoothScroll={smoothScroll} />
          ))}
        </motion.div>

        {/* Right Info Panel */}
        <motion.div style={{ ...rightPanelContainer, opacity: panelOpacity, x: panelX }}>
          <AnimatePresence mode="wait">
            <motion.div key={selectedRacket} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <span style={{ ...tagStyle, borderColor: current.color, color: current.color }}>{current.bestFor}</span>
                <span style={ratingStyle}><Star size={14} fill={current.color} color={current.color} /> {current.rating}</span>
              </div>
              <h2 style={racketName}>{current.name}</h2>
              <div style={priceText}>{current.price}</div>
              <div style={specCard}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                  <button onClick={() => setCartCount(c => c + 1)} style={{ ...buyBtn, backgroundColor: current.color }}>ADD TO CART</button>
                  <motion.button onClick={() => toggleCompare(current.id)} style={compBtn}>
                    {compareList.includes(current.id) ? <Check size={20} color={current.color}/> : <BarChart3 size={20} color="#ffffff" />}
                  </motion.button>
                </div>
                <StatRow label="SPEED" val={current.speed} color={current.color} icon={<Zap size={14}/>} />
                <StatRow label="POWER" val={current.power} color={current.color} icon={<Activity size={14}/>} />
                <StatRow label="CONTROL" val={current.control} color={current.color} icon={<Target size={14}/>} />
              </div>
            </motion.div>
          </AnimatePresence>

          <div style={selectorBox}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
              {rackets.map((r, i) => (
                <button key={r.id} onClick={() => setSelectedRacket(i)} style={{ ...racketBtn, borderColor: selectedRacket === i ? r.color : 'transparent', background: selectedRacket === i ? 'rgba(255,255,255,0.05)' : 'rgba(15, 23, 42, 0.4)' }}>
                  <img src={r.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: selectedRacket === i ? 'none' : 'grayscale(1) opacity(0.5)' }} />
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlay}>
            <motion.div initial={{ y: 50, scale: 0.9 }} animate={{ y: 0, scale: 1 }} style={modalContent}>
              <button onClick={() => setShowModal(false)} style={closeBtn}><X /></button>
              <h2 style={{ textAlign: 'center', marginBottom: '40px', letterSpacing: '4px' }}>EQUIPMENT COMPARISON</h2>
              <div style={{ display: 'flex', justifyContent: 'space-around', gap: '20px' }}>
                {compareList.map(id => (
                  <div key={id} style={{ flex: 1, textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '20px' }}>
                    <img src={rackets[id].img} style={{ height: '200px', marginBottom: '20px' }} alt=""/>
                    <h3 style={{ color: rackets[id].color }}>{rackets[id].name}</h3>
                    <div style={{ marginTop: '30px', textAlign: 'left' }}>
                      <p style={compSpec}><b>SPEED:</b> {rackets[id].speed}%</p>
                      <p style={compSpec}><b>POWER:</b> {rackets[id].power}%</p>
                      <p style={compSpec}><b>FRAME:</b> {rackets[id].frame}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub-components ---
const StatRow = ({ label, val, color, icon }) => (
  <div style={{ marginBottom: '18px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '6px' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{icon} {label}</span>
      <span>{val}%</span>
    </div>
    <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: color, boxShadow: `0 0 10px ${color}66` }} />
    </div>
  </div>
);

const CalloutItem = ({ side, top, label, text, lineDraw, color }) => {
  const isLeft = side === "left";
  return (
    <div style={{ position: 'absolute', top, [isLeft ? "right" : "left"]: "calc(50% + 100px)", width: '250px' }}>
      <div style={{ display: 'flex', flexDirection: isLeft ? 'row' : 'row-reverse', alignItems: 'center' }}>
        <div style={{ textAlign: isLeft ? 'right' : 'left', flex: 1 }}>
          <p style={{ fontSize: '0.65rem', color, fontWeight: 'bold', margin: 0 }}>{label}</p>
          <p style={{ fontSize: '0.85rem', color: '#fff', margin: 0 }}>{text}</p>
        </div>
        <motion.div style={{ height: '1.5px', background: color, width: '80px', margin: '0 15px', scaleX: lineDraw, transformOrigin: isLeft ? 'right' : 'left' }} />
      </div>
    </div>
  );
};

const RacketModel = ({ img, color }) => (
  <img src={img} alt="Racket" style={{ height: '480px', width: 'auto', filter: `drop-shadow(0 0 30px ${color}44)`, objectFit: 'contain' }} />
);

// --- Styles ---
const heroBackgroundImage = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundSize: 'cover', backgroundPosition: 'center', zIndex: 0, filter: 'brightness(0.35) contrast(1.1)', pointerEvents: 'none' };
const topNav = { position: 'fixed', top: '30px', right: '40px', display: 'flex', gap: '20px', zIndex: 1000 };
const navItem = { padding: '8px 16px', background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #1e293b', borderRadius: '20px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' };
const pulseDot = { width: '6px', height: '6px', backgroundColor: '#38bdf8', borderRadius: '50%', boxShadow: '0 0 10px #38bdf8' };
const fixedStage = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', overflow: 'hidden', zIndex: 10 };
const ambientBg = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 1 };
const introBox = { position: 'absolute', top: '50%', left: '50%', x: '-50%', y: '-50%', textAlign: 'center', zIndex: 100, width: '100vw' };
const bigTitle = { fontSize: '4.8vw', fontWeight: '900', margin: 0, whiteSpace: 'nowrap', letterSpacing: '-1px', textTransform: 'uppercase', textShadow: '0 10px 30px rgba(0,0,0,0.5)' };
const calloutContainer = { position: 'absolute', width: '100%', height: '100%', zIndex: 50, pointerEvents: 'none' };
const racketFixedContainer = { position: 'fixed', top: '50%', y: '-50%', x: '-50%', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' };
const glowDisk = { width: '140px', height: '12px', borderRadius: '50%', filter: 'blur(20px)', opacity: 0.3, marginTop: '20px' };
const rightPanelContainer = { position: 'absolute', top: '50%', y: '-50%', right: '10%', width: '440px', zIndex: 60 };
const racketName = { fontSize: '3rem', fontWeight: '900', margin: 0, letterSpacing: '-1px' };
const priceText = { fontSize: '1.8rem', fontWeight: '900', opacity: 0.5, marginBottom: '15px', fontFamily: 'monospace' };
const tagStyle = { padding: '4px 12px', border: '1px solid', borderRadius: '4px', fontSize: '0.6rem', fontWeight: '900' };
const ratingStyle = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 'bold' };
const specCard = { padding: '35px', background: 'rgba(15, 23, 42, 0.85)', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' };
const buyBtn = { flex: 1, padding: '14px', border: 'none', borderRadius: '12px', color: '#000', fontWeight: '900', fontSize: '0.8rem', cursor: 'pointer' };
const compBtn = { width: '54px', height: '54px', background: 'transparent', border: '1px solid #1e293b', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
const racketBtn = { width: '100%', height: '65px', padding: '10px', borderRadius: '14px', border: '2px solid transparent', cursor: 'pointer' };
const selectorBox = { marginTop: '30px' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' };
const modalContent = { width: '800px', background: '#0f172a', padding: '60px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.1)', position: 'relative' };
const closeBtn = { position: 'absolute', top: '30px', right: '30px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' };
const compSpec = { fontSize: '0.8rem', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' };

const stackedTestimonialsContainer = { position: 'absolute', inset: 0, zIndex: 100, pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const stackedCard = { position: 'absolute', width: '320px', padding: '25px', background: 'rgba(255, 255, 255, 0.04)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(20px)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const cardQuote = { fontSize: '0.95rem', color: '#fff', margin: '0 0 20px 0', opacity: 0.9, fontStyle: 'italic', lineHeight: '1.6' };
const cardFooter = { display: 'flex', alignItems: 'center', gap: '8px' };

export default Portfolio;