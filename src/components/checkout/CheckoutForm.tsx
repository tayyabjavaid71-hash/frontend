import React from 'react';
import { User, Phone, MapPin, Truck, CheckCircle2, Package, Search } from 'lucide-react';

interface CheckoutFormProps {
  formData: {
    name: string;
    phone: string;
    address: string;
    city: string;
  };
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

export const CheckoutForm: React.FC<CheckoutFormProps> = ({ 
  formData, 
  setFormData, 
  onSubmit, 
  loading 
}) => {
  const popularCities = ['Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Rawalpindi', 'Multan', 'Peshawar'];

  return (
    <form 
      id="cod-form" 
      onSubmit={onSubmit} 
      className={`space-y-12 transition-all duration-500 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <div className="space-y-10">
        {/* PERSONAL INFO SECTION */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-[10px] font-black">
              01
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
              Contact Details
            </h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Full Name
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  required 
                  disabled={loading}
                  type="text" 
                  placeholder="e.g. Ahmad Khan"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-5 focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-800 disabled:cursor-not-allowed" 
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Phone Number
              </label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  required 
                  disabled={loading}
                  type="tel" 
                  placeholder="+92 3XX XXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-5 focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-800 disabled:cursor-not-allowed" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* ADDRESS SECTION */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-[10px] font-black">
              02
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800">
              Shipping Destination
            </h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                Street Address
              </label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                <input 
                  required 
                  disabled={loading}
                  type="text" 
                  placeholder="House #, Street name, Area"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-5 focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-800 disabled:cursor-not-allowed" 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  City
                </label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                  <input 
                    required 
                    disabled={loading}
                    list="cities"
                    placeholder="Search city..."
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-5 focus:outline-none focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all font-bold text-slate-800 disabled:cursor-not-allowed" 
                  />
                  <datalist id="cities">
                    {popularCities.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                  Shipping Tier
                </label>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Truck size={20} className="text-primary" />
                    <span className="font-bold text-slate-800 text-sm">
                      {loading ? 'Processing...' : 'Standard Delivery'}
                    </span>
                  </div>
                  <span className="text-[8px] font-black uppercase text-primary bg-primary/10 px-2 py-1 rounded-md tracking-widest">
                    Selected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PAYMENT INFO BOX */}
      <div className="p-10 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Package size={140} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center">
              <CheckCircle2 size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">Secure Cash On Delivery</h3>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-1">
                Payment Method
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-lg">
            You've selected Cash on Delivery. Your boutique order will be processed instantly and payment will be collected when your selection reaches your doorstep. 
            <span className="block mt-4 text-white/60 font-bold italic">No pre-payment required.</span>
          </p>
        </div>
      </div>
    </form>
  );
};
