import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  type?: 'aqi' | 'heat' | 'temp' | 'green' | 'default';
  children?: React.ReactNode;
}

export default function MetricCard({ label, value, sub, type = 'default', children }: MetricCardProps) {
  const typeClass = type !== 'default' ? ` ${type}` : '';
  
  return (
    <div className={`card metric${typeClass}`}>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
      {children && <div>{children}</div>}
      {sub && <div className="sub">{sub}</div>}
    </div>
  );
}
