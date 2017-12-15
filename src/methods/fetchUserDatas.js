import store from '@/store';
import * as firebase from "firebase/app";
import "firebase/firestore";

export default function(questionArray){
    questionArray.forEach((questionData) => {
        let question = questionData.data();   /// Question Array that we passed it's a Firestore doc array. To read item's data, we need to use .data() method
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