import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc, collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Session, Participant } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { ArrowLeft, Plus, Users, BarChart2, X, MapPin } from 'lucide-react';
import ParticipantCard from '../components/ParticipantCard';
import ReportView from '../components/ReportView';

export default function SessionView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNickname, setNewNickname] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);

  useEffect(() => {
    if (!user || !id) return;

    const fetchSession = async () => {
      try {
        const docRef = doc(db, 'sessions', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSession({ id: docSnap.id, ...docSnap.data() } as Session);
        } else {
          navigate('/');
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `sessions/${id}`);
      }
    };

    fetchSession();

    const q = query(
      collection(db, 'participants'),
      where('sessionId', '==', id),
      where('ownerId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const parts: Participant[] = [];
      snapshot.forEach((doc) => {
        parts.push({ id: doc.id, ...doc.data() } as Participant);
      });
      setParticipants(parts);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'participants');
    });

    return () => unsubscribe();
  }, [id, user, navigate]);

  const addParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || !newNickname.trim()) return;

    try {
      const newParticipant = {
        sessionId: id,
        ownerId: user.uid,
        nickname: newNickname.trim(),
        practiceShots: [],
        liveShots: [],
        createdAt: new Date().toISOString()
      };
      await addDoc(collection(db, 'participants'), newParticipant);
      setNewNickname('');
      setIsAddingParticipant(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'participants');
    }
  };

  const canShowReport = participants.length > 0 && participants.some(p => p.practiceShots.length >= 4 || p.liveShots.length >= 4);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  if (showReport) {
    return <ReportView participants={participants} onBack={() => setShowReport(false)} />;
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-zinc-950 w-full overflow-hidden">
      <header className="bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 flex-shrink-0 pt-[env(safe-area-inset-top)] z-20">
        <div className="max-w-lg mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-lg font-display font-bold text-white leading-tight">
                Session
              </h1>
              <p className="text-xs text-zinc-400">
                {new Date(session.date).toLocaleDateString('hu-HU')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {session.location && session.location !== 'Ismeretlen helyszín' && (
              <a
                href={session.coordinates ? `https://www.google.com/maps/search/?api=1&query=${session.coordinates.lat},${session.coordinates.lng}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(session.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-2 bg-cyan-500/10 text-cyan-400 rounded-xl hover:bg-cyan-500/20 transition-colors"
                title="Megtekintés térképen"
              >
                <MapPin className="h-6 w-6" />
              </a>
            )}
            {canShowReport && (
              <button
                onClick={() => setShowReport(true)}
                className="flex items-center justify-center p-2 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition-colors"
                title="Jelentés megtekintése"
              >
                <BarChart2 className="h-6 w-6" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        {!isAddingParticipant ? (
          <button
            onClick={() => setIsAddingParticipant(true)}
            className="w-full bg-zinc-900/50 border-2 border-dashed border-zinc-800 rounded-2xl p-4 mb-6 flex items-center justify-center space-x-2 text-zinc-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all active:scale-[0.98]"
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Új résztvevő hozzáadása</span>
          </button>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 mb-6 shadow-lg">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-medium text-zinc-400 flex items-center space-x-2">
                <Users className="h-4 w-4" />
                <span>Új résztvevő</span>
              </h2>
              <button 
                onClick={() => {
                  setIsAddingParticipant(false);
                  setNewNickname('');
                }} 
                className="p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={addParticipant} className="flex space-x-2">
              <input
                type="text"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                placeholder="Becenév..."
                autoFocus
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                required
              />
              <button
                type="submit"
                className="bg-cyan-400 text-zinc-950 px-4 py-3 rounded-xl font-semibold hover:bg-cyan-300 transition-colors active:scale-95 flex items-center justify-center"
              >
                <Plus className="h-5 w-5" />
              </button>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {participants.map(participant => (
            <ParticipantCard key={participant.id} participant={participant} />
          ))}
          {participants.length === 0 && (
            <div className="text-center py-12 px-4 border border-dashed border-zinc-800 rounded-2xl">
              <Users className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-zinc-400 text-sm">Még nincsenek résztvevők.<br/>Adj hozzá egyet a fenti mezőben!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
