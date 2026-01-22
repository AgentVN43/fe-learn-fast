export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Learn Fast</h1>
        <p className="text-gray-600 mb-8">Learn effectively with interactive flashcards</p>
        <a href="/study-sets" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition">
          Get Started
        </a>
      </div>
    </div>
  );
}
