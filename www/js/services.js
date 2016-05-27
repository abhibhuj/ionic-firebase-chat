angular.module('starter.services', [])

.factory('Auth', function($firebaseAuth) {
  var usersRef = new Firebase('https://waytotext.firebaseio.com/ionic/users');
  return $firebaseAuth(usersRef);
})

.factory('User', function($firebaseArray) {
  return {
    createUser: function(user) {
      var usersRef = new Firebase('https://waytotext.firebaseio.com/ionic/users');
      usersRef.child(user.uid).set(user);
    },
    createChat: function(user) {
      var chats = new Firebase("https://waytotext.firebaseio.com/ionic/chatFriends");
      chats.once('value', function(snap) {
        if (!snap.hasChild(user.uid)) {
          chats.child(user.uid).set("admin");

        }
      });
    },
    createInvitation: function(user) {
      var invitationsObj = {
        "sent" : {},
        "received" : {}
      };
      var invitations = new Firebase("https://waytotext.firebaseio.com/ionic/invitations");
      invitations.once('value', function(snap) {
        if (!snap.hasChild(user.uid)) {
          chats.child(user.uid).set(invitationsObj);
        }
      });

    }
  };
})

.factory('FirebaseChat', function($firebaseArray, $firebaseObject) {
  return {
    getUserRef: function(uuid) {
      return $firebaseObject(new Firebase("https://waytotext.firebaseio.com/ionic/users/"+uuid));
    },
    getUsersRef: function() {
      return $firebaseArray(new Firebase("https://waytotext.firebaseio.com/ionic/users"));
    },
    getFirebaseUsersRef: function() {
      return new Firebase("https://waytotext.firebaseio.com/ionic/users");
    },
    getInvitationsRef: function() {
      return new Firebase("https://waytotext.firebaseio.com/ionic/invitations");
    },
    getUserInvitationsRef: function(uuid, sentReceived) {
      return $firebaseArray(new Firebase("https://waytotext.firebaseio.com/ionic/invitations/"+uuid+"/"+sentReceived));
    },
    getUserInvitationsUserRef: function(currentUserUUID, sentReceived, userUUID) {
      return $firebaseObject(new Firebase("https://waytotext.firebaseio.com/ionic/invitations/"+currentUserUUID+"/"+sentReceived+"/"+userUUID));
    },
    getChatFriendsRef: function(uuid) {
      return $firebaseArray(new Firebase("https://waytotext.firebaseio.com/ionic/chatFriends/"+uuid));
    },
    getChatFriendsRefTemp: function(uuid) {
      return new Firebase("https://waytotext.firebaseio.com/ionic/chatFriends");
    },
    getChatsRef: function() {
      return new Firebase("https://waytotext.firebaseio.com/ionic/chats");
    },
    getChatsRefByKey: function(key) {
      return $firebaseArray(new Firebase("https://waytotext.firebaseio.com/ionic/chats/"+key).limitToLast(100));
    }
  };
})

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});
