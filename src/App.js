import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Zap, Target, Activity, ShoppingCart, BarChart3, Star, X, Check, Quote } from 'lucide-react';

// --- Hook: responsive breakpoint (the pinned scroll-jacked scene is a desktop pattern; ---
// --- mobile gets its own natural-flow layout instead of a degraded version of it) ---
const useIsMobile = (breakpoint = 900) => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
};

// --- Sub-component: Top Navigation — plain wordmark + text links on a hairline rule, no pill chrome ---
const TopNav = ({ cartCount, compareList, onOpenCompare, accent }) => (
  <div style={navWrap}>
    <div style={brandMark}>
      <Zap size={14} color={accent} fill={accent} />
      <span>RACKET<span style={{ opacity: 0.4 }}>LAB</span></span>
    </div>
    <div style={navActions}>
      <div style={navItem}><ShoppingCart size={15} /> CART ({cartCount})</div>
      <span style={navDivider} />
      <motion.div
        role="button"
        tabIndex={0}
        aria-label={`Open comparison, ${compareList.length} of 2 rackets selected`}
        whileTap={{ opacity: compareList.length === 2 ? 0.6 : 1 }}
        onClick={onOpenCompare}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onOpenCompare()}
        style={{ ...navItem, cursor: compareList.length === 2 ? 'pointer' : 'default', color: compareList.length === 2 ? accent : 'rgba(10,10,11,0.35)' }}
      >
        <BarChart3 size={15} /> COMPARE ({compareList.length}/2)
        {compareList.length === 2 && <span style={{ ...pulseDot, backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }} />}
      </motion.div>
    </div>
  </div>
);

// --- Sub-component: Desktop-only ambient dressing (fills the canvas without resorting to glow-card chrome) ---
const LeftRail = () => (
  <div style={leftRailWrap} aria-hidden="true">
    <span style={leftRailText}>SUPREME PERFORMANCE — EST. 2026</span>
    <div style={leftRailLine} />
  </div>
);

const IndexCounter = ({ index, total, accent }) => (
  <div style={indexCounterWrap} aria-hidden="true">
    <span style={{ color: accent }}>{String(index + 1).padStart(2, '0')}</span>
    <span style={indexCounterSlash}>/</span>
    <span style={indexCounterTotal}>{String(total).padStart(2, '0')}</span>
  </div>
);

const ScrollDot = ({ smoothScroll, range, label, accent }) => {
  const progress = useTransform(smoothScroll, [range[0], range[0] + 0.02, range[1] - 0.02, range[1]], [0, 1, 1, 0]);
  const scale = useTransform(smoothScroll, [range[0], range[0] + 0.02, range[1] - 0.02, range[1]], [1, 1.8, 1.8, 1]);
  const bg = useTransform(progress, (p) => (p > 0.5 ? accent : 'rgba(10,10,11,0.2)'));
  return (
    <div style={dotCol}>
      <motion.div style={{ ...dot, scale, background: bg }} />
      <motion.span style={{ ...dotLabel, opacity: useTransform(progress, [0, 1], [0.4, 1]) }}>{label}</motion.span>
    </div>
  );
};

const ScrollRail = ({ smoothScroll, accent }) => (
  <div style={scrollRailWrap} aria-hidden="true">
    <ScrollDot smoothScroll={smoothScroll} range={[0, 0.15]} label="INTRO" accent={accent} />
    <ScrollDot smoothScroll={smoothScroll} range={[0.15, 0.45]} label="SPECS" accent={accent} />
    <ScrollDot smoothScroll={smoothScroll} range={[0.45, 0.84]} label="DETAIL" accent={accent} />
    <ScrollDot smoothScroll={smoothScroll} range={[0.84, 1]} label="REVIEWS" accent={accent} />
  </div>
);

// --- Sub-component: Scattered pull-quotes (no card chrome — editorial, not "glass UI") ---
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
      <QuoteCardBody card={card} />
    </motion.div>
  );
};

