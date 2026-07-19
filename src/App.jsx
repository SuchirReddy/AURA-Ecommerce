import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Auth Guards
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminRoute from './components/auth/AdminRoute';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import Category from './pages/Category';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import TrackOrder from './pages/TrackOrder';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AccountLayout from './pages/account/AccountLayout';
import Dashboard from './pages/account/Dashboard';
import Orders from './pages/account/Orders';
import Wishlist from './pages/account/Wishlist';
import Addresses from './pages/account/Addresses';
import Settings from './pages/account/Settings';
import Notifications from './pages/account/Notifications';

import StorefrontLayout from './components/layouts/StorefrontLayout';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductsList from './pages/admin/products/ProductsList';
import ProductForm from './pages/admin/products/ProductForm';
import CategoriesList from './pages/admin/categories/CategoriesList';
import CategoryForm from './pages/admin/categories/CategoryForm';
import OrdersList from './pages/admin/orders/OrdersList';
import OrderDetails from './pages/admin/orders/OrderDetails';
import CustomersList from './pages/admin/customers/CustomersList';
import CustomerProfile from './pages/admin/customers/CustomerProfile';
import InventoryDashboard from './pages/admin/inventory/InventoryDashboard';
import AnalyticsDashboard from './pages/admin/analytics/AnalyticsDashboard';
import CouponsList from './pages/admin/coupons/CouponsList';
import CouponForm from './pages/admin/coupons/CouponForm';
import ReviewsList from './pages/admin/reviews/ReviewsList';
import ContentManager from './pages/admin/content/ContentManager';
import ShippingReturns from './pages/admin/shipping/ShippingReturns';
import AdminSettings from './pages/admin/settings/AdminSettings';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <div className="app">
        <Toaster position="top-center" />
        <Routes>

          {/* Storefront Routes (with Navbar & Footer) */}
          <Route element={<StorefrontLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/contact" element={<Contact />} />

            {/* Auth Routes */}
            <Route path="/login/*" element={<Login />} />
            <Route path="/signup/*" element={<Signup />} />

            {/* Account Dashboard Routes */}
            <Route path="/account" element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="addresses" element={<Addresses />} />
              <Route path="settings" element={<Settings />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>
          </Route>

          {/* Standalone Storefront Routes */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation" element={<OrderConfirmation />} />

          {/* Admin Routes (Standalone Layout) */}
          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />

            {/* Products & Categories */}
            <Route path="products" element={<ProductsList />} />
            <Route path="products/new" element={<ProductForm />} />
            <Route path="products/edit/:id" element={<ProductForm />} />
            <Route path="categories" element={<CategoriesList />} />
            <Route path="categories/new" element={<CategoryForm />} />
            <Route path="categories/edit/:id" element={<CategoryForm />} />

            {/* Orders & Customers & Inventory */}
            <Route path="orders" element={<OrdersList />} />
            <Route path="orders/:id" element={<OrderDetails />} />
            <Route path="customers" element={<CustomersList />} />
            <Route path="customers/:id" element={<CustomerProfile />} />
            <Route path="inventory" element={<InventoryDashboard />} />

            {/* Analytics & Marketing & Content */}
            <Route path="analytics" element={<AnalyticsDashboard />} />
            <Route path="coupons" element={<CouponsList />} />
            <Route path="coupons/new" element={<CouponForm />} />
            <Route path="coupons/edit/:id" element={<CouponForm />} />
            <Route path="reviews" element={<ReviewsList />} />
            <Route path="content" element={<ContentManager />} />
            <Route path="shipping" element={<ShippingReturns />} />

            {/* Settings */}
            <Route path="settings" element={<AdminSettings />} />
          </Route>

        </Routes>
      </div>
    </Router>
  );
}

export default App;
