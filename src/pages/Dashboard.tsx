import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Session } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Target, LogOut, Calendar, ChevronRight } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
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
    try {
      const newSession = {
        ownerId: user.uid,
        date: new Date().toISOString(),
        status: 'active',
        createdAt: new Date().toISOString(),
      };
      const docRef = await addDoc(collection(db, 'sessions'), newSession);
      navigate(`/session/${docRef.id}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'sessions');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <header className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-cyan-500/10 p-2 rounded-xl">
              <Target className="h-6 w-6 text-cyan-400" />
            </div>
            <h1 className="text-xl font-display font-bold text-white tracking-tight">ShootingRange</h1>
          </div>
          <button onClick={signOut} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Sessionök</h2>
            <p className="text-2xl font-display font-bold text-white mt-1">Lövészetek</p>
          </div>
        </div>

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
                    <div className="text-xs text-zinc-400 mt-0.5 flex items-center space-x-2">
                      <span className="relative flex h-2 w-2">
                        {session.status === 'active' && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        )}
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${session.status === 'active' ? 'bg-emerald-500' : 'bg-zinc-600'}`}></span>
                      </span>
                      <span>{session.status === 'active' ? 'Folyamatban' : 'Befejezett'}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-zinc-600 group-hover:text-cyan-400 transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 left-0 right-0 px-4 max-w-lg mx-auto pointer-events-none">
        <button
          onClick={createSession}
          className="pointer-events-auto w-full flex items-center justify-center space-x-2 bg-cyan-400 text-zinc-950 py-4 rounded-2xl font-display font-bold text-lg shadow-[0_8px_30px_rgba(34,211,238,0.3)] hover:bg-cyan-300 active:scale-[0.98] transition-all"
        >
          <Plus className="h-6 w-6" />
          <span>Új Session Kezdése</span>
        </button>
      </div>
    </div>
  );
}