const QuoteCardBody = ({ card }) => (
  <>
    <div style={cardHeader}>
      <Quote size={22} color={card.color} style={{ opacity: 0.5 }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', fontWeight: 'bold', color: card.color, letterSpacing: '2px' }}>{card.title}</span>
    </div>
    <p style={cardQuote}>{card.quote}</p>
    <div style={cardFooter}>
      <span style={cardFooterRule} />
      <span style={{ fontSize: '0.68rem', opacity: 0.5, fontWeight: 'bold', letterSpacing: '0.5px' }}>{card.user}</span>
    </div>
  </>
);

// --- Sub-component: Comparison Modal (shared by mobile + desktop) ---
const ComparisonModal = ({ compareList, rackets, onClose }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={modalOverlay} onClick={onClose}>
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 16, opacity: 0 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      style={modalContent}
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={onClose} aria-label="Close comparison" style={closeBtn}><X size={18} /></button>
      <h2 style={modalTitle}>EQUIPMENT COMPARISON</h2>
      <div style={modalGrid}>
        {compareList.map(id => (
          <div key={id} style={modalCard}>
            <img src={rackets[id].img} style={{ height: 'min(200px, 22vh)', marginBottom: '20px', maxWidth: '100%', objectFit: 'contain' }} alt={`${rackets[id].name} badminton racket`} />
            <h3 style={{ color: rackets[id].color, fontFamily: 'var(--font-display)', letterSpacing: '1px', fontSize: '1.6rem', fontWeight: 400 }}>{rackets[id].name}</h3>
            <div style={{ marginTop: '26px', textAlign: 'left' }}>
              <p style={compSpec}><b>SPEED:</b> {rackets[id].speed}%</p>
              <p style={compSpec}><b>POWER:</b> {rackets[id].power}%</p>
              <p style={{ ...compSpec, borderBottom: 'none' }}><b>FRAME:</b> {rackets[id].frame}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

const Portfolio = () => {
  const [selectedRacket, setSelectedRacket] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [compareList, setCompareList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const containerRef = useRef(null);
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const smoothScroll = useSpring(scrollYProgress, { stiffness: 60, damping: 25 });

  // --- Animation Logic (desktop pinned scene only) — unchanged from the original scroll choreography ---
  const introOpacity = useTransform(smoothScroll, [0, 0.1], [1, 0]);
  const calloutOpacity = useTransform(smoothScroll, [0.15, 0.2, 0.4, 0.45, 0.8], [0, 1, 1, 0, 0]);
  const lineDraw = useTransform(smoothScroll, [0.15, 0.25], [0, 1]);
  const racketLeft = useTransform(smoothScroll, [0.45, 0.7, 0.85, 0.95], ["50%", "32%", "32%", "50%"]);
  const racketRotateZ = useTransform(smoothScroll, [0.45, 0.7, 0.85, 0.95, 1], [0, -15, -15, 90, 90]);
  const racketScale = useTransform(smoothScroll, [0.15, 0.45, 0.7, 0.85, 0.95], [1, 1.16, 1.36, 1.36, 1.86]);
  const racketRotateY = useTransform(smoothScroll, [0, 0.82, 1], [0, 1440, 1440]);

  const panelOpacity = useTransform(smoothScroll, [0.65, 0.8, 0.84], [0, 1, 0]);
  const panelX = useTransform(smoothScroll, [0.65, 0.8], ["30px", "0px"]);

  const heroBgOpacity = useTransform(smoothScroll, [0, 0.12], [0.5, 0]);
  const heroBgScale = useTransform(smoothScroll, [0, 0.12], [1.1, 1]);
  const cardsSceneOpacity = useTransform(smoothScroll, [0.82, 0.85, 0.98, 1], [0, 1, 1, 1]);
  const glowDiskOpacity = useTransform(smoothScroll, [0.85, 0.95], [0.3, 0]);

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
    <div ref={containerRef} style={{ backgroundColor: 'var(--bg)', color: 'var(--ink)', height: isMobile ? 'auto' : '650vh', position: 'relative', overflowX: 'hidden' }}>

      <div style={grainOverlay} />
      <TopNav cartCount={cartCount} compareList={compareList} accent={current.color} onOpenCompare={() => compareList.length === 2 && setShowModal(true)} />
      {!isMobile && <motion.div style={{ ...scrollProgress, scaleX: smoothScroll, background: current.color }} />}
      {!isMobile && <IndexCounter index={selectedRacket} total={rackets.length} accent={current.color} />}

      {isMobile ? (
        <MobileExperience
          current={current}
          rackets={rackets}
          selectedRacket={selectedRacket}
          setSelectedRacket={setSelectedRacket}
          setCartCount={setCartCount}
          compareList={compareList}
          toggleCompare={toggleCompare}
          testimonialCardsData={testimonialCardsData}
        />
      ) : (
        <>
          {/* Background Layers */}
          <motion.div
            style={{ ...ambientBg, opacity: heroBgOpacity, scale: heroBgScale }}
            animate={{
              background: `radial-gradient(circle at 12% 15%, ${current.color}14 0%, transparent 38%), radial-gradient(circle at 88% 20%, ${current.color}0c 0%, transparent 42%)`
            }}
          />
          <LeftRail />
          <ScrollRail smoothScroll={smoothScroll} accent={current.color} />

          <div style={fixedStage}>
            <motion.div style={{ ...introBox, opacity: introOpacity }}>
              <p style={eyebrow}>PRO SERIES · 2026</p>
              <h1 style={bigTitle}>SUPREME<br />PERFORMANCE</h1>
              <p style={heroSubtitle}>Five frames built for smash, speed, control and everything between.</p>
              <div style={scrollCue}>
                <motion.div
                  style={scrollCueLine}
                  animate={{ scaleY: [0.35, 1, 0.35] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <span style={scrollCueLabel}>SCROLL TO EXPLORE</span>
              </div>
            </motion.div>

            {/* --- Callout Indicators --- */}
            <motion.div style={{ ...calloutContainer, opacity: calloutOpacity }}>
              <CalloutItem index="01" side="left" top="25%" label="FRAME" text={current.frame} lineDraw={lineDraw} color={current.color} />
              <CalloutItem index="02" side="left" top="65%" label="WEIGHT" text={current.weight} lineDraw={lineDraw} color={current.color} />
              <CalloutItem index="03" side="right" top="35%" label="SHAFT" text={current.shaft} lineDraw={lineDraw} color={current.color} />
              <CalloutItem index="04" side="right" top="75%" label="TECH" text={current.tech} lineDraw={lineDraw} color={current.color} />
            </motion.div>

            {/* Racket Container */}
            <motion.div style={{ ...racketFixedContainer, left: racketLeft, scale: racketScale, rotateZ: racketRotateZ }}>
              <div style={{ perspective: '1200px' }}>
                <motion.div style={{ rotateY: racketRotateY, transformStyle: 'preserve-3d' }}>
                  <RacketModel img={current.img} color={current.color} name={current.name} />
                </motion.div>
              </div>
              <motion.div style={{ ...glowDisk, opacity: glowDiskOpacity }} />
            </motion.div>

            {/* --- Scattered Testimonial Pull-Quotes --- */}
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
                      <motion.button whileHover={{ opacity: 0.85 }} whileTap={{ scale: 0.98 }} onClick={() => setCartCount(c => c + 1)} style={buyBtn}>ADD TO CART</motion.button>
                      <motion.button
                        whileHover={{ borderColor: current.color }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => toggleCompare(current.id)}
                        aria-label={compareList.includes(current.id) ? `Remove ${current.name} from comparison` : `Add ${current.name} to comparison`}
                        style={compBtn}
                      >
                        {compareList.includes(current.id) ? <Check size={18} color={current.color} /> : <BarChart3 size={18} color="var(--ink)" />}
                      </motion.button>
                    </div>
                    <StatRow label="SPEED" val={current.speed} color={current.color} icon={<Zap size={14} />} />
                    <StatRow label="POWER" val={current.power} color={current.color} icon={<Activity size={14} />} />
                    <StatRow label="CONTROL" val={current.control} color={current.color} icon={<Target size={14} />} />
                  </div>
                </motion.div>
              </AnimatePresence>

              <div style={selectorBox}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                  {rackets.map((r, i) => (
                    <motion.button
                      key={r.id}
                      whileHover={{ opacity: 0.85 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedRacket(i)}
                      aria-label={`View ${r.name}`}
                      aria-pressed={selectedRacket === i}
                      style={{ ...racketBtn, borderColor: selectedRacket === i ? r.color : 'rgba(10,10,11,0.1)', background: selectedRacket === i ? 'rgba(10,10,11,0.03)' : 'transparent' }}
                    >
                      <img src={r.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: selectedRacket === i ? 'none' : 'grayscale(1) opacity(0.5)' }} />
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}

      {/* Comparison Modal */}
      <AnimatePresence>
        {showModal && <ComparisonModal compareList={compareList} rackets={rackets} onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </div>
  );
};

// --- Sub-component: Mobile Experience (natural scroll flow, not scroll-jacked) ---
const MobileExperience = ({ current, rackets, selectedRacket, setSelectedRacket, setCartCount, compareList, toggleCompare, testimonialCardsData }) => (
  <div style={mWrap}>
    <motion.div animate={{ background: `radial-gradient(circle at 50% 0%, ${current.color}1c 0%, var(--bg) 65%)` }} style={mAmbientBg} />

    {/* Hero */}
    <section style={mHero}>
      <p style={eyebrow}>PRO SERIES · 2026</p>
      <h1 style={mBigTitle}>SUPREME<br />PERFORMANCE</h1>
      <p style={mHeroSubtitle}>Five frames built for smash, speed, control and everything between.</p>

      <div style={mRacketStage}>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedRacket}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ duration: 0.35 }}
          >
            <RacketModel img={current.img} color={current.color} name={current.name} mobile />
          </motion.div>
        </AnimatePresence>
        <div style={mGlowDisk} />
      </div>

      {/* Racket selector */}
      <div style={mSelectorRow} role="listbox" aria-label="Select a racket">
        {rackets.map((r, i) => (
          <motion.button
            key={r.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => setSelectedRacket(i)}
            aria-label={`View ${r.name}`}
            aria-pressed={selectedRacket === i}
            style={{ ...mRacketBtn, borderColor: selectedRacket === i ? r.color : 'rgba(10,10,11,0.1)', background: selectedRacket === i ? 'rgba(10,10,11,0.03)' : 'transparent' }}
          >
            <img src={r.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', filter: selectedRacket === i ? 'none' : 'grayscale(1) opacity(0.5)' }} />
          </motion.button>
        ))}
      </div>
    </section>

    {/* Info card */}
    <AnimatePresence mode="wait">
      <motion.section
        key={selectedRacket}
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.4 }}
        style={mInfoCard}
      >
        <div style={{ display: 'flex', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
          <span style={{ ...tagStyle, borderColor: current.color, color: current.color }}>{current.bestFor}</span>
          <span style={ratingStyle}><Star size={14} fill={current.color} color={current.color} /> {current.rating}</span>
        </div>
        <h2 style={mRacketName}>{current.name}</h2>
        <div style={mPriceText}>{current.price}</div>

        <div style={{ display: 'flex', gap: '10px', margin: '20px 0 26px' }}>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setCartCount(c => c + 1)} style={buyBtn}>ADD TO CART</motion.button>
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => toggleCompare(current.id)}
            aria-label={compareList.includes(current.id) ? `Remove ${current.name} from comparison` : `Add ${current.name} to comparison`}
            style={compBtn}
          >
            {compareList.includes(current.id) ? <Check size={18} color={current.color} /> : <BarChart3 size={18} color="var(--ink)" />}
          </motion.button>
        </div>

        <StatRow label="SPEED" val={current.speed} color={current.color} icon={<Zap size={14} />} />
        <StatRow label="POWER" val={current.power} color={current.color} icon={<Activity size={14} />} />
        <StatRow label="CONTROL" val={current.control} color={current.color} icon={<Target size={14} />} />

        <div style={mSpecGrid}>
          <MobileSpec label="FRAME" text={current.frame} color={current.color} />
          <MobileSpec label="SHAFT" text={current.shaft} color={current.color} />
          <MobileSpec label="WEIGHT" text={current.weight} color={current.color} />
          <MobileSpec label="TECH" text={current.tech} color={current.color} />
        </div>
      </motion.section>
    </AnimatePresence>

    {/* Testimonials */}
    <section style={mTestimonialSection}>
      <p style={{ ...eyebrow, textAlign: 'center', marginBottom: '18px' }}>WHAT PLAYERS SAY</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {testimonialCardsData.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            style={mStackedCard}
          >
            <QuoteCardBody card={card} />
          </motion.div>
        ))}
      </div>
    </section>

    <footer style={mFooter}>
      <div style={brandMark}><Zap size={13} color={current.color} fill={current.color} /><span>RACKET<span style={{ opacity: 0.4 }}>LAB</span></span></div>
      <p style={{ fontSize: '0.7rem', opacity: 0.4, marginTop: '10px' }}>Built for the smash.</p>
    </footer>
  </div>
);

const MobileSpec = ({ label, text, color }) => (
  <div style={mSpecTile}>
    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color, fontWeight: 700, letterSpacing: '1.5px', margin: '0 0 4px' }}>{label}</p>
    <p style={{ fontSize: '0.82rem', color: 'var(--ink)', margin: 0 }}>{text}</p>
  </div>
);

// --- Sub-components ---
const StatRow = ({ label, val, color, icon }) => (
  <div style={{ marginBottom: '18px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>{icon} {label}</span>
      <span>{val}%</span>
    </div>
    <div style={{ height: '2px', background: 'rgba(10,10,11,0.1)', overflow: 'hidden' }}>
      <motion.div initial={{ width: 0 }} whileInView={{ width: `${val}%` }} viewport={{ once: true }} transition={{ duration: 1 }} style={{ height: '100%', background: color }} />
    </div>
  </div>
);

const CalloutItem = ({ index, side, top, label, text, lineDraw, color }) => {
  const isLeft = side === "left";
  return (
    <div style={{ position: 'absolute', top, [isLeft ? "right" : "left"]: "calc(50% + 90px)", width: 'min(240px, 21vw)' }}>
      <div style={{ display: 'flex', flexDirection: isLeft ? 'row' : 'row-reverse', alignItems: 'center' }}>
        <div style={{ textAlign: isLeft ? 'right' : 'left', flex: 1 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color, fontWeight: 'bold', margin: 0, letterSpacing: '1px' }}>
            <span style={{ opacity: 0.55 }}>{index}</span> {label}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--ink)', margin: '2px 0 0' }}>{text}</p>
        </div>
        <motion.div style={{ display: 'flex', alignItems: 'center', width: '64px', margin: '0 12px', justifyContent: isLeft ? 'flex-end' : 'flex-start', scaleX: lineDraw, transformOrigin: isLeft ? 'right' : 'left' }}>
          <span style={{ height: '1px', flex: 1, background: 'rgba(10,10,11,0.3)' }} />
        </motion.div>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, flexShrink: 0 }} />
      </div>
    </div>
  );
};

const RacketModel = ({ img, color, name, mobile }) => (
  <img
    src={img}
    alt={`${name} badminton racket`}
    style={{ height: mobile ? 'min(320px, 48vh)' : '480px', width: 'auto', maxWidth: '80vw', filter: 'drop-shadow(0 18px 22px rgba(10,10,11,0.16))', objectFit: 'contain' }}
  />
);

// --- Styles ---
const grainOverlay = {
  position: 'fixed', inset: 0, zIndex: 1, opacity: 0.025, pointerEvents: 'none', mixBlendMode: 'multiply',
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
};
const scrollProgress = { position: 'fixed', top: 0, left: 0, height: '2px', width: '100%', transformOrigin: '0% 50%', zIndex: 1001, pointerEvents: 'none' };
const leftRailWrap = { position: 'fixed', left: 'clamp(18px, 2.4vw, 34px)', top: 0, height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', paddingBottom: '48px', zIndex: 40, pointerEvents: 'none' };
const leftRailText = { writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '3px', color: 'rgba(10,10,11,0.3)', textTransform: 'uppercase', marginBottom: '16px' };
const leftRailLine = { width: '1px', height: '90px', background: 'linear-gradient(to bottom, rgba(10,10,11,0.25), transparent)' };
const indexCounterWrap = { position: 'fixed', top: 'clamp(60px, 8vw, 84px)', right: 'clamp(16px, 4vw, 40px)', zIndex: 40, fontFamily: 'var(--font-mono)', fontSize: '0.72rem', letterSpacing: '1px', display: 'flex', gap: '4px', pointerEvents: 'none' };
const indexCounterSlash = { color: 'rgba(10,10,11,0.3)' };
const indexCounterTotal = { color: 'rgba(10,10,11,0.5)' };
const scrollRailWrap = { position: 'fixed', bottom: 'clamp(24px, 4vh, 40px)', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '30px', zIndex: 40, pointerEvents: 'none' };
const dotCol = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' };
const dot = { width: '5px', height: '5px', borderRadius: '50%' };
const dotLabel = { fontFamily: 'var(--font-mono)', fontSize: '0.56rem', letterSpacing: '2px', color: 'rgba(10,10,11,0.6)' };
const scrollCue = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px', marginTop: '56px' };
const scrollCueLabel = { fontFamily: 'var(--font-mono)', fontSize: '0.6rem', letterSpacing: '3px', color: 'rgba(10,10,11,0.4)' };
const scrollCueLine = { width: '1px', height: '42px', background: 'linear-gradient(to bottom, rgba(10,10,11,0.5), transparent)', transformOrigin: 'top' };
const navWrap = { position: 'fixed', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000, gap: '12px', flexWrap: 'wrap', padding: 'clamp(14px, 3vw, 24px) clamp(16px, 4vw, 40px)', borderBottom: '1px solid rgba(10,10,11,0.08)', background: 'var(--bg)' };
const navActions = { display: 'flex', alignItems: 'center', gap: 'clamp(8px, 1.5vw, 18px)' };
const navDivider = { width: '1px', height: '14px', background: 'rgba(10,10,11,0.15)' };
const brandMark = { display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-display)', fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', letterSpacing: '1.5px', color: 'var(--ink)' };
const navItem = { fontSize: 'clamp(0.6rem, 1.6vw, 0.68rem)', display: 'flex', alignItems: 'center', gap: '7px', fontWeight: 'bold', letterSpacing: '0.5px', whiteSpace: 'nowrap', color: 'var(--ink)' };
const pulseDot = { width: '5px', height: '5px', borderRadius: '50%' };
const fixedStage = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', overflow: 'hidden', zIndex: 10 };
const ambientBg = { position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', zIndex: 1 };
const introBox = { position: 'absolute', left: 'clamp(24px, 6vw, 84px)', bottom: '12%', maxWidth: '620px', textAlign: 'left', zIndex: 100, pointerEvents: 'none' };
const eyebrow = { fontFamily: 'var(--font-mono)', fontSize: 'clamp(0.65rem, 1vw, 0.75rem)', letterSpacing: '4px', color: 'rgba(10,10,11,0.5)', margin: '0 0 14px', fontWeight: 700 };
const bigTitle = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2.6rem, 6.2vw, 6rem)', fontWeight: 400, margin: 0, letterSpacing: '0.5px', textTransform: 'uppercase', lineHeight: 0.92 };
const heroSubtitle = { fontFamily: 'var(--font-body)', fontSize: 'clamp(0.85rem, 1.1vw, 1rem)', color: 'rgba(10,10,11,0.55)', maxWidth: '400px', margin: '18px 0 0', lineHeight: 1.5 };
const calloutContainer = { position: 'absolute', width: '100%', height: '100%', zIndex: 50, pointerEvents: 'none' };
const racketFixedContainer = { position: 'fixed', top: '50%', y: '-50%', x: '-50%', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' };
const glowDisk = { width: '220px', height: '18px', borderRadius: '50%', filter: 'blur(24px)', opacity: 0.22, background: 'rgba(10,10,11,0.6)', marginTop: '20px' };
const rightPanelContainer = { position: 'absolute', top: '50%', y: '-50%', right: 'clamp(20px, 6vw, 10%)', width: 'min(440px, 34vw)', zIndex: 60 };
const racketName = { fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 3.4vw, 3.2rem)', fontWeight: 400, margin: 0, letterSpacing: '1px' };
const priceText = { fontFamily: 'var(--font-mono)', fontSize: 'clamp(1.4rem, 2vw, 1.8rem)', fontWeight: 700, opacity: 0.55, marginBottom: '15px' };
const tagStyle = { padding: '4px 12px', border: '1px solid', fontSize: '0.6rem', fontWeight: '900', fontFamily: 'var(--font-mono)', letterSpacing: '0.5px' };
const ratingStyle = { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)' };
const specCard = { padding: 'clamp(22px, 2.4vw, 32px)', background: 'rgba(255, 255, 255, 0.55)', border: '1px solid rgba(10,10,11,0.1)' };
const buyBtn = { flex: 1, padding: '14px', border: 'none', background: 'var(--ink)', color: 'var(--bg)', fontWeight: '800', fontSize: '0.78rem', fontFamily: 'var(--font-body)', letterSpacing: '1.5px', cursor: 'pointer' };
const compBtn = { width: '50px', height: '50px', background: 'transparent', border: '1px solid rgba(10,10,11,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color 0.2s ease' };
const racketBtn = { width: '100%', height: '62px', padding: '9px', border: '1px solid transparent', cursor: 'pointer', transition: 'border-color 0.25s ease, background 0.25s ease' };
const selectorBox = { marginTop: '26px' };
const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(10, 10, 11, 0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' };
const modalContent = { width: 'min(800px, 100%)', maxHeight: '90vh', overflowY: 'auto', background: '#fffdf8', padding: 'clamp(28px, 5vw, 56px)', border: '1px solid rgba(10,10,11,0.12)', position: 'relative' };
const modalTitle = { textAlign: 'left', marginBottom: '36px', letterSpacing: '3px', fontFamily: 'var(--font-display)', fontSize: 'clamp(1.4rem, 3vw, 1.8rem)', fontWeight: 400 };
const modalGrid = { display: 'flex', flexWrap: 'wrap', gap: '1px', background: 'rgba(10,10,11,0.1)' };
const modalCard = { flex: '1 1 220px', textAlign: 'center', padding: '24px', background: '#fffdf8' };
const closeBtn = { position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: '1px solid rgba(10,10,11,0.15)', color: 'var(--ink)', cursor: 'pointer', width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const compSpec = { fontSize: '0.8rem', marginBottom: '10px', borderBottom: '1px solid rgba(10,10,11,0.08)', paddingBottom: '10px' };

const stackedTestimonialsContainer = { position: 'absolute', inset: 0, zIndex: 100, pointerEvents: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const stackedCard = { position: 'absolute', width: 'min(300px, 28vw)', padding: '0' };
const cardHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' };
const cardQuote = { fontFamily: 'var(--font-body)', fontSize: '1rem', color: 'var(--ink)', margin: '0 0 18px 0', opacity: 0.85, fontStyle: 'italic', lineHeight: '1.6' };
const cardFooter = { display: 'flex', alignItems: 'center', gap: '10px' };
const cardFooterRule = { width: '18px', height: '1px', background: 'rgba(10,10,11,0.35)' };

// --- Mobile-only styles ---
const mWrap = { position: 'relative', zIndex: 5, paddingTop: '88px' };
const mAmbientBg = { position: 'absolute', top: 0, left: 0, width: '100%', height: '640px', zIndex: -1 };
const mHero = { padding: '10px 22px 28px', textAlign: 'center' };
const mBigTitle = { ...bigTitle, textAlign: 'center', whiteSpace: 'normal', fontSize: 'clamp(2.4rem, 12vw, 3.4rem)', lineHeight: 0.98 };
const mHeroSubtitle = { ...heroSubtitle, textAlign: 'center', fontSize: '0.9rem', maxWidth: '340px', margin: '16px auto 0' };
const mRacketStage = { position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '18px 0 22px' };
const mGlowDisk = { position: 'absolute', bottom: '6%', width: '52%', height: '16px', borderRadius: '50%', filter: 'blur(20px)', opacity: 0.18, background: 'rgba(10,10,11,0.6)', zIndex: -1 };
const mSelectorRow = { display: 'flex', gap: '10px', overflowX: 'auto', padding: '4px 2px 10px', scrollSnapType: 'x mandatory' };
const mRacketBtn = { ...racketBtn, flex: '0 0 60px', width: '60px', height: '60px', scrollSnapAlign: 'start' };
const mInfoCard = { margin: '0 16px 28px', padding: '26px 22px', background: 'rgba(255, 255, 255, 0.55)', border: '1px solid rgba(10,10,11,0.1)' };
const mRacketName = { ...racketName, fontSize: 'clamp(1.7rem, 7vw, 2.1rem)' };
const mPriceText = { ...priceText, marginBottom: '4px' };
const mSpecGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', marginTop: '22px', background: 'rgba(10,10,11,0.08)' };
const mSpecTile = { padding: '14px', background: '#f9f7f2' };
const mTestimonialSection = { padding: '8px 16px 40px' };
const mStackedCard = { position: 'relative', width: '100%', padding: '20px 0', borderTop: '1px solid rgba(10,10,11,0.1)' };
const mFooter = { textAlign: 'center', padding: '28px 16px 48px', borderTop: '1px solid rgba(10,10,11,0.08)' };

export default Portfolio;
