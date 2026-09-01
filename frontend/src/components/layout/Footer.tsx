export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 0', color: 'var(--muted)', fontSize: '12px' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', flexWrap: 'wrap' }}>
        <span>UrbanCool Twin · Public environmental intelligence prototype</span>
        <span>Observations · Analysis · Prediction · Export</span>
      </div>
    </footer>
  );
}
