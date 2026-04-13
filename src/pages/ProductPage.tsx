import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useCart } from '../hooks/useCart';
import { productService } from '../services/productService';
import { ProductGallery } from '../components/product/ProductGallery';
import { ProductInfo } from '../components/product/ProductInfo';
import { ProductTabs } from '../components/product/ProductTabs';
import { ProductCard } from '../components/product/ProductCard';

export const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFullData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await productService.fetchProductById(id);
        setProduct(data);
        
        // Fetch related products (same category)
        if (data?.category_id) {
          const related = await productService.fetchProducts({ categoryId: data.category_id });
          setRelatedProducts(related?.filter((p: any) => p.id !== id).slice(0, 4) || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFullData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-4xl font-black text-slate-800 mb-4">Object Not Found</h1>
            <p className="text-slate-500 mb-8 max-w-md">The product you are looking for might have been moved or is currently unavailable in our boutique.</p>
            <Link to="/shop" className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all">Return to Gallery</Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      
      <main className="flex-1">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-[1440px] mx-auto px-6 py-12"
        >
            <Link to="/shop" className="inline-flex items-center gap-3 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-primary mb-12 transition-all group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Boutique
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
                {/* Left: Gallery (Occupies 7/12 on large screens) */}
                <div className="lg:col-span-7">
                    <ProductGallery images={[product.image_url, product.image_url, product.image_url].filter(Boolean)} />
                </div>

                {/* Right: Info (Occupies 5/12 on large screens) */}
                <div className="lg:col-span-5">
                    <ProductInfo 
                        product={product} 
                        onAddToCart={(prod, vars) => addToCart({
                            id: product.id,
                            title: product.title,
                            price: (prod.price as number) ?? product.price,
                            image_url: product.image_url,
                            quantity: vars.quantity,
                            selectedSize: vars.size,
                            selectedColor: vars.color,
                        })} 
                    />
                </div>
            </div>

            <ProductTabs description={product.description} />
        </motion.div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
            <section className="bg-slate-50 py-24 mt-24">
                <div className="max-w-[1440px] mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-primary font-black tracking-widest uppercase text-xs block mb-3">You May Also Like</span>
                            <h2 className="text-4xl font-black text-slate-800 tracking-tight">Complete The Look</h2>
                        </div>
                        <Link to="/shop" className="font-black text-xs uppercase text-slate-400 hover:text-primary transition-colors">View All Gallery</Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {relatedProducts.map(p => (
                            <ProductCard key={p.id} {...p} />
                        ))}
                    </div>
                </div>
            </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

