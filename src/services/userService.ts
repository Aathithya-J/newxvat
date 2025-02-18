import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserData } from '../types/user';

export const createUserProfile = async (user: any): Promise<UserData> => {
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    const userData: UserData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || 'Student',
      photoURL: user.photoURL || '',
      stats: {
        questionsAsked: 0,
        accuracyRate: 0,
        topicsMastered: 0,
        learningStreak: 0,
      },
      subjects: {
        Math: 85,
        Science: 78,
        History: 92,
        English: 88,
      },
      activities: {
        practice: 40,
        quizzes: 35,
        challenges: 25,
      },
      dailyActivity: {
        [new Date().toISOString().split('T')[0]]: 0,
      },
      assignments: [],
      lastLogin: new Date(),
      createdAt: new Date(),
    };

    await setDoc(userRef, userData);
    return userData;
  }

  const existingData = userSnap.data() as UserData;
  await updateDoc(userRef, {
    lastLogin: new Date(),
    displayName: user.displayName || existingData.displayName,
    photoURL: user.photoURL || existingData.photoURL,
  });

  return {
    ...existingData,
    lastLogin: new Date(),
    displayName: user.displayName || existingData.displayName,
    photoURL: user.photoURL || existingData.photoURL,
  };
};

export const getUserProfile = async (uid: string): Promise<UserData | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return null;
  }

  return userSnap.data() as UserData;
};

export const updateUserStats = async (uid: string, stats: Partial<UserData['stats']>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { stats });
};

export const updateUserSubjects = async (uid: string, subjects: UserData['subjects']) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { subjects });
};

export const addAssignment = async (uid: string, assignment: { name: string; due: string }) => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data() as UserData;
  
  await updateDoc(userRef, {
    assignments: [...userData.assignments, assignment],
  });
};

export const updateDailyActivity = async (uid: string, questionsCount: number) => {
  const userRef = doc(db, 'users', uid);
  const today = new Date().toISOString().split('T')[0];
  
  const userSnap = await getDoc(userRef);
  const userData = userSnap.data() as UserData;
  
  const updatedDailyActivity = {
    ...userData.dailyActivity,
    [today]: (userData.dailyActivity[today] || 0) + questionsCount,
  };
  
  await updateDoc(userRef, {
    dailyActivity: updatedDailyActivity,
  });
};
