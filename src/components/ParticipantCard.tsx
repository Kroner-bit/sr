import React, { useState } from 'react';
import { Participant } from '../types';
import { doc, updateDoc, deleteDoc, deleteField } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { uploadTargetPhoto } from '../lib/storage';
import { Camera, Image as ImageIcon, Loader2, Plus, Trash2, X } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

interface Props {
  participant: Participant;
}

export default function ParticipantCard({ participant }: Props) {
  const [uploadingPractice, setUploadingPractice] = useState(false);
  const [uploadingLive, setUploadingLive] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string, type: 'practice' | 'live' } | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<'practice' | 'live' | null>(null);

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, 'participants', participant.id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `participants/${participant.id}`);
    }
  };

  const handleDeletePhoto = async (type: 'practice' | 'live') => {
    try {
      const docRef = doc(db, 'participants', participant.id);
      await updateDoc(docRef, { [`${type}PhotoUrl`]: deleteField() });
      setViewingPhoto(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `participants/${participant.id}`);
    }
  };

  const handleShotChange = async (type: 'practiceShots' | 'liveShots', index: number, value: string) => {
    let numValue = parseInt(value, 10);
    if (isNaN(numValue)) {
      // Allow clearing the input visually by setting to 0 if empty
      if (value === '') numValue = 0;
      else return;
    }
    if (numValue < 0) numValue = 0;
    if (numValue > 12) numValue = 12;

    const currentShots = [...participant[type]];
    currentShots[index] = numValue;

    try {
      const docRef = doc(db, 'participants', participant.id);
      await updateDoc(docRef, { [type]: currentShots });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `participants/${participant.id}`);
    }
  };

  const handleAddShot = async (type: 'practiceShots' | 'liveShots') => {
    if (participant[type].length >= 8) return;
    const currentShots = [...participant[type], 0];
    try {
      const docRef = doc(db, 'participants', participant.id);
      await updateDoc(docRef, { [type]: currentShots });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `participants/${participant.id}`);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'practice' | 'live') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'practice') setUploadingPractice(true);
    else setUploadingLive(true);

    try {
      const url = await uploadTargetPhoto(participant.sessionId, participant.id, type, file);
      const docRef = doc(db, 'participants', participant.id);
      await updateDoc(docRef, { [`${type}PhotoUrl`]: url });
    } catch (error) {
      console.error('Error uploading photo:', error);
      handleFirestoreError(error, OperationType.UPDATE, `participants/${participant.id}`);
    } finally {
      if (type === 'practice') setUploadingPractice(false);
      else setUploadingLive(false);
    }
  };

  const renderShots = (type: 'practiceShots' | 'liveShots', title: string) => {
    const shots = participant[type];
    const avg = shots.length > 0 ? (shots.reduce((a, b) => a + b, 0) / shots.length).toFixed(2) : '0.00';
    const isPractice = type === 'practiceShots';
    const photoUrl = isPractice ? participant.practicePhotoUrl : participant.livePhotoUrl;
    const uploading = isPractice ? uploadingPractice : uploadingLive;
    const isComplete = shots.length === 8;

    return (
      <div className="bg-zinc-950/50 rounded-2xl p-4 border border-zinc-800/50">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-medium text-zinc-300 text-sm">{title}</h4>
          <div className="flex items-center space-x-2">
            {isComplete && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
            <span className="text-sm font-display font-bold text-cyan-400 bg-cyan-400/10 px-2.5 py-1 rounded-lg">
              Ø {avg}
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-2 mb-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="relative">
              {i < shots.length ? (
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  min="0"
                  max="12"
                  value={shots[i] === 0 && !shots.includes(0) ? '' : shots[i]} // Show empty if it's a fresh 0
                  onChange={(e) => handleShotChange(type, i, e.target.value)}
                  onFocus={(e) => e.target.select()}
                  className="w-full h-14 text-center text-xl font-display font-bold text-white bg-zinc-900 border border-zinc-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder-zinc-600"
                  placeholder="0"
                />
              ) : i === shots.length ? (
                <button
                  onClick={() => handleAddShot(type)}
                  className="w-full h-14 border-2 border-dashed border-zinc-700 rounded-xl text-zinc-500 hover:border-cyan-500 hover:text-cyan-400 transition-colors flex items-center justify-center"
                >
                  <Plus className="h-5 w-5" />
                </button>
              ) : (
                <div className="w-full h-14 bg-zinc-900/30 rounded-xl border border-zinc-800/30"></div>
              )}
            </div>
          ))}
        </div>

        {!photoUrl ? (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                id={`photo-${participant.id}-${type}`}
                className="hidden"
                onChange={(e) => handlePhotoUpload(e, isPractice ? 'practice' : 'live')}
              />
              <label
                htmlFor={`photo-${participant.id}-${type}`}
                className="cursor-pointer flex items-center justify-center space-x-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 px-4 py-2.5 rounded-xl text-sm font-medium text-zinc-200 transition-colors w-full"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                ) : (
                  <Camera className="h-4 w-4 text-cyan-400" />
                )}
                <span>Lőlap fotózása</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <button 
              onClick={() => setViewingPhoto({ url: photoUrl, type: isPractice ? 'practice' : 'live' })}
              className="w-full block relative group rounded-xl overflow-hidden border border-zinc-700"
            >
              <img src={photoUrl} alt={`${title} lőlap`} className="w-full h-24 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-zinc-950/20 group-hover:bg-transparent transition-colors flex items-center justify-center">
                <ImageIcon className="text-white drop-shadow-md h-6 w-6" />
              </div>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-zinc-900 rounded-3xl shadow-xl border border-zinc-800 overflow-hidden">
      <div className="bg-zinc-800/30 px-5 py-4 border-b border-zinc-800 flex justify-between items-center">
        <h3 className="text-lg font-display font-bold text-white">{participant.nickname}</h3>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="p-4 space-y-4">
        {renderShots('practiceShots', 'Gyakorló')}
        {renderShots('liveShots', 'Éles')}
      </div>

      <ConfirmModal
        isOpen={showDeleteModal}
        title="Résztvevő törlése"
        message={`Biztosan törölni szeretnéd ${participant.nickname} résztvevőt? Az eredményei és a feltöltött lőlapjai is véglegesen törlődnek.`}
        confirmText="Törlés"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      <ConfirmModal
        isOpen={!!photoToDelete}
        title="Kép törlése"
        message="Biztosan törölni szeretnéd ezt a lőlapot? A művelet nem vonható vissza."
        confirmText="Törlés"
        onConfirm={() => {
          if (photoToDelete) {
            handleDeletePhoto(photoToDelete);
            setPhotoToDelete(null);
          }
        }}
        onCancel={() => setPhotoToDelete(null)}
      />

      {viewingPhoto && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/95 flex flex-col backdrop-blur-sm">
          <div className="flex justify-between items-center px-4 pb-4 pt-[calc(env(safe-area-inset-top)+1rem)] bg-zinc-900/50 border-b border-zinc-800">
            <button
              onClick={() => setViewingPhoto(null)}
              className="p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <button
              onClick={() => {
                setPhotoToDelete(viewingPhoto.type);
              }}
              className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-full transition-colors"
              title="Kép törlése"
            >
              <Trash2 className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-auto flex items-center justify-center p-4">
            <img src={viewingPhoto.url} alt="Lőlap nagyítva" className="max-w-full max-h-full object-contain rounded-lg" />
          </div>
        </div>
      )}
    </div>
  );
}
