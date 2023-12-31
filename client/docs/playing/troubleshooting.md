---
title: "Troubleshooting"
head:
  - - meta
    - name: keywords
      content: koinos koin kanvas KAN cryptocurrency canvas decentralized description pixel war r/place rplace
---

# Troubleshooting

When the game or one of your actions causes an error, the error is displayed in a red rectangle in the bottom right-hand corner of the application. Here's a table showing the meaning of the various errors.

|                             Error                              |                                                                                                                                             Details                                                                                                                                             |
| :------------------------------------------------------------: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|                 No Kondor account was selected                 |                                                You didn't check any boxes when the Kondor pop-up appeared. This means that no account has been selected to be linked and used by the application. So check at least one box when you try again.                                                 |
|             No WalletConnect account was selected              |                                                                                             You did not selected any account on Konion which is pretty weird... I don't know how it could happen !                                                                                              |
|                     Your password is wrong                     |                                               The password you entered to log in is wrong. You need to enter the same password you used to initialize the wallet. Check that the `Num. Lock` key is active and that the `Shift. Lock` key is not.                                               |
|           You have been disconnected from the server           |                                                                 You have lost your connection to the server. You may have lost your Internet connection or the Kanvas server may have crashed. The page reloads automatically.                                                                  |
|                  WalletConnect user rejected                   | You have refused the transaction on the application linked to WalletConnect (e.g. Konio). To solve this problem, please accept it next time. If you don't see any transaction requests, try reconnecting your WalletConnect by clicking on the `WalletConnect` button when adding a new wallet. |
|                     Kondor connection lost                     |                                    You have waited too long to validate the Kondor transaction or you have not validated it. If the transaction didn't appear when you tried to place a pixel, check all the tabs on the taskbar or try reinstalling Kondor.                                    |
|             You need more KAN to place a new pixel             |                       You have not enough $KAN (the Kanvas token) to place this number of new pixels. You can own a maximum number of pixels equivalent to the number of $KAN you own. You need to buy more $KAN or to wait for people overplacing their pixels on yours.                       |
|         Transaction not mined after 15000ms / 60000ms          |                You sent two transactions too close one to the other. Hence, the nonce (number of transactions for this account) is the same and only one of these transactions was selected. You should wait for the previous pixel be placed before trying to place another one                |
|                Pixel position is out of bounds                 |                                                                   You cannot place the pixel on this position because you are out of the world's bounds. These bounds can be changed depending on the popularity of the game                                                                    |
| You must click on the save button before placing more pixels ! |              You cannot send too many pixels in one transaction (10 maximum for now). This is done to prevent people from drawing huge images and losing it because they don't have enough mana or $KAN. Click on the save button (on the left of the color picker ot validate it)              |
|             Transaction reverted: insufficient rc              |                                                                    You need more MANA to process this transaction. On Kondor, you can click on advanced on the top right of the transaction and update the `max mana` field                                                                     |

If you encounter a bug or unexpected behavior in the application or contract, please contact us as soon as possible and avoid exploiting it. You can contact us on [Telegram](https://t.me/KanvasOfficial), [Twitter](https://twitter.com/KanvasOfficial) or [Github](https://github.com/EtheredRaven/kanvas).

Of course, you can also contact us if you have any questions or suggestions about the application or the project in general.
