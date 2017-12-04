import store from '@/store';

export default function(questionArray){
    questionArray.forEach((question) => {
        if (!store.state.users.hasOwnProperty(question.author)) {

            let tempData = {  /// Prevent fetch multiple time same user's data
                uid: question.author,
                loading: true
            };
            store.commit('addUser', tempData);

            firebase.firestore().collection('users').doc(question.author).get().then(snapshot => {
                let userData = snapshot.data();
                userData.uid = question.author;
                userData.loading = false;
                store.commit('addUser', userData);
            })
        }
    })
}