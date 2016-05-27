angular.module('starter.controllers', [])

.controller('LoginCtrl', function($window, $scope, $location, Auth, User) {

  $scope.login = function(authMethod) {
    $window.sessionStorage.setItem('reload', true);
    //Auth.$authWithOAuthRedirect(authMethod).then(function(authData) {
    //  console.log(authData);
    //}).catch(function(error) {
      //if (error.code === 'TRANSPORT_UNAVAILABLE') {
        Auth.$authWithOAuthPopup(authMethod, {scope:'email'}).then(function(authData) {
          console.dir(authData);
          var user = {};
          user.uid = authData.uid;
          user.provider = authData.provider;
          if(authMethod === 'google') {
            user.displayName = authData.google.displayName;
            user.profileImageURL = authData.google.profileImageURL;
            user.email = authData.google.email ? authData.google.email : null;
          } else if(authMethod === 'facebook') {
            user.displayName = authData.facebook.displayName;
            user.profileImageURL = authData.facebook.profileImageURL;
            user.email = authData.facebook.email ? authData.facebook.email : null;
          } else if(authMethod === 'github') {
            user.displayName = authData.github.displayName;
            user.profileImageURL = authData.github.profileImageURL;
            user.email = authData.github.email ? authData.github.email : null;
          }
          User.createUser(user);
          User.createChat(user);
          User.createInvitation(user);
        }).catch(function(error) {
           console.error("Authentication failed:", error);
        });
      //} else {
      //  console.log(error);
      //}
    //});
  };

  Auth.$onAuth(function(authData) {
    if (authData === null) {
      console.log('Not logged in yet');
    } else {
      console.log('Logged in as', authData.uid);
      $location.path('/tab/dash');
    }
    $scope.authData = authData; // This will display the user's name in our view
  });
})

.controller('DashCtrl', function($scope, Auth) {

  $scope.authData = Auth.$getAuth();

  /*var deploy = new Ionic.Deploy();
  
  // Update app code with new release from Ionic Deploy
  $scope.doUpdate = function() {
    deploy.update().then(function(res) {
      console.log('Ionic Deploy: Update Success! ', res);
    }, function(err) {
      console.log('Ionic Deploy: Update error! ', err);
    }, function(prog) {
      console.log('Ionic Deploy: Progress... ', prog);
    });
  };

  // Check Ionic Deploy for new code
  $scope.checkForUpdates = function() {
    console.log('Ionic Deploy: Checking for updates');
    deploy.check().then(function(hasUpdate) {
      console.log('Ionic Deploy: Update available: ' + hasUpdate);
      $scope.hasUpdate = hasUpdate;
    }, function(err) {
      console.error('Ionic Deploy: Unable to check for updates', err);
    });
  };*/
})

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('FirebaseCtrl', function($scope, FirebaseChat, $firebaseUtils, Auth, $location) {

  $scope.logout = function() {
    $location.path('/logout');
  };

  var currentUser = Auth.$getAuth();

  $scope.chatFriends = FirebaseChat.getChatFriendsRef(currentUser.uid);

  $scope.chatFriends.$loaded()
    .then(function() {
      angular.forEach($scope.chatFriends, function(chatFriend, index) {
        var user = FirebaseChat.getUserRef(chatFriend.$value);
        user.$loaded()
          .then(function(){
            chatFriend.user = user;
          });
      });
    });

  //temp - get all chat friends until invitations is completely done. delete once we populate chatFriends once invitation is accepted
  /*var chatFriends = FirebaseChat.getChatFriendsRefTemp();
  chatFriends.once('value', function(snap) {
    if (!snap.hasChild(currentUser.id)) {
      var allfrnds = [];
      allfrnds.push("google:102259256078934798720", "github:7492192");
      chatFriends.child(currentUser.uid).set(allfrnds);
    }
  });*/
  
  /*$scope.chat = {};
  $scope.chats = FirebaseChat.getUserRef("user1");
  $scope.users = FirebaseChat.getUsersRef();
  $scope.addChat = function() {
    console.log($scope.chat.newChat);
    $scope.chats.$add({username:"user3"});
    $scope.users.$add({
      username: "test",
      firstName: "testf",
      lastName: "testl"
    });
    //$scope.chats.$push({$scope.chat.newChat});
  };*/
})

