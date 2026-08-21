import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchDIAProducts } from '../services/bookingApi';
import type { DIAProduct, SelectedProduct } from '../types';
import { ProductConfigSheet } from '../components/ProductConfigSheet';
import { PullToRefresh } from '../../../components/ui/PullToRefresh';

const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const ProductIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
    <polyline points="2 17 12 22 22 17"></polyline>
    <polyline points="2 12 12 17 22 12"></polyline>
  </svg>
);

export function ProductSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any || {};
  
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<DIAProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Sheet state
  const [selectedProduct, setSelectedProduct] = useState<DIAProduct | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await searchDIAProducts(searchQuery);
        setProducts(data);
      } catch (err) {
        console.error('Failed to search products', err);
      } finally {
        setLoading(false);
      }
    };
    
    const timeoutId = setTimeout(fetchProducts, 300); // basic debounce
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleProductSave = (configuredProduct: SelectedProduct) => {
    setSelectedProduct(null);
    const existingProducts = state.selectedProducts || [];
    const targetPath = state.isEdit ? `/bookings/edit/${state.bookingId}/step2` : '/bookings/new/step2';
    
    navigate(targetPath, {
      replace: true,
      state: {
        step1Data: state.step1Data,
        selectedProducts: [...existingProducts, configuredProduct]
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EEF3FA] to-[#FFFFFF] relative z-0 pb-10">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[#EEF3FA] via-[#EEF3FA]/95 to-transparent pt-[calc(env(safe-area-inset-top,2rem)+1rem)] pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[800px] mx-auto flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(15,23,42,0.04)] border border-slate-900/5 text-text-primary hover:bg-gray-50 active:scale-95 transition-all"
            >
              <ArrowLeftIcon />
            </button>
            <h1 className="text-[22px] font-bold text-text-primary tracking-tight">Select Product</h1>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-[800px] mx-auto relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary opacity-60">
            <SearchIcon />
          </div>
          <input 
            type="text" 
            placeholder="Search products by name or shape..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white rounded-[16px] border border-slate-900/5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] outline-none focus:border-primary transition-colors text-[15px] font-medium placeholder:text-text-secondary placeholder:font-normal"
          />
        </div>
      </div>

      <PullToRefresh onRefresh={async () => {
        setSearchQuery('');
        const data = await searchDIAProducts('');
        setProducts(data);
      }}>
        <main className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex flex-col gap-4 pb-20">
          {loading ? (
            <div className="flex justify-center py-10">
              <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-[24px] p-6 shadow-sm border border-slate-900/5">
              <p className="text-text-secondary font-medium">No products found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {products.map(product => (
                <button 
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="bg-white rounded-[24px] p-5 shadow-[0_8px_24px_rgba(15,23,42,0.04)] border border-slate-900/5 flex flex-col gap-3 text-left transition-all hover:bg-slate-50 active:scale-[0.98]"
                >
                  <div className="flex gap-4 items-center">
                    {product.image ? (
                      <div className="w-14 h-14 bg-slate-100 rounded-[16px] overflow-hidden flex-shrink-0 border border-slate-200">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 bg-blue-50 text-blue-500 flex items-center justify-center rounded-[16px] flex-shrink-0 border border-blue-100/50">
                        <ProductIcon />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-[16px] font-bold text-text-primary leading-tight mb-1">{product.name}</h3>
                      <p className="text-[12px] font-medium text-text-secondary">
                        {product.dia_shape} • {product.dia_weight_type}
                      </p>
                    </div>
                  </div>
                  
                  {product.has_bundles && (
                    <div className="mt-2 inline-flex self-start bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase border border-indigo-100">
                      Bundles Available
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </main>
      </PullToRefresh>

      <ProductConfigSheet 
        isOpen={!!selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        product={selectedProduct}
        onSave={handleProductSave}
      />
    </div>
  );
}
