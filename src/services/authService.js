import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase.js";
import { phoneToPseudoEmail } from "../utils/phone.js";

// SMS OTP pullik bo'lgani uchun telefon raqam soxta pochtaga aylantiriladi:
//   "90 770 10 73" -> "998907701073@temirjurnal.local"
// Foydalanuvchi buni sezmaydi, Firebase esa oddiy email/parol auth ishlatadi.

export function watchAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

export function registerWithPhone(phone, password) {
  return createUserWithEmailAndPassword(auth, phoneToPseudoEmail(phone), password);
}

export function loginWithPhone(phone, password) {
  return signInWithEmailAndPassword(auth, phoneToPseudoEmail(phone), password);
}

export function logout() {
  return signOut(auth);
}

export function translateAuthError(code) {
  switch (code) {
    case "auth/email-already-in-use":
      return "Bu raqam bilan akkaunt allaqachon mavjud";
    case "auth/invalid-email":
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "Telefon raqam yoki parol noto'g'ri";
    case "auth/user-not-found":
      return "Bu raqam bilan akkaunt topilmadi";
    case "auth/weak-password":
      return "Parol kamida 6 ta belgidan iborat bo'lishi kerak";
    case "auth/too-many-requests":
      return "Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring";
    case "auth/network-request-failed":
      return "Internet bilan bog'lanib bo'lmadi";
    default:
      return "Xatolik yuz berdi. Qayta urinib ko'ring";
  }
}