.controller('FireChatDetailsCtrl', function($scope, $stateParams, Chats, FirebaseChat, $firebaseUtils, Auth, $location) {
  
  $scope.chat = {};

  $scope.friend = FirebaseChat.getUserRef($stateParams.chatId);


  var createChatRef = function(key) {
    $scope.currentChat = FirebaseChat.getChatsRefByKey(key);

    /*$scope.currentChat.$loaded()
    .then(function() {
      angular.forEach($scope.currentChat, function(chat, index) {
        var user = FirebaseChat.getUserRef(chat.id);
        user.$loaded()
          .then(function(){
            chat.displayName = user.displayName;
            chat.profileImageURL = user.profileImageURL;
          });
      });
    });*/

  };

  $scope.addChat = function() {
    $scope.currentChat.$add({id:Auth.$getAuth().uid, text:$scope.chat.newText});
  };

  var chatsRef = FirebaseChat.getChatsRef();
  chatsRef.once('value', function(snap) {
    if (snap.hasChild(Auth.$getAuth().uid+','+$stateParams.chatId)) {
      createChatRef(Auth.$getAuth().uid+','+$stateParams.chatId);
    } else if (snap.hasChild($stateParams.chatId+','+Auth.$getAuth().uid)) {
      createChatRef($stateParams.chatId+','+Auth.$getAuth().uid);
    } else {
      chatsRef.child(Auth.$getAuth().uid+','+$stateParams.chatId).set("Hello boss!");
      createChatRef(Auth.$getAuth().uid+','+$stateParams.chatId);
    }
  });
})

.controller('InvitationsCtrl', function($scope, FirebaseChat, $firebaseUtils, Auth, $location) {
  
  var invitationsObj = {
    "sent" : {},
    "received" : {}
  };

  var accept = {
    "accepted" : "no"
  };
  $scope.invite = {};
  var currentUser = Auth.$getAuth();
  $scope.invitations = FirebaseChat.getInvitationsRef();
  $scope.sentInvitations = FirebaseChat.getUserInvitationsRef(currentUser.uid, 'sent');
  $scope.sentInvitations.$loaded()
    .then(function() {
      angular.forEach($scope.sentInvitations, function(invitation, index) {
        var user = FirebaseChat.getUserRef(invitation.$id);
        user.$loaded()
          .then(function(){
            invitation.user = user;
          });
      });
    });
  $scope.receivedInvitations = FirebaseChat.getUserInvitationsRef(currentUser.uid, 'received');
  $scope.receivedInvitations.$loaded()
    .then(function() {
      angular.forEach($scope.receivedInvitations, function(invitation, index) {
        var user = FirebaseChat.getUserRef(invitation.$id);
        user.$loaded()
          .then(function(){
            invitation.user = user;
          });
      });
    });
  
  $scope.sendInvite = function() {
    var userRef = FirebaseChat.getFirebaseUsersRef();
    userRef
    .orderByChild("email")
    .equalTo($scope.invite.email)
    .on('child_added', function(snap) {
       console.log('accounts matching email address', snap.val());
       var foundUser = snap.val();
       
       $scope.invitations.once('value', function(snap) {
          if (!snap.hasChild(currentUser.uid)) {
            $scope.invitations.child(currentUser.uid).set(invitationsObj);
            $scope.invitations.child(currentUser.uid).child("sent").child(foundUser.uid).set(accept);
          } else {
            $scope.invitations.child(currentUser.uid).child("sent").child(foundUser.uid).set(accept);
          }

          if (!snap.hasChild(foundUser.uid)) {
            $scope.invitations.child(foundUser.uid).set(invitationsObj);
            $scope.invitations.child(foundUser.uid).child("received").child(currentUser.uid).set(accept);
          } else {
            $scope.invitations.child(foundUser.uid).child("received").child(currentUser.uid).set(accept);
          }
       });
    });
    
  };

  $scope.getUserInfo = function(obj) {
    return FirebaseChat.getUserRef(obj.$id).displayName;
  };

  $scope.acceptInvitation = function(receivedInvitation) {
    var currentUserChats = FirebaseChat.getChatFriendsRef(currentUser.uid);
    currentUserChats.$add(receivedInvitation.user.uid);
    var acceptedUserChats = FirebaseChat.getChatFriendsRef(receivedInvitation.user.uid);
    acceptedUserChats.$add(currentUser.uid);
    var acceptedInvitation = FirebaseChat.getUserInvitationsUserRef(currentUser.uid, 'received', receivedInvitation.user.uid);
    acceptedInvitation.$loaded()
      .then(function(){
        acceptedInvitation.accepted = "yes";
        acceptedInvitation.$save();
      });
  };

  $scope.declineInvitation = function(receivedInvitation) {
    var receivedUserInvitation = FirebaseChat.getUserInvitationsUserRef(currentUser.uid, 'received', receivedInvitation.user.uid);
    receivedUserInvitation.$loaded()
      .then(function(){
        receivedUserInvitation.accepted = "rejected";
        receivedUserInvitation.$save();
      });

    var sentUserInvitation = FirebaseChat.getUserInvitationsUserRef(receivedInvitation.user.uid, 'sent', currentUser.uid);
    sentUserInvitation.$loaded()
      .then(function() {
        sentUserInvitation.accepted = 'rejected';
        sentUserInvitation.$save();
     });
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
