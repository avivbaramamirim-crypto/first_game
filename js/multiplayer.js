import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, onSnapshot, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// הגדרות ה-Firebase שלך
const firebaseConfig = {
  apiKey: "AIzaSyDv_vkJBRSMzW0lUBirAAkWD1Lmk8B3Lao",
  authDomain: "first-game-e3fe2.firebaseapp.com",
  projectId: "first-game-e3fe2",
  storageBucket: "first-game-e3fe2.firebasestorage.app",
  messagingSenderId: "886812698552",
  appId: "1:886812698552:web:01bcb624bf76ba8821d14d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'wooden-games-hub';

let currentUser = null;
let currentRoomId = null;
let myRole = null; 

async function init() {
    try {
        await signInAnonymously(auth);
        onAuthStateChanged(auth, (user) => {
            if (user) {
                currentUser = user;
                const statusEl = document.getElementById('connection-status');
                if (statusEl) {
                    statusEl.innerText = "מחובר לענן ✅";
                    statusEl.style.color = "#27ae60";
                }
            }
        });
    } catch (e) { console.error("Firebase connection error", e); }
}

// יצירת חדר
window.createOnlineRoom = async function() {
    if (!currentUser) return;
    
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomId);
    
    await setDoc(roomRef, {
        game: window.pendingGameToLaunch,
        state: 'start',
        player1: currentUser.uid,
        player2: null,
        status: 'waiting',
        lastMoveBy: null,
        timestamp: Date.now()
    });

    currentRoomId = roomId;
    myRole = 'w';
    
    // עדכון הממשק למצב המתנה
    document.getElementById('create-room-btn').style.display = 'none';
    document.getElementById('active-room-info').style.display = 'block';
    document.getElementById('display-room-id').innerText = roomId;
    
    listenToRoom(roomId);
};

// הצטרפות לחדר
window.joinOnlineRoom = async function() {
    const roomId = document.getElementById('room-input').value.trim().toUpperCase();
    if (!roomId) {
        alert("אנא הכנס קוד חדר שקיבלת מהחבר");
        return;
    }
    
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomId);
    const snap = await getDoc(roomRef);

    if (snap.exists()) {
        const data = snap.data();
        if (!data.player2 && data.player1 !== currentUser.uid) {
            await updateDoc(roomRef, { player2: currentUser.uid, status: 'active' });
            myRole = 'b';
        } else {
            myRole = (data.player1 === currentUser.uid) ? 'w' : 'b';
        }
        currentRoomId = roomId;
        window.pendingGameToLaunch = data.game;
        listenToRoom(roomId);
        window.launchGame('online');
    } else {
        alert("חדר לא נמצא! וודא שהקוד נכון.");
    }
};

function listenToRoom(roomId) {
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', roomId);
    onSnapshot(roomRef, (docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();
        
        // סנכרון מהלכים
        if (data.lastMoveBy && data.lastMoveBy !== currentUser.uid) {
            if (window.syncLocalGame) window.syncLocalGame(data.game, data.state);
        }
        
        // מעבר אוטומטי למשחק כשהיריב מתחבר
        if (data.status === 'active' && window.currentGameMode !== 'online') {
            window.launchGame('online');
        }
    });
}

window.broadcastMove = async function(newState) {
    if (!currentRoomId) return;
    const roomRef = doc(db, 'artifacts', appId, 'public', 'data', 'rooms', currentRoomId);
    await updateDoc(roomRef, {
        state: newState,
        lastMoveBy: currentUser.uid,
        timestamp: Date.now()
    });
};

window.getMyRole = () => myRole;
init();