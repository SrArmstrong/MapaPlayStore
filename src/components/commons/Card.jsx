const Card = ({ children }) => (
  <div style={{
    padding: '1rem',
    borderRadius: '8px',
    backgroundColor: 'rgba(255,255,255,0.95)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
  }}>
    {children}
  </div>
);

export default Card;
