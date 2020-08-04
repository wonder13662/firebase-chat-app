/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

// Message preset
const presets = [
  {
    name: '추가요금',
    nextPresets: [
      {
        name: 'Home',
        nextPresets: []
      },
      {
        name: '거리',
        nextPresets: []
      },
      {
        name: '날씨',
        nextPresets: []
      },
      {
        name: '무게',
        nextPresets: []
      },
      {
        name: '권역외',
        nextPresets: []
      }
    ]
  },
  {
    name: '배송지연',
    nextPresets: [
      {
        name: 'Home',
        nextPresets: []
      },
      {
        name: '5분 지연',
        nextPresets: []
      },
      {
        name: '10분 지연',
        nextPresets: []
      },
      {
        name: '15분 지연',
        nextPresets: []
      }
    ]
  },
  {
    name: '배송실수',
    nextPresets: [
      {
        name: 'Home',
        nextPresets: []
      },
      {
        name: '배송크로스',
        nextPresets: []
      },
      {
        name: '흘림/훼손',
        nextPresets: []
      },
      {
        name: '요청사항 불이행',
        nextPresets: []
      },
      {
        name: '다른 배송 상품',
        nextPresets: []
      },
      {
        name: '상품누락',
        nextPresets: []
      }
    ]
  },
  {
    name: '배송상태변경',
    nextPresets: [
      {
        name: 'Home',
        nextPresets: []
      },
      {
        name: '픽업중',
        nextPresets: []
      },
      {
        name: '배송중',
        nextPresets: []
      },
      {
        name: '배송완료',
        nextPresets: []
      }
    ]
  },
  {
    name: '픽업지',
    nextPresets: [
      {
        name: 'Home',
        nextPresets: []
      },
      {
        name: '상품누락',
        nextPresets: []
      },
      {
        name: '포장불량',
        nextPresets: []
      }
    ]
  },
  {
    name: '주소',
    nextPresets: [
      {
        name: 'Home',
        nextPresets: []
      },
      {
        name: '주소다름',
        nextPresets: []
      }
    ]
  },
  {
    name: '고객',
    nextPresets: [
      {
        name: 'Home',
        nextPresets: []
      },
      {
        name: '응답없음',
        nextPresets: []
      }
    ]
  },
  {
    name: '디렉터',
    nextPresets: [
      {
        name: 'Home',
        nextPresets: []
      },
      {
        name: '배차요청',
        nextPresets: []
      }
    ]
  }
];

// Signs-in Friendly Chat.
function signIn() {
  // signInByGoogleAccount();
  // signInDriver();
  // signInDirector();
}

function signInByGoogleAccount() {
  // Sign into Firebase using popup auth & Google as the identity provider.
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider);
}

function signInDirector(callbackOnLoggedIn) {
  signInByEmailNPassword("wonder13662test@gmail.com", "barogobaroba", callbackOnLoggedIn);
}

function signInDriver(callbackOnLoggedIn) {
  signInByEmailNPassword("wonder13662test1@gmail.com", "barogobaroba", callbackOnLoggedIn);
}

function signInByEmailNPassword(email, password, callbackOnLoggedIn) {
  firebase.auth().signInWithEmailAndPassword(email, password).then(function(){
    if(callbackOnLoggedIn) callbackOnLoggedIn();
  }).catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;

    console.error(errorCode);
    console.error(errorMessage);
  });
}

// Signs-out of Friendly Chat.
function signOut() {
  // Sign out of Firebase.
  firebase.auth().signOut();
}

// Initiate Firebase Auth.
function initFirebaseAuth() {
  // Listen to auth state changes.
  firebase.auth().onAuthStateChanged(authStateObserver);
}

// Returns the signed-in user's profile pic URL.
function getProfilePicUrl() {
  return firebase.auth().currentUser.photoURL || '/images/profile_placeholder.png';
}

// Returns the signed-in user's display name.
function getUserName() {
  return firebase.auth().currentUser.displayName;
}

