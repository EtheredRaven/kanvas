# 1.5.3 (2023-12-18)

- Mobile ready web app
  - Swipe
  - Responsive components
  - Touchscreen compatibility
- 100x faster canvas drawing
- Solved WalletConnect bug on mobile
- Updated docs for exchanges
- Updated website
  - Partners section (exchanges, wallets etc...)
  - Updated roadmap
  - Kanvas Gods description in the "Concept" section

# 1.5.2 (2023-12-07)

- Improved canvas zooming
- Animations
- Adding of the zoom level indicator
- Addition of graphics elements
- Not possible anymore to place two pixels on the same position in one transaction
- Pinch touch zooming for tactile devices

# 1.5.1 (2023-12-04)

- Improved canvas dragging
- Color transparency support
- Addition of import image tool
- Revised documentation

# 1.5.0 (2023-12-01)

- New Kanvas Gods smart-contract
- Pixel capacity is now linked in Kanvas contract to the Kanvas Gods you own
- By default, you can now place 5 pixels and erase 5 pixels per transaction instead of place 10 pixels and erase 1 pixel per transaction
- Added erasing multiple pixels in one transaction
- Improved performance for drawing complete 1000x1000 canvas
- Added liquidity in the price chart
- Pixels to erase now blink
- Mutiple minor bugs correction, including showing the wrong colors in the leaderboard

# 1.4.1 (2023-10-13)

- Added nicknames support
- Corrected a bug on which KAP names were not showing well on the leaderboard
- Added paperwallet beginning with 1KAN

# 1.4.0 (2023-10-08)

- Added manasharing on the Kanvas smart-contract, so that user don't need anymore KOIN to play
- Added a demo wallet for new users to test Kanvas
- Corrected a bug on erasing
- Update of the website

# 1.3.0 (2023-09-23)

- Added an API price for Konio
- Corrected a volume bug due to KoinDX contract update
- **Added an eraser for both client and blockchain sides**
- **Added a leaderboard**

# 1.2.3 (2023-09-12)

- Corrected WalletConnect bug (could not be used)
- Corrected some blank screen bug for new users
- Added volume in the price chart
- Changed the Koindx contracts to V2

# 1.2.2 (2023-09-04)

- Added price chart

# 1.2.1 (2023-08-23)

- Corrected minor bugs
- Better cameras bounds on the top and on the left
- You can now resume placing pixels in batches just after sending it, instead of waiting for its validation

# 1.2.0 (2023-08-20)

- **Added batches of pixels functionnality, along with docs related to this functionnality**
- Added visual bounds to the world and better zooming out function
- Corrected a bug that would stop listening to blocks after a long running time period
- Added SafeMath to the contract
- Corrected a bug with hex and colors

# 1.1.3 (2023-08-16)

- Added links to KoinDX for launch
- Corrected the docs

# 1.1.2 (2023-08-13)

- Added "playing" docs
- Corrected a generated seed wallet bug

# 1.1.1 (2023-08-08)

- Added WalletConnect integration
- Corrected minor bugs

# 1.1.0 (2023-08-02)

- Integrated wallet added
- Cleaning of server- and client-side js code
- Numerous bug fixes
- Addition of pixel info on hover with link to Koinos Name Service (KAP)
- Optimization of event search on blockchain
- Change the type of images generated for the account
- Upgrade to node V14 -> V16.15.0
- Precomputing of pixel placement events before onchain validation
- Add first part of documentation
- Optimization of UI link (Vue 3) and game GUI (PhaserJS)

# 1.0.0 (2023-07-15)

Initial version
