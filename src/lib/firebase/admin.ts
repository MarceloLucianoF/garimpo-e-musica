import { applicationDefault, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function ensureAdminApp() {
  if (!getApps().length) {
    initializeApp({
      credential: applicationDefault(),
    });
  }

  return getApps()[0];
}

export function getAdminServices() {
  try {
    ensureAdminApp();

    return {
      adminAuth: getAuth(),
      adminDb: getFirestore(),
    };
  } catch (error) {
    console.error("[firebase-admin] Falha ao inicializar SDK Admin", error);
    return null;
  }
}
