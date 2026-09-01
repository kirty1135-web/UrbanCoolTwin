import { useState } from 'react';

export default function PrototypeMap() {
  const [layer, setLayer] = useState('Heat');
  const [popupOpen, setPopupOpen] = useState(false);

  const togglePopup = () => setPopupOpen(!popupOpen);

  const getBlobStyle = (index: number) => {
    if (layer === 'Heat') {
      return { opacity: [0.68, 0.68, 0.68, 0.68, 0.52][index] };
    }
    if (layer === 'Vegetation') return { background: '#22c55e' };
    if (layer === 'AQI') return { background: '#dc2626' };
    return { background: '#8b5cf6' }; // Buildings
  };

  return (
    <div className="map-wrap">
      <div className="map-base"></div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div 
          key={i} 
          className={`heat-blob blob${i}`} 
          style={getBlobStyle(i - 1)}
        ></div>
      ))}
      <div className="road r1"></div><div className="road r2"></div><div className="road r3"></div>
      
      <div className="map-controls">
        {['Heat', 'AQI', 'Vegetation', 'Buildings'].map((l) => (
          <button 
            key={l}
            className={`layer-btn ${layer === l ? 'active' : ''}`}
            onClick={() => setLayer(l)}
          >
            {l}
          </button>
        ))}
      </div>
      
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className={`marker m${i}`} onClick={togglePopup}></div>
      ))}
      
      <div className={`map-popup ${popupOpen ? 'show' : ''}`}>
        <strong>Central Bhubaneswar</strong>
        <div className="popup-row"><span>AQI</span><b>82</b></div>
        <div className="popup-row"><span>Temperature</span><b>39.1°C</b></div>
        <div className="popup-row"><span>LST</span><b>42.0°C</b></div>
        <div className="popup-row"><span>NDVI</span><b>.21</b></div>
      </div>
      
      <div className="legend">
        <b>{layer.toUpperCase()} INTENSITY</b>
        <div className="gradient"></div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Low</span><span>High</span>
        </div>
      </div>
    </div>
  );
}