// Returns the signed-in user's tags.
function getUserTags(name) {
  if(name === '김드라이버') {
    return ['#청담', '#신입'];
  } else if(name === '박디렉터') {
    return ['#허브장', '#팀장'];
  }

  return [];
}

// Returns true if a user is signed-in.
function isUserSignedIn() {
  return !!firebase.auth().currentUser;
}

// Saves a new message to your Cloud Firestore database.
function saveMessage(messageText) {
  // Add a new message entry to the database.
  return firebase.firestore().collection('messages').add({
    name: getUserName(),
    text: messageText,
    profilePicUrl: getProfilePicUrl(),
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(function(error) {
    console.error('Error writing new message to database', error);
  });
}

// Loads chat messages history and listens for upcoming ones.
function loadMessages() {
  // Create the query to load the last 12 messages and listen for new ones.
  var query = firebase.firestore()
                  .collection('messages')
                  .orderBy('timestamp', 'desc')
                  .limit(12);


  // Start listening to the query.
  query.onSnapshot(function(snapshot) {
    snapshot.docChanges().forEach(function(change) {
      if (change.type === 'removed') {
        deleteMessage(change.doc.id);
      } else {
        var message = change.doc.data();
        const date = !message.timestamp?new Date():new Date(message.timestamp.seconds * 1000);
        const ampm = date.getHours()>11?"PM":"AM";
        let hours = date.getHours()%12;
        hours = hours<10?`0${hours}`:`${hours}`;
        const minutes = date.getMinutes()<10?`0${date.getMinutes()}`:`${date.getMinutes()}`;
        const seconds = date.getSeconds()<10?`0${date.getSeconds()}`:`${date.getSeconds()}`;
        const timeStr = `${date.getFullYear()}.${date.getMonth() + 1}.${date.getUTCDate()} ${hours}:${minutes}:${seconds} ${ampm}`;

        displayMessage(change.doc.id, message.timestamp, message.name,
                       message.text, message.profilePicUrl, message.imageUrl, timeStr);
      }
    });
  });
}

// Saves a new message containing an image in Firebase.
// This first saves the image in Firebase storage.
function saveImageMessage(file) {
  // 1 - We add a message with a loading icon that will get updated with the shared image.
  firebase.firestore().collection('messages').add({
    name: getUserName(),
    imageUrl: LOADING_IMAGE_URL,
    profilePicUrl: getProfilePicUrl(),
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(function(messageRef) {
    // 2 - Upload the image to Cloud Storage.
    var filePath = firebase.auth().currentUser.uid + '/' + messageRef.id + '/' + file.name;
    return firebase.storage().ref(filePath).put(file).then(function(fileSnapshot) {
      // 3 - Generate a public URL for the file.
      return fileSnapshot.ref.getDownloadURL().then((url) => {
        // 4 - Update the chat message placeholder with the image's URL.
        return messageRef.update({
          imageUrl: url,
          storageUri: fileSnapshot.metadata.fullPath
        });
      });
    });
  }).catch(function(error) {
    console.error('There was an error uploading a file to Cloud Storage:', error);
  });
}

// Saves the messaging device token to the datastore.
function saveMessagingDeviceToken() {
  firebase.messaging().getToken().then(function(currentToken) {
    if (currentToken) {
      console.log('Got FCM device token:', currentToken);
      // Saving the Device Token to the datastore.
      firebase.firestore().collection('fcmTokens').doc(currentToken)
          .set({uid: firebase.auth().currentUser.uid});
    } else {
      // Need to request permissions to show notifications.
      requestNotificationsPermissions();
    }
  }).catch(function(error){
    console.error('Unable to get messaging token.', error);
  });
}

// Requests permission to show notifications.
function requestNotificationsPermissions() {
  console.log('Requesting notifications permission...');
  firebase.messaging().requestPermission().then(function() {
    // Notification permission granted.
    saveMessagingDeviceToken();
  }).catch(function(error) {
    console.error('Unable to get permission to notify.', error);
  });
}

// device token
// e_LazhgaOKhOhNsEYkvAaA:APA91bFSDpg0FQTGGZX70DGD4FTJrIOG8fxcvq6Nu_C9UciipuSUDPs7s_JgWpytDnsb_PRsH1slQ3RmMsUxRMo9lj3xxUMPUW1MwQIRWRhkdLgU_GgpWTQGFXU78Tu6wzi8Ibfw2GuF

// Server key
// AAAAge_WkBY:APA91bEOXnb94HjGpmBctIoxv0i1JayJDiUABRNQa4rE8I0uWMTruayKn3oLm5406rSJdRdLryhTe-cqX91c9ZjbG0FN1lDa9h-eEu2BMyD5fLSifj2TjIZ4sdoXdN2ajlcb3aeycHtU

/*

curl -H "Content-Type: application/json" \
     -H "Authorization: key=AAAAge_WkBY:APA91bEOXnb94HjGpmBctIoxv0i1JayJDiUABRNQa4rE8I0uWMTruayKn3oLm5406rSJdRdLryhTe-cqX91c9ZjbG0FN1lDa9h-eEu2BMyD5fLSifj2TjIZ4sdoXdN2ajlcb3aeycHtU" \
     -d '{
           "notification": {
             "title": "New chat message!",
             "body": "There is a new message in FriendlyChat",
             "icon": "/images/profile_placeholder.png",
             "click_action": "http://localhost:5000"
           },
           "to": "e_LazhgaOKhOhNsEYkvAaA:APA91bFSDpg0FQTGGZX70DGD4FTJrIOG8fxcvq6Nu_C9UciipuSUDPs7s_JgWpytDnsb_PRsH1slQ3RmMsUxRMo9lj3xxUMPUW1MwQIRWRhkdLgU_GgpWTQGFXU78Tu6wzi8Ibfw2GuF"
         }' \
     https://fcm.googleapis.com/fcm/send

*/


// Triggered when a file is selected via the media picker.
function onMediaFileSelected(event) {
  event.preventDefault();
  var file = event.target.files[0];

  // Clear the selection in the file picker input.
  imageFormElement.reset();

  // Check if the file is an image.
  if (!file.type.match('image.*')) {
    var data = {
      message: 'You can only share images',
      timeout: 2000
    };
    signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
    return;
  }
  // Check if the user is signed-in
  if (checkSignedInWithMessage()) {
    saveImageMessage(file);
  }
}

// Toggle when an user clicked the order summary
function onOrderSummaryClicked(e) {
  console.log('onOrderSummaryClicked');

  const classNameShrunk = "shrunk";
  const classNameExpanded = "expanded";

  if(orderContainerElement.classList.contains(classNameShrunk)) {
    orderContainerElement.classList.remove(classNameShrunk);
    orderContainerElement.classList.add(classNameExpanded);
  } else if(orderContainerElement.classList.contains(classNameExpanded)) {
    orderContainerElement.classList.remove(classNameExpanded);
    orderContainerElement.classList.add(classNameShrunk);
  }
}

// Triggered when the send new message form is submitted.
function onMessageFormSubmit(e) {
  e.preventDefault();
  // Check that the user entered a message and is signed in.
  if (messageInputElement.value && checkSignedInWithMessage()) {
    saveMessage(messageInputElement.value).then(function() {
      // Clear message text field and re-enable the SEND button.
      resetMaterialTextfield(messageInputElement);
      toggleButton();
    });
  }
}

// Triggers when the auth state change for instance when the user signs-in or signs-out.
function authStateObserver(user) {
  if (user) { // User is signed in!
    // Get the signed-in user's profile pic and name.
    var profilePicUrl = getProfilePicUrl();
    var userName = getUserName();

    // Set the user's profile pic and name.
    userPicElement.style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(profilePicUrl) + ')';
    userNameElement.textContent = userName;

    // Show user's profile and sign-out button.
    userNameElement.removeAttribute('hidden');
    userPicElement.removeAttribute('hidden');
    signOutButtonElement.removeAttribute('hidden');

    // Hide sign-in button.
    signInButtonElement.setAttribute('hidden', 'true');

    // We save the Firebase Messaging Device token and enable notifications.
    saveMessagingDeviceToken();
  } else { // User is signed out!
    // Hide user's profile and sign-out button.
    userNameElement.setAttribute('hidden', 'true');
    userPicElement.setAttribute('hidden', 'true');
    signOutButtonElement.setAttribute('hidden', 'true');

    // Show sign-in button.
    signInButtonElement.removeAttribute('hidden');
  }
}

// Returns true if user is signed-in. Otherwise false and displays a message.
function checkSignedInWithMessage() {
  // Return true if the user is signed in Firebase
  if (isUserSignedIn()) {
    return true;
  }

  // Display a message to the user using a Toast.
  var data = {
    message: 'You must sign-in first',
    timeout: 2000
  };
  signInSnackbarElement.MaterialSnackbar.showSnackbar(data);
  return false;
}

// Resets the given MaterialTextField.
function resetMaterialTextfield(element) {
  if(!element) return;
  element.value = '';

  if( !element.parentNode ||
      !element.parentNode.MaterialTextfield ||
      !element.parentNode.MaterialTextfield.boundUpdateClassesHandler) return;

  element.parentNode.MaterialTextfield.boundUpdateClassesHandler();
}

function displayOrder(requester, customAddress, productPrice) {
  // 1. 실제 보여지는 상단 고정된 상품요약정보
  orderContainerElement.querySelector('.requester').textContent = requester;
  orderContainerElement.querySelector('.customer-address').textContent = customAddress;
  orderContainerElement.querySelector('.product-price span').textContent = productPrice;

  // 2. 메시지 스크롤 리스트에 포함되는 상품요약정보
  const clone = orderContainerElement.cloneNode(true);
  messageListElement.querySelector('.spacing .inner-block').appendChild(clone);
}

function displayPreset({ parent, presetArr, callbackOnClick }) {
  // remove previous preset
  presetContainerElement.textContent = '';

  // draw new presets
  presetArr.forEach(preset => {
    const spanElement = document.createElement('span');
    spanElement.textContent = preset.name;
    presetContainerElement.appendChild(spanElement);

    spanElement.addEventListener('click', function() {
      callbackOnClick({ parent, preset });
      spanElement.removeEventListener('click', this);
      spanElement.removeEventListener('touchend', this);
    });
    spanElement.addEventListener('touchend', function() {
      callbackOnClick({ parent, preset });
      spanElement.removeEventListener('click', this);
      spanElement.removeEventListener('touchend', this);
    });
  });
}

// Template for messages.
const OTHER_MESSAGE_TEMPLATE =
'<div class="message-container">' +
  '<div class="pic"></div>' +
  '<div class="info-box">' +
    '<div class="name"></div>' +
    '<div class="message">' +
      '<div class="balloon"></div>' +
    '</div>' +
    '<div class="timestamp"></div>' +
  '</div>' +
'</div>';

const MY_MESSAGE_TEMPLATE =
'<div class="message-container my-message">' +
  '<div class="message">' +
  '<div class="balloon"></div>' +
    '</div>' +
  '<div class="timestamp"></div>' +
'</div>';

// Adds a size to Google Profile pics URLs.
function addSizeToGoogleProfilePic(url) {
  if (url.indexOf('googleusercontent.com') !== -1 && url.indexOf('?') === -1) {
    return url + '?sz=150';
  }
  return url;
}

// A loading image URL.
var LOADING_IMAGE_URL = 'https://www.google.com/images/spin-32.gif?a';

// Delete a Message from the UI.
function deleteMessage(id) {
  var div = document.getElementById(id);
  // If an element for that message exists we delete it.
  if (div) {
    div.parentNode.removeChild(div);
  }
}

function createAndInsertOtherMessage(id, timestamp) {
  return createAndInsertMessage(id, timestamp, OTHER_MESSAGE_TEMPLATE);
}

function createAndInsertMyMessage(id, timestamp) {
  return createAndInsertMessage(id, timestamp, MY_MESSAGE_TEMPLATE);
}

function createAndInsertMessage(id, timestamp, template) {
  const container = document.createElement('div');
  container.innerHTML = template;
  const div = container.firstChild;
  div.setAttribute('id', id);

  // If timestamp is null, assume we've gotten a brand new message.
  // https://stackoverflow.com/a/47781432/4816918
  timestamp = timestamp ? timestamp.toMillis() : Date.now();
  div.setAttribute('timestamp', timestamp);

  // figure out where to insert new message
  const existingMessages = messageListElement.children;
  if (existingMessages.length === 0) {
    messageListElement.appendChild(div);
  } else {
    let messageListNode = existingMessages[0];

    while (messageListNode) {
      if(!messageListNode.getAttribute) {
        break;
      }

      const messageListNodeTime = messageListNode.getAttribute('timestamp');

      if (!messageListNodeTime) {
        throw new Error(
          `Child ${messageListNode.id} has no 'timestamp' attribute`
        );
      }

      if (messageListNodeTime > timestamp) {
        break;
      }

      messageListNode = messageListNode.nextSibling;
    }

    messageListElement.insertBefore(div, messageListNode);
  }

  return div;
}

// Displays a Message in the UI.
function displayOtherMessage(id, timestamp, name, text, picUrl, imageUrl, timeStr) {
  var div = document.getElementById(id) || createAndInsertOtherMessage(id, timestamp);

  // profile picture
  if (picUrl) {
    div.querySelector('.pic').style.backgroundImage = 'url(' + addSizeToGoogleProfilePic(picUrl) + ')';
  }

  const nameElement = div.querySelector('.name');
  nameElement.textContent = name;

  // insert user tags
  const tags = getUserTags(name);
  // const tagsElement = div.querySelector('.tags');
  tags.forEach(tag => {
    const tagSpan = document.createElement('span');
    tagSpan.textContent = tag;
    nameElement.appendChild(tagSpan);
  });

  return div;
}
function displayMyMessage(id, timestamp, name, text, picUrl, imageUrl, timeStr) {
  return document.getElementById(id) || createAndInsertMyMessage(id, timestamp);
}
function displayMessage(id, timestamp, name, text, picUrl, imageUrl, timeStr) {
  const currentUserDisplayName = getUserName();
  let div = null;
  if(name === currentUserDisplayName) {
    div = displayMyMessage(id, timestamp, name, text, picUrl, imageUrl, timeStr);
  } else {
    div = displayOtherMessage(id, timestamp, name, text, picUrl, imageUrl, timeStr);
  }

  // 공통 속성 처리
  var messageElement = div.querySelector('.message');
  var balloonElement = messageElement.querySelector('.balloon');

  div.querySelector('.timestamp').textContent = timeStr;

  if (text) { // If the message is text.
    balloonElement.textContent = text;
    // Replace all line breaks by <br>.
    balloonElement.innerHTML = balloonElement.innerHTML.replace(/\n/g, '<br>');
  }

  // Show the card fading-in and scroll to view the new message.
  setTimeout(function() {div.classList.add('visible')}, 1);
  messageListElement.scrollTop = messageListElement.scrollHeight;
  messageInputElement.focus();
}

// Enables or disables the submit button depending on the values of the input
// fields.
function toggleButton() {
  if (messageInputElement.value) {
    submitButtonElement.removeAttribute('disabled');
  } else {
    submitButtonElement.setAttribute('disabled', 'true');
  }
}

// Checks that the Firebase SDK has been correctly setup and configured.
function checkSetup() {
  if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
    window.alert('You have not configured and imported the Firebase SDK. ' +
        'Make sure you go through the codelab setup instructions and make ' +
        'sure you are running the codelab using `firebase serve`');
  }
}

// Checks that Firebase has been imported.
checkSetup();

// Shortcuts to DOM Elements.
var orderContainerElement = document.getElementById('order-container');
var presetContainerElement = document.getElementById('presets');
var messageListElement = document.getElementById('messages');
var messageFormElement = document.getElementById('message-form');
var messageInputElement = document.getElementById('message');
var submitButtonElement = document.getElementById('submit');
var imageButtonElement = document.getElementById('submitImage');
var imageFormElement = document.getElementById('image-form');
var mediaCaptureElement = document.getElementById('mediaCapture');
var userPicElement = document.getElementById('user-pic');
var userNameElement = document.getElementById('user-name');
var signInButtonElement = document.getElementById('sign-in');
var signOutButtonElement = document.getElementById('sign-out');
var signInSnackbarElement = document.getElementById('must-signin-snackbar');

// Toggle for the order summary
orderContainerElement.addEventListener('click', onOrderSummaryClicked);

// Saves message on form submit.
messageFormElement.addEventListener('submit', onMessageFormSubmit);
submitButtonElement.addEventListener("touchend", onMessageFormSubmit, false);

// submitButtonElement
signOutButtonElement.addEventListener('click', signOut);
signInButtonElement.addEventListener('click', signIn);

// Toggle for the button.
messageInputElement.addEventListener('keyup', toggleButton);
messageInputElement.addEventListener('change', toggleButton);

// Events for image upload.
imageButtonElement.addEventListener('click', function(e) {
  e.preventDefault();
  mediaCaptureElement.click();
});
mediaCaptureElement.addEventListener('change', onMediaFileSelected);

// initialize Firebase
initFirebaseAuth();

// http://localhost:5000/?role=driver
// http://localhost:5000/?role=director
// https://leo-chat-6829e.firebaseapp.com/?role=driver
// https://leo-chat-6829e.firebaseapp.com/?role=director
signOut();
var queryString = getQueryStringObject();
if(queryString.role && queryString.role === "driver") {
  signInDriver(callbackOnLoggedInByEmailNPassword);
} else {
  signInDirector(callbackOnLoggedInByEmailNPassword);
}

function callbackOnLoggedInByEmailNPassword() {
  // We load currently existing chat messages and listen to new ones.
  loadMessages();
}
displayOrder("KFC 강남구청점", "서울 강남구 언주로 137길 32(씨엔에스빌딩)바로고 본사 1층", "25,000원");
displayPreset({
  parent:null,
  presetArr:presets,
  callbackOnClick:onClick1DepthPreset
});
function onClick1DepthPreset({ parent, preset }) {
  if(preset.nextPresets && preset.nextPresets.length > 0) {
    displayPreset({
      parent:preset,
      presetArr:preset.nextPresets,
      callbackOnClick:onClick2DepthPreset
    });
  } else {
    // Send message as Preset
    if(preset.name !== 'Home') {
      saveMessage(parent?`${parent.name} - ${preset.name}`:preset.name);
    }
  }
}
function onClick2DepthPreset({ parent, preset }) {
  // Send message as Preset
  if(preset.name !== 'Home') {
    saveMessage(parent?`${parent.name} - ${preset.name}`:preset.name);
  }
  // Draw 1 depth preset
  displayPreset({
      parent:null,
      presetArr:presets,
      callbackOnClick:onClick1DepthPreset
  });
}

function getQueryStringObject() {
  var a = window.location.search.substr(1).split('&');
  if (a == "") return {};
  var b = {};
  for (var i = 0; i < a.length; ++i) {
      var p = a[i].split('=', 2);
      if (p.length == 1)
          b[p[0]] = "";
      else
          b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
  }
  return b;
}
