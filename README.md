# FiveM Bot

New FiveM bot using bun, Currently under heavy development.

# Goal

Make a FiveM bot that is highly configable & easy to use.
The focus is make every message that the user recives easy to change and customisable, Example:

The config for ip/status command:

![image](https://github.com/user-attachments/assets/32f1802c-db0e-4aa1-8f81-e846ca2cac31)

The result:

![image](https://github.com/user-attachments/assets/af9872e6-d1e4-4283-b771-1d852c8f44c0)


For all placeholders go to [here](placeholders.md)
To change correctly command's data go [here](commanddata.md)


## Road Map
- [x] Base of the bot: Commands handler, Event handler
- [x] FiveM Server Listener: Listen to the FiveM server every x time (To do: make it configable)
- [x] Make the formmating have more options example: from %clients% to %playerAmount% and more...

### Base Commands:
- [x] IP/Status
- [x] Show all placeholders

### Systems:
- [ ] Ticket System
- [x] Suggestion System
- [ ] Database Search (Search a player by id and connect it to his in game character)
- [ ] Playtime Leaderboard
- [ ] Server Status
- [ ] Invite System? (Really prefer to let other bots deal with it, If are going to be requests. I will consider it)

# Getting Started

1. Install bun
2. Clone the lastest version
3. Place the bot's token inside the .env file
4. Run the command `bun install`
5. Run the command `bun ./`
