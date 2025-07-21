export default function Title({ icon, text }) {
  return (
    <div className="flex items-center space-x-3 mb-4">
      {icon}
      <h2 className="text-xl font-semibold text-white tracking-wide">{text}</h2>
    </div>
  );
}
