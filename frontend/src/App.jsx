import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [savedProducts, setSavedProducts] = useState([]);
  const [currentView, setCurrentView] = useState('input');
  const [productUrl, setProductUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [extractedProduct, setExtractedProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handleUrlSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post('https://product-upload-notabc.replit.app/extract', { 
        url: productUrl 
      });
      
      setExtractedProduct(response.data);
      setCurrentView('preview');
    } catch (error) {
      console.error('Error extracting product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = () => {
    if (extractedProduct) {
      setSavedProducts([...savedProducts, extractedProduct]);
      setCurrentView('saved');
    }
  };

  const handleReset = () => {
    setProductUrl('');
    setExtractedProduct(null);
    setCurrentView('input');
  };

  const renderInputView = () => (
    <div className="flex items-center justify-center w-screen h-screen bg-white">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-lg p-10">
        <h2 className="text-center text-2xl font-medium text-gray-800 mb-8">Upload Product</h2>
        <div className="flex items-center rounded-lg overflow-hidden">
          <input 
            type="text" 
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            placeholder="Product Page Link" 
            className="flex-grow p-2 outline-none text-white rounded-lg"
          />
          <button 
            onClick={handleUrlSubmit}
            className="bg-black text-white p-2 px-3 hover:bg-gray-800 mx-1 rounded-lg"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );

  const renderLoadingView = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
    </div>
  );

  const renderPreviewView = () => {
    if (!extractedProduct) return null;

    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-white p-4">
        <div className="flex flex-row justify-end w-full max-w-lg gap-4 mb-4">
          <button 
            onClick={handleReset}
            className="px-6 py-2 text-gray-200 hover:text-gray-900"
          >
            Reset
          </button>
          <button 
            onClick={handleSaveProduct}
            className="px-10 py-2 bg-green-700 text-white rounded-full hover:bg-green-800"
          >
            Save
          </button>
        </div>
        
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-lg p-10">
          <h2 className="text-xl font-medium text-gray-700 mb-6 flex items-center justify-center">
            {extractedProduct.product_name}
            <span className="ml-2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
            </span>
          </h2>
          <div className="flex justify-center mb-6">
            <img 
              src={extractedProduct.product_image} 
              alt={extractedProduct.product_name} 
              className="max-h-80 object-contain"
            />
          </div>
          <p className="text-gray-600 text-sm mb-4">{extractedProduct.product_desc}</p>
          <p className="text-gray-800 font-medium">${extractedProduct.product_price}</p>
        </div>
      </div>
    );
  };

  const renderSavedProductsView = () => (
    <div className="w-screen h-screen flex bg-white overflow-hidden">
      <div className="w-full md:w-1/3 lg:w-1/4 border-r p-6 overflow-y-auto">
        <div className="flex items-center mb-6 text-gray-900">
          <div className="mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="22"></line>
              <line x1="2" y1="12" x2="16" y2="12"></line>
            </svg>
          </div>
          <h2 className="text-lg font-medium">Saved Products</h2>
        </div>
        
        <button 
          onClick={() => setCurrentView('input')}
          className="w-full py-3 bg-blue-50 text-blue-600 rounded-full mb-6 hover:bg-blue-100"
        >
          Add New Product
        </button>
        
        <div className="space-y-4">
          {savedProducts.map((product, index) => (
            <div 
              key={index} 
              onClick={() => setSelectedProduct(product)}
              className={`border p-4 rounded-lg cursor-pointer ${
                selectedProduct === product ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xs text-gray-500 mb-1">{product.product_name}</div>
              <img 
                src={product.product_image} 
                alt={product.product_name} 
                className="w-full h-36 object-contain"
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="hidden md:block md:w-2/3 lg:w-3/4 p-10 flex-grow overflow-y-auto">
        {selectedProduct ? (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-lg p-10">
            <h2 className="text-xl font-medium text-gray-700 mb-6 flex items-center justify-center">
              {selectedProduct.product_name}
              <span className="ml-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              </span>
            </h2>
            <div className="flex justify-center mb-6">
              <img 
                src={selectedProduct.product_image} 
                alt={selectedProduct.product_name} 
                className="max-h-96 object-contain"
              />
            </div>
            <p className="text-gray-600 text-sm mb-4">{selectedProduct.product_desc}</p>
            <p className="text-gray-800 font-medium">${selectedProduct.product_price}</p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a product to view details
          </div>
        )}
      </div>

      {/* Mobile product detail view that appears when a product is selected */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-white z-10 md:hidden p-6 overflow-y-auto">
          <button 
            onClick={() => setSelectedProduct(null)} 
            className="mb-6 text-gray-600"
          >
            ← Back to Products
          </button>
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h2 className="text-xl font-medium text-gray-700 mb-6 flex items-center justify-center">
              {selectedProduct.product_name}
              <span className="ml-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              </span>
            </h2>
            <div className="flex justify-center mb-6">
              <img 
                src={selectedProduct.product_image} 
                alt={selectedProduct.product_name} 
                className="max-h-80 object-contain"
              />
            </div>
            <p className="text-gray-600 text-sm mb-4">{selectedProduct.product_desc}</p>
            <p className="text-gray-800 font-medium">${selectedProduct.product_price}</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {loading && renderLoadingView()}
      {currentView === 'input' && renderInputView()}
      {currentView === 'preview' && renderPreviewView()}
      {currentView === 'saved' && renderSavedProductsView()}
    </>
  );
}

export default App;