import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingBag, ArrowLeft, Check, Sparkles } from 'lucide-react';

interface ShopPageProps {
  user: any;
  onBack: () => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ user, onBack }) => {
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [myInventory, setMyInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('nexus_jwt_token');

  const fetchData = async () => {
    try {
      const catalogRes = await axios.get('/api/inventory/shop');
      setShopItems(catalogRes.data);

      if (token) {
        const invRes = await axios.get('/api/inventory', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMyInventory(invRes.data);
      }
    } catch (e) {
      console.error('Failed to load shop data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const ownedMap = new Map(myInventory.map((i) => [i.itemId, i]));

  const handleBuy = async (itemId: string) => {
    try {
      await axios.post(
        `/api/inventory/buy/${itemId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchData();
      alert('Purchase successful!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Purchase failed.');
    }
  };

  const handleEquip = async (itemId: string) => {
    try {
      await axios.post(
        `/api/inventory/equip/${itemId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchData();
    } catch (err: any) {
      alert('Equip failed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={onBack}
        className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-400 text-xs font-semibold flex items-center space-x-2 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Lobby</span>
      </button>

      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/30 text-cyan-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Arena Item Shop</h2>
            <p className="text-xs text-slate-400">Purchase custom player sphere skins & trails using your match score points</p>
          </div>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold text-sm">
          Balance: {user?.totalScore || 0} pts
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 font-mono text-sm">Loading Shop Items Catalog...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shopItems.map((item) => {
            const owned = ownedMap.get(item.id);
            return (
              <div key={item.id} className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4 text-center">
                <div className="w-16 h-16 rounded-full mx-auto shadow-lg flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: item.hexColor }}>
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">{item.name}</h3>
                  <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-mono text-amber-400 font-bold">{item.priceCoins} pts</span>
                  {owned ? (
                    owned.isEquipped ? (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center">
                        <Check className="w-3.5 h-3.5 mr-1" /> EQUIPPED
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEquip(item.id)}
                        className="px-4 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-400 font-semibold text-xs hover:bg-cyan-500/20 transition"
                      >
                        Equip
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => handleBuy(item.id)}
                      className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition"
                    >
                      Buy Now
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
