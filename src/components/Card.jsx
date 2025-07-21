export default function Card({ children, className = "" }) {
  return (
    <div
      className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-lg p-6 ${className}`}
    >
      {children}
    </div>
  );
}
