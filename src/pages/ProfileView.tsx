import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Trash2, User as UserIcon } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

export default function ProfileView() {
  const { user, signOut, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      navigate('/');
    } catch (error) {
      console.error('Failed to delete account', error);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <header className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-20 pt-[env(safe-area-inset-top)]">
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center space-x-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-display font-bold text-white">Profil</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 flex flex-col items-center text-center">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'Profil'} className="w-24 h-24 rounded-full border-4 border-zinc-800 mb-4" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <UserIcon className="h-10 w-10 text-zinc-500" />
            </div>
          )}
          <h2 className="text-2xl font-display font-bold text-white mb-1">{user.displayName || 'Névtelen Felhasználó'}</h2>
          <p className="text-zinc-400">{user.email}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSignOut}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center space-x-4 hover:bg-zinc-800/50 transition-colors active:scale-[0.98]"
          >
            <div className="p-3 rounded-xl bg-zinc-800 text-zinc-400">
              <LogOut className="h-6 w-6" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-display font-semibold text-white">Kijelentkezés</div>
              <div className="text-xs text-zinc-500 mt-0.5">Kijelentkezés a jelenlegi eszközről</div>
            </div>
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full bg-red-500/5 border border-red-500/10 rounded-2xl p-4 flex items-center space-x-4 hover:bg-red-500/10 transition-colors active:scale-[0.98]"
          >
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
              <Trash2 className="h-6 w-6" />
            </div>
            <div className="flex-1 text-left">
              <div className="font-display font-semibold text-red-500">Fiók törlése</div>
              <div className="text-xs text-red-500/70 mt-0.5">Minden adatod végleges törlése</div>
            </div>
          </button>
        </div>
      </main>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Fiók végleges törlése"
        message="Biztosan törölni szeretnéd a fiókodat? Ez a művelet nem vonható vissza, és minden adatod (sessionök, lőlapok) elvész."
        confirmText="Fiók törlése"
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
