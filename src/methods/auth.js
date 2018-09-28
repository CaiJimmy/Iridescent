import Firestore from '@/firebase/firestore';
import auth from '@/firebase/auth';

/**
 * Check if the account used for login is valid
 * 
 * @returns {Promise} Boolean which indicates account is valid or not
 */
function validAccountCheck() {
	const user = auth.currentUser;

	return Firestore.collection('users').doc(user.uid).set({
		'displayName': user.displayName,
		'email': user.email,
		'photoURL': user.photoURL
	}, {
		merge: true
	}).then(() => {
		return true;
	}).catch((err) => { // Not a while-listed domain
		console.error(err);
		return false;
	});
}

export {
	validAccountCheck
};
