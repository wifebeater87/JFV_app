export default function Skeleton({ className }) {
  return (
    <div 
      className={`bg-slate-700/50 animate-pulse rounded-xl ${className}`} 
    ></div>
  );
}