import React, { useRef, useState } from 'react';
import './App.css';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/analytics';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import './firebase/config';

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {
	const [user] = useAuthState(auth);
	return (
		<div className="App">
			<header>
				<h1>
					<span role="img">🌬️🔥🌫️</span>
				</h1>
				<SignOut />
			</header>

			{/* if user signed in === show ChatRoom else SignIn */}
			<section>{user ? <ChatRoom /> : <SignIn />}</section>
		</div>
	);
}

function SignIn() {
	const signInWithGoogle = () => {
		const provider = new firebase.auth.GoogleAuthProvider();
		auth.signInWithPopup(provider);
	};

	return (
		<>
			<button onClick={signInWithGoogle}>Sign In With Google</button>
		</>
	);
}

function SignOut() {
	return (
		auth.currentUser && <button onClick={() => auth.signOut()}>Sign Out</button>
	);
}

function ChatRoom() {
	const dummy = useRef();
	const messagesRef = firestore.collection('messages');
	const query = messagesRef.orderBy('createdAt').limit(25);

	const [messages] = useCollectionData(query, { idField: 'id' });

	const [formValue, setFormValue] = useState('');

	const sendMessage = async e => {
		e.preventDefault();

		const { uid, photoURL } = auth.currentUser;

		await messagesRef.add({
			text: formValue,
			createdAt: firebase.firestore.FieldValue.serverTimestamp(),
			uid,
			photoURL,
		});

		setFormValue('');

		dummy.current.scrollIntoView({ behaviour: 'smooth' });
	};

	return (
		<>
			<main>
				{messages &&
					messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

				<div ref={dummy}></div>
			</main>

			<form onSubmit={sendMessage}>
				<input
					value={formValue}
					onChange={e => setFormValue(e.target.value)}
					placeholder="say something nice"
				/>
				<button type="submit">🌊</button>
			</form>
		</>
	);
}

function ChatMessage(props) {
	const { text, uid, photoURL } = props.message;

	const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

	return (
		<div className={`message ${messageClass}`}>
			<img src={photoURL} alt="UserProfileImage" />
			<p>{text}</p>
		</div>
	);
}

export default App;
