# DhrivoWin Admin

React-admin + Firebase admin panel for managing tournaments, users, rewards, and withdrawals.

## Firestore collections (design)

### tournaments
- id
- title
- game
- entryFee
- prizePool
- maxPlayers
- joinedPlayers
- platform (android / ios / both)
- type (solo / duo / squad / custom)
- status (upcoming / running / completed / cancelled)
- startTime
- endTime
- roomId
- roomPassword
- createdBy
- createdAt
- updatedAt
- visibility (public / private)
- notes

### users
- uid
- name
- username
- phone
- emailū
- avatar
- coins
- bonusCoins
- totalWinAmount
- totalDeposit
- totalWithdraw
- matchesPlayed
- matchesWon
- banStatus (active / banned)
- role (user / admin)
- createdAt
- lastLoginAt

### withdrawRequests
- id
- uid
- userName
- amount
- method (upi / bank / wallet)
- accountDetails (upiId / accountNo + ifsc)
- status (pending / approved / rejected / paid)
- requestedAt
- processedAt
- processedBy
- note

### transactions (optional)
- id
- uid
- type (addCoins / withdraw / bonus / entryFee / prize)
- amount
- balanceAfter
- relatedTournamentId
- relatedWithdrawId
- createdAt
- meta (extra details)
## Setup steps (PC par)

1. npx create-react-app dhrivowin-admin
2. cd dhrivowin-admin
3. npm install react-admin react-admin-firebase firebase
4. Firebase console se web app bana kar firebaseConfig.js me config paste karo.
5. App.js me React-admin + FirebaseDataProvider ka code add karo.
