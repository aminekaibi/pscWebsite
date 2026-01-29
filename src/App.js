import { useMemo, useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

function App() {
  const [scrollY, setScrollY] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);

  const questions = [
    { id: 1, text: "Do you experience persistent fatigue or weakness?", category: "hypo" },
    { id: 2, text: "Have you noticed unexplained weight gain recently?", category: "hypo" },
    { id: 3, text: "Do you feel unusually sensitive to cold temperatures?", category: "hypo" },
    { id: 4, text: "Have you been experiencing depression or mood changes?", category: "hypo" },
    { id: 5, text: "Do you have dry skin or hair loss?", category: "hypo" },
    { id: 6, text: "Have you noticed memory problems or difficulty concentrating?", category: "hypo" },
    { id: 7, text: "Do you experience frequent constipation?", category: "hypo" },
    { id: 8, text: "Have you noticed a slower heart rate than usual?", category: "hypo" },
    { id: 9, text: "Do you experience rapid or irregular heartbeat?", category: "hyper" },
    { id: 10, text: "Have you had unexplained weight loss?", category: "hyper" },
    { id: 11, text: "Do you feel anxious, nervous, or irritable?", category: "hyper" },
    { id: 12, text: "Are you unusually sensitive to heat?", category: "hyper" },
    { id: 13, text: "Do you experience hand tremors or shaking?", category: "hyper" },
    { id: 14, text: "Have you been having trouble sleeping?", category: "hyper" },
    { id: 15, text: "Do you sweat more than usual?", category: "hyper" },
    { id: 16, text: "Have you noticed muscle weakness?", category: "hyper" },
    { id: 17, text: "Do you have a visible swelling or lump in your neck?", category: "general" },
    { id: 18, text: "Have you experienced changes in your menstrual cycle (if applicable)?", category: "general" },
  ];

  const tunisianHealthcareLocations = useMemo(
    () => [
      { name: 'Charles Nicolle Univ. Hospital', lat: 36.802247, lng: 10.161222 },
      { name: 'Farhat Hached Univ. Hospital', lat: 35.82961, lng: 10.627749 },
      { name: 'Fattouma Bourguiba Univ. Hospital', lat: 35.76774, lng: 10.83637 },
      { name: 'Hedi Chaker Univ. Hospital', lat: 34.740725, lng: 10.750304 },
      { name: 'International Hospital Center (Carthagène)', lat: 36.84537, lng: 10.20004 },
      { name: 'Clinique Internationale Hannibal', lat: 36.84515, lng: 10.28397 },
      { name: 'Clinique El Menzah', lat: 36.827283, lng: 10.179197 },
      { name: 'Taoufik Hospitals Group', lat: 36.83185, lng: 10.15594 },
      { name: 'Hopital Militaire (Tunis)', lat: 36.785497, lng: 10.178222 },
    ],
    []
  );

  // Fix Leaflet default marker icons (CRA bundling)
  const leafletIcon = useMemo(() => {
    // eslint-disable-next-line global-require
    const icon2x = require('leaflet/dist/images/marker-icon-2x.png');
    // eslint-disable-next-line global-require
    const icon = require('leaflet/dist/images/marker-icon.png');
    // eslint-disable-next-line global-require
    const shadow = require('leaflet/dist/images/marker-shadow.png');

    return new L.Icon({
      iconRetinaUrl: icon2x,
      iconUrl: icon,
      shadowUrl: shadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      // Calculate zoom level based on scroll
      // Zoom increases as user scrolls down
      const maxScroll = 2000; // Adjust based on content height
      const maxZoom = 3; // Maximum zoom level
      const zoom = 1 + (currentScrollY / maxScroll) * (maxZoom - 1);
      setZoomLevel(Math.min(zoom, maxZoom));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAnswer = (answer) => {
    const newAnswers = { ...answers, [questions[currentQuestion].id]: answer };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateResult = () => {
    let hypoScore = 0;
    let hyperScore = 0;
    let generalScore = 0;

    questions.forEach((q) => {
      if (answers[q.id] === true) {
        if (q.category === 'hypo') hypoScore++;
        else if (q.category === 'hyper') hyperScore++;
        else generalScore++;
      }
    });

    const totalScore = hypoScore + hyperScore + generalScore;
    const hypoQuestions = questions.filter(q => q.category === 'hypo').length;
    const hyperQuestions = questions.filter(q => q.category === 'hyper').length;

    return {
      hypoScore,
      hyperScore,
      generalScore,
      totalScore,
      hypoPercentage: (hypoScore / hypoQuestions) * 100,
      hyperPercentage: (hyperScore / hyperQuestions) * 100,
    };
  };

  const getResultMessage = () => {
    const result = calculateResult();
    const { hypoScore, hyperScore, totalScore, hypoPercentage, hyperPercentage } = result;

    // High risk thresholds
    if (totalScore >= 8 || hypoPercentage >= 60 || hyperPercentage >= 60) {
      return {
        risk: 'high',
        title: 'High Risk Detected',
        message: 'You have answered "Yes" to several symptoms that may indicate a thyroid condition. It is strongly recommended that you consult with a healthcare professional or endocrinologist as soon as possible.',
        recommendation: 'Please schedule an appointment with your doctor. Early detection and treatment are important for managing thyroid conditions effectively.',
        color: '#ff1493'
      };
    } else if (totalScore >= 5 || hypoPercentage >= 40 || hyperPercentage >= 40) {
      return {
        risk: 'medium',
        title: 'Moderate Risk',
        message: 'You have reported some symptoms that could be related to thyroid function. While not urgent, it would be beneficial to discuss these symptoms with a healthcare provider.',
        recommendation: 'Consider scheduling a check-up with your doctor to discuss your symptoms and possibly get a thyroid function test.',
        color: '#ffd700'
      };
    } else if (totalScore >= 2) {
      return {
        risk: 'low',
        title: 'Low Risk',
        message: 'You have reported a few symptoms. These may be normal variations or could be related to other factors. Monitor your symptoms and maintain regular health check-ups.',
        recommendation: 'Continue to monitor your health. If symptoms persist or worsen, consider consulting with a healthcare professional.',
        color: '#9370db'
      };
    } else {
      return {
        risk: 'minimal',
        title: 'Minimal Risk',
        message: 'Based on your answers, you show minimal signs of thyroid-related symptoms. However, this is not a substitute for professional medical advice.',
        recommendation: 'Continue maintaining a healthy lifestyle and regular health check-ups. If you develop any new symptoms, consult with a healthcare provider.',
        color: '#4ade80'
      };
    }
  };

  const resetQuestionnaire = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
  };

  const mapCenter = useMemo(() => [35.7, 10.3], []);

  return (
    <div className="App">
      {/* Animated Background with Zoom Effect */}
      <div 
        className="animated-background"
        style={{
          transform: `scale(${zoomLevel})`,
          transition: 'transform 0.1s ease-out'
        }}
      >
        <div className="gradient-overlay"></div>
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
        <div className="glow-orb orb-3"></div>
        <div className="glow-orb orb-4"></div>
        <div className="swirl swirl-1"></div>
        <div className="swirl swirl-2"></div>
      </div>

      {/* Content Container */}
      <div className="content-container">
        <section className="hero-section">
          <h1 className="hero-title">ThyroCare</h1>
          <p className="hero-subtitle">Exploring the balance of health and wellness</p>
        </section>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="scroll-arrow"></div>
        </div>

        {/* Spacer to enable scrolling */}
        <div className="scroll-spacer"></div>

        {/* Thyroid Gland Section - Reveals as you scroll */}
        <section 
          className="thyroid-section"
          style={{
            opacity: Math.min(scrollY / 500, 1),
            transform: `translateY(${Math.max(0, 500 - scrollY)}px)`
          }}
        >
          <div className="thyroid-container">
            <div className="thyroid-gland">
              <div className="thyroid-lobe left-lobe"></div>
              <div className="thyroid-isthmus"></div>
              <div className="thyroid-lobe right-lobe"></div>
            </div>
            <h2 className="thyroid-title">Thyroid Gland</h2>
            <p className="thyroid-description">
              The butterfly-shaped gland that regulates your metabolism
            </p>
          </div>
        </section>

        {/* What is Thyroid Gland Section */}
        <section className="info-section what-is-section">
          <div className="info-container">
            <h2 className="section-title">What is the Thyroid Gland?</h2>
            <div className="info-grid">
              <div className="info-card">
                <div className="card-icon">📍</div>
                <h3 className="card-title">Location</h3>
                <p className="card-text">
                  The thyroid gland is located in the front of your neck, just below the Adam's apple. 
                  It's a small, butterfly-shaped organ that wraps around your windpipe.
                </p>
              </div>
              <div className="info-card">
                <div className="card-icon">⚡</div>
                <h3 className="card-title">Function</h3>
                <p className="card-text">
                  The thyroid produces hormones (T3 and T4) that regulate your body's metabolism, 
                  energy levels, heart rate, body temperature, and growth.
                </p>
              </div>
              <div className="info-card">
                <div className="card-icon">🎯</div>
                <h3 className="card-title">Importance</h3>
                <p className="card-text">
                  Every cell in your body depends on thyroid hormones to function properly. 
                  They control how fast your body uses energy and how sensitive it is to other hormones.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Thyroid Diseases Section */}
        <section className="info-section diseases-section">
          <div className="info-container">
            <h2 className="section-title">Thyroid Disorders & Their Effects</h2>
            <div className="diseases-grid">
              <div className="disease-card hypothyroidism">
                <div className="disease-header">
                  <h3 className="disease-title">Hypothyroidism</h3>
                  <div className="disease-icon">🐢</div>
                </div>
                <p className="disease-subtitle">Underactive Thyroid</p>
                <div className="disease-symptoms">
                  <h4 className="symptoms-title">Symptoms & Effects:</h4>
                  <ul className="symptoms-list">
                    <li>Fatigue and weakness</li>
                    <li>Weight gain</li>
                    <li>Cold intolerance</li>
                    <li>Depression and mood changes</li>
                    <li>Dry skin and hair loss</li>
                    <li>Memory problems</li>
                    <li>Constipation</li>
                    <li>Slow heart rate</li>
                  </ul>
                </div>
                <p className="disease-impact">
                  <strong>Impact:</strong> The body's metabolism slows down, affecting energy production 
                  and causing various systems to function below normal levels.
                </p>
              </div>

              <div className="disease-card hyperthyroidism">
                <div className="disease-header">
                  <h3 className="disease-title">Hyperthyroidism</h3>
                  <div className="disease-icon">⚡</div>
                </div>
                <p className="disease-subtitle">Overactive Thyroid</p>
                <div className="disease-symptoms">
                  <h4 className="symptoms-title">Symptoms & Effects:</h4>
                  <ul className="symptoms-list">
                    <li>Rapid heartbeat</li>
                    <li>Weight loss</li>
                    <li>Anxiety and irritability</li>
                    <li>Heat intolerance</li>
                    <li>Tremors</li>
                    <li>Sleep problems</li>
                    <li>Increased sweating</li>
                    <li>Muscle weakness</li>
                  </ul>
                </div>
                <p className="disease-impact">
                  <strong>Impact:</strong> The body's metabolism speeds up excessively, causing 
                  the body to burn energy too quickly and affecting multiple organ systems.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Additional Info Section */}
        <section className="info-section additional-info-section">
          <div className="info-container">
            <h2 className="section-title">Other Thyroid Conditions</h2>
            <div className="conditions-grid">
              <div className="condition-item">
                <h4 className="condition-name">Goiter</h4>
                <p>Enlargement of the thyroid gland, often visible as a swelling in the neck.</p>
              </div>
              <div className="condition-item">
                <h4 className="condition-name">Thyroid Nodules</h4>
                <p>Lumps that form within the thyroid gland, usually benign but require monitoring.</p>
              </div>
              <div className="condition-item">
                <h4 className="condition-name">Thyroid Cancer</h4>
                <p>Malignant growth in the thyroid, often treatable with early detection.</p>
              </div>
              <div className="condition-item">
                <h4 className="condition-name">Hashimoto's Disease</h4>
                <p>Autoimmune disorder causing chronic inflammation and hypothyroidism.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Questionnaire Section */}
        <section className="info-section questionnaire-section">
          <div className="info-container">
            <h2 className="section-title">Thyroid Health Assessment</h2>
            <p className="questionnaire-intro">
              Answer the following questions to assess your potential risk for thyroid conditions. 
              This is not a medical diagnosis, but can help you understand if you should consult a healthcare professional.
            </p>

            {!showResult ? (
              <div className="questionnaire-container">
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
                <p className="progress-text">
                  Question {currentQuestion + 1} of {questions.length}
                </p>

                <div className="question-card">
                  <h3 className="question-text">{questions[currentQuestion].text}</h3>
                  <div className="answer-buttons">
                    <button 
                      className="answer-btn yes-btn"
                      onClick={() => handleAnswer(true)}
                    >
                      <span className="btn-icon">✓</span>
                      Yes
                    </button>
                    <button 
                      className="answer-btn no-btn"
                      onClick={() => handleAnswer(false)}
                    >
                      <span className="btn-icon">✗</span>
                      No
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="result-container">
                {(() => {
                  const result = getResultMessage();
                  return (
                    <>
                      <div className="result-card" style={{ borderTopColor: result.color }}>
                        <div className="result-header">
                          <h3 className="result-title" style={{ color: result.color }}>
                            {result.title}
                          </h3>
                          <div className="result-icon" style={{ color: result.color }}>
                            {result.risk === 'high' ? '⚠️' : 
                             result.risk === 'medium' ? '⚡' : 
                             result.risk === 'low' ? '💡' : '✓'}
                          </div>
                        </div>
                        <p className="result-message">{result.message}</p>
                        <div className="result-recommendation">
                          <h4 className="recommendation-title">Recommendation:</h4>
                          <p>{result.recommendation}</p>
                        </div>
                        <div className="result-disclaimer">
                          <strong>Important:</strong> This assessment is for informational purposes only 
                          and is not a substitute for professional medical advice, diagnosis, or treatment. 
                          Always seek the advice of qualified health providers with any questions you may have.
                        </div>
                        <button className="restart-btn" onClick={resetQuestionnaire}>
                          Take Assessment Again
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        </section>

        {/* Our Team Section - 4 columns */}
        <section className="info-section team-section">
          <div className="info-container">
            <h2 className="section-title">Our Team</h2>
            <p className="team-intro">
              The people behind ThyroCare.
            </p>
            <div className="team-grid">
              {[
                { img: 'team1.png', name: 'Your Name' },
                { img: 'team2.png', name: 'Your Name' },
                { img: 'team3.png', name: 'Your Name' },
                { img: 'team4.png', name: 'Your Name' },
                { img: 'team5.png', name: 'Your Name' },
                { img: 'team6.png', name: 'Your Name' },
                { img: 'team7.png', name: 'Your Name' },
              ].map((member, index) => (
                <div key={index} className="team-card">
                  <div className="team-photo-wrap">
                    <img
                      src={`${process.env.PUBLIC_URL}/team/${member.img}`}
                      alt={member.name}
                      className="team-photo"
                    />
                  </div>
                  <p className="team-name">{member.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Find a Clinic Section */}
        <section className="info-section map-section">
          <div className="info-container">
            <h2 className="section-title">Find a Clinic in Tunisia</h2>
            <p className="map-intro">
              If your assessment suggests you should talk to a professional, use this map to find hospitals and clinics.
              Tap a marker to see the name and open directions.
            </p>

            <div className="map-card">
              <MapContainer
                center={mapCenter}
                zoom={6}
                scrollWheelZoom={false}
                className="leaflet-map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {tunisianHealthcareLocations.map((place) => (
                  <Marker
                    key={`${place.name}-${place.lat}-${place.lng}`}
                    position={[place.lat, place.lng]}
                    icon={leafletIcon}
                  >
                    <Popup>
                      <div className="popup-content">
                        <div className="popup-title">{place.name}</div>
                        <a
                          className="popup-link"
                          href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open in Google Maps
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </section>

        {/* Additional content spacer */}
        <div className="content-spacer"></div>
      </div>
    </div>
  );
}

export default App;
