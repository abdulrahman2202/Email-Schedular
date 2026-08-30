export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-[#10B981] rounded-full animate-spin" />
      <p className="text-sm text-gray-500 mt-3">Loading...</p>
    </div>
  );
}
