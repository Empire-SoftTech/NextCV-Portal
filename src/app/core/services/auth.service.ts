import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FirebaseApp, initializeApp } from 'firebase/app';
import {
  Auth,
  User,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { environment } from '../../../environments/environment';

/**
 * Wraps the Firebase Auth JS SDK for admin login only — this portal has no
 * backend-issued JWT/Redis layer, the backend verifies the Firebase ID
 * token directly on every request (see FirebaseAuthFilter).
 *
 * Firebase Auth needs browser APIs (window, indexedDB) this SSR-enabled app
 * doesn't have server-side — initialization is skipped entirely when
 * rendering on the server, where nothing here is ever actually needed
 * (this is an internal admin tool, not something requiring SSR/SEO).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private app?: FirebaseApp;
  private auth?: Auth;

  readonly currentUser = signal<User | null>(null);

  private authReadyResolve!: () => void;
  readonly authReady: Promise<void> = new Promise((resolve) => {
    this.authReadyResolve = resolve;
  });

  constructor() {
    if (!this.isBrowser) {
      this.authReadyResolve();
      return;
    }
    this.app = initializeApp(environment.firebaseConfig);
    this.auth = getAuth(this.app);
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser.set(user);
      this.authReadyResolve();
    });
  }

  async signIn(email: string, password: string): Promise<void> {
    if (!this.auth) return;
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async signOut(): Promise<void> {
    if (!this.auth) return;
    await firebaseSignOut(this.auth);
  }

  async getIdToken(): Promise<string | null> {
    const user = this.auth?.currentUser;
    return user ? user.getIdToken() : null;
  }
}
