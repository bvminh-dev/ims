import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import { Package, FolderTree, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold">IMS</span>
          </div>
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                  Sign Up
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Go to Dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Inventory Management System
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Streamline your inventory management with a modern, efficient system
          built for scale.
        </p>
        <SignedOut>
          <div className="flex gap-4 justify-center">
            <SignUpButton mode="modal">
              <button className="px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                Get Started
              </button>
            </SignUpButton>
          </div>
        </SignedOut>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <Package className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Product Management</h3>
            <p className="text-gray-600">
              Full CRUD operations for products with search, filter, and
              pagination.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <FolderTree className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              Category Organization
            </h3>
            <p className="text-gray-600">
              Organize products into categories for better management.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <BarChart3 className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Real-time Insights</h3>
            <p className="text-gray-600">
              Dashboard with stats, low stock alerts, and recent products.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-600">
          <p>&copy; 2024 Inventory Management System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
