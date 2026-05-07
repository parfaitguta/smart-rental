import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Smart Rental</h1>
          <p className="text-xl mb-6">Find Your Perfect Home in Rwanda</p>
          <p className="text-blue-100 mb-8">Rent properties easily with MTN MoMo and Airtel Money</p>
          <div className="flex gap-4 justify-center">
            <Link to="/register" className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-6 py-2 rounded-lg font-semibold">
              Get Started
            </Link>
            <Link to="/login" className="border-2 border-white hover:bg-white hover:text-blue-600 px-6 py-2 rounded-lg font-semibold">
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800">Why Choose Smart Rental?</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center p-6 border rounded-lg">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-semibold text-gray-800 mb-2">Find Properties</h3>
            <p className="text-gray-500 text-sm">Search thousands of properties across Rwanda</p>
          </div>
          <div className="text-center p-6 border rounded-lg">
            <div className="text-3xl mb-3">💳</div>
            <h3 className="font-semibold text-gray-800 mb-2">Pay Online</h3>
            <p className="text-gray-500 text-sm">Pay rent via MTN MoMo or Airtel Money</p>
          </div>
          <div className="text-center p-6 border rounded-lg">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-semibold text-gray-800 mb-2">Chat with Landlord</h3>
            <p className="text-gray-500 text-sm">Direct messaging with property owners</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6">Join thousands of users already using Smart Rental</p>
          <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold">
            Create Free Account
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>&copy; 2026 Smart Rental. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-2 text-sm">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/login" className="hover:text-white">Sign In</Link>
            <Link to="/register" className="hover:text-white">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}