import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, addDoc, orderBy, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Session } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Target, Calendar, ChevronRight, Trash2, User as UserIcon, MapPin } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import ConfirmModal from '../components/ConfirmModal';
import { getCurrentAddress } from '../lib/location';

export default function Dashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'sessions'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sessionData: Session[] = [];
      snapshot.forEach((doc) => {
        sessionData.push({ id: doc.id, ...doc.data() } as Session);
      });
      setSessions(sessionData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'sessions');
    });

    return () => unsubscribe();
  }, [user]);

  const createSession = async () => {
    if (!user) return;
    setIsCreating(true);
    try {
      const locationData = await getCurrentAddress();
      const newSession = {
        ownerId: user.uid,
        date: new Date().toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
        location: locationData.address,
        ...(locationData.coordinates ? { coordinates: locationData.coordinates } : {})
      };
      const docRef = await addDoc(collection(db, 'sessions'), newSession);
      navigate(`/session/${docRef.id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'sessions');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete || !user) return;
    try {
      // First, delete all participants associated with this session
      const q = query(
        collection(db, 'participants'), 
        where('sessionId', '==', sessionToDelete.id),
        where('ownerId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(participantDoc => 
        deleteDoc(doc(db, 'participants', participantDoc.id))
      );
      await Promise.all(deletePromises);

      // Then delete the session itself
      await deleteDoc(doc(db, 'sessions', sessionToDelete.id));
      setSessionToDelete(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `sessions/${sessionToDelete.id}`);
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-zinc-950 w-full overflow-hidden">
      <header className="px-4 pt-[calc(env(safe-area-inset-top)+1.5rem)] pb-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">ShootingRange</h2>
          </div>
          <Link to="/profile" className="p-1 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-full transition-all active:scale-95 overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Profil" className="h-10 w-10 rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <div className="h-10 w-10 flex items-center justify-center">
                <UserIcon className="h-6 w-6" />
              </div>
            )}
          </Link>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 pb-32">

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-3xl p-8 text-center mt-8">
            <div className="bg-zinc-800/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-display font-medium text-white mb-2">Nincs még session</h3>
            <p className="text-zinc-400 text-sm mb-6">Kezdj egy új lövészeti sessiont a lenti gombbal.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <Link
                key={session.id}
                to={`/session/${session.id}`}
                className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between hover:border-cyan-500/50 transition-all active:scale-[0.98]"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl ${session.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-display font-semibold text-white">
                      {new Date(session.date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5 flex items-center space-x-1">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate max-w-[180px]">{session.location || 'Ismeretlen helyszín'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setSessionToDelete(session);
                    }}
                    className="p-2 text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="absolute bottom-6 left-0 right-0 px-4 max-w-lg mx-auto pointer-events-none z-10">
        <button
          onClick={createSession}
          disabled={isCreating}
          className="pointer-events-auto w-full flex items-center justify-center space-x-2 bg-cyan-400 text-zinc-950 py-4 rounded-2xl font-display font-bold text-lg shadow-[0_8px_30px_rgba(34,211,238,0.3)] hover:bg-cyan-300 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100"
        >
          {isCreating ? (
            <div className="w-6 h-6 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
          <span>{isCreating ? 'Helyszín lekérése...' : 'Új Session Kezdése'}</span>
        </button>
      </div>

      <ConfirmModal
        isOpen={!!sessionToDelete}
        title="Session törlése"
        message="Biztosan törölni szeretnéd ezt a sessiont? A résztvevők és az eredmények is véglegesen törlődnek."
        confirmText="Törlés"
        onConfirm={handleDeleteSession}
        onCancel={() => setSessionToDelete(null)}
      />
    </div>
  );
}
