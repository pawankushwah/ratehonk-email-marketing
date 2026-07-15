import { Hammer } from "lucide-react";

export default function ComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="w-24 h-24 bg-main-dim rounded-full flex items-center justify-center mb-8">
        <Hammer className="w-12 h-12 text-main" />
      </div>
      <h2 className="text-3xl font-bold text-text mb-4">Coming Soon</h2>
      <p className="text-text-dim max-w-md mx-auto mb-8 leading-relaxed">
        We are working hard to bring this feature to you. Stay tuned!
      </p>
    </div>
  );
}
