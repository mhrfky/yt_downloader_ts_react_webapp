export const ErrorState: React.FC<{ error: Error }> = ({ error }) => (
    <div className="flex flex-col items-center justify-center h-64 space-y-4 bg-red-50 rounded-lg">
      <p className="text-red-600">Error: {error.message}</p>
    </div>
  );