import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export async function uploadTargetPhoto(sessionId: string, participantId: string, type: 'practice' | 'live', file: File): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const path = `targets/${sessionId}/${participantId}_${type}_${Date.now()}.${fileExtension}`;
  const storageRef = ref(storage, path);
  
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}
